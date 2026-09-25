const test = require('node:test');
const assert = require('node:assert/strict');
const { loadData, renderArticle, renderProduct, renderBlogIndex, LANGS } = require('../api/_lib/seo-article');

const data = loadData();
const slugs = data.articles.map((a) => a[0]);
// Langues réellement disponibles pour un article (les guides Omnifloo n'existent qu'en fr, en, es).
const available = (slug) => LANGS.filter((l) => l === 'fr' || (data.i18n[l].titles[slug] && data.bodies[l][slug]));

test('chaque article et chaque langue produit un HTML complet et autonome', () => {
  for (const lang of LANGS) {
    for (const slug of slugs) {
      const { status, html, canonical } = renderArticle(data, lang, slug);
      const served = available(slug).includes(lang) ? lang : 'fr';
      const url = `https://dyonysos.fr${served === 'fr' ? '' : '/' + served}/blog/${slug}`;
      assert.equal(status, 200, `${lang}/${slug}`);
      assert.equal(canonical, url);
      assert.match(html, new RegExp(`<html lang="${served}">`));
      assert.ok(html.includes(`<link rel="canonical" href="${url}">`), `canonique ${lang}/${slug}`);
      assert.doesNotMatch(html, /<title>Guide Dyonysos<\/title>/);
      assert.match(html, /<meta name="description" content="[^"]{40,}">/);
      for (const l of LANGS) assert.equal(html.includes(`hreflang="${l}"`), available(slug).includes(l), `hreflang ${l} sur ${lang}/${slug}`);
      assert.ok(html.includes('hreflang="x-default"'));
      assert.match(html, /<h1>[^<]{10,}<\/h1>/);
      assert.equal((html.match(/<details>/g) || []).length, 3);
      assert.doesNotMatch(html, /undefined|\$\{/);
      assert.doesNotMatch(html, /DY_ARTICLES|seo-data\.js/, 'plus de rendu client');
    }
  }
});

test('les titres sont uniques dans chaque langue', () => {
  for (const lang of LANGS) {
    const titles = slugs.map((s) => renderArticle(data, lang, s).html.match(/<title>([^<]+)<\/title>/)[1]);
    assert.equal(new Set(titles).size, titles.length, lang);
  }
});

test('la version anglaise est en anglais', () => {
  const noBodies = { ...data, bodies: { fr: {}, en: {}, es: {}, nl: {}, de: {} } };
  const { html } = renderArticle(noBodies, 'en', 'adapter-cv-offre-emploi');
  assert.match(html, /The answer depends first on the objective/);
  assert.doesNotMatch(html, /La réponse dépend|Dans ce scénario|Une phase pilote/);
});

test('sans corps rédigé, le gabarit générique reprend le texte de l’ancien rendu', () => {
  const noBodies = { ...data, bodies: { fr: {}, en: {}, es: {}, nl: {}, de: {} } };
  const { html } = renderArticle(noBodies, 'fr', 'adapter-cv-offre-emploi');
  assert.ok(html.includes('La réponse dépend d’abord de l’objectif, des utilisateurs et des informations réellement disponibles.'));
  assert.ok(html.includes('<title>Comment adapter son CV à une offre d’emploi ? | Dyonysos</title>'));
});

test('slug inconnu ou langue inconnue : vraie 404 non indexable', () => {
  for (const [lang, slug] of [['fr', 'nexiste-pas'], ['en', 'nexiste-pas'], ['it', slugs[0]], ['fr', '../etc']]) {
    const { status, html } = renderArticle(data, lang, slug);
    assert.equal(status, 404, `${lang}/${slug}`);
    assert.match(html, /<meta name="robots" content="noindex">/);
  }
});

test('traduction manquante : version française déclarée en français et canonisée vers /blog', () => {
  const partial = { ...data, i18n: { ...data.i18n, en: { titles: {}, products: {} } } };
  const { status, html, lang } = renderArticle(partial, 'en', 'adapter-cv-offre-emploi');
  assert.equal(status, 200);
  assert.equal(lang, 'fr');
  assert.match(html, /<html lang="fr">/);
  assert.ok(html.includes('<link rel="canonical" href="https://dyonysos.fr/blog/adapter-cv-offre-emploi">'));
  assert.ok(!html.includes('hreflang="en"'));
});

test('formation-conseil pointe vers la page d’offre', () => {
  const slug = data.articles.find((a) => a[1] === 'formation-conseil')[0];
  const { html } = renderArticle(data, 'de', slug);
  assert.ok(html.includes('href="/de/formation-conseil"'));
  assert.ok(!html.includes('/solutions/formation-conseil'));
});

const ROUTED_PRODUCTS = ['cvdesignpro', 'quizplay', 'courshub', 'ecole-connect', 'firmoscope', 'arbitrage-plus', 'analyzer-plus', 'profit-plus', 'erpbridge', 'marketplace', 'creation-graphique', 'applications-mobiles'];

test('fiches solutions : HTML complet, canonique, hreflang et lien direct vers le produit', () => {
  for (const lang of LANGS) {
    const titles = new Set();
    for (const id of ROUTED_PRODUCTS) {
      const { status, html } = renderProduct(data, lang, id);
      const url = `https://dyonysos.fr${lang === 'fr' ? '' : '/' + lang}/solutions/${id}`;
      assert.equal(status, 200, `${lang}/${id}`);
      assert.match(html, new RegExp(`<html lang="${lang}">`));
      assert.ok(html.includes(`<link rel="canonical" href="${url}">`));
      for (const l of LANGS) assert.ok(html.includes(`hreflang="${l}"`));
      assert.doesNotMatch(html, /<title>Solution Dyonysos<\/title>|undefined|\/out\//);
      assert.equal((html.match(/<li>/g) || []).length, data.products[id].features.length);
      titles.add(html.match(/<title>([^<]+)/)[1]);
      const u = data.products[id].url;
      if (u.startsWith('http')) assert.ok(html.includes(`href="${u}"`), `lien direct ${id}`);
    }
    assert.equal(titles.size, ROUTED_PRODUCTS.length, `titres uniques ${lang}`);
  }
  const en = renderProduct(data, 'en', 'cvdesignpro').html;
  assert.match(en, /Resume creation and formatting/);
  assert.doesNotMatch(en, /Création et mise en forme|Le niveau de disponibilité/);
  assert.equal(renderProduct(data, 'fr', 'nexiste-pas').status, 404);
});

test('liste du blog : tous les guides dans chaque langue, titres traduits', () => {
  for (const lang of LANGS) {
    const { status, html } = renderBlogIndex(data, lang);
    const url = `https://dyonysos.fr${lang === 'fr' ? '' : '/' + lang}/blog`;
    assert.equal(status, 200);
    assert.match(html, new RegExp(`<html lang="${lang}">`));
    assert.ok(html.includes(`<link rel="canonical" href="${url}">`));
    assert.equal((html.match(/<article class="card"/g) || []).length, slugs.length, lang);
    assert.equal((html.match(/<article class="card" lang="fr">/g) || []).length, slugs.filter((s) => !available(s).includes(lang)).length, `${lang} : cartes françaises`);
    for (const s of slugs) assert.ok(html.includes(`href="${lang === 'fr' || !available(s).includes(lang) ? '' : '/' + lang}/blog/${s}"`), `${lang}/${s}`);
    assert.ok(html.includes('href="/applications-odoo"'));
  }
  assert.ok(renderBlogIndex(data, 'en').html.includes('How Do You Tailor Your Resume to a Job Posting?'));
});

test('corps rédigés : chaque article a son propre contenu, sommaire et FAQ', () => {
  for (const lang of LANGS) {
    const written = data.bodies[lang] || {};
    const intros = new Set();
    for (const slug of Object.keys(written)) {
      const w = written[slug];
      const { status, html } = renderArticle(data, lang, slug);
      assert.equal(status, 200, `${lang}/${slug}`);
      assert.ok(w.sections.length >= 4 && w.faq.length === 3, `${lang}/${slug} structure`);
      assert.ok(html.includes(`<p class="answer">`) && html.includes(w.intro.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')), `${lang}/${slug} intro`);
      w.sections.forEach((s, i) => assert.ok(html.includes(`<section id="s${i + 1}"><h2>`) && html.includes(`<a href="#s${i + 1}">`), `${lang}/${slug} section ${i + 1}`));
      assert.equal((html.match(/<details>/g) || []).length, 3);
      assert.doesNotMatch(html, /Dans ce scénario|In this scenario|La réponse dépend d’abord/, `${lang}/${slug} gabarit générique`);
      const ld = JSON.parse(html.match(/<script type="application\/ld\+json">(.*?)<\/script>/)[1].replace(/\\u003c/g, '<'));
      assert.equal(ld[1].mainEntity[0].name, w.faq[0].q, `${lang}/${slug} FAQ JSON-LD`);
      assert.ok(!intros.has(w.intro), `${lang}/${slug} intro dupliquée`);
      intros.add(w.intro);
    }
  }
  for (const lang of LANGS) for (const s of slugs) if (available(s).includes(lang)) assert.ok(data.bodies[lang][s], `corps rédigé ${lang}/${s}`);
  for (const lang of LANGS) assert.ok(Object.keys(data.bodies[lang]).length >= 34, lang);
});

const LINKS = {
  'creer-quiz-interactif-classe': 'https://quizplay-production.up.railway.app/',
  'alternative-kahoot-wooclap': 'https://quizplay-production.up.railway.app/',
  'rendre-formation-interactive': 'https://quizplay-production.up.railway.app/',
  'creer-partager-cours-en-ligne': 'https://coursehub-dusky-seven.vercel.app/',
  'plateforme-ressources-pedagogiques': 'https://coursehub-dusky-seven.vercel.app/',
  'digitaliser-communication-ecole-parents': 'https://ecole-connect-pied.vercel.app/',
  'plateforme-numerique-ecole': 'https://ecole-connect-pied.vercel.app/',
  'centraliser-devoirs-notes-agenda': 'https://ecole-connect-pied.vercel.app/',
  'alternative-applications-scolaires': 'https://ecole-connect-pied.vercel.app/',
  'odoo-ou-solution-ciblee': 'https://dyonysos.fr/applications-odoo',
  'creer-marketplace': 'https://tribuplace.com/',
  'alternative-sharetribe': 'https://tribuplace.com/',
  'lancer-site-boutique-en-ligne-evolutif': 'https://omnifloo.com/',
  'site-vitrine-ecommerce-erp-ordre': 'https://omnifloo.com/',
};

test('liens sortants : un lien dans le corps vers le site du produit, sans syntaxe brute ni lien dans la description', () => {
  for (const [slug, href] of Object.entries(LINKS)) {
    for (const lang of available(slug)) {
      const { html } = renderArticle(data, lang, slug);
      const body = html.slice(html.indexOf('<article class="article-body">'), html.indexOf('<section id="faq"'));
      assert.equal(body.split(`<a href="${href}">`).length - 1, 1, `${lang}/${slug} : un seul lien dans le corps`);
      assert.doesNotMatch(html, /\]\(https?:|\]\(\//, `${lang}/${slug} : syntaxe brute`);
      assert.doesNotMatch(html.match(/<meta name="description" content="([^"]*)"/)[1], /\[|\]\(/);
    }
  }
  assert.deepEqual(available('lancer-site-boutique-en-ligne-evolutif'), ['fr', 'en', 'es']);
  assert.deepEqual(available('creer-marketplace'), LANGS);
});
