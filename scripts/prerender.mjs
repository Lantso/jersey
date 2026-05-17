import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { CURRENCY, PRODUCTS, calculateShipping, formatMoney } from "../catalog.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.dirname(__dirname);
const DIST = path.join(ROOT, "dist");
const SITE_URL = (process.env.PUBLIC_SITE_URL || "https://www.lantso.com").replace(/\/$/, "");
const LANGS = ["en", "fr", "ar"];
const DEFAULT_LANG = "en";
const SOCIAL_LINKS = {
  instagram: "https://www.instagram.com/lantso.at",
  tiktok: "https://www.tiktok.com/@lantsobrand"
};

const COPY = {
  homeTitle: {
    en: "Lantso - From the Roots to the World",
    fr: "Lantso - From the Roots to the World",
    ar: "Lantso - From the Roots to the World"
  },
  homeDescription: {
    en: "Lantso, very limited Moroccan jerseys for the 2026 World Cup. Roots 01 Khaki and Atlas 02 White.",
    fr: "Lantso, maillots marocains tres limites pour la Coupe du Monde 2026. Roots 01 Khaki et Atlas 02 White.",
    ar: "Lantso، قمصان مغربية محدودة جدا لكأس العالم 2026. روتس 01 كاكي وأطلس 02 أبيض."
  },
  stepInside: { en: "Step inside", fr: "Entrer", ar: "ادخل" },
  shopTitle: { en: "Shop Moroccan Jerseys | Lantso", fr: "Boutique maillots marocains | Lantso", ar: "متجر القمصان المغربية | Lantso" },
  shopDescription: {
    en: "Shop Lantso Roots 01 Khaki and Atlas 02 White, limited Moroccan jerseys for the 2026 World Cup.",
    fr: "Acheter Roots 01 Khaki et Atlas 02 White, deux maillots marocains limites pour la Coupe du Monde 2026.",
    ar: "تسوق روتس 01 كاكي وأطلس 02 أبيض، قمصان مغربية محدودة لكأس العالم 2026."
  },
  shopHeading: { en: "Shop Lantso Moroccan jerseys", fr: "Boutique Lantso maillots marocains", ar: "متجر قمصان Lantso المغربية" },
  shopBody: {
    en: "Very limited 2026 World Cup-inspired jerseys. 25 pieces per colour, sizes M and L.",
    fr: "Maillots tres limites inspires par la Coupe du Monde 2026. 25 pieces par couleur, tailles M et L.",
    ar: "قمصان محدودة جدا مستوحاة من كأس العالم 2026. 25 قطعة لكل لون، مقاسات M و L."
  },
  limited: { en: "Limited pieces", fr: "Pieces limitees", ar: "قطع محدودة" },
  material: { en: "Material", fr: "Matiere", ar: "الخامة" },
  sizes: { en: "Sizes", fr: "Tailles", ar: "المقاسات" },
  measurements: { en: "Measurements", fr: "Mesures", ar: "المقاسات" },
  care: { en: "Care", fr: "Entretien", ar: "العناية" },
  franceShipping: { en: "France shipping estimate", fr: "Estimation livraison France", ar: "تقدير الشحن إلى فرنسا" },
  infoTitle: { en: "Shipping, Returns and FAQ | Lantso", fr: "Livraison, retours et FAQ | Lantso", ar: "الشحن والإرجاع والأسئلة | Lantso" },
  infoDescription: {
    en: "Shipping, returns, sizing and FAQ information for Lantso limited Moroccan jerseys.",
    fr: "Informations livraison, retours, tailles et FAQ pour les maillots marocains limites Lantso.",
    ar: "معلومات الشحن والإرجاع والمقاسات والأسئلة لقمصان Lantso المغربية المحدودة."
  },
  shippingReturnsFaq: { en: "Shipping, returns and FAQ", fr: "Livraison, retours et FAQ", ar: "الشحن والإرجاع والأسئلة" },
  shippingBody: {
    en: "Orders ship from Europe with tracked delivery. France, the European Union, the United Kingdom, Morocco, and selected international destinations are enabled in checkout.",
    fr: "Les commandes partent d'Europe avec livraison suivie. France, Union europeenne, Royaume-Uni, Maroc et certaines destinations internationales sont actives au paiement.",
    ar: "تشحن الطلبات من أوروبا مع تتبع. فرنسا، الاتحاد الأوروبي، المملكة المتحدة، المغرب وبعض الوجهات الدولية مفعلة عند الدفع."
  },
  returns: { en: "Returns", fr: "Retours", ar: "الإرجاع" },
  returnsBody: {
    en: "Returns are accepted within 14 days after delivery when pieces are unworn, unwashed, and returned with their original packaging.",
    fr: "Les retours sont acceptes sous 14 jours apres livraison si les pieces sont non portees, non lavees et renvoyees dans leur packaging d'origine.",
    ar: "يقبل الإرجاع خلال 14 يوما بعد التسليم إذا كانت القطع غير مستعملة وغير مغسولة ومع تغليفها الأصلي."
  },
  legalTitle: { en: "Legal and Contact | Lantso", fr: "Legal et contact | Lantso", ar: "القانوني والتواصل | Lantso" },
  legalDescription: {
    en: "Legal information, privacy information and contact form for Lantso.",
    fr: "Informations legales, confidentialite et contact pour Lantso.",
    ar: "معلومات قانونية وخصوصية وتواصل مع Lantso."
  },
  legalHeading: { en: "Legal and contact", fr: "Legal et contact", ar: "القانوني والتواصل" },
  legalBody: {
    en: "Lantso sells limited edition jerseys in EUR. No VAT number is displayed on the storefront. An order is confirmed only after successful payment through Stripe Checkout.",
    fr: "Lantso vend des maillots en edition limitee en EUR. Aucun numero de TVA n'est affiche sur la boutique. Une commande est confirmee uniquement apres paiement reussi via Stripe Checkout.",
    ar: "تبيع Lantso قمصانا محدودة باليورو. لا يتم عرض رقم ضريبة VAT في المتجر. يؤكد الطلب فقط بعد نجاح الدفع عبر Stripe Checkout."
  },
  rootsTitle: { en: "Discover the Roots | Lantso", fr: "Decouvrir les Roots | Lantso", ar: "اكتشف الجذور | Lantso" },
  rootsDescription: {
    en: "The Lantso story behind Roots 01 Khaki and Atlas 02 White, from Moroccan heritage to the world.",
    fr: "L'histoire Lantso derriere Roots 01 Khaki et Atlas 02 White, des racines marocaines au monde.",
    ar: "قصة Lantso خلف روتس 01 كاكي وأطلس 02 أبيض، من الجذور المغربية إلى العالم."
  },
  rootsHeading: { en: "Discover the Roots", fr: "Decouvrir les Roots", ar: "اكتشف الجذور" },
  rootsBody: {
    en: "This page is reserved for the Lantso story, pencil sketches, and the path from the roots to the world.",
    fr: "Cette page est reservee a l'histoire de Lantso, aux sketchs au crayon et au parcours from the roots to the world.",
    ar: "هذه الصفحة مخصصة لقصة Lantso والرسومات الأولية ومسار العلامة من الجذور إلى العالم."
  },
  successTitle: { en: "Order Received | Lantso", fr: "Commande recue | Lantso", ar: "تم استلام الطلب | Lantso" },
  successBody: {
    en: "Payment is complete. You will receive the delivery follow-up by email.",
    fr: "Le paiement est termine. Le suivi de livraison sera envoye par email.",
    ar: "اكتملت عملية الدفع. سيصلك تتبع التوصيل عبر البريد الإلكتروني."
  },
  cancelTitle: { en: "Checkout Cancelled | Lantso", fr: "Paiement annule | Lantso", ar: "تم إلغاء الدفع | Lantso" },
  cancelBody: { en: "Your cart is still saved.", fr: "Ton panier reste sauvegarde.", ar: "سلتك ما زالت محفوظة." },
  backToShop: { en: "Back to shop", fr: "Retour boutique", ar: "العودة إلى المتجر" }
};

const routes = [
  {
    path: "/",
    title: "Lantso - From the Roots to the World",
    description: "Lantso, very limited Moroccan jerseys for the 2026 World Cup. Roots 01 Khaki and Atlas 02 White.",
    image: "/assets/photos/hero.png",
    body: homeBody,
    schema: (lang) => [organizationSchema(lang), webSiteSchema(lang), collectionSchema(lang)]
  },
  {
    path: "/shop",
    title: "Shop Moroccan Jerseys | Lantso",
    description: "Shop Lantso Roots 01 Khaki and Atlas 02 White, limited Moroccan jerseys for the 2026 World Cup.",
    image: "/assets/photos/hero.png",
    body: shopBody,
    schema: (lang) => [organizationSchema(lang), webSiteSchema(lang), collectionSchema(lang)]
  },
  ...PRODUCTS.map((product) => ({
    path: `/product/${product.id}`,
    title: `${product.name.en} - Limited Moroccan Jersey | Lantso`,
    description: `${product.name.en} by Lantso. ${product.description.en} 100% polyester. Limited to 25 pieces per colour.`,
    image: `/assets/photos/${product.id}.png`,
    body: (lang) => productBody(product, lang),
    schema: (lang) => [organizationSchema(lang), webSiteSchema(lang), productSchema(product, lang)]
  })),
  {
    path: "/info",
    title: "Shipping, Returns and FAQ | Lantso",
    description: "Shipping, returns, sizing and FAQ information for Lantso limited Moroccan jerseys.",
    image: "/assets/photos/story.png",
    body: infoBody,
    schema: (lang) => [organizationSchema(lang), webSiteSchema(lang), faqSchema(lang)]
  },
  {
    path: "/legal",
    title: "Legal and Contact | Lantso",
    description: "Legal information, privacy information and contact form for Lantso.",
    image: "/assets/photos/story.png",
    body: legalBody,
    schema: (lang) => [organizationSchema(lang), webSiteSchema(lang)]
  },
  {
    path: "/roots",
    title: "Discover the Roots | Lantso",
    description: "The Lantso story behind Roots 01 Khaki and Atlas 02 White, from Moroccan heritage to the world.",
    image: "/assets/photos/story.png",
    body: rootsBody,
    schema: (lang) => [organizationSchema(lang), webSiteSchema(lang)]
  },
  {
    path: "/success",
    title: "Order Received | Lantso",
    description: "Lantso order confirmation.",
    image: "/assets/photos/hero.png",
    body: (lang) => noticeBody(text("successTitle", lang), text("successBody", lang), lang),
    noindex: true,
    schema: (lang) => [organizationSchema(lang), webSiteSchema(lang)]
  },
  {
    path: "/cancel",
    title: "Checkout Cancelled | Lantso",
    description: "Lantso checkout cancelled.",
    image: "/assets/photos/hero.png",
    body: (lang) => noticeBody(text("cancelTitle", lang), text("cancelBody", lang), lang),
    noindex: true,
    schema: (lang) => [organizationSchema(lang), webSiteSchema(lang)]
  }
];

const template = await readFile(path.join(ROOT, "index.html"), "utf8");

await rm(DIST, { recursive: true, force: true });
await mkdir(DIST, { recursive: true });
await Promise.all(
  ["app.js", "catalog.mjs", "styles.css", "lantso_logo.svg", "Lantso_text.svg", "robots.txt"].map((file) =>
    cp(path.join(ROOT, file), path.join(DIST, file), { recursive: true })
  )
);
await cp(path.join(ROOT, "assets"), path.join(DIST, "assets"), { recursive: true });

for (const route of routes) {
  for (const lang of LANGS) {
    await writeRoute(localizedPath(route.path, lang), renderRoute(route, lang));
  }
}
await writeFile(path.join(DIST, "sitemap.xml"), sitemapXml(), "utf8");

function renderRoute(route, lang = DEFAULT_LANG) {
  const title = routeTitle(route, lang);
  const description = routeDescription(route, lang);
  const canonical = absolute(localizedPath(route.path, lang));
  const graph = [...route.schema(lang), breadcrumbSchema(route.path, title, lang)];
  let html = template;
  html = html.replace(/<html lang="[^"]*">/, `<html lang="${escapeHtml(lang)}">`);
  html = html.replace(/<title>[\s\S]*?<\/title>/, `<title>${escapeHtml(title)}</title>`);
  html = upsertMeta(html, "name", "description", description);
  html = upsertMeta(html, "property", "og:title", title);
  html = upsertMeta(html, "property", "og:description", description);
  html = upsertMeta(html, "property", "og:image", absolute(route.image));
  html = upsertMeta(html, "property", "og:url", canonical);
  html = route.noindex ? upsertMeta(html, "name", "robots", "noindex, nofollow") : html;
  html = upsertCanonical(html, canonical);
  html = upsertAlternates(html, route.path);
  html = html.replace(
    /<script id="structured-data" type="application\/ld\+json">[\s\S]*?<\/script>/,
    `<script id="structured-data" type="application/ld+json">${escapeScriptJson({
      "@context": "https://schema.org",
      "@graph": graph
    })}</script>`
  );
  html = html.replace(
    /<main id="app" tabindex="-1">[\s\S]*?<\/main>/,
    `<main id="app" tabindex="-1">\n      <div class="page prerendered-page">${route.body(lang)}</div>\n    </main>`
  );
  return html;
}

async function writeRoute(routePath, html) {
  const outputDir = routePath === "/" ? DIST : path.join(DIST, routePath.replace(/^\//, ""));
  await mkdir(outputDir, { recursive: true });
  await writeFile(path.join(outputDir, "index.html"), html, "utf8");
}

function text(key, lang = DEFAULT_LANG) {
  return COPY[key]?.[lang] || COPY[key]?.en || key;
}

function locale(lang = DEFAULT_LANG) {
  if (lang === "fr") return "fr-FR";
  if (lang === "ar") return "ar-MA";
  return "en-GB";
}

function faqRows(lang = DEFAULT_LANG) {
  if (lang === "fr") {
    return [
      ["Quand sortent les maillots ?", "La boutique est preparee pour le drop Coupe du Monde 2026."],
      ["Puis-je commander hors Europe ?", "Certains pays internationaux sont actives au paiement."],
      ["Comment choisir ma taille ?", "La page produit liste les mesures des tailles M et L."]
    ];
  }
  if (lang === "ar") {
    return [
      ["متى تصدر القمصان؟", "المتجر جاهز لإصدار كأس العالم 2026."],
      ["هل يمكن الطلب من خارج أوروبا؟", "بعض الدول الدولية مفعلة عند الدفع."],
      ["كيف أختار المقاس؟", "تعرض صفحة المنتج قياسات M و L."]
    ];
  }
  return [
    ["When will the jerseys release?", "The store is prepared for the 2026 World Cup drop."],
    ["Can I order outside Europe?", "Selected international countries are enabled in checkout."],
    ["How do I know my size?", "The product page lists garment measurements for sizes M and L."]
  ];
}

function routeTitle(route, lang = DEFAULT_LANG) {
  const product = PRODUCTS.find((candidate) => route.path === `/product/${candidate.id}`);
  if (product) return `${product.name[lang] || product.name.en} - Limited Moroccan Jersey | Lantso`;
  if (route.path === "/") return text("homeTitle", lang);
  if (route.path === "/shop") return text("shopTitle", lang);
  if (route.path === "/info") return text("infoTitle", lang);
  if (route.path === "/legal") return text("legalTitle", lang);
  if (route.path === "/roots") return text("rootsTitle", lang);
  if (route.path === "/success") return text("successTitle", lang);
  if (route.path === "/cancel") return text("cancelTitle", lang);
  return route.title;
}

function routeDescription(route, lang = DEFAULT_LANG) {
  const product = PRODUCTS.find((candidate) => route.path === `/product/${candidate.id}`);
  if (product) {
    const name = product.name[lang] || product.name.en;
    const description = product.description[lang] || product.description.en;
    return `${name} by Lantso. ${description} 100% polyester. Limited to 25 pieces per colour.`;
  }
  if (route.path === "/") return text("homeDescription", lang);
  if (route.path === "/shop") return text("shopDescription", lang);
  if (route.path === "/info") return text("infoDescription", lang);
  if (route.path === "/legal") return text("legalDescription", lang);
  if (route.path === "/roots") return text("rootsDescription", lang);
  if (route.path === "/success") return text("successBody", lang);
  if (route.path === "/cancel") return text("cancelBody", lang);
  return route.description;
}

function localizedPath(routePath, lang = DEFAULT_LANG) {
  const clean = routePath === "/" ? "" : routePath;
  return lang === DEFAULT_LANG ? clean || "/" : `/${lang}${clean}`;
}

function linkTo(routePath, lang = DEFAULT_LANG) {
  return localizedPath(routePath, lang);
}

function homeBody(lang = DEFAULT_LANG) {
  return `
        <section class="seo-hero">
          ${pictureHtml("hero", "Lantso Moroccan jersey campaign in a Casablanca street", 1672, 941, "100vw")}
          <h1>From the Roots to the World</h1>
          <p>${escapeHtml(text("homeDescription", lang))}</p>
          <a class="button-primary" href="${linkTo("/shop", lang)}">${escapeHtml(text("stepInside", lang))}</a>
        </section>
        ${productList(lang)}
      `;
}

function shopBody(lang = DEFAULT_LANG) {
  return `
        <section class="seo-section">
          <h1>${escapeHtml(text("shopHeading", lang))}</h1>
          <p>${escapeHtml(text("shopBody", lang))}</p>
        </section>
        ${productList(lang)}
      `;
}

function productBody(product, lang = DEFAULT_LANG) {
  const shipping = calculateShipping("FR", product.price, 1);
  const productName = product.name[lang] || product.name.en;
  return `
        <article class="seo-product">
          ${pictureHtml(product.id, productImageAlt(product, lang), 1448, 1086, "(max-width: 760px) 100vw, 50vw")}
          <div>
            <p>${escapeHtml(product.chapter)}</p>
            <h1>${escapeHtml(productName)}</h1>
            <p>${escapeHtml(product.description[lang] || product.description.en)}</p>
            <p><strong>${formatMoney(product.price, locale(lang))}</strong></p>
            <p>${escapeHtml(text("material", lang))}: ${escapeHtml(product.material[lang] || product.material.en)}. ${escapeHtml(text("sizes", lang))}: ${product.sizes.map(escapeHtml).join(", ")}.</p>
            <p>${escapeHtml(text("measurements", lang))}: ${sizeGuide(product)}.</p>
            <p>${escapeHtml(text("care", lang))}: ${escapeHtml(product.care[lang] || product.care.en)}</p>
            <p>${escapeHtml(text("franceShipping", lang))}: ${formatMoney(shipping.amount, locale(lang))} · ${escapeHtml(shipping.zone.eta[lang] || shipping.zone.eta.en)}.</p>
          </div>
        </article>
      `;
}

function infoBody(lang = DEFAULT_LANG) {
  return `
        <section class="seo-section">
          <h1>${escapeHtml(text("shippingReturnsFaq", lang))}</h1>
          <p>${escapeHtml(text("shippingBody", lang))}</p>
          <h2>${escapeHtml(text("returns", lang))}</h2>
          <p>${escapeHtml(text("returnsBody", lang))}</p>
          <h2>FAQ</h2>
          ${faqRows(lang).map(([question, answer]) => `<h3>${escapeHtml(question)}</h3><p>${escapeHtml(answer)}</p>`).join("")}
        </section>
      `;
}

function legalBody(lang = DEFAULT_LANG) {
  return `
        <section class="seo-section">
          <h1>${escapeHtml(text("legalHeading", lang))}</h1>
          <p>${escapeHtml(text("legalBody", lang))}</p>
          <p>For support, sizing, press, or wholesale requests, write to contact@lantso.com.</p>
          <p>Instagram: <a href="${SOCIAL_LINKS.instagram}">lantso.at</a>. TikTok: <a href="${SOCIAL_LINKS.tiktok}">@lantsobrand</a>.</p>
          <p>Customer details are used for checkout, delivery, support, fraud prevention, and optional newsletter access. Payment data is handled by Stripe.</p>
        </section>
      `;
}

function rootsBody(lang = DEFAULT_LANG) {
  return `
        <section class="seo-section">
          ${pictureHtml("story", "Lantso Roots 01 Khaki and Atlas 02 White jerseys worn in a Moroccan street story scene", 1449, 1085, "100vw")}
          <h1>${escapeHtml(text("rootsHeading", lang))}</h1>
          <p>${escapeHtml(text("rootsBody", lang))}</p>
        </section>
      `;
}

function noticeBody(title, body, lang = DEFAULT_LANG) {
  return `
        <section class="seo-section">
          <h1>${escapeHtml(title)}</h1>
          <p>${escapeHtml(body)}</p>
          <a class="button-primary" href="${linkTo("/shop", lang)}">${escapeHtml(text("backToShop", lang))}</a>
        </section>
      `;
}

function productList(lang = DEFAULT_LANG) {
  return `
        <section class="seo-products">
          ${PRODUCTS.map(
            (product) => `
            <article>
              <a href="${linkTo(`/product/${product.id}`, lang)}">
                ${pictureHtml(product.id, productImageAlt(product, lang), 1448, 1086, "(max-width: 760px) 100vw, 50vw")}
              </a>
              <h2><a href="${linkTo(`/product/${product.id}`, lang)}">${escapeHtml(product.name[lang] || product.name.en)}</a></h2>
              <p>${escapeHtml(product.story[lang] || product.story.en)}</p>
              <p>${formatMoney(product.price, locale(lang))} · ${escapeHtml(text("limited", lang))}</p>
            </article>`
          ).join("")}
        </section>
      `;
}

function sizeGuide(product) {
  return product.sizes
    .map((size) => {
      const measure = product.measurements[size];
      return `${size}: ${measure.length}cm x ${measure.width}cm`;
    })
    .join(" / ");
}

function organizationSchema(lang = DEFAULT_LANG) {
  return {
    "@type": "Organization",
    "@id": `${absolute(localizedPath("/", lang))}#organization`,
    name: "Lantso",
    url: absolute(localizedPath("/", lang)),
    logo: `${SITE_URL}/lantso_logo.svg`,
    email: "contact@lantso.com",
    sameAs: [SOCIAL_LINKS.instagram, SOCIAL_LINKS.tiktok]
  };
}

function webSiteSchema(lang = DEFAULT_LANG) {
  return {
    "@type": "WebSite",
    "@id": `${absolute(localizedPath("/", lang))}#website`,
    name: "Lantso",
    url: absolute(localizedPath("/", lang))
  };
}

function collectionSchema(lang = DEFAULT_LANG) {
  return {
    "@type": "ItemList",
    "@id": `${absolute(localizedPath("/shop", lang))}#products`,
    name: "Lantso limited Moroccan jerseys",
    itemListElement: PRODUCTS.map((product, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: absolute(localizedPath(`/product/${product.id}`, lang)),
      item: productSchema(product, lang)
    }))
  };
}

function productSchema(product, lang = DEFAULT_LANG) {
  const shipping = calculateShipping("FR", product.price, 1);
  return {
    "@type": "Product",
    "@id": `${absolute(localizedPath(`/product/${product.id}`, lang))}#product`,
    name: product.name[lang] || product.name.en,
    description: product.description[lang] || product.description.en,
    image: [`${SITE_URL}/assets/photos/${product.id}.png`],
    sku: product.sku,
    brand: { "@type": "Brand", name: "Lantso" },
    material: product.material[lang] || product.material.en,
    size: product.sizes.join(", "),
    offers: {
      "@type": "Offer",
      url: absolute(localizedPath(`/product/${product.id}`, lang)),
      priceCurrency: CURRENCY.toUpperCase(),
      price: (product.price / 100).toFixed(2),
      availability: "https://schema.org/LimitedAvailability",
      itemCondition: "https://schema.org/NewCondition",
      hasMerchantReturnPolicy: merchantReturnPolicy(),
      shippingDetails: {
        "@type": "OfferShippingDetails",
        shippingDestination: { "@type": "DefinedRegion", addressCountry: "FR" },
        shippingRate: {
          "@type": "MonetaryAmount",
          value: (shipping.amount / 100).toFixed(2),
          currency: CURRENCY.toUpperCase()
        },
        deliveryTime: {
          "@type": "ShippingDeliveryTime",
          businessDays: { "@type": "QuantitativeValue", minValue: 2, maxValue: 4 }
        }
      }
    }
  };
}

function merchantReturnPolicy() {
  return {
    "@type": "MerchantReturnPolicy",
    applicableCountry: ["FR", "BE", "ES", "IT", "DE", "NL", "GB", "MA"],
    returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
    merchantReturnDays: 14,
    returnMethod: "https://schema.org/ReturnByMail",
    returnFees: "https://schema.org/ReturnShippingFees"
  };
}

function breadcrumbSchema(routePath, title, lang = DEFAULT_LANG) {
  const items = [{ "@type": "ListItem", position: 1, name: lang === "fr" ? "Accueil" : lang === "ar" ? "الرئيسية" : "Home", item: absolute(localizedPath("/", lang)) }];
  if (routePath !== "/") {
    items.push({
      "@type": "ListItem",
      position: 2,
      name: title.replace(" | Lantso", "").replace(" - Limited Moroccan Jersey", ""),
      item: absolute(localizedPath(routePath, lang))
    });
  }
  return {
    "@type": "BreadcrumbList",
    itemListElement: items
  };
}

function faqSchema(lang = DEFAULT_LANG) {
  return {
    "@type": "FAQPage",
    mainEntity: faqRows(lang).map(([question, answer]) => ({
      "@type": "Question",
      name: question,
      acceptedAnswer: { "@type": "Answer", text: answer }
    }))
  };
}

function productImageAlt(product, lang = DEFAULT_LANG) {
  const color = product.color[lang] || product.color.en;
  return `${product.name[lang] || product.name.en} limited edition Morocco-inspired jersey, front view in ${color.toLowerCase()}`;
}

function pictureHtml(file, alt, width, height, sizes) {
  return `<picture>
            <source srcset="/assets/photos/responsive/${file}-480.webp 480w, /assets/photos/responsive/${file}-800.webp 800w, /assets/photos/responsive/${file}-1200.webp 1200w, /assets/photos/${file}.webp ${width}w" sizes="${escapeHtml(sizes)}" type="image/webp">
            <img src="/assets/photos/${file}.png" alt="${escapeHtml(alt)}" width="${width}" height="${height}">
          </picture>`;
}

function sitemapXml() {
  const publicRoutes = routes.filter((route) => !route.noindex);
  const lastmod = new Date().toISOString().slice(0, 10);
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${publicRoutes
  .flatMap((route) =>
    LANGS.map((lang) => {
      const product = PRODUCTS.find((candidate) => route.path === `/product/${candidate.id}`);
      const image = product ? route.image : null;
      return `  <url>
    <loc>${absolute(localizedPath(route.path, lang))}</loc>
    <lastmod>${lastmod}</lastmod>
${sitemapAlternates(route.path)}${image ? `
    <image:image>
      <image:loc>${absolute(image)}</image:loc>
      <image:caption>${escapeXml(productImageAlt(product, lang))}</image:caption>
    </image:image>` : ""}
  </url>`;
    })
  )
  .join("\n")}
</urlset>
`;
}

function absolute(routePath) {
  return new URL(routePath, `${SITE_URL}/`).href;
}

function alternateLinks(routePath) {
  return [
    ...LANGS.map((lang) => ({ hreflang: lang, href: absolute(localizedPath(routePath, lang)) })),
    { hreflang: "x-default", href: absolute(localizedPath(routePath, DEFAULT_LANG)) }
  ];
}

function sitemapAlternates(routePath) {
  return alternateLinks(routePath)
    .map((alternate) => `    <xhtml:link rel="alternate" hreflang="${escapeXml(alternate.hreflang)}" href="${escapeXml(alternate.href)}"/>`)
    .join("\n");
}

function upsertMeta(html, key, name, content) {
  const escaped = escapeHtml(content);
  const pattern = new RegExp(`<meta\\s+${key}="${escapeRegExp(name)}"\\s+content="[^"]*"\\s*>`);
  if (pattern.test(html)) return html.replace(pattern, `<meta ${key}="${name}" content="${escaped}">`);
  return html.replace("</head>", `    <meta ${key}="${name}" content="${escaped}">\n  </head>`);
}

function upsertCanonical(html, href) {
  const tag = `<link rel="canonical" href="${escapeHtml(href)}">`;
  if (/<link rel="canonical"[^>]*>/.test(html)) return html.replace(/<link rel="canonical"[^>]*>/, tag);
  return html.replace("</head>", `    ${tag}\n  </head>`);
}

function upsertAlternates(html, routePath) {
  const tags = alternateLinks(routePath)
    .map((alternate) => `<link rel="alternate" hreflang="${escapeHtml(alternate.hreflang)}" href="${escapeHtml(alternate.href)}">`)
    .join("\n    ");
  return html.replace("</head>", `    ${tags}\n  </head>`);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function escapeScriptJson(value) {
  return JSON.stringify(value).replaceAll("</", "<\\/");
}

function escapeXml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}
