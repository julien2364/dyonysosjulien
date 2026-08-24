// Préparation des chaînes YouTube — ajouté le 24/08/2026 en réponse directe à la demande de Julien
// ("créer les canaux youtube [...] inclure dans les automations [...] met à jour le dashboard").
// Créer un compte/chaîne YouTube nécessite une connexion Google personnelle — action que Claude ne peut
// pas effectuer à la place de Julien (création de compte = hors périmètre automatisable). Ce module ne
// contient donc AUCUN identifiant de chaîne inventé : seulement l'état réel, vérifié le 24/08/2026, du
// pipeline de logos (avatar carré 800×800 prêt ou non) pour les projets qui ont coché "YouTube" dans le
// tableau de suivi des réseaux (Drive, feuille "Réseaux sociaux — canaux, identifiants & logos v4").
// Le guide complet (nom de chaîne, description reprise du vrai site, lien Drive) est dans :
//   https://docs.google.com/document/d/1GEpwooMbz1tVhbW8Cd5dAotHX69PuMm9RfBnHHPuSnM/edit
const GUIDE_URL = 'https://docs.google.com/document/d/1GEpwooMbz1tVhbW8Cd5dAotHX69PuMm9RfBnHHPuSnM/edit';

const YOUTUBE_PREP = [
  { projet: 'Analyzer+', avatarPret: true, dossierLogos: 'https://drive.google.com/drive/folders/1Xo-vsSlMNWOZcGyCjY1I7ex8b8tbgFIo', note: null },
  { projet: 'Linktrib', avatarPret: true, dossierLogos: 'https://drive.google.com/drive/folders/1xtwvIkU3r9HB5Kxxmj2QW8p2_S2ZdSAM', note: 'Renommé depuis Kreo le 24/08.' },
  { projet: 'Agoeon', avatarPret: true, dossierLogos: 'https://drive.google.com/drive/folders/1t5cI1AVe8HxytVkOSOpdtYR8Jnp5hTqc', note: null },
  { projet: 'Les pépites de Julie', avatarPret: true, dossierLogos: 'https://drive.google.com/drive/folders/1fnvo3vNOYCwOjhn_1HTQKUDs_HyUxc2P', note: 'Pas de site en ligne identifié — description à rédiger par Julien.' },
  { projet: 'Sharetribe remake', avatarPret: true, dossierLogos: 'https://drive.google.com/drive/folders/1RxEEARiio3WYWK_1nMzaRt8bRR_v_kj0', note: 'Nom de marque public à définir avant création (éviter "Sharetribe").' },
  { projet: 'Odoo web / NOVA ERP WEB', avatarPret: true, dossierLogos: 'https://drive.google.com/drive/folders/1gNQzAD1oDfV7oIy2soA-LauRubzNBh8X', note: 'Nom de marque public à définir avant création (éviter "Odoo").' },
  { projet: 'CapCut remake', avatarPret: true, dossierLogos: 'https://drive.google.com/drive/folders/1mS_eV7VTUcbMAeYGtcRLySKpHpBQDwiA', note: 'Nom de marque public à définir avant création (éviter "CapCut").' },
  { projet: 'CVDesignPro', avatarPret: false, dossierLogos: 'https://drive.google.com/drive/folders/1_-mINB_NPDQ69dOgoETRFw_ts6Zcn4wI', note: 'Pipeline en cours au 24/08 — seul LinkedIn était prêt au moment de la vérification.' },
  { projet: 'Prospeo / Firmoscope (ex-Propecto)', avatarPret: false, dossierLogos: 'https://drive.google.com/drive/folders/1yZrZG7NxsTEXKzOcBq5CKygo_Lu9L24r', note: 'Pipeline pas encore démarré pour ce projet.' },
  { projet: 'ArbitragePro+', avatarPret: false, dossierLogos: 'https://drive.google.com/drive/folders/1M9SrU3Mxq-TG4buitmBEzWKTlgGq79t1', note: 'Pipeline pas encore démarré pour ce projet.' },
];

module.exports = {
  GUIDE_URL,
  YOUTUBE_PREP,
  YOUTUBE_PREP_NOTE: 'Créer une chaîne YouTube nécessite une connexion Google personnelle — Claude ne peut pas le faire à la place de Julien. Ci-dessous : uniquement l\'état réel du pipeline de logos (avatar prêt ou non) vérifié le 24/08/2026, aucun identifiant de chaîne n\'est inventé. Le champ "YouTube" du tableau ci-dessus (youtube_channel_id) est déjà prêt à recevoir l\'ID une fois la chaîne créée manuellement — voir le guide.',
};
