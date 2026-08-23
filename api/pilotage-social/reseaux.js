// Pilotage des réseaux sociaux + comptes Google — alimente l'onglet "Réseaux sociaux" de /espace-prive.
// Deux briques distinctes :
//  1) Connexions par projet (LinkedIn/Facebook/Instagram/TikTok/YouTube) : lues depuis l'onglet PROJECTS
//     du Content Engine si le Sheets est configuré, sinon liste vide + statut "non configuré".
//  2) Indexation Google (Search Console) et comptes Google utilisés : informations statiques vérifiées
//     (aucun accès API Search Console configuré à ce jour) + repères pour la suite.
const { requireSession } = require('../_lib/session');
const { readRows } = require('../_lib/sheets');
const { SHEET_PROJECTS, PROJECTS_RANGE, PROJECTS_COLS, rowToObject } = require('../_lib/schema');

const CHANNEL_FIELDS = [
  { key: 'linkedin', label: 'LinkedIn', col: 'li_org_urn' },
  { key: 'facebook', label: 'Facebook', col: 'fb_page_id' },
  { key: 'instagram', label: 'Instagram', col: 'instagram_account_id' },
  { key: 'tiktok', label: 'TikTok', col: 'tiktok_account_id' },
  { key: 'youtube', label: 'YouTube', col: 'youtube_channel_id' },
];

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Méthode non autorisée.' });
  if (!requireSession(req, res)) return;
  res.setHeader('Cache-Control', 'private, no-store');

  let projets = [];
  let sheetsConfigure = true;
  try {
    const rows = await readRows(SHEET_PROJECTS, PROJECTS_RANGE);
    projets = rows
      .map((row) => rowToObject(row, PROJECTS_COLS))
      .filter((p) => p.id)
      .map((p) => ({
        id: p.id,
        name: p.name,
        connexions: CHANNEL_FIELDS.map((c) => ({ reseau: c.label, connecte: Boolean(p[c.col]) })),
      }));
  } catch (err) {
    if (err.code === 'NOT_CONFIGURED') {
      sheetsConfigure = false;
    } else {
      return res.status(500).json({ error: 'server_error', message: String(err.message || err) });
    }
  }

  return res.status(200).json({
    sheetsConfigure,
    projets,
    comptesGoogle: {
      note: 'Deux identités Google distinctes utilisées sur le portefeuille — vérifié le 23/08/2026 via la boîte mail.',
      comptes: [
        { email: 'julien.daures@gmail.com', usage: 'Google Drive (dossier racine du projet), Google Calendar, Search Console (alertes reçues sur cette adresse), connexions "Se connecter avec Google" (Claude, Otter, Tally, etc.).' },
        { email: 'juju2364@gmail.com', usage: 'GitHub/Vercel (identité julien2364) — committer et déployer sous cette identité, sinon Vercel bloque le déploiement.' },
      ],
    },
    indexationGoogle: {
      configured: false,
      note: 'Aucun accès API Search Console connecté pour l’instant (nécessite d’ajouter le compte de service comme utilisateur sur la propriété Search Console de dyonysos.fr, même principe que pour Google Sheets).',
      alertesRecentes: [
        { date: '2026-08-19', sujet: 'Nouveau motif empêchant l’indexation de vos pages — dyonysos.fr (page en double sans URL canonique)' },
        { date: '2026-08-17', sujet: 'Nouvelles raisons empêchant l’indexation d’un sitemap — dyonysos.fr (page en double / balise)' },
      ],
    },
    reseauxSociauxOAuth: {
      configured: false,
      note: 'Publier automatiquement (au-delà du déclenchement Make déjà en place) demanderait de créer des applications développeur LinkedIn/Facebook/Instagram/TikTok et de fournir leurs identifiants — aucune app de ce type n’est enregistrée à ce jour, rien n’a été inventé ici. Les champs li_org_urn / fb_page_id / etc. dans PROJECTS restent la source de vérité actuelle par projet.',
    },
  });
};
