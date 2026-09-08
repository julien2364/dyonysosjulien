const { requireSession } = require('./_lib/session');
const { ensureSheetExists, readSheetWithHeader, appendRow, updateRowRange } = require('./_lib/sheets');
const { fetchPublicCatalogue } = require('./_lib/odoo-public');

const SHEET = 'ODOO_PILOTAGE';
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
  ['dyonysos_share', 'Part nette Dyonysos', 0.8, 'Hypothèse de partage', 'assumption'],
];
const ALLOWED = new Set(DEFAULTS.map((row) => row[0]));

function fallbackRows() {
  const now = new Date().toISOString();
  return DEFAULTS.map(([key, label, value, source, kind]) => ({ key, label, value, updatedAt: now, source, kind }));
}

function rowsToObjects(rows) {
  return rows.filter((row) => row[0]).map((row) => ({
    key: row[0], label: row[1], value: Number(row[2]) || 0,
    updatedAt: row[3] || null, source: row[4] || '', kind: row[5] || '',
  }));
}

async function loadState() {
  const created = await ensureSheetExists(SHEET, HEADER);
  let result = await readSheetWithHeader(SHEET, 'A1:F');
  if (created || result.rows.length === 0) {
    const now = new Date().toISOString();
    for (const [key, label, value, source, kind] of DEFAULTS) {
      await appendRow(SHEET, [key, label, value, now, source, kind]);
    }
    result = await readSheetWithHeader(SHEET, 'A1:F');
  }
  return rowsToObjects(result.rows);
}

function calculate(rows) {
  const values = Object.fromEntries(rows.map((row) => [row.key, Number(row.value) || 0]));
  const months = 10;
  const partnerNet = values.partners_per_month * months * values.positive_reply_rate * values.demo_rate * values.close_rate * values.average_ticket * values.dyonysos_share;
  const inertia = 1111;
  const central = inertia + partnerNet;
  const target = 5400;
  return {
    inertia,
    partnerNet: Math.round(partnerNet),
    central: Math.round(central),
    target,
    targetGap: Math.max(0, Math.round(target - central)),
    horizons: [
      { days: 30, inertia: 37, central: Math.round(37 + partnerNet * 0.1) },
      { days: 90, inertia: 186, central: Math.round(186 + partnerNet * 0.3) },
      { days: 180, inertia: 557, central: Math.round(557 + partnerNet * 0.6) },
      { days: 300, inertia, central: Math.round(central) },
    ],
  };
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
  } catch (error) {
    catalogueWarning = `Lecture publique Odoo indisponible : ${error.message}`;
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
      { product: 'Amazon + Packlink', priority: 1, demoReady: false, screenshots: true, script: false, video: false, youtube: false, listingLinked: false },
      { product: 'MCP Server for Odoo', priority: 2, demoReady: false, screenshots: true, script: false, video: false, youtube: false, listingLinked: false },
      { product: 'MRP Essentiel', priority: 3, demoReady: false, screenshots: true, script: false, video: false, youtube: false, listingLinked: false },
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
    const state = await loadState();
    const now = new Date().toISOString();
    for (const [key, rawValue] of Object.entries(updates)) {
      if (!ALLOWED.has(key)) continue;
      const value = Number(rawValue);
      if (!Number.isFinite(value) || value < 0) continue;
      const index = state.findIndex((row) => row.key === key);
      if (index >= 0) await updateRowRange(SHEET, index + 2, 'C', 'D', [value, now]);
    }
    return res.status(200).json(await getPayload());
  } catch (error) {
    const status = error.code === 'NOT_CONFIGURED' ? 501 : 500;
    return res.status(status).json({ error: error.message });
  }
};
