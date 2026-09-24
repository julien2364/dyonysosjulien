// Article du blog rendu côté serveur : HTML complet, <title>, description, canonique, hreflang et html lang.
const { loadData, renderArticle } = require('./_lib/seo-article');

let data;

module.exports = (req, res) => {
  data = data || loadData();
  const lang = String(req.query.lang || 'fr');
  const slug = String(req.query.slug || '');
  const { status, html } = renderArticle(data, lang, slug);
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', status === 200 ? 'public, s-maxage=3600, stale-while-revalidate=86400' : 'public, s-maxage=300');
  return res.status(status).send(html);
};
