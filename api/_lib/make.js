// Client Make.com — déclenche un scénario "on-demand" (ex: [CE] B. GENERATOR) via l'API Make.
// Nécessite un token API Make (Profil > API dans Make) avec le scope "scenarios:run",
// dans les variables d'environnement Vercel :
//   MAKE_API_TOKEN, MAKE_ZONE (ex "eu2.make.com" — visible dans l'URL de ton compte Make)
//
// Team Make des scénarios [CE] : 111657 (voir CONFIG dans le classeur).

const SCENARIO_IDS = {
  A_PLANNER: 9662486,
  B_GENERATOR: 9662485,
  C_ASSET: 9662489,
  D_PUBLISHER: 9662484,
};

function assertConfigured() {
  const missing = ["MAKE_API_TOKEN", "MAKE_ZONE"].filter((k) => !process.env[k]);
  if (missing.length) {
    const err = new Error(`Make non configuré — variables manquantes: ${missing.join(", ")}`);
    err.code = "NOT_CONFIGURED";
    throw err;
  }
}

async function runScenario(scenarioKey) {
  assertConfigured();
  const scenarioId = SCENARIO_IDS[scenarioKey];
  if (!scenarioId) throw new Error(`Scénario inconnu: ${scenarioKey}`);

  const res = await fetch(`https://${process.env.MAKE_ZONE}/api/v2/scenarios/${scenarioId}/run`, {
    method: "POST",
    headers: {
      Authorization: `Token ${process.env.MAKE_API_TOKEN}`,
      "Content-Type": "application/json",
    },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Make run échoué (${res.status}): ${text}`);
  }
  return res.json();
}

module.exports = { runScenario, SCENARIO_IDS };
