// Objectifs (prévisions) réels — seule source de données "objectifs" existant à ce jour sur le
// portefeuille. Transcrits le 24/08/2026 depuis l'e-mail que Julien s'est envoyé à lui-même le
// 21/08/2026 : "CORRECTION — Prévisions 7 à 189 jours — CVDesignPro, ArbitragePro+ et Propecto"
// (thread Gmail 1a02267d7cdc1fac, corps en texte brut relu intégralement — chaque chiffre ci-dessous
// est recopié tel quel, aucun n'est extrapolé ou inventé).
//
// Portée volontairement limitée : SEULS ces 3 projets ont un jeu d'objectifs chiffrés. Les 35 autres
// projets du portefeuille n'en ont aucun — le dashboard doit l'afficher explicitement plutôt que de
// laisser croire à une couverture complète (consigne de Julien : "toutes les données doivent être
// dynamiques, je veux pas du texte écrit si tu n'as pas compris").
//
// "P" = valeur de la période depuis le jalon précédent, "cumul" = cumulé depuis le 21/08/2026.
// Adhésions = nouveaux abonnés payants (décimales = espérance statistique, ex. 0,6 ≈ 60% de proba
// d'une 1ère vente sur la période). CA = encaissements bruts, hors TVA/frais Stripe/remboursements.

const OBJECTIFS_SOURCE = {
  emailSujet: 'CORRECTION — Prévisions 7 à 189 jours — CVDesignPro, ArbitragePro+ et Propecto',
  emailDate: '2026-08-21',
  auteur: 'julien.daures@gmail.com',
  threadGmailId: '1a02267d7cdc1fac',
  hypotheses: [
    "Aucune publicité payante ; publications sociales et mailing déjà réalisés ; SEO poursuivi.",
    "Paiement normal activé au plus tard le 31/08 pour ArbitragePro+ et le 02/09 pour Propecto.",
    "Les 5 millions de pages Propecto sont considérées comme réellement « indexées/valides » dans Search Console.",
    "Effet des applications mobiles intégré seulement à partir de J90 (scénario normal) / J60 (optimiste), sans revenu mobile séparé.",
    "CVDesignPro : 12,99 €/mois ; taux de renouvellement mensuel modélisé à 35% / 50% / 65% selon le scénario.",
  ],
  conditionsValidite: [
    "Si le paiement n'est pas actif aux dates prévues, décaler tout le CA d'autant.",
    "Si les 5 millions d'URL Propecto sont seulement découvertes/soumises et non valides-indexées, retenir le scénario pessimiste.",
  ],
};

// Chaque point : { horizon, date, visites:{p,cumul}, adhesions:{p,cumul}, ca:{p,cumul} }
const CVDESIGNPRO = {
  pessimiste: [
    { horizon: 'J7', date: '2026-08-28', visites: { p: 120, cumul: 120 }, adhesions: { p: 0.1, cumul: 0.1 }, ca: { p: 1, cumul: 1 } },
    { horizon: 'J15', date: '2026-09-05', visites: { p: 140, cumul: 260 }, adhesions: { p: 0.1, cumul: 0.2 }, ca: { p: 2, cumul: 3 } },
    { horizon: 'J30', date: '2026-09-20', visites: { p: 260, cumul: 520 }, adhesions: { p: 0.3, cumul: 0.5 }, ca: { p: 4, cumul: 7 } },
    { horizon: 'J60', date: '2026-10-20', visites: { p: 430, cumul: 950 }, adhesions: { p: 0.6, cumul: 1.1 }, ca: { p: 10, cumul: 17 } },
    { horizon: 'J90', date: '2026-11-19', visites: { p: 400, cumul: 1350 }, adhesions: { p: 0.6, cumul: 1.8 }, ca: { p: 11, cumul: 29 } },
    { horizon: 'J189', date: '2027-02-26', visites: { p: 1650, cumul: 3000 }, adhesions: { p: 3.0, cumul: 4.7 }, ca: { p: 56, cumul: 85 } },
  ],
  normal: [
    { horizon: 'J7', date: '2026-08-28', visites: { p: 350, cumul: 350 }, adhesions: { p: 0.6, cumul: 0.6 }, ca: { p: 8, cumul: 8 } },
    { horizon: 'J15', date: '2026-09-05', visites: { p: 400, cumul: 750 }, adhesions: { p: 0.9, cumul: 1.5 }, ca: { p: 11, cumul: 20 } },
    { horizon: 'J30', date: '2026-09-20', visites: { p: 850, cumul: 1600 }, adhesions: { p: 2.4, cumul: 3.9 }, ca: { p: 31, cumul: 51 } },
    { horizon: 'J60', date: '2026-10-20', visites: { p: 1700, cumul: 3300 }, adhesions: { p: 5.4, cumul: 9.3 }, ca: { p: 96, cumul: 146 } },
    { horizon: 'J90', date: '2026-11-19', visites: { p: 1900, cumul: 5200 }, adhesions: { p: 6.7, cumul: 16.0 }, ca: { p: 134, cumul: 281 } },
    { horizon: 'J189', date: '2027-02-26', visites: { p: 6800, cumul: 12000 }, adhesions: { p: 27.2, cumul: 43.2 }, ca: { p: 635, cumul: 916 } },
  ],
  optimiste: [
    { horizon: 'J7', date: '2026-08-28', visites: { p: 850, cumul: 850 }, adhesions: { p: 2.6, cumul: 2.6 }, ca: { p: 33, cumul: 33 } },
    { horizon: 'J15', date: '2026-09-05', visites: { p: 1050, cumul: 1900 }, adhesions: { p: 4.2, cumul: 6.8 }, ca: { p: 55, cumul: 88 } },
    { horizon: 'J30', date: '2026-09-20', visites: { p: 2400, cumul: 4300 }, adhesions: { p: 12.0, cumul: 18.8 }, ca: { p: 156, cumul: 244 } },
    { horizon: 'J60', date: '2026-10-20', visites: { p: 5500, cumul: 9800 }, adhesions: { p: 35.8, cumul: 54.5 }, ca: { p: 623, cumul: 866 } },
    { horizon: 'J90', date: '2026-11-19', visites: { p: 6700, cumul: 16500 }, adhesions: { p: 50.2, cumul: 104.8 }, ca: { p: 1058, cumul: 1924 } },
    { horizon: 'J189', date: '2027-02-26', visites: { p: 28500, cumul: 45000 }, adhesions: { p: 242.3, cumul: 347.0 }, ca: { p: 6654, cumul: 8578 } },
  ],
};

const ARBITRAGEPRO_PLUS = {
  pessimiste: [
    { horizon: 'J7', date: '2026-08-28', visites: { p: 80, cumul: 80 }, adhesions: { p: 0.0, cumul: 0.0 }, ca: { p: 0, cumul: 0 } },
    { horizon: 'J15', date: '2026-09-05', visites: { p: 100, cumul: 180 }, adhesions: { p: 0.0, cumul: 0.0 }, ca: { p: 0, cumul: 0 } },
    { horizon: 'J30', date: '2026-09-20', visites: { p: 200, cumul: 380 }, adhesions: { p: 0.0, cumul: 0.0 }, ca: { p: 0, cumul: 0 } },
    { horizon: 'J60', date: '2026-10-20', visites: { p: 320, cumul: 700 }, adhesions: { p: 0.4, cumul: 0.4 }, ca: { p: 30, cumul: 30 } },
    { horizon: 'J90', date: '2026-11-19', visites: { p: 300, cumul: 1000 }, adhesions: { p: 0.5, cumul: 0.9 }, ca: { p: 65, cumul: 95 } },
    { horizon: 'J189', date: '2027-02-26', visites: { p: 1200, cumul: 2200 }, adhesions: { p: 2.6, cumul: 3.6 }, ca: { p: 485, cumul: 580 } },
  ],
  normal: [
    { horizon: 'J7', date: '2026-08-28', visites: { p: 220, cumul: 220 }, adhesions: { p: 0.0, cumul: 0.0 }, ca: { p: 0, cumul: 0 } },
    { horizon: 'J15', date: '2026-09-05', visites: { p: 280, cumul: 500 }, adhesions: { p: 0.4, cumul: 0.4 }, ca: { p: 40, cumul: 40 } },
    { horizon: 'J30', date: '2026-09-20', visites: { p: 600, cumul: 1100 }, adhesions: { p: 1.8, cumul: 2.2 }, ca: { p: 173, cumul: 213 } },
    { horizon: 'J60', date: '2026-10-20', visites: { p: 1300, cumul: 2400 }, adhesions: { p: 5.2, cumul: 7.4 }, ca: { p: 680, cumul: 893 } },
    { horizon: 'J90', date: '2026-11-19', visites: { p: 1400, cumul: 3800 }, adhesions: { p: 6.3, cumul: 13.7 }, ca: { p: 1183, cumul: 2077 } },
    { horizon: 'J189', date: '2027-02-26', visites: { p: 4700, cumul: 8500 }, adhesions: { p: 25.8, cumul: 39.6 }, ca: { p: 7545, cumul: 9621 } },
  ],
  optimiste: [
    { horizon: 'J7', date: '2026-08-28', visites: { p: 500, cumul: 500 }, adhesions: { p: 1.4, cumul: 1.4 }, ca: { p: 160, cumul: 160 } },
    { horizon: 'J15', date: '2026-09-05', visites: { p: 600, cumul: 1100 }, adhesions: { p: 3.3, cumul: 4.7 }, ca: { p: 370, cumul: 530 } },
    { horizon: 'J30', date: '2026-09-20', visites: { p: 1400, cumul: 2500 }, adhesions: { p: 9.8, cumul: 14.5 }, ca: { p: 1098, cumul: 1627 } },
    { horizon: 'J60', date: '2026-10-20', visites: { p: 2500, cumul: 5000 }, adhesions: { p: 20.0, cumul: 34.5 }, ca: { p: 3704, cumul: 5332 } },
    { horizon: 'J90', date: '2026-11-19', visites: { p: 2800, cumul: 7800 }, adhesions: { p: 25.2, cumul: 59.7 }, ca: { p: 6156, cumul: 11488 } },
    { horizon: 'J189', date: '2027-02-26', visites: { p: 7200, cumul: 15000 }, adhesions: { p: 72.0, cumul: 131.7 }, ca: { p: 32332, cumul: 43820 } },
  ],
};

const PROPECTO = {
  pessimiste: [
    { horizon: 'J7', date: '2026-08-28', visites: { p: 500, cumul: 500 }, adhesions: { p: 0.0, cumul: 0.0 }, ca: { p: 0, cumul: 0 } },
    { horizon: 'J15', date: '2026-09-05', visites: { p: 700, cumul: 1200 }, adhesions: { p: 0.0, cumul: 0.0 }, ca: { p: 0, cumul: 0 } },
    { horizon: 'J30', date: '2026-09-20', visites: { p: 1800, cumul: 3000 }, adhesions: { p: 0.0, cumul: 0.0 }, ca: { p: 0, cumul: 0 } },
    { horizon: 'J60', date: '2026-10-20', visites: { p: 4000, cumul: 7000 }, adhesions: { p: 0.3, cumul: 0.3 }, ca: { p: 9, cumul: 9 } },
    { horizon: 'J90', date: '2026-11-19', visites: { p: 5000, cumul: 12000 }, adhesions: { p: 0.6, cumul: 0.9 }, ca: { p: 25, cumul: 34 } },
    { horizon: 'J189', date: '2027-02-26', visites: { p: 23000, cumul: 35000 }, adhesions: { p: 3.4, cumul: 4.4 }, ca: { p: 237, cumul: 271 } },
  ],
  normal: [
    { horizon: 'J7', date: '2026-08-28', visites: { p: 1500, cumul: 1500 }, adhesions: { p: 0.0, cumul: 0.0 }, ca: { p: 0, cumul: 0 } },
    { horizon: 'J15', date: '2026-09-05', visites: { p: 2500, cumul: 4000 }, adhesions: { p: 0.1, cumul: 0.1 }, ca: { p: 6, cumul: 6 } },
    { horizon: 'J30', date: '2026-09-20', visites: { p: 8000, cumul: 12000 }, adhesions: { p: 1.4, cumul: 1.6 }, ca: { p: 63, cumul: 69 } },
    { horizon: 'J60', date: '2026-10-20', visites: { p: 23000, cumul: 35000 }, adhesions: { p: 5.8, cumul: 7.3 }, ca: { p: 313, cumul: 382 } },
    { horizon: 'J90', date: '2026-11-19', visites: { p: 30000, cumul: 65000 }, adhesions: { p: 9.0, cumul: 16.3 }, ca: { p: 668, cumul: 1050 } },
    { horizon: 'J189', date: '2027-02-26', visites: { p: 115000, cumul: 180000 }, adhesions: { p: 46.0, cumul: 62.3 }, ca: { p: 5609, cumul: 6659 } },
  ],
  optimiste: [
    { horizon: 'J7', date: '2026-08-28', visites: { p: 5000, cumul: 5000 }, adhesions: { p: 0.3, cumul: 0.3 }, ca: { p: 19, cumul: 19 } },
    { horizon: 'J15', date: '2026-09-05', visites: { p: 9000, cumul: 14000 }, adhesions: { p: 1.8, cumul: 2.1 }, ca: { p: 106, cumul: 125 } },
    { horizon: 'J30', date: '2026-09-20', visites: { p: 26000, cumul: 40000 }, adhesions: { p: 7.8, cumul: 9.9 }, ca: { p: 460, cumul: 585 } },
    { horizon: 'J60', date: '2026-10-20', visites: { p: 80000, cumul: 120000 }, adhesions: { p: 36.0, cumul: 45.9 }, ca: { p: 2663, cumul: 3248 } },
    { horizon: 'J90', date: '2026-11-19', visites: { p: 110000, cumul: 230000 }, adhesions: { p: 66.0, cumul: 111.9 }, ca: { p: 6344, cumul: 9591 } },
    { horizon: 'J189', date: '2027-02-26', visites: { p: 470000, cumul: 700000 }, adhesions: { p: 352.5, cumul: 464.4 }, ca: { p: 59969, cumul: 69561 } },
  ],
};

// Lien vers le registre (api/_lib/registry.js) : nom exact utilisé là-bas + vercelProjectId pour
// pouvoir croiser avec TRAFIC_SNAPSHOT (api/_lib/kpi-data.js) sans dépendre d'un id qui n'existe pas
// dans le registre.
const OBJECTIFS = [
  { projet: 'CVDesignPro', registreNom: 'CVDesignPro', vercelProjectId: 'prj_sbz1BpKKEmUMe1qLASFYIFahRxKA', scenarios: CVDESIGNPRO },
  { projet: 'ArbitragePro+', registreNom: 'Arbitrage+', vercelProjectId: 'prj_YNDpcwcBx3TfwNUF3TFDpTF6U8YJ', scenarios: ARBITRAGEPRO_PLUS },
  { projet: 'Propecto', registreNom: 'Firmoscope / Prospeo (ex-Propecto)', vercelProjectId: 'prj_iTUKEu3BUVEGJpxm9nS0Km7vjIUs', scenarios: PROPECTO },
];

// Cumuls à J189 par scénario, tous projets confondus — recopiés tels quels de l'e-mail (colonne
// "Cumul des trois solutions à J189"), pas recalculés ici pour éviter tout écart d'arrondi.
const OBJECTIFS_CUMUL_J189 = {
  pessimiste: { visites: 40200, adhesions: 12.7, ca: 936 },
  normal: { visites: 200500, adhesions: 145.1, ca: 17196 },
  optimiste: { visites: 760000, adhesions: 943.1, ca: 121958 },
};

module.exports = { OBJECTIFS_SOURCE, OBJECTIFS, OBJECTIFS_CUMUL_J189 };
