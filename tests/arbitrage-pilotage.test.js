const test = require('node:test');
const assert = require('node:assert/strict');
const { buildDashboard } = require('../api/_lib/arbitrage-pilotage');

const snapshot = {
  ok: true,
  state: 'live',
  value: {
    captured_at: '2026-09-08T20:00:00.000Z',
    trial: { jours_essai_plan: 7, recherches_essai: 30, analyses_essai: 50 },
    accounts: { accounts: 12 },
    subscriptions: { active: 0, trialing: 0, last_update: '2026-09-08T19:00:00.000Z' },
    usage: { users: 1, searches: 2, analyses: 3 },
    saved_searches: { total: 4 },
    products: { total: 5 },
    social: {
      by_status: { publie: 477, a_valider: 44, rejete: 46, ignore: 3689 },
      by_channel: { facebook: { published: 159, to_review: 15, failed: 0 } },
    },
    functional_checks: { total: 7, ok: 7, failed: 0, last_update: '2026-09-08T18:00:00.000Z' },
  },
};

test('construit un cockpit probant à partir des agrégats live', () => {
  const dashboard = buildDashboard(snapshot, {
    ok: true,
    state: 'live',
    value: { visitors30d: 42, pageviews30d: 160, capturedAt: '2026-09-08T20:00:00.000Z' },
  }, new Date('2026-09-08T20:10:00.000Z'));

  assert.equal(dashboard.kpis.visitors30d, 42);
  assert.equal(dashboard.kpis.accounts, 12);
  assert.equal(dashboard.kpis.activePaid, 0);
  assert.equal(dashboard.trial.days, 7);
  assert.equal(dashboard.trial.searches, 30);
  assert.equal(dashboard.trial.analyses, 50);
  assert.equal(dashboard.gates.find((gate) => gate.id === 'funnel').status, 'go');
  assert.equal(dashboard.gates.find((gate) => gate.id === 'tax').proof, 'À CONFIRMER');
  assert.match(dashboard.verdict.acquisition, /^GO/);
  assert.equal(dashboard.channels.paid.state, 'go_authorized');
  assert.equal(dashboard.channels.paid.budgetAuthorized, null);
  assert.match(dashboard.projections.warning, /pas des garanties de vente/);
});

test('n’invente pas le trafic quand Analytics est indisponible', () => {
  const dashboard = buildDashboard(snapshot, {
    ok: false,
    state: 'not_configured',
    value: null,
  }, new Date('2026-09-08T20:10:00.000Z'));

  assert.equal(dashboard.kpis.visitors30d, null);
  assert.equal(dashboard.funnel[0].value, null);
  assert.equal(dashboard.funnel[0].proof, 'À CONFIRMER');
});

test('la réponse agrégée ne contient pas de donnée personnelle', () => {
  const dashboard = buildDashboard(snapshot, { ok: false, state: 'error', value: null });
  const serialized = JSON.stringify(dashboard);

  assert.doesNotMatch(serialized, /@/);
  assert.doesNotMatch(serialized, /stripe_(customer|subscription)_id/i);
  assert.doesNotMatch(serialized, /user_id/i);
});

test('enregistre le GO sans déclarer la bascule complète avant la preuve réseau', () => {
  const dashboard = buildDashboard(snapshot, { ok: false, state: 'not_configured', value: null }, new Date(), {
    automation: { reachable: true, status: 200, checkedAt: '2026-09-08T21:00:00.000Z' },
    odoo: { reachable: true, status: 200, checkedAt: '2026-09-08T21:00:00.000Z' },
    postiz: { reachable: true, status: 200, checkedAt: '2026-09-08T21:00:00.000Z' },
  });

  assert.equal(dashboard.internalEngines.allOperational, false);
  assert.equal(dashboard.internalEngines.decision, 'GO');
  assert.equal(dashboard.internalEngines.checklist[0].done, true);
  assert.equal(dashboard.internalEngines.checklist[3].done, true);
  assert.equal(dashboard.internalEngines.checklist[1].done, false);
  assert.equal(dashboard.channels.email.vps.cutoverEligible, true);
  assert.equal(dashboard.channels.email.vps.testAccepted, true);
  assert.equal(dashboard.internalEngines.services.find((item) => item.id === 'odoo').cutoverEligible, true);
  assert.equal(dashboard.internalEngines.services.find((item) => item.id === 'postiz').cutoverEligible, false);
});
