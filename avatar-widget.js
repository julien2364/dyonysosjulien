/**
 * Widget Avatar IA — Dyonysos
 * Servi en same-origin depuis dyonysos.fr (pas de sous-domaine avatar.dyonysos.fr séparé) :
 *   <script src="/avatar-widget.js"
 *           data-site-key="dyonysos-fr"
 *           data-api-base="https://www.dyonysos.fr"
 *           data-default-avatar="ferdinand"
 *           data-avatars="clio,ember,quartz,ferdinand,leo,alix,odette,gaston"
 *           data-greeting="Comment puis-je vous aider aujourd'hui ?"
 *           data-greeting-delay="4000"
 *           defer></script>
 *
 * Aucune dépendance externe. Un seul fichier, un seul <script>.
 */
(function () {
  "use strict";

  var scriptTag = document.currentScript;
  if (!scriptTag) return;

  var CONFIG = {
    siteKey: scriptTag.getAttribute("data-site-key"),
    apiBase: (scriptTag.getAttribute("data-api-base") || "").replace(/\/$/, ""),
    defaultAvatar: scriptTag.getAttribute("data-default-avatar") || "clio",
    avatars: (scriptTag.getAttribute("data-avatars") || "clio,ember,quartz,ferdinand,leo,alix,odette,gaston")
      .split(",").map(function (s) { return s.trim(); }).filter(Boolean),
    greeting: scriptTag.getAttribute("data-greeting") || "Comment puis-je vous aider aujourd'hui ?",
    greetingDelay: parseInt(scriptTag.getAttribute("data-greeting-delay") || "4000", 10),
  };

  if (!CONFIG.siteKey || !CONFIG.apiBase) {
    console.warn("[avatar-widget] data-site-key et data-api-base sont requis — widget non initialisé.");
    return;
  }

  // ---------- petites signatures visuelles par avatar (8 avatars, cohérentes avec "La Troupe") ----------
  var AVATARS = {
    clio:      { label: "Clio",      accent: "#d9a34a", glyph: "C" },
    ember:     { label: "Ember",     accent: "#cf2a49", glyph: "E" },
    quartz:    { label: "Quartz",    accent: "#3fa38c", glyph: "Q" },
    ferdinand: { label: "Ferdinand", accent: "#b8863e", glyph: "F", photo: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAcFBQYFBAcGBgYIBwcICxILCwoKCxYPEA0SGhYbGhkWGRgcICgiHB4mHhgZIzAkJiorLS4tGyIyNTEsNSgsLSz/2wBDAQcICAsJCxULCxUsHRkdLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCz/wAARCABgAGADASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwD1VUqQLTlWpFWkUNVaeqEnA6mp1tyYg4ySSAAKi1LVG0NVxD8n/LSbGcf/AFqTdhpXJ4rSRpFDRNt6nII4qX7BhyWcInYnkn8KpprBM9sxcATnbx0JHINXoJjPAsjHcW5qeYfKRtaovSUf8CGKi2HOAMn2rSjuGjj2kA+9NWYFyFjWPPVl601ILGc0TKcMpB9CMUwrWjJEWUj53HUHOcVUZaadxFcjFMIqwy1Gy0xEarUirSLUq7QQCQCegoAx9Wvb21vHSEuVcKUUd+MVkSzXsUTy3EYZSDuAYtx7g9a6u/u7eJEjIXzM98EjP8uKx9WvY4dJlkBIB4X5Qck9OtYTaV2bQTdkcda+IFeJrAyYngfzbds5zjt9COK6/Qdca5tWjaORCCWXchHXqPwNZGj21rbxgQxIpY5Ygck+tdFD06frXmvFSv7p6X1WKWpehvJBGPlO7bjmpI77a211K56D1/GmQKXHyqT9Kbcx/KVcFc/p71pGvNay2MXQg9FuXQ0yEOgyp6qWzmrBjjceZvwOpUjms63nkS2G8oR6Ywfw9atxXloyqXdGLcDB5rvjI4ZIjZeaiZatSoFbg5B5BqAitjMgUc1Hd2Ru418uUxSpyrYyPoRUyjNSNIsMZkZWYDqFGT+VDt1A4XWxqEE0ETtGokkwduckevNHie9Q+HlVW6SqQKNd8RRy6ggWMrvXOduWHt0NcZreuC/hEdoDJEjDcx6k54GPxrhqNWaR20k+ZS7G5D4ofT41js443kAG6SRsDPoAOTW7pHihtYJScoLhByFGAR7VwWpW+oweC7u50+OR7mKNTHGhI3Et8znHJwOg6c5OcVT+H02r6jqdkZkubdipEkkxDM2ANzdBgEkAdfTJrkkm4XvZdjvjyqpZq77no2s6jc2cpFveyxE/OwUqAg6ZLNwBxVjRdavpk23VzHdWxOBLlSUb0JXj+Vcj8RPCmua7pF1aadITcfaFnHzbTNHsxgem0/zrd0Gw1Cy8FwJrAgGsSq8RWBAoKniOPjqV5OecAnsKS+D4vkKXxW5fmdhFqUagQSZz7DJx647irEUViZc+V/rer7dv6Hn8a47VNMKQraxtL9tkwftnJZRgHG7rzz+dWdF0Wc6nH/xMJVl2guzEsxOPc8iuqlVTagjlq0HGLqPudwsUkUCLJ94DHNRkVIqeXGFLFyO570xutegtjzupXSpkqBDUymmBWn022M8995QM5hZDgdRj9PSvAbu0udM1tLiJG+zmXewHRlDZPXrivoxTWD4i8OQX2hPa2tmskpYmMZACZIJ69uK5a9Hn1jujrw2I9leMtUzhoNSkS/ks7NolQN8hlGRg85GOcYonstbsdWFzaSRag0mA+wBCv+yB6VX1zwXqWh6XJevIpgtIA9xKXCKo6YBPXArF0K5a5lDRapMN/IPmZ3d+tec4KndVEenGbqWlSaPUbOxlvbES6zcCAYDCOJ/mQjuX/oKqSpa6fek2spusj/Wu+9l/2c/iOlZ8dnZw2Re9ufPQDJEkhIH51n2Go22ua3/Y1hcR2chjMkG9Cqz4OGVWHGRip92p7lOIa0251JfgdLFqR1K4uksrZp5rVduSRtcgDOPXnP5V0WjoJtPgllQrNGT1GCM1W0XwvBpMK7ZJVY8sm4MA3fBxmtxjXqUaCp6nlVq7qadBjGomqRqhY10nMVVPNTKarKamRqQFlTVbU9YsdGtTPfXCxKOg6s3sBVXXNXi0PQ7nUJWAES/Lnux4H6184614hvtbkLXl07bmCkluh9aznU5dEa06fNqzc+J/jK+8XWk9pAXg00P+7iz98L/E3qSfyri7JswwSRXbWriMDeM4OB3H6VpxW7NCLeWV5uql36ntS+A/B154phmglmjt7aybZJIQGkPXG0f1Nckvf3OuFoPQ0NL1TTUCtrupXV0VYAWsA5f3LHAA/M11Pi++08avoS6RGLdbeyWdNvBQSHKr9eCT9azfE/whvtLK3Ol3IvrZV3StckK0WOrZ9Mc1z1hPJeXU1wW4UJCn+6ihQP0qFFRTsXKo5tXZ7H4Q+IscsP2LWXKyIQEnPOQezf4136TRzxCWKRZI26MpyDXzMEEcxkDMXc/xHOPp7V2PgXxTNp+vRW00zG1lYRFc5GT3/Ct6dZrSRhUop6xPZ2NQsaex5qImuw4impqZTVdTUqmkM4P4x6l9m8L29oD/AMfMvzD2A/xrwO5Zi0tsSSGUEHvxxXpvxc1M3vihbJSdlqgB9M9T/OvLLpz/AGsPZP61ySd5M64q0UdHpF4Lu2ikc/vEOyT6j/Oau+ENfPhzxlKWbFrcuYJgTwAWyG/A/pmuc02b7PqgjPEdyOPQMP8A61N1Jgmp3BxwSD+YFTFatDm9Ez2f4reLVtNMXQ7SXMlyoecg52x9lz7/AMh715voxK2CNxlvmyegzzzXPXt1NNE8kszTOyhd5JJ6AAZPp0roISFt44h3HOPQUpqysOm7u5YeQbXkbIBHH0pmlXDieKZW+ZWDj881FqBCWMxzxsJH5VDpUwMS4Pas7aGt9T6esrpbzTre5U5Esav+YqQmuZ+H+o/bvCcKk5e3Yxkeg6iujJr0IPmimcE1yyaP/9k=" },
    leo:       { label: "Léo",       accent: "#4fb6a8", glyph: "L", photo: "data:image/jpeg;base64,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" },
    alix:      { label: "Alix",      accent: "#e0708a", glyph: "A", photo: "data:image/jpeg;base64,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" },
    odette:    { label: "Odette",    accent: "#9c7ab0", glyph: "O", photo: "data:image/jpeg;base64,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" },
    gaston:    { label: "Gaston",    accent: "#5c8a63", glyph: "G", photo: "data:image/jpeg;base64,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" },
  };

  var state = {
    avatarId: AVATARS[CONFIG.defaultAvatar] ? CONFIG.defaultAvatar : "clio",
    open: false,
    sessionId: getOrCreateSessionId(),
    greeted: false,
  };

  function getOrCreateSessionId() {
    try {
      var k = "avatar_ia_session_" + CONFIG.siteKey;
      var existing = sessionStorage.getItem(k);
      if (existing) return existing;
      var id = "s_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 8);
      sessionStorage.setItem(k, id);
      return id;
    } catch (e) {
      return "s_" + Date.now();
    }
  }

  // ---------- styles ----------
  var style = document.createElement("style");
  style.textContent = [
    ".avia-root{position:fixed;bottom:20px;right:20px;z-index:2147483000;font-family:system-ui,-apple-system,'Segoe UI',sans-serif;}",
    ".avia-btn{width:60px;height:60px;border-radius:50%;border:none;cursor:pointer;",
    "  box-shadow:0 8px 24px rgba(0,0,0,.25);display:flex;align-items:center;justify-content:center;",
    "  color:#fff;font-weight:700;font-size:1.3rem;transition:transform .15s ease;}",
    ".avia-btn:hover{transform:scale(1.06);}",
    ".avia-bubble{position:absolute;bottom:72px;right:0;background:#fff;color:#1a1219;padding:.7em .9em;",
    "  border-radius:14px;max-width:220px;font-size:.86rem;box-shadow:0 10px 26px rgba(0,0,0,.2);",
    "  opacity:0;transform:translateY(6px);pointer-events:none;transition:opacity .25s ease, transform .25s ease;}",
    ".avia-bubble.show{opacity:1;transform:translateY(0);pointer-events:auto;cursor:pointer;}",
    ".avia-panel{position:absolute;bottom:76px;right:0;width:320px;max-width:88vw;height:440px;",
    "  background:#fff;border-radius:16px;box-shadow:0 20px 50px rgba(0,0,0,.3);display:none;",
    "  flex-direction:column;overflow:hidden;}",
    ".avia-panel.open{display:flex;}",
    ".avia-head{padding:.8em 1em;display:flex;align-items:center;justify-content:space-between;color:#fff;}",
    ".avia-head-left{display:flex;align-items:center;gap:.6em;}",
    ".avia-avatar-dot{width:26px;height:26px;border-radius:50%;background:rgba(255,255,255,.25);",
    "  display:flex;align-items:center;justify-content:center;font-size:.8rem;font-weight:800;}",
    ".avia-switch{display:flex;gap:.3em;}",
    ".avia-switch button{width:20px;height:20px;border-radius:50%;border:none;cursor:pointer;padding:0;opacity:.7;transition:opacity .15s ease, transform .15s ease;}",
    ".avia-switch button.active{opacity:1;transform:scale(1.18);}",
    ".avia-close{background:none;border:none;color:#fff;font-size:1.1rem;cursor:pointer;opacity:.85;}",
    ".avia-body{flex:1;overflow-y:auto;padding:.8em;display:flex;flex-direction:column;gap:.5em;background:#f7f5f2;}",
    ".avia-msg{max-width:82%;padding:.55em .75em;border-radius:12px;font-size:.87rem;line-height:1.4;}",
    ".avia-msg.user{align-self:flex-end;background:#1a1219;color:#fff;border-bottom-right-radius:3px;}",
    ".avia-msg.assistant{align-self:flex-start;background:#fff;color:#1a1219;border:1px solid #e6e1da;border-bottom-left-radius:3px;}",
    ".avia-form{display:flex;gap:.5em;padding:.7em;border-top:1px solid #eee;background:#fff;}",
    ".avia-input{flex:1;border:1px solid #ddd;border-radius:10px;padding:.55em .7em;font-size:.87rem;}",
    ".avia-send{border:none;border-radius:10px;padding:.55em .9em;color:#fff;font-weight:700;cursor:pointer;}",
  ].join("\n");
  document.head.appendChild(style);

  // ---------- DOM ----------
  var root = document.createElement("div");
  root.className = "avia-root";

  var bubble = document.createElement("div");
  bubble.className = "avia-bubble";
  bubble.textContent = CONFIG.greeting;

  var btn = document.createElement("button");
  btn.className = "avia-btn";
  btn.setAttribute("aria-label", "Ouvrir l'assistant");

  var panel = document.createElement("div");
  panel.className = "avia-panel";

  var head = document.createElement("div");
  head.className = "avia-head";

  var headLeft = document.createElement("div");
  headLeft.className = "avia-head-left";
  var dot = document.createElement("div");
  dot.className = "avia-avatar-dot";
  var label = document.createElement("strong");
  label.style.fontSize = ".85rem";
  headLeft.appendChild(dot);
  headLeft.appendChild(label);

  var switchWrap = document.createElement("div");
  switchWrap.className = "avia-switch";
  CONFIG.avatars.forEach(function (id) {
    if (!AVATARS[id]) return;
    var ai = AVATARS[id];
    var b = document.createElement("button");
    b.style.setProperty("border-radius", "50%", "important");
    if (ai.photo) {
      b.style.setProperty("background-image", "url('" + ai.photo + "')", "important");
      b.style.setProperty("background-size", "cover", "important");
      b.style.setProperty("background-position", "center", "important");
      b.style.setProperty("background-color", "transparent", "important");
    } else {
      b.style.setProperty("background-image", "none", "important");
      b.style.setProperty("background-color", ai.accent, "important");
    }
    b.title = ai.label;
    b.addEventListener("click", function () { setAvatar(id); });
    switchWrap.appendChild(b);
  });

  var closeBtn = document.createElement("button");
  closeBtn.className = "avia-close";
  closeBtn.textContent = "✕";
  closeBtn.style.setProperty("background", "none", "important");
  closeBtn.style.setProperty("border-radius", "0", "important");
  closeBtn.style.setProperty("box-shadow", "none", "important");
  closeBtn.addEventListener("click", function () { togglePanel(false); });

  var headRight = document.createElement("div");
  headRight.style.display = "flex";
  headRight.style.alignItems = "center";
  headRight.style.gap = ".5em";
  headRight.appendChild(switchWrap);
  headRight.appendChild(closeBtn);

  head.appendChild(headLeft);
  head.appendChild(headRight);

  var body = document.createElement("div");
  body.className = "avia-body";

  var form = document.createElement("form");
  form.className = "avia-form";
  var input = document.createElement("input");
  input.className = "avia-input";
  input.type = "text";
  input.placeholder = "Écrivez votre question...";
  var send = document.createElement("button");
  send.className = "avia-send";
  send.type = "submit";
  send.textContent = "Envoyer";
  form.appendChild(input);
  form.appendChild(send);

  panel.appendChild(head);
  panel.appendChild(body);
  panel.appendChild(form);

  root.appendChild(bubble);
  root.appendChild(panel);
  root.appendChild(btn);
  document.body.appendChild(root);

  function setAvatar(id) {
    state.avatarId = id;
    var a = AVATARS[id];
    // Le site force `button{background:...!important;border-radius:9px!important}` (theme.css).
    // On reprend la main avec des !important en inline — seule priorité qui bat un !important externe.
    if (a.photo) {
      dot.style.setProperty("background-image", "url('" + a.photo + "')", "important");
      dot.style.setProperty("background-size", "cover", "important");
      dot.style.setProperty("background-position", "center", "important");
      dot.style.setProperty("background-color", "transparent", "important");
      dot.textContent = "";
      btn.style.setProperty("background-image", "url('" + a.photo + "')", "important");
      btn.style.setProperty("background-size", "cover", "important");
      btn.style.setProperty("background-position", "center", "important");
      btn.style.setProperty("background-color", a.accent, "important");
    } else {
      dot.style.setProperty("background-image", "none", "important");
      dot.style.setProperty("background-color", a.accent, "important");
      dot.textContent = a.glyph;
      btn.style.setProperty("background-image", "none", "important");
      btn.style.setProperty("background-color", a.accent, "important");
    }
    btn.style.setProperty("border-radius", "50%", "important");
    dot.style.setProperty("border-radius", "50%", "important");
    label.textContent = a.label;
    head.style.setProperty("background", a.accent, "important");
    send.style.setProperty("background-color", a.accent, "important");
    send.style.setProperty("background-image", "none", "important");
    send.style.setProperty("border-radius", "10px", "important");
    Array.prototype.forEach.call(switchWrap.children, function (b, i) {
      b.classList.toggle("active", CONFIG.avatars[i] === id);
    });
  }
  setAvatar(state.avatarId);

  function togglePanel(force) {
    state.open = typeof force === "boolean" ? force : !state.open;
    panel.classList.toggle("open", state.open);
    bubble.classList.remove("show");
    if (state.open) {
      addMessage("assistant", CONFIG.greeting);
      input.focus();
    }
  }
  btn.addEventListener("click", function () { togglePanel(); });
  bubble.addEventListener("click", function () { togglePanel(true); });

  // message d'ouverture proactif
  setTimeout(function () {
    if (!state.open && !state.greeted) {
      state.greeted = true;
      bubble.classList.add("show");
    }
  }, CONFIG.greetingDelay);

  function addMessage(role, text) {
    var el = document.createElement("div");
    el.className = "avia-msg " + role;
    el.textContent = text;
    body.appendChild(el);
    body.scrollTop = body.scrollHeight;
    return el;
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var text = input.value.trim();
    if (!text) return;
    input.value = "";
    addMessage("user", text);
    var replyEl = addMessage("assistant", "");
    streamReply(text, replyEl);
  });

  function streamReply(message, replyEl) {
    fetch(CONFIG.apiBase + "/api/avatar/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        siteKey: CONFIG.siteKey,
        avatarId: state.avatarId,
        sessionId: state.sessionId,
        message: message,
      }),
    })
      .then(function (res) {
        if (!res.ok || !res.body) throw new Error("HTTP " + res.status);
        var reader = res.body.getReader();
        var decoder = new TextDecoder();
        var buffer = "";

        function pump() {
          return reader.read().then(function (chunk) {
            if (chunk.done) return;
            buffer += decoder.decode(chunk.value, { stream: true });
            var lines = buffer.split("\n");
            buffer = lines.pop();
            lines.forEach(function (line) {
              if (!line.startsWith("data:")) return;
              var payload = line.slice(5).trim();
              if (payload === "[DONE]") return;
              try {
                var json = JSON.parse(payload);
                if (json.delta) {
                  replyEl.textContent += json.delta;
                  body.scrollTop = body.scrollHeight;
                }
              } catch (err) { /* ligne partielle, ignorée */ }
            });
            return pump();
          });
        }
        return pump();
      })
      .catch(function () {
        replyEl.textContent = "Désolé, une erreur est survenue. Réessayez dans un instant.";
      });
  }
})();
