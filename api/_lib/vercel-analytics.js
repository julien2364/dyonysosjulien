// Lecture commune de Vercel Web Analytics pour les onglets KPI et Stratégie.
// Le jeton sensible reste exclusivement dans les variables Vercel.

const TEAM_ID = 'team_V2XarT2PcWGD86aDLfpoA5xa';
const FETCH_TIMEOUT_MS = 8000;
const CACHE_MS = 60 * 1000;

let cache = null;
let inFlight = null;

function analyticsToken() {
  return process.env.VERCEL_ANALYTICS_TOKEN || process.env.VERCEL_API_TOKEN || '';
}

function isAnalyticsConfigured() {
  return Boolean(analyticsToken());
}

async function query(projectId, resource, since, until, by) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const url = new URL(`https://api.vercel.com/v1/query/web-analytics/visits/${resource}`);
    url.searchParams.set('teamId', TEAM_ID);
    url.searchParams.set('projectId', projectId);
    url.searchParams.set('since', since.toISOString());
    url.searchParams.set('until', until.toISOString());
    if (by) {
      url.searchParams.set('by', by);
      url.searchParams.set('limit', '50');
    }
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${analyticsToken()}` },
      signal: controller.signal,
    });
    if (!response.ok) throw new Error(`Analytics HTTP ${response.status}`);
    return response.json();
  } finally {
    clearTimeout(timer);
  }
}

async function readProject(definition, until) {
  const today = new Date(until); today.setUTCHours(0, 0, 0, 0);
  const since7 = new Date(today); since7.setUTCDate(since7.getUTCDate() - 6);
  const since30 = new Date(today); since30.setUTCDate(since30.getUTCDate() - 29);
  const requests = [
    query(definition.vercelProjectId, 'count', today, until),
    query(definition.vercelProjectId, 'count', since7, until),
    query(definition.vercelProjectId, 'count', since30, until),
  ];
  if (definition.includeCountries) requests.push(query(definition.vercelProjectId, 'aggregate', since30, until, 'country'));
  const [day, week, month, countries] = await Promise.all(requests);
  const normalizeCount = (payload) => ({
    visiteurs: Number(payload?.visitors ?? payload?.visiteurs ?? 0),
    pageviews: Number(payload?.pageviews ?? payload?.pageViews ?? 0),
  });
  return {
    name: definition.name,
    vercelProjectId: definition.vercelProjectId,
    live: true,
    periodes: {
      '1j': normalizeCount(day.data),
      '7j': normalizeCount(week.data),
      '30j': normalizeCount(month.data),
    },
    pays30j: definition.includeCountries
      ? (countries?.data || []).map((row) => ({ pays: row.country || '—', visiteurs: Number(row.visitors || 0), pageviews: Number(row.pageviews ?? row.pageViews ?? 0) }))
      : undefined,
  };
}

async function getPortfolioTraffic(fallbackTraffic) {
  if (!isAnalyticsConfigured()) {
    return {
      ...fallbackTraffic,
      live: false,
      sourceState: 'not_configured',
      commentPasserEnLive: 'Connexion Vercel Analytics absente : affichage du dernier instantané vérifié.',
    };
  }
  if (cache && Date.now() - cache.at < CACHE_MS) return cache.value;
  if (inFlight) return inFlight;

  inFlight = (async () => {
    const until = new Date();
    const rows = await Promise.all((fallbackTraffic.parProjet || []).map(async (fallback, index) => {
      try {
        return await readProject({ ...fallback, includeCountries: index === 0 }, until);
      } catch (error) {
        return { ...fallback, live: false, error: error.message || String(error) };
      }
    }));
    const liveCount = rows.filter((row) => row.live).length;
    const value = {
      capturedAt: until.toISOString(),
      live: liveCount > 0,
      liveProjects: liveCount,
      totalProjects: rows.length,
      sourceState: liveCount === rows.length ? 'live' : (liveCount ? 'partial' : 'fallback'),
      parProjet: rows,
      commentPasserEnLive: liveCount === rows.length
        ? `Données Vercel Web Analytics lues en direct pour ${liveCount} projet(s). Cache serveur : 60 secondes.`
        : `Données live pour ${liveCount}/${rows.length} projet(s) ; les autres lignes utilisent le dernier instantané vérifié et sont signalées.`,
    };
    cache = { at: Date.now(), value };
    return value;
  })();
  try {
    return await inFlight;
  } finally {
    inFlight = null;
  }
}

module.exports = { getPortfolioTraffic, isAnalyticsConfigured };
