// Planificateurs réseaux sociaux RÉELS trouvés dans Drive le 24/08/2026, séparés du classeur Content
// Engine (encore vide, bloqué par un import xlsx que Julien doit faire lui-même). Ces 3 fichiers
// contiennent du contenu déjà rédigé — 120 posts Firmoscope/Prospeo (ex-Propecto), 46 posts Pet
// Stone, 60 posts CVDesignPro — vérifiés ligne par ligne le 24/08. Lus ici EN DIRECT depuis leur
// classeur d'origine (pas copiés/importés) pour rester dynamiques : toute modification faite par
// Julien dans un de ces fichiers Drive se répercute au prochain chargement du dashboard.
//
// Prérequis : chaque classeur doit être partagé en lecture avec le compte de service
// (GOOGLE_SERVICE_ACCOUNT_EMAIL — valeur dans Vercel > Settings > Environment Variables, même
// compte déjà utilisé pour le classeur Content Engine). Tant qu'un fichier n'est pas partagé,
// sa source revient avec configured:false + le message d'erreur Google tel quel — jamais une
// exception qui casserait tout l'agenda.
//
// L'onglet exact de chaque classeur n'est pas codé en dur (Julien peut le renommer) : on liste les
// onglets réels puis on retient le premier dont l'en-tête contient les colonnes attendues.
const { listSheetTitles, readSheetWithHeader } = require('./sheets');

function normaliser(s) {
  return String(s || '')
    .normalize('NFD').replace(/[̀-ͯ]/g, '') // accents
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '');
}

function trouverColonne(headerNorm, token) {
  const t = normaliser(token);
  return headerNorm.findIndex((h) => h.includes(t));
}

const SOURCES = [
  {
    key: 'propecto',
    label: 'Firmoscope / Prospeo — Communication omnicanale 3 mois (ex-Propecto)',
    projetRegistre: 'Firmoscope / Prospeo (ex-Propecto)',
    spreadsheetId: '13JczIOdEbVshRJ5RW0ewhYvnWwIi93emKtHunATUfKU',
    driveUrl: 'https://docs.google.com/spreadsheets/d/13JczIOdEbVshRJ5RW0ewhYvnWwIi93emKtHunATUfKU/edit',
    signature: ['date', 'statut', 'accroche'],
    normaliserLigne(headerNorm, row, index) {
      const idxId = trouverColonne(headerNorm, 'id');
      const idxDate = trouverColonne(headerNorm, 'date');
      const idxHeure = trouverColonne(headerNorm, 'heure');
      const idxAccroche = trouverColonne(headerNorm, 'accroche');
      const idxStatut = trouverColonne(headerNorm, 'statut');
      const date = idxDate >= 0 ? (row[idxDate] || '') : '';
      if (!date) return null; // ligne vide/hors grille
      const heure = idxHeure >= 0 ? (row[idxHeure] || '') : '';
      return {
        contentId: idxId >= 0 ? row[idxId] : `propecto-${index}`,
        canal: 'Multi (LinkedIn/Facebook/Instagram/TikTok/YouTube)',
        statut: idxStatut >= 0 ? row[idxStatut] : '',
        programmePour: heure ? `${date}T${heure.length === 5 ? heure : heure.padStart(5, '0')}` : date,
        periodeRelative: null,
        apercu: idxAccroche >= 0 ? String(row[idxAccroche] || '').slice(0, 90) : '',
      };
    },
  },
  {
    key: 'petStone',
    label: 'Pet Stone — Calendrier réseaux sociaux (source données, 46 posts)',
    projetRegistre: 'Pet Stone',
    spreadsheetId: '1uNt273x4qAQA3yXi9oijSEv04SLzdGWXcKZAUj6jsaA',
    driveUrl: 'https://docs.google.com/spreadsheets/d/1uNt273x4qAQA3yXi9oijSEv04SLzdGWXcKZAUj6jsaA/edit',
    signature: ['semaine', 'jour', 'statut'],
    normaliserLigne(headerNorm, row, index) {
      const idxSemaine = trouverColonne(headerNorm, 'semaine');
      const idxJour = trouverColonne(headerNorm, 'jour');
      const idxPlateforme = trouverColonne(headerNorm, 'plateforme');
      const idxCaption = trouverColonne(headerNorm, 'caption');
      const idxStatut = trouverColonne(headerNorm, 'statut');
      const semaine = idxSemaine >= 0 ? row[idxSemaine] : '';
      const jour = idxJour >= 0 ? row[idxJour] : '';
      if (!semaine && !jour) return null;
      return {
        contentId: `petstone-${index}`,
        canal: idxPlateforme >= 0 ? row[idxPlateforme] : '',
        statut: idxStatut >= 0 ? row[idxStatut] : '',
        programmePour: null, // pas de date absolue dans ce fichier — pas d'invention de date ici
        periodeRelative: `Semaine ${semaine} — ${jour}`,
        apercu: idxCaption >= 0 ? String(row[idxCaption] || '').slice(0, 90) : '',
      };
    },
  },
  {
    key: 'cvdesignpro',
    label: 'cvdesignpro-social-calendar',
    projetRegistre: 'CVDesignPro',
    spreadsheetId: '15X1j5LgV7-4q8TJ98QikX-HdLQYQJ3ggKD4ZvbHK_S8',
    driveUrl: 'https://docs.google.com/spreadsheets/d/15X1j5LgV7-4q8TJ98QikX-HdLQYQJ3ggKD4ZvbHK_S8/edit',
    signature: ['week', 'day', 'status'],
    normaliserLigne(headerNorm, row, index) {
      const idxWeek = trouverColonne(headerNorm, 'week');
      const idxDay = trouverColonne(headerNorm, 'day');
      const idxPlatform = trouverColonne(headerNorm, 'platform');
      const idxHook = trouverColonne(headerNorm, 'hook');
      const idxStatus = trouverColonne(headerNorm, 'status');
      const week = idxWeek >= 0 ? row[idxWeek] : '';
      const day = idxDay >= 0 ? row[idxDay] : '';
      if (!week && !day) return null;
      return {
        contentId: `cvdesignpro-${index}`,
        canal: idxPlatform >= 0 ? row[idxPlatform] : '',
        statut: idxStatus >= 0 ? row[idxStatus] : '(pas encore programmé)',
        programmePour: null, // pas de date absolue dans ce fichier
        periodeRelative: `${week} — ${day}`,
        apercu: idxHook >= 0 ? String(row[idxHook] || '').slice(0, 90) : '',
      };
    },
  },
];

// Cherche, parmi tous les onglets d'un classeur, le premier dont l'en-tête contient toutes les
// colonnes attendues par la source (normalisé, insensible aux accents/majuscules/espaces).
async function trouverOngletEtLire(source) {
  const onglets = await listSheetTitles(source.spreadsheetId);
  for (const onglet of onglets) {
    let header, rows;
    try {
      ({ header, rows } = await readSheetWithHeader(onglet, 'A1:AZ5000', source.spreadsheetId));
    } catch (e) {
      continue; // onglet illisible (rare) — essaie le suivant
    }
    if (!header.length) continue;
    const headerNorm = header.map(normaliser);
    const ok = source.signature.every((tok) => headerNorm.some((h) => h.includes(normaliser(tok))));
    if (ok) return { onglet, headerNorm, rows };
  }
  return null;
}

// Lit les 3 sources externes en parallèle. Ne lève jamais — chaque source renvoie soit ses items
// normalisés (configured:true), soit une erreur lisible (configured:false) sans casser les autres.
async function getExternalCalendarItems() {
  const resultats = await Promise.all(
    SOURCES.map(async (source) => {
      try {
        const trouve = await trouverOngletEtLire(source);
        if (!trouve) {
          return { key: source.key, label: source.label, projetRegistre: source.projetRegistre, driveUrl: source.driveUrl, configured: false, erreur: 'Aucun onglet ne correspond au format attendu (colonnes ' + source.signature.join('/') + ' introuvables) — le fichier a peut-être été restructuré.' };
        }
        const items = trouve.rows
          .map((row, i) => source.normaliserLigne(trouve.headerNorm, row, i))
          .filter(Boolean)
          .map((it) => ({ ...it, projetId: source.projetRegistre, projet: source.projetRegistre, source: source.key }));
        return { key: source.key, label: source.label, projetRegistre: source.projetRegistre, driveUrl: source.driveUrl, configured: true, onglet: trouve.onglet, total: items.length, items };
      } catch (err) {
        // Cas le plus probable tant que Julien n'a pas partagé le fichier avec le compte de service :
        // erreur Google 403 "The caller does not have permission" — remontée telle quelle.
        return { key: source.key, label: source.label, projetRegistre: source.projetRegistre, driveUrl: source.driveUrl, configured: false, erreur: err.code === 'NOT_CONFIGURED' ? err.message : (err.message || String(err)) };
      }
    })
  );
  return resultats;
}

module.exports = { getExternalCalendarItems, SOURCES };
