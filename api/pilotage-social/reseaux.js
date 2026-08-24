// Pilotage des réseaux sociaux + comptes Google — alimente l'onglet "Réseaux sociaux" de /espace-prive.
// Deux briques distinctes :
//  1) Connexions par projet (LinkedIn/Facebook/Instagram/TikTok/YouTube) : lues depuis l'onglet PROJECTS
//     du Content Engine si le Sheets est configuré, sinon liste vide + statut "non configuré".
//  2) Indexation Google (Search Console) et comptes Google utilisés : informations statiques vérifiées
//     (aucun accès API Search Console configuré à ce jour) + repères pour la suite.
const { requireSession } = require('../_lib/session');
const { readRows } = require('../_lib/sheets');
const { SHEET_PROJECTS, PROJECTS_RANGE, PROJECTS_COLS, SHEET_CONTENT_QUEUE, CONTENT_QUEUE_RANGE, CONTENT_QUEUE_COLS, rowToObject } = require('../_lib/schema');
const { isMakeConfigured, getMakeSnapshot } = require('../_lib/make-client');
const { GUIDE_URL, YOUTUBE_PREP, YOUTUBE_PREP_NOTE } = require('../_lib/youtube-prep-data');

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
        connexions: CHANNEL_FIELDS.map((c) => ({ reseau: c.label, connecte: Boolean(p[c.col]), champ: c.col, valeur: p[c.col] || '' })),
      }));
  } catch (err) {
    if (err.code === 'NOT_CONFIGURED') {
      sheetsConfigure = false;
    } else {
      return res.status(500).json({ error: 'server_error', message: String(err.message || err) });
    }
  }

  // Agenda de publication — ajouté le 24/08/2026 à la demande de Julien ("Réseaux sociaux, je veux du
  // visuel / Agenda avec calendrier de publication [...] Toutes les données doivent être dynamiques").
  // Source réelle : l'onglet CONTENT_QUEUE du même classeur Content Engine, déjà alimenté et lu par les
  // scénarios Make de publication (channel/scheduled_at/status) — aucune donnée inventée : si la file
  // est vide, l'agenda est vide, et le dashboard l'affiche tel quel plutôt que du texte de remplissage.
  let calendrier = { configured: sheetsConfigure, prochaines: [] };
  if (sheetsConfigure) {
    try {
      const nomParId = {};
      projets.forEach((p) => { nomParId[p.id] = p.name; });
      const queueRows = await readRows(SHEET_CONTENT_QUEUE, CONTENT_QUEUE_RANGE);
      const items = queueRows
        .map((row) => rowToObject(row, CONTENT_QUEUE_COLS))
        .filter((c) => c.content_id && c.status && c.status !== 'FAILED')
        .map((c) => ({
          contentId: c.content_id,
          projetId: c.project_id,
          projet: nomParId[c.project_id] || c.project_id,
          canal: c.channel,
          statut: c.status,
          programmePour: c.scheduled_at || null,
          apercu: (c.hook || c.body || '').slice(0, 90),
        }))
        .sort((a, b) => (a.programmePour || '9999').localeCompare(b.programmePour || '9999'));
      calendrier = { configured: true, prochaines: items };
    } catch (err) {
      calendrier = { configured: false, error: err.code === 'NOT_CONFIGURED' ? undefined : (err.message || String(err)) };
    }
  }

  // Moteur Make — connexion live si MAKE_API_TOKEN est configuré (cf. api/_lib/make-client.js),
  // sinon repli sur l'instantané écrit à la main le 24/08/2026 (vérifié ce jour-là via l'API Make
  // en session, pas inventé, mais figé tant que le token n'est pas posé côté Vercel).
  let makeSnapshot;
  if (isMakeConfigured()) {
    makeSnapshot = await getMakeSnapshot();
    makeSnapshot.live = true;
  } else {
    makeSnapshot = {
      configured: false,
      live: false,
      verifieLe: '2026-08-24',
      note: 'Snapshot écrit à la main le 24/08/2026 — pas de connexion live à l\'API Make depuis ce site (nécessite MAKE_API_TOKEN en variable d\'environnement Vercel). À rafraîchir manuellement après toute modification faite dans Make tant que ce n\'est pas branché.',
      connexionsManquantes: ['Instagram Business', 'YouTube', 'TikTok (aucun connecteur natif de publication dans Make — nécessiterait une app développeur TikTok + un jeton stocké côté Make)'],
      scenarios: [
        { nom: 'Propecto — injection du calendrier', statut: 'actif', detail: 'Alimente le Data Store Propecto depuis propecto.eu/calendrier-social.json.' },
        { nom: 'Propecto Social net', statut: 'actif', detail: 'Publie réellement sur Facebook et LinkedIn. Instagram/YouTube sécurisés (no-op si pas de connexion) depuis le 24/08.' },
        { nom: 'Propecto — boucle du calendrier', statut: 'actif', detail: 'Fait avancer la semaine du calendrier chaque lundi.' },
        { nom: 'Arbitrage Pro Social net', statut: 'actif mais va échouer', detail: 'Le header d\'authentification contient encore le texte "REMPLACER_PAR_CRON_SECRET" au lieu du vrai secret — à corriger dans Make (pas modifiable depuis cette session).' },
        { nom: 'Pet Stone — Social Publisher', statut: 'actif', detail: 'Réactivé le 24/08 après vérification RPC des IDs Facebook/LinkedIn (corrects). Publie FB + LinkedIn ; Instagram/TikTok/YouTube marqués "en attente de connexion" au lieu d\'être ignorés.' },
        { nom: 'CVDesignPro — Publish social calendar', statut: 'inactif, invalide', detail: 'Bug diagnostiqué le 24/08 (erreur Google Drive côté module de téléchargement d\'image) — voir le guide de lancement pour le détail technique.' },
        { nom: '[CE] A/B/C/D — Content Engine générique', statut: 'inactif', detail: 'Bloqué tant que la feuille PROJECTS du classeur Content Engine reste vide (xlsx pas importé).' },
      ],
    };
  }

  return res.status(200).json({
    sheetsConfigure,
    calendrier,
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
    // Trouvé le 23/08/2026 en cherchant dans Drive avant de reconstruire quoi que ce soit (demande de
    // Julien) : 3 planificateurs réels et déjà remplis, séparés par projet, distincts du classeur
    // Content Engine (qui existe mais est vide — xlsx pas encore importé, voir registre). Rien n'a
    // encore été fusionné automatiquement : import à faire consciemment plutôt que par script silencieux,
    // pour ne pas écraser du contenu déjà rédigé/programmé.
    planificateursExternesTrouves: {
      note: 'Ces 3 fichiers existent déjà dans ton Drive avec du vrai contenu programmé — le Content Engine (classeur "DYONYSOS_CONTENT_ENGINE") est censé les unifier mais est encore vide. À importer plutôt qu\'à reconstruire.',
      fichiers: [
        { titre: 'P2P - Social Media Planner', description: 'Schéma déjà très proche du Content Engine (onglets Publications / Idées / Traductions / Médias / KPI).', url: 'https://docs.google.com/spreadsheets/d/1DqS5VIX7vv3HBoYbs3I-CRKVg_tQMaSNmILRz6UzIKg/edit' },
        { titre: 'Planificateur Propecto — 3 mois (C2B & B2B)', description: '120 contenus déjà rédigés (60 C2B + 60 B2B), calendrier du 24/08 au 13/11/2026, textes LinkedIn/Facebook/Instagram/TikTok/YouTube prêts, statut "Prêt à programmer".', url: 'https://docs.google.com/spreadsheets/d/13JczIOdEbVshRJ5RW0ewhYvnWwIi93emKtHunATUfKU/edit' },
        { titre: 'cvdesignpro-social-calendar', description: 'Calendrier hebdomadaire avec statut réel (plusieurs posts déjà marqués "Posted") — historique de ce qui a été publié pour CVDesignPro.', url: 'https://docs.google.com/spreadsheets/d/15X1j5LgV7-4q8TJ98QikX-HdLQYQJ3ggKD4ZvbHK_S8/edit' },
      ],
    },
    // État du moteur Make — ajouté le 24/08/2026 à la demande de Julien ("Moteur Make / Je veux voir ça",
    // montré via une capture de sa vraie liste de scénarios). Connexion live à l'API Make si
    // MAKE_API_TOKEN est configuré côté Vercel ; sinon repli sur l'instantané écrit à la main le 24/08.
    moteurMake: makeSnapshot,
    // Chaînes YouTube — ajouté le 24/08/2026 en réponse à la demande de Julien ("créer les canaux
    // youtube [...] inclure dans les automations [...] met à jour le dashboard"). Créer un compte
    // YouTube n'est pas une action que Claude peut faire à la place de Julien (création de compte) —
    // ci-dessous uniquement l'état réel du pipeline de logos (vérifié le 24/08) + le guide pas-à-pas
    // pour que Julien crée les chaînes lui-même et colle ensuite l'ID dans le champ youtube_channel_id
    // ci-dessus (même mécanisme que li_org_urn/fb_page_id — déjà en place, rien à ajouter côté code).
    chainesYoutube: {
      guideUrl: GUIDE_URL,
      note: YOUTUBE_PREP_NOTE,
      projets: YOUTUBE_PREP,
    },
  });
};
