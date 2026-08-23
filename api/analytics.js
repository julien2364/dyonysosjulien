const crypto = require('crypto');
const { list } = require('@vercel/blob');
const sign = value => crypto.createHmac('sha256', process.env.PRIVATE_SESSION_SECRET || '').update(value).digest('hex');
const validSession = req => {
  const cookie = String(req.headers.cookie || '').split(';').map(v => v.trim()).find(v => v.startsWith('dyonysos_admin='));
  if (!cookie || !process.env.PRIVATE_SESSION_SECRET) return false;
  const [expires, signature] = decodeURIComponent(cookie.slice('dyonysos_admin='.length)).split('.');
  const expected = sign(expires || '');
  return Number(expires) > Date.now() && signature && signature.length === expected.length && crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
};
const TEAM = 'team_V2XarT2PcWGD86aDLfpoA5xa';
const PROJECT = 'prj_9GUpX7bWsEM6JFXXOKMgf6dwE4EQ';
const iso = d => d.toISOString();

const cityStats = async since => {
  if (!process.env.BLOB_READ_WRITE_TOKEN) return [];
  const minimumDate = since.toISOString().slice(0, 10);
  const counts = new Map();
  let cursor;
  let page = 0;
  do {
    const result = await list({
      prefix: 'analytics/cities/',
      limit: 1000,
      cursor,
      token: process.env.BLOB_READ_WRITE_TOKEN
    });
    for (const blob of result.blobs || []) {
      const parts = String(blob.pathname || '').split('/');
      const date = parts[2] || '';
      const country = parts[3] || '';
      let city = '';
      try { city = decodeURIComponent(parts[4] || ''); } catch { city = parts[4] || ''; }
      if (date < minimumDate || !city || !country) continue;
      const key = `${city}\u0000${country}`;
      counts.set(key, (counts.get(key) || 0) + 1);
    }
    cursor = result.hasMore ? result.cursor : undefined;
    page += 1;
  } while (cursor && page < 20);
  return [...counts.entries()]
    .map(([key, connections]) => {
      const [city, country] = key.split('\u0000');
      return { city, country, connections, visitors: connections, pageviews: connections };
    })
    .sort((a, b) => b.connections - a.connections || a.city.localeCompare(b.city, 'fr'))
    .slice(0, 50);
};

module.exports = async function handler(req, res) {
  const startedAt = Date.now();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Méthode non autorisée.' });
  if (!validSession(req)) return res.status(401).json({ error: 'Session privée requise.' });
  if (!process.env.VERCEL_ANALYTICS_TOKEN) return res.status(503).json({ error: 'Connexion Analytics non configurée.' });
  console.log(JSON.stringify({ level: 'info', msg: 'start', route: '/api/analytics', requestId: req.headers['x-vercel-id'] || null }));
  const until = new Date();
  const startToday = new Date(until); startToday.setUTCHours(0, 0, 0, 0);
  const since7 = new Date(startToday); since7.setUTCDate(since7.getUTCDate() - 6);
  const since30 = new Date(startToday); since30.setUTCDate(since30.getUTCDate() - 29);
  const query = async (resource, since, by, filter) => {
    const u = new URL(`https://api.vercel.com/v1/query/web-analytics/visits/${resource}`);
    u.searchParams.set('teamId', TEAM); u.searchParams.set('projectId', PROJECT);
    u.searchParams.set('since', iso(since)); u.searchParams.set('until', iso(until));
    if (by) { u.searchParams.set('by', by); u.searchParams.set('limit', '50'); }
    if (filter) u.searchParams.set('filter', filter);
    const response = await fetch(u, { headers: { Authorization: `Bearer ${process.env.VERCEL_ANALYTICS_TOKEN}` } });
    if (!response.ok) throw new Error(`Analytics ${response.status}`);
    return response.json();
  };
  const localized = path => [path, ...['en', 'es', 'nl', 'de'].map(lang => `/${lang}${path}`)];
  const pathFilter = paths => paths.map(path => `requestPath eq '${path}'`).join(' or ');
  const productSlugs = ['cvdesignpro','quizplay','courshub','ecole-connect','firmoscope','arbitrage-plus','analyzer-plus','profit-plus','erpbridge','marketplace','creation-graphique','applications-mobiles'];
  const solutionPaths = localized('/solutions');
  const productPaths = productSlugs.flatMap(slug => localized(`/solutions/${slug}`));
  const outboundPaths = ['cvdesignpro','quizplay','courshub','ecole-connect','firmoscope','arbitrage-plus','analyzer-plus','profit-plus'].map(slug => `/out/${slug}`);
  const trainingPaths = localized('/formation-conseil');
  const contactPaths = localized('/contact');
  try {
    const [today, week, month, daily, pages, countries, cities, devices, referrers, solutions, products, outbound, training, contacts, contactSent] = await Promise.all([
      query('count', startToday), query('count', since7), query('count', since30),
      query('aggregate', since30, 'day'), query('aggregate', since30, 'requestPath'),
      query('aggregate', since30, 'country'), cityStats(since30).catch(error => {
        console.error(JSON.stringify({ level: 'error', msg: 'city_stats_failed', route: '/api/analytics', error: error.message }));
        return [];
      }), query('aggregate', since30, 'deviceType'),
      query('aggregate', since30, 'referrerHostname'),
      query('count', since30, null, pathFilter(solutionPaths)),
      query('count', since30, null, pathFilter(productPaths)),
      query('count', since30, null, pathFilter(outboundPaths)),
      query('count', since30, null, pathFilter(trainingPaths)),
      query('count', since30, null, pathFilter(contactPaths)),
      query('count', since30, null, pathFilter(['/conversion/contact-envoye']))
    ]);
    res.setHeader('Cache-Control', 'private, no-store');
    console.log(JSON.stringify({ level: 'info', msg: 'done', route: '/api/analytics', ms: Date.now() - startedAt, cityRows: cities.length }));
    return res.status(200).json({
      updatedAt: until.toISOString(), today: today.data, week: week.data, month: month.data,
      daily: daily.data || [], pages: (pages.data || []).filter(row => row.requestPath !== '/conversion/contact-envoye'), countries: countries.data || [], cities,
      devices: devices.data || [], referrers: referrers.data || [],
      funnels: {
        period: '30 jours',
        products: [
          { label: 'Visiteurs du site', ...month.data },
          { label: 'Catalogue Solutions', ...solutions.data },
          { label: 'Pages produit', ...products.data },
          { label: 'Clics vers les produits', ...outbound.data }
        ],
        services: [
          { label: 'Visiteurs du site', ...month.data },
          { label: 'Page Formation & Conseil', ...training.data },
          { label: 'Page Contact', ...contacts.data },
          { label: 'Formulaires envoyés', ...contactSent.data }
        ]
      }
    });
  } catch (error) {
    console.error(JSON.stringify({ level: 'error', msg: 'failed', route: '/api/analytics', error: error.message, ms: Date.now() - startedAt }));
    return res.status(502).json({ error: 'Les statistiques sont momentanément indisponibles.' });
  }
};
