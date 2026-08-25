// api/avatar/chat.js
// Fonction serverless Vercel (Node, CommonJS — même convention que le reste de dyonysos-site).
// Reçoit un message du widget, fait le RAG (Supabase pgvector), appelle le LLM (DeepInfra,
// API compatible OpenAI) en streaming, et relaie la réponse au widget en SSE.
//
// Variables d'environnement requises (à définir sur Vercel) :
//   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY   -> projet "Quizplay & Contacts" (cvmsozjxpjzvyhinvooa)
//   VOYAGE_API_KEY                             -> embeddings (voyage-4-lite)
//   DEEPINFRA_API_KEY                          -> inférence LLM

const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

// Modèles disponibles côté widget (Option C — API managée, pas de self-hosting).
// ⚠️ Les slugs DeepInfra changent parfois : à vérifier sur https://deepinfra.com/models
// avant premier déploiement.
const MODEL_MAP = {
  // vérifié via recherche web — slug Turbo confirmé disponible et documenté sur DeepInfra.
  "llama-3.3-70b": "meta-llama/Llama-3.3-70B-Instruct-Turbo",
  // vérifié via recherche web — le slug nu "Qwen3-235B-A22B" (sans suffixe) renvoie une 404 ;
  // la révision "2507" (Instruct) ci-dessous est la version disponible et fonctionnelle.
  "qwen3-235b": "Qwen/Qwen3-235B-A22B-Instruct-2507",
  // vérifié via recherche web — slug canonique le plus référencé (DeepInfra, Vercel AI Gateway, TypingMind).
  // Une variante "meta-llama/Llama-4-Maverick-17B-128E-Instruct-Turbo" est aussi active si inférence plus rapide souhaitée.
  "llama-4-maverick": "meta-llama/Llama-4-Maverick-17B-128E-Instruct-FP8",
  // A VERIFIER - modele peut-etre indisponible, voir alternative: "moonshotai/Kimi-K2-Instruct"
  // (confirmé disponible sur DeepInfra). "Kimi-K2.6" apparaît dans le listing DeepInfra comme version
  // plus récente de la famille K2, mais n'a pas pu être vérifié à 100 % (page fortement dynamique/JS) —
  // à confirmer manuellement sur https://deepinfra.com/models/text-generation avant mise en prod.
  "kimi-k2.6": "moonshotai/Kimi-K2.6",
};
const DEFAULT_MODEL = "llama-3.3-70b";

module.exports = async function handler(req, res) {
  if (req.method === "OPTIONS") {
    applyCors(req, res, null);
    res.status(204).end();
    return;
  }
  if (req.method !== "POST") {
    res.status(405).json({ error: "method_not_allowed" });
    return;
  }

  const { siteKey, avatarId, sessionId, message, model } = req.body || {};
  if (!siteKey || !message || !sessionId) {
    res.status(400).json({ error: "missing_fields" });
    return;
  }

  // 1) Le site est-il enregistré, et l'origine correspond-elle ? (whitelist CORS + clé publique)
  const { data: site, error: siteErr } = await supabase
    .from("avatar_sites")
    .select("site_key, allowed_origin, visibility_scope")
    .eq("site_key", siteKey)
    .single();

  if (siteErr || !site) {
    res.status(403).json({ error: "unknown_site" });
    return;
  }
  const originOk = applyCors(req, res, site.allowed_origin);
  if (!originOk) {
    res.status(403).json({ error: "origin_not_allowed" });
    return;
  }

  try {
    // 2) Embedding de la question (Voyage)
    const queryEmbedding = await embed(message);

    // 3) Retrieval Supabase pgvector — jamais de contenu "confidential" (Dyonysos professionnel),
    //    et le contenu "internal" seulement si le site est explicitement scope=internal.
    const { data: matches, error: matchErr } = await supabase.rpc("match_avatar_documents", {
      query_embedding: queryEmbedding,
      p_site_key: siteKey,
      p_include_internal: site.visibility_scope === "internal",
      p_match_count: 6,
    });
    if (matchErr) throw matchErr;

    const context = (matches || [])
      .map((m, i) => `[Source ${i + 1}${m.source_title ? " — " + m.source_title : ""}]\n${m.content}`)
      .join("\n\n");

    const systemPrompt = [
      "Tu es l'assistant conversationnel du site. Réponds en français, de façon claire et concise.",
      `Ton de voix à incarner : ${avatarVoiceHint(avatarId)}`,
      "Ce ton habille uniquement la forme : les règles suivantes priment toujours et ne changent jamais.",
      "Appuie-toi UNIQUEMENT sur le contexte documentaire fourni ci-dessous.",
      "Si l'information n'y figure pas, dis-le clairement plutôt que d'inventer une réponse.",
      "",
      "Contexte documentaire :",
      context || "(aucune source pertinente trouvée)",
    ].join("\n");

    // 4) Log du message utilisateur (best-effort, ne bloque pas la réponse)
    supabase.from("avatar_conversations").insert({
      site_key: siteKey, session_id: sessionId, role: "user", content: message,
    }).then(() => {}, () => {});

    // 5) Appel DeepInfra en streaming, relayé en SSE
    const modelSlug = MODEL_MAP[model || avatarModelHint(avatarId)] || MODEL_MAP[DEFAULT_MODEL];

    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    });

    const upstream = await fetch("https://api.deepinfra.com/v1/openai/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.DEEPINFRA_API_KEY}`,
      },
      body: JSON.stringify({
        model: modelSlug,
        stream: true,
        temperature: 0.3,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message },
        ],
      }),
    });

    if (!upstream.ok || !upstream.body) {
      // Sans ce garde-fou, une erreur DeepInfra (clé invalide, modèle indisponible, quota...)
      // produit un corps JSON (pas du SSE) que la boucle ci-dessous ignore silencieusement :
      // le widget reçoit juste [DONE] sans aucun delta -> bulle vide, sans trace de la vraie cause.
      const errText = await upstream.text().catch(() => "(corps illisible)");
      console.error("[avatar/chat] DeepInfra upstream error", upstream.status, errText);
      res.write(`data: ${JSON.stringify({ delta: " [erreur DeepInfra " + upstream.status + "]" })}\n\n`);
      res.write("data: [DONE]\n\n");
      res.end();
      return;
    }

    let fullReply = "";
    const reader = upstream.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop();
      for (const line of lines) {
        if (!line.startsWith("data:")) continue;
        const payload = line.slice(5).trim();
        if (payload === "[DONE]") continue;
        try {
          const json = JSON.parse(payload);
          const delta = json.choices?.[0]?.delta?.content;
          if (delta) {
            fullReply += delta;
            res.write(`data: ${JSON.stringify({ delta })}\n\n`);
          }
        } catch (e) { /* ligne partielle */ }
      }
    }
    res.write("data: [DONE]\n\n");
    res.end();

    // 6) Log de la réponse assistant (après coup, best-effort)
    supabase.from("avatar_conversations").insert({
      site_key: siteKey, session_id: sessionId, role: "assistant", content: fullReply, model: modelSlug,
    }).then(() => {}, () => {});
  } catch (err) {
    console.error("[avatar/chat]", err);
    if (!res.headersSent) {
      res.status(500).json({ error: "internal_error" });
    } else {
      res.write(`data: ${JSON.stringify({ delta: " [erreur interne]" })}\n\n`);
      res.end();
    }
  }
};

// Roster complet (8 avatars, cf. artefact "La Troupe") : clio, ember, quartz, ferdinand,
// leo, alix, odette, gaston. Répartition par capacité/coût :
//   - clio, ember, leo, alix   : personas grand public à fort volume -> modèle rapide/économique.
//   - odette, gaston           : personas pédagogiques/patientes -> modèle intermédiaire.
//   - quartz                   : persona ERP/interne, questions plus techniques -> modèle intermédiaire capable.
//   - ferdinand                : persona expert/savant -> modèle le plus capable (haut de gamme).
function avatarModelHint(avatarId) {
  // Mappe l'avatar choisi côté widget à un modèle par défaut si aucun `model` explicite
  // n'est fourni. Purement indicatif — à ajuster une fois les modèles testés en prod.
  const HINTS = {
    clio: "llama-3.3-70b",
    ember: "llama-3.3-70b",
    leo: "llama-3.3-70b",
    alix: "llama-3.3-70b",
    quartz: "qwen3-235b",
    ferdinand: "llama-4-maverick",
    odette: "qwen3-235b",
    gaston: "qwen3-235b",
  };
  return HINTS[avatarId] || DEFAULT_MODEL;
}

// Voix textuelle propre à chaque avatar (cf. artefact "La Troupe") — n'affecte QUE le style
// de la réponse (ton, rythme, registre) ; les règles factuelles (français, contexte documentaire
// uniquement, "je ne sais pas" si absent) restent identiques pour tous les avatars, cf. systemPrompt.
const AVATAR_VOICE = {
  clio: "Chaleureuse et efficace, tu vas droit au but, avec l'accueil convivial de la vitrine du site.",
  ember: "Énergique et enthousiaste, tu adoptes un ton commercial dynamique, un brin passionné.",
  quartz: "Précise, technique et pédagogue, tu emploies un vocabulaire métier adapté à un usage interne (ERP).",
  ferdinand: "Savant bienveillant façon vieux professeur (clin d'œil à Einstein), tu prends le temps d'expliquer le pourquoi avec des phrases posées, jamais condescendant.",
  leo: "Jeune et direct, tu parles avec des phrases courtes, familier mais toujours professionnel.",
  alix: "Jeune et chaleureuse, tu formules tes réponses de façon claire et rassurante.",
  odette: "Douce et patiente, tu prends le temps d'expliquer comme à un néophyte, sans jamais être infantilisante.",
  gaston: "Posé et rassurant, tu t'exprimes comme un artisan expérimenté qui a tout vu.",
};
const DEFAULT_VOICE = "Neutre, claire et professionnelle.";

// Renvoie la description de ton à injecter dans systemPrompt pour l'avatar actif,
// avec un repli neutre si avatarId est absent ou inconnu.
function avatarVoiceHint(avatarId) {
  return AVATAR_VOICE[avatarId] || DEFAULT_VOICE;
}

async function embed(text) {
  const r = await fetch("https://api.voyageai.com/v1/embeddings", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.VOYAGE_API_KEY}`,
    },
    body: JSON.stringify({ input: [text], model: "voyage-4-lite", output_dimension: 1024 }),
  });
  if (!r.ok) throw new Error("voyage_embed_failed_" + r.status);
  const json = await r.json();
  return json.data[0].embedding;
}

// Normalise apex vs www (ex: "https://dyonysos.fr" et "https://www.dyonysos.fr" doivent être
// considérés comme la même origine) pour éviter un CORS cassé selon que Vercel redirige ou non
// l'apex vers www côté DNS/domaine (un seul allowed_origin est stocké côté Supabase).
function normalizeOrigin(o) {
  if (!o) return "";
  return o.replace(/^https?:\/\/www\./i, "https://").replace(/\/$/, "");
}

// Autorise l'origine si elle correspond au site enregistré ; renvoie true/false.
function applyCors(req, res, allowedOrigin) {
  const origin = req.headers.origin;
  if (!allowedOrigin) {
    // pré-vol générique (avant qu'on connaisse le site) : on laisse passer le OPTIONS,
    // la vraie vérification a lieu sur le POST.
    res.setHeader("Access-Control-Allow-Origin", origin || "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    return true;
  }
  if (normalizeOrigin(origin) !== normalizeOrigin(allowedOrigin)) return false;
  res.setHeader("Access-Control-Allow-Origin", origin);
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  return true;
}
