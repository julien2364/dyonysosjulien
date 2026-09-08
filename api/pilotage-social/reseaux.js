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
const { getAutomationStatus } = require('../_lib/automation-client');
const { GUIDE_URL, YOUTUBE_PREP, YOUTUBE_PREP_NOTE } = require('../_lib/youtube-prep-data');
const { getExternalCalendarItems } = require('../_lib/social-calendars-external');

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

  // Activepieces sur le VPS est le moteur principal. Le point de santé est public et peut donc être
  // vérifié sans stocker de secret. La liste des flux n'est jamais inventée : elle reste masquée tant
  // qu'une clé d'API en lecture seule n'est pas fournie au site.
  const moteurAutomation = await getAutomationStatus();

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
  let calendrier = { configured: sheetsConfigure, prochaines: [], banques: [], sourcesExternes: [] };
  if (sheetsConfigure) {
    let itemsContentEngine = [];
    let erreurContentEngine;
    try {
      const nomParId = {};
      projets.forEach((p) => { nomParId[p.id] = p.name; });
      const queueRows = await readRows(SHEET_CONTENT_QUEUE, CONTENT_QUEUE_RANGE);
      itemsContentEngine = queueRows
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
          source: 'contentEngine',
        }));
    } catch (err) {
      erreurContentEngine = err.code === 'NOT_CONFIGURED' ? undefined : (err.message || String(err));
    }

    // Sources externes — ajouté le 24/08/2026 : le classeur Content Engine ci-dessus est vide (import
    // xlsx jamais fait, cf. LISEZ-MOI dans Drive), mais 3 planificateurs réels et déjà remplis existent
    // en dehors de lui (Firmoscope/Prospeo ex-Propecto, Pet Stone, CVDesignPro). Lus ici en direct
    // plutôt qu'importés une fois pour rester dynamiques. Chaque source échoue proprement (403 tant que
    // Julien n'a pas partagé le fichier avec le compte de service) sans casser l'agenda global.
    const externes = await getExternalCalendarItems();
    const itemsExternesDates = [];
    const banques = [];
    externes.forEach((src) => {
      calendrier.sourcesExternes.push({
        cle: src.key, label: src.label, projet: src.projetRegistre, driveUrl: src.driveUrl,
        configured: src.configured, onglet: src.onglet, total: src.total, erreur: src.erreur,
      });
      if (!src.configured) return;
      src.items.forEach((it) => {
        if (it.programmePour) itemsExternesDates.push(it);
        else banques.push(it);
      });
    });

    calendrier = {
      configured: true,
      error: erreurContentEngine,
      prochaines: [...itemsContentEngine, ...itemsExternesDates].sort((a, b) => (a.programmePour || '9999').localeCompare(b.programmePour || '9999')),
      // Contenu réel, rédigé et prêt, mais SANS date absolue dans son fichier source (Pet Stone,
      // CVDesignPro — juste "Semaine X / Jour") : affiché à part plutôt que fusionné avec une date
      // inventée. Donner une date de départ à Julien reste le seul moyen honnête de les faire entrer
      // dans l'agenda daté ci-dessus.
      banques,
      sourcesExternes: calendrier.sourcesExternes,
    };
  }

  // Moteur Make complémentaire — connexion live si MAKE_API_TOKEN est configuré (cf. api/_lib/make-client.js),
  // sinon repli sur l'instantané vérifié le 08/09/2026 via l'app Make connectée
  // en session, pas inventé, mais figé tant que le token n'est pas posé côté Vercel).
  let makeSnapshot;
  if (isMakeConfigured()) {
    makeSnapshot = await getMakeSnapshot();
    makeSnapshot.live = true;
  } else {
    makeSnapshot = {
      configured: false,
      live: false,
      verifieLe: '2026-09-08',
      note: 'Instantané vérifié le 08/09/2026 via le compte Make connecté. Make est un moteur complémentaire ; Activepieces sur automation.dyonysos.fr est le moteur VPS principal. Le rafraîchissement Make automatique depuis ce site nécessite toujours MAKE_API_TOKEN.',
      connexionsManquantes: ['Instagram Business', 'YouTube', 'TikTok (aucun connecteur natif de publication dans Make — nécessiterait une app développeur TikTok + un jeton stocké côté Make)'],
      // apps/source/relais ajoutés le 24/08/2026 (nuit) pour un rendu visuel type "pipeline" dans le
      // dashboard (demande de Julien : "un visuel de Make et notre automation connecté derrière prêt à
      // prendre le relai sur certaines tâches") — statutCode pilote la couleur, relais dit explicitement
      // si le scénario est prêt à publier tout seul aujourd'hui ou ce qui bloque encore.
      scenarios: [
        { nom: 'Propecto Social net', statut: 'ACTIF — planifié', statutCode: 'ok', source: 'Data Store Make (calendrier Firmoscope/Prospeo)', apps: ['Facebook', 'LinkedIn', 'Instagram', 'YouTube'], relais: 'Actif et planifié au dernier contrôle ; résultat de la prochaine publication à contrôler dans l’historique Make.', detail: 'Scénario principal actif, avec deux scénarios actifs complémentaires pour l’injection et la boucle du calendrier. Aucun brouillon ou publication n’a été déclenché depuis ce tableau.' },
        { nom: 'Arbitrage Pro Social net', statut: 'DÉSACTIVÉ — 0 publication', statutCode: 'crit', source: 'arbitragepro.eu/api/social/file', apps: ['LinkedIn', 'Facebook'], relais: 'Bloqué — scénario éteint ET secret d\'authentification toujours un texte-placeholder, deux blocages cumulés.', detail: 'isActive:false, nextExec:null, ET le header d\'authentification contient toujours le texte "REMPLACER_PAR_CRON_SECRET" au lieu du vrai secret arbitragepro.eu — deux blocages cumulés, pas juste un secret à remplacer. Aucun fichier de contenu dédié Arbitrage+ trouvé par ailleurs (contrairement aux 3 autres projets).' },
        { nom: 'Pet Stone — Social Publisher', statut: 'PARTIEL — campagne J6 planifiée', statutCode: 'warn', source: 'Google Sheets — calendrier Pet Stone', apps: ['Facebook', 'LinkedIn'], relais: 'Le scénario principal est inactif ; un scénario de campagne J6 est actif et planifié, et un scénario LinkedIn reste disponible à la demande.', detail: 'État vérifié dans Make le 08/09. Ne pas assimiler les scénarios de campagne actifs à une chaîne principale entièrement opérationnelle.' },
        { nom: 'CVDesignPro — Publish social calendar', statut: 'ACTIF — planifié', statutCode: 'ok', source: 'Google Sheets — cvdesignpro-social-calendar', apps: ['LinkedIn', 'Google Drive'], relais: 'Actif et planifié au dernier contrôle. Le statut d’activation ne prouve pas à lui seul qu’une publication a abouti.', detail: 'Zéro exécution incomplète visible au contrôle du 08/09 ; l’historique d’exécution reste nécessaire pour qualifier la prochaine publication comme réussie.' },
        { nom: '[Deals Social] — publication multi-canal', statut: 'ACTIF — 4 canaux', statutCode: 'ok', source: 'Supabase arb_social_posts + zernio.com', apps: ['Facebook', 'Instagram', 'TikTok', 'YouTube'], relais: 'Quatre scénarios de publication sont actifs ; les scénarios d’ingestion sont inactifs.', detail: 'État d’activation vérifié le 08/09. La qualité et le résultat des publications restent à contrôler dans les exécutions.' },
        { nom: 'Content Engine DYONYSOS', statut: 'ABSENT DE MAKE', statutCode: 'muted', source: 'Google Sheets — Content Engine', apps: ['Google Sheets'], relais: 'Aucun scénario portant ce nom n’a été trouvé au contrôle du 08/09.', detail: 'Le projet reste suivi dans Taiga. Son éventuelle exécution sur Activepieces ne sera visible ici qu’après branchement de l’API authentifiée du VPS.' },
      ],
    };
  }

  return res.status(200).json({
    sheetsConfigure,
    moteurAutomation,
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
    // État du moteur Make complémentaire — Activepieces/VPS est exposé séparément ci-dessus.
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
