const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { JSDOM, VirtualConsole } = require('jsdom');

const ROOT = path.join(__dirname, '..');
// Textes exacts du lot MENTIONS-P14 (ne pas reformuler).
const BANDEAU_MODELE = "© {ANNEE_COURANTE} DYONYSOS SASU — Bexo® est une marque déposée. Tous droits réservés.";
const PARAGRAPHE_EXACT = "Propriété intellectuelle — L'ensemble des éléments de ce site (textes, images, logos, graphismes, mise en page, code source, bases de données) est protégé par le droit d'auteur (articles L.111-1 et suivants du Code de la propriété intellectuelle) et, pour les bases de données, par le droit du producteur (articles L.341-1 et suivants). Toute reproduction, représentation, adaptation, traduction ou extraction, totale ou partielle, par quelque procédé que ce soit, sans l'autorisation écrite préalable de DYONYSOS SASU est interdite et constitue une contrefaçon sanctionnée par les articles L.335-2 et suivants du même code.";
const ANNEE = String(new Date().getFullYear());
const BANDEAU_RENDU = BANDEAU_MODELE.replace('{ANNEE_COURANTE}', ANNEE);

// Pages publiques du site (index,follow) : toutes doivent afficher le bandeau.
const PAGES = [
  'articles.html', 'category.html', 'contact.html', 'dyonysos-directions-visuelles.html',
  'dyonysos-maquette-entreprise-v2.html', 'dyonysos-solutions-v2.html', 'emploi.html',
  'formation-conseil.html', 'halloween-2026.html', 'localized.html', 'localized-articles.html',
  'localized-secondary.html', 'mentions-legales.html', 'mobile-articles.html', 'odoo-apps.html',
  'odoo-connecteurs-ecommerce.html', 'odoo-mcp-ia.html', 'odoo-mrp-essentiel.html',
  'outils-numeriques-etsy.html', 'partenaires.html', 'realisations.html',
];

const configSource = fs.readFileSync(path.join(ROOT, 'mentions-config.js'), 'utf8');
const mentionsSource = fs.readFileSync(path.join(ROOT, 'mentions.js'), 'utf8');

// Rejoue une page statique avec uniquement la configuration et le renderer des mentions.
function hydrate(html, url) {
  const stripped = html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/g, '');
  const injected = stripped.replace(/<\/body>/i, `<script>${configSource}</script><script>${mentionsSource}</script></body>`);
  const errors = [];
  const vc = new VirtualConsole();
  vc.on('jsdomError', (e) => errors.push(e.message));
  const dom = new JSDOM(injected, { url, runScripts: 'dangerously', virtualConsole: vc });
  return { document: dom.window.document, errors };
}

test('mentions-config.js definit le bandeau exact, a un seul endroit, sans numero INPI', () => {
  const sandbox = { window: {} };
  vm.runInNewContext(configSource, sandbox);
  assert.equal(sandbox.window.DYONYSOS_MENTIONS.bandeauMarque, BANDEAU_MODELE);
  assert.ok(BANDEAU_MODELE.includes('{ANNEE_COURANTE}'));
  assert.ok(!/\d{6,}/.test(BANDEAU_MODELE), 'aucun numero de depot dans le bandeau');
  assert.equal(configSource.split('Bexo®').length - 1, 1, 'Bexo® defini une seule fois');
});

test('mentions.js applique le style demande (11-12 px, retour a la ligne propre, sans debordement)', () => {
  assert.match(mentionsSource, /font-size:1[12](\.\d+)?px/);
  assert.match(mentionsSource, /overflow-wrap:break-word/);
  assert.match(mentionsSource, /max-width:100%/);
  assert.match(mentionsSource, /white-space:normal/);
});

test('chaque page publique affiche le bandeau exact et un lien vers les mentions legales', () => {
  for (const page of PAGES) {
    const html = fs.readFileSync(path.join(ROOT, page), 'utf8');
    const url = page === 'dyonysos-maquette-entreprise-v2.html' ? 'https://dyonysos.fr/' : 'https://dyonysos.fr/' + page.replace(/\.html$/, '');
    const { document: d, errors } = hydrate(html, url);
    assert.deepEqual(errors, [], page + ' : erreurs jsdom');
    const bandeaux = d.querySelectorAll('footer .dy-bandeau-marque');
    assert.equal(bandeaux.length, 1, page + ' : un seul bandeau');
    assert.equal(bandeaux[0].textContent, BANDEAU_RENDU, page + ' : texte exact avec annee courante ' + ANNEE);
    const lien = d.querySelector('footer a[href*="mentions-legales"], footer a[href$="/legal"]');
    assert.ok(lien, page + ' : lien vers les mentions legales dans le pied de page');
    const reste = d.querySelector('footer').textContent.split(BANDEAU_RENDU).join('');
    assert.ok(!/©\s*20\d\d/.test(reste), page + ' : ancienne ligne © remplacee, pas dupliquee');
  }
});

test('mentions-legales.html contient le paragraphe exact de propriete intellectuelle', () => {
  const html = fs.readFileSync(path.join(ROOT, 'mentions-legales.html'), 'utf8');
  assert.ok(html.includes(PARAGRAPHE_EXACT));
});

test('pages traduites : le paragraphe est present en EN et ES via le pre-rendu', () => {
  const { prerender } = require('../api/_lib/prerender');
  const en = prerender('/en/legal');
  assert.deepEqual(en.errors, []);
  assert.ok(en.html.includes('Intellectual property') && en.html.includes('L.335-2'), '/en/legal : clause traduite');
  const es = prerender('/es/legal');
  assert.ok(es.html.includes('Propiedad intelectual') && es.html.includes('L.335-2'), '/es/legal : clause traduite');
  const home = prerender('/en');
  assert.deepEqual(home.errors, []);
  assert.ok(home.html.includes('DYONYSOS SASU — Bexo® est une marque déposée'), '/en : bandeau rendu');
});

test('depot : aucun numero INPI, Bexo et marque deposee uniquement dans la configuration (hors tests)', () => {
  const ignore = new Set(['node_modules', '.git', 'tests']);
  const bexo = [], marqueDeposee = [], inpi = [];
  const walk = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (ignore.has(entry.name)) continue;
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) { walk(full); continue; }
      if (entry.isFile() && /\.(html?|js|mjs|css|json|md|txt|xml|csv)$/i.test(entry.name)) {
        const content = fs.readFileSync(full, 'utf8');
        const rel = path.relative(ROOT, full);
        if (/bexo/i.test(content)) bexo.push(rel);
        if (/marque d[eé]pos[eé]e/i.test(content)) marqueDeposee.push(rel);
        if (/5111908/.test(content) || /INPI[^\n]{0,30}\d{6,}/i.test(content)) inpi.push(rel);
      }
    }
  };
  walk(ROOT);
  assert.deepEqual(bexo.sort(), ['mentions-config.js']);
  assert.deepEqual(marqueDeposee.sort(), ['mentions-config.js']);
  assert.deepEqual(inpi, [], 'aucun numero INPI ne doit subsister');
});
