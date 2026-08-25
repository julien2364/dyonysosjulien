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
      note: 'Snapshot corrigé le 24/08/2026 au soir après vérification directe de chaque scénario via l\'API Make en session (isActive/isinvalid/nextExec + historique d\'exécutions réels — plusieurs statuts de la version précédente de ce snapshot étaient faux, notamment Propecto et Arbitrage marqués "actif" alors qu\'ils sont désactivés). Toujours pas de connexion live automatique depuis ce site (nécessite MAKE_API_TOKEN en variable d\'environnement Vercel) — ce bloc reste un instantané à rafraîchir manuellement après toute modification faite dans Make.',
      connexionsManquantes: ['Instagram Business', 'YouTube', 'TikTok (aucun connecteur natif de publication dans Make — nécessiterait une app développeur TikTok + un jeton stocké côté Make)'],
      // apps/source/relais ajoutés le 24/08/2026 (nuit) pour un rendu visuel type "pipeline" dans le
      // dashboard (demande de Julien : "un visuel de Make et notre automation connecté derrière prêt à
      // prendre le relai sur certaines tâches") — statutCode pilote la couleur, relais dit explicitement
      // si le scénario est prêt à publier tout seul aujourd'hui ou ce qui bloque encore.
      scenarios: [
        { nom: 'Propecto Social net', statut: 'DÉSACTIVÉ — 0 publication', statutCode: 'crit', source: 'Data Store Make (calendrier Firmoscope/Prospeo)', apps: ['Facebook', 'LinkedIn', 'Instagram', 'YouTube'], relais: 'Bloqué — scénario éteint (isActive:false), rien ne partira tant qu\'il n\'est pas réactivé.', detail: 'isActive:false, nextExec:null — rien n\'est programmé malgré les 120 posts prêts. Connexions Facebook/LinkedIn saines (pas expirées). Porte un flag "isinvalid" dont la cause précise reste à confirmer en tentant une réactivation dans Make (risque : ça republierait immédiatement en direct, à faire uniquement sur ton feu vert).' },
        { nom: 'Arbitrage Pro Social net', statut: 'DÉSACTIVÉ — 0 publication', statutCode: 'crit', source: 'arbitragepro.eu/api/social/file', apps: ['LinkedIn', 'Facebook'], relais: 'Bloqué — scénario éteint ET secret d\'authentification toujours un texte-placeholder, deux blocages cumulés.', detail: 'isActive:false, nextExec:null, ET le header d\'authentification contient toujours le texte "REMPLACER_PAR_CRON_SECRET" au lieu du vrai secret arbitragepro.eu — deux blocages cumulés, pas juste un secret à remplacer. Aucun fichier de contenu dédié Arbitrage+ trouvé par ailleurs (contrairement aux 3 autres projets).' },
        { nom: 'Pet Stone — Social Publisher', statut: 'ACTIF — fonctionne', statutCode: 'ok', source: 'Google Sheets — calendrier Pet Stone (46 posts)', apps: ['Facebook', 'LinkedIn'], relais: 'Prêt — prend déjà le relai seul, jusqu\'à 6 publications/jour ouvré sans intervention.', detail: 'Créé le 21/08, tourne lun-ven 10h. Une seule exécution possible depuis sa création (lundi 24/08), et elle a réussi (1/1). Traite jusqu\'à 6 posts "Prêt" par jour ouvré — les 46 posts du calendrier seront tous publiés en ~1,5 semaine sans action requise.' },
        { nom: 'CVDesignPro — Publish social calendar', statut: 'ACTIF mais échoue à chaque exécution', statutCode: 'warn', source: 'Google Sheets — cvdesignpro-social-calendar (60 posts)', apps: ['LinkedIn', 'Google Drive'], relais: 'Partiel — tourne seul tous les jours ouvrés mais échoue avant de publier ; ne prendra le relai qu\'après le correctif du module Drive.', detail: 'Tourne bien lun-ven 12h depuis le 04/08, mais échoue systématiquement (dernière fois : 24/08 22h30) sur le module de téléchargement d\'image Google Drive — erreur "Unsupported alt type media for non byte stream". Vérifié : le fichier ciblé (ex. w01-tue-buzzwords.png) existe réellement dans Drive en image/png valide, donc la cause exacte reste à confirmer via "Run this module only" dans l\'éditeur Make (30 secondes, affiche l\'ID/mimetype exact reçu).' },
        { nom: '[Deals Social] 03 — Publication multi-canal', statut: 'à identifier', statutCode: 'muted', source: 'Supabase arb_social_posts + zernio.com', apps: ['Facebook', 'LinkedIn'], relais: 'Inconnu — projet non identifié dans le registre, à clarifier avant de compter dessus.', detail: 'Scénario découvert le 24/08 en creusant les connexions Facebook/LinkedIn — poste sur une page Facebook distincte (1262454503622951) via la table Supabase "arb_social_posts" et appelle aussi zernio.com/api/v1/posts. Ni "Deals" ni "Zernio" ne sont dans le registre de projets actuel — à clarifier avec Julien : sous-marque d\'Arbitrage+, ou projet distinct non suivi ?' },
        { nom: '[CE] A/B/C/D — Content Engine générique', statut: 'inactif', statutCode: 'muted', source: 'Google Sheets — Content Engine (PROJECTS vide)', apps: ['Google Sheets'], relais: 'Bloqué — backlog, déprioritisé par Julien le 24/08.', detail: 'Bloqué tant que la feuille PROJECTS du classeur Content Engine reste vide (xlsx pas importé) — backlog, déprioritisé par Julien le 24/08.' },
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
