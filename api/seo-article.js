// Pages éditoriales rendues côté serveur : HTML complet, <title>, description, canonique, hreflang et html lang.
// ?page=article&slug=… (défaut), ?page=product&slug=…, ?page=blog ; ?lang=fr|en|es|nl|de.
const { loadData, renderArticle, renderProduct, renderBlogIndex } = require('./_lib/seo-article');

let data;

module.exports = (req, res) => {
  data = data || loadData();
  const lang = String(req.query.lang || 'fr');
  const slug = String(req.query.slug || '');
  const kind = String(req.query.page || 'article');
  const { status, html } = kind === 'blog' ? renderBlogIndex(data, lang)
    : kind === 'product' ? renderProduct(data, lang, slug)
    : renderArticle(data, lang, slug);
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', status === 200 ? 'public, s-maxage=3600, stale-while-revalidate=86400' : 'public, s-maxage=300');
  return res.status(status).send(html);
};
