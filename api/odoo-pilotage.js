const { requireSession } = require('./_lib/session');
const { getSheetsClient, ensureSheetExists, readSheetWithHeader } = require('./_lib/sheets');
const { fetchPublicCatalogue } = require('./_lib/odoo-public');
const potential = require('./_data/dyonysos_catalog_potential.json');

const SHEET = 'ODOO_PILOTAGE';
const HISTORY_SHEET = 'ODOO_PILOTAGE_HISTORY';
const SNAPSHOT_SHEET = 'ODOO_PUBLIC_SNAPSHOTS';
const MODEL_VERSION = '2026-09-09.1';
const INITIAL_ACTUALS_OBSERVED_AT = '2026-09-08T20:00:00+02:00';
const HEADER = ['key', 'label', 'value', 'updated_at', 'source', 'kind'];
const DEFAULTS = [
  ['paid_sales', 'Ventes payées vérifiées', 0, 'Odoo Apps Sales', 'actual'],
  ['partner_contacts', 'Partenaires contactés', 0, 'Suivi commercial Dyonysos', 'actual'],
  ['partner_replies', 'Réponses partenaires', 0, 'Suivi commercial Dyonysos', 'actual'],
  ['partner_demos', 'Démonstrations partenaires', 0, 'Suivi commercial Dyonysos', 'actual'],
  ['partner_proposals', 'Propositions partenaires', 0, 'Suivi commercial Dyonysos', 'actual'],
  ['partner_sales', 'Ventes via partenaires', 0, 'Suivi commercial Dyonysos', 'actual'],
  ['paid_gross_eur', 'Montant brut vendu', 0, 'Odoo Apps Sales observé le 08/09/2026', 'actual'],
  ['odoo_commission_actual_eur', 'Commission Odoo réelle', 0, 'Odoo Apps Sales observé le 08/09/2026', 'actual'],
  ['partner_share_actual_eur', 'Part partenaire réelle', 0, 'Suivi commercial Dyonysos', 'actual'],
  ['refunds_actual_eur', 'Remboursements réels', 0, 'Suivi commercial Dyonysos', 'actual'],
  ['dyonysos_attributed_eur', 'Montant attribué à Dyonysos', 0, 'Odoo Apps Sales observé le 08/09/2026', 'actual'],
  ['cash_received_eur', 'Montant encaissé', 0, 'Odoo Apps Sales observé le 08/09/2026', 'actual'],
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
const COUNT_ACTUAL_KEYS = new Set(['paid_sales', 'partner_contacts', 'partner_replies', 'partner_demos', 'partner_proposals', 'partner_sales']);
const RATE_KEYS = new Set(['positive_reply_rate', 'demo_rate', 'close_rate', 'dyonysos_share', 'partner_odoo_share', 'odoo_commission', 'marketplace_rate', 'new_catalog_ramp']);

const MODEL_PRODUCTS = potential.rows.filter((row) => (
  (row.type === 'Application' && row.status === 'Catalogue actuel') ||
  (row.type === 'Thème' && row.status === 'Pro payante')
) && row.price_eur > 0 && row.technical_name !== 'theme_atelier');

function parseNumber(value) {
  const parsed = Number(String(value ?? 0).replace(/\s/g, '').replace(',', '.'));
  return Number.isFinite(parsed) ? parsed : 0;
}

function requireNumber(value, key) {
  if (value === null || value === undefined || String(value).trim() === '') throw new Error(`Valeur numérique requise pour ${key}.`);
  const parsed = Number(String(value).replace(/\s/g, '').replace(',', '.'));
  if (!Number.isFinite(parsed)) throw new Error(`Valeur numérique invalide pour ${key}.`);
  return parsed;
}

function fallbackRows() {
  const now = new Date().toISOString();
  return DEFAULTS.map(([key, label, value, source, kind]) => ({
    key, label, value: kind === 'actual' ? null : value,
    updatedAt: kind === 'actual' ? null : now,
    source: kind === 'actual' ? 'Donnée indisponible — Google Sheets non lu' : source,
    kind,
  }));
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
    const values = [HEADER, ...DEFAULTS.map(([key, label, value, source, kind]) => [key, label, value, kind === 'actual' ? INITIAL_ACTUALS_OBSERVED_AT : now, source, kind])];
    await sheets.spreadsheets.values.update({
      spreadsheetId: process.env.SPREADSHEET_ID,
      range: `${SHEET}!A1:F${values.length}`,
      valueInputOption: 'USER_ENTERED',
      requestBody: { values },
    });
    result = await readSheetWithHeader(SHEET, 'A1:F');
  }
  const present = new Set(result.rows.map((row) => row[0]));
  const missing = DEFAULTS.filter((row) => !present.has(row[0]));
  if (missing.length) {
    const sheets = await getSheetsClient();
    const now = new Date().toISOString();
    await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.SPREADSHEET_ID,
      range: `${SHEET}!A1`,
      valueInputOption: 'RAW',
      insertDataOption: 'INSERT_ROWS',
      requestBody: { values: missing.map(([key, label, value, source, kind]) => [key, label, value, kind === 'actual' ? INITIAL_ACTUALS_OBSERVED_AT : now, source, kind]) },
    });
    result = await readSheetWithHeader(SHEET, 'A1:F');
  }
  const paidSalesIndex = result.rows.findIndex((row) => row[0] === 'paid_sales');
  if (paidSalesIndex >= 0 && result.rows[paidSalesIndex][4] === 'Odoo Apps Sales') {
    const sheets = await getSheetsClient();
    await sheets.spreadsheets.values.update({
      spreadsheetId: process.env.SPREADSHEET_ID,
      range: `${SHEET}!D${paidSalesIndex + 2}:E${paidSalesIndex + 2}`,
      valueInputOption: 'RAW',
      requestBody: { values: [[INITIAL_ACTUALS_OBSERVED_AT, 'Odoo Apps Sales authentifié, observation du 08/09/2026']] },
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

function safeText(value) {
  const text = String(value || '').trim();
  return /^[=+\-@]/.test(text) ? `'${text}` : text;
}

async function writeChanges(changes, state, evidence, now) {
  await ensureSheetExists(HISTORY_SHEET, ['changed_at', 'model_version', 'key', 'old_value', 'new_value', 'kind', 'evidence', 'actor']);
  const history = await readSheetWithHeader(HISTORY_SHEET, 'A1:H');
  const firstHistoryRow = history.rows.length + 2;
  const sheets = await getSheetsClient();
  const data = changes.map((change) => {
    const index = state.findIndex((row) => row.key === change.key);
    return {
      range: ACTUAL_KEYS.has(change.key) ? `${SHEET}!C${index + 2}:E${index + 2}` : `${SHEET}!C${index + 2}:D${index + 2}`,
      values: [ACTUAL_KEYS.has(change.key) ? [change.newValue, now, safeText(evidence)] : [change.newValue, now]],
    };
  });
  data.push({
    range: `${HISTORY_SHEET}!A${firstHistoryRow}:H${firstHistoryRow + changes.length - 1}`,
    values: changes.map((change) => [now, MODEL_VERSION, change.key, change.oldValue, change.newValue, change.kind, safeText(evidence), 'private-dashboard']),
  });
  await sheets.spreadsheets.values.batchUpdate({
    spreadsheetId: process.env.SPREADSHEET_ID,
    requestBody: { valueInputOption: 'RAW', data },
  });
}

async function loadRecentHistory(limit = 10) {
  await ensureSheetExists(HISTORY_SHEET, ['changed_at', 'model_version', 'key', 'old_value', 'new_value', 'kind', 'evidence', 'actor']);
  const history = await readSheetWithHeader(HISTORY_SHEET, 'A1:H');
  return history.rows.slice(-limit).reverse().map((row) => ({
    changedAt: row[0] || null,
    modelVersion: row[1] || '',
    key: row[2] || '',
    oldValue: parseNumber(row[3]),
    newValue: parseNumber(row[4]),
    kind: row[5] || '',
    evidence: row[6] || '',
    actor: row[7] || '',
  }));
}

function snapshotRow(catalogue) {
  return [catalogue.fetchedAt, catalogue.appsTotal, catalogue.paidApps, catalogue.freeApps, catalogue.themesTotal, catalogue.paidThemes, catalogue.freeThemes, catalogue.acquisitionDownloads, catalogue.technicalBaseDownloads, catalogue.themeDownloads, catalogue.source];
}

async function persistSnapshot(catalogue) {
  await ensureSheetExists(SNAPSHOT_SHEET, ['fetched_at', 'apps_total', 'paid_apps', 'free_apps', 'themes_total', 'paid_themes', 'free_themes', 'acquisition_downloads', 'technical_base_downloads', 'theme_downloads', 'source']);
  const result = await readSheetWithHeader(SNAPSHOT_SHEET, 'A1:K');
  const current = snapshotRow(catalogue);
  const last = result.rows.at(-1);
  const sameDay = last && String(last[0]).slice(0, 10) === String(current[0]).slice(0, 10);
  const unchanged = last && current.slice(1, 10).every((value, index) => String(value) === String(last[index + 1]));
  if (sameDay && unchanged) return;
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
  let recentHistory = [];
  let storage = 'google-sheets';
  let storageWarning = null;
  try {
    rows = await loadState();
    recentHistory = await loadRecentHistory();
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
    recentHistory,
    projection: calculate(rows),
    benchmark: {
      status: 'hypothèse interne à recalibrer',
      rate: 0.0291,
      source: 'Baromètre Odoo Apps UE du 07/09/2026 — 176 éditeurs recensés, sous-groupe à faible historique',
      productCoefficientsSource: 'Classeur de potentiel Dyonysos du 08/09/2026 — coefficients commerciaux internes',
    },
    actualFinance: (() => {
      const v = Object.fromEntries(rows.map((row) => [row.key, parseNumber(row.value)]));
      const explained = v.odoo_commission_actual_eur + v.partner_share_actual_eur + v.refunds_actual_eur + v.dyonysos_attributed_eur;
      return { gross: v.paid_gross_eur, explained, unreconciled: Math.round((v.paid_gross_eur - explained) * 100) / 100, cashReceived: v.cash_received_eur };
    })(),
    modelProducts: MODEL_PRODUCTS.map((row) => ({ technicalName: row.technical_name, type: row.type, price: row.price_eur, coefficient: row.coefficient, status: row.status, domain: row.domain, weightedValue: Math.round(row.price_eur * row.coefficient * 100) / 100 })),
    catalogueChanges: {
      publicPaidApps: catalogue?.paidApps ?? null,
      reviewCommercialApps: 5,
      reviewTechnicalWrappers: 3,
      merged: 0,
      scanned: 0,
      published: 0,
      note: 'Les 5 nouvelles offres et les 3 wrappers de packs sont en branches de revue. Les CI étaient vertes avant le dernier contre-audit ; aucune fusion ni analyse Odoo Apps n’a encore été lancée.',
    },
    releasePlan: {
      status: 'HOLD',
      updatedAt: '2026-09-09T00:55:00+02:00',
      designSystems: [
        { family: 'Apps métiers', direction: 'Vendeur, vivant, produit', master: 'Boulangerie–Pâtisserie', status: 'Validé par Julien', locale: 'FR site / EN Store', proof: 'Capture Odoo réelle obligatoire' },
        { family: 'ERP / MRP', direction: 'Industriel, sobre, chiffré', master: 'MRP Essentiel', status: 'Validé par Julien', locale: 'FR site / EN Store', proof: 'Capture Cockpit réelle disponible' },
      ],
      gates: [
        { label: 'Prix des packs MRP cohérents', state: 'correction-locale', detail: 'Cockpit corrigé à 600 € dans le tableau Essentiel ; CI à relancer.' },
        { label: 'Capacité Club protégée', state: 'correction-locale', detail: 'Création directe confirmée/présente bloquée ; test ajouté, CI à relancer.' },
        { label: 'Masters visuels approuvés', state: 'done', detail: 'GO Julien le 09/09/2026 : commercial produit pour les apps métiers ; industriel sobre pour ERP/MRP.' },
        { label: 'Fiches Odoo Apps en anglais', state: 'todo', detail: 'Déclinaison EN et captures réelles à finaliser avant analyse Store.' },
        { label: 'Fusion / analyse / publication', state: 'todo', detail: '0 / 0 / 0 — aucune action Store avant GO du contre-audit.' },
      ],
      canva: {
        status: 'Masters validés',
        url: 'https://www.canva.com/design/DAHUpbyPvDY/o4J-wXkP5pUW3JghXIx03w/edit',
        note: 'Exports et manifeste réutilisables conservés ; classement final dans Canva à relire après reconnexion du connecteur.',
      },
    },
    youtubePlaylists: [
      { locale: 'FR', name: 'Odoo Apps Dyonysos — Français', url: 'https://www.youtube.com/playlist?list=PLAJRwo0mIPBw', status: 'Publique' },
      { locale: 'EN', name: 'Dyonysos Odoo Apps — English', url: 'https://www.youtube.com/playlist?list=PLNZJM-Sun_Bw', status: 'Publique' },
    ],
    videoPlan: [
      { product: 'Amazon + Packlink', priority: 1, demoReady: false, screenshots: true, script: true, video: true, youtube: false, listingLinked: false },
      { product: 'MCP Server for Odoo', priority: 2, demoReady: false, screenshots: false, script: false, video: false, youtube: false, listingLinked: false },
      { product: 'MRP Essentiel', priority: 3, demoReady: false, screenshots: true, script: true, video: true, youtube: false, listingLinked: false },
    ],
  };
}

module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'private, no-store');
  if (!requireSession(req, res)) return;
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
      let value;
      try { value = requireNumber(rawValue, key); } catch (error) { return res.status(400).json({ error: error.message }); }
      if (value < 0 || (RATE_KEYS.has(key) && value > 1) || (key === 'marketplace_growth_exponent' && value > 3)) return res.status(400).json({ error: `Valeur hors limites pour ${key}.` });
      if (COUNT_ACTUAL_KEYS.has(key) && !Number.isInteger(value)) return res.status(400).json({ error: `${key} doit être un entier.` });
      if (current[key] && value !== current[key].value) changes.push({ key, oldValue: current[key].value, newValue: value, kind: current[key].kind });
    }
    const next = { ...Object.fromEntries(state.map((row) => [row.key, row.value])), ...Object.fromEntries(changes.map((change) => [change.key, change.newValue])) };
    if (!(next.partner_sales <= next.partner_proposals && next.partner_proposals <= next.partner_demos && next.partner_demos <= next.partner_replies && next.partner_replies <= next.partner_contacts)) return res.status(400).json({ error: 'Funnel incohérent : ventes ≤ propositions ≤ démos ≤ réponses ≤ contacts.' });
    if (next.partner_sales > next.paid_sales) return res.status(400).json({ error: 'Les ventes partenaires ne peuvent pas dépasser les ventes payées totales.' });
    if (next.paid_sales > 0 && next.paid_gross_eur <= 0) return res.status(400).json({ error: 'Un montant brut est requis lorsqu’une vente payée est enregistrée.' });
    if (next.odoo_commission_actual_eur + next.partner_share_actual_eur + next.refunds_actual_eur + next.dyonysos_attributed_eur > next.paid_gross_eur + 0.01) return res.status(400).json({ error: 'Réconciliation financière impossible : commissions + partage + remboursements + montant attribué dépassent le brut.' });
    if (next.cash_received_eur > next.dyonysos_attributed_eur + 0.01) return res.status(400).json({ error: 'L’encaissement ne peut pas dépasser le montant attribué à Dyonysos.' });
    if (changes.some((change) => ACTUAL_KEYS.has(change.key)) && evidence.length < 5) return res.status(400).json({ error: 'Une source ou preuve est obligatoire pour modifier une donnée réelle.' });
    if (changes.length) await writeChanges(changes, state, evidence, now);
    return res.status(200).json(await getPayload());
  } catch (error) {
    const status = error.code === 'NOT_CONFIGURED' ? 501 : 500;
    return res.status(status).json({ error: error.message });
  }
};
