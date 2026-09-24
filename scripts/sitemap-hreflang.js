// Ajoute à sitemap.xml les alternatives de langue (xhtml:link hreflang) de chaque page.
// Idempotent : à relancer après tout ajout d'URL — `node scripts/sitemap-hreflang.js`.
// Une page et ses traductions forment un groupe : /x, /en/x, /es/x, /nl/x, /de/x
// (exceptions : / ↔ /en, /mentions-legales ↔ /en/legal). Seules les URL présentes
// dans le sitemap sont annoncées comme alternatives.
const fs = require('fs');
const path = require('path');

const FILE = path.join(__dirname, '..', 'sitemap.xml');
const ORIGIN = 'https://dyonysos.fr';
const LANGS = ['fr', 'en', 'es', 'nl', 'de'];

// Chemin → [langue, chemin français équivalent]
function family(p) {
  const m = p.match(/^\/(en|es|nl|de)(\/.*)?$/);
  if (!m) return ['fr', p];
  const rest = m[2] || '/';
  return [m[1], rest === '/legal' ? '/mentions-legales' : rest];
}
function localPath(lang, fr) {
  if (lang === 'fr') return fr;
  if (fr === '/') return `/${lang}`;
  if (fr === '/mentions-legales') return `/${lang}/legal`;
  return `/${lang}${fr}`;
}

function run(xml) {
  xml = xml.replace(/<xhtml:link [^>]*\/>/g, '');
  if (!xml.includes('xmlns:xhtml=')) xml = xml.replace('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"', '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml"');
  const locs = new Set([...xml.matchAll(/<loc>https:\/\/dyonysos\.fr([^<]*)<\/loc>/g)].map((m) => m[1] || '/'));
  return xml.replace(/<loc>https:\/\/dyonysos\.fr([^<]*)<\/loc>/g, (whole, raw) => {
    const [, fr] = family(raw || '/');
    const members = LANGS.filter((l) => locs.has(localPath(l, fr)));
    if (members.length < 2) return whole;
    const links = members.map((l) => `<xhtml:link rel="alternate" hreflang="${l}" href="${ORIGIN}${localPath(l, fr)}"/>`).join('')
      + (members.includes('fr') ? `<xhtml:link rel="alternate" hreflang="x-default" href="${ORIGIN}${fr}"/>` : '');
    return whole + links;
  });
}

if (require.main === module) {
  const out = run(fs.readFileSync(FILE, 'utf8'));
  fs.writeFileSync(FILE, out);
  console.log('sitemap.xml :', (out.match(/<xhtml:link /g) || []).length, 'alternatives');
}
module.exports = { run, family, localPath };
