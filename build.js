#!/usr/bin/env node
/* The Print Shop (Collingwood) — static site generator.
   Run: node build.js  →  writes the full site to ./dist
   Edit the DATA section below to change products, services, copy, FAQs. */
const fs = require("fs");
const path = require("path");

const OUT = path.join(__dirname, "dist");
const LIVE = "https://www.theprintshops.ca";
const BASE = process.env.SITE_BASE || LIVE; // canonical/sitemap host
const PHONE = "705 445 2880", TEL = "+17054452880", EMAIL = "info@theprintshops.ca";
const AREAS = ["Collingwood", "The Blue Mountains", "Wasaga Beach", "Thornbury", "Stayner", "Meaford", "Creemore"];
const GEO = { lat: "44.5009", lng: "-80.2169" };

// ---------------------------------------------------------------- DATA
const PRODUCTS = [
  ["business-cards","Business Cards","The first thing you hand over. Make it worth keeping.",
    [["A small card that does real work","Your business card is often the first physical thing a customer keeps from you. We print on heavier stocks that feel substantial in hand, with clean edges and accurate colour so your brand looks the way you intended."],
     ["Finishes that set you apart","Choose a matte or gloss coat for everyday durability, or add a specialty finish when you want the card to make an impression. Double-sided printing gives you room for a logo on one side and the details on the other."]],
    ["Sales and networking","Trades and services","Retail and hospitality","Realtors and agents"],
    [["Stocks","14pt / 16pt / premium"],["Sides","Single or double-sided"],["Coating","Matte, gloss or uncoated"],["Corners","Square or rounded"]]],
  ["brochures","Brochures","Get your message across in a single, well-folded piece.",
    [["Say more without losing them","A brochure gives you space to explain a product, a service or an event without overwhelming the reader. A considered fold guides the eye from the cover through to your call to action."],
     ["Folds for every job","Tri-fold and bi-fold are the workhorses for mailers and handouts. For a heftier piece, gate and Z-folds give you extra panels and a more premium feel. We'll help you pick the fold that fits your content."]],
    ["Product and service overviews","Event and program guides","Menus and price lists","Direct mail"],
    [["Folds","Tri-fold, bi-fold, gate, Z-fold"],["Sizes","Letter, legal, custom"],["Stocks","Text or cover weight"],["Coating","Gloss aqueous available"]]],
  ["flyers","Flyers","Fast, affordable and hard to ignore.",
    [["Reach for reach","Flyers are the quickest way to get a promotion, event or announcement in front of a lot of people for a little money. Bold four-colour printing makes your message pop on the page."],
     ["Go bigger when it counts","Need more room? Print larger and fold to get twice the impact for your budget. Glossy aqueous coating adds shine and a little extra durability for pieces that get handled."]],
    ["Sales and promotions","Grand openings","Community events","Handbills and inserts"],
    [["Sizes","Half-page to 11×17"],["Sides","Single or double-sided"],["Coating","Matte or gloss aqueous"],["Stocks","Text or light cover"]]],
  ["postcards","Postcards","Compact, direct, and built for the mailbox.",
    [["A marketer's favourite","Postcards are small, inexpensive and impossible to leave unopened — there's no envelope in the way. That makes them ideal for targeted mailings, reminders and simple, repeatable campaigns."],
     ["Print heavy, mail smart","We print on sturdy card stock that survives the mail stream and still looks sharp on arrival. Ask us about sizes that qualify for better postage rates."]],
    ["Direct mail campaigns","Appointment reminders","Save-the-dates","Loyalty and offers"],
    [["Sizes","4×6, 5×7, 6×9, custom"],["Stocks","Card weight"],["Sides","Single or double-sided"],["Coating","Matte, gloss or UV"]]],
  ["booklets","Booklets","Programs, catalogues and reports, bound to look the part.",
    [["More pages, more to say","When a single sheet isn't enough, a booklet gives your content room to breathe. Programs, catalogues, reports and manuals all read better bound into a proper piece."],
     ["Printing and binding, together","We plan printing and binding as one job, so your booklet comes together faster and stays consistent from cover to last page. Full-colour interiors on a heavier gloss stock keep graphics crisp."]],
    ["Event programs","Product catalogues","Annual reports","Manuals and guides"],
    [["Binding","Saddle-stitch or bound"],["Pages","In multiples of four"],["Covers","Self or heavier cover stock"],["Interior","B&W or full colour"]]],
  ["sell-sheets","Sell Sheets","One page that answers the question and closes the gap.",
    [["The one-pager that sells","Most customers don't buy on the spot — decisions get made in the days and weeks after. A sell sheet is the leave-behind that keeps working once you've left the room."],
     ["Clear, credible, memorable","A tight layout with the right features, benefits and proof points gives buyers what they need to say yes. Print on a quality stock so it feels as serious as your offer."]],
    ["Sales leave-behinds","Product one-pagers","Line cards","Real estate features"],
    [["Sizes","Letter standard, custom"],["Sides","Single or double-sided"],["Stocks","Text or cover weight"],["Coating","Matte or gloss"]]],
  ["rack-cards","Rack Cards","Slim, standable and built for the display rack.",
    [["Made for the rack","Rack cards fit the standard display racks you find in hotels, visitor centres and lobbies. Their slim shape stands out in a row and travels easily in a pocket or bag."],
     ["A natural fit for the region","For tourism, attractions and local retail around Collingwood and Georgian Bay, rack cards put your offer where visitors are already looking."]],
    ["Tourism and attractions","Hotels and rentals","Restaurants and cafés","Services and clinics"],
    [["Sizes","4×9 standard, custom"],["Sides","Single or double-sided"],["Stocks","Card weight"],["Coating","Matte or gloss"]]],
  ["door-hangers","Door Hangers","Land your offer right on the doorstep.",
    [["No mailbox to compete with","A door hanger goes straight onto the handle, so it's the only message a household sees at that moment. That makes it a strong choice for local, neighbourhood-level marketing."],
     ["Built to be noticed","Print bold on a sturdy stock with a clean die-cut hole so hangers stay put and stay readable. Add a tear-off coupon to give people a reason to keep it."]],
    ["Home services","Restaurants and delivery","Real estate farming","Neighbourhood offers"],
    [["Sizes","Standard hanger, custom"],["Sides","Single or double-sided"],["Stocks","Cover weight"],["Add-ons","Tear-off perforation"]]],
  ["newsletters","Newsletters","Keep members and customers in the loop with something they'll keep.",
    [["A printed piece gets read","Email is easy to ignore. A printed newsletter that lands on a desk or in a mailbox gets picked up, read and often kept — which is exactly what you want for members, clients and community groups."],
     ["Consistent issue after issue","We keep your format, colours and paper consistent from one issue to the next, so your newsletter builds recognition over time. Reorders are quick once the template is set."]],
    ["Associations and clubs","Churches and schools","Client updates","Community groups"],
    [["Sizes","Letter, legal, tabloid"],["Pages","Single sheet to booklet"],["Colour","B&W or full colour"],["Stocks","Text weight"]]],
  ["envelopes","Envelopes","Mail that arrives looking like it means business.",
    [["Match your letterhead","A printed envelope that matches your letterhead signals a professional, put-together business before the recipient has even opened it. We print your logo and return address cleanly and consistently."],
     ["Sizes for every mailing","From standard #10 business envelopes to larger booklet and catalogue sizes, we print the format your mailing calls for, with or without a window."]],
    ["Business correspondence","Invoices and statements","Direct mail","Announcements"],
    [["Sizes","#10, #9, booklet, catalogue"],["Window","With or without"],["Colour","One-colour to full colour"],["Stocks","Standard or premium"]]],
  ["labels","Labels","Not just for products — for anything worth marking.",
    [["One label, many jobs","Labels do more than name a product. Use them for return addresses, warnings, or a quick way to tag specials and sales. Choose a removable static cling when you need to move or peel it clean."],
     ["Durable when you need it","Need extra life out of a label? Glossy paper or vinyl stands up to handling and moisture without stretching the budget. We'll match the stock to where the label ends up."]],
    ["Product and packaging","Shipping and address","Promotions and sales","Warnings and instructions"],
    [["Shapes","Rectangle, round, custom die"],["Stocks","Paper, gloss, vinyl, cling"],["Adhesive","Permanent or removable"],["Format","Sheets or rolls"]]],
  ["carbonless-forms","Carbonless Forms","Keep your paperwork tidy, in duplicate or triplicate.",
    [["Tame the paperwork","Carbonless forms streamline your workflow and cut down on disorder. Invoices, work orders and receipts print in duplicate or triplicate so everyone keeps a copy without a photocopier."],
     ["Numbered and padded to suit","We can sequentially number your forms and pad or book them so they're easy to use in the field or at the counter. Consistent layouts make them quick to fill in."]],
    ["Invoices and receipts","Work and service orders","Estimates and quotes","Delivery slips"],
    [["Parts","2-part or 3-part"],["Binding","Padded, booked or loose"],["Numbering","Sequential available"],["Sizes","Half-page, letter, custom"]]],
];

const SERVICES = [
  ["bindery-finishing","Bindery & Finishing","The steps that turn a stack of sheets into a proper piece.",
    [["Finishing done properly","Printing is only half the job. Cutting, folding, scoring, perforating, drilling, numbering and shrink-wrapping are the details that separate tidy work from rough work, and we look after every one of them."],
     ["Right the first time","We manage every step of the job, so there are fewer hand-offs, tighter quality control and faster turnaround. Your job is checked at every stage before it goes out the door."]],
    ["Cutting & trimming","Folding & scoring","Perforating & drilling","Numbering","Shrink-wrapping","Padding"]],
  ["graphic-design-services","Graphic Design","From concept to design to print — creative and effective.",
    [["No print-ready file? No problem.","Not everyone arrives with finished artwork. Our designers can build a piece from scratch or clean up what you have so it prints exactly as intended — the right size, the right colours, the right resolution."],
     ["Design that's made to print","There's a difference between art that looks good on screen and art that prints well. We design with bleeds, trim and stock in mind from the start, so there are no surprises on press."]],
    ["Logos & branding","Brochure & flyer layout","Business card design","File clean-up & prepress"]],
  ["booklet-binding","Booklet Binding","Saddle-stitch and bound booklets, from programs to catalogues.",
    [["Bound to last","From thin programs to thick catalogues, we print and bind booklets to the same standard, so the whole job stays consistent."],
     ["The right binding for the page count","Saddle-stitch suits lighter booklets, while heavier pieces call for a sturdier bound edge. We'll recommend the binding that matches your page count and how the booklet will be used."]],
    ["Saddle-stitch","Bound booklets","Programs & catalogues","Manuals & reports"]],
  ["printing-copying-services","Printing & Copying","Short runs, long runs, colour and black-and-white.",
    [["Everyday printing on a deadline","Sometimes you just need clean copies, fast. We handle everyday printing and copying in colour and black-and-white, from a handful of pages to long production runs."],
     ["A full-service printer","The Print Shop is a full-service printer, which means we can do just about anything — and if a job needs finishing or binding, it's already here."]],
    ["Colour copies","Black & white copies","Short-run digital","Long-run production"]],
];

const FAQ = {
  "business-cards":[["How much do business cards cost in Collingwood?","Pricing depends on quantity, stock and finish. Most orders start with a box of 100 to 250 cards. Request a free estimate and we'll give you a firm price, usually the same day."],["How fast can I get business cards printed?","For print-ready files, standard turnaround is a few business days. Ask about a rush if you need them sooner — because we print locally in Collingwood, there's no shipping wait."],["Can you design my business card, or do I need a finished file?","Both work. Send a print-ready file, or have our in-house designers build the card for you."]],
  "brochures":[["What brochure folds do you offer?","Tri-fold and bi-fold are the most common, with gate and Z-folds for a more premium piece. We'll recommend the fold that fits your content and budget."],["What's the minimum order for brochures?","We print short and long runs. Tell us your quantity and we'll quote it — small runs are no problem for a local shop."]],
  "flyers":[["How quickly can flyers be printed?","Flyers are one of our fastest products. With a print-ready file, most runs are ready in a few business days, with rush options available."],["Can I print double-sided flyers with a gloss coat?","Yes. Single or double-sided, with matte or gloss aqueous coating to make the colour pop."]],
  "postcards":[["Do you handle postcard mailings?","We print postcards on sturdy, mail-ready card stock. Ask us about sizes that qualify for better postage rates for your campaign."],["What's the best postcard size for direct mail?","4×6 and 5×7 are popular and cost-effective. We'll help you pick a size that balances impact and postage."]],
  "booklets":[["What binding do you use for booklets?","Saddle-stitch for lighter booklets and bound edges for thicker pieces. Page count must be in multiples of four. We look after both the printing and the binding."],["Can you print full-colour booklet interiors?","Yes — black-and-white or full colour, on text or heavier gloss stock for sharp graphics."]],
  "sell-sheets":[["What is a sell sheet used for?","A sell sheet is a single-page leave-behind that keeps selling after the conversation — features, benefits and proof on one page."],["Can you print sell sheets double-sided?","Yes, single or double-sided on text or cover weight, with a matte or gloss finish."]],
  "rack-cards":[["What size are rack cards?","The standard is 4×9, which fits display racks in hotels, visitor centres and lobbies. Custom sizes are available."],["Are rack cards good for Collingwood tourism businesses?","Very. For attractions, hotels and restaurants around Collingwood and Georgian Bay, rack cards put your offer where visitors already look."]],
  "door-hangers":[["Are door hangers effective for local marketing?","Yes — a door hanger is the only message on the handle, with no mailbox to compete with. Add a tear-off coupon to give people a reason to keep it."]],
  "newsletters":[["Can you print and mail a recurring newsletter?","We print newsletters in formats from a single sheet to a bound booklet, and keep your layout consistent issue to issue so reorders are quick."]],
  "envelopes":[["Can you print envelopes to match my letterhead?","Yes. We print your logo and return address on #10, booklet and catalogue sizes, with or without a window, to match your stationery."]],
  "labels":[["What kinds of labels can you print?","Product, shipping, address and promotional labels in paper, gloss, vinyl or static cling, with permanent or removable adhesive, on sheets or rolls."]],
  "carbonless-forms":[["Do you print carbonless (NCR) forms?","Yes — invoices, work orders and receipts in 2-part or 3-part sets, padded or booked, with sequential numbering available."]],
  "bindery-finishing":[["What finishing services do you offer?","Cutting, folding, scoring, perforating, drilling, numbering and shrink-wrapping. We handle all of it, so your job is finished properly and fast."]],
  "booklet-binding":[["What booklet binding options are available?","Saddle-stitch and bound booklets, from thin programs to thick catalogues."]],
  "graphic-design-services":[["Can you design my print project from scratch?","Yes. Our designers can build a piece from scratch or clean up your file so it prints exactly as intended, with the right bleeds, trim and resolution."]],
  "printing-copying-services":[["Do you do short-run and same-day copying?","Yes — colour and black-and-white copying and printing, from a few pages to long production runs, as a full-service local printer."]],
};

// ---------------------------------------------------------------- helpers
const esc = s => String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
const L = (root, p) => p === "" ? root + "index.html" : root + p + "index.html";
const write = (rel, html) => { const full = path.join(OUT, rel); fs.mkdirSync(path.dirname(full), {recursive:true}); fs.writeFileSync(full, html); };
const ld = o => '<script type="application/ld+json">\n' + JSON.stringify(o, null, 2) + '\n</script>';
const urlFor = rel => "/" + rel.replace(/index\.html$/,"");

function localbusiness(){ return {"@context":"https://schema.org","@type":"PrintShop","@id":BASE+"/#business","name":"The Print Shop (Collingwood) Ltd.","url":BASE+"/","telephone":"+1-705-445-2880","image":BASE+"/og-image.png","logo":BASE+"/brand/logo-landscape.png","priceRange":"$$","foundingDate":"1980","address":{"@type":"PostalAddress","streetAddress":"26 Ronell Crescent","addressLocality":"Collingwood","addressRegion":"ON","postalCode":"L9Y 4J7","addressCountry":"CA"},"geo":{"@type":"GeoCoordinates","latitude":GEO.lat,"longitude":GEO.lng},"areaServed":AREAS.map(a=>({"@type":"City","name":a})),"openingHoursSpecification":[{"@type":"OpeningHoursSpecification","dayOfWeek":["Monday","Tuesday","Wednesday","Thursday","Friday"],"opens":"08:00","closes":"17:00"}],"slogan":"Good service at a fair price."}; }
const crumb = trail => ({"@context":"https://schema.org","@type":"BreadcrumbList","itemListElement":trail.map((t,i)=>({"@type":"ListItem","position":i+1,"name":t[0],...(t[1]?{"item":BASE+t[1]}:{})}))});
const faqpage = items => ({"@context":"https://schema.org","@type":"FAQPage","mainEntity":items.map(([q,a])=>({"@type":"Question","name":q,"acceptedAnswer":{"@type":"Answer","text":a}}))});
const productSchema = (n,d,u) => ({"@context":"https://schema.org","@type":"Product","name":n,"description":d,"url":BASE+u,"category":"Printing","brand":{"@type":"Brand","name":"The Print Shop (Collingwood) Ltd."},"offers":{"@type":"Offer","availability":"https://schema.org/InStock","priceCurrency":"CAD","seller":{"@id":BASE+"/#business"},"areaServed":"Collingwood, Ontario"}});
const serviceSchema = (n,d,u) => ({"@context":"https://schema.org","@type":"Service","name":n,"description":d,"url":BASE+u,"serviceType":n,"provider":{"@id":BASE+"/#business"},"areaServed":AREAS.map(a=>({"@type":"City","name":a}))});

function metaBlock(canonical, title, desc, extraLd){
  const ogimg = BASE+"/og-image.png";
  const t=[`<link rel="canonical" href="${canonical}">`,`<meta property="og:type" content="website">`,`<meta property="og:site_name" content="The Print Shop (Collingwood) Ltd.">`,`<meta property="og:title" content="${esc(title)}">`,`<meta property="og:description" content="${esc(desc)}">`,`<meta property="og:url" content="${canonical}">`,`<meta property="og:image" content="${ogimg}">`,`<meta property="og:image:width" content="1200">`,`<meta property="og:image:height" content="630">`,`<meta property="og:image:alt" content="The Print Shop, Collingwood, Ontario. Printing since 1980.">`,`<meta property="og:locale" content="en_CA">`,`<meta name="twitter:card" content="summary_large_image">`,`<meta name="twitter:title" content="${esc(title)}">`,`<meta name="twitter:description" content="${esc(desc)}">`,`<meta name="twitter:image" content="${ogimg}">`,`<meta name="geo.region" content="CA-ON">`,`<meta name="geo.placename" content="Collingwood">`,`<meta name="robots" content="index,follow,max-image-preview:large">`];
  extraLd.forEach(o=>t.push(ld(o)));
  return t.join("\n");
}
function faqHtml(items){
  const rows = items.map(([q,a])=>`      <details class="faq-item">
        <summary>${esc(q)}</summary>
        <div class="faq-a"><p>${esc(a)}</p></div>
      </details>`).join("\n");
  return `
<section class="faq" aria-labelledby="faq-h">
  <div class="wrap">
    <p class="eyebrow">COMMON QUESTIONS</p>
    <h2 class="h-sec" id="faq-h">Questions, answered.</h2>
    <div class="faq-list">
${rows}
    </div>
  </div>
</section>`;
}

function head(root, title, desc, canonical, extraLd){
  return `<!DOCTYPE html>
<html lang="en-CA">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title}</title>
<meta name="description" content="${esc(desc)}">
${metaBlock(canonical,title,desc,extraLd)}
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Anton&family=Inter:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap" rel="stylesheet">
<link rel="icon" href="${root}favicon.ico" sizes="any">
<link rel="icon" type="image/png" sizes="32x32" href="${root}favicon-32.png">
<link rel="icon" type="image/png" sizes="16x16" href="${root}favicon-16.png">
<link rel="apple-touch-icon" href="${root}apple-touch-icon.png">
<link rel="manifest" href="${root}site.webmanifest">
<meta name="theme-color" content="#1a1a1a">
<link rel="stylesheet" href="${root}assets/style.css">
</head>
<body>
<a class="skip" href="#main">Skip to main content</a>
<div class="colourbar" aria-hidden="true"><span></span><span></span><span></span><span></span></div>`;
}

function header(root){
  // Menu shows the five core products; the rest live on All Products.
  const prod = PRODUCTS.slice(0,5).map(p=>`        <a href="${L(root,"printing/"+p[0]+"/")}">${p[1]}</a>`).join("\n");
  const svc = SERVICES.map(s=>`        <a href="${L(root,"services/"+s[0]+"/")}">${s[1]}</a>`).join("\n");
  return `
<div class="topbar">
  <div class="wrap">
    <div>Here to help — <a href="tel:${TEL}">705&nbsp;445&nbsp;2880</a></div>
    <div>Open Monday to Friday<span class="sep">·</span>8:00&nbsp;am – 5:00&nbsp;pm</div>
  </div>
</div>
<header class="site">
  <div class="wrap nav">
    <a class="brand" href="${L(root,'')}" aria-label="The Print Shop Collingwood, home">
      <img class="logo" src="${root}brand/logo-landscape.svg" width="242" height="54" alt="The Print Shop (Collingwood) Ltd.">
    </a>
    <button class="navtoggle" aria-expanded="false" aria-controls="menu">Menu</button>
    <nav class="menu" id="menu" aria-label="Primary">
      <div class="drop">
        <a href="${L(root,'printing/')}">Products <span class="caret" aria-hidden="true"></span></a>
        <div class="drop-menu">
${prod}
          <div class="div"></div>
          <a class="all" href="${L(root,'printing/')}">View all products</a>
        </div>
      </div>
      <div class="drop">
        <a href="${L(root,'services/')}">Services <span class="caret" aria-hidden="true"></span></a>
        <div class="drop-menu">
${svc}
          <div class="div"></div>
          <a class="all" href="${L(root,'services/')}">View all services</a>
        </div>
      </div>
      <a href="${L(root,'feature/about-us/')}">About</a>
      <a href="${L(root,'contact-us/')}">Contact</a>
      <a class="btn sm navcta" href="${L(root,'printing/custom-printing/')}">Get an estimate</a>
    </nav>
  </div>
</header>`;
}

function footer(root){
  const prod = PRODUCTS.slice(0,6).map(p=>`          <a href="${L(root,"printing/"+p[0]+"/")}">${p[1]}</a>`).join("\n");
  const svc = SERVICES.map(s=>`          <a href="${L(root,"services/"+s[0]+"/")}">${s[1]}</a>`).join("\n");
  return `
<footer>
  <div class="wrap">
    <div class="foot">
      <div>
        <a class="brand" href="${L(root,'')}">
          <img class="logo" src="${root}brand/logo-landscape.svg" width="242" height="54" alt="The Print Shop (Collingwood) Ltd.">
        </a>
        <div class="addr">
          26 Ronell Crescent<br>Collingwood, Ontario&nbsp; L9Y 4J7<br>
          <a href="tel:${TEL}">${PHONE}</a><br>
          <a href="mailto:${EMAIL}">${EMAIL}</a>
        </div>
      </div>
      <div class="fcol">
        <h4>Products</h4>
${prod}
          <a href="${L(root,'printing/')}" style="color:var(--red);font-weight:700">All products</a>
      </div>
      <div class="fcol">
        <h4>Services</h4>
${svc}
      </div>
      <div class="fcol">
        <h4>Company</h4>
        <a href="${L(root,'feature/about-us/')}">About Us</a>
        <a href="${L(root,'contact-us/')}">Contact</a>
        <a href="${L(root,'printing/custom-printing/')}">Get an estimate</a>
        <a href="${L(root,'terms/')}">Terms &amp; Conditions</a>
        <a href="${L(root,'privacy/')}">Privacy</a>
      </div>
    </div>
    <div class="legal">
      <span>© 2026 The Print Shop (Collingwood) Ltd. — printing in Collingwood since 1980.</span>
      <span>Good service at a fair price.</span>
    </div>
  </div>
  <div class="colourbar" aria-hidden="true"><span></span><span></span><span></span><span></span></div>
</footer>`;
}

const NAVJS = `
<script>
(function(){
  var btn=document.querySelector('.navtoggle');
  var menu=document.getElementById('menu');
  if(btn&&menu){
    btn.addEventListener('click',function(){
      var open=menu.classList.toggle('open');
      btn.setAttribute('aria-expanded',open?'true':'false');
    });
  }
})();
</script>`;

// ---------------------------------------------------------------- quote pop-up (modal)
const QM_OPTS = PRODUCTS.map(p=>`<option value="${p[1]}">${p[1]}</option>`).join("");
const QM_NAMES = JSON.stringify(Object.fromEntries(PRODUCTS.map(p=>[p[0],p[1]])));
// Lead-source tracking. Records where a visitor came from (UTM tags, ad click IDs,
// or the referring site) on first and latest visit, kept in the browser for 90 days,
// and sends it with any quote request so the shop can see which marketing works.
const ATTRJS = `<script>
(function(){
  var K=['utm_source','utm_medium','utm_campaign','utm_term','utm_content','gclid','fbclid','msclkid'];
  var DAY=86400000, TTL=90*DAY, SE=['google.','bing.','duckduckgo.','yahoo.','ecosia.','search.brave.'];
  function get(k){try{var v=JSON.parse(localStorage.getItem(k)||'null');if(v&&v.ts&&(Date.now()-v.ts)<TTL)return v;}catch(e){}return null;}
  function put(k,v){try{localStorage.setItem(k,JSON.stringify(v));}catch(e){}}
  var q={};try{var p=new URLSearchParams(location.search);K.forEach(function(k){var x=p.get(k);if(x)q[k]=x.slice(0,200);});}catch(e){}
  var ref='';try{if(document.referrer){var h=new URL(document.referrer).hostname;if(h&&h!==location.hostname)ref=h;}}catch(e){}
  function touch(){
    var src=q.utm_source||(q.gclid?'google':q.fbclid?'facebook':q.msclkid?'bing':ref)||'(direct)';
    var med=q.utm_medium||((q.gclid||q.msclkid)?'cpc':q.fbclid?'paid_social':ref?(SE.some(function(s){return ref.indexOf(s)>-1;})?'organic':'referral'):'(none)');
    var t={ts:Date.now(),source:src,medium:med,campaign:q.utm_campaign||'',term:q.utm_term||'',content:q.utm_content||'',landing:location.pathname,referrer:ref};
    ['gclid','fbclid','msclkid'].forEach(function(k){if(q[k])t[k]=q[k];});
    return t;
  }
  var fresh=Object.keys(q).length>0||!!ref;
  if(!get('tps_ft'))put('tps_ft',touch());
  if(fresh||!get('tps_lt'))put('tps_lt',touch());
  // Visit history: session count, pages viewed this visit and time actually spent looking at them.
  var now=Date.now(), SESS=1800000, sc=get('tps_sc')||{ts:now,n:0}, ss=null;
  try{ss=JSON.parse(localStorage.getItem('tps_ss')||'null');}catch(e){}
  if(!ss||!ss.j||now-ss.last>SESS){sc.n=(sc.n||0)+1;sc.ts=now;ss={last:now,eng:0,j:[]};}
  put('tps_sc',sc);
  ss.j.push({p:location.pathname,t:0}); if(ss.j.length>15)ss.j.shift();
  var cur=ss.j.length-1, vis=document.visibilityState==='visible'?Date.now():null;
  function save(){var t=Date.now();if(vis){var d=t-vis;ss.eng+=d;ss.j[cur].t+=d;vis=t;}ss.last=t;try{localStorage.setItem('tps_ss',JSON.stringify(ss));}catch(e){}}
  document.addEventListener('visibilitychange',function(){if(document.visibilityState==='hidden'){save();vis=null;}else vis=Date.now();});
  window.addEventListener('pagehide',save); save();
  window.tpsAttribution=function(){
    var f=get('tps_ft')||{},l=get('tps_lt')||{};
    var ago=f.ts?String(Math.round((Date.now()-f.ts)/DAY)):'';
    return {source:l.source||'',medium:l.medium||'',campaign:l.campaign||'',term:l.term||'',content:l.content||'',
      landing:l.landing||'',referrer:l.referrer||'',gclid:l.gclid||'',fbclid:l.fbclid||'',msclkid:l.msclkid||'',
      first_source:f.source||'',first_medium:f.medium||'',first_campaign:f.campaign||'',first_landing:f.landing||'',
      first_days_ago:ago,submitted_from:location.pathname,
      visits:String(sc.n||1),engaged_seconds:(save(),String(Math.round(ss.eng/1000))),
      journey:ss.j.map(function(x){return x.p+' ('+Math.round(x.t/1000)+'s)';}).join(' > ')};
  };
  window.tpsSourceLine=function(a){
    return 'Source: '+(a.source||'(unknown)')+' / '+(a.medium||'')+(a.campaign?' / '+a.campaign:'')+(a.landing?' (landed on '+a.landing+')':'');
  };
  window.tpsLead=function(form,product){try{
    if(window.gtag)window.gtag('event','generate_lead',{form_name:form,product:product||''});
    if(window.fbq)window.fbq('track','Lead');
    if(window.va)window.va('event',{name:'Quote request',data:{form:form}});
  }catch(e){}};
})();
</script>`;
const MODAL = `
<div class="qm-overlay" id="qmOverlay" role="dialog" aria-modal="true" aria-labelledby="qmTitle" aria-hidden="true">
  <div class="qm" role="document">
    <div class="colourbar" aria-hidden="true"><span></span><span></span><span></span><span></span></div>
    <button class="qm-close" id="qmClose" type="button" aria-label="Close">&times;</button>
    <div class="qm-inner">
      <h2 id="qmTitle">Get a free estimate</h2>
      <p class="qm-sub">Tell us what you need and we'll reply with a fair price — usually the same day.</p>
      <form id="qmForm" novalidate>
        <div class="hp" aria-hidden="true"><label>Leave this empty<input id="qm_website" type="text" tabindex="-1" autocomplete="off"></label></div>
        <div class="two">
          <div class="field"><label for="qm_name">Name <span class="req">*</span></label><input id="qm_name" type="text" autocomplete="name"></div>
          <div class="field"><label for="qm_phone">Phone <span class="req">*</span></label><input id="qm_phone" type="tel" autocomplete="tel"></div>
        </div>
        <div class="field"><label for="qm_email">Email <span class="req">*</span></label><input id="qm_email" type="email" autocomplete="email"></div>
        <div class="field"><label for="qm_product">Product</label><select id="qm_product"><option value="">Select a product…</option>${QM_OPTS}<option value="Other / custom">Other / custom</option></select></div>
        <div class="field"><label for="qm_details">What do you need? <span class="req">*</span></label><textarea id="qm_details" placeholder="Quantity, size, finish, deadline…"></textarea></div>
        <button class="btn solid" type="submit">Request my estimate</button>
        <div class="qm-msg" id="qmMsg"></div>
        <p class="qm-call">Prefer to call? <a href="tel:+17054452880">705 445 2880</a></p>
      </form>
    </div>
  </div>
</div>
${ATTRJS}
<script>
(function(){
  var ov=document.getElementById('qmOverlay'); if(!ov) return;
  var form=document.getElementById('qmForm'), msg=document.getElementById('qmMsg'), sel=document.getElementById('qm_product');
  var names=${QM_NAMES}, lastFocus=null;
  function openModal(slug){
    lastFocus=document.activeElement;
    if(slug&&sel){var want=names[slug]||slug;for(var i=0;i<sel.options.length;i++){if(sel.options[i].value===want){sel.selectedIndex=i;break;}}}
    ov.classList.add('open');ov.setAttribute('aria-hidden','false');document.body.classList.add('qm-lock');
    var n=document.getElementById('qm_name');if(n)n.focus();
    try{localStorage.setItem('tps_quote_seen',String(Date.now()));}catch(e){}
  }
  function closeModal(){ov.classList.remove('open');ov.setAttribute('aria-hidden','true');document.body.classList.remove('qm-lock');if(lastFocus&&lastFocus.focus)lastFocus.focus();}
  window.openQuoteModal=openModal;
  document.getElementById('qmClose').addEventListener('click',closeModal);
  ov.addEventListener('click',function(e){if(e.target===ov)closeModal();});
  document.addEventListener('keydown',function(e){if(e.key==='Escape'&&ov.classList.contains('open'))closeModal();});
  document.addEventListener('click',function(e){
    var a=e.target.closest?e.target.closest('a[href*="printing/custom-printing/"]'):null;
    if(a){e.preventDefault();var m=a.getAttribute('href').match(/[?&]product=([^&]+)/);openModal(m?decodeURIComponent(m[1]):'');}
  });
  var onQuote=/\\/printing\\/custom-printing\\//.test(location.pathname);
  if(!onQuote){
    var seen=0;try{seen=parseInt(localStorage.getItem('tps_quote_seen')||'0',10);}catch(e){}
    if(!seen||(Date.now()-seen)>604800000){setTimeout(function(){if(!ov.classList.contains('open'))openModal('');},18000);}
  }
  form.addEventListener('submit',function(e){
    e.preventDefault();
    var name=document.getElementById('qm_name').value.trim();
    var email=document.getElementById('qm_email').value.trim();
    var phone=document.getElementById('qm_phone').value.trim();
    var details=document.getElementById('qm_details').value.trim();
    if(!name||!/^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$/.test(email)||!phone||!details){msg.innerHTML='Please add your name, a valid email, phone, and what you need.';msg.classList.add('show');return;}
    var product=sel?sel.value:'';
    var btn=form.querySelector('button[type=submit]');
    function done(){
      form.reset();
      msg.innerHTML='Thanks — we have your request and will reply with a price, usually the same business day. Questions? Call <a href="tel:+17054452880" style="color:var(--red)">705 445 2880</a>.';
      msg.classList.add('show');
    }
    var attr=window.tpsAttribution?window.tpsAttribution():{};
    if(window.tpsLead)window.tpsLead('Website pop-up',product);
    function fallback(){
      var body='Quote request from the website pop-up:%0D%0A%0D%0A'
        +'Name: '+encodeURIComponent(name)+'%0D%0A'
        +'Email: '+encodeURIComponent(email)+'%0D%0A'
        +'Phone: '+encodeURIComponent(phone)+'%0D%0A'
        +'Product: '+encodeURIComponent(product)+'%0D%0A%0D%0A'
        +'Details:%0D%0A'+encodeURIComponent(details)
        +(window.tpsSourceLine?'%0D%0A%0D%0A'+encodeURIComponent(window.tpsSourceLine(attr)):'');
      msg.innerHTML='Thanks — your email app is opening with the request ready to send. Prefer to call? <a href="tel:+17054452880" style="color:var(--red)">705 445 2880</a>.';
      msg.classList.add('show');
      window.location.href='mailto:info@theprintshops.ca?subject=Quote%20request&body='+body;
    }
    btn.disabled=true;msg.innerHTML='Sending…';msg.classList.add('show');
    fetch('/api/quote/',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({
      source:'Website pop-up',name:name,email:email,phone:phone,product:product,details:details,
      website:(document.getElementById('qm_website')||{}).value||'',attribution:attr
    })}).then(function(r){return r.json().catch(function(){return {};});})
      .then(function(j){if(j&&j.ok)done();else fallback();})
      .catch(fallback)
      .then(function(){btn.disabled=false;});
  });
})();
</script>`;

// ---------------------------------------------------------------- pages
function buildHome(){
  const root="";
  const rows = PRODUCTS.map(p=>`      <a class="prod" href="${L(root,'printing/'+p[0]+'/')}">
        <span class="name">${p[1]}</span>
        <span class="desc">${p[2]}</span>
        <span class="go">Start a quote</span>
      </a>`).join("\n");
  const svc = SERVICES.map((s,i)=>`      <a class="svc" href="${L(root,'services/'+s[0]+'/')}">
        <h3><span class="n">${String(i+1).padStart(2,'0')}</span>${s[1]}</h3>
        <p>${s[3][0][1]}</p>
        <span class="more">Learn more</span>
      </a>`).join("\n");
  let h = head(root,"The Print Shop (Collingwood) Ltd. — Local printing, done well","Your local print shop in Collingwood, Ontario since 1980. Brochures, business cards, flyers, booklets and more — good service at a fair price.",BASE+"/",[localbusiness(),crumb([["Home","/"]])]);
  h += header(root);
  h += `
<main id="main">
<div class="hero">
  <div class="sheet">
    <span class="crop-b" aria-hidden="true"></span>
    <p class="kicker">SINCE 1980</p>
    <h1 class="display">Great printing, <em>done right</em> in Collingwood.</h1>
    <p class="lede">Brochures, business cards, flyers, booklets and more, priced fairly and ready when you need them. Bring us your file or your idea, and we'll take it from there.</p>
    <div class="cta">
      <a class="btn solid" href="${L(root,'printing/custom-printing/')}">Get an estimate</a>
      <a class="btn line" href="${L(root,'printing/')}">See what we print</a>
    </div>
  </div>
</div>
<div class="promise">
  <div class="wrap">
    <div class="grid">
      <div class="cell"><h3>A fair price</h3><p>No inflated quotes or surprise line items. Honest pricing on work that's built to last.</p></div>
      <div class="cell"><h3>Real service</h3><p>Talk to the people running the press. We proof your job carefully before it ever prints.</p></div>
      <div class="cell"><h3>Local, start to finish</h3><p>Most jobs are printed and finished right here in Collingwood. For specialty work we use a network of trusted print partners, and you still deal with us from quote to pickup.</p></div>
    </div>
  </div>
</div>
<section id="products">
  <div class="wrap">
    <p class="eyebrow">WHAT WE PRINT</p>
    <h2 class="h-sec">Everything a growing business puts on paper.</h2>
    <p class="lead">From a single box of business cards to a full run of booklets, we've got it covered. Pick a product to start a quote.</p>
    <div class="prod-list">
${rows}
    </div>
    <p style="margin-top:28px"><a class="btn ghost" href="${L(root,'printing/')}">View all products</a></p>
  </div>
</section>
<section class="services" id="services">
  <div class="wrap">
    <p class="eyebrow">BEYOND THE PRESS</p>
    <h2 class="h-sec">The finishing that makes it look finished.</h2>
    <p class="lead">Printing is only half the job. We handle the steps that turn a stack of sheets into a proper piece.</p>
    <div class="svc-grid">
${svc}
    </div>
  </div>
</section>
<section id="how">
  <div class="wrap">
    <p class="eyebrow">HOW IT WORKS</p>
    <h2 class="h-sec">Four steps from file to finished.</h2>
    <div class="steps">
      <div class="step"><div class="num">1</div><h3>Send your file</h3><p>Email your artwork or drop by with it. Not sure it's print-ready? Send it anyway and we'll check.</p></div>
      <div class="step"><div class="num">2</div><h3>Approve the proof</h3><p>We send a proof so you can confirm the colour, layout and copy before anything runs.</p></div>
      <div class="step"><div class="num">3</div><h3>We print it</h3><p>Your job goes on press and through finishing, checked at each stage against your proof.</p></div>
      <div class="step"><div class="num">4</div><h3>Pick it up</h3><p>Collect it in Collingwood or arrange delivery. Reorders are quick once we have your file.</p></div>
    </div>
  </div>
</section>
<section style="background:var(--paper-2);border-top:1px solid var(--rule)">
  <div class="wrap" style="text-align:center">
    <h2 class="h-sec" style="margin:0 auto">Ready to price your next job?</h2>
    <p class="lead" style="margin:18px auto 30px">Tell us what you need and we'll get you a fair quote fast.</p>
    <a class="btn" href="${L(root,'printing/custom-printing/')}" style="background:var(--red);border-color:var(--red)">Get an estimate</a>
    <a class="btn ghost" href="tel:${TEL}" style="margin-left:10px">Call ${PHONE}</a>
  </div>
</section>
</main>`;
  h += footer(root) + MODAL + NAVJS + "\n</body></html>";
  write("index.html", h);
}

function buildProductsIndex(){
  const root="../";
  const rows = PRODUCTS.map(p=>`      <a class="prod" href="${L(root,'printing/'+p[0]+'/')}">
        <span class="name">${p[1]}</span>
        <span class="desc">${p[2]}</span>
        <span class="go">View &amp; quote</span>
      </a>`).join("\n");
  let h = head(root,"Products — The Print Shop (Collingwood) Ltd.","Everything we print in Collingwood: business cards, brochures, flyers, postcards, booklets, labels and more.",BASE+"/printing/",[crumb([["Home","/"],["Products","/printing/"]])]);
  h += header(root);
  h += `
<main id="main">
<div class="page-hero">
  <div class="wrap">
    <div class="crumbs"><a href="${L(root,'')}">Home</a><span class="s">/</span>Products</div>
    <h1>What we print.</h1>
    <p>A full-service print shop. Don't see exactly what you need? We print plenty more — just ask for a custom quote.</p>
  </div>
</div>
<section>
  <div class="wrap">
    <div class="prod-list" style="margin-top:0">
${rows}
    </div>
    <div style="margin-top:34px;padding:26px 28px;background:var(--paper-2);border:1px solid var(--rule);display:flex;justify-content:space-between;align-items:center;gap:20px;flex-wrap:wrap">
      <div><strong style="font-size:20px">Need something not listed?</strong><br><span style="color:var(--muted)">Banners, calendars, letterhead, pocket folders, table tents and more.</span></div>
      <a class="btn" href="${L(root,'printing/custom-printing/')}" style="background:var(--red);border-color:var(--red)">Request a custom quote</a>
    </div>
  </div>
</section>
</main>`;
  h += footer(root) + MODAL + NAVJS + "\n</body></html>";
  write("printing/index.html", h);
}

function buildProduct(p){
  const [slug,name,lede,body,chips,opts]=p;
  const root="../../";
  const bodyHtml = body.map(([hh,pp])=>`      <h2>${hh}</h2>\n      <p>${pp}</p>`).join("\n");
  const chipsHtml = chips.map(c=>`        <li>${c}</li>`).join("\n");
  const optsHtml = opts.map(([lab,val])=>`        <li>${lab}<span>${val}</span></li>`).join("\n");
  const rail = PRODUCTS.filter(x=>x[0]!==slug).map(x=>`      <a href="${L(root,"printing/"+x[0]+"/")}">${x[1]}</a>`).join("\n");
  const quote = L(root,'printing/custom-printing/')+"?product="+slug;
  const u="/printing/"+slug+"/";
  const extra=[productSchema(name,`${name} printed in Collingwood. ${lede} Request a fair quote from The Print Shop.`,u),crumb([["Home","/"],["Products","/printing/"],[name,u]])];
  const faq=FAQ[slug]; if(faq) extra.push(faqpage(faq));
  let h = head(root,`${name} — The Print Shop (Collingwood) Ltd.`,`${name} printed in Collingwood. ${lede} Request a fair quote from The Print Shop.`,BASE+u,extra);
  h += header(root);
  h += `
<main id="main">
<div class="page-hero">
  <div class="wrap">
    <div class="crumbs"><a href="${L(root,'')}">Home</a><span class="s">/</span><a href="${L(root,'printing/')}">Products</a><span class="s">/</span>${name}</div>
    <h1>${name}</h1>
    <p>${lede}</p>
  </div>
</div>
<section>
  <div class="wrap">
    <div class="detail">
      <div class="body">
${bodyHtml}
        <h2>Good for</h2>
        <ul class="chips">
${chipsHtml}
        </ul>
      </div>
      <aside class="side">
        <h3>Get a quote</h3>
        <p>Tell us your quantity, size and finish and we'll price it fairly — usually same day.</p>
        <a class="btn solid" href="${quote}">Request a quote</a>
        <a class="btn ghost" href="tel:${TEL}">Call ${PHONE}</a>
        <ul class="opts">
${optsHtml}
        </ul>
        <p style="font-size:13px;margin:14px 0 0">Options vary by job. We'll confirm the details on your estimate.</p>
      </aside>
    </div>
    <div class="rail" style="margin-top:56px;padding-top:34px">
      <h2>Other products</h2>
      <div class="row">
${rail}
      </div>
    </div>
  </div>
</section>${faq?faqHtml(faq):""}
</main>`;
  h += footer(root) + MODAL + NAVJS + "\n</body></html>";
  write(`printing/${slug}/index.html`, h);
}

function buildServicesIndex(){
  const root="../";
  const cells = SERVICES.map((s,i)=>`      <a class="svc" href="${L(root,'services/'+s[0]+'/')}">
        <h3><span class="n">${String(i+1).padStart(2,'0')}</span>${s[1]}</h3>
        <p>${s[3][0][1]}</p>
        <span class="more">Learn more</span>
      </a>`).join("\n");
  let h = head(root,"Services — The Print Shop (Collingwood) Ltd.","A full-service printer in Collingwood: bindery and finishing, graphic design, booklet binding, printing and copying.",BASE+"/services/",[crumb([["Home","/"],["Services","/services/"]])]);
  h += header(root);
  h += `
<main id="main">
<div class="page-hero">
  <div class="wrap">
    <div class="crumbs"><a href="${L(root,'')}">Home</a><span class="s">/</span>Services</div>
    <h1>A full-service printer.</h1>
    <p>The Print Shop is a full-service printer, which means we can do just about anything — from design through printing to the finishing that ties it all together.</p>
  </div>
</div>
<section class="services" style="padding-top:64px">
  <div class="wrap">
    <div class="svc-grid" style="margin-top:0">
${cells}
    </div>
  </div>
</section>
</main>`;
  h += footer(root) + MODAL + NAVJS + "\n</body></html>";
  write("services/index.html", h);
}

function buildService(s){
  const [slug,name,lede,body,chips]=s;
  const root="../../";
  const bodyHtml = body.map(([hh,pp])=>`      <h2>${hh}</h2>\n      <p>${pp}</p>`).join("\n");
  const chipsHtml = chips.map(c=>`        <li>${c}</li>`).join("\n");
  const u="/services/"+slug+"/";
  const extra=[serviceSchema(name,lede,u),crumb([["Home","/"],["Services","/services/"],[name,u]])];
  const faq=FAQ[slug]; if(faq) extra.push(faqpage(faq));
  let h = head(root,`${name} — The Print Shop (Collingwood) Ltd.`,`${name} at The Print Shop in Collingwood. ${lede}`,BASE+u,extra);
  h += header(root);
  h += `
<main id="main">
<div class="page-hero">
  <div class="wrap">
    <div class="crumbs"><a href="${L(root,'')}">Home</a><span class="s">/</span><a href="${L(root,'services/')}">Services</a><span class="s">/</span>${name}</div>
    <h1>${name}</h1>
    <p>${lede}</p>
  </div>
</div>
<section>
  <div class="wrap">
    <div class="detail">
      <div class="body">
${bodyHtml}
        <h2>What we handle</h2>
        <ul class="chips">
${chipsHtml}
        </ul>
      </div>
      <aside class="side">
        <h3>Talk it through</h3>
        <p>Not sure what your job needs? Tell us about it and we'll point you the right way.</p>
        <a class="btn solid" href="${L(root,'printing/custom-printing/')}">Get an estimate</a>
        <a class="btn ghost" href="tel:${TEL}">Call ${PHONE}</a>
      </aside>
    </div>
  </div>
</section>${faq?faqHtml(faq):""}
</main>`;
  h += footer(root) + MODAL + NAVJS + "\n</body></html>";
  write(`services/${slug}/index.html`, h);
}

function buildAbout(){
  const root="../../";
  let h = head(root,"About Us — The Print Shop (Collingwood) Ltd.","Printing in Collingwood since 1980, on the principle of good service at a fair price.",BASE+"/feature/about-us/",[crumb([["Home","/"],["About Us","/feature/about-us/"]])]);
  h += header(root);
  h += `
<main id="main">
<div class="page-hero">
  <div class="wrap">
    <div class="crumbs"><a href="${L(root,'')}">Home</a><span class="s">/</span>About Us</div>
    <h1>Printing in Collingwood since 1980.</h1>
    <p>Good service at a fair price — the principle we've held to for more than four decades.</p>
  </div>
</div>
<section>
  <div class="wrap rich">
    <p>When you need printing for your business, organisation or institution, you want a printer who delivers quality work, competitive rates and fast turnaround. It's tempting to look only at price — but the cheapest quote isn't a bargain if the printing is substandard.</p>
    <p>Since 1980, The Print Shop (Collingwood) Ltd. has built its reputation by understanding what customers actually need and providing the range of services to meet it — fair prices, without compromising on quality.</p>
    <blockquote>We're in the business of printing, but what we produce is bigger than ink and toner on paper. We print your ideas — and help tell your story.</blockquote>
    <h2>How we work</h2>
    <p>Most of the work happens right here in our shop: design, printing, and the bindery and finishing that turn a stack of sheets into a finished piece. For specialty jobs, we work with a network of trusted print partners. Either way, you deal with us from start to finish, and you're always talking to people who know your job.</p>
    <p>We measure our success by yours. If your printing helps your business do better, we've done our job.</p>
    <div class="sig">Michael P. Donovan
      <span>Owner · <a href="mailto:michael@theprintshops.ca" style="color:var(--red);text-decoration:none">michael@theprintshops.ca</a></span>
    </div>
    <p style="margin-top:36px"><a class="btn" href="${L(root,'printing/custom-printing/')}" style="background:var(--red);border-color:var(--red)">Get an estimate</a>
      <a class="btn ghost" href="${L(root,'contact-us/')}" style="margin-left:10px">Contact us</a></p>
  </div>
</section>
</main>`;
  h += footer(root) + MODAL + NAVJS + "\n</body></html>";
  write("feature/about-us/index.html", h);
}

// ---------------------------------------------------------------- legal
// Plain-language terms and privacy notice. Owner to review before launch.
const LEGAL_UPDATED = "November 2026";
const LEGAL = {
  terms: {
    title: "Terms & Conditions",
    desc: "The terms that apply to estimates, proofs, orders and use of the website for The Print Shop (Collingwood) Ltd.",
    h1: "Terms &amp; Conditions",
    lede: "How estimates, proofs and orders work at The Print Shop.",
    body: `
    <p>These terms apply to estimates, orders and use of this website. By placing an order, you agree to them. If anything here conflicts with a written quote or agreement for your job, the written quote or agreement applies.</p>
    <h2>Estimates</h2>
    <p>Estimates are based on the details you give us: quantity, size, stock, colours, finishing and artwork condition. If the job changes, or the files need more work than expected, the price may change. We'll tell you before we go ahead. Estimates are valid for 30 days unless the quote says otherwise, since paper prices change.</p>
    <p>The instant prices shown on this website are starting points for planning only. They are not a binding quote until we confirm them with you.</p>
    <h2>Artwork and proofs</h2>
    <p>We send a proof before printing. Please check it carefully: spelling, phone numbers, dates, layout and colours. Once you approve a proof, we print what you approved, and corrections after approval may cost extra.</p>
    <p>Colour on screen and on a home printer won't match printed colour exactly. Small variations between proofs and the finished run, and between separate print runs, are normal in printing.</p>
    <h2>Your content</h2>
    <p>You confirm that you own or have permission to use everything you send us, including logos, photos, text and fonts. We may decline any job we consider unlawful or inappropriate.</p>
    <h2>Quantities</h2>
    <p>Printing and finishing involve setup sheets and some waste, so delivered quantities can vary slightly from the quantity ordered. If an exact count matters for your job, tell us when you order.</p>
    <h2>Turnaround, pickup and delivery</h2>
    <p>Turnaround times are estimates and start once we have your approved proof and any required deposit. Rush work is available on request. Finished work can be picked up at 26 Ronell Crescent, Collingwood, or delivered by arrangement.</p>
    <h2>Payment</h2>
    <p>Payment terms are set out on your quote or invoice. We may ask for a deposit on large or custom orders before production starts.</p>
    <h2>Problems with an order</h2>
    <p>Please check your order when you receive it and contact us within 7 days if something isn't right. If the error is ours, we'll reprint or credit the affected items. Our responsibility is limited to the price of the order in question.</p>
    <h2>This website</h2>
    <p>We work to keep the information on this site accurate, but products, prices and hours can change. Content on this site belongs to The Print Shop (Collingwood) Ltd. unless noted otherwise.</p>
    <h2>Governing law</h2>
    <p>These terms are governed by the laws of the Province of Ontario and the federal laws of Canada that apply there.</p>`
  },
  privacy: {
    title: "Privacy Policy",
    desc: "How The Print Shop (Collingwood) Ltd. collects, uses and protects personal information, including quote requests sent through the website.",
    h1: "Privacy Policy",
    lede: "What we collect, why, and what we do with it.",
    body: `
    <p>The Print Shop (Collingwood) Ltd. respects your privacy and handles personal information in line with Canada's <em>Personal Information Protection and Electronic Documents Act</em> (PIPEDA).</p>
    <h2>What we collect</h2>
    <p>When you request an estimate or contact us, we collect what you give us: your name, company, email address, phone number and the details of your job. If you send artwork or files, we keep those too, so we can produce your order.</p>
    <p>We don't use advertising trackers on this website, and we don't sell or rent personal information.</p>
    <h2>How we use it</h2>
    <p>We use your information to prepare estimates, produce and deliver your order, invoice you, and answer your questions. We may contact you about your job. We won't add you to a marketing list unless you ask to be on it.</p>
    <h2>Quote requests from this website</h2>
    <p>The estimate forms on this site send your request to our shop by email. Our website is hosted by Vercel, and our email is provided by Microsoft. These providers process data on our behalf and may store it outside Canada, including in the United States, where it can be subject to local laws.</p>
    <h2>Cookies and browser storage</h2>
    <p>This site doesn't set advertising or tracking cookies. To avoid showing you the estimate pop-up again and again, your browser stores a single setting (<code>tps_quote_seen</code>) that records when you last saw it. It contains no personal information and you can clear it at any time in your browser settings.</p>
    <p>Your browser also keeps a note of how you found us, such as a Google search, an ad or a link in one of our emails, for up to 90 days. If you send us an estimate request, that note is included with it so we know which of our advertising works. We don't use it to follow you on other websites. Fonts are loaded from Google Fonts, which receives your IP address when the page loads.</p>
    <h2>How long we keep it</h2>
    <p>We keep job and customer records for as long as we need them to serve you and to meet tax and accounting requirements. Artwork may be kept so we can reprint your job; ask us any time if you want it deleted.</p>
    <h2>Your choices</h2>
    <p>You can ask to see the personal information we hold about you, correct it, or have us delete it where we're not required to keep it. Contact us at <a href="mailto:${EMAIL}">${EMAIL}</a> or <a href="tel:${TEL}">${PHONE}</a>.</p>
    <p>If you're not satisfied with our response, you can contact the Office of the Privacy Commissioner of Canada at <a href="https://www.priv.gc.ca/">priv.gc.ca</a>.</p>
    <h2>Changes</h2>
    <p>We may update this policy from time to time. The date below shows when it was last changed.</p>`
  }
};
function buildLegal(slug){
  const p = LEGAL[slug], root = "../";
  let h = head(root, `${p.title} — The Print Shop (Collingwood) Ltd.`, p.desc, BASE+"/"+slug+"/", [crumb([["Home","/"],[p.title,"/"+slug+"/"]])]);
  h += header(root);
  h += `
<main id="main">
<div class="page-hero">
  <div class="wrap">
    <div class="crumbs"><a href="${L(root,'')}">Home</a><span class="s">/</span>${p.h1}</div>
    <h1>${p.h1}</h1>
    <p>${p.lede}</p>
  </div>
</div>
<section>
  <div class="wrap rich">${p.body}
    <p style="margin-top:36px;color:var(--muted,#666);font-size:.9em">Last updated ${LEGAL_UPDATED}. Questions: <a href="mailto:${EMAIL}">${EMAIL}</a> · ${PHONE}</p>
  </div>
</section>
</main>`;
  h += footer(root) + MODAL + NAVJS + "\n</body></html>";
  write(slug+"/index.html", h);
}

// ---------------------------------------------------------------- 404
function build404(){
  // Served by Vercel at any path, so links are absolute from the site root.
  const root = "/";
  let h = head(root, "Page not found — The Print Shop (Collingwood) Ltd.", "This page has moved or no longer exists.", BASE+"/", []);
  h = h.replace('<meta name="robots" content="index,follow,max-image-preview:large">','<meta name="robots" content="noindex">');
  h += header(root);
  h += `
<main id="main">
<div class="page-hero">
  <div class="wrap">
    <h1>That page has moved.</h1>
    <p>We've rebuilt our website, so some old links no longer work. Everything you need is still here.</p>
    <p style="margin-top:24px"><a class="btn" href="/printing/" style="background:var(--red);border-color:var(--red)">See all products</a>
      <a class="btn ghost" href="/printing/custom-printing/" style="margin-left:10px;color:var(--paper);border-color:var(--paper)">Get an estimate</a></p>
  </div>
</div>
</main>`;
  h += footer(root) + MODAL + NAVJS + "\n</body></html>";
  write("404.html", h);
}

function buildContact(){
  const root="../";
  const mapq="26+Ronell+Crescent+Collingwood+Ontario+L9Y+4J7";
  let h = head(root,"Contact — The Print Shop (Collingwood) Ltd.","Visit or call The Print Shop at 26 Ronell Crescent, Collingwood, Ontario. Phone 705 445 2880.",BASE+"/contact-us/",[crumb([["Home","/"],["Contact","/contact-us/"]])]);
  h += header(root);
  h += `
<main id="main">
<div class="page-hero">
  <div class="wrap">
    <div class="crumbs"><a href="${L(root,'')}">Home</a><span class="s">/</span>Contact</div>
    <h1>Come by, call, or send us a file.</h1>
    <p>We're on Ronell Crescent in Collingwood, open weekdays. However you reach us, you'll talk to someone who can help.</p>
  </div>
</div>
<section>
  <div class="wrap">
    <div class="cols">
      <div>
        <dl class="info">
          <dt class="first">CALL US</dt>
          <dd><a href="tel:${TEL}">${PHONE}</a></dd>
          <dt>EMAIL</dt>
          <dd><a href="mailto:${EMAIL}">${EMAIL}</a></dd>
          <dt>VISIT</dt>
          <dd>26 Ronell Crescent<br>Collingwood, Ontario&nbsp; L9Y 4J7</dd>
          <dt>HOURS</dt>
          <dd>Monday to Friday<br>8:00&nbsp;am – 5:00&nbsp;pm</dd>
        </dl>
        <div class="map">
          <iframe title="Map to The Print Shop, 26 Ronell Crescent, Collingwood"
            src="https://www.google.com/maps?q=${mapq}&output=embed" loading="lazy"
            referrerpolicy="no-referrer-when-downgrade"></iframe>
        </div>
      </div>
      <div class="quote-form">
        <h2>Get a free estimate</h2>
        <p class="note">Tell us what you need printed and we'll get back to you with a fair quote.</p>
        <a class="btn solid" href="${L(root,'printing/custom-printing/')}" style="display:block;text-align:center">Start an estimate request</a>
        <p style="margin:22px 0 0;font-size:15px;color:var(--muted)">Prefer to send artwork? Email your file to <a href="mailto:${EMAIL}" style="color:var(--red)">${EMAIL}</a> and we'll confirm it's print-ready.</p>
      </div>
    </div>
  </div>
</section>
</main>`;
  h += footer(root) + MODAL + NAVJS + "\n</body></html>";
  write("contact-us/index.html", h);
}

function buildQuote(){
  const root="../../";
  const opts = PRODUCTS.map(p=>`<option value="${p[1]}">${p[1]}</option>`).join("");
  let h = head(root,"Request a Quote — The Print Shop (Collingwood) Ltd.","Request a free printing estimate from The Print Shop in Collingwood. Tell us your product, quantity and finish.",BASE+"/printing/custom-printing/",[crumb([["Home","/"],["Products","/printing/"],["Request a quote","/printing/custom-printing/"]])]);
  h += header(root);
  h += `
<main id="main">
<div class="page-hero">
  <div class="wrap">
    <div class="crumbs"><a href="${L(root,'')}">Home</a><span class="s">/</span><a href="${L(root,'printing/')}">Products</a><span class="s">/</span>Request a quote</div>
    <h1>Request a free estimate.</h1>
    <p>The more you can tell us, the faster and more accurate your quote. Don't have every detail? Send what you have and we'll fill in the gaps.</p>
  </div>
</div>
<section>
  <div class="wrap">
    <div class="cols">
      <form class="quote-form" id="quoteForm" novalidate>
        <div class="hp" aria-hidden="true"><label>Leave this empty<input id="q_website" type="text" tabindex="-1" autocomplete="off"></label></div>
        <h2>Your print job</h2>
        <p class="note">Fields marked <span style="color:var(--red)">*</span> are required.</p>
        <div class="two">
          <div class="field"><label for="name">Name <span class="req">*</span></label><input id="name" name="name" type="text" autocomplete="name" required></div>
          <div class="field"><label for="company">Company</label><input id="company" name="company" type="text" autocomplete="organization"></div>
        </div>
        <div class="two">
          <div class="field"><label for="email">Email <span class="req">*</span></label><input id="email" name="email" type="email" autocomplete="email" required></div>
          <div class="field"><label for="phone">Phone <span class="req">*</span></label><input id="phone" name="phone" type="tel" autocomplete="tel" required></div>
        </div>
        <div class="two">
          <div class="field"><label for="product">Product</label><select id="product" name="product"><option value="">Select a product…</option>${opts}<option value="Other / custom">Other / custom</option></select></div>
          <div class="field"><label for="qty">Quantity</label><input id="qty" name="qty" type="text" placeholder="e.g. 500"></div>
        </div>
        <div class="field"><label for="size">Size or finish</label><input id="size" name="size" type="text" placeholder="e.g. 8.5×11, double-sided, gloss"></div>
        <div class="field"><label for="details">Job details <span class="req">*</span></label><textarea id="details" name="details" placeholder="Tell us about the job — deadline, stock, colours, and anything else that helps." required></textarea></div>
        <button class="btn solid" type="submit">Request my estimate</button>
        <div class="form-msg" id="formMsg"></div>
        <p style="font-size:13px;color:var(--muted);margin:16px 0 0">Have artwork ready? Email it to <a href="mailto:${EMAIL}" style="color:var(--red)">${EMAIL}</a> after you send this.</p>
      </form>
      <aside class="aside-quote">
        <h3>What to include</h3>
        <ul>
          <li><b>1</b><span>The product and roughly how many you need.</span></li>
          <li><b>2</b><span>Size, sides (single or double), and any coating or finish.</span></li>
          <li><b>3</b><span>Your deadline, so we can plan the press schedule.</span></li>
          <li><b>4</b><span>Whether you have print-ready artwork or need design help.</span></li>
        </ul>
        <p style="margin-top:22px;color:var(--muted);font-size:16px">Rather talk it through?</p>
        <a class="btn" href="tel:${TEL}" style="background:var(--red);border-color:var(--red);display:inline-block;margin-top:6px">Call ${PHONE}</a>
      </aside>
    </div>
  </div>
</section>
</main>`;
  h += footer(root) + MODAL;
  h += `
<script>
(function(){
  var btn=document.querySelector('.navtoggle');
  var menu=document.getElementById('menu');
  if(btn&&menu){btn.addEventListener('click',function(){var o=menu.classList.toggle('open');btn.setAttribute('aria-expanded',o?'true':'false');});}
  var params=new URLSearchParams(window.location.search);
  var slug=params.get('product');
  var names=${JSON.stringify(Object.fromEntries(PRODUCTS.map(p=>[p[0],p[1]])))};
  if(slug&&names[slug]){
    var sel=document.getElementById('product');
    for(var i=0;i<sel.options.length;i++){if(sel.options[i].value===names[slug]){sel.selectedIndex=i;break;}}
  }
  var form=document.getElementById('quoteForm');
  var msg=document.getElementById('formMsg');
  form.addEventListener('submit',function(e){
    e.preventDefault();
    var required=['name','email','phone','details'];
    for(var i=0;i<required.length;i++){
      var el=document.getElementById(required[i]);
      if(!el.value.trim()){el.focus();msg.textContent='Please fill in the required fields so we can reach you.';msg.classList.add('show');return;}
    }
    if(!/^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$/.test(document.getElementById('email').value.trim())){document.getElementById('email').focus();msg.textContent='Please enter a valid email address so we can reply.';msg.classList.add('show');return;}
    var v=function(id){return document.getElementById(id).value;};
    var btn=form.querySelector('button[type=submit]');
    function done(){
      form.reset();
      msg.innerHTML='Thanks — we have your request and will reply with a price, usually the same business day. Questions? Call '+
        '<a href="tel:${TEL}" style="color:var(--red)">${PHONE}</a>.';
      msg.classList.add('show');
    }
    var attr=window.tpsAttribution?window.tpsAttribution():{};
    if(window.tpsLead)window.tpsLead('Quote page',v('product'));
    function fallback(){
      var body='Estimate request from the website:%0D%0A%0D%0A'
        +'Name: '+encodeURIComponent(v('name'))+'%0D%0A'
        +'Company: '+encodeURIComponent(v('company'))+'%0D%0A'
        +'Email: '+encodeURIComponent(v('email'))+'%0D%0A'
        +'Phone: '+encodeURIComponent(v('phone'))+'%0D%0A'
        +'Product: '+encodeURIComponent(v('product'))+'%0D%0A'
        +'Quantity: '+encodeURIComponent(v('qty'))+'%0D%0A'
        +'Size/finish: '+encodeURIComponent(v('size'))+'%0D%0A%0D%0A'
        +'Details:%0D%0A'+encodeURIComponent(v('details'))
        +(window.tpsSourceLine?'%0D%0A%0D%0A'+encodeURIComponent(window.tpsSourceLine(attr)):'');
      msg.innerHTML='Thanks — your email app will open with the request ready to send. Prefer to call? '+
        '<a href="tel:${TEL}" style="color:var(--red)">${PHONE}</a>.';
      msg.classList.add('show');
      window.location.href='mailto:${EMAIL}?subject=Estimate%20request&body='+body;
    }
    btn.disabled=true;msg.textContent='Sending…';msg.classList.add('show');
    fetch('/api/quote/',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({
      source:'Quote page',name:v('name'),company:v('company'),email:v('email'),phone:v('phone'),
      product:v('product'),qty:v('qty'),size:v('size'),details:v('details'),website:v('q_website'),attribution:attr
    })}).then(function(r){return r.json().catch(function(){return {};});})
      .then(function(j){if(j&&j.ok)done();else fallback();})
      .catch(fallback)
      .then(function(){btn.disabled=false;});
  });
})();
</script>`;
  h += "\n</body></html>";
  write("printing/custom-printing/index.html", h);
}

// ---------------------------------------------------------------- aux
function aux(){
  const pages=["index.html","printing/index.html","services/index.html","feature/about-us/index.html","contact-us/index.html","printing/custom-printing/index.html","terms/index.html","privacy/index.html"]
    .concat(PRODUCTS.map(p=>`printing/${p[0]}/index.html`))
    .concat(SERVICES.map(s=>`services/${s[0]}/index.html`));
  const locs=[...new Set(pages.map(p=>BASE+urlFor(p)))].sort();
  let sm=['<?xml version="1.0" encoding="UTF-8"?>','<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'];
  for(const u of locs){ const pr = u===BASE+"/"?"1.0":((u.includes("/printing/")||u.includes("/services/"))?"0.8":"0.6"); sm.push(`  <url><loc>${u}</loc><changefreq>monthly</changefreq><priority>${pr}</priority></url>`); }
  sm.push("</urlset>");
  write("sitemap.xml", sm.join("\n"));
  write("robots.txt", `User-agent: *\nAllow: /\n\n# Answer engines welcome\nUser-agent: GPTBot\nAllow: /\nUser-agent: OAI-SearchBot\nAllow: /\nUser-agent: PerplexityBot\nAllow: /\nUser-agent: ClaudeBot\nAllow: /\nUser-agent: Google-Extended\nAllow: /\n\nSitemap: ${BASE}/sitemap.xml\n`);
  write("llms.txt", `# The Print Shop (Collingwood) Ltd.\n\n> Local, full-service print shop in Collingwood, Ontario, serving the Georgian Bay area since 1980. Good service at a fair price.\n\n## About\nThe Print Shop (Collingwood) Ltd. is a full-service printer in Collingwood, Ontario. Family-run reputation since 1980. Most design, printing, bindery and finishing is done in the shop, with a network of trusted print partners for specialty jobs. Customers deal with one local shop from quote to pickup.\n\n## Contact\n- Phone: 705 445 2880\n- Address: 26 Ronell Crescent, Collingwood, Ontario L9Y 4J7, Canada\n- Hours: Monday to Friday, 8:00 am – 5:00 pm\n- Request a free estimate: ${BASE}/printing/custom-printing/\n\n## Areas served\n${AREAS.join(", ")}\n\n## Products\nBusiness cards, brochures, flyers, postcards, booklets, sell sheets, rack cards, door hangers, newsletters, envelopes, labels, carbonless (NCR) forms, and more. Full list: ${BASE}/printing/\n\n## Services\nBindery & finishing, graphic design, booklet binding, printing & copying. Full list: ${BASE}/services/\n\n## Why choose a local printer\nUnlike online printers shipped from away, The Print Shop offers real people who check your file, local pickup with no shipping wait, in-house design help, and more than 45 years of local experience.\n`);
}

// ---------------------------------------------------------------- run
fs.rmSync(OUT, {recursive:true, force:true});
fs.mkdirSync(OUT, {recursive:true});
fs.mkdirSync(path.join(OUT,"assets"), {recursive:true});
fs.writeFileSync(path.join(OUT,"assets","style.css"), fs.readFileSync(path.join(__dirname,"style.css")));
// site icons (favicon, apple-touch-icon, manifest) are served from the site root
const ICONS = path.join(__dirname,"icons");
if (fs.existsSync(ICONS)) for (const f of fs.readdirSync(ICONS)) fs.copyFileSync(path.join(ICONS,f), path.join(OUT,f));
// brand logos (SVG, converted from the shop's EPS files)
const BRAND = path.join(__dirname,"brand");
if (fs.existsSync(BRAND)) { fs.mkdirSync(path.join(OUT,"brand"),{recursive:true}); for (const f of fs.readdirSync(BRAND)) fs.copyFileSync(path.join(BRAND,f), path.join(OUT,"brand",f)); }
buildHome();
buildProductsIndex();
PRODUCTS.forEach(buildProduct);
buildServicesIndex();
SERVICES.forEach(buildService);
buildAbout();
buildContact();
buildQuote();
buildLegal("terms");
buildLegal("privacy");
build404();
aux();
let count=0;(function w(d){for(const e of fs.readdirSync(d,{withFileTypes:true})){const fp=path.join(d,e.name);if(e.isDirectory())w(fp);else if(e.name.endsWith(".html"))count++;}})(OUT);
console.log("Built "+count+" HTML pages to "+OUT);
