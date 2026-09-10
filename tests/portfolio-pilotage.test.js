const test = require('node:test');
const assert = require('node:assert/strict');

const { DECISION_SNAPSHOT, buildIntegrations } = require('../api/_lib/portfolio-pilotage');

function byId(rows, id) {
  return rows.find((row) => row.id === id);
}

test('sépare le contrôle Amazon urgent de la revue J+7', () => {
  assert.equal(DECISION_SNAPSHOT.state, 'ACCORD_REQUIS');
  assert.match(DECISION_SNAPSHOT.ranking[0].decision, /ACCORD REQUIS/);
  assert.doesNotMatch(DECISION_SNAPSHOT.ranking[0].decision, /\bGO\b/);
  assert.ok(new Date(DECISION_SNAPSHOT.nextActionCheck) < new Date(`${DECISION_SNAPSHOT.confirmedOrder.shipBy}T12:00:00+02:00`));
  assert.ok(new Date(DECISION_SNAPSHOT.nextReview) > new Date(DECISION_SNAPSHOT.nextActionCheck));
});

test('ne confond pas variables présentes et authentification testée', () => {
  const rows = buildIntegrations(
    { configured: true, liveCount: 0, total: 3 },
    { healthy: true, authConfigured: true, note: 'test', services: [{ name: 'Odoo — Email Marketing', reachable: true }] },
    {
      GOOGLE_SERVICE_ACCOUNT_EMAIL: 'present', GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY: 'present', SPREADSHEET_ID: 'present',
      MAKE_API_TOKEN: 'present', ODOO_INTERNE_DB: 'present', ODOO_INTERNE_LOGIN: 'present', ODOO_INTERNE_PASSWORD: 'present',
    },
  );
  assert.equal(byId(rows, 'vercel-analytics').state, 'VARIABLES_PRESENTES_NON_TESTEES');
  assert.equal(byId(rows, 'google-sheets').state, 'VARIABLES_PRESENTES_NON_TESTEES');
  assert.equal(byId(rows, 'make').state, 'VARIABLE_PRESENTE_NON_TESTEE');
  assert.equal(byId(rows, 'odoo-vps').state, 'VARIABLES_PRESENTES_NON_TESTEES');
  assert.equal(byId(rows, 'activepieces').state, 'SANTE_PUBLIQUE_TESTEE');
});

test('n’affiche une lecture Vercel testée qu’après une requête réussie', () => {
  const rows = buildIntegrations(
    { configured: true, liveCount: 1, total: 3 },
    { healthy: false, authConfigured: false, note: 'test', services: [] },
    {},
  );
  assert.equal(byId(rows, 'vercel-analytics').state, 'LECTURE_TESTEE');
  assert.equal(byId(rows, 'google-sheets').state, 'A_CONFIGURER');
  assert.equal(byId(rows, 'activepieces').state, 'A_CONTROLER');
  assert.equal(byId(rows, 'odoo-vps').state, 'A_CONTROLER');
});
