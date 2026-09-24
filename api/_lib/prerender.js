// Pré-rendu serveur des pages traduites dans le navigateur (localized.html, category.html…).
// Le script du gabarit reste la seule source : on l'exécute dans jsdom, on sert le HTML obtenu,
// et il s'exécute de nouveau dans le navigateur (formulaires, liens, etc.).
// Les éléments que ces scripts AJOUTENT sont marqués data-ssr et retirés juste avant qu'ils ne
// s'exécutent côté client, qui les recrée à l'identique : pas de doublon (canonique, sections).
// Les identifiants qu'ils RENOMMENT sont notés data-ssr-id et rétablis au même moment.
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { JSDOM, VirtualConsole } = require('jsdom');

const ROOT = path.join(__dirname, '..', '..');
const ORIGIN = 'https://dyonysos.fr';
const LANGS = ['fr', 'en', 'es', 'nl', 'de'];
const CATEGORIES = ['emploi-carriere', 'education', 'commerce', 'gestion', 'marketplaces', 'video', 'graphisme', 'annuaire', 'createurs', 'applications'];

// Page demandée → gabarit et chemin de chaque langue (pour hreflang). null si la route n'est pas gérée ici.
function resolve(pathname) {
  const parts = pathname.split('/').filter(Boolean);
  const lang = LANGS.includes(parts[0]) && parts[0] !== 'fr' ? parts.shift() : 'fr';
  const rest = '/' + parts.join('/');
  const prefixed = (frPath) => (l) => (l === 'fr' ? frPath : `/${l}${frPath === '/' ? '' : frPath}`);
  let tpl;
  let paths;
  if (lang !== 'fr' && rest === '/') { tpl = 'localized.html'; paths = prefixed('/'); }
  else if (lang !== 'fr' && rest === '/solutions') { tpl = 'localized.html'; paths = prefixed('/solutions'); }
  else if (lang !== 'fr' && rest === '/contact') { tpl = 'localized-secondary.html'; paths = prefixed('/contact'); }
  else if (lang !== 'fr' && rest === '/legal') { tpl = 'localized-secondary.html'; paths = (l) => (l === 'fr' ? '/mentions-legales' : `/${l}/legal`); }
  else if (lang !== 'fr' && rest === '/blog/articles') { tpl = 'localized-articles.html'; paths = prefixed('/blog/articles'); }
  else if (lang !== 'fr' && ['/formation-conseil', '/partenaires', '/emploi'].includes(rest)) { tpl = rest.slice(1) + '.html'; paths = prefixed(rest); }
  else if (parts.length === 1 && CATEGORIES.includes(parts[0])) { tpl = 'category.html'; paths = prefixed(rest); }
  else return null;
  return { tpl, lang, self: paths(lang), paths };
}

function scriptSource(el) {
  const src = el.getAttribute('src');
  if (!src) return el.textContent;
  const file = src.split('?')[0].replace(/^\//, '');
  if (file === 'common.js' || !/^[a-z0-9-]+\.js$/.test(file)) return null; // analytics, traduction auto : navigateur seulement
  return fs.readFileSync(path.join(ROOT, file), 'utf8');
}

function prerender(pathname) {
  const route = resolve(pathname);
  if (!route) return null;
  const source = fs.readFileSync(path.join(ROOT, route.tpl), 'utf8');
  const errors = [];
  const virtualConsole = new VirtualConsole();
  virtualConsole.on('jsdomError', (e) => errors.push(e.message));
  const dom = new JSDOM(source, { url: ORIGIN + pathname, runScripts: 'outside-only', virtualConsole });
  const { document } = dom.window;
  const original = new Set(document.querySelectorAll('*'));
  const originalIds = new Map([...original].filter((el) => el.id).map((el) => [el, el.id]));
  const scripts = [...document.querySelectorAll('script')].filter((s) => !/json/.test(s.type || ''));
  const context = dom.getInternalVMContext();
  try {
    for (const el of scripts) {
      const code = scriptSource(el);
      if (code) vm.runInContext(code, context, { filename: el.getAttribute('src') || route.tpl, timeout: 1000 });
    }
  } catch (e) {
    errors.push(e.message);
  }
  if (errors.length) { dom.window.close(); return { status: 200, html: source, errors, route }; }

  for (const el of document.querySelectorAll('*')) {
    if (!original.has(el) && original.has(el.parentElement)) el.setAttribute('data-ssr', '');
  }
  // Identifiants renommés par le script (ex. categories → catalog) : rétablis avant sa réexécution.
  for (const [el, id] of originalIds) {
    if (el.isConnected && el.id !== id) el.setAttribute('data-ssr-id', id);
  }

  // Une seule canonique, vers la page elle-même.
  const self = ORIGIN + (route.self === '/' ? '/' : route.self);
  const canonicals = [...document.querySelectorAll('link[rel=canonical]')];
  canonicals.slice(1).forEach((l) => l.remove());
  if (canonicals[0]) canonicals[0].href = self;
  else document.head.insertAdjacentHTML('beforeend', `<link rel="canonical" href="${self}">`);

  // hreflang : remplace ceux du gabarit (ceux de localized.html pointaient tous vers l'accueil).
  document.querySelectorAll('link[hreflang]').forEach((l) => l.remove());
  const links = LANGS.map((l) => `<link rel="alternate" hreflang="${l}" href="${ORIGIN}${route.paths(l)}">`).join('')
    + `<link rel="alternate" hreflang="x-default" href="${ORIGIN}${route.paths('fr')}">`;
  document.querySelector('link[rel=canonical]').insertAdjacentHTML('afterend', links);

  const firstBodyScript = scripts.find((s) => document.body.contains(s));
  if (firstBodyScript) {
    const cleanup = document.createElement('script');
    cleanup.textContent = "document.querySelectorAll('[data-ssr]').forEach(function(n){n.remove()});"
      + "document.querySelectorAll('[data-ssr-id]').forEach(function(n){n.id=n.getAttribute('data-ssr-id');n.removeAttribute('data-ssr-id')})";
    firstBodyScript.before(cleanup);
  }
  const html = dom.serialize();
  dom.window.close();
  return { status: 200, html, errors: [], route };
}

module.exports = { prerender, resolve };
