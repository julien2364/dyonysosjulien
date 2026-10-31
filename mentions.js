// DYONYSOS — bandeau légal de pied de page (site statique).
// Le texte exact du bandeau est défini une seule fois dans mentions-config.js.
// - remplace toute ligne « © … Dyonysos / SASU » du pied de page par le bandeau (sans doublon) ;
// - garantit la présence d'un lien vers la page des mentions légales dans le pied de page.
(() => {
  const LIEN_LABELS = { fr: 'Mentions légales', en: 'Legal notice', es: 'Aviso legal', nl: 'Wettelijke vermeldingen', de: 'Impressum' };
  const estLigneEntreprise = (texte) => /dyonysos/i.test(texte) && (/©/.test(texte) || /sasu/i.test(texte));
  const render = () => {
    const cfg = window.DYONYSOS_MENTIONS || {};
    if (!cfg.bandeauMarque) return;
    const texte = String(cfg.bandeauMarque).split('{ANNEE_COURANTE}').join(String(new Date().getFullYear()));
    if (!document.getElementById('dy-mentions-style')) {
      const style = document.createElement('style');
      style.id = 'dy-mentions-style';
      style.textContent = '.dy-bandeau-marque{display:block;max-width:100%;margin:12px auto 0;padding:0 16px;font-size:11.5px;line-height:1.5;font-weight:400;color:#d7e2ee;text-align:center;white-space:normal;overflow-wrap:break-word}.dy-lien-mentions{display:block;width:fit-content;margin:4px auto 0;font-size:11.5px;line-height:1.5;color:#d7e2ee}';
      document.head.appendChild(style);
    }
    let footer = document.querySelector('footer');
    if (!footer) { footer = document.createElement('footer'); document.body.appendChild(footer); }
    footer.querySelectorAll('.dy-bandeau-marque,.dy-lien-mentions').forEach((n) => n.remove());
    const bandeau = document.createElement('div');
    bandeau.className = 'dy-bandeau-marque';
    bandeau.setAttribute('data-dy-bandeau-marque', '');
    bandeau.textContent = texte;
    const walker = document.createTreeWalker(footer, NodeFilter.SHOW_TEXT);
    const lignes = [];
    while (walker.nextNode()) { if (estLigneEntreprise(walker.currentNode.textContent)) lignes.push(walker.currentNode); }
    lignes.forEach((n) => n.remove());
    footer.appendChild(bandeau);
    const parts = location.pathname.split('/').filter(Boolean);
    const lang = ['en', 'es', 'nl', 'de'].includes(parts[0]) ? parts[0] : 'fr';
    if (!footer.querySelector('a[href*="mentions-legales"],a[href$="/legal"]')) {
      const a = document.createElement('a');
      a.className = 'dy-lien-mentions';
      a.href = lang === 'fr' ? '/mentions-legales' : '/' + lang + '/legal';
      a.textContent = LIEN_LABELS[lang] || LIEN_LABELS.fr;
      bandeau.after(a);
    }
  };
  if (window.DYONYSOS_MENTIONS) render();
  else {
    const s = document.createElement('script');
    s.src = '/mentions-config.js';
    s.onload = render;
    document.head.appendChild(s);
  }
})();
