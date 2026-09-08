const BASE_URL = 'https://apps.odoo.com';
const MAINTAINER_ID = '539048';
const TECHNICAL_BASES = new Set(['dyo_mrp_common', 'dyo_metiers_common', 'dyo_sport_common']);

function cleanText(value = '') {
  return value
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, ' ')
    .trim();
}

function parseMoney(value = '') {
  const normalized = value.replace(/[^0-9,.-]/g, '').replace(',', '.');
  const parsed = Number.parseFloat(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
}

function parseCataloguePage(html, kind) {
  const totalMatch = html.match(/<b[^>]*>\s*([0-9]+)\s*(?:Apps|Themes) found\./i);
  const chunks = html.split(/<div class="loempia_app_entry (?:loempia_app_card|loempia_theme_card)/).slice(1);
  const items = chunks.map((chunk) => {
    const href = chunk.match(/<a href="(\/apps\/(?:modules|themes)\/19\.0\/([^"/]+))"/i);
    if (!href) return null;
    const title = cleanText(chunk.match(/<h5[^>]*title="([^"]+)"/i)?.[1] || href[2]);
    const priceBlock = chunk.match(/loempia_panel_price[^>]*>[\s\S]*?<b>([\s\S]*?)<\/b>/i)?.[1] || '';
    const isFree = /FREE/i.test(priceBlock);
    const downloadsMatch = chunk.match(/Total Downloads:\s*([0-9\s,]+),\s*Last month:\s*([0-9\s,]+)/i);
    return {
      slug: href[2],
      title,
      url: `${BASE_URL}${href[1]}`,
      kind,
      free: isFree,
      price: isFree ? 0 : parseMoney(cleanText(priceBlock)),
      downloads: Number((downloadsMatch?.[1] || '0').replace(/[^0-9]/g, '')),
      downloadsLastMonth: Number((downloadsMatch?.[2] || '0').replace(/[^0-9]/g, '')),
      technicalBase: TECHNICAL_BASES.has(href[2]),
    };
  }).filter(Boolean);
  return { total: Number(totalMatch?.[1] || items.length), items };
}

async function fetchText(url) {
  const response = await fetch(url, {
    headers: { 'User-Agent': 'Dyonysos-Pilotage/1.0 (+https://dyonysos.fr)' },
  });
  if (!response.ok) throw new Error(`Odoo Apps répond ${response.status}`);
  return response.text();
}

async function fetchPublicCatalogue() {
  const appsUrl = `${BASE_URL}/apps/modules/browse?repo_maintainer_id=${MAINTAINER_ID}`;
  const themesUrl = `${BASE_URL}/apps/themes/browse?repo_maintainer_id=${MAINTAINER_ID}`;
  const [apps1Html, apps2Html, themes1Html, themes2Html] = await Promise.all([
    fetchText(appsUrl),
    fetchText(`${BASE_URL}/apps/modules/browse/page/2?repo_maintainer_id=${MAINTAINER_ID}`),
    fetchText(themesUrl),
    fetchText(`${BASE_URL}/apps/themes/browse/page/2?repo_maintainer_id=${MAINTAINER_ID}`),
  ]);
  const apps1 = parseCataloguePage(apps1Html, 'app');
  const apps2 = parseCataloguePage(apps2Html, 'app');
  const themes1 = parseCataloguePage(themes1Html, 'theme');
  const themes2 = parseCataloguePage(themes2Html, 'theme');
  const uniqueApps = new Map([...apps1.items, ...apps2.items].map((item) => [item.slug, item]));
  const uniqueThemes = new Map([...themes1.items, ...themes2.items].map((item) => [item.slug, item]));
  const appItems = [...uniqueApps.values()];
  const items = [...appItems, ...uniqueThemes.values()];
  const freeApps = appItems.filter((item) => item.free);
  const technicalBases = freeApps.filter((item) => item.technicalBase);
  const acquisitionApps = freeApps.filter((item) => !item.technicalBase);
  const themeItems = [...uniqueThemes.values()];
  const freeThemes = themeItems.filter((item) => item.free);
  return {
    fetchedAt: new Date().toISOString(),
    source: appsUrl,
    appsTotal: Math.max(apps1.total, uniqueApps.size),
    themesTotal: Math.max(themes1.total, uniqueThemes.size),
    paidApps: appItems.filter((item) => !item.free).length,
    freeApps: freeApps.length,
    paidThemes: themeItems.filter((item) => !item.free).length,
    freeThemes: freeThemes.length,
    acquisitionDownloads: [...acquisitionApps, ...freeThemes].reduce((sum, item) => sum + item.downloads, 0),
    technicalBaseDownloads: technicalBases.reduce((sum, item) => sum + item.downloads, 0),
    technicalBases: technicalBases.map((item) => ({ slug: item.slug, downloads: item.downloads })),
    themeDownloads: themeItems.reduce((sum, item) => sum + item.downloads, 0),
    items,
  };
}

module.exports = { parseCataloguePage, fetchPublicCatalogue };
