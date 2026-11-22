const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const metaRobots = (f) => {
  const html = fs.readFileSync(path.join(root, f), 'utf8');
  const m = html.match(/<meta name="robots" content="([^"]*)"/);
  return m ? m[1] : null;
};

// Pages de travail internes : jamais indexées. robots.txt ne Disallow
// explicitement que /espace-prive et /pilotage-* ; la meta robots noindex
// couvre ces pages aussi contre les liens externes.
const INTERNES = ['dyonysos-directions-visuelles.html', 'espace-partenaires.html', 'espace-prive.html', 'out.html'];

test('pages internes : meta robots noindex presente', () => {
  for (const f of INTERNES) {
    const content = metaRobots(f);
    assert.ok(content, `${f} : meta robots absente`);
    assert.ok(content.split(',').map((s) => s.trim()).includes('noindex'), `${f} : noindex absent (content="${content}")`);
  }
});

test('pages publiques : pas de noindex involontaire', () => {
  for (const f of ['defense.html', 'contact.html', 'dyonysos-maquette-entreprise-v2.html', 'halloween-2026.html']) {
    const content = metaRobots(f);
    assert.ok(!content || !content.includes('noindex'), `${f} : noindex inattendu (content="${content}")`);
  }
});
