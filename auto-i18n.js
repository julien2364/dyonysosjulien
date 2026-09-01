(() => {
  const locales = [
    ["fr", "🇫🇷", "Français"],
    ["en", "🇬🇧", "English"],
    ["es", "🇪🇸", "Español"],
    ["it", "🇮🇹", "Italiano"],
    ["pt", "🇵🇹", "Português"],
    ["br", "🇧🇷", "Português (BR)"],
    ["de", "🇩🇪", "Deutsch"],
    ["nl", "🇳🇱", "Nederlands"],
    ["pl", "🇵🇱", "Polski"],
    ["sv", "🇸🇪", "Svenska"],
    ["no", "🇳🇴", "Norsk"],
    ["da", "🇩🇰", "Dansk"],
    ["fi", "🇫🇮", "Suomi"],
    ["el", "🇬🇷", "Ελληνικά"],
    ["bg", "🇧🇬", "Български"],
    ["ro", "🇷🇴", "Română"],
    ["uk", "🇺🇦", "Українська"],
    ["ar", "🇸🇦", "العربية"],
    ["ru", "🇷🇺", "Русский"],
    ["ko", "🇰🇷", "한국어"],
    ["ja", "🇯🇵", "日本語"],
  ];
  const codes = new Set(locales.map((x) => x[0])),
    originals = new Map(),
    skip = new Set([
      "SCRIPT",
      "STYLE",
      "NOSCRIPT",
      "CODE",
      "PRE",
      "SVG",
      "TEXTAREA",
      "INPUT",
      "SELECT",
      "OPTION",
    ]);
  const routeParts = location.pathname.split("/").filter(Boolean),
    source = codes.has(routeParts[0])
      ? routeParts[0]
      : (document.documentElement.lang || "fr").slice(0, 2);
  const blocked = /^\/(?:espace-prive|pilotage-social)(?:\/|$)/.test(
    location.pathname,
  );
  if (blocked) return;
  let busy = false,
    status = "idle";
  const valid = (text) => {
    const value = text.replace(/\s+/g, " ").trim();
    return (
      value.length > 1 &&
      value.length <= 1200 &&
      /\p{L}/u.test(value) &&
      !/^(?:https?:\/\/|www\.|[^\s@]+@[^\s@]+\.[^\s@]+$)/i.test(value)
    );
  };
  const nodes = (onlyNew) => {
    const walker = document.createTreeWalker(
        document.body,
        NodeFilter.SHOW_TEXT,
      ),
      found = [];
    let chars = 0,
      node;
    while ((node = walker.nextNode())) {
      if (onlyNew && originals.has(node)) continue;
      const parent = node.parentElement,
        text = node.nodeValue || "",
        compact = text.replace(/\s+/g, " ").trim();
      if (
        !parent ||
        skip.has(parent.tagName) ||
        parent.closest(
          '[data-no-auto-translate],[contenteditable="true"],[aria-hidden="true"]',
        ) ||
        !valid(text)
      )
        continue;
      if (found.length >= 160 || chars + compact.length > 12000) break;
      found.push(node);
      chars += compact.length;
    }
    return found;
  };
  const restore = () => {
    for (const [node, text] of originals)
      if (node.isConnected) node.nodeValue = text;
    originals.clear();
    document.documentElement.lang = source;
    document.documentElement.dir = source === "ar" ? "rtl" : "ltr";
  };
  const translate = async (target, onlyNew = false) => {
    if (busy || target === source) return;
    const candidates = nodes(onlyNew);
    if (!candidates.length) return;
    busy = true;
    status = "loading";
    paint();
    try {
      const groups = new Map();
      for (const node of candidates) {
        const text = (node.nodeValue || "").replace(/\s+/g, " ").trim();
        originals.set(node, node.nodeValue || "");
        groups.set(text, [...(groups.get(text) || []), node]);
      }
      const entries = [...groups.entries()];
      for (let offset = 0; offset < entries.length; offset += 35) {
        const batch = entries.slice(offset, offset + 35),
          response = await fetch("/api/i18n-translate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              source_language: source,
              target_language: target,
              translations: batch.map(([text], index) => ({
                key: "segment-" + (offset + index),
                text,
              })),
            }),
          }),
          payload = await response.json();
        if (
          !response.ok ||
          payload.ok === false ||
          !Array.isArray(payload.translations)
        )
          throw Error(payload.error || "translation_failed");
        const translated = new Map(
          payload.translations.map((entry) => [entry.key, entry.text]),
        );
        batch.forEach(([original, list], index) => {
          const value = translated.get("segment-" + (offset + index));
          if (value)
            list.forEach((node) => {
              node.nodeValue = (originals.get(node) || original).replace(
                original,
                value,
              );
            });
        });
      }
      document.documentElement.lang = target;
      document.documentElement.dir = target === "ar" ? "rtl" : "ltr";
      status = "ready";
    } catch {
      status = "error";
    } finally {
      busy = false;
      paint();
    }
  };
  const box = document.createElement("div");
  box.dataset.noAutoTranslate = "";
  box.style.cssText =
    "position:fixed;right:14px;bottom:14px;z-index:2147483000;font-family:system-ui,sans-serif";
  box.innerHTML =
    '<label style="display:flex;align-items:center;gap:6px;padding:7px 10px;border:1px solid #cbd5e1;border-radius:999px;background:#fff;color:#0f172a;box-shadow:0 8px 24px rgba(15,23,42,.16);font-size:13px;font-weight:700"><span data-flag></span><select aria-label="Choisir la langue" style="border:0;background:transparent;color:inherit;font:inherit;max-width:142px;outline:none">' +
    locales
      .map(
        ([code, flag, name]) =>
          '<option value="' + code + '">' + flag + " " + name + "</option>",
      )
      .join("") +
    "</select><span data-status></span></label>";
  const select = box.querySelector("select"),
    flag = box.querySelector("[data-flag]"),
    indicator = box.querySelector("[data-status]");
  const paint = () => {
    const item = locales.find((x) => x[0] === select.value) || locales[0];
    flag.textContent = item[1];
    indicator.textContent =
      status === "loading" ? "…" : status === "error" ? "!" : "";
  };
  const choose = (target) => {
    restore();
    localStorage.setItem("dyonysos.autoTranslate.locale", target);
    const url = new URL(location.href);
    target === source
      ? url.searchParams.delete("auto_lang")
      : url.searchParams.set("auto_lang", target);
    history.replaceState(history.state, "", url);
    status = "idle";
    paint();
    if (target !== source) translate(target);
  };
  select.addEventListener("change", () => choose(select.value));
  document.body.appendChild(box);
  const query = new URL(location.href).searchParams.get("auto_lang"),
    saved = localStorage.getItem("dyonysos.autoTranslate.locale"),
    initial = codes.has(query) ? query : codes.has(saved) ? saved : source;
  select.value = initial;
  paint();
  if (initial !== source) setTimeout(() => translate(initial), 250);
})();
