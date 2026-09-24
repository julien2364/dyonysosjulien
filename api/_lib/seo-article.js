// Rendu serveur des articles du blog (/blog/:slug et /:lang/blog/:slug).
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
  return { products: sandbox.window.DY_PRODUCTS, articles: sandbox.window.DY_ARTICLES, i18n };
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

const STYLE = `*{box-sizing:border-box}body{margin:0;background:#f6f7fb;color:#293b4d;font:17px/1.78 Inter,Arial,sans-serif}.wrap{width:min(920px,calc(100% - 40px));margin:auto}.nav{height:78px;display:flex;align-items:center}.nav img{width:168px}.nav a:last-child{margin-left:auto;color:#24364b;text-decoration:none;font-weight:800}.article-hero{padding:68px 0 48px;background:linear-gradient(120deg,#091c35,#172858 58%,#583ca1);color:#fff}.crumb{color:#cbd5e6;font-size:13px}.crumb a{color:#fff}.article-hero h1{font-size:clamp(38px,6vw,62px);line-height:1.08;margin:20px 0}.answer{font-size:20px;color:#dce5f1;max-width:820px}.meta{margin-top:24px;color:#b9c9dc;font-size:13px}.article-main{padding:54px 0}.toc,.article-body,.related{background:#fff;border:1px solid #e1e4ef;border-radius:16px;padding:30px;margin-bottom:20px}.toc a{display:block;padding:5px 0;color:#6847c5}.article-body h2{font-size:31px;line-height:1.2;color:#132b4b;margin-top:45px}.article-body h3{font-size:22px;color:#243d66}.article-body img{display:block;width:100%;height:auto;aspect-ratio:4/3;object-fit:cover;object-position:top;border-radius:12px;margin:28px 0}.mid-cta,.final-cta{padding:26px;border-radius:14px;background:#f1edff;margin:32px 0}.mid-cta a,.final-cta a{display:inline-flex;margin-top:8px}.checklist li{margin:10px 0}.faq details{padding:14px 0;border-top:1px solid #e3e7ef}.faq summary{font-weight:850;cursor:pointer}.related-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}.related a{padding:14px;border:1px solid #e1ddf0;border-radius:10px;color:#6847c5;text-decoration:none;font-weight:750}.final-cta{background:linear-gradient(110deg,#714bce,#1688d8);color:#fff}.final-cta h2{color:#fff;margin-top:0}@media(max-width:600px){.article-hero{padding:48px 0 36px}.answer{font-size:18px}.article-main{padding:36px 0}.toc,.article-body,.related{padding:20px}.article-body h2{font-size:27px}.related-grid{grid-template-columns:1fr}}`;

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
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

function page({ lang, title, description, head, body }) {
  return `<!doctype html><html lang="${lang}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(title)}</title><meta name="description" content="${esc(description)}">${head}<link rel="stylesheet" href="/common.css"><link rel="stylesheet" href="/theme.css"><style>${STYLE}</style></head><body>${body}<script src="/common.js" defer></script></body></html>`;
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
  const answer = copy.answer(c.title, p.name);
  const description = truncate(answer, 158);
  const image = `${ORIGIN}/captures/${p.img}.jpg`;
  const offerPath = c.productId === 'formation-conseil' ? `${base}/formation-conseil` : `${base}/solutions/${c.productId}`;
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
    { '@context': 'https://schema.org', '@type': 'FAQPage', inLanguage: lang, mainEntity: copy.faq.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })) },
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

  const body = `<header><div class="wrap nav"><a href="${base || '/'}"><img src="/logo-dyonysos-wordmark.png" width="338" height="96" alt="Dyonysos"></a><a id="blogBack" href="${base}/blog">${esc(ui.blog)}</a></div></header>`
    + `<main id="main-content"><section class="article-hero"><div class="wrap"><div class="crumb"><a href="${base || '/'}">${esc(ui.home)}</a> / <a href="${base}/blog">${esc(ui.blog)}</a> / <span>${esc(p.name)}</span></div><h1>${esc(c.title)}</h1><p class="answer">${esc(answer)}</p><div class="meta">${esc(p.tag)} · ${esc(ui.read)} · Dyonysos</div></div></section>`
    + `<div class="wrap article-main"><nav class="toc"><strong>${esc(ui.toc)}</strong><a href="#comprendre">${esc(ui.understand)}</a><a href="#methode">${esc(ui.method)}</a><a href="#exemples">${esc(ui.examples)}</a><a href="#limites">${esc(ui.limits)}</a><a href="#faq">FAQ</a></nav>`
    + `<article class="article-body"><section id="comprendre"><h2>${esc(ui.understand)}</h2><p>${esc(p.problem)}</p><p>${esc(copy.understand(p.audience))}</p></section>`
    + `<img src="/captures/${esc(p.img)}.jpg" width="800" height="600" loading="lazy" decoding="async" alt="${esc(`${c.title} — ${ui.example} ${p.name}`)}">`
    + `<section id="methode"><h2>${esc(ui.method)}</h2><p>${esc(copy.method(p.value))}</p><h3>${esc(ui.steps)}</h3><ol class="checklist">${copy.steps.map((x) => `<li>${esc(x)}</li>`).join('')}</ol><div class="mid-cta"><strong>${esc(ui.mid)}</strong><p>${esc(p.value)}</p><a class="btn" href="${offerPath}">${esc(ui.discover)}</a></div></section>`
    + `<section id="exemples"><h2>${esc(ui.examples)}</h2><div>${p.uses.map((x) => `<h3>${esc(x)}</h3><p>${esc(copy.example(p.name))}</p>`).join('')}</div></section>`
    + `<section id="limites"><h2>${esc(ui.limits)}</h2><p>${esc(copy.limits(p.name))}</p><h3>${esc(ui.compare)}</h3><p>${esc(p.compare)}</p></section>`
    + `<section id="faq" class="faq"><h2>FAQ</h2><div>${copy.faq.map(([q, a]) => `<details><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join('')}</div></section>`
    + `<section class="final-cta"><h2>${esc(ui.final)}</h2><p>${esc(copy.final(p.name))}</p><a class="btn" href="${base}/contact">${esc(ui.contact)}</a></section></article>`
    + `<aside class="related"><h2>${esc(ui.related)}</h2><div class="related-grid">${related}</div></aside></div></main><footer><div class="wrap">© 2026 Dyonysos</div></footer>`;

  return { status: 200, lang, canonical, html: page({ lang, title: `${c.title} | Dyonysos`, description, head, body }) };
}

module.exports = { loadData, renderArticle, LANGS };
