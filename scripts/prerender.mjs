import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { CURRENCY, PRODUCTS, calculateShipping, formatMoney } from "../catalog.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.dirname(__dirname);
const DIST = path.join(ROOT, "dist");
const SITE_URL = (process.env.PUBLIC_SITE_URL || "https://www.lantso.com").replace(/\/$/, "");

const routes = [
  {
    path: "/",
    title: "Lantso - From the Roots to the World",
    description: "Lantso, very limited Moroccan jerseys for the 2026 World Cup. Roots 01 Khaki and Atlas 02 White.",
    image: "/assets/photos/hero.png",
    body: homeBody,
    schema: () => [organizationSchema(), webSiteSchema(), collectionSchema()]
  },
  {
    path: "/shop",
    title: "Shop Moroccan Jerseys | Lantso",
    description: "Shop Lantso Roots 01 Khaki and Atlas 02 White, limited Moroccan jerseys for the 2026 World Cup.",
    image: "/assets/photos/hero.png",
    body: shopBody,
    schema: () => [organizationSchema(), webSiteSchema(), collectionSchema()]
  },
  ...PRODUCTS.map((product) => ({
    path: `/product/${product.id}`,
    title: `${product.name.en} - Limited Moroccan Jersey | Lantso`,
    description: `${product.name.en} by Lantso. ${product.description.en} 100% polyester. Limited to 25 pieces per colour.`,
    image: `/assets/photos/${product.id}.png`,
    body: () => productBody(product),
    schema: () => [organizationSchema(), webSiteSchema(), productSchema(product)]
  })),
  {
    path: "/info",
    title: "Shipping, Returns and FAQ | Lantso",
    description: "Shipping, returns, sizing and FAQ information for Lantso limited Moroccan jerseys.",
    image: "/assets/photos/story.png",
    body: infoBody,
    schema: () => [organizationSchema(), webSiteSchema(), faqSchema()]
  },
  {
    path: "/legal",
    title: "Legal and Contact | Lantso",
    description: "Legal information, privacy information and contact form for Lantso.",
    image: "/assets/photos/story.png",
    body: legalBody,
    schema: () => [organizationSchema(), webSiteSchema()]
  },
  {
    path: "/roots",
    title: "Discover the Roots | Lantso",
    description: "The Lantso story behind Roots 01 Khaki and Atlas 02 White, from Moroccan heritage to the world.",
    image: "/assets/photos/story.png",
    body: rootsBody,
    schema: () => [organizationSchema(), webSiteSchema()]
  },
  {
    path: "/success",
    title: "Order Received | Lantso",
    description: "Lantso order confirmation.",
    image: "/assets/photos/hero.png",
    body: () => noticeBody("Order received", "Payment is complete. You will receive the delivery follow-up by email."),
    noindex: true,
    schema: () => [organizationSchema(), webSiteSchema()]
  },
  {
    path: "/cancel",
    title: "Checkout Cancelled | Lantso",
    description: "Lantso checkout cancelled.",
    image: "/assets/photos/hero.png",
    body: () => noticeBody("Checkout cancelled", "Your cart is still saved."),
    noindex: true,
    schema: () => [organizationSchema(), webSiteSchema()]
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
  await writeRoute(route.path, renderRoute(route));
}
await writeFile(path.join(DIST, "sitemap.xml"), sitemapXml(), "utf8");

function renderRoute(route) {
  const canonical = absolute(route.path);
  const graph = [...route.schema(), breadcrumbSchema(route.path, route.title)];
  let html = template;
  html = html.replace(/<title>[\s\S]*?<\/title>/, `<title>${escapeHtml(route.title)}</title>`);
  html = upsertMeta(html, "name", "description", route.description);
  html = upsertMeta(html, "property", "og:title", route.title);
  html = upsertMeta(html, "property", "og:description", route.description);
  html = upsertMeta(html, "property", "og:image", absolute(route.image));
  html = upsertMeta(html, "property", "og:url", canonical);
  html = route.noindex ? upsertMeta(html, "name", "robots", "noindex, nofollow") : html;
  html = upsertCanonical(html, canonical);
  html = html.replace(
    /<script id="structured-data" type="application\/ld\+json">[\s\S]*?<\/script>/,
    `<script id="structured-data" type="application/ld+json">${escapeScriptJson({
      "@context": "https://schema.org",
      "@graph": graph
    })}</script>`
  );
  html = html.replace(
    /<main id="app" tabindex="-1">[\s\S]*?<\/main>/,
    `<main id="app" tabindex="-1">\n      <div class="page prerendered-page">${route.body()}</div>\n    </main>`
  );
  return html;
}

async function writeRoute(routePath, html) {
  const outputDir = routePath === "/" ? DIST : path.join(DIST, routePath.replace(/^\//, ""));
  await mkdir(outputDir, { recursive: true });
  await writeFile(path.join(outputDir, "index.html"), html, "utf8");
}

function homeBody() {
  return `
        <section class="seo-hero">
          ${pictureHtml("hero", "Lantso Moroccan jersey campaign in a Casablanca street", 1672, 941, "100vw")}
          <h1>From the Roots to the World</h1>
          <p>Two limited Moroccan jerseys for the 2026 World Cup: Roots 01 Khaki and Atlas 02 White.</p>
          <a class="button-primary" href="/shop">Step inside</a>
        </section>
        ${productList()}
      `;
}

function shopBody() {
  return `
        <section class="seo-section">
          <h1>Shop Lantso Moroccan jerseys</h1>
          <p>Very limited 2026 World Cup-inspired jerseys. 25 pieces per colour, sizes M and L.</p>
        </section>
        ${productList()}
      `;
}

function productBody(product) {
  const shipping = calculateShipping("FR", product.price, 1);
  return `
        <article class="seo-product">
          ${pictureHtml(product.id, productImageAlt(product), 1448, 1086, "(max-width: 760px) 100vw, 50vw")}
          <div>
            <p>${escapeHtml(product.chapter)}</p>
            <h1>${escapeHtml(product.name.en)}</h1>
            <p>${escapeHtml(product.description.en)}</p>
            <p><strong>${formatMoney(product.price, "en-GB")}</strong></p>
            <p>Material: ${escapeHtml(product.material.en)}. Sizes: ${product.sizes.map(escapeHtml).join(", ")}.</p>
            <p>Measurements: ${sizeGuide(product)}.</p>
            <p>Care: ${escapeHtml(product.care.en)}</p>
            <p>France shipping estimate: ${formatMoney(shipping.amount, "en-GB")} · ${escapeHtml(shipping.zone.eta.en)}.</p>
          </div>
        </article>
      `;
}

function infoBody() {
  return `
        <section class="seo-section">
          <h1>Shipping, returns and FAQ</h1>
          <p>Orders ship from Europe with tracked delivery. France, the European Union, the United Kingdom, Morocco, and selected international destinations are enabled in checkout.</p>
          <h2>Returns</h2>
          <p>Returns are accepted within 14 days after delivery when pieces are unworn, unwashed, and returned with their original packaging.</p>
          <h2>FAQ</h2>
          <h3>When will the jerseys release?</h3>
          <p>The store is prepared for the 2026 World Cup drop.</p>
          <h3>Can I order outside Europe?</h3>
          <p>Selected international countries are enabled in checkout.</p>
          <h3>How do I know my size?</h3>
          <p>The product page lists garment measurements for sizes M and L.</p>
        </section>
      `;
}

function legalBody() {
  return `
        <section class="seo-section">
          <h1>Legal and contact</h1>
          <p>Lantso sells limited edition jerseys in EUR. An order is confirmed only after successful payment through Stripe Checkout.</p>
          <p>For support, sizing, press, or wholesale requests, write to contact@lantso.com.</p>
          <p>Customer details are used for checkout, delivery, support, fraud prevention, and optional newsletter access. Payment data is handled by Stripe.</p>
        </section>
      `;
}

function rootsBody() {
  return `
        <section class="seo-section">
          ${pictureHtml("story", "Lantso Roots 01 Khaki and Atlas 02 White jerseys worn in a Moroccan street story scene", 1449, 1085, "100vw")}
          <h1>Discover the Roots</h1>
          <p>This page is reserved for the Lantso story, pencil sketches, and the path from the roots to the world.</p>
        </section>
      `;
}

function noticeBody(title, body) {
  return `
        <section class="seo-section">
          <h1>${escapeHtml(title)}</h1>
          <p>${escapeHtml(body)}</p>
          <a class="button-primary" href="/shop">Back to shop</a>
        </section>
      `;
}

function productList() {
  return `
        <section class="seo-products">
          ${PRODUCTS.map(
            (product) => `
            <article>
              <a href="/product/${product.id}">
                ${pictureHtml(product.id, productImageAlt(product), 1448, 1086, "(max-width: 760px) 100vw, 50vw")}
              </a>
              <h2><a href="/product/${product.id}">${escapeHtml(product.name.en)}</a></h2>
              <p>${escapeHtml(product.story.en)}</p>
              <p>${formatMoney(product.price, "en-GB")} · Limited pieces</p>
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

function organizationSchema() {
  return {
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    name: "Lantso",
    url: `${SITE_URL}/`,
    logo: `${SITE_URL}/lantso_logo.svg`,
    email: "contact@lantso.com"
  };
}

function webSiteSchema() {
  return {
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    name: "Lantso",
    url: `${SITE_URL}/`
  };
}

function collectionSchema() {
  return {
    "@type": "ItemList",
    "@id": `${SITE_URL}/shop#products`,
    name: "Lantso limited Moroccan jerseys",
    itemListElement: PRODUCTS.map((product, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: absolute(`/product/${product.id}`),
      item: productSchema(product)
    }))
  };
}

function productSchema(product) {
  const shipping = calculateShipping("FR", product.price, 1);
  return {
    "@type": "Product",
    "@id": `${SITE_URL}/product/${product.id}#product`,
    name: product.name.en,
    description: product.description.en,
    image: [`${SITE_URL}/assets/photos/${product.id}.png`],
    sku: product.sku,
    brand: { "@type": "Brand", name: "Lantso" },
    material: product.material.en,
    size: product.sizes.join(", "),
    offers: {
      "@type": "Offer",
      url: `${SITE_URL}/product/${product.id}`,
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

function breadcrumbSchema(routePath, title) {
  const items = [{ "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` }];
  if (routePath !== "/") {
    items.push({
      "@type": "ListItem",
      position: 2,
      name: title.replace(" | Lantso", "").replace(" - Limited Moroccan Jersey", ""),
      item: absolute(routePath)
    });
  }
  return {
    "@type": "BreadcrumbList",
    itemListElement: items
  };
}

function faqSchema() {
  return {
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "When will the jerseys release?",
        acceptedAnswer: { "@type": "Answer", text: "The store is prepared for the 2026 World Cup drop." }
      },
      {
        "@type": "Question",
        name: "Can I order outside Europe?",
        acceptedAnswer: { "@type": "Answer", text: "Selected international countries are enabled in checkout." }
      },
      {
        "@type": "Question",
        name: "How do I know my size?",
        acceptedAnswer: { "@type": "Answer", text: "The product page lists garment measurements for sizes M and L." }
      }
    ]
  };
}

function productImageAlt(product) {
  const color = product.color.en.toLowerCase();
  return `${product.name.en} limited edition Morocco-inspired jersey, front view in ${color}`;
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
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${publicRoutes
  .map((route) => {
    const product = PRODUCTS.find((candidate) => route.path === `/product/${candidate.id}`);
    const image = product ? route.image : null;
    return `  <url>
    <loc>${absolute(route.path)}</loc>
    <lastmod>${lastmod}</lastmod>${image ? `
    <image:image>
      <image:loc>${absolute(image)}</image:loc>
      <image:caption>${escapeXml(productImageAlt(product))}</image:caption>
    </image:image>` : ""}
  </url>`;
  })
  .join("\n")}
</urlset>
`;
}

function absolute(routePath) {
  return new URL(routePath, `${SITE_URL}/`).href;
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
