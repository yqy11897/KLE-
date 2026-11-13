/* Show only the product fields supplied in the 2026-11 parameter document. */
const originalProductDetail = productDetail;
const parameterEnglish = (value, field) => {
  const colors = {
    '克莱因蓝色':'Klein blue', '克莱因蓝':'Klein blue', '红棕色':'reddish brown',
    '棕褐色':'tan', '浅蓝色':'light blue', '浅紫色':'light purple',
    '浅灰色':'light gray', '黄粉色':'yellow and pink', '绿紫色':'green and purple',
    '黄紫色':'yellow and purple', '蓝绿色':'blue and green', '粉紫色':'pink and purple',
    '青粉色':'cyan and pink', '黄绿色':'yellow and green', '清新绿':'fresh green',
    '气泡粉':'bubble pink', '粉兔子':'rabbit pink', '气泡紫':'bubble purple',
    '月亮黄':'moon yellow', '气泡蓝':'bubble blue', '宝石绿':'emerald green',
    '红蓝色':'red and blue', '黑色':'black', '白色':'white', '灰色':'gray',
    '红色':'red', '蓝色':'blue', '黄色':'yellow', '绿色':'green',
    '紫色':'purple', '粉色':'pink', '橙色':'orange', '青色':'cyan'
  };
  const replaceTerms = (text, terms) => Object.entries(terms).sort((a,b) => b[0].length-a[0].length)
    .reduce((result,[zh,en]) => result.replaceAll(zh,en), text);
  if (['Body color','Colors','Hardness','Variants'].includes(field)) {
    let text = replaceTerms(value, {'灰色薄款':'thin gray','灰色厚款':'thick gray','红色款':'red','蓝色款':'blue','黄色款':'yellow','雪糕款':'popsicle','花朵款':'flower','马卡龙色系':'macaron colors','如':'such as ','软':'soft','中':'medium','硬':'hard',...colors});
    return text.replaceAll('、', ', ').replaceAll('，', ', ');
  }
  if (field === 'Material') return value.replace('材质','').trim();
  if (field === 'Pages') return value.replace('页',' pages');
  if (field === 'Packaging') return value.replace('吸塑包装','blister packaging').replace('袋装',' bag').replace('盒装',' box').replace(/(\d+)支/, '$1-piece ');
  if (field === 'Carton quantity') return value.replace(/(\d+)套\/箱/g,'$1 sets/carton').replace(/(\d+)盒\/箱/g,'$1 boxes/carton').replace('含本','with sketchbook').replace('；','; ');
  if (field === 'Unit weight' || field === 'Carton weight') return value.replace('含本','with sketchbook').replace('/套','/set').replace('；','; ');
  if (field === 'Specification') return value.replace(/opp袋(\d+)支装/i,'$1 pieces/OPP bag').replace(/(\d+)张砂纸/,'$1 sanding sheets');
  const items = {
    '金属双孔平面卷笔刀':'metal two-hole flat sharpener', '金属单孔平面卷笔刀':'metal single-hole flat sharpener', '单孔金属平面卷笔刀':'metal single-hole flat sharpener',
    '金属双孔卷笔刀':'metal two-hole sharpener', '金属单孔卷笔刀':'metal single-hole sharpener',
    '双孔塑料卷笔刀':'plastic two-hole sharpener', '黑色塑料卷笔刀':'black plastic sharpener',
    '塑料卷笔刀':'plastic sharpener', '双孔卷笔刀':'two-hole sharpener', '卷笔刀':'sharpener',
    '水溶性彩铅':'water-soluble colored pencils', '金属感彩铅':'metallic colored pencils',
    '油性彩铅':'oil-based colored pencils', '水溶彩铅':'water-soluble colored pencils',
    '金属彩铅':'metallic colored pencils', '素描铅笔':'sketching pencils', '石墨铅笔':'graphite pencil',
    '石墨炭条':'graphite charcoal sticks', '粉炭条':'pastel charcoal sticks',
    '碳精条':'compressed charcoal sticks', '炭精条':'compressed charcoal sticks',
    '石墨条':'graphite sticks', '炭条':'charcoal sticks', '炭笔':'charcoal pencils',
    '粉画笔':'pastel brushes', '双头水彩笔':'dual-tip watercolor markers',
    '纸擦笔':'blending stumps', '双头橡皮笔':'double-ended eraser pen',
    '可塑橡皮泥':'kneaded eraser', '白色橡皮':'white eraser', '蓝色橡皮擦':'blue eraser',
    '白橡皮':'white eraser', '橡皮擦':'eraser', '橡皮':'eraser',
    '折叠笔袋':'folding pencil case', '软笔袋':'soft pencil case', '笔袋':'pencil case',
    '笔帘':'pencil roll', '素描本':'sketchbook', '砂纸板':'sandpaper block',
    '大黑色海绵片':'large black sponge pad', '黑色海绵片':'black sponge pad',
    '双头延长器':'double-ended pencil extender', '延长器':'pencil extender',
    '无木石墨':'woodless graphite pencil', '美工刀':'utility knife',
    '记号笔':'marker', '水管笔':'water brush', '自来水笔':'water brush',
    '水彩纸':'watercolor paper', '调色盘':'palette', '细节笔刷':'detail brush',
    '画笔':'paintbrush', '海绵':'sponge', '毛刷':'brush', '橡条':'eraser sticks',
    '彩铅':'colored pencils', '色彩铅':'colored pencils', '铅笔':'pencils', '盒子装':'boxed',
    '软':'soft', '中':'medium', '硬':'hard', '大':'large', '小':'small'
  };
  let text = value.replace(/纸擦笔(\d+)支白/g,'$1 white blending stumps')
    .replace(/(\d+)张水彩纸/g,'$1 sheets of watercolor paper')
    .replace(/(\d+)孔/g,'$1-slot ').replace(/(\d+)色/g,'$1-color ')
    .replace(/(\d+)支([^；、（）]+?)(?=[；、（）]|$)/g,'$1 $2')
    .replace(/([^；、（），]+?)(\d+)支/g,'$2 $1')
    .replace(/([^；、（），]+?)(\d+)(只|块|个|片|张)/g,'$2 $1')
    .replace(/(\d+)页/g,'$1-page ').replace(/一块/g,'1 ').replace(/一支/g,'1 ');
  text = replaceTerms(text, items);
  text = text.replace(/(\d+)套/g,'$1 sets').replace(/\b([A-Z]\d)sketchbook/g,'$1 sketchbook')
    .replace(/sketchbook(\d+)-page/g,'sketchbook, $1 pages')
    .replace(/colored pencils(\d+)-color/g,'$1-color colored pencils')
    .replace(/(oil-based|water-soluble|metallic) (\d+)-color colored pencils/g,'$2-color $1 colored pencils')
    .replace(/graphite pencil(\d+[A-Z])/g,'$1 graphite pencil')
    .replace(/\b(\d+)-page\s+sketchbook/g,'sketchbook, $1 pages')
    .replace(/\b(\d+)-page\s*/g,'$1 pages ').replace(/\s+(\d+)-color/g,' $1-color')
    .replace(/\b(\d+)-color\s+colored pencils/g,'$1-color colored pencils')
    .replaceAll('、', ', ').replaceAll('；', '; ').replaceAll('，', ', ')
    .replaceAll('（',' (').replaceAll('）',')').replace(/\s+;/g,';').replace(/\s+\)/g,')').replace(/\s+/g,' ').trim();
  return text;
};

productDetail = function(id) {
  const p = products.find(item => item.id === id);
  if (!p || !productParameters[p.id]) return originalProductDetail(id);
  const data = productParameters[p.id];
  const fields = [
    { zh: '产品名称', en: 'Product name', value: lang === 'zh' ? data.name : p.en },
    { zh: '种类', en: 'Category', value: catname(p.cat) },
    ...data.fields
  ];
  const rows = fields.map(item => `<div class="spec-row"><dt>${t(item.zh, item.en)}</dt><dd>${esc(lang === 'zh' ? item.value : item.en === 'Product name' || item.en === 'Category' ? item.value : (item.valueEn ?? parameterEnglish(item.value, item.en)))}</dd></div>`).join('');
  return banner('产品详情', 'Product Details') +
    `<section class="content"><div class="wrap"><div class="crumb">${link('products', '产品展示', 'Products')} / ${link('products/' + p.cat, ...cats.find(c => c[0] === p.cat).slice(1))} / ${esc(name(p))}</div>` +
    `<div class="product-layout"><div><button class="product-main" data-enlarge aria-label="${t('放大产品图片', 'Enlarge product image')}">${photo(p)}</button><p class="gallery-hint">${t('点击产品图片放大查看。', 'Click the product image to enlarge.')}</p></div>` +
    `<div><span class="eyebrow">${catname(p.cat)}</span><h1>${esc(name(p))}</h1><dl class="specs">${rows}</dl>${link('contact', '联系我们 →', 'Contact Us →', 'btn')}</div></div>` +
    `<div class="section-head" style="margin-top:65px"><h2>${t('同系列产品', 'Explore This Series')}</h2>${link('products/' + p.cat, '返回系列 →', 'Back to Series →', 'more')}</div></div></section>`;
};

if (location.hash.startsWith('#product/')) render(false);
