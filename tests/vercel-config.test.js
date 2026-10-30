const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const config = JSON.parse(fs.readFileSync(path.join(root, 'vercel.json'), 'utf8'));

test('vercel.json : aucune redirection source == destination (no-op, risque de boucle)', () => {
  for (const r of config.redirects || []) {
    assert.notEqual(r.source, r.destination, `redirection inutile: ${r.source} -> ${r.destination}`);
  }
});

test('vercel.json : les redirections utiles sont conservées', () => {
  const redirects = config.redirects || [];
  // www -> apex
  assert.ok(redirects.some((r) => r.source === '/' && r.has?.[0]?.value === 'www.dyonysos.fr' && r.destination === 'https://dyonysos.fr/'));
  // rewrites clés
  const rewrites = (config.rewrites || []).map((r) => r.destination);
  assert.ok(rewrites.includes('/dyonysos-maquette-entreprise-v2'), 'accueil');
  assert.ok(rewrites.includes('/api/seo-article?page=blog'), 'blog');
  assert.ok(rewrites.includes('/odoo-apps'), '/odoo -> catalogue');
});
