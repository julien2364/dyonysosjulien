const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const { JSDOM, VirtualConsole } = require('jsdom');
const { prerender, resolve } = require('../api/_lib/prerender');

const LANGS = ['en', 'es', 'nl', 'de'];
const CATS = ['emploi-carriere', 'education', 'commerce', 'gestion', 'marketplaces', 'video', 'graphisme', 'annuaire', 'createurs', 'applications'];
const ROUTES = [
  ...LANGS.flatMap((l) => [`/${l}`, `/${l}/solutions`, `/${l}/contact`, `/${l}/legal`, `/${l}/blog/articles`, `/${l}/formation-conseil`, `/${l}/partenaires`, `/${l}/emploi`]),
  ...CATS, ...LANGS.flatMap((l) => CATS.map((c) => `/${l}/${c}`)),
].map((r) => (r.startsWith('/') ? r : '/' + r));

// Rejoue la page servie comme un navigateur (sans common.js ni réseau).
function hydrate(html, url) {
  const root = path.join(__dirname, '..');
  const inlined = html
    .replace(/<script src="\/common\.js[^"]*"[^>]*><\/script>/g, '')
    .replace(/<script src="\/([a-z0-9-]+\.js)(?:\?[^"]*)?"[^>]*><\/script>/g, (m, f) => `<script>${fs.readFileSync(path.join(root, f), 'utf8')}</script>`);
  const errors = [];
  const vc = new VirtualConsole();
  vc.on('jsdomError', (e) => errors.push(e.message));
  const dom = new JSDOM(inlined, { url, runScripts: 'dangerously', virtualConsole: vc });
  return { document: dom.window.document, errors };
}

const text = (d) => {
  const body = d.body.cloneNode(true);
  body.querySelectorAll('script,style').forEach((n) => n.remove());
  return body.textContent.replace(/\s+/g, ' ').trim();
};

test('chaque page traduite est servie complète : lang, titre, canonique unique, hreflang', () => {
  assert.equal(ROUTES.length, 82);
  for (const r of ROUTES) {
    const out = prerender(r);
    assert.ok(out, r);
    assert.deepEqual(out.errors, [], r);
    const d = new JSDOM(out.html).window.document;
    const lang = LANGS.includes(r.split('/')[1]) ? r.split('/')[1] : 'fr';
    assert.equal(d.documentElement.lang, lang, `lang ${r}`);
    assert.notEqual(d.title.trim(), 'Dyonysos', `titre ${r}`);
    const canon = [...d.querySelectorAll('link[rel=canonical]')].map((l) => l.href);
    assert.deepEqual(canon, [`https://dyonysos.fr${r}`], `canonique ${r}`);
    const hl = [...d.querySelectorAll('link[hreflang]')].map((l) => l.hreflang);
    assert.deepEqual(hl, ['fr', 'en', 'es', 'nl', 'de', 'x-default'], `hreflang ${r}`);
    assert.ok(d.querySelector(`link[hreflang="${lang}"]`).href === `https://dyonysos.fr${r}`, `hreflang auto-référent ${r}`);
    assert.ok(d.querySelector('h1') && d.querySelector('h1').textContent.trim().length > 3, `h1 ${r}`);
  }
});

test('la reprise dans le navigateur ne duplique rien et ne change pas le contenu', () => {
  for (const r of ROUTES) {
    const out = prerender(r);
    const served = new JSDOM(out.html).window.document;
    const { document: after, errors } = hydrate(out.html, `https://dyonysos.fr${r}`);
    assert.deepEqual(errors, [], r);
    assert.equal(after.querySelectorAll('link[rel=canonical]').length, 1, `canonique ${r}`);
    assert.equal(after.querySelector('link[rel=canonical]').href, `https://dyonysos.fr${r}`, `canonique ${r}`);
    assert.equal(after.querySelectorAll('link[hreflang]').length, 6, `hreflang ${r}`);
    assert.equal(after.querySelectorAll('[data-ssr],[data-ssr-id]').length, 0, `data-ssr ${r}`);
    assert.deepEqual([...after.querySelectorAll('[id]')].map((e) => e.id), [...served.querySelectorAll('[id]')].map((e) => e.id), `ids ${r}`);
    assert.equal(text(after).replace(/"/g, ''), text(served).replace(/"/g, ''), `contenu ${r}`);
    assert.equal(after.title, served.title, `titre ${r}`);
  }
});

test('le formulaire de contact reste branché après reprise', () => {
  const { document } = hydrate(prerender('/en/contact').html, 'https://dyonysos.fr/en/contact');
  assert.ok(document.querySelector('#contactForm input[name=email][required]'));
  assert.equal(document.querySelectorAll('#contactForm').length, 1);
});

test('routes non gérées : aucun pré-rendu', () => {
  for (const r of ['/', '/solutions', '/contact', '/fr/contact', '/it', '/en/inconnu', '/blog/articles']) assert.equal(resolve(r), null, r);
});

test('jsdom se charge sans require(ESM) : le chargeur des fonctions Vercel ne le permet pas', () => {
  // jsdom 30 passait en local (Node 24) et renvoyait 500 sur Vercel (ERR_REQUIRE_ESM).
  const { execFileSync } = require('child_process');
  const out = execFileSync(process.execPath, ['--no-experimental-require-module', '-e', "require('./api/_lib/prerender').prerender('/en/contact');console.log('ok')"], { cwd: path.join(__dirname, '..') });
  assert.equal(String(out).trim(), 'ok');
});

test('formation-conseil, partenaires, emploi : corps traduit et menu vers la langue', () => {
  const fr = new JSDOM(fs.readFileSync(path.join(__dirname, '..', 'formation-conseil.html'), 'utf8')).window.document;
  const frText = new Set();
  const collect = (d, set) => { const w = d.createTreeWalker(d.body, 4); let n; while ((n = w.nextNode())) { const t = n.nodeValue.replace(/\s+/g, ' ').trim(); if (t.length > 25 && !/^(SCRIPT|STYLE)$/.test(n.parentElement.tagName)) set.add(t); } };
  collect(fr, frText);
  for (const lang of LANGS) {
    for (const page of ['formation-conseil', 'partenaires', 'emploi']) {
      const d = new JSDOM(prerender(`/${lang}/${page}`).html).window.document;
      const left = new Set();
      collect(d, left);
      const french = [...left].filter((t) => frText.has(t));
      assert.deepEqual(french, [], `${lang}/${page} : phrases restées en français`);
      assert.equal(d.querySelector('header a[href="/"]'), null, `${lang}/${page} : menu vers l’accueil français`);
    }
  }
});

test('sitemap : script idempotent, six alternatives par page traduite', () => {
  const { run } = require('../scripts/sitemap-hreflang');
  const xml = fs.readFileSync(path.join(__dirname, '..', 'sitemap.xml'), 'utf8');
  assert.equal(run(xml), xml, 'sitemap.xml à régénérer : node scripts/sitemap-hreflang.js');
  const block = (loc) => xml.match(new RegExp(`<url><loc>https://dyonysos.fr${loc}</loc>.*?</url>`))[0];
  for (const loc of ['/en/contact', '/blog/adapter-cv-offre-emploi', '/de/solutions/cvdesignpro', '/nl/commerce', '/es', '/mentions-legales']) {
    assert.equal((block(loc).match(/<xhtml:link /g) || []).length, 6, loc);
  }
});
