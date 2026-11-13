/* Final content and presentation refinements. */
const eraserCategory = cats.findIndex(c => c[0] === 'eraser');
const [eraserEntry] = cats.splice(eraserCategory, 1);
cats.splice(2, 0, eraserEntry);

function customizeKle() {
  const brandSub = document.querySelector('.brand-copy small');
  if (brandSub) brandSub.textContent = lang === 'en' ? 'www.kleinpencil.com' : 'KLE STATIONERY';

  const footerFirst = document.querySelector('.footer-grid > div:first-child');
  if (footerFirst) footerFirst.innerHTML = `<h3>${company()}</h3><p>Guangdong Klein Stationery Co., Ltd.</p><figure class="footer-official-qr"><img src="assets/kle-official-wechat-qr.jpg" alt="${t('克莱因文具微信公众号二维码','KLE Stationery official WeChat account QR code')}" loading="lazy"><figcaption>${t('克莱因文具公众号','KLE official WeChat account')}</figcaption></figure>`;
  const footerContact = document.querySelector('.footer-grid > div:last-child');
  if (footerContact) footerContact.innerHTML = `<h3>${t('联系我们','Contact Us')}</h3><p>${t('电话：','Phone: ')}<a class="contact-inline" href="tel:+8618927425558">+86 18927425558</a></p><p>${t('邮箱：','Email: ')}<a class="contact-inline" href="mailto:jintao@kleinpencil.com">jintao@kleinpencil.com</a></p><p>${t('地址：广东省东莞市樟木头镇东深路樟木头段332号1栋','Address: Building 1, No. 332 Dongshen Road (Zhangmutou Section), Dongguan, Guangdong, China')}</p>`;

  document.querySelector('.footer-grid > div:nth-child(3) a[href="#contact"]')?.remove();

  const route = location.hash.slice(1).split(/[/?]/)[0] || 'home';
  if (route === 'home') {
    const headline = document.querySelector('.hero-bottom h1');
    if (headline && lang === 'zh') {
      headline.innerHTML = '<span class="slogan-pair"><span class="slogan-zh">我们是艺术的求知者，</span><span class="home-slogan-en">We are Art Seekers</span></span><span class="slogan-pair"><span class="slogan-zh">我们创造性地求知！</span><span class="home-slogan-en">We are Creatively Curious!</span></span>';
    }
    const grid = document.querySelector('.hero + .section .grid');
    if (grid) {
      const requested = [
        products.find(p => p.zh === '35件素描绘画套装'),
        products.find(p => p.zh === '克莱因铅笔'),
        products.find(p => p.zh === '可塑橡皮泥（带盒子）'),
        products.find(p => p.zh === '软中硬白碳笔'),
        products.find(p => p.zh === '软中硬碳笔'),
        products.find(p => p.zh === '粉碳笔')
      ].filter(Boolean);
      grid.innerHTML = requested.map(card).join('');
      const recommendation = grid.closest('.section');
      if (recommendation && !document.querySelector('.trademark-section')) recommendation.insertAdjacentHTML('afterend', `<section class="section trademark-section"><div class="wrap"><div class="section-head"><div><span class="eyebrow">KLE · TRADEMARK</span><h2>${t('品牌商标','Brand Trademark')}</h2><p class="subtle">${t('KLE 品牌相关资料展示','KLE brand information')}</p></div></div><div class="trademark-grid"><div class="trademark-mark"><img src="assets/kle-logo-registered.png" alt="KLE Logo"><p>${t('KLE 品牌标识','KLE brand mark')}</p></div><div class="trademark-proof"><div class="trademark-placeholder">${t('此处预留：KLE 商标注册证明图片','Reserved for KLE trademark registration document')}</div><p>${t('正式证明文件提供后在此展示，资料以实际文件为准。','The document will appear here once supplied and verified.')}</p></div></div></div></section>`);
    }
    const trademark = document.querySelector('.trademark-section');
    if (trademark) {
      const certificates = [
  [
    "kle-logo-work-registration.png",
    "公司 Logo 作品登记证书",
    "Company Logo Work Registration Certificate"
  ],
  [
    "kle-trademark-registration.png",
    "KLE 商标注册证",
    "KLE Trademark Registration Certificate"
  ],
  [
    "eagle-sketchbook-copyright.png",
    "鹰头素描本作品登记证书",
    "Eagle Sketchbook Copyright Registration Certificate"
  ],
  [
    "environmental-management-certificate.jpg",
    "环境管理体系证书",
    "Environmental Management System Certificate"
  ],
  [
    "intellectual-property-management-certificate.jpg",
    "知识产权合规管理体系认证证书",
    "Intellectual Property Compliance Management System Certificate"
  ],
  [
    "quality-management-certificate.jpg",
    "质量管理体系证书",
    "Quality Management System Certificate"
  ]
];
      trademark.innerHTML = `<div class="wrap"><div class="section-head"><div><span class="eyebrow">KLE · CERTIFICATES</span><h2>${t('资质证明','Certificates')}</h2></div></div><div class="certificate-grid">${certificates.map(([file,zh,en]) => `<div class="certificate-card"><img src="assets/certificates/${file}" alt="${esc(t(zh,en))}" loading="lazy"></div>`).join('')}</div></div>`;

    }
  }
  if (route === 'contact') {
    const list = document.querySelector('.contact-list');
    if (list) list.outerHTML = `<div class="contact-cards"><div class="contact-card"><img class="contact-icon-img" src="assets/contact-unified-website.svg" alt="" aria-hidden="true"><h3>${t('网址','Website')}</h3><p>www.kleinpencil.com</p></div><div class="contact-card"><img class="contact-icon-img" src="assets/contact-unified-phone.svg" alt="" aria-hidden="true"><h3>${t('电话','Phone')}</h3><p><a href="tel:+8618927425558">+86 18927425558</a></p></div><div class="contact-card"><img class="contact-icon-img" src="assets/contact-unified-email.svg" alt="" aria-hidden="true"><h3>${t('邮箱','Email')}</h3><p><a href="mailto:jintao@kleinpencil.com">jintao@kleinpencil.com</a></p></div><div class="contact-card"><img class="contact-icon-img" src="assets/contact-unified-address.svg" alt="" aria-hidden="true"><h3>${t('地址','Address')}</h3><p>${t('广东省东莞市樟木头镇东深路樟木头段332号1栋','Building 1, No. 332 Dongshen Road, Zhangmutou Town, Dongguan, Guangdong, China')}</p></div></div>`;
    document.querySelector('.contacts .qr')?.remove();
    document.querySelector('.contacts > div:first-child > p.subtle:last-child')?.remove();
  }
  if (location.hash === '#about/culture') document.querySelector('.article')?.classList.add('culture-content');
  if (route === 'about') {

    document.querySelectorAll('.article .slogan').forEach(el => {
      if (lang === 'zh') el.insertAdjacentHTML('afterend', '<p class="slogan-translation">We are Art Seekers, We are Creatively Curious!</p>');
    });
  }
}

const previousEnhance = enhance;
enhance = function() { previousEnhance(); customizeKle(); };
customizeKle();

setInterval(() => {
  if ((location.hash.slice(1).split(/[/?]/)[0] || 'home') !== 'home' || document.hidden) return;
  const dots = [...document.querySelectorAll('.feature-dots [data-feature]')];
  if (dots.length !== 3) return;
  const current = dots.findIndex(dot => dot.classList.contains('active'));
  dots[(current + 1) % dots.length].click();
}, 10000);

