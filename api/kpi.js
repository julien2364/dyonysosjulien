// KPI — vue chiffrée d'ensemble, alimente l'onglet "KPI" de /espace-prive.
// Portefeuille : calculé en direct depuis le registre (api/_lib/registry.js).
// Trafic : snapshot RÉEL tiré de Vercel Web Analytics le 23/08/2026 (via le compte Vercel de Julien,
// équipe Dyonysos) — pas un accès live depuis le site en production (il faudrait un VERCEL_API_TOKEN
// en variable d'environnement + le code d'appel API Vercel ; voir note "commentPasserEnLive" ci-dessous).
// Rien n'est extrapolé au-delà de ce que l'API Vercel a renvoyé.
const { requireSession } = require('./_lib/session');
const { PROJECTS } = require('./_lib/registry');
const { TRAFIC_SNAPSHOT } = require('./_lib/kpi-data');
const { getTotaux } = require('./_lib/finance-data');
const { OBJECTIFS_SOURCE, OBJECTIFS, OBJECTIFS_CUMUL_J189, objectifInterpoleAujourdhui, METRIQUES, SCENARIOS } = require('./_lib/kpi-objectifs-data');
const { getAvancementPortefeuille } = require('./_lib/taiga-client');

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Méthode non autorisée.' });
  if (!requireSession(req, res)) return;
  res.setHeader('Cache-Control', 'private, no-store');

  // Avancement live — ajouté le 24/08/2026 ("je veux que tu recalcules tout suivant l'avancé des
  // projets [...] tout en dynamique [...] indiqué dans les autres onglets"). Source = Taiga en
  // direct (api/_lib/taiga-client.js), pas les champs taches[]/etat statiques du registre — ce même
  // bloc est repris tel quel dans Finance et Stratégie pour rester cohérent partout.
  const avancement = await getAvancementPortefeuille(PROJECTS.map((p) => p.name));

  const total = PROJECTS.length;
  const actifs = PROJECTS.filter(p => p.url).length;
  const avecGithub = PROJECTS.filter(p => p.github).length;
  const avecDrive = PROJECTS.filter(p => p.drive).length;
  const avecLocal = PROJECTS.filter(p => p.local).length;
  const aNettoyer = PROJECTS.filter(p => p.categorie === 'À nettoyer').length;
  const aIdentifier = PROJECTS.filter(p => p.categorie === 'À identifier').length;
  const urgents = PROJECTS.filter(p => p.priorite && p.priorite.startsWith('urgent')).map(p => ({ name: p.name, priorite: p.priorite }));

  const parCategorie = {};
  PROJECTS.forEach(p => { parCategorie[p.categorie] = (parCategorie[p.categorie] || 0) + 1; });

  return res.status(200).json({
    updatedAt: '2026-08-23',
    portefeuille: { total, actifs, avecGithub, avecDrive, avecLocal, aNettoyer, aIdentifier, parCategorie, urgents },
    avancement,
    trafic: TRAFIC_SNAPSHOT,
    indexation: {
      configured: false,
      note: 'Pas encore d’accès API Search Console — voici les alertes reçues par email, en attendant.',
      alertesRecentes: [
        { date: '2026-08-19', site: 'dyonysos.fr', sujet: 'Page en double sans URL canonique' },
        { date: '2026-08-17', site: 'dyonysos.fr', sujet: 'Page en double + balise — nouveau motif sur le sitemap' },
      ],
    },
    finance: { configured: true, note: 'Voir l’onglet Finance — total retenu calculé sur ~1 semaine de transactions Qonto réelles, pas un KPI mensuel stabilisé. Compte Stripe créé le 12-18/08, premier produit récurrent le 17/08 — clé API pas encore fournie.' },
    couts: (() => {
      const { total: totalGlobal, parFournisseur } = getTotaux();
      return {
        totalGlobal,
        parFournisseur,
        parProjet: {},
        note: 'Coût global et par fournisseur = mêmes chiffres réels que l’onglet Finance (source Qonto, ~1 semaine d’historique). Le détail par projet reste vide tant que les dépenses ne sont pas taguées à un projet.',
      };
    })(),
    domaine: { nom: 'dyonysos.fr', registrar: 'IONOS', renouvellement: 'Prolongé avec succès (confirmation email du 20/08/2026)' },
    // Tableau croisé dynamique — ajouté le 24/08/2026 en réponse directe à la remarque de Julien
    // ("Kpi tu n'as pas ce qui est demandé tableau croisé dynamique"). Deux jeux de données réels,
    // croisés par projet :
    //  - "objectifs" : les prévisions 7-189j du 21/08/2026 (e-mail relu intégralement, voir
    //    api/_lib/kpi-objectifs-data.js) — seuls CVDesignPro, ArbitragePro+ et Propecto en ont.
    //  - "reel" : le même TRAFIC_SNAPSHOT que ci-dessus (Vercel Web Analytics, 23/08/2026), la plupart
    //    du temps limité à une seule période "30j" (pas une vraie série temporelle).
    // Pour tout autre projet du portefeuille, aDesObjectifs / aDuTraficReel valent false — affiché tel
    // quel côté dashboard plutôt que du texte de remplissage (consigne explicite de Julien).
    tcd: (() => {
      const objectifsParNom = {};
      OBJECTIFS.forEach((o) => { objectifsParNom[o.registreNom] = o; });
      const traficParNom = {};
      TRAFIC_SNAPSHOT.parProjet.forEach((t) => { traficParNom[t.name] = t; });

      const projets = PROJECTS.map((p) => {
        // Le nom du projet dans TRAFIC_SNAPSHOT ne correspond pas toujours mot pour mot au registre
        // (ex. "Firmoscope / Prospeo" vs "Firmoscope / Prospeo (ex-Propecto)") — on rapproche donc
        // aussi par vercelProjectId quand les noms diffèrent, sans jamais inventer de correspondance.
        let traf = traficParNom[p.name];
        if (!traf && p.vercelProjectId) traf = TRAFIC_SNAPSHOT.parProjet.find((t) => t.vercelProjectId === p.vercelProjectId);
        const obj = objectifsParNom[p.name];
        return {
          nom: p.name,
          aDesObjectifs: Boolean(obj),
          aDuTraficReel: Boolean(traf),
          nomTraficReel: traf ? traf.name : null,
          periodesTraficDisponibles: traf ? Object.keys(traf.periodes) : [],
        };
      });

      const aujourdhui = new Date().toISOString().slice(0, 10);
      // Point "aujourd'hui" recalculé à chaque appel (pas figé) — cf. commentaire dans
      // kpi-objectifs-data.js. Ajouté le 24/08/2026 : "recalcule tout en dynamique, chaque évolution
      // projet a un impact". Le réel n'existe que pour "visites" (Vercel Web Analytics) — aucune
      // mesure d'adhésions/CA n'est branchée nulle part (pas de Stripe live), donc pas de "réel"
      // inventé pour ces deux métriques : le graphe côté client doit l'afficher comme non mesuré.
      const objectifsAvecAujourdhui = OBJECTIFS.map((o) => {
        const traf = traficParNom[o.registreNom] || (o.vercelProjectId ? TRAFIC_SNAPSHOT.parProjet.find((t) => t.vercelProjectId === o.vercelProjectId) : null);
        return {
          ...o,
          aujourdhui: objectifInterpoleAujourdhui(o, aujourdhui),
          reelVisites30j: traf && traf.periodes['30j'] ? traf.periodes['30j'].visiteurs : null,
        };
      });

      return {
        source: OBJECTIFS_SOURCE,
        dateDepart: OBJECTIFS_SOURCE.emailDate,
        aujourdhui,
        metriques: [
          { cle: 'visites', label: 'Visites' },
          { cle: 'adhesions', label: 'Adhésions payantes' },
          { cle: 'ca', label: 'CA (€)' },
        ],
        scenarios: SCENARIOS,
        projets,
        objectifsParProjet: objectifsAvecAujourdhui,
        traficParProjet: TRAFIC_SNAPSHOT.parProjet,
        cumulJ189: OBJECTIFS_CUMUL_J189,
        note: `Seuls ${OBJECTIFS.length} projets sur ${PROJECTS.length} ont des objectifs chiffrés réels (e-mail du 21/08/2026) — les autres n'en ont aucun, ce n'est pas un oubli d'affichage. Le point "aujourd'hui" est recalculé à chaque chargement par interpolation entre les jalons de l'e-mail — le "réel" visites vient du même instantané Vercel Web Analytics que ci-dessus (23/08/2026, pas une série live) ; adhésions et CA n'ont aucune mesure réelle branchée (pas de connexion Stripe), donc aucun "réel" n'est affiché pour ces deux métriques.`,
      };
    })(),
  });
};
