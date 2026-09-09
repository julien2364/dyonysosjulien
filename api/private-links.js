const crypto = require('crypto');
const sign = value => crypto.createHmac('sha256', process.env.PRIVATE_SESSION_SECRET || '').update(value).digest('hex');
const validSession = req => {
  const cookie = String(req.headers.cookie || '').split(';').map(v => v.trim()).find(v => v.startsWith('dyonysos_admin='));
  if (!cookie || !process.env.PRIVATE_SESSION_SECRET) return false;
  const [expires, signature] = decodeURIComponent(cookie.slice('dyonysos_admin='.length)).split('.');
  const expected = sign(expires || '');
  return Number(expires) > Date.now() && signature && signature.length === expected.length && crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
};

module.exports = function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Méthode non autorisée.' });
  if (!validSession(req)) return res.status(401).json({ error: 'Session privée requise.' });
  res.setHeader('Cache-Control', 'private, no-store');
  return res.status(200).json({
    groups: [
      { title: 'Pilotage', links: [
        { name: 'Cockpit portefeuille · cash, runway, Amazon et décisions', url: '/pilotage-portefeuille', status: 'Interactif + contrôles dynamiques des productions et sitemaps' },
        { name: 'Cockpit ArbitragePro+ (tunnel, ventes, canaux, preuves)', url: '/pilotage-arbitragepro', status: 'Dynamique — données métier actualisées à la demande' },
        { name: 'Pilotage Social (calendrier, publications, erreurs)', url: '/pilotage-social' },
        { name: 'Pilotage Odoo Apps (ventes, projections, vidéos)', url: '/pilotage-odoo' },
        { name: 'Pilotage Agoeon', url: '/pilotage-agoeon', status: 'Production ; 0 e-mail envoyé, 755 en file ; tunnel et premier gap' },
        { name: 'Pilotage Linktrib', url: '/pilotage-linktrib', status: 'Production ; 656 envois, 18 % ouverts, 1 % cliqués, 0 % répondu' },
        { name: 'Pilotage Etsy · PetStoneOriginal', url: '/pilotage-etsy', status: 'Snapshot authentifié 09/09 ; 121 visites, 0 commande, solde −32,65 €' }
      ]},
      { title: 'Éducation, formation et recrutement', links: [
        { name: 'CVDesignPro', url: 'https://www.cvdesignpro.com/fr' },
        { name: 'QuizPlay', url: 'https://quizplay-production.up.railway.app/' },
        { name: 'CoursHub', url: 'https://coursehub-dusky-seven.vercel.app' },
        { name: 'École Connect', url: 'https://ecole-connect-pied.vercel.app' }
      ]},
      { title: 'Annuaire entreprises C2B / B2B', links: [
        { name: 'Firmoscope / Prospeo', url: 'https://prospeo-drab.vercel.app/' }
      ]},
      { title: 'Commerce et performance', links: [
        { name: 'Arbitrage+', url: 'https://arbitrage-pro-app.vercel.app' },
        { name: 'Analyzer+', url: 'https://analyzer-plus-preview.vercel.app' },
        { name: 'Profit+', url: 'https://profit-plus-preview.vercel.app' }
      ]},
      { title: 'Création et médias', links: [
        { name: 'Linktrib', url: 'https://www.linktrib.com', sensitive: true, status: 'Dépôt technique : Kreo' },
        { name: 'Agoeon', url: 'https://www.agoeon.com', sensitive: true, status: 'Produit distinct de Linktrib' },
        { name: 'OpenArt Local Studio', url: 'https://openart-reconstruction-edu.vercel.app', status: 'Suite créative (vidéo/image/audio) — remake OpenArt' },
        { name: 'Création graphique', url: 'https://canva-remake-production.up.railway.app' },
        { name: 'Adaptation de contenus', url: 'https://reformateur-media-dyonysos.vercel.app', status: 'Déploiement actuellement indisponible' },
        { name: 'ClipForge / éditeur vidéo', url: '', status: 'Projet identifié, nouveau déploiement à finaliser' }
      ]},
      { title: 'Digitalisation et marque blanche', links: [
        { name: 'ErpBridge AI', url: 'https://erpbridge-landing.vercel.app' },
        { name: 'Marketplace-in-a-Box — site', url: 'https://marketplace-in-a-box-site.vercel.app' },
        { name: 'Marketplace-in-a-Box — démonstration', url: 'https://marketplace-in-a-box-demo.vercel.app' }
      ]},
      { title: 'Applications mobiles', links: [
        { name: 'Portefeuille de démonstrations', url: 'https://apps-showcase-flax.vercel.app' }
      ]},
      { title: 'Projet strictement confidentiel', links: [
        { name: 'Réplique MYM', url: '', sensitive: true, status: 'Dossiers locaux uniquement — aucun déploiement public détecté' }
      ]},
      { title: 'Projets à identifier', links: [
        { name: 'Breakout — templates', url: 'https://breakout-templates-originals.vercel.app', status: 'Nature exacte non confirmée — accès direct bloqué (robots.txt), à vérifier par Julien' }
      ]}
    ]
  });
};
