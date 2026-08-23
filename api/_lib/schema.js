// ---------------------------------------------------------------------------
// CONTENT ENGINE DYONYSOS — mapping exact des colonnes du classeur Google Sheets
// (reconstruit le 23/08/2026 depuis les blueprints réels des scénarios Make
//  [CE] A/B/C/D — voir CONTENT_ENGINE_DYONYSOS_v2.xlsx pour le détail complet)
//
// spreadsheetId : process.env.SPREADSHEET_ID (doit rester 1jr-MmuuK...)
// ---------------------------------------------------------------------------

const SHEET_PROJECTS = "PROJECTS";
const SHEET_CONTENT_IDEAS = "CONTENT_IDEAS";
const SHEET_CONTENT_QUEUE = "CONTENT_QUEUE";
const SHEET_ASSETS = "ASSETS";
const SHEET_PUBLICATION_LOG = "PUBLICATION_LOG";
const SHEET_MANUAL_REQUESTS = "MANUAL_REQUESTS";

// Colonnes PROJECTS (A..AM) — index 0-based dans le tableau de valeurs
const PROJECTS_COLS = {
  id: 0, name: 1, statut: 2, note_statut: 3, site_url: 4, description: 5,
  cible: 6, valeur: 7, ton: 8, a_eviter: 9, secteur: 10, langue: 11,
  cta_impose: 12, persona_detail: 13, offre_en_cours: 14, canaux: 15,
  li_org_urn: 16, fb_page_id: 17, drive_folder_id_images: 18, drive_folder_id_projet: 19,
  instagram_account_id: 20, tiktok_account_id: 21, youtube_channel_id: 22,
  frequence_publication: 23, seuil_stock_min: 24, hashtags_marque: 25,
  hashtags_bannis: 26, mots_interdits: 27, utm_campaign: 28, budget_mensuel_pub: 29,
  contact_referent: 30, style_image: 31, style_video: 32, logo_drive_id: 33,
  palette_couleurs: 34, lien_brand_guidelines: 35, date_creation_fiche: 36,
  derniere_maj: 37, notes_libres: 38,
};
const PROJECTS_RANGE = "A1:AM";

// Colonnes CONTENT_IDEAS (A..U) — A..P = utilisées par les scénarios A/B (NE PAS Y TOUCHER
// au-delà de la sémantique existante) ; Q..U = ajoutées pour le flux manuel (hors de portée
// des lectures A1:P1 des scénarios, donc sans risque).
const CONTENT_IDEAS_COLS = {
  idea_id: 0, project_id: 1, created_at: 2, theme: 3, angle: 4, content_type: 5,
  objective: 6, target: 7, language: 8, priority: 9, score_ia: 10, source: 11,
  keywords: 12, status: 13, media_hint: 14, note: 15,
  source_link: 16, requested_channel: 17, origin: 18, requested_by: 19, manual_request_id: 20,
};
const CONTENT_IDEAS_RANGE = "A1:U";

// Colonnes CONTENT_QUEUE (A..AA)
const CONTENT_QUEUE_COLS = {
  content_id: 0, batch_id: 1, project_id: 2, idea_id: 3, created_at: 4, updated_at: 5,
  content_type: 6, objective: 7, target: 8, channel: 9, language: 10, hook: 11,
  body: 12, cta: 13, url: 14, hashtags: 15, image_prompt: 16, video_script: 17,
  video_prompt: 18, drive_file_id: 19, drive_file_link: 20, scheduled_at: 21,
  status: 22, mode: 23, priority: 24, reserve: 25, idempotency_key: 26,
};
const CONTENT_QUEUE_RANGE = "A1:AA";
// Statuts possibles (colonne W / status) : MEDIA_PENDING, READY, PUBLISHING, PUBLISHED, FAILED, REVIEW

// Colonnes PUBLICATION_LOG (A..N)
const PUBLICATION_LOG_COLS = {
  log_id: 0, timestamp: 1, content_id: 2, idea_id: 3, channel: 4, idempotency_key: 5,
  status: 6, platform_post_id: 7, error_message: 8, http_code: 9, reserve: 10,
  retry_count: 11, source_scenario: 12, step_count: 13,
};
const PUBLICATION_LOG_RANGE = "A1:N";

// Colonnes MANUAL_REQUESTS (A..M) — nouveau, alimenté par le module Pilotage Social
const MANUAL_REQUESTS_COLS = {
  request_id: 0, project_id: 1, channel: 2, source_link: 3, note_utilisateur: 4,
  requested_by: 5, requested_at: 6, status: 7, approved_by: 8, approved_at: 9,
  idea_id_genere: 10, content_ids_generes: 11, erreur: 12,
};
const MANUAL_REQUESTS_RANGE = "A1:M";
// Statuts possibles : PENDING_REVIEW, APPROVED, REJECTED, PROCESSED, FAILED

function rowToObject(row, colsMap) {
  const obj = {};
  for (const [key, idx] of Object.entries(colsMap)) {
    obj[key] = row[idx] ?? "";
  }
  return obj;
}

function objectToRow(obj, colsMap) {
  const maxIdx = Math.max(...Object.values(colsMap));
  const row = new Array(maxIdx + 1).fill("");
  for (const [key, idx] of Object.entries(colsMap)) {
    if (obj[key] !== undefined) row[idx] = obj[key];
  }
  return row;
}

module.exports = {
  SHEET_PROJECTS, SHEET_CONTENT_IDEAS, SHEET_CONTENT_QUEUE, SHEET_ASSETS,
  SHEET_PUBLICATION_LOG, SHEET_MANUAL_REQUESTS,
  PROJECTS_COLS, PROJECTS_RANGE,
  CONTENT_IDEAS_COLS, CONTENT_IDEAS_RANGE,
  CONTENT_QUEUE_COLS, CONTENT_QUEUE_RANGE,
  PUBLICATION_LOG_COLS, PUBLICATION_LOG_RANGE,
  MANUAL_REQUESTS_COLS, MANUAL_REQUESTS_RANGE,
  rowToObject, objectToRow,
};
