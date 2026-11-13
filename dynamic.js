/* Local, dependency-free interactions. Homepage uses the supplied KLE logo video. */
let motionObserver;
let featuredIndex=0;
let listPage = 1;
let pageSize = 6;
let listLayout = 'grid';
let lastCatalogRoute = '';
let searchIndex = -1;
let motionPreference='full';
try{motionPreference=localStorage.getItem('kle-motion')||'full';if(motionPreference==='auto')motionPreference='full'}catch{}
function reducedMotion(){return motionPreference==='reduce'||(motionPreference==='auto'&&matchMedia('(prefers-reduced-motion: reduce)').matches)}
function syncMotion(){
  document.documentElement.classList.toggle('motion-full',!reducedMotion());
  document.documentElement.classList.toggle('motion-reduced',reducedMotion());
}
const cooperationItems = [['scope','服务范围','Services'],['partners','战略伙伴','Strategic Partners'],['channels','线上渠道','Online Channels']];
const baseRender = render;
let pageTransition;
render = function(scroll = true) {
  const update=()=>{baseRender(scroll);enhance()};
  if(!document.startViewTransition||reducedMotion()){update();return;}
  pageTransition?.skipTransition();
  pageTransition=document.startViewTransition(update);
  pageTransition.finished.catch(()=>{});
};

function closeMenus(except) {
  document.querySelectorAll('.nav-group').forEach(g => {
    if (g !== except) { g.classList.remove('expanded'); g.querySelector('button').setAttribute('aria-expanded','false'); }
  });
}
function enhanceNavigation() {
  const children = {products:cats,cooperation:cooperationItems,about:aboutTabs};
  [...$('#nav').children].forEach(a => {
    const key = a.getAttribute('href').slice(1);
    if (!children[key]) return;
    const group=document.createElement('div'); group.className='nav-group';
    a.replaceWith(group); group.append(a);
    const button=document.createElement('button'); button.className='dropdown-toggle';
    button.textContent='⌄'; button.setAttribute('aria-label',t('展开','Expand ')+a.textContent);
    button.setAttribute('aria-expanded','false'); button.setAttribute('aria-controls',`submenu-${key}`);
    group.append(button);
    const menu=document.createElement('div'); menu.className='dropdown'; menu.id=`submenu-${key}`;
    menu.innerHTML=children[key].map(([id,z,e])=>link(`${key}/${id}`,z,e)).join(''); group.append(menu);
    let hoverOpened=false;
    button.onclick=()=>{ const open=hoverOpened||!group.classList.contains('expanded');hoverOpened=false;closeMenus(group);group.classList.toggle('expanded',open);button.setAttribute('aria-expanded',String(open)); };
    group.addEventListener('pointerenter',e=>{if(e.pointerType==='mouse'&&innerWidth>900){closeMenus(group);hoverOpened=true;group.classList.add('expanded');button.setAttribute('aria-expanded','true')}});
    group.addEventListener('pointerleave',()=>{hoverOpened=false;if(innerWidth>900){group.classList.remove('expanded');button.setAttribute('aria-expanded','false')}});
    group.addEventListener('focusout',e=>{if(!group.contains(e.relatedTarget)){group.classList.remove('expanded');button.setAttribute('aria-expanded','false')}});
  });
}
function enhanceSearch() {
  const form=$('.search'); const input=form.querySelector('input');
  const popup=document.createElement('div'); popup.className='search-popup';popup.id='product-suggestions';popup.hidden=true;
  input.setAttribute('autocomplete','off');input.setAttribute('aria-controls',popup.id);input.setAttribute('aria-expanded','false');
  form.append(popup);
  function update() {
    const q=input.value.trim().toLowerCase();searchIndex=-1;
    const found=q?products.filter(p=>`${p.zh} ${p.en} ${p.key} ${p.model||''}`.toLowerCase().includes(q)):[];
    popup.innerHTML=q?`<div class="suggest-caption">${t('产品快速查找','Quick product search')}</div>`+ (found.length?found.slice(0,6).map(p=>link(`product/${p.id}`,p.zh,p.en,'suggestion')).join('')+(found.length>6?`<a class="suggestion" href="#search?q=${encodeURIComponent(input.value.trim())}">${t(`查看全部 ${found.length} 个结果 →`,`View all ${found.length} results →`)}</a>`:''):`<p>${t('没有匹配产品，按回车查看搜索结果。','No matching products. Press Enter for results.')}</p>`):'';
    popup.hidden=!q;input.setAttribute('aria-expanded',String(!!q));
  }
  input.addEventListener('input',update);
  input.addEventListener('focus',()=>{if(input.value.trim())update()});
  input.addEventListener('keydown',e=>{
    const links=[...popup.querySelectorAll('a')];
    if(e.key==='Escape'){popup.hidden=true;input.setAttribute('aria-expanded','false');return;}
    if((e.key==='ArrowDown'||e.key==='ArrowUp')&&links.length){e.preventDefault();searchIndex=(searchIndex+(e.key==='ArrowDown'?1:-1)+links.length)%links.length;links.forEach((a,i)=>a.classList.toggle('highlight',i===searchIndex));}
    if(e.key==='Enter'&&searchIndex>=0&&links[searchIndex]){e.preventDefault();links[searchIndex].click();}
  });
}
function enhanceCatalog() {
  const raw=location.hash.slice(1); if(!/^(products|search)([/?]|$)/.test(raw))return;
  $('#main .info-strip')?.remove();
  const grid=$('#main .grid'); if(!grid)return;
  if(lastCatalogRoute!==raw){listPage=1;lastCatalogRoute=raw;}
  const cards=[...grid.children];
  const bar=document.createElement('div');bar.className='catalog-controls';
  bar.innerHTML=`<span>${t('浏览产品','Browse products')}</span><div><label>${t('每页','Per page')} <select id="page-size"><option value="3">3</option><option value="6">6</option><option value="12">12</option></select></label><button id="grid-view" aria-pressed="${listLayout==='grid'}">${t('网格','Grid')}</button><button id="list-view" aria-pressed="${listLayout==='list'}">${t('列表','List')}</button></div>`;
  grid.before(bar);$('#page-size').value=String(pageSize);
  const paging=document.createElement('nav');paging.className='pagination';paging.setAttribute('aria-label',t('产品分页','Product pagination'));grid.after(paging);
  const result=document.createElement('p');result.className='page-result subtle';result.setAttribute('aria-live','polite');paging.after(result);
  function draw(scroll=false) {
    const pages=Math.max(1,Math.ceil(cards.length/pageSize));listPage=Math.min(listPage,pages);
    cards.forEach((c,i)=>{c.hidden=i<(listPage-1)*pageSize||i>=listPage*pageSize;if(!c.hidden){c.style.setProperty('--reveal-delay',`${(i%pageSize)%3*200}ms`);c.classList.add('in-view')}});
    grid.classList.toggle('list-layout',listLayout==='list');
    const pageNumbers=Array.from({length:pages},(_,i)=>i+1).filter(n=>n===1||n===pages||Math.abs(n-listPage)<=2);
    const numbered=pageNumbers.map((n,i)=>`${i&&n-pageNumbers[i-1]>1?'<span class="page-ellipsis" aria-hidden="true">…</span>':''}<button data-page="${n}" ${listPage===n?'aria-current="page"':''}>${n}</button>`).join('');
    paging.innerHTML=`<button data-page="${listPage-1}" ${listPage===1?'disabled':''}>${t('上一页','Previous')}</button>`+numbered+`<button data-page="${listPage+1}" ${listPage===pages?'disabled':''}>${t('下一页','Next')}</button>`;
    result.textContent=t(`第 ${listPage} / ${pages} 页 · 共 ${cards.length} 张产品图片`,`Page ${listPage} of ${pages} · ${cards.length} product photos`);
    paging.querySelectorAll('button').forEach(b=>b.onclick=()=>{listPage=Number(b.dataset.page);draw(true);paging.querySelector('[aria-current]')?.focus({preventScroll:true})});
    $('#grid-view').setAttribute('aria-pressed',String(listLayout==='grid'));$('#list-view').setAttribute('aria-pressed',String(listLayout==='list'));
    if(scroll)bar.scrollIntoView({behavior:motionBehavior(),block:'start'});
  }
  $('#page-size').onchange=e=>{pageSize=Number(e.target.value);listPage=1;draw()};
  $('#grid-view').onclick=()=>{listLayout='grid';draw()};$('#list-view').onclick=()=>{listLayout='list';draw()};draw();
}
function motionBehavior(){return reducedMotion()?'instant':'smooth'}
function showMaterial(title,body) {
  $('#viewer-body').innerHTML=`<article class="material-dialog"><span class="eyebrow">KLE · ${t('素材要求','ASSET REQUIREMENTS')}</span><h2>${esc(title)}</h2>${body}</article>`;
  $('#viewer').showModal();
}
function enhanceMedia() {
  const brandName=$('.brand-copy strong');
  if(brandName&&lang==='en')brandName.textContent='KLE Stationery';
  const hero=$('.hero-stage');
  if(hero){
    const featured=[
      {zh:'专业绘画碳笔系列',en:'Drawing Charcoal Pencils',copyZh:'黑白经典色系，探索素描与绘画的丰富表现。',copyEn:'Explore expressive sketching with classic black and white charcoal pencils.',photoZh:'专业绘画碳笔组合主视觉',photoEn:'Drawing charcoal pencil collection',src:'assets/home-charcoal-showcase.jpg',href:'products/charcoal'},
      {zh:'半透明卡通橡皮擦',en:'Translucent Cartoon Erasers',copyZh:'三种配色、多款趣味造型，为创作增添色彩。',copyEn:'Three colors and playful shapes to brighten your creative work.',photoZh:'半透明卡通橡皮擦组合主视觉',photoEn:'Translucent cartoon eraser collection',src:'assets/home-cartoon-eraser-showcase-v2.jpg',href:`product/${products.find(p=>p.zh==='半透明卡通橡皮擦')?.id}`},
      {zh:'35件素描绘画套装',en:'35-Piece Sketching Set',copyZh:'从素描铅笔到绘画工具，满足日常练习与创作。',copyEn:'A complete set of sketching tools for practice and creative work.',photoZh:'35件素描绘画套装主视觉',photoEn:'35-piece sketching set',src:'assets/home-35-piece-sketch-set.jpg',href:`product/${products.find(p=>p.zh==='35件素描绘画套装')?.id}`}
    ];
    hero.classList.add('has-product-feature');
    const showFeatured=()=>{
      const item=featured[featuredIndex];
      const visual=item.src?`<div class="feature-photo"><img src="${item.src}" alt="${t(item.photoZh,item.photoEn)}"></div>`:`<div class="feature-photo feature-photo-pending" role="img" aria-label="${t(item.photoZh,item.photoEn)}：${t('图片待提供','image pending')}"><div class="feature-pending-label"><strong>${t('此处放','Add')} ${t(item.photoZh,item.photoEn)}</strong><small>${t('需要：高清横版产品照片','Needed: a high-resolution landscape product photo')}</small></div></div>`;
      hero.innerHTML=`${visual}<div class="feature-content"><div class="feature-copy"><span class="feature-kicker">KLE · ${t('美术与绘画用品','ART & DRAWING SUPPLIES')}</span><h2>${t(item.zh,item.en)}</h2><p>${t(item.copyZh,item.copyEn)}</p><a class="feature-cta" href="#${item.href}">${t('了解产品','Explore Product')} <span aria-hidden="true">→</span></a></div></div><div class="feature-dots" role="group" aria-label="${t('切换首页推荐产品','Switch featured products')}">${featured.map((product,i)=>`<button type="button" aria-label="${t('查看','View')} ${t(product.zh,product.en)}" aria-pressed="${i===featuredIndex}" class="${i===featuredIndex?'active':''}" data-feature="${i}"></button>`).join('')}</div>`;
      hero.querySelectorAll('[data-feature]').forEach(button=>button.addEventListener('click',()=>{const next=Number(button.dataset.feature);if(next===featuredIndex)return;featuredIndex=next;showFeatured()}));
    };
    showFeatured();
  }
  const intro=$('#main .article .placeholder');
  if((location.hash==='#about'||location.hash==='#about/profile')&&intro){
    intro.outerHTML=`<figure class="company-video"><video controls playsinline preload="metadata" poster="assets/factory-exterior.jpg" aria-label="${t('广东克莱因文具有限公司宣传视频','Guangdong Klein Stationery company video')}"><source src="assets/company-video-9715ddf2dfb5.mp4" type="video/mp4">${t('浏览器暂不支持播放此视频。','Your browser cannot play this video.')}</video></figure>`;
  }
  const exterior=$('.about-home .split>.placeholder');
  if(exterior)exterior.outerHTML=`<figure class="factory-photo"><img src="assets/factory-exterior.jpg" alt="${t('广东克莱因文具有限公司工厂外观','Factory exterior of Guangdong Klein Stationery Co., Ltd.')}" loading="lazy"></figure>`;
  if(location.hash==='#cooperation'||location.hash==='#cooperation/scope')$('.content')?.classList.add('cooperation-scope');
  if(location.hash==='#about/factory'){
    const factory=$('.article>.placeholder');
    if(factory)factory.outerHTML=`<div class="manufacturing-gallery"><figure class="factory-photo factory-photo-detail"><img src="assets/manufacturing-empty-track-661a9e572cab.jpg" alt="${t('铅笔制造机与输送轨道','Pencil manufacturing machine and conveyor tracks')}" loading="lazy"></figure><figure class="factory-photo factory-photo-detail"><img src="assets/manufacturing-workshop-panorama.png" alt="${t('铅笔生产车间全景','Panoramic view of a pencil production workshop')}" loading="lazy"></figure><figure class="factory-photo factory-photo-detail"><img src="assets/manufacturing-floor.png" alt="${t('广东克莱因文具有限公司生产现场','Manufacturing area of Guangdong Klein Stationery Co., Ltd.')}" loading="lazy"></figure><figure class="factory-photo factory-photo-detail"><img src="assets/factory-warehouse.jpg" alt="${t('广东克莱因文具有限公司仓储区域','Warehouse of Guangdong Klein Stationery Co., Ltd.')}" loading="lazy"></figure><figure class="factory-photo factory-photo-detail"><img src="assets/manufacturing-pencil-line.png" alt="${t('铅笔制造流水线','Pencil manufacturing line')}" loading="lazy"></figure><figure class="factory-photo factory-photo-detail"><img src="assets/manufacturing-pencil-machine.jpg" alt="${t('铅笔生产设备','Pencil production equipment')}" loading="lazy"></figure></div>`;
  }
  const footerQR=$('.footer-wechat');
  if(footerQR)footerQR.src='assets/wechat-qr-cropped.png';
  const footerContact=$('.footer-grid>div:last-child');
  if(footerContact)footerContact.innerHTML=`<h3>${t('联系我们','Contact Us')}</h3><p>${t('地址：广东省东莞市樟木头镇东深路樟木头段332号1栋','Address: Building 1, No. 332 Dongshen Road (Zhangmutou Section), Zhangmutou Town, Dongguan, Guangdong, China')}</p><p>${t('电话：','Phone: ')}<a class="contact-inline" href="tel:+8618927425558">+86 18927425558</a></p><p>${t('邮箱：','Email: ')}<a class="contact-inline" href="mailto:jintao@kleinpencil.com">jintao@kleinpencil.com</a></p><p>QQ / WhatsApp：${t('待补充','to be provided')}</p>`;
  const contactRows=document.querySelectorAll('.contact-list .spec-row dd');
  if(contactRows.length>=3){
    contactRows[0].textContent=t('广东省东莞市樟木头镇东深路樟木头段332号1栋','Building 1, No. 332 Dongshen Road (Zhangmutou Section), Zhangmutou Town, Dongguan, Guangdong, China');
    contactRows[1].innerHTML='<a href="tel:+8618927425558">+86 18927425558</a>';
    contactRows[2].innerHTML='<a href="mailto:jintao@kleinpencil.com">jintao@kleinpencil.com</a>';
  }
  const map=$('.contacts .map');
  if(map){
    const amapUrl='https://uri.amap.com/search?keyword='+encodeURIComponent('东莞宜宸儿童用品有限公司')+'&city='+encodeURIComponent('东莞')+'&view=map&callnative=1&src=kleinpencil.com';
    map.outerHTML=`<figure class="company-map"><a class="map-enlarge" href="${amapUrl}" target="_blank" rel="noopener noreferrer" aria-label="${t('在高德地图查看宜宸位置','View Yichen location in Amap')}"><img src="assets/company-location.png" alt="${t('公司地址鸟瞰图，图钉标注所在位置','Aerial view of company location with pin')}" loading="lazy"></a></figure>`;
  }
  const contactQR=$('.qr>.placeholder');
  if(contactQR){
    contactQR.outerHTML=`<img class="contact-wechat" src="assets/wechat-qr-cropped.png" alt="${t('微信联系二维码','WeChat contact QR code')}" loading="lazy">`;
    const caption=$('.qr .subtle');
    if(caption)caption.textContent=t('扫描二维码添加微信联系。','Scan the QR code to contact us on WeChat.');
    const contactNote=$('.contacts>div:first-child>p.subtle:last-child');
    if(contactNote)contactNote.textContent=t('电话和邮箱可直接点击联系；QQ 与 WhatsApp 待补充。','Phone and email links are active. QQ and WhatsApp details are pending.');
  }
  document.querySelectorAll('.footer-wechat,.contact-wechat').forEach(q=>{
    q.tabIndex=0;q.setAttribute('role','button');q.setAttribute('aria-label',t('放大查看微信二维码','Enlarge WeChat QR code'));
    const enlarge=()=>showMaterial(t('微信联系','Contact via WeChat'),'<img class="wechat-enlarged" src="assets/wechat-qr-cropped.png" alt="'+t('微信联系二维码','WeChat contact QR code')+'">');
    q.onclick=enlarge;
    q.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();enlarge()}};
  });
}
function galleryBody(p){return `<div class="gallery-dialog">${photo(p)}</div>`}
function openGallery(p){
  $('#viewer-body').innerHTML=galleryBody(p);
  $('#viewer').showModal();
}
function enhanceGallery(){
  const p=products.find(x=>location.hash.split('?')[0]===`#product/${x.id}`);if(!p)return;
  $('[data-enlarge]').onclick=()=>openGallery(p);
}
function enhanceMotion(){
  motionObserver?.disconnect();
  document.querySelectorAll('#main .reveal').forEach(e=>e.classList.remove('reveal','in-view'));
  if(!('IntersectionObserver' in window)||reducedMotion())return;
  motionObserver=new IntersectionObserver(entries=>entries.forEach(e=>{
    if(e.isIntersecting)e.target.classList.add('in-view');
    else if(e.boundingClientRect.top>=innerHeight)e.target.classList.remove('in-view');
  }),{threshold:0,rootMargin:'0px 0px -80px 0px'});
  const elements=document.querySelectorAll('#main .section-head,#main .card,#main .split>.placeholder,#main .split>.factory-photo,#main .split>.copy,#main .article>h2,#main .article>h3,#main .article>p,#main .article>.placeholder,#main .article>.factory-photo,#main .contacts>div,#main .contacts>.company-map');
  elements.forEach(el=>{
    const siblings=[...el.parentElement.children].filter(x=>x.matches('.card,.copy,.placeholder'));
    const index=Math.max(0,siblings.indexOf(el));
    el.style.setProperty('--reveal-delay',`${Math.min(index,2)*200}ms`);
    el.classList.add('reveal');motionObserver.observe(el);
  });
}
const fadeSwaps=new WeakMap();
function fadeSwap(element,update){
  const previous=fadeSwaps.get(element);if(previous)previous.cancelled=true;
  element.getAnimations().forEach(a=>a.cancel());
  if(reducedMotion()){update();return;}
  const job={cancelled:false};fadeSwaps.set(element,job);
  const outgoing=element.animate([{opacity:1},{opacity:0}],{duration:240,easing:'ease-out',fill:'forwards'});
  outgoing.finished.then(()=>{
    if(job.cancelled)return;update();outgoing.cancel();
    element.animate([{opacity:0},{opacity:1}],{duration:700,easing:'cubic-bezier(.22,.61,.36,1)'});
    fadeSwaps.delete(element);
  }).catch(()=>{});
}
const categoryIconPaths={
  all:'<rect x="5" y="5" width="8" height="8" rx="1"/><rect x="19" y="5" width="8" height="8" rx="1"/><rect x="5" y="19" width="8" height="8" rx="1"/><rect x="19" y="19" width="8" height="8" rx="1"/>',
  pencil:'<path d="m5 27 2-7L22 5l5 5-15 15-7 2Z"/><path d="m7 20 5 5M19 8l5 5M4 29h24"/>',
  charcoal:'<path d="m6 27 2-7L23 5l4 4-15 16-6 2Z"/><path d="m8 20 4 5M20 8l4 4M6 13l4-4M14 27h14"/>',
  sets:'<rect x="4" y="10" width="24" height="18" rx="2"/><path d="M12 10V7a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v3M4 17h24M12 17v11M20 17v11"/>',
  eraser:'<path d="m4 21 13-15a3 3 0 0 1 4 0l6 5a3 3 0 0 1 0 4L14 29H8l-4-4v-4Z"/><path d="m11 14 10 9M8 29h20"/>',
  watercolor:'<path d="M16 3C9 3 4 8 4 16s6 13 13 13c3 0 5-2 5-5 0-2-1-3-1-4 0-2 2-3 4-3 2 0 3-2 3-4C28 7 23 3 16 3Z"/><circle cx="11" cy="11" r="1"/><circle cx="18" cy="9" r="1"/><circle cx="10" cy="19" r="1"/><circle cx="17" cy="16" r="1"/>',
  sketchbook:'<rect x="7" y="5" width="20" height="24" rx="1"/><path d="M12 5v24M8 10h4M8 16h4M8 22h4M16 13h7M16 18h7"/>',
  tools:'<path d="m5 26 18-18 4 4L9 30H5v-4ZM7 7l18 18M17 17l2-2M11 11l2-2"/>'
};
function enhanceSectionBanner(){
  const section=$('#main .page-banner');if(!section)return;
  const page=(location.hash.slice(1).split(/[/?]/)[0]||'home');
  if(['cooperation','contact','about'].includes(page))section.classList.add(`banner-${page}`);
}
function enhanceProductCategories(){
  const route=location.hash.slice(1).split('?')[0];if(!/^products(?:\/|$)/.test(route))return;
  const selected=route.split('/')[1]||'all';
  const oldTabs=$('#main .tabs');if(!oldTabs)return;
  const heading=$('#main .page-banner h1');if(heading)heading.textContent=t('产品分类','Product Categories');
  const bannerSection=$('#main .page-banner');if(bannerSection)bannerSection.classList.add('product-category-banner');
  bannerSection?.querySelector('p.subtle')?.remove();
  $('#main .results')?.remove();
  const items=[['all','全部产品','All'],...cats];
  oldTabs.outerHTML=`<section class="product-categories"><nav class="wrap category-strip" aria-label="${t('产品分类','Product categories')}">${items.map(([id,zh,en])=>`<a href="#products/${id}" class="category-link ${id===selected?'active':''}" ${id===selected?'aria-current="page"':''}><svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.55" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${categoryIconPaths[id]}</svg><span>${t(zh,en)}</span></a>`).join('')}</nav></section>`;
}
function enhance(){
  syncMotion();
  enhanceNavigation();enhanceSearch();enhanceSectionBanner();enhanceProductCategories();enhanceCatalog();enhanceMedia();enhanceGallery();enhanceMotion();
  document.querySelectorAll('a.active').forEach(a=>a.setAttribute('aria-current','page'));
  $('#main').classList.remove('page-enter');void $('#main').offsetWidth;$('#main').classList.add('page-enter');
  updateScroll();
}
function updateScroll(){
  $('#header').classList.toggle('scrolled',scrollY>24);
  $('#top').classList.toggle('visible',scrollY>250);
}
document.addEventListener('click',e=>{if(!e.target.closest('.nav-group'))closeMenus();if(!e.target.closest('.search')){const p=$('.search-popup');if(p)p.hidden=true;$('.search input')?.setAttribute('aria-expanded','false')}});
document.addEventListener('keydown',e=>{if(e.key==='Escape'){closeMenus();$('#nav').classList.remove('open');$('.menu').setAttribute('aria-expanded','false');const p=$('.search-popup');if(p)p.hidden=true}});
$('#viewer').addEventListener('close',()=>{
  $('#viewer').onkeydown=null;
  const p=products.find(x=>location.hash.split('?')[0]===`#product/${x.id}`);
  if(p&&$('[data-enlarge]')){
    $('[data-enlarge]').innerHTML=photo(p);
  }
});
addEventListener('scroll',updateScroll,{passive:true});
addEventListener('resize',updateScroll,{passive:true});
const headerSizeObserver=new ResizeObserver(()=>document.documentElement.style.setProperty('--header-height',`${$('#header').getBoundingClientRect().height}px`));
headerSizeObserver.observe($('#header'));
enhance();
