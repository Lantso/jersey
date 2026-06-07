import {
  CURRENCY,
  PRODUCTS,
  SHIPPING_ZONES,
  calculateShipping,
  convertMoney,
  currencyForCountry,
  findProduct,
  formatCurrencyAmount,
  formatMoney
} from "./catalog.mjs?v=20260606b";

const SOCIAL_LINKS = {
  instagram: "https://www.instagram.com/lantso.at"
};
const SITE_URL = "https://lantso.com";
const PHOTO_VERSION = "20260607a";
const COUNTRY_NAMES = {
  AE: "United Arab Emirates",
  AT: "Austria",
  AU: "Australia",
  BE: "Belgium",
  BG: "Bulgaria",
  CA: "Canada",
  CH: "Switzerland",
  CY: "Cyprus",
  CZ: "Czechia",
  DE: "Germany",
  DK: "Denmark",
  EE: "Estonia",
  ES: "Spain",
  FI: "Finland",
  FR: "France",
  GB: "United Kingdom",
  GR: "Greece",
  HR: "Croatia",
  HU: "Hungary",
  IE: "Ireland",
  IT: "Italy",
  JP: "Japan",
  LT: "Lithuania",
  LU: "Luxembourg",
  LV: "Latvia",
  MA: "Morocco",
  MC: "Monaco",
  MT: "Malta",
  NL: "Netherlands",
  NO: "Norway",
  PL: "Poland",
  PT: "Portugal",
  QA: "Qatar",
  RO: "Romania",
  SA: "Saudi Arabia",
  SE: "Sweden",
  SI: "Slovenia",
  SK: "Slovakia",
  US: "United States"
};
const DELIVERY_COUNTRIES = [...new Set(SHIPPING_ZONES.flatMap((zone) => zone.countries))]
  .map((code) => ({ code, name: COUNTRY_NAMES[code] || code }))
  .sort((a, b) => a.name.localeCompare(b.name, "en", { sensitivity: "base" }));
const POSTAL_CODE_SAMPLES = {
  AT: [["1010", "Vienna"], ["5020", "Salzburg"], ["6020", "Innsbruck"]],
  AU: [["2000", "Sydney"], ["3000", "Melbourne"], ["4000", "Brisbane"], ["6000", "Perth"]],
  BE: [["1000", "Brussels"], ["2000", "Antwerp"], ["9000", "Ghent"]],
  BG: [["1000", "Sofia"], ["4000", "Plovdiv"], ["9000", "Varna"]],
  CA: [["M5H 2N2", "Toronto"], ["H3A 0G4", "Montreal"], ["V6B 1A1", "Vancouver"]],
  CH: [["8001", "Zurich"], ["1201", "Geneva"], ["3001", "Bern"]],
  CY: [["1010", "Nicosia"], ["3040", "Limassol"], ["6020", "Larnaca"]],
  CZ: [["110 00", "Prague"], ["602 00", "Brno"], ["702 00", "Ostrava"]],
  DE: [["10115", "Berlin"], ["20095", "Hamburg"], ["80331", "Munich"], ["50667", "Cologne"]],
  DK: [["1050", "Copenhagen"], ["2100", "Copenhagen"], ["8000", "Aarhus"]],
  EE: [["10111", "Tallinn"], ["51003", "Tartu"], ["80010", "Parnu"]],
  ES: [["08001", "Barcelona"], ["28001", "Madrid"], ["46001", "Valencia"], ["41001", "Seville"]],
  FI: [["00100", "Helsinki"], ["20100", "Turku"], ["33100", "Tampere"]],
  FR: [
    ["01000", "Bourg-en-Bresse"],
    ["06000", "Nice"],
    ["06100", "Nice"],
    ["06200", "Nice"],
    ["13001", "Marseille"],
    ["13002", "Marseille"],
    ["13006", "Marseille"],
    ["13008", "Marseille"],
    ["31000", "Toulouse"],
    ["33000", "Bordeaux"],
    ["34000", "Montpellier"],
    ["44000", "Nantes"],
    ["59000", "Lille"],
    ["59800", "Lille"],
    ["67000", "Strasbourg"],
    ["69001", "Lyon"],
    ["69002", "Lyon"],
    ["69003", "Lyon"],
    ["75001", "Paris"],
    ["75002", "Paris"],
    ["75003", "Paris"],
    ["75004", "Paris"],
    ["75005", "Paris"],
    ["75006", "Paris"],
    ["75007", "Paris"],
    ["75008", "Paris"],
    ["75009", "Paris"],
    ["75010", "Paris"],
    ["75011", "Paris"],
    ["75012", "Paris"],
    ["75013", "Paris"],
    ["75014", "Paris"],
    ["75015", "Paris"],
    ["75016", "Paris"],
    ["75017", "Paris"],
    ["75018", "Paris"],
    ["75019", "Paris"],
    ["75020", "Paris"],
    ["92100", "Boulogne-Billancourt"],
    ["93100", "Montreuil"],
    ["94100", "Saint-Maur-des-Fosses"]
  ],
  GB: [["SW1A 1AA", "London"], ["W1A 1AA", "London"], ["M1 1AE", "Manchester"], ["EH1 1YZ", "Edinburgh"]],
  GR: [["105 57", "Athens"], ["546 24", "Thessaloniki"], ["712 01", "Heraklion"]],
  HR: [["10000", "Zagreb"], ["21000", "Split"], ["51000", "Rijeka"]],
  HU: [["1051", "Budapest"], ["6720", "Szeged"], ["4024", "Debrecen"]],
  IE: [["D01 F5P2", "Dublin"], ["T12 T656", "Cork"], ["H91 H2Y4", "Galway"]],
  IT: [["00118", "Rome"], ["20121", "Milan"], ["50121", "Florence"], ["80121", "Naples"]],
  JP: [["100-0001", "Tokyo"], ["530-0001", "Osaka"], ["600-8001", "Kyoto"]],
  LT: [["LT-01100", "Vilnius"], ["LT-44280", "Kaunas"], ["LT-92127", "Klaipeda"]],
  LU: [["L-1111", "Luxembourg"], ["L-1220", "Luxembourg"], ["L-4001", "Esch-sur-Alzette"]],
  LV: [["LV-1050", "Riga"], ["LV-3401", "Liepaja"], ["LV-3001", "Jelgava"]],
  MA: [["10000", "Rabat"], ["20000", "Casablanca"], ["20100", "Casablanca"], ["30000", "Fes"], ["40000", "Marrakech"], ["50000", "Meknes"], ["60000", "Oujda"], ["80000", "Agadir"], ["90000", "Tangier"]],
  MC: [["98000", "Monaco"]],
  MT: [["VLT 1111", "Valletta"], ["SLM 1020", "Sliema"], ["BKR 3000", "Birkirkara"]],
  NL: [["1012 AB", "Amsterdam"], ["3011 AA", "Rotterdam"], ["2511 BT", "The Hague"]],
  NO: [["0001", "Oslo"], ["5003", "Bergen"], ["7010", "Trondheim"]],
  PL: [["00-001", "Warsaw"], ["30-001", "Krakow"], ["80-001", "Gdansk"]],
  PT: [["1000-001", "Lisbon"], ["4000-001", "Porto"], ["8000-001", "Faro"]],
  RO: [["010011", "Bucharest"], ["400001", "Cluj-Napoca"], ["300001", "Timisoara"]],
  SA: [["12211", "Riyadh"], ["22233", "Jeddah"], ["34218", "Dammam"]],
  SE: [["111 20", "Stockholm"], ["411 06", "Gothenburg"], ["211 20", "Malmo"]],
  SI: [["1000", "Ljubljana"], ["2000", "Maribor"], ["6000", "Koper"]],
  SK: [["811 01", "Bratislava"], ["040 01", "Kosice"], ["010 01", "Zilina"]],
  US: [["10001", "New York"], ["33101", "Miami"], ["60601", "Chicago"], ["90001", "Los Angeles"], ["94102", "San Francisco"]]
};
const PRODUCT_GALLERY_DETAILS = {
  "roots-01-khaki": [
    ["roots-01-khaki-logo", "Roots 01 Khaki logo detail"],
    ["roots-01-khaki-mg-5580", "Roots 01 Khaki jersey studio detail"],
    ["roots-01-khaki-mg-0420", "Roots 01 Khaki jersey worn detail"]
  ],
  "atlas-02-white": [
    ["atlas-02-white-logo", "Atlas 02 White logo detail"],
    ["atlas-02-white-pir05315", "Atlas 02 White jersey studio detail"],
    ["atlas-02-white-studio-84", "Atlas 02 White jersey worn detail"]
  ]
};
const ARCHIVE_ITEMS = [
  { date: "26/07/2026", title: "Ryan" },
  { date: "26/07/2026", title: "Lorem" },
  { date: "26/07/2026", title: "Ipsum" },
  { date: "26/07/2026", title: "Dolor" },
  { date: "26/07/2026", title: "Sit" },
  { date: "26/07/2026", title: "Amet" },
  { date: "26/07/2026", title: "Studio" },
  { date: "26/07/2026", title: "Roots" }
];
const ACKNOWLEDGMENTS = [
  "Lorem Ipsum",
  "Dolor Sit",
  "Amet Consectetur",
  "Adipiscing Elit",
  "Sed Do",
  "Eiusmod Tempor",
  "Incididunt Ut",
  "Labore Et"
];

const I18N = {
  en: {
    nav: {
      home: "Home",
      shop: "Shop",
      allProducts: "All products",
      jerseys: "Jerseys",
      origin: "Origin",
      info: "Info",
      shipping: "Shipping",
      returns: "Returns",
      faq: "FAQ",
      legal: "Legal",
      terms: "Terms & conditions",
      privacy: "Privacy policy",
      contact: "Contact",
      locked: "Stay locked in",
      archives: "Archives"
    },
    hero: {
      title: "From the Roots\nto the World",
      step: "Step inside",
      chapter: "Chapter 01 - Roots",
      headline: "Two pieces\none heritage\nreimagined",
      discoverShop: "Discover the shop",
      origin: "Origin",
      before: "Before the design,\nthere was a story",
      discoverRoots: "Discover the roots"
    },
    product: {
      limited: "Limited pieces",
      claim: "Claim piece",
      access: "Access the jersey",
      size: "Size",
      price: "Price",
      color: "Color",
      add: "Add to cart",
      checkout: "Checkout",
      description: "Description",
      material: "Material",
      care: "Care",
      measurements: "Measurements",
      selectSize: "Select size",
      soldOut: "Sold out",
      added: "Added to cart.",
      shippingEstimate: "Shipping estimate",
      stock: "Limited run"
    },
    cart: {
      title: "Cart",
      empty: "Your cart is empty.",
      continue: "Continue browsing",
      country: "Delivery country",
      postal: "Postal code",
      subtotal: "Subtotal",
      shipping: "Shipping",
      total: "Total",
      free: "Free",
      remove: "Remove",
      qty: "Qty",
      checkout: "Checkout securely",
      processing: "Opening checkout...",
      checkoutError: "Checkout could not open. Refresh the page and try again, or contact contact@lantso.com.",
      estimate: "Estimated delivery"
    },
    info: {
      title: "Information",
      shippingBody: "Orders are prepared after payment and ship from Europe with tracked delivery. The cart shows the live shipping rate, estimated delivery time, and every eligible destination before checkout. Customers outside the European Union may be charged local duties or import taxes by the carrier.",
      returnsBody: "Returns can be requested within 14 days of delivery by emailing contact@lantso.com before sending anything back. Items must be unworn, unwashed, undamaged, and returned with original packaging and tags. Return shipping is paid by the customer unless the item is faulty or the wrong product was sent. Refunds are issued to the original payment method after inspection.",
      faqTitle: "FAQ",
      q1: "When will my order ship?",
      a1: "Paid orders are prepared within 1-3 business days during a drop. Tracking is sent by email as soon as the parcel is handed to the carrier.",
      q2: "Which countries can receive delivery?",
      a2: "Checkout supports France, Monaco, EU countries, Switzerland, the United Kingdom, Morocco, the United States, Canada, Japan, Saudi Arabia, Norway, and the other enabled destinations listed in the cart.",
      q3: "How should I choose my size?",
      a3: "Use the measurements on each product page and compare them with a jersey you already wear. If you are between M and L, choose L for a more relaxed fit.",
      q4: "Can I exchange a size?",
      a4: "Exchanges depend on remaining stock. If a replacement is unavailable, we can process an eligible return instead."
    },
    legal: {
      title: "Legal & contact",
      termsBody: "Lantso sells limited edition jerseys through this storefront. Prices can be presented in the customer's local currency where Stripe supports it. Product availability is limited and stock is reserved only when Stripe Checkout opens; an order is confirmed after successful payment. Lantso may cancel and refund orders flagged for fraud, stock error, or incomplete delivery details. The customer is responsible for providing an accurate address and for any import duties, taxes, or carrier charges applied outside the European Union. For order support, contact contact@lantso.com.",
      privacyBody: "Lantso collects the details needed to run the shop: contact details, delivery address, cart contents, language and access preferences, support messages, and club sign-up details. Payment details are processed by Stripe and are not stored by this website. Data is used for checkout, fulfilment, customer support, fraud prevention, required accounting records, and email updates when requested. To access or delete eligible data, contact contact@lantso.com.",
      contactBody: "For order support, sizing, press, or wholesale requests, use the form below or write to contact@lantso.com.",
      name: "Name",
      email: "Email",
      message: "Message",
      send: "Send",
      sent: "Message sent. We will reply by email."
    },
    roots: {
      title: "Before the design,\nthere was a story",
      body: [
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
      ]
    },
    archives: {
      title: "Archives",
      intro: "Photo traces from the Lantso shooting days.",
      acknowledgments: "Acknowledgments",
      close: "Close"
    },
    club: {
      title: "Join the club",
      name: "Name",
      email: "Email",
      submit: "Join the list",
      success: "You are on the list.",
      error: "The profile could not be saved."
    },
    gate: {
      title: "From the Roots\nto the World",
      date: "06 / 06 / 2026",
      password: "Password",
      unlock: "Enter",
      invalid: "Wrong password.",
      intro: "Private access before the drop.",
      email: "Email",
      subscribe: "Join the club",
      subscribed: "You are on the list.",
      countdown: "Drop opens in",
      days: "Days",
      hours: "Hours",
      minutes: "Minutes",
      seconds: "Seconds"
    },
    form: {
      processing: "Saving...",
      emailInvalid: "Enter a valid email address."
    },
    cookie: {
      body: "Lantso uses essential cookies and local storage for cart, language, private access, and checkout security.",
      accept: "Accept"
    },
    checkout: {
      successTitle: "Thank you for your order",
      successBody: "Payment is complete. Your order is confirmed and preparation can start.",
      successReference: "Order reference",
      successEmail: "A payment confirmation email is sent to the address used at checkout.",
      successTracking: "Tracking",
      successTrackingPending: "Your tracking number will be sent by email as soon as the parcel is handed to the carrier.",
      cancelTitle: "Checkout cancelled",
      cancelBody: "Your cart is still saved.",
      back: "Back to shop"
    },
    footer: {
      rights: "© 2026 Lantso\nAll rights reserved.",
      secure: "paiements sécurisés"
    }
  },
  fr: {
    nav: {
      home: "Accueil",
      shop: "Boutique",
      allProducts: "Tous les produits",
      jerseys: "Maillots",
      origin: "Origine",
      info: "Info",
      shipping: "Livraison",
      returns: "Retours",
      faq: "FAQ",
      legal: "Mentions légales",
      terms: "Conditions générales",
      privacy: "Confidentialité",
      contact: "Contact",
      locked: "Reste connecté",
      archives: "Archives"
    },
    hero: {
      title: "From the Roots\nto the World",
      step: "Entrer",
      chapter: "Chapitre 01 - Roots",
      headline: "Deux pièces\nun héritage\nréimaginé",
      discoverShop: "Découvrir la boutique",
      origin: "Origine",
      before: "Avant le design,\nil y avait une histoire",
      discoverRoots: "Découvrir l'histoire"
    },
    product: {
      limited: "Pièces limitées",
      claim: "Ajouter au panier",
      access: "Ajouter au panier",
      size: "Taille",
      price: "Prix",
      color: "Couleur",
      add: "Ajouter au panier",
      checkout: "Paiement",
      description: "Description",
      material: "Matière",
      care: "Entretien",
      measurements: "Mesures",
      selectSize: "Choisir une taille",
      soldOut: "Épuisé",
      added: "Ajouté au panier.",
      shippingEstimate: "Estimation livraison",
      stock: "Série limitée"
    },
    cart: {
      title: "Panier",
      empty: "Votre panier est vide.",
      continue: "Continuer la navigation",
      country: "Pays de livraison",
      postal: "Code postal",
      subtotal: "Sous-total",
      shipping: "Livraison",
      total: "Total",
      free: "Offerte",
      remove: "Retirer",
      qty: "Qté",
      checkout: "Paiement sécurisé",
      processing: "Ouverture du paiement...",
      checkoutError: "Le paiement n'a pas pu s'ouvrir. Actualise la page et réessaie, ou contacte contact@lantso.com.",
      estimate: "Livraison estimée"
    },
    info: {
      title: "Informations",
      shippingBody: "Les commandes sont préparées après paiement puis expédiées depuis l'Europe avec suivi. Le panier affiche le tarif de livraison, le délai estimé et les destinations disponibles avant le paiement. Hors Union européenne, des droits ou taxes d'import peuvent être demandés par le transporteur.",
      returnsBody: "Les retours peuvent être demandés sous 14 jours après livraison en écrivant à contact@lantso.com avant tout renvoi. Les pièces doivent être non portées, non lavées, non abîmées et renvoyées avec leur packaging et leurs étiquettes. Les frais de retour sont à la charge du client, sauf article défectueux ou erreur d'envoi. Le remboursement est effectué sur le moyen de paiement d'origine après vérification.",
      faqTitle: "FAQ",
      q1: "Quand ma commande sera-t-elle expédiée ?",
      a1: "Les commandes payées sont préparées sous 1 à 3 jours ouvrés pendant un drop. Le suivi est envoyé par email dès que le colis est remis au transporteur.",
      q2: "Quels pays sont livrables ?",
      a2: "Le checkout prend en charge la France, Monaco, les pays de l'Union européenne, la Suisse, le Royaume-Uni, le Maroc, les États-Unis, le Canada, le Japon, l'Arabie saoudite, la Norvège et les autres destinations listées dans le panier.",
      q3: "Comment choisir ma taille ?",
      a3: "Utilise les mesures sur chaque page produit et compare-les avec un maillot que tu portes déjà. Entre M et L, choisis L pour une coupe plus relax.",
      q4: "Puis-je échanger une taille ?",
      a4: "Les échanges dépendent du stock restant. Si le remplacement n'est pas disponible, un retour éligible peut être remboursé."
    },
    legal: {
      title: "Mentions légales & contact",
      termsBody: "Lantso vend des maillots en édition limitée via cette boutique. Les prix peuvent être présentés dans la devise locale du client lorsque Stripe la prend en charge. Les stocks sont limités et une pièce est réservée uniquement au moment où Stripe Checkout s'ouvre; la commande est confirmée après paiement réussi. Lantso peut annuler et rembourser une commande en cas de fraude, erreur de stock ou informations de livraison incomplètes. Le client doit fournir une adresse exacte et reste responsable des droits, taxes ou frais transporteur appliqués hors Union européenne. Pour le support commande : contact@lantso.com.",
      privacyBody: "Lantso collecte les informations nécessaires au fonctionnement de la boutique : coordonnées, adresse de livraison, contenu du panier, préférences de langue et d'accès, messages support et inscriptions club. Les données de paiement sont traitées par Stripe et ne sont pas stockées par ce site. Les données servent au paiement, à la préparation, au support, à la prévention de fraude, aux obligations comptables et aux emails demandés. Pour accéder aux données éligibles ou demander leur suppression : contact@lantso.com.",
      contactBody: "Pour le support commande, les tailles, la presse ou les demandes wholesale, utilise le formulaire ci-dessous ou écris à contact@lantso.com.",
      name: "Nom",
      email: "Email",
      message: "Message",
      send: "Envoyer",
      sent: "Message envoyé. Nous répondrons par email."
    },
    roots: {
      title: "Avant le design,\nil y avait une histoire",
      body: [
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
      ]
    },
    archives: {
      title: "Archives",
      intro: "Traces photo des jours de shooting Lantso.",
      acknowledgments: "Remerciements",
      close: "Fermer"
    },
    club: {
      title: "Join the club",
      name: "Nom",
      email: "Email",
      submit: "Rejoindre la liste",
      success: "Tu es dans la liste.",
      error: "Le profil n'a pas pu être enregistré."
    },
    gate: {
      title: "From the Roots\nto the World",
      date: "06 / 06 / 2026",
      password: "Mot de passe",
      unlock: "Entrer",
      invalid: "Mot de passe incorrect.",
      intro: "Accès privé avant le drop.",
      email: "Email",
      subscribe: "Join the club",
      subscribed: "Tu es dans la liste.",
      countdown: "Ouverture du drop dans",
      days: "Jours",
      hours: "Heures",
      minutes: "Minutes",
      seconds: "Secondes"
    },
    form: {
      processing: "Enregistrement...",
      emailInvalid: "Entre une adresse email valide."
    },
    cookie: {
      body: "Pour que ton maillot arrive sans hors-jeu, on utilise les cookies indispensables au bon fonctionnement du site.",
      accept: "Accepter"
    },
    checkout: {
      successTitle: "Merci pour ton achat",
      successBody: "Le paiement est terminé. Ta commande est confirmée et la préparation peut commencer.",
      successReference: "Numéro de commande",
      successEmail: "Un email de confirmation de paiement est envoyé à l'adresse utilisée au paiement.",
      successTracking: "Suivi",
      successTrackingPending: "Ton numéro de suivi sera envoyé par email dès que le colis sera remis au transporteur.",
      cancelTitle: "Paiement annulé",
      cancelBody: "Ton panier reste sauvegardé.",
      back: "Retour boutique"
    },
    footer: {
      rights: "© 2026 Lantso\nTous droits réservés.",
      secure: "paiements sécurisés"
    }
  },
  ar: {
    nav: {
      home: "الرئيسية",
      shop: "المتجر",
      allProducts: "كل المنتجات",
      jerseys: "القمصان",
      origin: "الأصل",
      info: "معلومات",
      shipping: "الشحن",
      returns: "الإرجاع",
      faq: "الأسئلة",
      legal: "القانوني",
      terms: "الشروط والأحكام",
      privacy: "سياسة الخصوصية",
      contact: "تواصل",
      locked: "ابق قريبا",
      archives: "الأرشيف"
    },
    hero: {
      title: "From the Roots\nto the World",
      step: "ادخل",
      chapter: "الفصل 01 - الجذور",
      headline: "قطعتان\nإرث واحد\nبرؤية جديدة",
      discoverShop: "اكتشف المتجر",
      origin: "الأصل",
      before: "قبل التصميم،\nكانت هناك قصة",
      discoverRoots: "اكتشف الجذور"
    },
    product: {
      limited: "قطع محدودة",
      claim: "احجز القطعة",
      access: "ادخل إلى القميص",
      size: "المقاس",
      price: "السعر",
      color: "اللون",
      add: "أضف إلى السلة",
      checkout: "الدفع",
      description: "الوصف",
      material: "الخامة",
      care: "العناية",
      measurements: "المقاسات",
      selectSize: "اختر المقاس",
      soldOut: "نفد المخزون",
      added: "تمت الإضافة إلى السلة.",
      shippingEstimate: "تقدير الشحن",
      stock: "إصدار محدود"
    },
    cart: {
      title: "السلة",
      empty: "سلتك فارغة.",
      continue: "متابعة التصفح",
      country: "بلد التوصيل",
      postal: "الرمز البريدي",
      subtotal: "المجموع الفرعي",
      shipping: "الشحن",
      total: "الإجمالي",
      free: "مجاني",
      remove: "حذف",
      qty: "الكمية",
      checkout: "دفع آمن",
      processing: "جاري فتح صفحة الدفع...",
      checkoutError: "تعذر فتح الدفع. حدث الصفحة وحاول مرة أخرى أو تواصل عبر contact@lantso.com.",
      estimate: "التوصيل المتوقع"
    },
    info: {
      title: "معلومات",
      shippingBody: "يتم تجهيز الطلبات بعد الدفع ثم شحنها من أوروبا مع رقم تتبع. تعرض السلة سعر الشحن، مدة التوصيل المتوقعة والوجهات المتاحة قبل الدفع. خارج الاتحاد الأوروبي قد يطلب الناقل رسوما أو ضرائب استيراد محلية.",
      returnsBody: "يمكن طلب الإرجاع خلال 14 يوما من التسليم عبر contact@lantso.com قبل إرسال أي قطعة. يجب أن تكون القطعة غير مستعملة، غير مغسولة، غير متضررة ومع التغليف والملصقات الأصلية. يتحمل العميل تكلفة الإرجاع إلا إذا كانت القطعة معيبة أو تم إرسال منتج خاطئ. يتم رد المبلغ إلى وسيلة الدفع الأصلية بعد الفحص.",
      faqTitle: "الأسئلة",
      q1: "متى يتم شحن طلبي؟",
      a1: "يتم تجهيز الطلبات المدفوعة خلال 1 إلى 3 أيام عمل أثناء الإصدار. يصلك رقم التتبع عبر البريد الإلكتروني عند تسليم الطرد للناقل.",
      q2: "ما الدول المتاحة للتوصيل؟",
      a2: "يدعم الدفع فرنسا، موناكو، دول الاتحاد الأوروبي، سويسرا، المملكة المتحدة، المغرب، الولايات المتحدة، كندا، اليابان، السعودية، النرويج وباقي الوجهات الظاهرة في السلة.",
      q3: "كيف أختار المقاس؟",
      a3: "استعمل القياسات في صفحة كل منتج وقارنها بقميص تلبسه حاليا. إذا كنت بين M و L فاختر L لقصة أوسع.",
      q4: "هل يمكن تبديل المقاس؟",
      a4: "يعتمد التبديل على المخزون المتبقي. إذا لم يتوفر البديل يمكن معالجة إرجاع مؤهل."
    },
    legal: {
      title: "القانوني والتواصل",
      termsBody: "تبيع Lantso قمصانا محدودة باليورو عبر هذا المتجر. المخزون محدود ولا يتم حجز القطعة إلا عند فتح Stripe Checkout؛ يؤكد الطلب بعد نجاح الدفع. يمكن لـ Lantso إلغاء ورد طلب عند وجود مؤشر احتيال أو خطأ مخزون أو بيانات توصيل ناقصة. يتحمل العميل مسؤولية العنوان الصحيح وأي رسوم أو ضرائب استيراد أو تكاليف ناقل خارج الاتحاد الأوروبي. للدعم: contact@lantso.com.",
      privacyBody: "تجمع Lantso البيانات الضرورية لتشغيل المتجر: بيانات التواصل، عنوان التوصيل، محتوى السلة، تفضيلات اللغة والدخول، رسائل الدعم وتسجيلات النادي. بيانات الدفع يعالجها Stripe ولا يخزنها هذا الموقع. تستخدم البيانات للدفع، التجهيز، الدعم، منع الاحتيال، السجلات المحاسبية المطلوبة ورسائل البريد المطلوبة. لطلب الوصول إلى البيانات المؤهلة أو حذفها: contact@lantso.com.",
      contactBody: "للدعم أو المقاسات أو الصحافة أو طلبات الجملة، استخدم النموذج أدناه أو اكتب إلى contact@lantso.com.",
      name: "الاسم",
      email: "البريد الإلكتروني",
      message: "الرسالة",
      send: "إرسال",
      sent: "تم إرسال الرسالة. سنرد عبر البريد الإلكتروني."
    },
    roots: {
      title: "قبل التصميم،\nكانت هناك قصة",
      body: [
        "بعض الناس ينتظرون اللحظة المناسبة. وآخرون يفهمون أنها لا توجد.",
        "وُلدت LANTSO بين أفكار تُركت جانبا، ومشاريع لم تر النور، وأخرى لم تصمد أمام الزمن. ومع ذلك، منح كل واحد منها درسا أو لقاء أو طريقة جديدة لرؤية الأشياء.",
        "لسنوات، بقي نفس الانبهار حاضرا: رؤية أشخاص ينطلقون من شبه لا شيء لبناء عالم قادر على جمع الناس وإلهامهم وترك أثر.",
        "وفي النهاية فرض السؤال نفسه: لماذا ليس نحن؟",
        "لماذا ننتظر إمكانيات أكثر؟ وقتا أكثر؟ يقينا أكثر؟ لماذا ننتظر أن يصبح كل شيء مثاليا حتى نبدأ؟",
        "وُلدت LANTSO من هذه القناعة. قناعة أن الفكرة لا تحتاج إلى ظروف مثالية كي توجد. وأن المشروع يمكن أن يبدأ بالقليل.",
        "قليل من الإمكانيات. قليل من الضمانات. لكن الكثير من الإرادة.",
        "الجذور هو الفصل الأول من هذه القصة.",
        "مجموعة مستوحاة من إرث مغربي انتقل عبر الأجيال. تحية لذكريات تركها عام 1998 ولأحلام تتجه نحو 2026.",
        "لم تولد LANTSO لأن كل شيء كان جاهزا. وُلدت العلامة لأن علينا أن نقبل أن أي مغامرة كبيرة لا تبدأ باليقين.",
        "فقط برؤية. وبقرار الإيمان بأنها تستحق أن توجد."
      ]
    },
    archives: {
      title: "الأرشيف",
      intro: "آثار مصورة من أيام تصوير Lantso.",
      acknowledgments: "الشكر",
      close: "إغلاق"
    },
    club: {
      title: "Join the club",
      name: "الاسم",
      email: "البريد الإلكتروني",
      submit: "انضم إلى القائمة",
      success: "أنت الآن في القائمة.",
      error: "تعذر حفظ الحساب."
    },
    gate: {
      title: "From the Roots\nto the World",
      date: "06 / 06 / 2026",
      password: "كلمة المرور",
      unlock: "دخول",
      invalid: "كلمة المرور غير صحيحة.",
      intro: "دخول خاص قبل الإصدار.",
      email: "البريد الإلكتروني",
      subscribe: "Join the club",
      subscribed: "أنت الآن في القائمة.",
      countdown: "يفتح الإصدار بعد",
      days: "أيام",
      hours: "ساعات",
      minutes: "دقائق",
      seconds: "ثوان"
    },
    form: {
      processing: "جاري الحفظ...",
      emailInvalid: "أدخل بريدا إلكترونيا صحيحا."
    },
    cookie: {
      body: "تستخدم Lantso ملفات تعريف ارتباط أساسية والتخزين المحلي للسلة واللغة والدخول الخاص وأمان الدفع.",
      accept: "موافق"
    },
    checkout: {
      successTitle: "شكرا على طلبك",
      successBody: "اكتمل الدفع. تم تأكيد طلبك ويمكن بدء التحضير.",
      successReference: "رقم الطلب",
      successEmail: "سيتم إرسال تأكيد الدفع إلى البريد الإلكتروني المستخدم أثناء الدفع.",
      successTracking: "التتبع",
      successTrackingPending: "سيتم إرسال رقم التتبع عبر البريد الإلكتروني عند تسليم الطرد إلى شركة الشحن.",
      cancelTitle: "تم إلغاء الدفع",
      cancelBody: "سلتك ما زالت محفوظة.",
      back: "العودة إلى المتجر"
    },
    footer: {
      rights: "© 2026 Lantso\nAll rights reserved.",
      secure: "مدفوعات آمنة"
    }
  }
};

const LAUNCH_DATE = new Date("2026-06-06T00:00:00+02:00");
const LANGS = ["en", "fr", "ar"];
const DEFAULT_LANG = "en";
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function languageFromPath(path = window.location.pathname) {
  const firstSegment = path.split("/").filter(Boolean)[0];
  return LANGS.includes(firstSegment) ? firstSegment : "";
}

function stripLanguagePrefix(path = window.location.pathname) {
  const [pathname, suffix = ""] = String(path).split(/(?=[?#])/);
  const parts = pathname.split("/").filter(Boolean);
  if (!LANGS.includes(parts[0])) return `${pathname || "/"}${suffix}`;
  const stripped = `/${parts.slice(1).join("/")}`;
  return `${stripped === "/" ? "/" : stripped.replace(/\/$/, "")}${suffix}`;
}

function localizedPath(path, lang = state?.lang || DEFAULT_LANG) {
  const [pathname, suffix = ""] = String(path || "/").split(/(?=[?#])/);
  const clean = stripLanguagePrefix(pathname || "/");
  const normalized = clean === "/" ? "" : clean;
  return lang === DEFAULT_LANG ? `${normalized || "/"}${suffix}` : `/${lang}${normalized}${suffix}`;
}

const state = {
  lang: languageFromPath() || localStorage.getItem("lantso:lang") || DEFAULT_LANG,
  cart: loadCart(),
  locked: Date.now() < LAUNCH_DATE.getTime() && localStorage.getItem("lantso:access") !== "granted",
  selectedSizes: Object.fromEntries(PRODUCTS.map((product) => [product.id, defaultSize(product)])),
  shippingCountry: localStorage.getItem("lantso:shippingCountry") || "FR",
  postalCode: localStorage.getItem("lantso:postalCode") || "",
  inventory: null,
  checkoutPending: false
};

const app = document.querySelector("#app");
const drawer = document.querySelector("[data-cart-drawer]");
const cartBody = document.querySelector("[data-cart-body]");
const cartCount = document.querySelector("[data-cart-count]");
const clubModal = document.querySelector("[data-club-modal]");
const cookieNotice = document.querySelector("[data-cookie-notice]");
let countdownTimer;
let previousCartFocus;

function t(path) {
  return path.split(".").reduce((value, key) => value?.[key], I18N[state.lang]) || path;
}

function locale() {
  if (state.lang === "fr") return "fr-FR";
  if (state.lang === "ar") return "ar-MA";
  return "en-GB";
}

function moneyCountry() {
  return state.shippingCountry;
}

function formatStoreMoney(cents, countryCode = moneyCountry()) {
  return formatMoney(cents, locale(), countryCode);
}

function storeMoneyAmount(cents, countryCode = moneyCountry()) {
  return convertMoney(cents, countryCode);
}

function formatStoreCurrencyAmount(cents, countryCode = moneyCountry()) {
  return formatCurrencyAmount(cents, locale(), currencyForCountry(countryCode));
}

function route() {
  const path = window.location.pathname;
  const hashPath = window.location.hash.startsWith("#/") ? window.location.hash.slice(1) : "";
  const active = stripLanguagePrefix(hashPath || path);
  if (active === "/" || active === "") return { name: "home" };
  if (active === "/shop") return { name: "shop" };
  if (active.startsWith("/product/")) return { name: "product", id: active.split("/").pop() };
  if (active === "/info") return { name: "info" };
  if (active === "/legal") return { name: "legal" };
  if (active === "/roots") return { name: "roots" };
  if (active === "/archives") return { name: "archives" };
  if (active === "/success") return { name: "success" };
  if (active === "/cancel") return { name: "cancel" };
  return { name: "home" };
}

function pageMeta(current = route()) {
  if (current.name === "product") {
    const product = findProduct(current.id) || PRODUCTS[0];
    const name = product.name[state.lang] || product.name.en;
    const description = product.description[state.lang] || product.description.en;
    return {
      title: `${name} - Limited Moroccan Jersey | Lantso`,
      description: `${name} by Lantso. ${description} 100% polyester.`,
      path: `/product/${product.id}`,
      image: `/assets/photos/fallback/${product.id}.jpg`,
      schema: productSchema(product)
    };
  }
  const localizedMeta = {
    en: {
      home: ["Lantso - From the Roots to the World", "Limited Moroccan football jerseys by Lantso: Roots 01 Khaki and Atlas 02 White, made for the 2026 World Cup period."],
      shop: ["Shop Moroccan Football Jerseys | Lantso", "Shop Lantso Roots 01 Khaki and Atlas 02 White, limited Moroccan football jerseys for the 2026 World Cup period."],
      info: ["Shipping, Returns and FAQ | Lantso", "Delivery countries, tracked shipping rates, returns process, sizing answers and customer support details for Lantso limited Moroccan jerseys."],
      legal: ["Legal and Contact | Lantso", "Terms, privacy and contact information for buying limited Lantso Moroccan football jerseys."],
      roots: ["Discover the Roots | Lantso", "The Lantso story behind Roots 01 Khaki and Atlas 02 White, from Moroccan heritage to the world."],
      archives: ["Archives | Lantso", "Minimal photo archive from Lantso shooting days and brand acknowledgments."],
      success: ["Order Received | Lantso", "Lantso order confirmation."],
      cancel: ["Checkout Cancelled | Lantso", "Lantso checkout cancelled."]
    },
    fr: {
      home: ["Lantso - From the Roots to the World", "Maillots de football marocains limités par Lantso : Roots 01 Khaki et Atlas 02 White, pour la période Coupe du Monde 2026."],
      shop: ["Boutique maillots de football marocains | Lantso", "Acheter Roots 01 Khaki et Atlas 02 White, deux maillots de football marocains limités pour la période Coupe du Monde 2026."],
      info: ["Livraison, retours et FAQ | Lantso", "Pays livrables, tarifs suivis, retours, tailles et support client pour les maillots marocains limités Lantso."],
      legal: ["Mentions légales et contact | Lantso", "Conditions, confidentialité et contact pour acheter les maillots de football marocains limités Lantso."],
      roots: ["Découvrir l'histoire | Lantso", "L'histoire Lantso derrière Roots 01 Khaki et Atlas 02 White, des racines marocaines au monde."],
      archives: ["Archives | Lantso", "Archive photo minimaliste des jours de shooting Lantso et remerciements de la marque."],
      success: ["Commande reçue | Lantso", "Confirmation de commande Lantso."],
      cancel: ["Paiement annulé | Lantso", "Paiement Lantso annulé."]
    },
    ar: {
      home: ["Lantso - From the Roots to the World", "قمصان كرة قدم مغربية محدودة من Lantso: روتس 01 كاكي وأطلس 02 أبيض لفترة كأس العالم 2026."],
      shop: ["متجر قمصان كرة القدم المغربية | Lantso", "تسوق روتس 01 كاكي وأطلس 02 أبيض، قمصان كرة قدم مغربية محدودة لفترة كأس العالم 2026."],
      info: ["الشحن والإرجاع والأسئلة | Lantso", "الدول المتاحة، أسعار الشحن، الإرجاع، المقاسات والدعم لقمصان Lantso المغربية المحدودة."],
      legal: ["القانوني والتواصل | Lantso", "الشروط والخصوصية ومعلومات التواصل لشراء قمصان Lantso المغربية المحدودة."],
      roots: ["اكتشف الجذور | Lantso", "قصة Lantso خلف روتس 01 كاكي وأطلس 02 أبيض، من الجذور المغربية إلى العالم."],
      archives: ["الأرشيف | Lantso", "أرشيف صور بسيط من أيام تصوير Lantso وقائمة شكر العلامة."],
      success: ["تم استلام الطلب | Lantso", "تأكيد طلب Lantso."],
      cancel: ["تم إلغاء الدفع | Lantso", "تم إلغاء دفع Lantso."]
    }
  };
  const copy = localizedMeta[state.lang] || localizedMeta.en;
  const pages = {
    shop: { title: copy.shop[0], description: copy.shop[1], path: "/shop", image: "/assets/photos/fallback/hero.jpg", schema: collectionSchema() },
    info: { title: copy.info[0], description: copy.info[1], path: "/info", image: "/assets/photos/fallback/hero.jpg", schema: faqSchema() },
    legal: { title: copy.legal[0], description: copy.legal[1], path: "/legal", image: "/assets/photos/fallback/hero.jpg", schema: organizationSchema() },
    roots: { title: copy.roots[0], description: copy.roots[1], path: "/roots", image: "/assets/photos/fallback/origin-1.jpg", schema: organizationSchema() },
    archives: { title: copy.archives[0], description: copy.archives[1], path: "/archives", image: "/assets/photos/fallback/origin-2.jpg", schema: organizationSchema() },
    success: { title: copy.success[0], description: copy.success[1], path: "/success", image: "/assets/photos/fallback/hero.jpg", schema: organizationSchema(), robots: "noindex, nofollow" },
    cancel: { title: copy.cancel[0], description: copy.cancel[1], path: "/cancel", image: "/assets/photos/fallback/hero.jpg", schema: organizationSchema(), robots: "noindex, nofollow" }
  };
  return (
    pages[current.name] || {
      title: copy.home[0],
      description: copy.home[1],
      path: "/",
      image: "/assets/photos/fallback/hero.jpg",
      schema: collectionSchema()
    }
  );
}

function updateSeo(current = route()) {
  const meta = pageMeta(current);
  const url = absoluteUrl(localizedPath(meta.path, state.lang));
  document.title = meta.title;
  setMeta("description", meta.description);
  setMeta("og:title", meta.title, "property");
  setMeta("og:description", meta.description, "property");
  setMeta("og:url", url, "property");
  setMeta("og:image", absoluteUrl(meta.image), "property");
  setMeta("og:site_name", "Lantso", "property");
  setMeta("twitter:card", "summary_large_image");
  setMeta("twitter:title", meta.title);
  setMeta("twitter:description", meta.description);
  setMeta("twitter:image", absoluteUrl(meta.image));
  setMeta("robots", meta.robots || "index, follow, max-image-preview:large");
  let canonical = document.querySelector("link[rel='canonical']");
  if (!canonical) {
    canonical = document.createElement("link");
    canonical.rel = "canonical";
    document.head.append(canonical);
  }
  canonical.href = url;
  setAlternateLinks(meta.path);
  setStructuredData([organizationSchema(), webSiteSchema(), breadcrumbSchema(current), meta.schema].filter(Boolean));
}

function setMeta(name, content, key = "name") {
  let meta = document.querySelector(`meta[${key}="${name}"]`);
  if (!meta) {
    meta = document.createElement("meta");
    meta.setAttribute(key, name);
    document.head.append(meta);
  }
  meta.content = content;
}

function absoluteUrl(path) {
  return new URL(path, `${SITE_URL}/`).href;
}

function setAlternateLinks(basePath) {
  document.querySelectorAll("link[data-lantso-alt]").forEach((node) => node.remove());
  const alternates = [
    ...LANGS.map((lang) => [lang, absoluteUrl(localizedPath(basePath, lang))]),
    ["x-default", absoluteUrl(localizedPath(basePath, DEFAULT_LANG))]
  ];
  alternates.forEach(([hreflang, href]) => {
    const link = document.createElement("link");
    link.rel = "alternate";
    link.hreflang = hreflang;
    link.href = href;
    link.dataset.lantsoAlt = "true";
    document.head.append(link);
  });
}

function navigate(path) {
  const target = localizedPath(path);
  const hash = new URL(target, window.location.origin).hash;
  history.pushState({}, "", target);
  render();
  if (hash) {
    window.setTimeout(() => document.querySelector(hash)?.scrollIntoView({ block: "start" }), 0);
  }
}

function loadCart() {
  try {
    return JSON.parse(localStorage.getItem("lantso:cart")) || [];
  } catch {
    return [];
  }
}

function saveCart() {
  localStorage.setItem("lantso:cart", JSON.stringify(state.cart));
}

function setLanguage(lang, options = {}) {
  if (!LANGS.includes(lang)) return;
  if (options.updateUrl) {
    const current = route();
    const basePath = pageMeta(current).path;
    history.pushState({}, "", localizedPath(basePath, lang));
  }
  state.lang = lang;
  localStorage.setItem("lantso:lang", lang);
  document.documentElement.lang = lang;
  document.documentElement.dir = "ltr";
  document.documentElement.classList.toggle("is-arabic", lang === "ar");
  document.querySelectorAll("[data-lang]").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.lang === lang);
  });
  document.querySelectorAll("[data-i18n]").forEach((node) => {
    node.textContent = t(node.dataset.i18n);
  });
  const clubButton = document.querySelector("[data-open-club]");
  if (clubButton) clubButton.textContent = t("club.title");
  updateCookieNotice();
  render();
  renderCart();
  updateHeaderChrome();
}

function updateCookieNotice() {
  if (!cookieNotice) return;
  const accepted = localStorage.getItem("lantso:cookie") === "accepted";
  cookieNotice.hidden = accepted;
}

function updateHeaderChrome() {
  updateHeaderScrollState();
}

function updateHeaderScrollState() {
  document.body.classList.toggle("is-scrolled", window.scrollY > 2);
}

function lineItems() {
  return state.cart
    .map((item) => {
      const product = findProduct(item.productId);
      if (!product) return null;
      const unitAmount = product.price;
      return {
        ...item,
        product,
        unitAmount,
        lineTotal: unitAmount * item.quantity
      };
    })
    .filter(Boolean);
}

function subtotal() {
  return lineItems().reduce((sum, item) => sum + item.lineTotal, 0);
}

function stockAvailable(productId, size) {
  const live = state.inventory?.products?.[productId]?.sizes?.[size]?.available;
  if (Number.isFinite(Number(live))) return Math.max(0, Number(live));
  const product = findProduct(productId);
  return Math.max(0, Number(product?.inventory?.[size] || 0));
}

function defaultSize(product) {
  return product.sizes.find((size) => Number(product.inventory?.[size] || 0) > 0) || product.sizes[0];
}

function stockSummary(product) {
  const total = product.sizes.reduce((sum, size) => sum + stockAvailable(product.id, size), 0);
  if (total <= 0) return t("product.soldOut");
  return t("product.limited");
}

function productIsSoldOut(product) {
  return product.sizes.every((size) => stockAvailable(product.id, size) <= 0);
}

function cartQuantity() {
  return state.cart.reduce((sum, item) => sum + item.quantity, 0);
}

function addToCart(productId, size = state.selectedSizes[productId], quantity = 1, open = true) {
  const product = findProduct(productId);
  if (!product || !product.sizes.includes(size)) return;
  const existing = state.cart.find((item) => item.productId === productId && item.size === size);
  const currentQuantity = existing?.quantity || 0;
  if (currentQuantity + quantity > stockAvailable(productId, size)) return;
  if (existing) {
    existing.quantity += quantity;
  } else {
    state.cart.push({ productId, size, quantity });
  }
  saveCart();
  renderCart();
  if (open) openCart();
}

function updateQuantity(productId, size, delta) {
  const item = state.cart.find((entry) => entry.productId === productId && entry.size === size);
  if (!item) return;
  item.quantity += delta;
  if (item.quantity > stockAvailable(productId, size)) {
    item.quantity = stockAvailable(productId, size);
  }
  if (item.quantity <= 0) {
    state.cart = state.cart.filter((entry) => !(entry.productId === productId && entry.size === size));
  }
  saveCart();
  renderCart();
}

function removeItem(productId, size) {
  state.cart = state.cart.filter((entry) => !(entry.productId === productId && entry.size === size));
  saveCart();
  renderCart();
}

function openCart(options = {}) {
  const { pushHistory = true, restoreFocus = true } = options;
  if (drawer.classList.contains("is-open")) return;
  previousCartFocus = restoreFocus && document.activeElement instanceof HTMLElement ? document.activeElement : null;
  if (pushHistory && !history.state?.cartOpen) {
    history.pushState({ ...(history.state || {}), cartOpen: true }, "", window.location.href);
  }
  drawer.classList.add("is-open");
  drawer.setAttribute("aria-hidden", "false");
  document.body.classList.add("drawer-open");
  document.addEventListener("keydown", trapCartFocus);
  window.setTimeout(() => {
    const target = drawer.querySelector("[data-close-cart], [data-checkout], button, select, input, a");
    target?.focus();
  }, 0);
}

function closeCart(options = {}) {
  const { fromHistory = false, restoreFocus = true } = options;
  if (!drawer.classList.contains("is-open")) return;
  drawer.classList.remove("is-open");
  drawer.setAttribute("aria-hidden", "true");
  document.body.classList.remove("drawer-open");
  document.removeEventListener("keydown", trapCartFocus);
  if (restoreFocus) previousCartFocus?.focus?.();
  previousCartFocus = null;
  if (!fromHistory && history.state?.cartOpen) {
    history.replaceState({ ...(history.state || {}), cartOpen: false }, "", window.location.href);
  }
}

function trapCartFocus(event) {
  if (!drawer.classList.contains("is-open")) return;
  if (event.key === "Escape") {
    event.preventDefault();
    closeCart();
    return;
  }
  if (event.key !== "Tab") return;
  const focusables = [...drawer.querySelectorAll("button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])")].filter(
    (node) => !node.disabled && node.offsetParent !== null
  );
  if (!focusables.length) return;
  const first = focusables[0];
  const last = focusables.at(-1);
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
}

function paymentBadges() {
  return `
    <div class="secure-checkout-note" aria-label="secure checkout">
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M7.5 10V7.8a4.5 4.5 0 0 1 9 0V10"/>
        <rect x="5.5" y="10" width="13" height="10" rx="1.6"/>
      </svg>
      <span>Secure checkout by Stripe</span>
    </div>
  `;
}

function placeholder(label = "") {
  const visual = visualFor(label);
  return visualFrame(visual, label);
}

function visualFrame(visual, label = "") {
  const alt = visual.alt || label;
  return `
    <figure class="photo-frame ${visual.className}" aria-label="${escapeHtml(label)}">
      <picture>
        ${visual.srcset ? `<source srcset="${visual.srcset}" sizes="${visual.sizes}" type="image/webp">` : ""}
        <img src="${visual.src}" alt="${escapeHtml(alt)}" loading="${visual.loading || "lazy"}" decoding="async" fetchpriority="${visual.loading === "eager" ? "high" : "auto"}" width="${visual.width}" height="${visual.height}">
      </picture>
    </figure>
  `;
}

function productGallery(product, productName) {
  const slides = productGallerySlides(product, productName);
  return `
    <div class="product-gallery" data-product-gallery="${product.id}">
      <div class="gallery-stage" aria-label="${escapeHtml(productName)} photos">
        <button class="gallery-nav gallery-nav--prev" type="button" data-gallery-step="${product.id}:-1" aria-label="Previous photo">&lsaquo;</button>
        <div class="gallery-slides">
          ${slides
            .map(
              ({ label, visual }, index) => `
                <div class="gallery-slide" data-gallery-slide="${product.id}:${index}" ${index === 0 ? "" : "hidden"}>
                  ${visualFrame(visual, label)}
                </div>
              `
            )
            .join("")}
        </div>
        <button class="gallery-nav gallery-nav--next" type="button" data-gallery-step="${product.id}:1" aria-label="Next photo">&rsaquo;</button>
      </div>
      <div class="thumb-grid gallery-thumbs" role="group" aria-label="${escapeHtml(productName)} photo choices">
        ${slides
          .map(
            ({ label, visual }, index) => `
              <button class="gallery-thumb" type="button" data-gallery-thumb="${product.id}:${index}" aria-pressed="${index === 0}">
                ${visualFrame(visual, label)}
              </button>
            `
          )
          .join("")}
      </div>
    </div>
  `;
}

function productGallerySlides(product, productName) {
  const details = PRODUCT_GALLERY_DETAILS[product.id] || [];
  return [
    { label: productName, visual: visualFor(productName) },
    ...details.map(([file, alt]) => ({ label: alt, visual: photo(file, "product-visual", alt, 1448, 1448) }))
  ];
}

function photo(file, className, alt, width, height, loading = "lazy") {
  return {
    src: photoUrl(`/assets/photos/fallback/${file}.jpg`),
    webp: photoUrl(`/assets/photos/${file}.webp`),
    srcset: `${photoUrl(`/assets/photos/responsive/${file}-480.webp`)} 480w, ${photoUrl(`/assets/photos/responsive/${file}-800.webp`)} 800w, ${photoUrl(`/assets/photos/responsive/${file}-1200.webp`)} 1200w, ${photoUrl(`/assets/photos/${file}.webp`)} ${width}w`,
    sizes: className === "hero-visual" ? "100vw" : "(max-width: 760px) 100vw, 50vw",
    className,
    alt,
    width,
    height,
    loading
  };
}

function photoUrl(path) {
  return `${path}?v=${PHOTO_VERSION}`;
}

function languageFlag(lang) {
  const flag = lang === "fr" ? "fr" : lang === "ar" ? "ma" : "uk";
  return `<span class="flag-icon flag-icon--${flag}" aria-hidden="true"></span>`;
}

function visualFor(label) {
  const key = label.toLowerCase();
  if (key.includes("roots 01") || key.includes("روتس")) {
    return photo("roots-01-khaki", "product-visual", "Lantso Roots 01 Khaki limited Moroccan jersey front view", 1448, 1086);
  }
  if (key.includes("atlas") || key.includes("أطلس")) {
    return photo("atlas-02-white", "product-visual", "Lantso Atlas 02 White limited Moroccan jersey front view", 1448, 1086);
  }
  if (key.includes("campaign image one")) {
    return photo("1998-1", "campaign-visual", "Morocco and Norway footballers competing during the 1998 World Cup", 1224, 812);
  }
  if (key.includes("campaign image two")) {
    return photo("1998-2", "campaign-visual", "Morocco and Scotland footballers competing during the 1998 World Cup", 1224, 794);
  }
  if (key.includes("campaign image three")) {
    return photo("1998-3", "campaign-visual", "Moustafa Hadji of Morocco in a 1998 World Cup match", 1224, 812);
  }
  if (key.includes("campaign image four")) {
    return photo("1998-4", "campaign-visual", "Morocco national team match moment from the 1998 football era", 2000, 1126);
  }
  if (key.includes("chapter")) {
    return photo("story", "campaign-visual", "Lantso Chapter 01 Roots story visual", 1449, 1085);
  }
  if (key.includes("origin") || key.includes("pencil")) {
    return photo("origin-1", "campaign-visual", "Lantso origin shooting image", 1080, 1350);
  }
  return photo("hero", "hero-visual", "Lantso Moroccan jersey campaign in a Casablanca street", 1672, 941, "eager");
}

function gatePage() {
  return `
    <section class="gate-page">
      <figure class="gate-media" aria-hidden="true">
        <picture>
          <img src="/assets/photos/gate/foot.jpg" alt="" width="6720" height="4480" decoding="async" fetchpriority="high">
        </picture>
      </figure>
      <div class="gate-language" aria-label="Language">
        ${["en", "fr", "ar"]
          .map((lang) => `<button class="lang-button${state.lang === lang ? " is-active" : ""}" type="button" data-gate-lang="${lang}">${languageFlag(lang)}</button>`)
          .join("")}
      </div>
      <div class="gate-content">
        <img class="gate-logo" src="/assets/brand/lantso-text.svg" alt="Lantso">
        <h1 class="script-title">${t("gate.title").replace("\n", "<br>")}</h1>
        <p class="gate-intro">${t("gate.intro")}</p>
        <form class="gate-form" data-access-form>
          <label>
            <span>${t("gate.password")}</span>
            <input name="password" type="password" autocomplete="current-password" required>
          </label>
          <button class="button-primary" type="submit">${t("gate.unlock")}</button>
          <p class="form-message" data-access-message role="status"></p>
        </form>
        <form class="gate-form gate-newsletter" data-gate-newsletter>
          <label>
            <span>${t("gate.email")}</span>
            <input name="email" type="email" inputmode="email" autocomplete="email" maxlength="320" required>
          </label>
          <button class="button-secondary" type="submit">${t("gate.subscribe")}</button>
          <p class="form-message" data-gate-newsletter-message role="status"></p>
        </form>
      </div>
    </section>
  `;
}

function countdownUnit(key, value) {
  return `
    <div class="countdown-unit">
      <strong data-countdown-value="${key}">${String(value).padStart(2, "0")}</strong>
      <span>${t(`gate.${key}`)}</span>
    </div>
  `;
}

function footer() {
  return `
    <footer class="site-footer">
      <div class="footer-mark">
        <img class="mark-symbol" src="/assets/brand/lantso-logo.svg" alt="Lantso">
        <span>${t("footer.rights").replace("\n", "<br>")}</span>
      </div>
      ${footerColumn(t("nav.shop"), [
        [t("nav.allProducts"), "/shop"],
        [t("nav.jerseys"), "/shop"],
        [t("nav.origin"), "/roots"]
      ])}
      ${footerColumn(t("nav.info"), [
        [t("nav.shipping"), "/info#shipping"],
        [t("nav.returns"), "/info#returns"],
        [t("nav.faq"), "/info#faq"]
      ])}
      ${footerColumn(t("nav.legal"), [
        [t("nav.terms"), "/legal#terms"],
        [t("nav.privacy"), "/legal#privacy"],
        [t("nav.contact"), "/legal#contact"]
      ])}
      <div class="footer-col">
        <h3>${t("nav.locked")}</h3>
        <div class="social-row">
          <a href="${SOCIAL_LINKS.instagram}" rel="noreferrer" target="_blank" aria-label="Instagram">INSTAGRAM</a>
        </div>
      </div>
      <div class="payments">
        ${paymentBadges()}
        <em>${t("footer.secure")}</em>
      </div>
    </footer>
  `;
}

function footerColumn(title, links) {
  return `
    <div class="footer-col">
      <h3>${title}</h3>
      ${links.map(([label, href]) => `<a href="${localizedPath(href)}" data-link>${label}</a>`).join("")}
    </div>
  `;
}

function breadcrumb(current) {
  return `
    <div class="breadcrumb">
      <a href="${localizedPath("/")}" data-link>${t("nav.home")}</a>
      <span>›</span>
      <strong>${current}</strong>
    </div>
  `;
}

function homePage() {
  return `
    <section class="hero">
      ${placeholder("Lantso campaign image")}
      <div class="hero-content">
        <h1 class="script-title">${t("hero.title").replace("\n", "<br>")}</h1>
        <a class="button-primary" href="#shirts" data-scroll-link>${t("hero.step")}</a>
      </div>
    </section>
    <section class="split-band">
      <div class="split-copy">
        <p class="eyebrow">${t("hero.chapter")}</p>
        <h2 class="headline">${t("hero.headline").replaceAll("\n", "<br>")}</h2>
        <a class="text-link" href="${localizedPath("/shop")}" data-link>${t("hero.discoverShop")}</a>
      </div>
      ${placeholder("Chapter visual")}
    </section>
    <section class="product-feature-grid" id="shirts">
      ${PRODUCTS.map((product, index) => productFeature(product, index)).join("")}
    </section>
    <section class="mosaic" aria-label="Campaign gallery">
      ${placeholder("Campaign image one")}
      ${placeholder("Campaign image two")}
      ${placeholder("Campaign image three")}
      ${placeholder("Campaign image four")}
    </section>
    ${footer()}
  `;
}

function productFeature(product, index) {
  const productName = product.shortName[state.lang] || product.shortName.en;
  const selected = state.selectedSizes[product.id];
  const soldOut = productIsSoldOut(product);
  const primaryLabel = soldOut ? t("product.soldOut") : index === 1 && state.lang !== "en" ? t("product.access") : t("product.claim");
  return `
    <article class="product-card">
      <a href="${localizedPath(`/product/${product.id}`)}" data-link>${placeholder(productName)}</a>
      <div>
        <h2>${productName}</h2>
        <em>${product.story[state.lang] || product.story.en}</em>
      </div>
      <div class="product-card__meta">
        <span>${formatStoreMoney(product.price, state.shippingCountry)}</span>
        <span>${t("product.limited")}</span>
      </div>
      <div class="size-row" role="group" aria-label="${t("product.size")}">
        ${product.sizes
          .map((size) => {
            const available = stockAvailable(product.id, size);
            const low = available > 0 && available <= 4 ? " is-low" : "";
            const soldOut = available <= 0 ? " is-sold-out" : "";
            return `<button class="size-button${low}${soldOut}" type="button" data-size="${product.id}:${size}" aria-pressed="${selected === size}" ${available <= 0 ? "disabled" : ""}>${size}</button>`;
          })
          .join("")}
      </div>
      <div class="claim-row">
        <button class="button-primary" type="button" data-add="${product.id}" ${soldOut ? "disabled" : ""}>${primaryLabel}</button>
        <button class="plus-button" type="button" data-quick-add="${product.id}" aria-label="${t("product.add")}" ${soldOut ? "disabled" : ""}>+</button>
      </div>
    </article>
  `;
}

function shopPage() {
  return `
    <div class="page-shell">
      ${breadcrumb(t("nav.shop"))}
      <section class="shop-grid">
        ${PRODUCTS.map((product) => shopCard(product)).join("")}
      </section>
      <section class="origin-band">
        ${placeholder("Origin visual")}
        <div class="origin-copy">
          <p class="eyebrow">${t("hero.origin")}</p>
          <h2 class="headline">${t("hero.before").replace("\n", "<br>")}</h2>
          <a class="text-link" href="${localizedPath("/roots")}" data-link>${t("hero.discoverRoots")}</a>
        </div>
      </section>
      ${footer()}
    </div>
  `;
}

function shopCard(product) {
  const productName = product.shortName[state.lang] || product.shortName.en;
  const selected = state.selectedSizes[product.id];
  const soldOut = productIsSoldOut(product);
  return `
    <article class="shop-card">
      <div>
        <h2>${product.chapter}<br>${product.color[state.lang] || product.color.en}</h2>
      </div>
      <a href="${localizedPath(`/product/${product.id}`)}" data-link>${placeholder(productName)}</a>
      <div class="shop-meta">
        <span>${t("product.limited")}</span>
        <span>${formatStoreMoney(product.price, state.shippingCountry)}</span>
      </div>
      <div class="size-row" role="group" aria-label="${t("product.size")}">
        ${product.sizes
          .map((size) => {
            const available = stockAvailable(product.id, size);
            const low = available > 0 && available <= 4 ? " is-low" : "";
            const soldOut = available <= 0 ? " is-sold-out" : "";
            return `<button class="size-button${low}${soldOut}" type="button" data-size="${product.id}:${size}" aria-pressed="${selected === size}" ${available <= 0 ? "disabled" : ""}>${size}</button>`;
          })
          .join("")}
      </div>
      <div class="claim-row">
        <button class="button-primary" type="button" data-add="${product.id}" ${soldOut ? "disabled" : ""}>${soldOut ? t("product.soldOut") : t("product.claim")}</button>
        <button class="plus-button" type="button" data-quick-add="${product.id}" aria-label="${t("product.add")}" ${soldOut ? "disabled" : ""}>+</button>
      </div>
    </article>
  `;
}

function productPage(productId) {
  const product = findProduct(productId) || PRODUCTS[0];
  const productName = product.shortName[state.lang] || product.shortName.en;
  const selected = state.selectedSizes[product.id];
  const shipping = calculateShipping(state.shippingCountry, product.price, 1);
  const soldOut = productIsSoldOut(product);
  return `
    <div class="page-shell">
      ${breadcrumb(productName)}
      <section class="product-detail">
        ${productGallery(product, productName)}
        <article class="product-panel">
          <p class="eyebrow">${product.chapter}</p>
          <h1>${productName}</h1>
          <p>${product.description[state.lang] || product.description.en}</p>
          <div class="detail-list">
            <div><span>${t("product.price")}</span><strong>${formatStoreMoney(product.price, state.shippingCountry)}</strong></div>
            <div><span>${t("product.color")}</span><strong>${product.color[state.lang] || product.color.en}</strong></div>
            <div><span>${t("product.material")}</span><strong>${product.material[state.lang] || product.material.en}</strong></div>
            <div><span>${t("product.measurements")}</span><strong>${sizeGuide(product)}</strong></div>
            <div><span>${t("product.stock")}</span><strong>${stockSummary(product)}</strong></div>
            <div><span>${t("product.shippingEstimate")}</span><strong>${formatStoreMoney(shipping.amount, state.shippingCountry)} · ${shipping.zone.eta[state.lang] || shipping.zone.eta.en}</strong></div>
            <div class="detail-long"><span>${t("product.care")}</span><strong>${product.care[state.lang] || product.care.en}</strong></div>
          </div>
          <div class="size-row" role="group" aria-label="${t("product.size")}">
            ${product.sizes
              .map((size) => {
                const available = stockAvailable(product.id, size);
                const soldOut = available <= 0 ? " is-sold-out" : "";
                return `<button class="size-button${soldOut}" type="button" data-size="${product.id}:${size}" aria-pressed="${selected === size}" ${available <= 0 ? "disabled" : ""}>${size}</button>`;
              })
              .join("")}
          </div>
          <div class="claim-row">
            <button class="button-primary" type="button" data-add="${product.id}" ${soldOut ? "disabled" : ""}>${soldOut ? t("product.soldOut") : t("product.add")}</button>
            <button class="plus-button" type="button" data-quick-add="${product.id}" aria-label="${t("product.add")}" ${soldOut ? "disabled" : ""}>+</button>
          </div>
        </article>
      </section>
      ${footer()}
    </div>
  `;
}

function infoPage() {
  return `
    <div class="page-shell">
      ${breadcrumb(t("nav.info"))}
      <section class="info-layout">
        <article class="info-section" id="shipping">
          <h1>${t("nav.shipping")}</h1>
          <div class="prose">
            <p>${t("info.shippingBody")}</p>
            ${shippingCalculator()}
          </div>
        </article>
        <article class="info-section" id="returns">
          <h2>${t("nav.returns")}</h2>
          <div class="prose"><p>${t("info.returnsBody")}</p></div>
        </article>
        <article class="info-section" id="faq">
          <h2>${t("info.faqTitle")}</h2>
          <div class="faq-list">
            ${faq(t("info.q1"), t("info.a1"))}
            ${faq(t("info.q2"), t("info.a2"))}
            ${faq(t("info.q3"), t("info.a3"))}
            ${faq(t("info.q4"), t("info.a4"))}
          </div>
        </article>
      </section>
      ${footer()}
    </div>
  `;
}

function shippingCalculator() {
  return `
    <form class="calculator" data-calculator>
      <label>
        <span>${t("cart.country")}</span>
        <select name="country">
          ${countryOptions(state.shippingCountry)}
        </select>
      </label>
      <label>
        <span>${t("cart.postal")}</span>
        <input name="postal" autocomplete="postal-code" list="shipping-postal-options">
        <datalist id="shipping-postal-options">${postalOptions(state.shippingCountry)}</datalist>
      </label>
      <button class="button-secondary" type="submit">${t("product.shippingEstimate")}</button>
      <p class="calc-result" data-calc-result></p>
    </form>
  `;
}

function faq(question, answer) {
  return `
    <details>
      <summary>${question}</summary>
      <div class="prose"><p>${answer}</p></div>
    </details>
  `;
}

function legalPage() {
  return `
    <div class="page-shell">
      ${breadcrumb(t("nav.legal"))}
      <section class="legal-layout">
        <article class="legal-section" id="terms">
          <h1>${t("nav.terms")}</h1>
          <div class="prose"><p>${t("legal.termsBody")}</p></div>
        </article>
        <article class="legal-section" id="privacy">
          <h2>${t("nav.privacy")}</h2>
          <div class="prose"><p>${t("legal.privacyBody")}</p></div>
        </article>
        <article class="legal-section" id="contact">
          <h2>${t("nav.contact")}</h2>
          <div class="prose">
            <p>${t("legal.contactBody")}</p>
            <form class="contact-form" data-contact-form>
              <label><span>${t("legal.name")}</span><input name="name" autocomplete="name" required></label>
              <label><span>${t("legal.email")}</span><input name="email" type="email" inputmode="email" autocomplete="email" maxlength="320" required></label>
              <label><span>${t("legal.message")}</span><textarea name="message" required></textarea></label>
              <button class="button-secondary" type="submit">${t("legal.send")}</button>
              <p class="form-message" data-contact-message role="status"></p>
            </form>
          </div>
        </article>
      </section>
      ${footer()}
    </div>
  `;
}

function rootsPage() {
  const paragraphs = normalizeParagraphs(t("roots.body"));
  return `
    <div class="page-shell">
      ${breadcrumb(t("hero.discoverRoots"))}
      <section class="roots-layout">
        <article class="roots-story">
          <div class="roots-copy roots-copy--intro">
            <h1>${t("roots.title").replace("\n", "<br>")}</h1>
            <div class="prose">${paragraphsHtml(paragraphs.slice(0, 5))}</div>
          </div>
          <div class="roots-image roots-image--right">
            ${visualFrame(photo("origin-1", "campaign-visual", "Lantso origin shooting portrait", 1080, 1350), "Origin image one")}
          </div>
          <div class="roots-image roots-image--left">
            ${visualFrame(photo("origin-2", "campaign-visual", "Lantso origin shooting detail", 1080, 1350), "Origin image two")}
          </div>
          <div class="roots-copy roots-copy--rest">
            <div class="prose">${paragraphsHtml(paragraphs.slice(5))}</div>
          </div>
        </article>
      </section>
      ${footer()}
    </div>
  `;
}

function normalizeParagraphs(value) {
  return Array.isArray(value) ? value : [value];
}

function paragraphsHtml(paragraphs) {
  return paragraphs.map((body) => `<p>${escapeHtml(body)}</p>`).join("");
}

function archivesPage() {
  return `
    <div class="page-shell">
      ${breadcrumb(t("nav.archives"))}
      <section class="archive-page">
        <div class="archive-head">
          <h1>${t("archives.title")}</h1>
          <p>${t("archives.intro")}</p>
        </div>
        <div class="archive-grid">
          ${ARCHIVE_ITEMS.map((item, index) => archiveCard(item, index)).join("")}
        </div>
        <section class="acknowledgments">
          <h2>${t("archives.acknowledgments")}</h2>
          <ul>
            ${ACKNOWLEDGMENTS.map((name) => `<li>${escapeHtml(name)}</li>`).join("")}
          </ul>
        </section>
      </section>
      ${archiveDialog()}
      ${footer()}
    </div>
  `;
}

function archiveCard(item, index) {
  const label = `${item.date} - ${item.title}`;
  return `
    <article class="archive-card">
      <button class="archive-thumb" type="button" data-archive-open="${index}" aria-label="${escapeHtml(label)}"></button>
      <p>${escapeHtml(label)}</p>
    </article>
  `;
}

function archiveDialog() {
  return `
    <dialog class="archive-modal" data-archive-modal>
      <button class="modal-close" type="button" data-archive-close aria-label="${t("archives.close")}">×</button>
      <div class="archive-modal-visual" aria-hidden="true"></div>
      <p data-archive-caption></p>
    </dialog>
  `;
}

function checkoutConfirmation() {
  const params = new URLSearchParams(window.location.search);
  const sessionId = params.get("session_id") || "";
  let stored = {};
  try {
    stored = JSON.parse(localStorage.getItem("lantso:lastCheckout") || "{}");
  } catch {
    stored = {};
  }
  const matchedStoredCheckout = Boolean(sessionId && stored.sessionId === sessionId);
  const orderRef = matchedStoredCheckout || !sessionId ? stored.orderRef : "";
  return {
    sessionId,
    matchedStoredCheckout,
    orderRef: orderRef || sessionId.slice(-10).toUpperCase()
  };
}

function noticePage(kind) {
  const isSuccess = kind === "success";
  const confirmation = isSuccess ? checkoutConfirmation() : null;
  if (isSuccess) completeStoredCheckout(confirmation);
  return `
    <div class="page-shell">
      <section class="notice-page">
        <div class="notice-box">
          <h1>${isSuccess ? t("checkout.successTitle") : t("checkout.cancelTitle")}</h1>
          <p>${isSuccess ? t("checkout.successBody") : t("checkout.cancelBody")}</p>
          ${
            isSuccess
              ? `<div class="notice-details">
                  <div><span>${t("checkout.successReference")}</span><strong>${escapeHtml(confirmation.orderRef || "")}</strong></div>
                  <div><span>${t("checkout.successTracking")}</span><strong>${t("checkout.successTrackingPending")}</strong></div>
                  <p>${t("checkout.successEmail")}</p>
                </div>`
              : ""
          }
          <a class="button-primary" href="${localizedPath("/shop")}" data-link>${t("checkout.back")}</a>
        </div>
      </section>
      ${footer()}
    </div>
  `;
}

function completeStoredCheckout(confirmation) {
  if (!confirmation?.matchedStoredCheckout || !confirmation.sessionId) return;
  if (localStorage.getItem("lantso:completedCheckout") === confirmation.sessionId) return;
  state.cart = [];
  saveCart();
  localStorage.setItem("lantso:completedCheckout", confirmation.sessionId);
}

function render(options = {}) {
  const shouldScroll = options.scroll !== false;
  if (state.locked) {
    updateSeo(route());
    document.body.classList.add("is-gated");
    document.querySelector(".site-header").hidden = true;
    renderMarkup(app, `<div class="page">${gatePage()}</div>`);
    bindGateEvents();
    if (shouldScroll) window.scrollTo({ top: 0, behavior: "instant" });
    return;
  }

  stopCountdown();
  document.body.classList.remove("is-gated");
  document.querySelector(".site-header").hidden = false;
  const current = route();
  document.querySelector(".site-header").dataset.floating = current.name === "home";
  updateSeo(current);
  if (current.name === "home") renderMarkup(app, `<div class="page">${homePage()}</div>`);
  if (current.name === "shop") renderMarkup(app, `<div class="page">${shopPage()}</div>`);
  if (current.name === "product") renderMarkup(app, `<div class="page">${productPage(current.id)}</div>`);
  if (current.name === "info") renderMarkup(app, `<div class="page">${infoPage()}</div>`);
  if (current.name === "legal") renderMarkup(app, `<div class="page">${legalPage()}</div>`);
  if (current.name === "roots") renderMarkup(app, `<div class="page">${rootsPage()}</div>`);
  if (current.name === "archives") renderMarkup(app, `<div class="page">${archivesPage()}</div>`);
  if (current.name === "success") renderMarkup(app, `<div class="page">${noticePage("success")}</div>`);
  if (current.name === "cancel") renderMarkup(app, `<div class="page">${noticePage("cancel")}</div>`);
  bindPageEvents();
  renderCart();
  if (shouldScroll) window.scrollTo({ top: 0, behavior: "instant" });
  updateHeaderChrome();
}

function bindGateEvents() {
  app.querySelectorAll("[data-gate-lang]").forEach((button) => {
    button.addEventListener("click", () => setLanguage(button.dataset.gateLang, { updateUrl: true }));
  });

  const accessForm = app.querySelector("[data-access-form]");
  accessForm?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const message = accessForm.querySelector("[data-access-message]");
    const password = new FormData(accessForm).get("password");
    message.textContent = t("form.processing");
    setFormPending(accessForm, true);
    const unlocked = await verifyAccess(password);
    setFormPending(accessForm, false);
    if (!unlocked) {
      message.textContent = t("gate.invalid");
      return;
    }
    localStorage.setItem("lantso:access", "granted");
    state.locked = false;
    render();
  });

  const newsletterForm = app.querySelector("[data-gate-newsletter]");
  newsletterForm?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const message = newsletterForm.querySelector("[data-gate-newsletter-message]");
    const email = normalizeEmailField(newsletterForm, message);
    if (!email) return;
    message.textContent = t("form.processing");
    setFormPending(newsletterForm, true);
    const response = await submitForm("club", {
      name: "Launch list",
      email,
      newsletter: "yes",
      source: "gate-newsletter"
    });
    setFormPending(newsletterForm, false);
    message.textContent = response.ok ? t("gate.subscribed") : t("club.error");
    if (response.ok) newsletterForm.reset();
  });
}

function bindPageEvents() {
  app.querySelectorAll("[data-link]").forEach((link) => {
    link.addEventListener("click", (event) => {
      const href = link.getAttribute("href");
      if (!href || href.startsWith("http") || href.startsWith("#")) return;
      event.preventDefault();
      navigate(href);
    });
  });

  app.querySelectorAll("[data-scroll-link]").forEach((link) => {
    link.addEventListener("click", (event) => {
      const target = document.querySelector(link.getAttribute("href"));
      if (!target) return;
      event.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });

  app.querySelectorAll("[data-size]").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.preventDefault();
      const [productId, size] = button.dataset.size.split(":");
      state.selectedSizes[productId] = size;
      updateSizeButtons(productId, size);
    });
  });

  app.querySelectorAll("[data-gallery-thumb]").forEach((button) => {
    button.addEventListener("click", () => {
      const [productId, index] = button.dataset.galleryThumb.split(":");
      setGallerySlide(productId, Number(index));
    });
  });

  app.querySelectorAll("[data-gallery-step]").forEach((button) => {
    button.addEventListener("click", () => {
      const [productId, direction] = button.dataset.galleryStep.split(":");
      stepGallerySlide(productId, Number(direction));
    });
  });

  app.querySelectorAll("[data-add], [data-quick-add]").forEach((button) => {
    button.addEventListener("click", () => {
      const productId = button.dataset.add || button.dataset.quickAdd;
      addToCart(productId, state.selectedSizes[productId], 1, Boolean(button.dataset.add));
    });
  });

  const calculator = app.querySelector("[data-calculator]");
  if (calculator) {
    const countrySelect = calculator.querySelector("select[name='country']");
    const postalInput = calculator.querySelector("input[name='postal']");
    const postalList = calculator.querySelector("#shipping-postal-options");
    const syncPostalOptions = () => {
      if (postalList) postalList.innerHTML = postalOptions(countrySelect.value, postalInput.value);
    };
    countrySelect?.addEventListener("change", syncPostalOptions);
    postalInput?.addEventListener("input", syncPostalOptions);
    calculator.addEventListener("submit", (event) => {
      event.preventDefault();
      const data = new FormData(calculator);
      state.shippingCountry = data.get("country");
      state.postalCode = String(data.get("postal") || "").trim();
      localStorage.setItem("lantso:shippingCountry", state.shippingCountry);
      localStorage.setItem("lantso:postalCode", state.postalCode);
      const result = calculateShipping(state.shippingCountry, subtotal() || PRODUCTS[0].price, cartQuantity() || 1);
      calculator.querySelector("[data-calc-result]").textContent = `${result.zone.label[state.lang] || result.zone.label.en}: ${formatStoreMoney(result.amount, state.shippingCountry)} · ${result.zone.eta[state.lang] || result.zone.eta.en}`;
      renderCart();
    });
  }

  const archiveModal = app.querySelector("[data-archive-modal]");
  if (archiveModal) {
    const caption = archiveModal.querySelector("[data-archive-caption]");
    app.querySelectorAll("[data-archive-open]").forEach((button) => {
      button.addEventListener("click", () => {
        const item = ARCHIVE_ITEMS[Number(button.dataset.archiveOpen)];
        caption.textContent = item ? `${item.date} - ${item.title}` : "";
        archiveModal.showModal();
        document.body.classList.add("modal-open");
      });
    });
    archiveModal.querySelector("[data-archive-close]")?.addEventListener("click", () => archiveModal.close());
    archiveModal.addEventListener("click", (event) => {
      if (event.target === archiveModal) archiveModal.close();
    });
    archiveModal.addEventListener("close", () => document.body.classList.remove("modal-open"));
  }

  const contactForm = app.querySelector("[data-contact-form]");
  if (contactForm) {
    contactForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const message = contactForm.querySelector("[data-contact-message]");
      const payload = Object.fromEntries(new FormData(contactForm));
      const email = normalizeEmailField(contactForm, message);
      if (!email) return;
      payload.email = email;
      payload.source = "contact-page";
      message.textContent = t("form.processing");
      setFormPending(contactForm, true);
      const response = await submitForm("contact", payload);
      setFormPending(contactForm, false);
      message.textContent = response.ok ? t("legal.sent") : t("club.error");
      if (response.ok) contactForm.reset();
    });
  }
}

function setFormPending(form, pending) {
  form.toggleAttribute("aria-busy", pending);
  form.querySelectorAll("button, input, select, textarea").forEach((control) => {
    control.disabled = pending;
  });
}

function renderCart() {
  const quantity = cartQuantity();
  cartCount.textContent = quantity;
  updateHeaderChrome();
  const lines = lineItems();
  if (!lines.length) {
    renderMarkup(cartBody, `
      <div class="cart-empty">
        <span class="bag-icon" aria-hidden="true"></span>
        <p>${t("cart.empty")}</p>
        <button class="button-ghost" type="button" data-close-cart>${t("cart.continue")}</button>
      </div>
    `);
    cartBody.querySelector("[data-close-cart]").addEventListener("click", closeCart);
    return;
  }

  const sub = subtotal();
  const shipping = calculateShipping(state.shippingCountry, sub, cartQuantity());
  const displaySub = lines.reduce((sum, line) => sum + storeMoneyAmount(line.unitAmount) * line.quantity, 0);
  const displayShipping = storeMoneyAmount(shipping.amount);
  const displayTotal = displaySub + displayShipping;
  const shippingLabel = `${t("cart.shipping")} · ${countryName(state.shippingCountry)}`;
  const estimate = shipping.zone.eta[state.lang] || shipping.zone.eta.en;
  renderMarkup(cartBody, `
    <div class="cart-items">
      ${lines.map((line) => cartItem(line)).join("")}
    </div>
    <div class="cart-summary">
      <label>
        <span>${t("cart.country")}</span>
        <select data-cart-country>${countryOptions(state.shippingCountry)}</select>
      </label>
      <label>
        <span>${t("cart.postal")}</span>
        <input data-cart-postal autocomplete="postal-code" list="cart-postal-options" value="${escapeHtml(state.postalCode)}">
        <datalist id="cart-postal-options">${postalOptions(state.shippingCountry, state.postalCode)}</datalist>
      </label>
      <div class="summary-line"><span>${t("cart.subtotal")}</span><strong>${formatStoreCurrencyAmount(displaySub)}</strong></div>
      <div class="summary-line"><span>${shippingLabel}</span><strong>${shipping.amount === 0 ? t("cart.free") : formatStoreCurrencyAmount(displayShipping)}</strong></div>
      <div class="summary-line"><span>${t("cart.estimate")}</span><strong>${estimate}</strong></div>
      <div class="summary-line summary-total"><span>${t("cart.total")}</span><strong>${formatStoreCurrencyAmount(displayTotal)}</strong></div>
      <button class="button-primary" type="button" data-checkout ${state.checkoutPending ? "disabled" : ""}>${state.checkoutPending ? t("cart.processing") : t("cart.checkout")}</button>
      <p class="checkout-message" data-checkout-message role="status"></p>
    </div>
  `);

  cartBody.querySelectorAll("[data-qty]").forEach((button) => {
    button.addEventListener("click", () => {
      const [productId, size, delta] = button.dataset.qty.split(":");
      updateQuantity(productId, size, Number(delta));
    });
  });
  cartBody.querySelectorAll("[data-remove]").forEach((button) => {
    button.addEventListener("click", () => {
      const [productId, size] = button.dataset.remove.split(":");
      removeItem(productId, size);
    });
  });
  cartBody.querySelector("[data-cart-country]").addEventListener("change", (event) => {
    state.shippingCountry = event.target.value;
    state.postalCode = "";
    localStorage.setItem("lantso:shippingCountry", state.shippingCountry);
    localStorage.removeItem("lantso:postalCode");
    render({ scroll: false });
  });
  const postalInput = cartBody.querySelector("[data-cart-postal]");
  const postalList = cartBody.querySelector("#cart-postal-options");
  postalInput?.addEventListener("input", () => {
    state.postalCode = postalInput.value.trim();
    if (state.postalCode) {
      localStorage.setItem("lantso:postalCode", state.postalCode);
    } else {
      localStorage.removeItem("lantso:postalCode");
    }
    if (postalList) postalList.innerHTML = postalOptions(state.shippingCountry, state.postalCode);
  });
  cartBody.querySelector("[data-checkout]").addEventListener("click", () => checkout());
}

function cartItem(line) {
  const productName = line.product.shortName[state.lang] || line.product.shortName.en;
  const canIncrease = line.quantity < stockAvailable(line.productId, line.size);
  return `
    <article class="cart-item">
      ${placeholder(productName)}
      <div>
        <h3>${productName}</h3>
        <p>${t("product.size")}: ${line.size}</p>
        <p>${formatStoreMoney(line.unitAmount)}</p>
        <div class="qty-row">
          <button type="button" data-qty="${line.productId}:${line.size}:-1" aria-label="-">-</button>
          <span>${t("cart.qty")} ${line.quantity}</span>
          <button type="button" data-qty="${line.productId}:${line.size}:1" aria-label="+" ${canIncrease ? "" : "disabled"}>+</button>
          <button type="button" data-remove="${line.productId}:${line.size}">${t("cart.remove")}</button>
        </div>
      </div>
    </article>
  `;
}

function countryOptions(selected) {
  return DELIVERY_COUNTRIES.map(({ code, name }) => {
    const label = `${code} · ${name}`;
    return `<option value="${code}" ${code === selected ? "selected" : ""}>${escapeHtml(label)}</option>`;
  }).join("");
}

function countryName(code) {
  return COUNTRY_NAMES[code] || code;
}

function postalOptions(countryCode, query = "") {
  const samples = POSTAL_CODE_SAMPLES[countryCode] || [];
  const normalizedQuery = normalizePostal(query);
  return samples
    .filter(([code]) => !normalizedQuery || normalizePostal(code).startsWith(normalizedQuery))
    .slice(0, 12)
    .map(([code, city]) => `<option value="${escapeHtml(code)}" label="${escapeHtml(city)}"></option>`)
    .join("");
}

function normalizePostal(value) {
  return String(value || "").toUpperCase().replace(/[^A-Z0-9]/g, "");
}

function updateSizeButtons(productId, selectedSize) {
  app.querySelectorAll("[data-size]").forEach((button) => {
    const [buttonProductId, buttonSize] = button.dataset.size.split(":");
    if (buttonProductId === productId) {
      button.setAttribute("aria-pressed", String(buttonSize === selectedSize));
    }
  });
}

function stepGallerySlide(productId, direction) {
  const slides = [...app.querySelectorAll(`[data-gallery-slide^="${productId}:"]`)];
  const current = slides.findIndex((slide) => !slide.hidden);
  const next = (current + direction + slides.length) % slides.length;
  setGallerySlide(productId, next);
}

function setGallerySlide(productId, index) {
  app.querySelectorAll(`[data-gallery-slide^="${productId}:"]`).forEach((slide) => {
    const slideIndex = Number(slide.dataset.gallerySlide.split(":").at(-1));
    slide.hidden = slideIndex !== index;
  });
  app.querySelectorAll(`[data-gallery-thumb^="${productId}:"]`).forEach((button) => {
    const thumbIndex = Number(button.dataset.galleryThumb.split(":").at(-1));
    button.setAttribute("aria-pressed", String(thumbIndex === index));
  });
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

function setStructuredData(graph) {
  let script = document.querySelector("#structured-data");
  if (!script) {
    script = document.createElement("script");
    script.id = "structured-data";
    script.type = "application/ld+json";
    document.head.append(script);
  }
  script.textContent = JSON.stringify({ "@context": "https://schema.org", "@graph": graph });
}

function productSchema(product) {
  const shipping = calculateShipping("FR", product.price, 1);
  return {
    "@type": "Product",
    "@id": absoluteUrl(`${localizedPath(`/product/${product.id}`)}#product`),
    name: product.name[state.lang] || product.name.en,
    description: product.description[state.lang] || product.description.en,
    image: [absoluteUrl(`/assets/photos/fallback/${product.id}.jpg`)],
    sku: product.sku,
    brand: { "@type": "Brand", name: "Lantso" },
    material: product.material[state.lang] || product.material.en,
    size: product.sizes.join(", "),
    offers: {
      "@type": "Offer",
      url: absoluteUrl(localizedPath(`/product/${product.id}`)),
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
          businessDays: { "@type": "QuantitativeValue", minValue: 3, maxValue: 3 }
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

function collectionSchema() {
  return {
    "@type": "ItemList",
    "@id": absoluteUrl(`${localizedPath("/shop")}#products`),
    name: "Lantso limited Moroccan jerseys",
    itemListElement: PRODUCTS.map((product, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: absoluteUrl(localizedPath(`/product/${product.id}`)),
      item: productSchema(product)
    }))
  };
}

function organizationSchema() {
  return {
    "@type": "Organization",
    "@id": absoluteUrl("/#organization"),
    name: "Lantso",
    url: absoluteUrl("/"),
    logo: absoluteUrl("/assets/icons/lantso-icon-512.png"),
    description: "Limited Moroccan football jerseys: Roots 01 Khaki and Atlas 02 White.",
    email: "contact@lantso.com",
    sameAs: [SOCIAL_LINKS.instagram]
  };
}

function webSiteSchema() {
  return {
    "@type": "WebSite",
    "@id": absoluteUrl("/#website"),
    name: "Lantso",
    url: absoluteUrl("/"),
    inLanguage: LANGS
  };
}

function breadcrumbSchema(current = route()) {
  const meta = pageMeta(current);
  const items = [
    { "@type": "ListItem", position: 1, name: t("nav.home"), item: absoluteUrl(localizedPath("/")) }
  ];
  if (meta.path !== "/") {
    items.push({ "@type": "ListItem", position: 2, name: meta.title.replace(" | Lantso", ""), item: absoluteUrl(localizedPath(meta.path)) });
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
      { "@type": "Question", name: t("info.q1"), acceptedAnswer: { "@type": "Answer", text: t("info.a1") } },
      { "@type": "Question", name: t("info.q2"), acceptedAnswer: { "@type": "Answer", text: t("info.a2") } },
      { "@type": "Question", name: t("info.q3"), acceptedAnswer: { "@type": "Answer", text: t("info.a3") } },
      { "@type": "Question", name: t("info.q4"), acceptedAnswer: { "@type": "Answer", text: t("info.a4") } }
    ]
  };
}

async function checkout(preferredMethod = "") {
  if (state.checkoutPending) return;
  state.checkoutPending = true;
  renderCart();
  const message = cartBody.querySelector("[data-checkout-message]");
  if (message) message.textContent = t("cart.processing");
  const payload = {
    items: state.cart,
    shippingCountry: state.shippingCountry,
    postalCode: state.postalCode,
    language: state.lang,
    preferredMethod,
    idempotencyKey: globalThis.crypto?.randomUUID ? crypto.randomUUID() : `checkout-${Date.now()}-${Math.random().toString(36).slice(2)}`
  };
  const response = await postJson("/api/create-checkout-session", payload);
  if (response.ok && response.data.url) {
    rememberCheckout(response.data);
    prepareForCheckoutRedirect();
    window.location.assign(response.data.url);
    return;
  }
  state.checkoutPending = false;
  if (response.status === 409) refreshInventory();
  renderCart();
  const errorMessage = cartBody.querySelector("[data-checkout-message]");
  if (errorMessage) errorMessage.textContent = response.status === 0 || response.status === 503 ? t("cart.checkoutError") : response.data?.message || t("cart.checkoutError");
}

function prepareForCheckoutRedirect() {
  closeCart({ fromHistory: true, restoreFocus: false });
  if (history.state?.cartOpen) {
    history.replaceState({ ...(history.state || {}), cartOpen: false }, "", window.location.href);
  }
}

function rememberCheckout(data = {}) {
  localStorage.setItem(
    "lantso:lastCheckout",
    JSON.stringify({
      sessionId: data.id || "",
      orderRef: data.orderRef || "",
      createdAt: new Date().toISOString()
    })
  );
}

async function postJson(url, payload) {
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const data = await response.json().catch(() => ({}));
    return { ok: response.ok, status: response.status, data };
  } catch (error) {
    return { ok: false, status: 0, data: { message: error.message } };
  }
}

function normalizeEmailField(form, message) {
  const input = form.querySelector("input[name='email']");
  const email = String(input?.value || "").trim().toLowerCase();
  input?.setCustomValidity("");
  if (!isValidEmail(email)) {
    const error = t("form.emailInvalid");
    if (message) message.textContent = error;
    input?.setCustomValidity(error);
    input?.reportValidity?.();
    input?.addEventListener("input", () => input.setCustomValidity(""), { once: true });
    return "";
  }
  return email;
}

function isValidEmail(value) {
  const email = String(value || "").trim();
  return email.length > 0 && email.length <= 320 && EMAIL_PATTERN.test(email);
}

async function refreshInventory() {
  try {
    const response = await fetch("/api/inventory", {
      headers: { Accept: "application/json" },
      cache: "no-store"
    });
    if (!response.ok) return;
    state.inventory = await response.json();
    for (const product of PRODUCTS) {
      const selected = state.selectedSizes[product.id];
      if (stockAvailable(product.id, selected) <= 0) {
        state.selectedSizes[product.id] = product.sizes.find((size) => stockAvailable(product.id, size) > 0) || selected;
      }
    }
    render({ scroll: false });
    renderCart();
  } catch {
  }
}

async function submitForm(name, payload) {
  const endpoint = name === "contact" ? "/api/contact" : "/api/club";
  const apiResponse = await postJson(endpoint, payload);
  const formResponse = await submitNetlifyForm(name, payload);
  if (apiResponse.ok) return apiResponse;
  if (formResponse.ok) return formResponse;
  return apiResponse;
}

async function submitNetlifyForm(name, payload) {
  const body = new URLSearchParams({ "form-name": name, "bot-field": "", ...payload }).toString();
  try {
    const response = await fetch("/", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body
    });
    if (response.ok) return { ok: true, data: {} };
  } catch {
  }
  return { ok: false, status: 0, data: {} };
}

async function verifyAccess(password) {
  const response = await postJson("/api/access", { password });
  if (response.ok && response.data?.ok) return true;
  return false;
}

function countdownParts() {
  const diff = Math.max(0, LAUNCH_DATE.getTime() - Date.now());
  const seconds = Math.floor(diff / 1000);
  return {
    days: Math.floor(seconds / 86400),
    hours: Math.floor((seconds % 86400) / 3600),
    minutes: Math.floor((seconds % 3600) / 60),
    seconds: seconds % 60
  };
}

function startCountdown() {
  stopCountdown();
  updateCountdown();
  countdownTimer = window.setInterval(updateCountdown, 1000);
}

function stopCountdown() {
  if (countdownTimer) {
    window.clearInterval(countdownTimer);
    countdownTimer = undefined;
  }
}

function updateCountdown() {
  const parts = countdownParts();
  Object.entries(parts).forEach(([key, value]) => {
    app.querySelectorAll(`[data-countdown-value="${key}"]`).forEach((node) => {
      node.textContent = String(value).padStart(2, "0");
    });
  });
}

function renderMarkup(target, markup) {
  target.replaceChildren(safeFragment(markup));
}

function safeFragment(markup) {
  const parsed = new DOMParser().parseFromString(`<body>${markup}</body>`, "text/html");
  parsed.body.querySelectorAll("script:not([type='application/ld+json']), iframe, object, embed").forEach((node) => node.remove());
  parsed.body.querySelectorAll("*").forEach((node) => {
    [...node.attributes].forEach((attribute) => {
      const name = attribute.name.toLowerCase();
      const value = attribute.value.trim().toLowerCase();
      if (
        name === "style" ||
        name.startsWith("on") ||
        ((name === "href" || name === "src" || name === "srcset" || name === "xlink:href") && value.startsWith("javascript:"))
      ) {
        node.removeAttribute(attribute.name);
      }
    });
  });
  const fragment = document.createDocumentFragment();
  fragment.append(...parsed.body.childNodes);
  return fragment;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

document.querySelectorAll("[data-lang]").forEach((button) => {
  button.addEventListener("click", () => setLanguage(button.dataset.lang, { updateUrl: true }));
});

document.querySelector("[data-open-cart]").addEventListener("click", openCart);
document.querySelector("[data-close-cart]").addEventListener("click", closeCart);
drawer.addEventListener("click", (event) => {
  if (event.target === drawer) closeCart();
});

document.querySelector("[data-open-club]").addEventListener("click", () => {
  clubModal.showModal();
  document.body.classList.add("modal-open");
});

document.querySelector("[data-close-club]").addEventListener("click", () => {
  clubModal.close();
});

clubModal.addEventListener("close", () => {
  document.body.classList.remove("modal-open");
});

document.querySelector("[data-club-form]").addEventListener("submit", async (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const message = form.querySelector("[data-club-message]");
  const payload = Object.fromEntries(new FormData(form));
  const email = normalizeEmailField(form, message);
  if (!email) return;
  payload.email = email;
  payload.newsletter = "yes";
  payload.source = "club-modal";
  message.textContent = t("form.processing");
  setFormPending(form, true);
  const response = await submitForm("club", payload);
  setFormPending(form, false);
  message.textContent = response.ok ? t("club.success") : response.data?.message || t("club.error");
  if (response.ok) form.reset();
});

document.querySelector("[data-accept-cookie]")?.addEventListener("click", () => {
  localStorage.setItem("lantso:cookie", "accepted");
  updateCookieNotice();
});

window.addEventListener("popstate", (event) => {
  if (event.state?.cartOpen) {
    openCart({ pushHistory: false, restoreFocus: false });
    return;
  }
  closeCart({ fromHistory: true, restoreFocus: false });
  render();
});
window.addEventListener("scroll", updateHeaderScrollState, { passive: true });
window.addEventListener("resize", updateHeaderChrome);
document.fonts?.ready?.then(updateHeaderChrome).catch(() => {});
setLanguage(state.lang);
refreshInventory();
