// CRM — pipeline commercial, alimente l'onglet "CRM" de /espace-prive.
// Source : Odoo (instance connectée à pet-stone.shop, DB "dyonysos", société unique "Dyonysos"),
// interrogée en direct le 23/08/2026 via le connecteur Odoo MCP de cette session.
// Snapshot manuel pour l'instant : pas d'appel API Odoo direct depuis le serverless Vercel en
// production (il faudrait des identifiants Odoo en variable d'environnement — voir "commentPasserEnLive").
// Rien n'est extrapolé au-delà de ce que les requêtes Odoo ont réellement renvoyé.
const { requireSession } = require('./_lib/session');

const CRM_SNAPSHOT = {
  capturedAt: '2026-08-23',
  stages: [
    { id: 1, name: 'New' }, { id: 11, name: 'Qualified' }, { id: 9, name: 'En attente' },
    { id: 7, name: 'A qualifier' }, { id: 5, name: 'Demo' }, { id: 3, name: 'Proposition' },
    { id: 4, name: 'Won' }, { id: 8, name: 'Perdu' },
  ],
  totaux: { leadsBruts: 301, opportunites: 28, perdues: 5, partenaires: 44945, partenairesDyonysos: 7 },
  constat: 'Le CRM Odoo est connecté et interrogeable, mais ne contient PAS aujourd’hui de pipeline commercial exploitable pour Dyonysos : les 301 « leads » bruts sont presque tous des captures email automatiques (notifications, tickets), et les 28 « opportunités » ressemblent en grande majorité à des candidatures / offres d’emploi (ex. « Learning System Lead @ IBA », « Opportunité de Efor group », « Business Process Owner – Exotec ») plutôt qu’à des prospects commerciaux pour les projets du portefeuille. Les 44 945 « partenaires » sont dominés par des clients marketplace Amazon anonymisés et des associations de copropriétaires — signe que cette base Odoo est partagée / réutilisée, pas dédiée à Dyonysos.',
  perdues: [
    { titre: 'Learning System Lead (4473) @ IBA', contact: 'lead@iba' },
    { titre: 'Opportunité de Business Process Owner — Lifecycle Services Transformation — Exotec', contact: null },
    { titre: 'Opportunité de IBA Company — Learning System Lead (Verified job)', contact: null },
    { titre: 'Opportunité de Efor group', contact: 'Stephanie' },
    { titre: 'Sapristic', contact: null },
  ],
  contactsDyonysos: [
    { nom: 'notifications@dyonysos.be', role: 'Notifications système (factures, alertes)' },
    { nom: 'julien.daures@dyonysos.be', role: 'Julien' },
    { nom: 'manuela@dyonysos.be', role: 'Équipe' },
    { nom: 'valeria@dyonysos.be', role: 'Équipe' },
    { nom: 'welcome@dyonysos.be', role: 'Boîte accueil' },
  ],
  emailsScope: {
    demande: 'Une section CRM pilotée par la réception email de tous les comptes projet (1 à 2 comptes par projet), liée à Odoo.',
    etat: 'Pas encore construit — il manque la liste des adresses email par projet (au-delà de julien.daures@gmail.com et juju2364@gmail.com). Odoo n’a pas non plus de règle de rattachement « 1 lead = 1 projet du portefeuille » configurée aujourd’hui.',
  },
  commentPasserEnLive: 'Pour un vrai CRM par projet : 1) la liste des adresses email par projet (ou leur création), 2) une règle de tag/rattachement dans Odoo (un champ « projet » sur crm.lead et res.partner, ou des pipelines séparés par projet), 3) éventuellement un scénario Make qui route les emails entrants vers le bon pipeline. Une fois posé, l’appel Odoo peut se faire en direct depuis cette route (XML-RPC/JSON-RPC, identifiants en variable d’environnement) pour un affichage temps réel au lieu d’un instantané.',
};

module.exports = function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Méthode non autorisée.' });
  if (!requireSession(req, res)) return;
  res.setHeader('Cache-Control', 'private, no-store');
  return res.status(200).json(CRM_SNAPSHOT);
};
