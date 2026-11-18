// T034 — Tests du lot migration Odoo (manifeste, gabarit XML, plan, arborescence).
// Exécution : node --test tests/migration-odoo.test.js
const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.join(__dirname, '..');
const MANIFESTE = path.join(ROOT, 'migration-odoo/manifeste-pages-apps.json');
const GABARIT_XML = path.join(ROOT, 'migration-odoo/gabarits/page-app.xml');
const PLAN = path.join(ROOT, 'migration-odoo/PLAN-MIGRATION-DONNEES.md');
const ARBO = path.join(ROOT, 'migration-odoo/ARBORESCENCE-CIBLE.md');
const SCRIPT_PY = path.join(ROOT, 'migration-odoo/scripts/generer-pages-apps.py');

function lire(p) { return fs.readFileSync(p, 'utf8'); }

test('manifeste : 86 apps, slugs uniques, champs requis, routes cibles uniques', () => {
  const man = JSON.parse(lire(MANIFESTE));
  assert.strictEqual(man.apps.length, 86, '86 apps attendues');
  const slugs = man.apps.map(a => a.slug);
  assert.strictEqual(new Set(slugs).size, 86, 'slugs doivent être uniques');
  const routes = man.apps.map(a => a.route_cible);
  assert.strictEqual(new Set(routes).size, 86, 'routes cibles uniques');
  for (const a of man.apps) {
    for (const c of ['slug', 'technical', 'name', 'summary', 'price', 'version', 'license', 'route_actuelle', 'route_cible']) {
      assert.ok(a[c] !== undefined && a[c] !== null, `champ ${c} requis pour ${a.slug}`);
    }
    assert.strictEqual(a.route_cible, '/applications/' + a.slug);
    assert.strictEqual(a.route_actuelle, '/blog/odoo/' + a.slug);
  }
});

test('manifeste : les slugs correspondent exactement à api/odoo-app.js', () => {
  const src = lire(path.join(ROOT, 'api/odoo-app.js'));
  const apps = JSON.parse(src.match(/const APPS = (\[[\s\S]*?\]);/)[1]);
  const man = JSON.parse(lire(MANIFESTE));
  const a = [...new Set(apps.map(x => x.slug))].sort();
  const b = [...new Set(man.apps.map(x => x.slug))].sort();
  assert.deepStrictEqual(b, a, 'mêmes slugs que la source');
});

test('gabarit XML : bien formé et blocs éditables présents', () => {
  const xml = lire(GABARIT_XML).replace(/<!--[\s\S]*?-->/g, ''); // commentaires retirés avant scan
  // validation de bonne formation via parseur XML simple (balises équilibrées)
  const stack = [];
  const re = /<\/?([a-zA-Z][a-zA-Z0-9_.-]*)((?:"[^"]*"|'[^']*'|[^>"'])*)>/g;
  let m;
  while ((m = re.exec(xml))) {
    const [, tag, attrs] = m;
    const selfClose = attrs.trim().endsWith('/') || m[0].endsWith('/>');
    if (m[0].startsWith('<?') || m[0].startsWith('<!--')) continue;
    if (m[0].startsWith('</')) {
      assert.strictEqual(stack.pop(), tag, `balise fermante </${tag}> cohérente`);
    } else if (!selfClose) {
      stack.push(tag);
    }
  }
  assert.strictEqual(stack.length, 0, 'toutes les balises sont fermées');
  for (const snippet of ['s_title', 's_text_block', 's_three_columns', 's_call_to_action']) {
    assert.ok(xml.includes(`data-snippet="${snippet}"`), `snippet ${snippet} présent`);
  }
  assert.ok(xml.includes('t-field="app.name"'), 'champ name câblé');
  assert.ok(xml.includes('video_youtube_id'), 'bloc vidéo câblé');
});

test('plan de migration : couvre toutes les sources de données dynamiques', () => {
  const plan = lire(PLAN);
  for (const src of ['api/odoo-app.js', 'manifeste-pages-apps.json', 'api/odoo-apps-publiees.json',
    'seo-article-bodies.json', 'seo-article-i18n.json', 'odoo-youtube-videos.json',
    'seo-data.js', 'dyonysos_catalog_potential.json', 'sitemap.xml', 'vercel.json',
    'odoo-captures/', 'kits/', 'mentions-config.js']) {
    assert.ok(plan.includes(src), `le plan mentionne ${src}`);
  }
  assert.ok(plan.includes('À DÉCISION JULIEN'), 'parties hors périmètre marquées');
});

test('arborescence : compte de pages cohérent avec les sources réelles', () => {
  const arbo = lire(ARBO);
  assert.ok(arbo.includes('86'), '86 apps mentionnés');
  const sm = lire(path.join(ROOT, 'sitemap.xml'));
  const nbUrls = (sm.match(/<loc>/g) || []).length;
  assert.ok(nbUrls > 300, `sitemap réel a ${nbUrls} URL`);
  assert.ok(arbo.includes(String(nbUrls)), "l'arborescence cite le nombre réel d'URL du sitemap");
  for (const redir of ['/blog/odoo/<slug>', '/applications-odoo', '/odoo', '/out/<solution>']) {
    assert.ok(arbo.includes(redir), `redirection ${redir} documentée`);
  }
});

test('script générateur : dry-run par défaut, --execute refusé, produit un XML valide', () => {
  const py = lire(SCRIPT_PY);
  assert.ok(py.includes('À DÉCISION JULIEN'), 'garde-fou --execute marqué');
  assert.ok(py.includes('SystemExit(2)'), '--execute termine sans connexion');
  const { execFileSync } = require('node:child_process');
  const out = execFileSync('python3', [SCRIPT_PY], { cwd: ROOT, encoding: 'utf8' });
  assert.ok(out.includes('<odoo>'), 'XML produit');
  const nbRecords = (out.match(/model="website.page"/g) || []).length;
  assert.strictEqual(nbRecords, 86, '86 website.page générées');
  const nbApp = (out.match(/model="dyo.app.page"/g) || []).length;
  assert.strictEqual(nbApp, 86, '86 dyo.app.page générés');
  // --execute doit être refusé (exit 2) sans aucune connexion
  let codeRefus = null; let stderrRefus = '';
  try {
    execFileSync('python3', [SCRIPT_PY, '--execute'], { cwd: ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
  } catch (e) {
    codeRefus = e.status; stderrRefus = String(e.stderr || '');
  }
  assert.strictEqual(codeRefus, 2, '--execute doit échouer avec le code 2');
  assert.ok(stderrRefus.includes('À DÉCISION JULIEN'), 'message de refus présent');
});

test('auto-contrôle : aucun secret ni chemin local dans les livrables migration-odoo/', () => {
  const fichiers = [
    MANIFESTE, GABARIT_XML, PLAN, ARBO, SCRIPT_PY,
    path.join(ROOT, 'migration-odoo/GABARIT-PAGE-APP.md'),
  ];
  const motifs = [/api[_-]?key/i, /token/i, /password/i, /secret/i, /BEGIN [A-Z ]*PRIVATE KEY/,
    /\/Users\//, /\/home\//, /C:\\\\/, /AKIA[0-9A-Z]{16}/, /ghp_[A-Za-z0-9]{20,}/, /xox[baprs]-/];
  for (const f of fichiers) {
    const contenu = lire(f);
    for (const motif of motifs) {
      assert.ok(!motif.test(contenu), `${path.basename(f)} : motif interdit ${motif}`);
    }
  }
});
