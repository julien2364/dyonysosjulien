const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

const robots = fs.readFileSync(path.join(__dirname, '..', 'robots.txt'), 'utf8');

test('robots.txt : le sitemap est déclaré', () => {
  assert.match(robots, /^Sitemap: https:\/\/dyonysos\.fr\/sitemap\.xml$/m);
});

test('robots.txt : les chemins privés restent interdits', () => {
  for (const p of ['/espace-prive', '/pilotage-']) {
    assert.match(robots, new RegExp(`^Disallow: ${p.replace(/[-[\]/{}()*+?.\\^$|]/g, '\\$&')}$`, 'm'), p);
  }
});

test('robots.txt : aucun caractère d’encodage dégradé (« ? » isolé) dans les commentaires', () => {
  for (const line of robots.split('\n')) {
    if (line.startsWith('#')) {
      assert.doesNotMatch(line, / \? /, `commentaire à réparer: ${line}`);
    }
  }
});
