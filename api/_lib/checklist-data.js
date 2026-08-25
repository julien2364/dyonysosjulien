// Référentiel "Check-list projet" — ajouté le 25/08/2026 à la demande de Julien : "Sur le tableau de
// bord [...] tu me crée un nouvel onglet check list [...] Tout ce qu'il faut pour lancer un projet
// (avant lancement) [...] Tout ce qu'il faut pour suivre le lancement (démarrage) [...] Puis pilotage,
// avancement et montée en puissance [...] D'une manière générale puis tu appliques a chaque projet."
//
// Méthodologie générique (3 phases), appliquée identiquement aux 38 projets du registre. Chaque item a
// une consigne (comment le faire / ce qu'on vérifie) et une liste de documents attendus. Le statut par
// projet n'est PAS déduit automatiquement d'autres données du site (BMC, Make, Taiga...) — jamais
// inventé : chaque item démarre à "à faire" et n'évolue que si quelqu'un le renseigne explicitement
// dans cet onglet (voir api/pilotage-checklist/checklist-actions.js). Les infos déjà connues du projet
// (URL, priorité, tâches Taiga...) restent visibles en contexte dans le panneau de chaque projet, mais
// comme repère, pas comme statut de check-list.

const PHASES = [
  {
    key: 'avant_lancement',
    titre: 'Avant lancement',
    description: "Tout ce qu'il faut avoir validé avant de mettre le projet en ligne : étude de marché, personas, business model, MVP, cadre légal.",
    categories: [
      {
        key: 'marche', titre: 'Étude de marché & positionnement', items: [
          { id: 'A1', label: 'Étude de marché', consigne: "Taille du marché adressable (TAM/SAM/SOM si possible), tendances, dynamique du secteur — avec sources chiffrées, pas d'estimation à vue de nez.", documents: ['Rapport ou note d\'étude de marché', 'Sources / chiffres cités'] },
          { id: 'A2', label: 'Personas / segments clients', consigne: "2 à 4 personas cibles avec besoins, douleurs, budget, canal d'accès — assez précis pour orienter le contenu et le pricing.", documents: ['Fiches personas'] },
          { id: 'A3', label: 'Analyse concurrentielle', consigne: "Concurrents directs, indirects et facilitateurs (solutions de contournement que le client utilise faute de mieux), avec positionnement et prix de chacun.", documents: ['Tableau comparatif concurrents'] },
          { id: 'A4', label: 'Proposition de valeur / positionnement', consigne: "La promesse en une phrase, le différenciateur réel par rapport aux concurrents listés ci-dessus.", documents: ['Value proposition canvas ou équivalent'] },
        ],
      },
      {
        key: 'modele', titre: 'Modèle économique', items: [
          { id: 'B1', label: 'Business Model Canvas', consigne: "Les 9 blocs du BMC remplis et cohérents entre eux (segments, valeur, canaux, relation client, revenus, ressources, activités, partenaires, coûts).", documents: ['BMC rempli'] },
          { id: 'B2', label: 'Pricing / structure tarifaire', consigne: "Grille tarifaire définie, marge cible connue, cohérente avec le positionnement (A4) et les concurrents (A3).", documents: ['Grille tarifaire'] },
          { id: 'B3', label: 'Prévisionnel financier & seuil de rentabilité', consigne: "Prévisionnel 6-12 mois, coûts fixes/variables connus, seuil de rentabilité calculé.", documents: ['Prévisionnel (fichier chiffré)'] },
        ],
      },
      {
        key: 'produit', titre: 'Produit & MVP', items: [
          { id: 'C1', label: 'Périmètre MVP défini', consigne: "Fonctionnalités minimales listées, ce qui est explicitement hors-scope pour le lancement.", documents: ['Cahier des charges MVP'] },
          { id: 'C2', label: 'Maquettes / wireframes validés', consigne: "Parcours principal maquetté et validé avant développement (ou avant mise en avant si déjà développé).", documents: ['Maquettes (Figma ou équivalent)'] },
          { id: 'C3', label: 'Identité de marque', consigne: "Nom, logo, charte graphique (couleurs, typo) prêts et appliqués au site.", documents: ['Charte graphique', 'Fichier logo'] },
        ],
      },
      {
        key: 'legal', titre: 'Cadre légal & technique', items: [
          { id: 'D1', label: 'Aspects légaux', consigne: "CGU/CGV, mentions légales, politique de confidentialité (RGPD) publiées sur le site, adaptées à l'activité réelle.", documents: ['CGU', 'CGV', 'Politique de confidentialité'] },
          { id: 'D2', label: 'Domaine + hébergement réservés', consigne: "Nom de domaine acheté, hébergement (Vercel/OVH/...) configuré et joignable.", documents: ['Preuve d\'achat / facture domaine'] },
          { id: 'D3', label: 'Outils analytics/tracking installés', consigne: "Analytics (Vercel Web Analytics, Search Console...) posés AVANT le premier trafic — pour ne pas perdre les données de lancement.", documents: ['Capture de config analytics'] },
        ],
      },
      {
        key: 'plan_lancement', titre: 'Plan de lancement', items: [
          { id: 'E1', label: 'Plan de communication de lancement', consigne: "Calendrier des premières publications (réseaux, email, SEO) prêt avant le jour J.", documents: ['Calendrier de contenu de lancement'] },
          { id: 'E2', label: 'Budget de lancement + financement', consigne: "Budget dédié au lancement (pub, outils) connu et disponible.", documents: ['Budget de lancement'] },
        ],
      },
    ],
  },
  {
    key: 'demarrage',
    titre: 'Démarrage',
    description: "Ce qu'il faut suivre pendant les premières semaines : mise en ligne effective, premiers contenus, premiers retours.",
    categories: [
      {
        key: 'mise_en_ligne', titre: 'Mise en ligne', items: [
          { id: 'F1', label: 'Site/produit en ligne et fonctionnel', consigne: "Parcours utilisateur principal testé de bout en bout (pas juste \"la page s'affiche\") — uptime vérifié.", documents: ['Résultat du test de parcours'] },
          { id: 'F2', label: 'Automatisations connectées', consigne: "Make / CRM / emailing réellement opérationnels et vérifiés en exécution réelle (pas juste configurés).", documents: ['Lien scénario(s) Make actifs'] },
          { id: 'F3', label: 'Parcours de vente / onboarding testé', consigne: "Un client testeur a fait le parcours complet (découverte → achat/inscription → confirmation) sans blocage.", documents: ['Compte-rendu du test'] },
        ],
      },
      {
        key: 'acquisition', titre: 'Acquisition & contenu', items: [
          { id: 'G1', label: 'Premiers contenus publiés', consigne: "Réseaux sociaux et/ou SEO on-page alimentés dès le lancement, pas plusieurs semaines après.", documents: ['Calendrier / agenda de publication'] },
          { id: 'G2', label: 'Canaux d\'acquisition activés', consigne: "Au moins un canal (SEO, ads, réseaux, email) réellement actif et mesuré.", documents: ['Config du/des canal(aux) actifs'] },
          { id: 'G3', label: 'Support client mis en place', consigne: "Email, chat ou FAQ accessible — le client sait où poser une question.", documents: ['Page ou canal de support'] },
        ],
      },
      {
        key: 'suivi_demarrage', titre: 'Suivi de démarrage', items: [
          { id: 'H1', label: 'KPIs de démarrage suivis', consigne: "Visiteurs, conversions, premiers clients suivis dès le premier jour (onglet KPI de ce dashboard).", documents: ['Export ou capture des KPI de démarrage'] },
          { id: 'H2', label: 'Premiers retours clients collectés', consigne: "Au moins quelques retours qualitatifs des premiers utilisateurs/clients réels, pas des suppositions.", documents: ['Notes / verbatims clients'] },
          { id: 'H3', label: 'Ajustements rapides post-lancement', consigne: "Les bugs et frictions UX remontés dans la première semaine sont corrigés ou au moins priorisés.", documents: ['Liste des correctifs post-lancement'] },
        ],
      },
    ],
  },
  {
    key: 'pilotage',
    titre: 'Pilotage, avancement et montée en puissance',
    description: "Le rythme une fois le projet lancé : suivi récurrent, roadmap, scaling, veille, risques.",
    categories: [
      {
        key: 'pilotage_recurrent', titre: 'Pilotage récurrent', items: [
          { id: 'I1', label: 'Tableau de bord KPI mensuel', consigne: "CA, marge, coûts, trafic, conversion suivis mois par mois (pas seulement un instantané).", documents: ['Tableau de bord mensuel'] },
          { id: 'I2', label: 'Revue mensuelle objectifs vs réalisé', consigne: "Comparaison régulière entre les objectifs fixés et le réel — écarts expliqués, pas juste constatés.", documents: ['Compte-rendu de revue mensuelle'] },
          { id: 'I3', label: 'Gestion financière', consigne: "Trésorerie, rentabilité et seuil de rentabilité suivis dans la durée (lié à B3).", documents: ['Suivi de trésorerie'] },
        ],
      },
      {
        key: 'dev_produit', titre: 'Développement produit', items: [
          { id: 'J1', label: 'Roadmap produit', consigne: "Prochaines fonctionnalités priorisées, avec une logique explicite (valeur client / effort / urgence).", documents: ['Roadmap'] },
          { id: 'J2', label: 'Optimisation continue', consigne: "A/B tests, taux de conversion, SEO travaillés en continu, pas seulement au lancement.", documents: ['Résultats de tests / optimisations'] },
        ],
      },
      {
        key: 'scaling', titre: 'Scaling & organisation', items: [
          { id: 'K1', label: 'Plan de montée en puissance', consigne: "Acquisition, infrastructure technique et éventuellement équipe dimensionnées pour absorber la croissance visée.", documents: ['Plan de scaling'] },
          { id: 'K2', label: 'Documentation des processus', consigne: "Les process clés sont écrits quelque part — pas seulement dans la tête de Julien — pour permettre délégation/recrutement.", documents: ['Documentation process'] },
          { id: 'K3', label: 'Veille concurrentielle récurrente', consigne: "La veille définie en A3 est répétée dans le temps, pas faite une seule fois avant lancement.", documents: ['Notes de veille récentes'] },
        ],
      },
      {
        key: 'risques', titre: 'Risques & amélioration continue', items: [
          { id: 'L1', label: 'Points critiques suivis', consigne: "Dépendances techniques, risques financiers ou juridiques identifiés et surveillés activement — pas juste connus une fois puis oubliés.", documents: ['Liste des points critiques à jour'] },
          { id: 'L2', label: 'Axes d\'amélioration priorisés', consigne: "Les pistes d'amélioration identifiées sont classées par valeur attendue, pas juste listées en vrac.", documents: ['Liste priorisée des améliorations'] },
        ],
      },
    ],
  },
];

const STATUTS = ['a_faire', 'en_cours', 'fait', 'non_applicable'];
const STATUT_LABELS = { a_faire: 'À faire', en_cours: 'En cours', fait: 'Fait', non_applicable: 'Non applicable' };

// Deux entrées "spéciales" par projet — pas des items de check-list, du texte libre stocké dans la
// même feuille (item_id = _AMELIORATIONS / _CRITIQUES, texte dans la colonne "note").
const CHAMPS_LIBRES = [
  { id: '_AMELIORATIONS', label: "Points d'amélioration" },
  { id: '_CRITIQUES', label: 'Points critiques' },
];

function allItemIds() {
  const ids = [];
  PHASES.forEach((ph) => ph.categories.forEach((c) => c.items.forEach((it) => ids.push(it.id))));
  return ids;
}

function findItem(itemId) {
  for (const ph of PHASES) {
    for (const c of ph.categories) {
      const it = c.items.find((i) => i.id === itemId);
      if (it) return { phase: ph, categorie: c, item: it };
    }
  }
  return null;
}

module.exports = { PHASES, STATUTS, STATUT_LABELS, CHAMPS_LIBRES, allItemIds, findItem };
