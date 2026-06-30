import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { CURRENCY, PRODUCTS, calculateShipping, formatMoney } from "../catalog.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.dirname(__dirname);
const DIST = path.join(ROOT, "dist");
const SITE_URL = (process.env.PUBLIC_SITE_URL || "https://www.lantso.com").replace(/\/$/, "");
const PHOTO_VERSION = "20260630b";
const LANGS = ["en", "fr", "ar"];
const DEFAULT_LANG = "en";
const SOCIAL_LINKS = {
  instagram: "https://www.instagram.com/lantso.at"
};
const ACKNOWLEDGMENTS = [
  { name: "Mizan Studio" },
  { name: "Wlad Derb", url: "https://wladderb.com" },
  { name: "QS Photos" },
  { name: "Walid S." },
  { name: "Abderrahim R." },
  { name: "Ahmed A." },
  { name: "Ilan K." },
  { name: "Jaoued M." },
  { name: "Chahine C." },
  { name: "Nizar N." },
  { name: "Mohammed A." },
  { name: "Rayan B." },
  { name: "Terence H." },
  { name: "Liam B." },
  { name: "Jin K." },
  { name: "Ramy A." },
  { name: "Ziade T." },
  { name: "Ismail O." },
  { name: "Nilaksaan A." },
  { name: "David M." },
  { name: "Pierre L." },
  { name: "Mustapha E." },
  { name: "Santiago P." },
  { name: "Aimen C." },
  { name: "Ahmed M." },
  { name: "Indris H." },
  { name: "Samuel M." },
  { name: "Oussama S." }
];

const COPY = {
  homeTitle: {
    en: "Lantso | Limited Moroccan Football Jerseys",
    fr: "Lantso | Maillots de football marocains limités",
    ar: "لانطسو | قمصان كرة قدم مغربية محدودة"
  },
  homeDescription: {
    en: "Lantso creates limited Moroccan football jerseys: Roots 01 Khaki and Atlas 02 White, inspired by Moroccan heritage and the 2026 World Cup period.",
    fr: "Lantso crée des maillots de football marocains limités : Roots 01 Khaki et Atlas 02 White, inspirés par l'héritage marocain et la période Coupe du Monde 2026.",
    ar: "لانطسو تصمم قمصان كرة قدم مغربية محدودة: روتس 01 كاكي وأطلس 02 أبيض، مستوحاة من الإرث المغربي وفترة كأس العالم 2026."
  },
  stepInside: { en: "Step inside", fr: "Entrer", ar: "ادخل" },
  shopTitle: { en: "Shop Moroccan Football Jerseys | Lantso", fr: "Boutique maillots de football marocains | Lantso", ar: "متجر قمصان كرة القدم المغربية | لانطسو" },
  shopDescription: {
    en: "Shop Lantso Roots 01 Khaki and Atlas 02 White, limited Moroccan football jerseys for the 2026 World Cup period.",
    fr: "Acheter Roots 01 Khaki et Atlas 02 White, deux maillots de football marocains limités pour la période Coupe du Monde 2026.",
    ar: "تسوق روتس 01 كاكي وأطلس 02 أبيض، قمصان كرة قدم مغربية محدودة لفترة كأس العالم 2026."
  },
  shopHeading: { en: "Shop Lantso Moroccan jerseys", fr: "Boutique Lantso maillots marocains", ar: "متجر قمصان لانطسو المغربية" },
  shopBody: {
    en: "Very limited 2026 World Cup-inspired jerseys. Sizes S, M, L and XL.",
    fr: "Maillots très limités inspirés par la Coupe du Monde 2026. Tailles S, M, L et XL.",
    ar: "قمصان محدودة جدا مستوحاة من كأس العالم 2026. مقاسات S و M و L و XL."
  },
  limited: { en: "Limited pieces", fr: "Pièces limitées", ar: "قطع محدودة" },
  material: { en: "Material", fr: "Matière", ar: "الخامة" },
  sizes: { en: "Sizes", fr: "Tailles", ar: "المقاسات" },
  measurements: { en: "Measurements", fr: "Mesures", ar: "المقاسات" },
  care: { en: "Care", fr: "Entretien", ar: "العناية" },
  franceShipping: { en: "France shipping estimate", fr: "Estimation livraison France", ar: "تقدير الشحن إلى فرنسا" },
  infoTitle: { en: "Shipping, Returns and FAQ | Lantso", fr: "Livraison, retours et FAQ | Lantso", ar: "الشحن والإرجاع والأسئلة | لانطسو" },
  infoDescription: {
    en: "Delivery countries, tracked shipping rates, returns process, sizing answers and customer support details for Lantso limited Moroccan jerseys.",
    fr: "Pays livrables, tarifs suivis, retours, tailles et support client pour les maillots marocains limités Lantso.",
    ar: "الدول المتاحة، أسعار الشحن، الإرجاع، المقاسات والدعم لقمصان لانطسو المغربية المحدودة."
  },
  shippingReturnsFaq: { en: "Shipping, returns and FAQ", fr: "Livraison, retours et FAQ", ar: "الشحن والإرجاع والأسئلة" },
  shippingBody: {
    en: "Orders are prepared after payment and ship from Europe with tracked delivery. The cart shows the live shipping rate, estimated delivery time, and every eligible destination before checkout. Customers outside the European Union may be charged local duties or import taxes by the carrier.",
    fr: "Les commandes sont préparées après paiement puis expédiées depuis l'Europe avec suivi. Le panier affiche le tarif de livraison, le délai estimé et les destinations disponibles avant le paiement. Hors Union européenne, des droits ou taxes d'import peuvent être demandés par le transporteur.",
    ar: "يتم تجهيز الطلبات بعد الدفع ثم شحنها من أوروبا مع رقم تتبع. تعرض السلة سعر الشحن، مدة التوصيل المتوقعة والوجهات المتاحة قبل الدفع. خارج الاتحاد الأوروبي قد يطلب الناقل رسوما أو ضرائب استيراد محلية."
  },
  returns: { en: "Returns", fr: "Retours", ar: "الإرجاع" },
  returnsBody: {
    en: "Returns can be requested within 14 days of delivery by emailing contact@lantso.com before sending anything back. Items must be unworn, unwashed, undamaged, and returned with original packaging and tags. Return shipping is paid by the customer unless the item is faulty or the wrong product was sent. Refunds are issued to the original payment method after inspection.",
    fr: "Les retours peuvent être demandés sous 14 jours après livraison en écrivant à contact@lantso.com avant tout renvoi. Les pièces doivent être non portées, non lavées, non abîmées et renvoyées avec leur packaging et leurs étiquettes. Les frais de retour sont à la charge du client, sauf article défectueux ou erreur d'envoi. Le remboursement est effectué sur le moyen de paiement d'origine après vérification.",
    ar: "يمكن طلب الإرجاع خلال 14 يوما من التسليم عبر contact@lantso.com قبل إرسال أي قطعة. يجب أن تكون القطعة غير مستعملة، غير مغسولة، غير متضررة ومع التغليف والملصقات الأصلية. يتحمل العميل تكلفة الإرجاع إلا إذا كانت القطعة معيبة أو تم إرسال منتج خاطئ. يتم رد المبلغ إلى وسيلة الدفع الأصلية بعد الفحص."
  },
  legalTitle: { en: "Legal and Contact | Lantso", fr: "Mentions légales et contact | Lantso", ar: "القانوني والتواصل | لانطسو" },
  legalDescription: {
    en: "Terms, privacy and contact information for buying limited Lantso Moroccan football jerseys.",
    fr: "Conditions, confidentialité et contact pour acheter les maillots de football marocains limités Lantso.",
    ar: "الشروط والخصوصية ومعلومات التواصل لشراء قمصان لانطسو المغربية المحدودة."
  },
  legalHeading: { en: "Legal and contact", fr: "Mentions légales et contact", ar: "القانوني والتواصل" },
  legalBody: {
    en: "Lantso sells limited edition jerseys in EUR through this storefront. Product availability is limited and stock is reserved only when Stripe Checkout opens; an order is confirmed after successful payment. Lantso may cancel and refund orders flagged for fraud, stock error, or incomplete delivery details.",
    fr: "Lantso vend des maillots en édition limitée en EUR via cette boutique. Les stocks sont limités et une pièce est réservée uniquement au moment où Stripe Checkout s'ouvre; la commande est confirmée après paiement réussi. Lantso peut annuler et rembourser une commande en cas de fraude, erreur de stock ou informations de livraison incomplètes.",
    ar: "تبيع لانطسو قمصانا محدودة باليورو عبر هذا المتجر. المخزون محدود ولا يتم حجز القطعة إلا عند فتح Stripe Checkout؛ يؤكد الطلب بعد نجاح الدفع. يمكن لـ لانطسو إلغاء ورد طلب عند وجود مؤشر احتيال أو خطأ مخزون أو بيانات توصيل ناقصة."
  },
  legalSupport: {
    en: "The customer is responsible for providing an accurate address and for any import duties, taxes, or carrier charges applied outside the European Union. For order support, sizing, press, or wholesale requests, write to contact@lantso.com.",
    fr: "Le client doit fournir une adresse exacte et reste responsable des droits, taxes ou frais transporteur appliqués hors Union européenne. Pour le support, les tailles, la presse ou les demandes wholesale, écris à contact@lantso.com.",
    ar: "يتحمل العميل مسؤولية العنوان الصحيح وأي رسوم أو ضرائب استيراد أو تكاليف ناقل خارج الاتحاد الأوروبي. للدعم أو المقاسات أو الصحافة أو طلبات الجملة، اكتب إلى contact@lantso.com."
  },
  legalPrivacy: {
    en: "Lantso collects contact details, delivery address, cart contents, language and access preferences, support messages, and club sign-up details. Payment details are processed by Stripe and are not stored by this website. Data is used for checkout, fulfilment, customer support, fraud prevention, required accounting records, and requested emails.",
    fr: "Lantso collecte les coordonnées, l'adresse de livraison, le contenu du panier, les préférences de langue et d'accès, les messages support et les inscriptions club. Les données de paiement sont traitées par Stripe et ne sont pas stockées par ce site. Les données servent au paiement, à la préparation, au support, à la prévention de fraude, aux obligations comptables et aux emails demandés.",
    ar: "تجمع لانطسو بيانات التواصل، عنوان التوصيل، محتوى السلة، تفضيلات اللغة والدخول، رسائل الدعم وتسجيلات النادي. بيانات الدفع يعالجها Stripe ولا يخزنها هذا الموقع. تستخدم البيانات للدفع، التجهيز، الدعم، منع الاحتيال، السجلات المحاسبية المطلوبة ورسائل البريد المطلوبة."
  },
  legalSocial: {
    en: "Instagram: lantso.at.",
    fr: "Instagram : lantso.at.",
    ar: "Instagram: lantso.at."
  },
  rootsTitle: { en: "Discover the Roots | Lantso", fr: "Découvrir l'histoire | Lantso", ar: "اكتشف الجذور | لانطسو" },
  rootsDescription: {
    en: "The Lantso story behind Roots 01 Khaki and Atlas 02 White, from Moroccan heritage to the world.",
    fr: "L'histoire Lantso derrière Roots 01 Khaki et Atlas 02 White, des racines marocaines au monde.",
    ar: "قصة لانطسو خلف روتس 01 كاكي وأطلس 02 أبيض، من الجذور المغربية إلى العالم."
  },
  rootsHeading: { en: "Discover the Roots", fr: "Découvrir l'histoire", ar: "اكتشف الجذور" },
  rootsParagraphs: {
    en: [
      "Some people wait for the right moment. Others understand that it does not exist.",
      "LANTSO was born between ideas left aside, projects that never saw daylight, and others that did not survive time. Still, each one brought a lesson, a meeting, or a new way of seeing things.",
      "For years, the same fascination stayed intact: watching people start from almost nothing and build a universe able to gather, inspire, and leave a mark.",
      "The question eventually became obvious: why not us?",
      "Why wait for more resources? More time? More certainty? Why wait until everything is perfect to begin?",
      "LANTSO was born from that conviction. The conviction that an idea does not need perfect conditions to exist. That a project can begin with little.",
      "Little money. Few guarantees. But a lot of will.",
      "ROOTS is the first chapter of this story.",
      "A collection inspired by Moroccan heritage passed down through generations. A tribute to memories left by 1998 and dreams carried toward 2026.",
      "LANTSO was not born because everything was ready. The brand was born because every great adventure starts by accepting that certainty never comes first.",
      "Only a vision. And the decision to believe it deserves to exist."
    ],
    fr: [
      "Certaines personnes attendent le bon moment. D'autres comprennent qu'il n'existe pas.",
      "LANTSO est né entre des idées laissées de côté, des projets qui n'ont jamais vu le jour et d'autres qui n'ont pas survécu au temps. Pourtant, chacun d'eux a apporté une leçon, une rencontre ou encore une nouvelle façon de voir les choses.",
      "Pendant des années, une même fascination est restée intacte. Celle de voir des personnes partir de presque rien pour construire un univers capable de rassembler, d'inspirer et de laisser une empreinte.",
      "La question a fini par s'imposer d'elle-même : pourquoi pas nous ?",
      "Pourquoi attendre davantage de moyens ? Davantage de temps ? Davantage de certitudes ? Pourquoi attendre que tout soit parfait pour commencer ?",
      "LANTSO est né de cette conviction. La conviction qu'une idée n'a pas besoin de conditions idéales pour exister. Qu'un projet peut commencer avec peu.",
      "Peu de moyens. Peu de garanties. Mais beaucoup de volonté.",
      "ROOTS est le premier chapitre de cette histoire.",
      "Une collection inspirée d'un héritage marocain transmis au fil des générations. Un hommage aux souvenirs laissés par 1998 et les rêves portés vers 2026.",
      "LANTSO n'est pas né parce que tout était prêt. La marque est née parce qu'il faut accepter qu'aucune grande aventure ne commence avec des certitudes.",
      "Seulement avec une vision. Et la décision de croire qu'elle mérite d'exister."
    ],
    ar: [
      "بعض الناس ينتظرون اللحظة المناسبة. وآخرون يفهمون أنها لا توجد.",
      "وُلدت لانطسو بين أفكار تُركت جانبا، ومشاريع لم تر النور، وأخرى لم تصمد أمام الزمن. ومع ذلك، منح كل واحد منها درسا أو لقاء أو طريقة جديدة لرؤية الأشياء.",
      "لسنوات، بقي نفس الانبهار حاضرا: رؤية أشخاص ينطلقون من شبه لا شيء لبناء عالم قادر على جمع الناس وإلهامهم وترك أثر.",
      "وفي النهاية فرض السؤال نفسه: لماذا ليس نحن؟",
      "لماذا ننتظر إمكانيات أكثر؟ وقتا أكثر؟ يقينا أكثر؟ لماذا ننتظر أن يصبح كل شيء مثاليا حتى نبدأ؟",
      "وُلدت لانطسو من هذه القناعة. قناعة أن الفكرة لا تحتاج إلى ظروف مثالية كي توجد. وأن المشروع يمكن أن يبدأ بالقليل.",
      "قليل من الإمكانيات. قليل من الضمانات. لكن الكثير من الإرادة.",
      "الجذور هو الفصل الأول من هذه القصة.",
      "مجموعة مستوحاة من إرث مغربي انتقل عبر الأجيال. تحية لذكريات تركها عام 1998 ولأحلام تتجه نحو 2026.",
      "لم تولد لانطسو لأن كل شيء كان جاهزا. وُلدت العلامة لأن علينا أن نقبل أن أي مغامرة كبيرة لا تبدأ باليقين.",
      "فقط برؤية. وبقرار الإيمان بأنها تستحق أن توجد."
    ]
  },
  creditsTitle: { en: "Acknowledgments | Lantso", fr: "Remerciements | Lantso", ar: "الشكر | لانطسو" },
  creditsDescription: {
    en: "Credits and acknowledgments from the Lantso Roots chapter.",
    fr: "Crédits et remerciements du chapitre Roots de Lantso.",
    ar: "قائمة شكر فصل الجذور من لانطسو."
  },
  creditsHeading: { en: "Acknowledgments", fr: "Remerciements", ar: "الشكر" },
  successTitle: { en: "Order Received | Lantso", fr: "Commande reçue | Lantso", ar: "تم استلام الطلب | لانطسو" },
  successBody: {
    en: "Payment is complete. You will receive the delivery follow-up by email.",
    fr: "Le paiement est terminé. Le suivi de livraison sera envoyé par email.",
    ar: "اكتملت عملية الدفع. سيصلك تتبع التوصيل عبر البريد الإلكتروني."
  },
  cancelTitle: { en: "Checkout Cancelled | Lantso", fr: "Paiement annulé | Lantso", ar: "تم إلغاء الدفع | لانطسو" },
  cancelBody: { en: "Your cart is still saved.", fr: "Ton panier reste sauvegardé.", ar: "سلتك ما زالت محفوظة." },
  backToShop: { en: "Back to shop", fr: "Retour boutique", ar: "العودة إلى المتجر" }
};

const routes = [
  {
    path: "/",
    title: "Lantso | Limited Moroccan Football Jerseys",
    description: "Lantso creates limited Moroccan football jerseys: Roots 01 Khaki and Atlas 02 White, inspired by Moroccan heritage and the 2026 World Cup period.",
    image: "/assets/photos/fallback/hero.jpg",
    body: homeBody,
    schema: (lang) => [organizationSchema(lang), webSiteSchema(lang), collectionSchema(lang)]
  },
  {
    path: "/shop",
    title: "Shop Moroccan Football Jerseys | Lantso",
    description: "Shop Lantso Roots 01 Khaki and Atlas 02 White, limited Moroccan football jerseys for the 2026 World Cup period.",
    image: "/assets/photos/fallback/hero.jpg",
    body: shopBody,
    schema: (lang) => [organizationSchema(lang), webSiteSchema(lang), collectionSchema(lang)]
  },
  ...PRODUCTS.map((product) => ({
    path: `/product/${product.id}`,
    title: `${product.name.en} - Limited Moroccan Jersey | Lantso`,
    description: `${product.name.en} by Lantso. ${product.description.en} 100% polyester.`,
    image: `/assets/photos/fallback/${product.id}.jpg`,
    body: (lang) => productBody(product, lang),
    schema: (lang) => [organizationSchema(lang), webSiteSchema(lang), productSchema(product, lang)]
  })),
  {
    path: "/info",
    title: "Shipping, Returns and FAQ | Lantso",
    description: "Delivery countries, tracked shipping rates, returns process, sizing answers and customer support details for Lantso limited Moroccan jerseys.",
    image: "/assets/photos/fallback/hero.jpg",
    body: infoBody,
    schema: (lang) => [organizationSchema(lang), webSiteSchema(lang), faqSchema(lang)]
  },
  {
    path: "/legal",
    title: "Legal and Contact | Lantso",
    description: "Terms, privacy and contact information for buying limited Lantso Moroccan football jerseys.",
    image: "/assets/photos/fallback/hero.jpg",
    body: legalBody,
    schema: (lang) => [organizationSchema(lang), webSiteSchema(lang)]
  },
  {
    path: "/roots",
    title: "Discover the Roots | Lantso",
    description: "The Lantso story behind Roots 01 Khaki and Atlas 02 White, from Moroccan heritage to the world.",
    image: "/assets/photos/fallback/origin-1.jpg",
    body: rootsBody,
    schema: (lang) => [organizationSchema(lang), webSiteSchema(lang)]
  },
  {
    path: "/acknowledgments",
    title: "Acknowledgments | Lantso",
    description: "Credits and acknowledgments from the Lantso Roots chapter.",
    image: "/assets/photos/fallback/origin-2.jpg",
    body: creditsBody,
    schema: (lang) => [organizationSchema(lang), webSiteSchema(lang)]
  },
  {
    path: "/success",
    title: "Order Received | Lantso",
    description: "Lantso order confirmation.",
    image: "/assets/photos/fallback/hero.jpg",
    body: (lang) => noticeBody(noticeHeading("successTitle", lang), text("successBody", lang), lang),
    noindex: true,
    schema: (lang) => [organizationSchema(lang), webSiteSchema(lang)]
  },
  {
    path: "/cancel",
    title: "Checkout Cancelled | Lantso",
    description: "Lantso checkout cancelled.",
    image: "/assets/photos/fallback/hero.jpg",
    body: (lang) => noticeBody(noticeHeading("cancelTitle", lang), text("cancelBody", lang), lang),
    noindex: true,
    schema: (lang) => [organizationSchema(lang), webSiteSchema(lang)]
  }
];

const template = await readFile(path.join(ROOT, "index.html"), "utf8");

await rm(DIST, { recursive: true, force: true });
await mkdir(DIST, { recursive: true });
await Promise.all(
  ["app.js", "catalog.mjs", "styles.css", "robots.txt", "llms.txt", "site.webmanifest"].map((file) =>
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
  html = html.replace(/<html lang="[^"]*">/, `<html lang="${escapeHtml(lang)}"${lang === "ar" ? ' class="is-arabic"' : ""}>`);
  html = html.replace(/<title>[\s\S]*?<\/title>/, `<title>${escapeHtml(title)}</title>`);
  html = upsertMeta(html, "name", "description", description);
  html = upsertMeta(html, "property", "og:title", title);
  html = upsertMeta(html, "property", "og:description", description);
  html = upsertMeta(html, "property", "og:image", absolute(route.image));
  html = upsertMeta(html, "property", "og:url", canonical);
  html = upsertMeta(html, "property", "og:site_name", "Lantso");
  html = upsertMeta(html, "name", "twitter:title", title);
  html = upsertMeta(html, "name", "twitter:description", description);
  html = upsertMeta(html, "name", "twitter:image", absolute(route.image));
  html = upsertMeta(html, "name", "theme-color", "#d9d9d7");
  html = upsertMeta(html, "name", "robots", route.noindex ? "noindex, nofollow" : "index, follow, max-image-preview:large");
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

function noticeHeading(key, lang = DEFAULT_LANG) {
  return stripBrandSuffix(text(key, lang));
}

function stripBrandSuffix(value) {
  return String(value || "").replace(" | Lantso", "").replace(" | لانطسو", "");
}

function locale(lang = DEFAULT_LANG) {
  if (lang === "fr") return "fr-FR";
  if (lang === "ar") return "ar-MA";
  return "en-GB";
}

function faqRows(lang = DEFAULT_LANG) {
  if (lang === "fr") {
    return [
      ["Quand ma commande sera-t-elle expédiée ?", "Les commandes payées sont préparées sous 1 à 3 jours ouvrés pendant un drop. Le suivi est envoyé par email dès que le colis est remis au transporteur."],
      ["Quels pays sont livrables ?", "Le checkout prend en charge la France, Monaco, les pays de l'Union européenne, la Suisse, le Royaume-Uni, le Maroc, les États-Unis, le Canada, le Japon, l'Arabie saoudite, la Norvège et les autres destinations listées dans le panier."],
      ["Comment choisir ma taille ?", "Utilise les mesures sur chaque page produit et compare-les avec un maillot que tu portes déjà. Entre M et L, choisis L pour une coupe plus relax."],
      ["Puis-je échanger une taille ?", "Les échanges dépendent du stock restant. Si le remplacement n'est pas disponible, un retour éligible peut être remboursé."]
    ];
  }
  if (lang === "ar") {
    return [
      ["متى يتم شحن طلبي؟", "يتم تجهيز الطلبات المدفوعة خلال 1 إلى 3 أيام عمل أثناء الإصدار. يصلك رقم التتبع عبر البريد الإلكتروني عند تسليم الطرد للناقل."],
      ["ما الدول المتاحة للتوصيل؟", "يدعم الدفع فرنسا، موناكو، دول الاتحاد الأوروبي، سويسرا، المملكة المتحدة، المغرب، الولايات المتحدة، كندا، اليابان، السعودية، النرويج وباقي الوجهات الظاهرة في السلة."],
      ["كيف أختار المقاس؟", "استعمل القياسات في صفحة كل منتج وقارنها بقميص تلبسه حاليا. إذا كنت بين M و L فاختر L لقصة أوسع."],
      ["هل يمكن تبديل المقاس؟", "يعتمد التبديل على المخزون المتبقي. إذا لم يتوفر البديل يمكن معالجة إرجاع مؤهل."]
    ];
  }
  return [
    ["When will my order ship?", "Paid orders are prepared within 1-3 business days during a drop. Tracking is sent by email as soon as the parcel is handed to the carrier."],
    ["Which countries can receive delivery?", "Checkout supports France, Monaco, EU countries, Switzerland, the United Kingdom, Morocco, the United States, Canada, Japan, Saudi Arabia, Norway, and the other enabled destinations listed in the cart."],
    ["How should I choose my size?", "Use the measurements on each product page and compare them with a jersey you already wear. If you are between M and L, choose L for a more relaxed fit."],
    ["Can I exchange a size?", "Exchanges depend on remaining stock. If a replacement is unavailable, we can process an eligible return instead."]
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
  if (route.path === "/acknowledgments") return text("creditsTitle", lang);
  if (route.path === "/success") return text("successTitle", lang);
  if (route.path === "/cancel") return text("cancelTitle", lang);
  return route.title;
}

function routeDescription(route, lang = DEFAULT_LANG) {
  const product = PRODUCTS.find((candidate) => route.path === `/product/${candidate.id}`);
  if (product) {
    const name = product.name[lang] || product.name.en;
    const description = product.description[lang] || product.description.en;
    return `${name} by Lantso. ${description} 100% polyester.`;
  }
  if (route.path === "/") return text("homeDescription", lang);
  if (route.path === "/shop") return text("shopDescription", lang);
  if (route.path === "/info") return text("infoDescription", lang);
  if (route.path === "/legal") return text("legalDescription", lang);
  if (route.path === "/roots") return text("rootsDescription", lang);
  if (route.path === "/acknowledgments") return text("creditsDescription", lang);
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
          ${pictureHtml("hero", "Lantso Moroccan jersey campaign in a Casablanca street", 1920, 1280, "100vw")}
          <h1>${escapeHtml(text("homeTitle", lang))}</h1>
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
          <p>${escapeHtml(text("legalSupport", lang))}</p>
          <p>${escapeHtml(text("legalSocial", lang))}</p>
          <p>${escapeHtml(text("legalPrivacy", lang))}</p>
        </section>
      `;
}

function rootsBody(lang = DEFAULT_LANG) {
  const paragraphs = text("rootsParagraphs", lang);
  const list = Array.isArray(paragraphs) ? paragraphs : [paragraphs];
  return `
        <section class="roots-layout">
          <article class="roots-story">
            <div class="roots-copy roots-copy--intro">
              <h1>${escapeHtml(text("rootsHeading", lang))}</h1>
              <div class="prose">${paragraphsHtml(list.slice(0, 5))}</div>
            </div>
            <div class="roots-image roots-image--right">
              <figure class="photo-frame campaign-visual">${pictureHtml("origin-1", "Lantso origin shooting portrait", 1200, 1500, "(max-width: 760px) 78vw, 34vw")}</figure>
            </div>
            <div class="roots-image roots-image--left">
              <figure class="photo-frame campaign-visual">${pictureHtml("origin-2", "Lantso origin shooting detail", 1200, 1500, "(max-width: 760px) 78vw, 28vw")}</figure>
            </div>
            <div class="roots-copy roots-copy--rest">
              <div class="prose">${paragraphsHtml(list.slice(5))}</div>
            </div>
          </article>
        </section>
      `;
}

function creditsBody(lang = DEFAULT_LANG) {
  return `
        <section class="credits-page">
          <section class="acknowledgments acknowledgments--solo">
            <h1>${escapeHtml(text("creditsHeading", lang))}</h1>
            <ul>${ACKNOWLEDGMENTS.map(acknowledgmentItem).join("")}</ul>
          </section>
        </section>
      `;
}

function acknowledgmentItem(item) {
  if (item.url) {
    return `<li><a href="${escapeHtml(item.url)}" target="_blank" rel="noreferrer">${escapeHtml(item.name)}</a></li>`;
  }
  return `<li>${escapeHtml(item.name)}</li>`;
}

function paragraphsHtml(paragraphs) {
  return paragraphs.map((body) => `<p>${escapeHtml(body)}</p>`).join("");
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
      if (!measure) return "";
      return `${size}: ${measure.length}cm x ${measure.width}cm`;
    })
    .filter(Boolean)
    .join(" / ");
}

function organizationSchema(lang = DEFAULT_LANG) {
  return {
    "@type": "Organization",
    "@id": `${absolute(localizedPath("/", lang))}#organization`,
    name: "Lantso",
    alternateName: ["LANTSO", "Lantso Atelier"],
    url: absolute(localizedPath("/", lang)),
    logo: `${SITE_URL}/assets/icons/lantso-icon-512.png`,
    description: "Limited Moroccan football jerseys: Roots 01 Khaki and Atlas 02 White.",
    slogan: "From the Roots to the World",
    brand: { "@type": "Brand", name: "Lantso" },
    email: "contact@lantso.com",
    contactPoint: {
      "@type": "ContactPoint",
      email: "contact@lantso.com",
      contactType: "customer support",
      availableLanguage: LANGS
    },
    sameAs: [SOCIAL_LINKS.instagram]
  };
}

function webSiteSchema(lang = DEFAULT_LANG) {
  return {
    "@type": "WebSite",
    "@id": `${absolute(localizedPath("/", lang))}#website`,
    name: "Lantso",
    url: absolute(localizedPath("/", lang)),
    inLanguage: LANGS,
    publisher: { "@id": `${absolute(localizedPath("/", lang))}#organization` }
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
    image: [`${SITE_URL}/assets/photos/fallback/${product.id}.jpg`],
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
      name: stripBrandSuffix(title).replace(" - Limited Moroccan Jersey", ""),
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
  const loading = file === "hero" ? `loading="eager" fetchpriority="high"` : `loading="lazy"`;
  return `<picture>
            <source srcset="${photoUrl(`/assets/photos/responsive/${file}-480.webp`)} 480w, ${photoUrl(`/assets/photos/responsive/${file}-800.webp`)} 800w, ${photoUrl(`/assets/photos/responsive/${file}-1200.webp`)} 1200w, ${photoUrl(`/assets/photos/${file}.webp`)} ${width}w" sizes="${escapeHtml(sizes)}" type="image/webp">
            <img src="${photoUrl(`/assets/photos/fallback/${file}.jpg`)}" alt="${escapeHtml(alt)}" ${loading} decoding="async" width="${width}" height="${height}">
          </picture>`;
}

function photoUrl(assetPath) {
  return `${assetPath}?v=${PHOTO_VERSION}`;
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
