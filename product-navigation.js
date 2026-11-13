/* Preserve the visitor's place when they return from a product detail. */
let productOrigin = null;
let previousProductRoute = location.hash || '#home';

function setOriginToProduct(product) {
  if (!product) return;
  let route = productOrigin?.route || '#products/' + product.cat;
  let pool = products;
  if (route.startsWith('#products/')) {
    const category = route.slice(10);
    if (category !== 'all') pool = products.filter(p => p.cat === category);
  } else if (route !== '#products') pool = [];
  if (!pool.includes(product)) {
    route = '#products/' + product.cat;
    pool = products.filter(p => p.cat === product.cat);
  }
  productOrigin = {
    route, scrollY: 0,
    page: Math.floor(pool.indexOf(product) / pageSize) + 1,
    perPage: pageSize, layout: listLayout,
    product: '#product/' + product.id, locateProduct: true
  };
}

document.addEventListener('click', event => {
  const productLink = event.target.closest('a[href^="#product/"]');
  if (!productLink) return;
  if ((location.hash || '#home').startsWith('#product/')) {
    const target = products.find(p => '#product/' + p.id === productLink.getAttribute('href'));
    setOriginToProduct(target);
    return;
  }
  productOrigin = {
    route: location.hash || '#home',
    scrollY: window.scrollY,
    page: listPage,
    perPage: pageSize,
    layout: listLayout,
    product: productLink.getAttribute('href')
  };
}, true);

document.addEventListener('click', event => {
  const back = event.target.closest('#main .section-head a.more');
  if (!back || !(location.hash || '').startsWith('#product/')) return;
  const current = products.find(p => '#product/' + p.id === location.hash);
  setOriginToProduct(current);
  if (productOrigin) back.href = productOrigin.route;
}, true);

const renderBeforeProductNavigation = render;
render = function(scroll = true) {
  const route = location.hash || '#home';
  const returning = Boolean(productOrigin && previousProductRoute.startsWith('#product/') && route === productOrigin.route);
  if (returning) {
    listPage = productOrigin.page;
    pageSize = productOrigin.perPage;
    listLayout = productOrigin.layout;
    lastCatalogRoute = route.slice(1);
  }
  if (returning) {
    pageTransition?.skipTransition();
    document.documentElement.classList.add('restoring-product-place');
    baseRender(false);
    enhance();
  } else renderBeforeProductNavigation(scroll);
  previousProductRoute = route;
  if (returning) {
    const saved = productOrigin;
    const restore = () => {
      if ((location.hash || '#home') !== saved.route) return;
      // The catalog is rebuilt on route changes; restore after its page has been drawn.
      const target = saved.locateProduct ? document.querySelector('.card a[href="' + saved.product + '"]') : null;
      const top = target ? target.getBoundingClientRect().top + window.scrollY - document.querySelector('header').offsetHeight - 20 : saved.scrollY;
      window.scrollTo({ top: Math.min(top, Math.max(0, document.documentElement.scrollHeight - innerHeight)), behavior: 'instant' });
    };
    document.querySelectorAll('#main .reveal').forEach(el => el.classList.add('in-view'));
    restore();
  } else document.documentElement.classList.remove('restoring-product-place');
};

function showRelatedProducts() {
  const route = location.hash || '#home';
  if (!route.startsWith('#product/')) return;
  const current = products.find(product => `#product/${product.id}` === route);
  if (!current) return;
  const heading = document.querySelector('#main .section-head:last-child');
  if (!heading || heading.nextElementSibling?.classList.contains('related-products')) return;
  const series = products.filter(product => product.cat === current.cat && product.id !== current.id);
  const ordered = [...series.filter(product => products.indexOf(product) > products.indexOf(current)), ...series.filter(product => products.indexOf(product) < products.indexOf(current))];
  const related = ordered.slice(0, 3);
  if (!related.length) return;
  const grid = document.createElement('div');
  grid.className = 'related-products';
  grid.setAttribute('aria-label', t('同系列产品', 'Products in the same series'));
  grid.innerHTML = related.map(product => `<a class="related-product" href="#product/${product.id}"><img src="${product.src}" alt="" loading="lazy"><span>${esc(name(product))}</span><small>${t('查看详情 →', 'View details →')}</small></a>`).join('');
  heading.after(grid);

  const back = heading.querySelector('a[href^="#products/"]');
  if (back && productOrigin && productOrigin.route !== route) {
    back.textContent = t('返回浏览位置 →', 'Back to where you were →');
    back.setAttribute('href', productOrigin.route);
  }
}

const enhanceBeforeRelatedProducts = enhance;
enhance = function() { enhanceBeforeRelatedProducts(); showRelatedProducts(); };
showRelatedProducts();
