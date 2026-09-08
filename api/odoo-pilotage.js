const { requireSession } = require('./_lib/session');
const { getSheetsClient, ensureSheetExists, readSheetWithHeader, updateRowRange } = require('./_lib/sheets');
const { fetchPublicCatalogue } = require('./_lib/odoo-public');
const potential = require('./_data/dyonysos_catalog_potential.json');

const SHEET = 'ODOO_PILOTAGE';
const HISTORY_SHEET = 'ODOO_PILOTAGE_HISTORY';
const SNAPSHOT_SHEET = 'ODOO_PUBLIC_SNAPSHOTS';
const MODEL_VERSION = '2026-09-08.2';
const HEADER = ['key', 'label', 'value', 'updated_at', 'source', 'kind'];
const DEFAULTS = [
  ['paid_sales', 'Ventes payées vérifiées', 0, 'Odoo Apps Sales', 'actual'],
  ['partner_contacts', 'Partenaires contactés', 0, 'Suivi commercial Dyonysos', 'actual'],
  ['partner_replies', 'Réponses partenaires', 0, 'Suivi commercial Dyonysos', 'actual'],
  ['partner_demos', 'Démonstrations partenaires', 0, 'Suivi commercial Dyonysos', 'actual'],
  ['partner_proposals', 'Propositions partenaires', 0, 'Suivi commercial Dyonysos', 'actual'],
  ['partner_sales', 'Ventes via partenaires', 0, 'Suivi commercial Dyonysos', 'actual'],
  ['partners_per_month', 'Partenaires ciblés par mois', 15, 'Hypothèse commerciale', 'assumption'],
  ['positive_reply_rate', 'Taux de réponse positive', 0.15, 'Hypothèse prudente', 'assumption'],
  ['demo_rate', 'Réponses positives vers démonstration', 0.5, 'Hypothèse prudente', 'assumption'],
  ['close_rate', 'Démonstrations vers vente', 0.15, 'Hypothèse prudente', 'assumption'],
  ['average_ticket', 'Panier moyen partenaire', 1950, 'Mix MRP Essentiel et extensions', 'assumption'],
  ['dyonysos_share', 'Part Dyonysos après partage partenaire', 0.8, 'Hypothèse de partage', 'assumption'],
  ['partner_odoo_share', 'Part des ventes partenaires encaissée via Odoo Apps', 0, '0 = direct ; 1 = Odoo Apps', 'assumption'],
  ['odoo_commission', 'Commission Odoo Apps', 0.3, 'Hypothèse marketplace', 'assumption'],
  ['marketplace_rate', 'Achats mensuels par produit — benchmark', 0.0291, 'Moyenne éditeurs UE à faible historique', 'assumption'],
  ['new_catalog_ramp', 'Facteur de rampe catalogue neuf', 0.4665, 'Décote prudente non benchmarkée', 'assumption'],
  ['marketplace_growth_exponent', 'Accélération de visibilité', 1.45, 'Hypothèse de montée en puissance', 'assumption'],
];
const ALLOWED = new Set(DEFAULTS.map((row) => row[0]));
const ACTUAL_KEYS = new Set(DEFAULTS.filter((row) => row[4] === 'actual').map((row) => row[0]));
const RATE_KEYS = new Set(['positive_reply_rate', 'demo_rate', 'close_rate', 'dyonysos_share', 'partner_odoo_share', 'odoo_commission', 'marketplace_rate', 'new_catalog_ramp']);

const MODEL_PRODUCTS = potential.rows.filter((row) => (
  (row.type === 'Application' && row.status === 'Catalogue actuel') ||
  (row.type === 'Thème' && row.status === 'Pro payante')
) && row.price_eur > 0 && row.technical_name !== 'theme_atelier');

function parseNumber(value) {
  const parsed = Number(String(value ?? 0).replace(/\s/g, '').replace(',', '.'));
  return Number.isFinite(parsed) ? parsed : 0;
}

function fallbackRows() {
  const now = new Date().toISOString();
  return DEFAULTS.map(([key, label, value, source, kind]) => ({ key, label, value, updatedAt: now, source, kind }));
}

function rowsToObjects(rows) {
  return rows.filter((row) => row[0]).map((row) => ({
    key: row[0], label: row[1], value: parseNumber(row[2]),
    updatedAt: row[3] || null, source: row[4] || '', kind: row[5] || '',
  }));
}

async function loadState() {
  const created = await ensureSheetExists(SHEET, HEADER);
  let result = await readSheetWithHeader(SHEET, 'A1:F');
  if (created || result.rows.length === 0) {
    const now = new Date().toISOString();
    const sheets = await getSheetsClient();
    const values = [HEADER, ...DEFAULTS.map(([key, label, value, source, kind]) => [key, label, value, now, source, kind])];
    await sheets.spreadsheets.values.update({
      spreadsheetId: process.env.SPREADSHEET_ID,
      range: `${SHEET}!A1:F${values.length}`,
      valueInputOption: 'USER_ENTERED',
      requestBody: { values },
    });
    result = await readSheetWithHeader(SHEET, 'A1:F');
  }
  return rowsToObjects(result.rows);
}

function calculate(rows) {
  const values = Object.fromEntries(rows.map((row) => [row.key, parseNumber(row.value)]));
  const months = 10;
  const weightedCatalogueValue = MODEL_PRODUCTS.reduce((sum, row) => sum + row.price_eur * row.coefficient, 0);
  const marketplaceAfterCommission = weightedCatalogueValue * values.marketplace_rate * months * values.new_catalog_ramp * (1 - values.odoo_commission);
  const partnerLicenseValue = values.partners_per_month * months * values.positive_reply_rate * values.demo_rate * values.close_rate * values.average_ticket;
  const partnerAfterShare = partnerLicenseValue * values.dyonysos_share;
  const partnerAfterChannel = partnerAfterShare * (1 - values.partner_odoo_share * values.odoo_commission);
  const central = marketplaceAfterCommission + partnerAfterChannel;
  const target = 5400;
  return {
    modelVersion: MODEL_VERSION,
    productCount: MODEL_PRODUCTS.length,
    weightedCatalogueValue: Math.round(weightedCatalogueValue),
    marketplaceAfterCommission: Math.round(marketplaceAfterCommission),
    partnerLicenseValue: Math.round(partnerLicenseValue),
    partnerAfterShare: Math.round(partnerAfterShare),
    partnerAfterChannel: Math.round(partnerAfterChannel),
    centralBeforeInternalCosts: Math.round(central),
    target,
    targetGap: Math.max(0, Math.round(target - central)),
    marginContribution: null,
    marginWarning: 'Avant temps commercial, support, installation, remboursements, fiscalité et autres coûts internes.',
    horizons: [1, 3, 6, 10].map((elapsedMonths) => {
      const fraction = elapsedMonths / months;
      const marketplace = marketplaceAfterCommission * Math.pow(fraction, values.marketplace_growth_exponent);
      const partner = partnerAfterChannel * fraction;
      return { days: elapsedMonths * 30, marketplace: Math.round(marketplace), partner: Math.round(partner), central: Math.round(marketplace + partner) };
    }),
  };
}

async function appendHistory(changes, evidence, now) {
  await ensureSheetExists(HISTORY_SHEET, ['changed_at', 'model_version', 'key', 'old_value', 'new_value', 'kind', 'evidence', 'actor']);
  const sheets = await getSheetsClient();
  await sheets.spreadsheets.values.append({
    spreadsheetId: process.env.SPREADSHEET_ID,
    range: `${HISTORY_SHEET}!A1`,
    valueInputOption: 'USER_ENTERED',
    insertDataOption: 'INSERT_ROWS',
    requestBody: { values: changes.map((change) => [now, MODEL_VERSION, change.key, change.oldValue, change.newValue, change.kind, evidence || '', 'private-dashboard']) },
  });
}

function snapshotRow(catalogue) {
  return [catalogue.fetchedAt, catalogue.appsTotal, catalogue.paidApps, catalogue.freeApps, catalogue.themesTotal, catalogue.paidThemes, catalogue.freeThemes, catalogue.acquisitionDownloads, catalogue.technicalBaseDownloads, catalogue.themeDownloads, catalogue.source];
}

async function persistSnapshot(catalogue) {
  await ensureSheetExists(SNAPSHOT_SHEET, ['fetched_at', 'apps_total', 'paid_apps', 'free_apps', 'themes_total', 'paid_themes', 'free_themes', 'acquisition_downloads', 'technical_base_downloads', 'theme_downloads', 'source']);
  const result = await readSheetWithHeader(SNAPSHOT_SHEET, 'A1:K');
  const current = snapshotRow(catalogue);
  const last = result.rows.at(-1);
  if (last && current.slice(1, 10).every((value, index) => String(value) === String(last[index + 1]))) return;
  const sheets = await getSheetsClient();
  await sheets.spreadsheets.values.append({ spreadsheetId: process.env.SPREADSHEET_ID, range: `${SNAPSHOT_SHEET}!A1`, valueInputOption: 'USER_ENTERED', insertDataOption: 'INSERT_ROWS', requestBody: { values: [current] } });
}

async function latestSnapshot() {
  const result = await readSheetWithHeader(SNAPSHOT_SHEET, 'A1:K');
  const row = result.rows.at(-1);
  if (!row) return null;
  return { fetchedAt: row[0], appsTotal: parseNumber(row[1]), paidApps: parseNumber(row[2]), freeApps: parseNumber(row[3]), themesTotal: parseNumber(row[4]), paidThemes: parseNumber(row[5]), freeThemes: parseNumber(row[6]), acquisitionDownloads: parseNumber(row[7]), technicalBaseDownloads: parseNumber(row[8]), themeDownloads: parseNumber(row[9]), source: row[10], technicalBases: [], stale: true };
}

async function getPayload() {
  let rows;
  let storage = 'google-sheets';
  let storageWarning = null;
  try {
    rows = await loadState();
  } catch (error) {
    rows = fallbackRows();
    storage = 'fallback';
    storageWarning = `Persistance Google Sheets indisponible : ${error.message}`;
  }
  let catalogue = null;
  let catalogueWarning = null;
  try {
    catalogue = await fetchPublicCatalogue();
    if (storage === 'google-sheets') await persistSnapshot(catalogue);
  } catch (error) {
    catalogueWarning = `Lecture publique Odoo indisponible : ${error.message}`;
    if (storage === 'google-sheets') {
      try { catalogue = await latestSnapshot(); } catch (_) { catalogue = null; }
    }
  }
  return {
    generatedAt: new Date().toISOString(),
    storage,
    storageWarning,
    catalogue,
    catalogueWarning,
    rows,
    projection: calculate(rows),
    catalogueChanges: {
      publicPaidApps: catalogue?.paidApps ?? null,
      reviewCommercialApps: 5,
      reviewTechnicalWrappers: 3,
      merged: 0,
      scanned: 0,
      published: 0,
      note: 'Les 5 nouvelles offres et les 3 wrappers de packs sont en branches de revue, pas encore sur Odoo Apps.',
    },
    videoPlan: [
      { product: 'Amazon + Packlink', priority: 1, demoReady: false, screenshots: false, script: false, video: false, youtube: false, listingLinked: false },
      { product: 'MCP Server for Odoo', priority: 2, demoReady: false, screenshots: false, script: false, video: false, youtube: false, listingLinked: false },
      { product: 'MRP Essentiel', priority: 3, demoReady: false, screenshots: false, script: false, video: false, youtube: false, listingLinked: false },
    ],
  };
}

module.exports = async function handler(req, res) {
  if (!requireSession(req, res)) return;
  res.setHeader('Cache-Control', 'private, no-store');
  if (req.method === 'GET') return res.status(200).json(await getPayload());
  if (req.method !== 'POST') return res.status(405).json({ error: 'Méthode non autorisée.' });
  try {
    const updates = req.body?.updates || {};
    const evidence = String(req.body?.evidence || '').trim().slice(0, 500);
    const state = await loadState();
    const now = new Date().toISOString();
    const current = Object.fromEntries(state.map((row) => [row.key, row]));
    const changes = [];
    for (const [key, rawValue] of Object.entries(updates)) {
      if (!ALLOWED.has(key)) continue;
      const value = parseNumber(rawValue);
      if (value < 0 || (RATE_KEYS.has(key) && value > 1) || (key === 'marketplace_growth_exponent' && value > 3)) return res.status(400).json({ error: `Valeur hors limites pour ${key}.` });
      if (ACTUAL_KEYS.has(key) && !Number.isInteger(value)) return res.status(400).json({ error: `${key} doit être un entier.` });
      if (current[key] && value !== current[key].value) changes.push({ key, oldValue: current[key].value, newValue: value, kind: current[key].kind });
    }
    const next = { ...Object.fromEntries(state.map((row) => [row.key, row.value])), ...Object.fromEntries(changes.map((change) => [change.key, change.newValue])) };
    if (!(next.partner_sales <= next.partner_proposals && next.partner_proposals <= next.partner_demos && next.partner_demos <= next.partner_replies && next.partner_replies <= next.partner_contacts)) return res.status(400).json({ error: 'Funnel incohérent : ventes ≤ propositions ≤ démos ≤ réponses ≤ contacts.' });
    if (changes.some((change) => ACTUAL_KEYS.has(change.key)) && evidence.length < 5) return res.status(400).json({ error: 'Une source ou preuve est obligatoire pour modifier une donnée réelle.' });
    if (changes.length) await appendHistory(changes, evidence, now);
    for (const change of changes) {
      const index = state.findIndex((row) => row.key === change.key);
      if (ACTUAL_KEYS.has(change.key)) await updateRowRange(SHEET, index + 2, 'C', 'E', [change.newValue, now, evidence]);
      else await updateRowRange(SHEET, index + 2, 'C', 'D', [change.newValue, now]);
    }
    return res.status(200).json(await getPayload());
  } catch (error) {
    const status = error.code === 'NOT_CONFIGURED' ? 501 : 500;
    return res.status(status).json({ error: error.message });
  }
};
