// Rendu serveur des pages éditoriales : articles (/blog/:slug), fiches solutions (/solutions/:product)
// et liste du blog (/blog), en français et sous /en, /es, /nl, /de.
// Source unique : seo-data.js (DY_PRODUCTS, DY_ARTICLES) ; traductions dans api/_data/seo-article-i18n.json.
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ORIGIN = 'https://dyonysos.fr';
const LANGS = ['fr', 'en', 'es', 'nl', 'de'];
const LOCALES = { fr: 'fr_FR', en: 'en_US', es: 'es_ES', nl: 'nl_NL', de: 'de_DE' };

function loadData() {
  const sandbox = { window: {} };
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, '..', '..', 'seo-data.js'), 'utf8'), sandbox);
  const i18n = JSON.parse(fs.readFileSync(path.join(__dirname, '..', '_data', 'seo-article-i18n.json'), 'utf8'));
  // Corps rédigés article par article ({ langue: { slug: { intro, sections, faq } } }) ; à défaut, gabarit générique.
  const bodies = JSON.parse(fs.readFileSync(path.join(__dirname, '..', '_data', 'seo-article-bodies.json'), 'utf8'));
  return { products: sandbox.window.DY_PRODUCTS, articles: sandbox.window.DY_ARTICLES, i18n, bodies };
}

const UI = {
  fr: { home: 'Accueil', blog: 'Blog', toc: 'Dans ce guide', understand: 'Comprendre le besoin avant de choisir un outil', method: 'Une méthode concrète, étape par étape', steps: 'Les étapes à retenir', examples: 'Cas d’usage et exemples', limits: 'Avantages, limites et points de vigilance', compare: 'Comparer les solutions sans simplifier à l’excès', mid: 'Passez de la théorie à un parcours concret', discover: 'Découvrir la solution', related: 'Articles associés', final: 'Besoin d’une démonstration ou d’un cadrage ?', contact: 'Nous contacter', read: '8 minutes de lecture', example: 'exemple', notFound: 'Article introuvable', notFoundText: 'Cet article n’existe pas ou a été déplacé.', backToBlog: 'Retour au blog' },
  en: { home: 'Home', blog: 'Insights', toc: 'In this guide', understand: 'Understand the need before choosing a tool', method: 'A practical step-by-step method', steps: 'Key steps', examples: 'Use cases and examples', limits: 'Benefits, limits and points to consider', compare: 'Compare solutions without oversimplifying', mid: 'Move from theory to a practical workflow', discover: 'Explore the solution', related: 'Related articles', final: 'Need a demo or a project review?', contact: 'Contact us', read: '8-minute read', example: 'example', notFound: 'Article not found', notFoundText: 'This article does not exist or has been moved.', backToBlog: 'Back to the blog' },
  es: { home: 'Inicio', blog: 'Blog', toc: 'En esta guía', understand: 'Comprender la necesidad antes de elegir una herramienta', method: 'Un método práctico paso a paso', steps: 'Etapas clave', examples: 'Casos de uso y ejemplos', limits: 'Ventajas, límites y puntos de atención', compare: 'Comparar soluciones sin simplificar demasiado', mid: 'Pasar de la teoría a un proceso concreto', discover: 'Descubrir la solución', related: 'Artículos relacionados', final: '¿Necesita una demostración o un análisis?', contact: 'Contactarnos', read: '8 minutos de lectura', example: 'ejemplo', notFound: 'Artículo no encontrado', notFoundText: 'Este artículo no existe o se ha trasladado.', backToBlog: 'Volver al blog' },
  nl: { home: 'Home', blog: 'Blog', toc: 'In deze gids', understand: 'Begrijp de behoefte voordat u een tool kiest', method: 'Een praktische methode in stappen', steps: 'Belangrijke stappen', examples: 'Gebruikssituaties en voorbeelden', limits: 'Voordelen, beperkingen en aandachtspunten', compare: 'Oplossingen vergelijken zonder te vereenvoudigen', mid: 'Van theorie naar een concreet proces', discover: 'Ontdek de oplossing', related: 'Gerelateerde artikelen', final: 'Een demo of projectanalyse nodig?', contact: 'Contact opnemen', read: '8 minuten leestijd', example: 'voorbeeld', notFound: 'Artikel niet gevonden', notFoundText: 'Dit artikel bestaat niet of is verplaatst.', backToBlog: 'Terug naar de blog' },
  de: { home: 'Startseite', blog: 'Blog', toc: 'In diesem Leitfaden', understand: 'Bedarf verstehen, bevor ein Werkzeug gewählt wird', method: 'Eine praktische Schritt-für-Schritt-Methode', steps: 'Wichtige Schritte', examples: 'Anwendungsfälle und Beispiele', limits: 'Vorteile, Grenzen und Prüfpunkte', compare: 'Lösungen vergleichen, ohne zu stark zu vereinfachen', mid: 'Von der Theorie zu einem konkreten Ablauf', discover: 'Lösung entdecken', related: 'Ähnliche Artikel', final: 'Benötigen Sie eine Demo oder Projektklärung?', contact: 'Kontakt aufnehmen', read: '8 Minuten Lesezeit', example: 'Beispiel', notFound: 'Artikel nicht gefunden', notFoundText: 'Dieser Artikel existiert nicht oder wurde verschoben.', backToBlog: 'Zurück zum Blog' },
};

// Phrases du gabarit. Le texte français reprend mot pour mot l'ancien rendu client.
const COPY = {
  fr: {
    answer: (t, n) => `${t} La réponse dépend d’abord de l’objectif, des utilisateurs et des informations réellement disponibles. Ce guide propose une méthode concrète pour décider, tester et mesurer le résultat avec ${n}.`,
    understand: (aud) => `${aud} Une décision utile commence par un résultat observable : réduire le temps perdu, améliorer la qualité d’une information, rendre une action plus simple ou fiabiliser un choix. L’outil vient ensuite, avec un périmètre suffisamment limité pour être testé.`,
    method: (v) => `${v} La méthode consiste à partir d’un cas réel, à définir les données nécessaires et à vérifier le résultat avec les personnes qui utiliseront le service.`,
    steps: ['Définir le résultat attendu et les utilisateurs concernés', 'Rassembler les informations indispensables, sans collecter de données inutiles', 'Tester un parcours court sur un cas réel', 'Comparer le temps, la qualité et les erreurs avant et après', 'Documenter les limites et décider de la prochaine amélioration'],
    example: (n) => `Dans ce scénario, ${n} aide à structurer l’action, conserver les informations importantes et rendre la décision plus explicite. Le succès se mesure avec un indicateur simple défini avant le test.`,
    limits: (n) => `Les bénéfices dépendent de la qualité des données, de la clarté du processus et de l’adoption. ${n} ne remplace ni l’expertise métier ni la vérification humaine. Une phase pilote permet d’identifier les fonctions réellement utiles avant un déploiement plus large.`,
    final: (n) => `Dyonysos peut présenter ${n}, étudier votre cas d’usage et définir un test adapté à votre contexte.`,
    faq: [['Quel est le premier critère à vérifier ?', 'Commencez par le résultat attendu et le cas d’usage prioritaire, avant la liste des fonctions.'], ['Faut-il remplacer tous les outils existants ?', 'Non. Une intégration progressive est souvent moins risquée et permet de conserver les outils qui remplissent correctement leur rôle.'], ['Comment mesurer le résultat ?', 'Choisissez un indicateur avant le pilote : temps gagné, erreurs évitées, complétude, engagement ou marge selon le produit.']],
  },
  en: {
    answer: (t, n) => `${t} The answer depends first on the objective, the users and the information actually available. This guide sets out a practical method to decide, test and measure the result with ${n}.`,
    understand: (aud) => `${aud} A useful decision starts with an observable result: less time lost, better-quality information, a simpler action or a more reliable choice. The tool comes next, with a scope narrow enough to be tested.`,
    method: (v) => `${v} The method is to start from a real case, define the data required and check the result with the people who will use the service.`,
    steps: ['Define the expected result and the users concerned', 'Gather the essential information without collecting unnecessary data', 'Test a short workflow on a real case', 'Compare time, quality and errors before and after', 'Document the limits and decide on the next improvement'],
    example: (n) => `In this scenario, ${n} helps structure the action, keep track of important information and make the decision more explicit. Success is measured with a simple indicator defined before the test.`,
    limits: (n) => `The benefits depend on data quality, process clarity and adoption. ${n} replaces neither business expertise nor human review. A pilot phase helps identify the features that are genuinely useful before a wider rollout.`,
    final: (n) => `Dyonysos can present ${n}, study your use case and design a test suited to your context.`,
    faq: [['What is the first criterion to check?', 'Start with the expected result and the priority use case, before the feature list.'], ['Should all existing tools be replaced?', 'No. Gradual integration is often less risky and lets you keep the tools that already do their job well.'], ['How can the result be measured?', 'Choose an indicator before the pilot: time saved, errors avoided, completeness, engagement or margin, depending on the product.']],
  },
  es: {
    answer: (t, n) => `${t} La respuesta depende ante todo del objetivo, de los usuarios y de la información realmente disponible. Esta guía propone un método concreto para decidir, probar y medir el resultado con ${n}.`,
    understand: (aud) => `${aud} Una decisión útil empieza por un resultado observable: reducir el tiempo perdido, mejorar la calidad de la información, simplificar una acción o hacer más fiable una elección. La herramienta viene después, con un alcance lo bastante limitado como para poder probarse.`,
    method: (v) => `${v} El método consiste en partir de un caso real, definir los datos necesarios y comprobar el resultado con las personas que utilizarán el servicio.`,
    steps: ['Definir el resultado esperado y los usuarios implicados', 'Reunir la información imprescindible, sin recopilar datos innecesarios', 'Probar un recorrido corto con un caso real', 'Comparar el tiempo, la calidad y los errores antes y después', 'Documentar los límites y decidir la siguiente mejora'],
    example: (n) => `En este escenario, ${n} ayuda a estructurar la acción, conservar la información importante y hacer más explícita la decisión. El éxito se mide con un indicador sencillo definido antes de la prueba.`,
    limits: (n) => `Los beneficios dependen de la calidad de los datos, de la claridad del proceso y de la adopción. ${n} no sustituye ni la experiencia del sector ni la verificación humana. Una fase piloto permite identificar las funciones realmente útiles antes de un despliegue más amplio.`,
    final: (n) => `Dyonysos puede presentarle ${n}, estudiar su caso de uso y definir una prueba adaptada a su contexto.`,
    faq: [['¿Cuál es el primer criterio que hay que comprobar?', 'Empiece por el resultado esperado y el caso de uso prioritario, antes que por la lista de funciones.'], ['¿Hay que sustituir todas las herramientas existentes?', 'No. Una integración progresiva suele ser menos arriesgada y permite conservar las herramientas que ya cumplen bien su función.'], ['¿Cómo medir el resultado?', 'Elija un indicador antes del piloto: tiempo ahorrado, errores evitados, exhaustividad, participación o margen, según el producto.']],
  },
  nl: {
    answer: (t, n) => `${t} Het antwoord hangt in de eerste plaats af van het doel, de gebruikers en de informatie die werkelijk beschikbaar is. Deze gids biedt een concrete methode om met ${n} te beslissen, te testen en het resultaat te meten.`,
    understand: (aud) => `${aud} Een nuttige beslissing begint met een waarneembaar resultaat: minder tijdverlies, betere informatie, een eenvoudigere handeling of een betrouwbaardere keuze. Het hulpmiddel komt daarna, met een afbakening die klein genoeg is om te testen.`,
    method: (v) => `${v} De methode bestaat erin te vertrekken van een echte situatie, de benodigde gegevens te bepalen en het resultaat te controleren met de mensen die de dienst zullen gebruiken.`,
    steps: ['Het verwachte resultaat en de betrokken gebruikers bepalen', 'De onmisbare informatie verzamelen, zonder overbodige gegevens', 'Een kort traject testen op een echte situatie', 'Tijd, kwaliteit en fouten vóór en na vergelijken', 'De beperkingen vastleggen en de volgende verbetering kiezen'],
    example: (n) => `In dit scenario helpt ${n} om de actie te structureren, belangrijke informatie te bewaren en de beslissing explicieter te maken. Het succes wordt gemeten met een eenvoudige indicator die vóór de test is vastgelegd.`,
    limits: (n) => `De voordelen hangen af van de kwaliteit van de gegevens, de duidelijkheid van het proces en de acceptatie door gebruikers. ${n} vervangt noch de vakkennis noch de menselijke controle. Een pilotfase helpt om de werkelijk nuttige functies te identificeren vóór een bredere uitrol.`,
    final: (n) => `Dyonysos kan ${n} voorstellen, uw gebruikssituatie bestuderen en een test opzetten die bij uw context past.`,
    faq: [['Wat is het eerste criterium om te controleren?', 'Begin met het verwachte resultaat en de belangrijkste gebruikssituatie, vóór de lijst met functies.'], ['Moeten alle bestaande tools worden vervangen?', 'Nee. Een geleidelijke integratie is vaak minder riskant en laat u de tools behouden die hun rol goed vervullen.'], ['Hoe meet u het resultaat?', 'Kies vóór de pilot een indicator: bespaarde tijd, vermeden fouten, volledigheid, betrokkenheid of marge, afhankelijk van het product.']],
  },
  de: {
    answer: (t, n) => `${t} Die Antwort hängt zunächst vom Ziel, von den Nutzern und von den tatsächlich verfügbaren Informationen ab. Dieser Leitfaden zeigt eine konkrete Methode, um mit ${n} zu entscheiden, zu testen und das Ergebnis zu messen.`,
    understand: (aud) => `${aud} Eine sinnvolle Entscheidung beginnt mit einem beobachtbaren Ergebnis: weniger verlorene Zeit, bessere Informationsqualität, einfachere Abläufe oder verlässlichere Entscheidungen. Das Werkzeug kommt danach, mit einem Umfang, der klein genug ist, um getestet zu werden.`,
    method: (v) => `${v} Die Methode besteht darin, von einem realen Fall auszugehen, die benötigten Daten festzulegen und das Ergebnis mit den Personen zu überprüfen, die den Dienst nutzen werden.`,
    steps: ['Erwartetes Ergebnis und betroffene Nutzer festlegen', 'Unverzichtbare Informationen sammeln, ohne unnötige Daten zu erheben', 'Einen kurzen Ablauf an einem realen Fall testen', 'Zeit, Qualität und Fehler vorher und nachher vergleichen', 'Grenzen dokumentieren und die nächste Verbesserung beschließen'],
    example: (n) => `In diesem Szenario hilft ${n}, das Vorgehen zu strukturieren, wichtige Informationen festzuhalten und die Entscheidung nachvollziehbarer zu machen. Der Erfolg wird mit einem einfachen Indikator gemessen, der vor dem Test festgelegt wird.`,
    limits: (n) => `Der Nutzen hängt von der Datenqualität, der Klarheit des Prozesses und der Akzeptanz ab. ${n} ersetzt weder Fachwissen noch menschliche Prüfung. Eine Pilotphase hilft, die wirklich nützlichen Funktionen vor einer breiteren Einführung zu erkennen.`,
    final: (n) => `Dyonysos kann Ihnen ${n} vorstellen, Ihren Anwendungsfall analysieren und einen passenden Test für Ihren Kontext definieren.`,
    faq: [['Welches Kriterium sollte zuerst geprüft werden?', 'Beginnen Sie mit dem erwarteten Ergebnis und dem wichtigsten Anwendungsfall, vor der Funktionsliste.'], ['Müssen alle bestehenden Werkzeuge ersetzt werden?', 'Nein. Eine schrittweise Integration ist oft weniger riskant und erlaubt es, Werkzeuge zu behalten, die ihre Aufgabe gut erfüllen.'], ['Wie lässt sich das Ergebnis messen?', 'Wählen Sie vor dem Pilotprojekt einen Indikator: eingesparte Zeit, vermiedene Fehler, Vollständigkeit, Engagement oder Marge – je nach Produkt.']],
  },
};

const READ_TIME = {
  fr: (n) => `${n} minutes de lecture`,
  en: (n) => `${n}-minute read`,
  es: (n) => `${n} minutos de lectura`,
  nl: (n) => `${n} minuten leestijd`,
  de: (n) => `${n} Minuten Lesezeit`,
};

const STYLE = `*{box-sizing:border-box}body{margin:0;background:#f6f7fb;color:#293b4d;font:17px/1.78 Inter,Arial,sans-serif}.wrap{width:min(920px,calc(100% - 40px));margin:auto}.nav{height:78px;display:flex;align-items:center}.nav img{width:168px}.nav a:last-child{margin-left:auto;color:#24364b;text-decoration:none;font-weight:800}.article-hero{padding:68px 0 48px;background:linear-gradient(120deg,#091c35,#172858 58%,#583ca1);color:#fff}.crumb{color:#cbd5e6;font-size:13px}.crumb a{color:#fff}.article-hero h1{font-size:clamp(38px,6vw,62px);line-height:1.08;margin:20px 0}.answer{font-size:20px;color:#dce5f1;max-width:820px}.meta{margin-top:24px;color:#b9c9dc;font-size:13px}.article-main{padding:54px 0}.toc,.article-body,.related{background:#fff;border:1px solid #e1e4ef;border-radius:16px;padding:30px;margin-bottom:20px}.toc a{display:block;padding:5px 0;color:#6847c5}.article-body h2{font-size:31px;line-height:1.2;color:#132b4b;margin-top:45px}.article-body h3{font-size:22px;color:#243d66}.article-body img{display:block;width:100%;height:auto;aspect-ratio:4/3;object-fit:cover;object-position:top;border-radius:12px;margin:28px 0}.mid-cta,.final-cta{padding:26px;border-radius:14px;background:#f1edff;margin:32px 0}.mid-cta a,.final-cta a{display:inline-flex;margin-top:8px}.checklist li{margin:10px 0}.faq details{padding:14px 0;border-top:1px solid #e3e7ef}.faq summary{font-weight:850;cursor:pointer}.related-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}.related a{padding:14px;border:1px solid #e1ddf0;border-radius:10px;color:#6847c5;text-decoration:none;font-weight:750}.final-cta{background:linear-gradient(110deg,#714bce,#1688d8);color:#fff}.final-cta h2{color:#fff;margin-top:0}@media(max-width:600px){.article-hero{padding:48px 0 36px}.answer{font-size:18px}.article-main{padding:36px 0}.toc,.article-body,.related{padding:20px}.article-body h2{font-size:27px}.related-grid{grid-template-columns:1fr}}`;

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
// Liens dans les corps rédigés : syntaxe [texte](https://…) ou [texte](/chemin), convertie après échappement.
// plain() retire la syntaxe pour les usages texte (description, JSON-LD, temps de lecture).
const LINK = /\[([^\]]+)\]\((https:\/\/[^\s()"<>]+|\/[^\s()"<>]*)\)/g;
const plain = (s) => String(s).replace(LINK, '$1');
const rich = (s) => esc(s).replace(LINK, (m, text, href) => `<a href="${href}">${text}</a>`);
const prefix = (lang) => (lang === 'fr' ? '' : '/' + lang);
const articleUrl = (lang, slug) => `${ORIGIN}${prefix(lang)}/blog/${slug}`;

function truncate(text, max) {
  if (text.length <= max) return text;
  const cut = text.slice(0, max - 1);
  return cut.slice(0, cut.lastIndexOf(' ')).replace(/[\s,;:.–-]+$/, '') + '…';
}

// Contenu (titre + fiche produit) dans une langue donnée, ou null si la traduction manque.
function localized(data, lang, slug) {
  const article = data.articles.find((x) => x[0] === slug);
  if (!article) return null;
  const base = data.products[article[1]];
  if (!base) return null;
  if (lang === 'fr') return { article, productId: article[1], title: article[2], product: base };
  const tr = data.i18n[lang];
  const title = tr && tr.titles[slug];
  const product = tr && tr.products[article[1]];
  if (!title || !product) return null;
  return { article, productId: article[1], title, product: { ...base, ...product } };
}

function page({ lang, title, description, head, body, style = STYLE }) {
  return `<!doctype html><html lang="${lang}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(title)}</title><meta name="description" content="${esc(description)}">${head}<link rel="stylesheet" href="/common.css"><link rel="stylesheet" href="/theme.css"><style>${style}</style></head><body>${body}<script src="/common.js" defer></script></body></html>`;
}

function renderNotFound(lang) {
  const ui = UI[lang] || UI.fr;
  const base = prefix(lang in UI ? lang : 'fr');
  return page({
    lang: lang in UI ? lang : 'fr',
    title: `${ui.notFound} | Dyonysos`,
    description: ui.notFoundText,
    head: '<meta name="robots" content="noindex">',
    body: `<header><div class="wrap nav"><a href="${base || '/'}"><img src="/logo-dyonysos-wordmark.png" width="338" height="96" alt="Dyonysos"></a><a href="${base}/blog">${esc(ui.blog)}</a></div></header><main id="main-content"><section class="article-hero"><div class="wrap"><h1>${esc(ui.notFound)}</h1><p class="answer">${esc(ui.notFoundText)}</p><p><a class="btn" href="${base}/blog">${esc(ui.backToBlog)}</a></p></div></section></main><footer><div class="wrap">© 2026 Dyonysos</div></footer>`,
  });
}

const words = (t) => t.split(/\s+/).filter(Boolean).length;
function readingMinutes(w) {
  const all = plain([w.intro, ...w.sections.flatMap((x) => [x.h2, ...x.paragraphs, ...(x.list || [])]), ...w.faq.flatMap((x) => [x.q, x.a])].join(' '));
  return Math.max(2, Math.round(words(all) / 220));
}

// Corps rédigé : sommaire tiré des intertitres, capture après la 1re section, appel à l'action après la 2e.
function writtenBody(w, { ui, p, c, offerPath }) {
  const toc = w.sections.map((x, i) => `<a href="#s${i + 1}">${esc(x.h2)}</a>`).join('') + '<a href="#faq">FAQ</a>';
  const sections = w.sections.map((x, i) => `<section id="s${i + 1}"><h2>${esc(x.h2)}</h2>${x.paragraphs.map((t) => `<p>${rich(t)}</p>`).join('')}${x.list ? `<ul class="checklist">${x.list.map((t) => `<li>${rich(t)}</li>`).join('')}</ul>` : ''}</section>`
    + (i === 0 ? `<img src="/captures/${esc(p.img)}.jpg" width="800" height="600" loading="lazy" decoding="async" alt="${esc(`${c.title} — ${ui.example} ${p.name}`)}">` : '')
    + (i === 1 ? `<div class="mid-cta"><strong>${esc(ui.mid)}</strong><p>${esc(p.value)}</p><a class="btn" href="${offerPath}">${esc(ui.discover)}</a></div>` : '')).join('');
  return `<div class="wrap article-main"><nav class="toc"><strong>${esc(ui.toc)}</strong>${toc}</nav>`
    + `<article class="article-body">${sections}`
    + `<section id="faq" class="faq"><h2>FAQ</h2><div>${w.faq.map((x) => `<details><summary>${esc(x.q)}</summary><p>${rich(x.a)}</p></details>`).join('')}</div></section>`;
}

function renderArticle(data, requestedLang, slug) {
  if (!LANGS.includes(requestedLang) || !/^[a-z0-9-]+$/.test(slug || '')) return { status: 404, html: renderNotFound(requestedLang) };
  // Traduction absente : on sert la version française, déclarée comme telle et canonisée vers l'URL française.
  let lang = requestedLang;
  let c = localized(data, lang, slug);
  if (!c && lang !== 'fr') { lang = 'fr'; c = localized(data, 'fr', slug); }
  if (!c) return { status: 404, html: renderNotFound(requestedLang) };

  const ui = UI[lang];
  const copy = COPY[lang];
  const p = c.product;
  const base = prefix(requestedLang);
  const canonical = articleUrl(lang, slug);
  const alternates = LANGS.filter((l) => localized(data, l, slug));
  const written = data.bodies[lang] && data.bodies[lang][slug];
  const answer = written ? plain(written.intro) : copy.answer(c.title, p.name);
  const faq = written ? written.faq.map((x) => [x.q, plain(x.a)]) : copy.faq;
  const description = truncate(answer, 158);
  const image = `${ORIGIN}/captures/${p.img}.jpg`;
  // Produit sans fiche /solutions (external: true) : l'appel à l'action pointe directement vers son site.
  const offerPath = c.productId === 'formation-conseil' ? `${base}/formation-conseil` : p.external ? p.url : `${base}/solutions/${c.productId}`;
  const related = data.articles
    .filter((x) => x[1] === c.productId && x[0] !== slug)
    .slice(0, 4)
    .map((x) => {
      const r = localized(data, lang, x[0]);
      return `<a href="${base}/blog/${x[0]}">${esc(r ? r.title : x[2])} →</a>`;
    })
    .join('') + `<a href="${offerPath}">${esc(p.name)} →</a>`;

  const ld = [
    { '@context': 'https://schema.org', '@type': 'Article', headline: c.title, description: answer, inLanguage: lang, image, author: { '@type': 'Organization', name: 'Dyonysos' }, publisher: { '@type': 'Organization', name: 'Dyonysos', logo: { '@type': 'ImageObject', url: `${ORIGIN}/logo-dyonysos-wordmark.png` } }, mainEntityOfPage: canonical },
    { '@context': 'https://schema.org', '@type': 'FAQPage', inLanguage: lang, mainEntity: faq.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })) },
  ];

  const head = [
    `<link rel="canonical" href="${canonical}">`,
    ...alternates.map((l) => `<link rel="alternate" hreflang="${l}" href="${articleUrl(l, slug)}">`),
    alternates.includes('fr') ? `<link rel="alternate" hreflang="x-default" href="${articleUrl('fr', slug)}">` : '',
    `<meta property="og:type" content="article">`,
    `<meta property="og:site_name" content="Dyonysos">`,
    `<meta property="og:locale" content="${LOCALES[lang]}">`,
    `<meta property="og:title" content="${esc(c.title)}">`,
    `<meta property="og:description" content="${esc(description)}">`,
    `<meta property="og:url" content="${canonical}">`,
    `<meta property="og:image" content="${image}">`,
    `<meta name="twitter:card" content="summary_large_image">`,
    `<script type="application/ld+json">${JSON.stringify(ld).replace(/</g, '\\u003c')}</script>`,
  ].join('');

  const genericBody = ``
    + `<div class="wrap article-main"><nav class="toc"><strong>${esc(ui.toc)}</strong><a href="#comprendre">${esc(ui.understand)}</a><a href="#methode">${esc(ui.method)}</a><a href="#exemples">${esc(ui.examples)}</a><a href="#limites">${esc(ui.limits)}</a><a href="#faq">FAQ</a></nav>`
    + `<article class="article-body"><section id="comprendre"><h2>${esc(ui.understand)}</h2><p>${esc(p.problem)}</p><p>${esc(copy.understand(p.audience))}</p></section>`
    + `<img src="/captures/${esc(p.img)}.jpg" width="800" height="600" loading="lazy" decoding="async" alt="${esc(`${c.title} — ${ui.example} ${p.name}`)}">`
    + `<section id="methode"><h2>${esc(ui.method)}</h2><p>${esc(copy.method(p.value))}</p><h3>${esc(ui.steps)}</h3><ol class="checklist">${copy.steps.map((x) => `<li>${esc(x)}</li>`).join('')}</ol><div class="mid-cta"><strong>${esc(ui.mid)}</strong><p>${esc(p.value)}</p><a class="btn" href="${offerPath}">${esc(ui.discover)}</a></div></section>`
    + `<section id="exemples"><h2>${esc(ui.examples)}</h2><div>${p.uses.map((x) => `<h3>${esc(x)}</h3><p>${esc(copy.example(p.name))}</p>`).join('')}</div></section>`
    + `<section id="limites"><h2>${esc(ui.limits)}</h2><p>${esc(copy.limits(p.name))}</p><h3>${esc(ui.compare)}</h3><p>${esc(p.compare)}</p></section>`
    + `<section id="faq" class="faq"><h2>FAQ</h2><div>${copy.faq.map(([q, a]) => `<details><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join('')}</div></section>`;
  const body = `<header><div class="wrap nav"><a href="${base || '/'}"><img src="/logo-dyonysos-wordmark.png" width="338" height="96" alt="Dyonysos"></a><a id="blogBack" href="${base}/blog">${esc(ui.blog)}</a></div></header>`
    + `<main id="main-content"><section class="article-hero"><div class="wrap"><div class="crumb"><a href="${base || '/'}">${esc(ui.home)}</a> / <a href="${base}/blog">${esc(ui.blog)}</a> / <span>${esc(p.name)}</span></div><h1>${esc(c.title)}</h1><p class="answer">${written ? rich(written.intro) : esc(answer)}</p><div class="meta">${esc(p.tag)} · ${esc(written ? READ_TIME[lang](readingMinutes(written)) : ui.read)} · Dyonysos</div></div></section>`
    + (written ? writtenBody(written, { ui, p, c, offerPath }) : genericBody)
    + `<section class="final-cta"><h2>${esc(ui.final)}</h2><p>${esc(copy.final(p.name))}</p><a class="btn" href="${base}/contact">${esc(ui.contact)}</a></section></article>`
    + `<aside class="related"><h2>${esc(ui.related)}</h2><div class="related-grid">${related}</div></aside></div></main><footer><div class="wrap">© 2026 Dyonysos</div></footer>`;

  return { status: 200, lang, canonical, html: page({ lang, title: `${c.title} | Dyonysos`, description, head, body }) };
}

// ---------- Fiches solutions ----------

const PRODUCT_UI = {
  fr: { back: 'Solutions', problem: 'Le problème rencontré', audience: 'Pour qui ?', features: 'Fonctionnalités principales', uses: 'Exemples d’utilisation', screens: 'Captures de la solution', compare: 'Comparaison avec les méthodes existantes', articles: 'Guides et articles associés', discover: 'Découvrir la solution', demo: 'Demander une démonstration', final: 'Vous souhaitez tester ou adapter cette solution ?', talk: 'Parler de votre besoin', faq: [['La solution est-elle prête à être testée ?', 'Le niveau de disponibilité est indiqué sur la page et peut évoluer. Dyonysos peut présenter le parcours adapté à votre cas.'], ['Peut-elle être adaptée à mon organisation ?', 'Le périmètre, l’identité visuelle, les intégrations et les workflows sont étudiés selon le besoin.'], ['Comment démarrer ?', 'Commencez par décrire vos utilisateurs, votre objectif et les contraintes principales via le formulaire de contact.']] },
  en: { back: 'Solutions', problem: 'The problem', audience: 'Who is it for?', features: 'Key features', uses: 'Use cases', screens: 'Product screenshots', compare: 'Comparison with existing methods', articles: 'Related guides and articles', discover: 'Explore the solution', demo: 'Request a demo', final: 'Would you like to test or adapt this solution?', talk: 'Discuss your needs', faq: [['Can the solution be tested?', 'Availability is stated on this page and may change. Dyonysos can walk you through the workflow that fits your case.'], ['Can it be adapted to my organisation?', 'Scope, visual identity, integrations and workflows are reviewed according to your needs.'], ['How do I get started?', 'Start by describing your users, your objective and the main constraints through the contact form.']] },
  es: { back: 'Soluciones', problem: 'El problema', audience: '¿Para quién?', features: 'Funciones principales', uses: 'Casos de uso', screens: 'Capturas del producto', compare: 'Comparación con métodos existentes', articles: 'Guías y artículos relacionados', discover: 'Descubrir la solución', demo: 'Solicitar una demostración', final: '¿Quiere probar o adaptar esta solución?', talk: 'Hablar de su proyecto', faq: [['¿Se puede probar la solución?', 'El nivel de disponibilidad se indica en esta página y puede evolucionar. Dyonysos puede presentarle el recorrido adaptado a su caso.'], ['¿Puede adaptarse a mi organización?', 'El alcance, la identidad visual, las integraciones y los flujos de trabajo se estudian según la necesidad.'], ['¿Cómo empezar?', 'Empiece por describir a sus usuarios, su objetivo y las principales restricciones a través del formulario de contacto.']] },
  nl: { back: 'Oplossingen', problem: 'Het probleem', audience: 'Voor wie?', features: 'Belangrijkste functies', uses: 'Gebruikssituaties', screens: 'Productafbeeldingen', compare: 'Vergelijking met bestaande methoden', articles: 'Gerelateerde gidsen en artikelen', discover: 'Ontdek de oplossing', demo: 'Vraag een demo aan', final: 'Wilt u deze oplossing testen of aanpassen?', talk: 'Bespreek uw behoefte', faq: [['Kan de oplossing worden getest?', 'De beschikbaarheid staat op deze pagina en kan veranderen. Dyonysos kan u het traject tonen dat bij uw situatie past.'], ['Kan ze aan mijn organisatie worden aangepast?', 'Reikwijdte, huisstijl, integraties en workflows worden afgestemd op uw behoefte.'], ['Hoe begin ik?', 'Beschrijf eerst uw gebruikers, uw doel en de belangrijkste randvoorwaarden via het contactformulier.']] },
  de: { back: 'Lösungen', problem: 'Das Problem', audience: 'Für wen?', features: 'Wichtigste Funktionen', uses: 'Anwendungsbeispiele', screens: 'Produktansichten', compare: 'Vergleich mit bestehenden Methoden', articles: 'Passende Leitfäden und Artikel', discover: 'Lösung entdecken', demo: 'Demo anfragen', final: 'Möchten Sie diese Lösung testen oder anpassen?', talk: 'Bedarf besprechen', faq: [['Kann die Lösung getestet werden?', 'Der Verfügbarkeitsstand ist auf dieser Seite angegeben und kann sich ändern. Dyonysos kann Ihnen den passenden Ablauf für Ihren Fall vorstellen.'], ['Kann sie an meine Organisation angepasst werden?', 'Umfang, visuelle Identität, Integrationen und Workflows werden je nach Bedarf geprüft.'], ['Wie beginne ich?', 'Beschreiben Sie zunächst Ihre Nutzer, Ihr Ziel und die wichtigsten Rahmenbedingungen über das Kontaktformular.']] },
};

// Libellés repris de category.html (ordre fr, en, es, nl, de).
const CATEGORIES = {
  'emploi-carriere': ['Emploi & Carrière', 'Jobs & career', 'Empleo y carrera', 'Werk & loopbaan', 'Arbeit & Karriere'],
  education: ['Éducation et formation', 'Education and training', 'Educación y formación', 'Onderwijs en opleiding', 'Bildung und Schulung'],
  commerce: ['Commerce et performance', 'Commerce and performance', 'Comercio y rendimiento', 'Handel en prestaties', 'Handel und Leistung'],
  gestion: ['Gestion et digitalisation', 'Management and digitalisation', 'Gestión y digitalización', 'Beheer en digitalisering', 'Management und Digitalisierung'],
  marketplaces: ['Marketplaces personnalisables', 'Customisable marketplaces', 'Marketplaces personalizables', 'Aanpasbare marktplaatsen', 'Anpassbare Marktplätze'],
  graphisme: ['Création graphique', 'Graphic creation', 'Creación gráfica', 'Grafische creatie', 'Grafikerstellung'],
  annuaire: ['Annuaire d’entreprises', 'Business directory', 'Directorio de empresas', 'Bedrijvengids', 'Unternehmensverzeichnis'],
  applications: ['Applications mobiles', 'Mobile applications', 'Aplicaciones móviles', 'Mobiele toepassingen', 'Mobile Anwendungen'],
};

const PRODUCT_STYLE = `*{box-sizing:border-box}body{margin:0;color:#26384a;background:#f7f8fc;font:16px/1.7 Inter,Arial,sans-serif}.wrap{width:min(1080px,calc(100% - 40px));margin:auto}.nav{height:78px;display:flex;align-items:center;gap:24px}.nav img{width:168px}.nav>a:last-child{margin-left:auto;color:#24364b;text-decoration:none;font-weight:800}.product-hero{padding:72px 0;background:linear-gradient(120deg,#091c35,#172858 58%,#583ca1);color:#fff}.product-hero-grid{display:grid;grid-template-columns:1fr .72fr;gap:60px;align-items:center}.crumb{font-size:13px;color:#cbd5e6}.crumb a{color:#fff}.product-hero h1{font-size:clamp(42px,6vw,68px);line-height:1.04;margin:18px 0}.product-hero p{font-size:19px;color:#d7e1ee}.product-hero img{width:100%;height:auto;border-radius:18px}.actions{display:flex;gap:12px;flex-wrap:wrap;margin-top:28px}.btn{min-height:48px}.btn.ghost{border:1px solid #ffffff80;background:transparent!important}.content{padding:70px 0}.block{background:#fff;border:1px solid #e1e4f0;border-radius:16px;padding:32px;margin:18px 0}.block h2{font-size:30px;color:#132b4b;margin-top:0}.two{display:grid;grid-template-columns:1fr 1fr;gap:18px}.features{display:grid;grid-template-columns:repeat(2,1fr);gap:10px;padding:0;list-style:none}.features li{padding:14px;border-radius:10px;background:#f2efff;font-weight:700}.gallery{display:grid;grid-template-columns:2fr 1fr 1fr;gap:10px}.gallery img{width:100%;height:100%;min-height:170px;object-fit:cover;object-position:top;border-radius:10px;cursor:zoom-in}.faq details{padding:15px 0;border-top:1px solid #e5e8f0}.faq summary{cursor:pointer;font-weight:850;color:#193250}.related{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}.related a{padding:16px;border:1px solid #e0daf1;border-radius:10px;color:#6847c5;text-decoration:none;font-weight:800}.final{padding:48px;background:linear-gradient(110deg,#714bce,#1688d8);color:#fff;border-radius:18px;text-align:center}.final h2{font-size:34px}.final .btn{background:#fff!important;color:#5137a1!important}@media(max-width:760px){.product-hero-grid,.two{grid-template-columns:1fr}.product-hero{padding:54px 0}.product-hero img{max-width:430px}.content{padding:46px 0}.block{padding:22px}.features,.related{grid-template-columns:1fr}.gallery{grid-template-columns:1fr}.gallery img{aspect-ratio:4/3;min-height:0}.final{padding:30px 20px}}`;

function localizedProduct(data, lang, id) {
  const base = data.products[id];
  if (!base) return null;
  if (lang === 'fr') return base;
  const tr = data.i18n[lang] && data.i18n[lang].products[id];
  return tr && tr.features ? { ...base, ...tr } : null;
}

function renderProduct(data, requestedLang, id) {
  if (!LANGS.includes(requestedLang) || !data.products[id]) return { status: 404, html: renderNotFound(requestedLang) };
  let lang = requestedLang;
  let p = localizedProduct(data, lang, id);
  if (!p) { lang = 'fr'; p = localizedProduct(data, 'fr', id); }
  const ui = PRODUCT_UI[lang];
  const base = prefix(requestedLang);
  const url = (l) => `${ORIGIN}${prefix(l)}/solutions/${id}`;
  const canonical = url(lang);
  const alternates = LANGS.filter((l) => localizedProduct(data, l, id));
  const description = truncate(p.value, 158);
  const catLabel = CATEGORIES[p.cat] ? CATEGORIES[p.cat][LANGS.indexOf(lang)] : p.cat.replace(/-/g, ' ');
  // Lien direct vers le produit (et non /out/, en noindex,nofollow) : voir le commit « Backlinks (lot A) ».
  const primary = p.url.startsWith('http') ? p.url : base + p.url;
  const articles = data.articles.filter((x) => x[1] === id).slice(0, 6).map((x) => {
    const r = localized(data, lang, x[0]);
    return `<a href="${base}/blog/${x[0]}">${esc(r ? r.title : x[2])} →</a>`;
  }).join('');
  const ld = { '@context': 'https://schema.org', '@type': 'SoftwareApplication', name: p.name, description: p.value, applicationCategory: p.tag, inLanguage: lang, url: canonical };
  const head = [
    `<link rel="canonical" href="${canonical}">`,
    ...alternates.map((l) => `<link rel="alternate" hreflang="${l}" href="${url(l)}">`),
    `<link rel="alternate" hreflang="x-default" href="${url('fr')}">`,
    `<meta property="og:type" content="website">`, `<meta property="og:site_name" content="Dyonysos">`, `<meta property="og:locale" content="${LOCALES[lang]}">`,
    `<meta property="og:title" content="${esc(`${p.name} — ${p.tag}`)}">`, `<meta property="og:description" content="${esc(description)}">`, `<meta property="og:url" content="${canonical}">`,
    `<meta property="og:image" content="${ORIGIN}/captures/${esc(p.img)}.jpg">`,
    `<script type="application/ld+json">${JSON.stringify(ld).replace(/</g, '\\u003c')}</script>`,
  ].join('');
  const body = `<header><div class="wrap nav"><a href="${base || '/'}"><img src="/logo-dyonysos-wordmark.png" width="338" height="96" alt="Dyonysos"></a><a href="${base}/solutions">${esc(ui.back)}</a></div></header>`
    + `<main id="main-content"><section class="product-hero"><div class="wrap product-hero-grid"><div><div class="crumb"><a href="${base || '/'}">${esc(UI[lang].home)}</a> / <a href="${base}/${esc(p.cat)}">${esc(catLabel)}</a> / <span>${esc(p.name)}</span></div><p>${esc(p.tag)}</p><h1>${esc(p.name)}</h1><p>${esc(p.value)}</p><div class="actions"><a class="btn" href="${esc(primary)}">${esc(ui.discover)}</a><a class="btn ghost" href="${base}/contact">${esc(ui.demo)}</a></div></div><img src="/illustrations/${esc(p.art)}.svg" width="640" height="360" alt="${esc(`${p.name} — ${p.tag}`)}"></div></section>`
    + `<div class="wrap content"><section class="two"><article class="block"><h2>${esc(ui.problem)}</h2><p>${esc(p.problem)}</p></article><article class="block"><h2>${esc(ui.audience)}</h2><p>${esc(p.audience)}</p></article></section>`
    + `<section class="block"><h2>${esc(ui.features)}</h2><ul class="features">${p.features.map((x) => `<li>${esc(x)}</li>`).join('')}</ul></section>`
    + `<section class="block"><h2>${esc(ui.uses)}</h2><div class="features">${p.uses.map((x) => `<div>${esc(x)}</div>`).join('')}</div></section>`
    + `<section class="block"><h2>${esc(ui.screens)}</h2><div class="gallery">${[p.img, p.img + '-2', p.img + '-3'].map((x, i) => `<img src="/captures/${esc(x)}.jpg" width="800" height="600" loading="lazy" decoding="async" onerror="this.remove()" alt="${esc(`${p.name} — ${ui.screens.toLowerCase()} ${i + 1}`)}">`).join('')}</div></section>`
    + `<section class="block"><h2>${esc(ui.compare)}</h2><p>${esc(p.compare)}</p></section>`
    + `<section class="block faq"><h2>FAQ</h2><div>${ui.faq.map(([q, a]) => `<details><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join('')}</div></section>`
    + (articles ? `<section class="block"><h2>${esc(ui.articles)}</h2><div class="related">${articles}</div></section>` : '')
    + `<section class="final"><h2>${esc(ui.final)}</h2><p>${esc(p.value)}</p><div class="actions" style="justify-content:center"><a class="btn" href="${base}/contact">${esc(ui.talk)}</a></div></section></div></main><footer><div class="wrap">© 2026 Dyonysos</div></footer>`;
  return { status: 200, lang, canonical, html: page({ lang, title: `${p.name} — ${p.tag} | Dyonysos`, description, head, body, style: PRODUCT_STYLE }) };
}

// ---------- Liste du blog ----------

const BLOG_UI = {
  fr: { title: 'Guides & comparatifs', lead: 'Des réponses approfondies aux questions des candidats, enseignants, entreprises, vendeurs et porteurs de projets numériques.', read: 'Lire le guide', solutions: 'Solutions', legal: ['/mentions-legales', 'Mentions légales'], hubs: 'Dossiers et catalogues', hubLinks: ['Catalogue des applications Odoo', 'Dossiers solutions', 'Applications mobiles'] },
  en: { title: 'Guides & comparisons', lead: 'In-depth answers for candidates, educators, businesses, sellers and digital project owners.', read: 'Read the guide', solutions: 'Solutions', legal: ['/en/legal', 'Legal notice'], hubs: 'Files and catalogues', hubLinks: ['Odoo applications catalogue', 'Solution files', 'Mobile applications'] },
  es: { title: 'Guías y comparativas', lead: 'Respuestas detalladas para candidatos, docentes, empresas, vendedores y responsables de proyectos digitales.', read: 'Leer la guía', solutions: 'Soluciones', legal: ['/es/legal', 'Aviso legal'], hubs: 'Dossiers y catálogos', hubLinks: ['Catálogo de aplicaciones Odoo', 'Dossiers de soluciones', 'Aplicaciones móviles'] },
  nl: { title: 'Gidsen & vergelijkingen', lead: 'Diepgaande antwoorden voor kandidaten, docenten, bedrijven, verkopers en digitale projectleiders.', read: 'Lees de gids', solutions: 'Oplossingen', legal: ['/nl/legal', 'Juridische informatie'], hubs: 'Dossiers en catalogi', hubLinks: ['Catalogus van Odoo-applicaties', 'Oplossingsdossiers', 'Mobiele toepassingen'] },
  de: { title: 'Leitfäden & Vergleiche', lead: 'Ausführliche Antworten für Bewerber, Lehrkräfte, Unternehmen, Händler und digitale Projektverantwortliche.', read: 'Leitfaden lesen', solutions: 'Lösungen', legal: ['/de/legal', 'Impressum'], hubs: 'Dossiers und Kataloge', hubLinks: ['Katalog der Odoo-Anwendungen', 'Lösungsdossiers', 'Mobile Anwendungen'] },
};

const BLOG_STYLE = `:root{--n:#071d35;--b:#1769aa;--t:#26384a;--l:#dfe7ef;--s:#f4f7fa}*{box-sizing:border-box}body{margin:0;font-family:Arial,sans-serif;color:var(--t);background:var(--s)}.wrap{max-width:1160px;margin:auto;padding:0 24px}header{background:#fff;border-bottom:1px solid var(--l)}nav{height:76px;display:flex;align-items:center;gap:28px}.logo{font-weight:900;color:var(--n);text-decoration:none;font-size:20px;margin-right:auto}nav a{color:var(--t);text-decoration:none;font-weight:700}.hero{background:var(--n);color:#fff;padding:78px 0}.hero h1{font-size:52px;margin:0 0 15px}.hero p{max-width:700px;line-height:1.7;color:#c6d5e4}.grid{display:grid;grid-template-columns:repeat(3,1fr);gap:20px;padding:60px 0}.card{background:#fff;border:1px solid var(--l);border-radius:10px;padding:28px}.card small{color:var(--b);font-weight:800;text-transform:uppercase}.card h2{color:var(--n);font-size:22px}.card p{line-height:1.6}.card a{color:var(--b);font-weight:800;text-decoration:none}footer{background:var(--n);color:#c6d5e4;padding:35px 0}footer a{color:#fff}@media(max-width:800px){.grid{grid-template-columns:1fr}.hero h1{font-size:38px}nav a:not(.logo){display:none}}`;

function renderBlogIndex(data, lang) {
  if (!LANGS.includes(lang)) return { status: 404, html: renderNotFound(lang) };
  const ui = BLOG_UI[lang];
  const base = prefix(lang);
  const url = (l) => `${ORIGIN}${prefix(l)}/blog`;
  const cards = data.articles.map((a) => {
    // Article non traduit : carte française, lien vers la version française (celle que sert l'article).
    const r = localized(data, lang, a[0]);
    const c = r || localized(data, 'fr', a[0]);
    const href = r ? `${base}/blog/${a[0]}` : `/blog/${a[0]}`;
    return `<article class="card"${r ? '' : ' lang="fr"'}><small>${esc(c.product.tag)}</small><h2>${esc(c.title)}</h2><p>${esc(c.product.problem)}</p><a href="${href}">${esc(ui.read)} →</a></article>`;
  }).join('');
  const hubs = [['/applications-odoo', ui.hubLinks[0]], [`${base}/blog/articles`, ui.hubLinks[1]], ['/blog/applications-mobiles', ui.hubLinks[2]]]
    .map(([h, t]) => `<a href="${h}">${esc(t)} →</a>`).join(' · ');
  const head = [
    `<link rel="canonical" href="${url(lang)}">`,
    ...LANGS.map((l) => `<link rel="alternate" hreflang="${l}" href="${url(l)}">`),
    `<link rel="alternate" hreflang="x-default" href="${url('fr')}">`,
    `<meta property="og:type" content="website">`, `<meta property="og:site_name" content="Dyonysos">`, `<meta property="og:locale" content="${LOCALES[lang]}">`,
    `<meta property="og:title" content="${esc(ui.title)}">`, `<meta property="og:description" content="${esc(ui.lead)}">`, `<meta property="og:url" content="${url(lang)}">`,
  ].join('');
  const body = `<header><nav class="wrap"><a class="logo" href="${base || '/'}">◇ DYONYSOS</a><a href="${base || '/'}">${esc(UI[lang].home)}</a><a href="${base}/solutions">${esc(ui.solutions)}</a><a href="${ui.legal[0]}">${esc(ui.legal[1])}</a></nav></header>`
    + `<main><section class="hero"><div class="wrap"><h1>${esc(ui.title)}</h1><p>${esc(ui.lead)}</p></div></section><section class="wrap grid">${cards}</section>`
    + `<section class="wrap"><p><strong>${esc(ui.hubs)} :</strong> ${hubs}</p></section></main>`
    + `<footer><div class="wrap">© 2026 Dyonysos · <a href="${ui.legal[0]}">${esc(ui.legal[1])}</a></div></footer>`;
  return { status: 200, lang, canonical: url(lang), html: page({ lang, title: `${ui.title} — Dyonysos`, description: ui.lead, head, body, style: BLOG_STYLE }) };
}

module.exports = { loadData, renderArticle, renderProduct, renderBlogIndex, LANGS };

