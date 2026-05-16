import {
  CHECKOUT_ALLOWED_COUNTRIES,
  FREE_SHIPPING_THRESHOLD,
  PRODUCTS,
  SHIPPING_ZONES,
  calculateShipping,
  findProduct,
  formatMoney
} from "./catalog.mjs";

const I18N = {
  en: {
    nav: {
      home: "Home",
      shop: "Shop",
      allProducts: "All products",
      jerseys: "Jerseys",
      info: "Info",
      shipping: "Shipping",
      returns: "Returns",
      faq: "FAQ",
      legal: "Legal",
      terms: "Terms & conditions",
      privacy: "Privacy policy",
      contact: "Contact",
      locked: "Stay locked in"
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
      paypal: "Pay with",
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
      checkoutError: "Checkout is not configured yet. Add Stripe keys in .env before taking live orders.",
      estimate: "Estimated delivery"
    },
    info: {
      title: "Information",
      shippingBody: "Orders ship from Europe with tracked delivery. France, the European Union, the United Kingdom, Morocco, and selected international destinations are enabled in checkout.",
      returnsBody: "Returns are accepted within 14 days after delivery when pieces are unworn, unwashed, and returned with their original packaging. Limited drops cannot be exchanged once a size sells out.",
      faqTitle: "FAQ",
      q1: "When will the jerseys release?",
      a1: "The store is prepared for the 2026 World Cup drop. Exact release dates can be updated in the catalog copy.",
      q2: "Can I order outside Europe?",
      a2: "Yes, selected international countries are enabled. More countries can be added from the shipping config.",
      q3: "How do I know my size?",
      a3: "The final size guide should be added after the sample measurements from the shooting."
    },
    legal: {
      title: "Legal & contact",
      termsBody: "Lantso sells limited edition jerseys in EUR. An order is confirmed only after successful payment through Stripe Checkout. Delivery is prepared manually after payment and sent with tracked home delivery. For support, contact contact@lantso.com.",
      privacyBody: "Customer details are used for checkout, delivery, support, fraud prevention, and optional newsletter access. Payment data is handled by Stripe and is not stored by this website.",
      contactBody: "For order support, sizing, press, or wholesale requests, use the form below or write to contact@lantso.com.",
      name: "Name",
      email: "Email",
      message: "Message",
      send: "Send",
      sent: "Message saved. Connect email delivery before launch."
    },
    roots: {
      title: "Before the design,\nthere was a story",
      body: "This page is reserved for the Lantso story, pencil sketches, and the path from the roots to the world. The structure is ready so final writing and artwork can be added without changing the storefront."
    },
    club: {
      title: "Join the club",
      name: "Name",
      email: "Email",
      newsletter: "Newsletter and early access",
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
    checkout: {
      successTitle: "Order received",
      successBody: "Payment is complete. A confirmation page can be expanded with order tracking once the fulfillment workflow is connected.",
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
      info: "Info",
      shipping: "Livraison",
      returns: "Retours",
      faq: "FAQ",
      legal: "Legal",
      terms: "Conditions generales",
      privacy: "Confidentialite",
      contact: "Contact",
      locked: "Stay locked in"
    },
    hero: {
      title: "From the Roots\nto the World",
      step: "Entrer",
      chapter: "Chapitre 01 - Roots",
      headline: "Deux pieces\nun heritage\nreimagine",
      discoverShop: "Decouvrir la boutique",
      origin: "Origine",
      before: "Avant le design,\nil y avait une histoire",
      discoverRoots: "Decouvrir les roots"
    },
    product: {
      limited: "Pieces limitees",
      claim: "Claim piece",
      access: "Acceder au maillot",
      paypal: "Pay with",
      size: "Taille",
      price: "Prix",
      color: "Couleur",
      add: "Ajouter au panier",
      checkout: "Paiement",
      description: "Description",
      material: "Matiere",
      care: "Entretien",
      measurements: "Mesures",
      selectSize: "Choisir une taille",
      added: "Ajoute au panier.",
      shippingEstimate: "Estimation livraison",
      stock: "Serie limitee"
    },
    cart: {
      title: "Chariot",
      empty: "Votre panier est vide.",
      continue: "Continuer la navigation",
      country: "Pays de livraison",
      postal: "Code postal",
      subtotal: "Sous-total",
      shipping: "Livraison",
      total: "Total",
      free: "Offerte",
      remove: "Retirer",
      qty: "Qte",
      checkout: "Paiement securise",
      checkoutError: "Le paiement n'est pas encore configure. Ajoute les cles Stripe dans .env avant les commandes live.",
      estimate: "Livraison estimee"
    },
    info: {
      title: "Informations",
      shippingBody: "Les commandes partent d'Europe avec livraison suivie. France, Union europeenne, Royaume-Uni, Maroc et certaines destinations internationales sont activees au paiement.",
      returnsBody: "Les retours sont acceptes sous 14 jours apres livraison si les pieces sont non portees, non lavees et renvoyees dans leur packaging d'origine. Les drops limites ne peuvent pas etre echanges lorsqu'une taille est epuisee.",
      faqTitle: "FAQ",
      q1: "Quand sortent les maillots ?",
      a1: "La boutique est preparee pour le drop Coupe du Monde 2026. Les dates exactes peuvent etre ajoutees dans les textes du catalogue.",
      q2: "Puis-je commander hors Europe ?",
      a2: "Oui, certains pays internationaux sont actives. D'autres pays peuvent etre ajoutes dans la configuration livraison.",
      q3: "Comment choisir ma taille ?",
      a3: "Le guide des tailles final doit etre ajoute apres les mesures des samples du shooting."
    },
    legal: {
      title: "Legal & contact",
      termsBody: "Lantso vend des maillots en edition limitee en EUR. Une commande est confirmee uniquement apres paiement reussi via Stripe Checkout. La preparation est faite manuellement apres paiement puis envoyee en livraison suivie a domicile. Pour le support : contact@lantso.com.",
      privacyBody: "Les donnees client servent au paiement, a la livraison, au support, a la prevention de fraude et a la newsletter optionnelle. Les donnees de paiement sont gerees par Stripe et ne sont pas stockees par ce site.",
      contactBody: "Pour le support commande, les tailles, la presse ou les demandes wholesale, utilise le formulaire ci-dessous ou ecris a contact@lantso.com.",
      name: "Nom",
      email: "Email",
      message: "Message",
      send: "Envoyer",
      sent: "Message enregistre. Connecter l'envoi email avant lancement."
    },
    roots: {
      title: "Before the design,\nthere was a story",
      body: "Cette page est reservee a l'histoire de Lantso, aux sketchs au crayon et au parcours from the roots to the world. La structure est prete pour ajouter les textes et visuels finaux sans modifier la boutique."
    },
    club: {
      title: "Join the club",
      name: "Nom",
      email: "Email",
      newsletter: "Newsletter et acces en avance",
      submit: "Rejoindre la liste",
      success: "Tu es dans la liste.",
      error: "Le profil n'a pas pu etre enregistre."
    },
    gate: {
      title: "From the Roots\nto the World",
      date: "06 / 06 / 2026",
      password: "Mot de passe",
      unlock: "Entrer",
      invalid: "Mot de passe incorrect.",
      intro: "Acces prive avant le drop.",
      email: "Email",
      subscribe: "Join the club",
      subscribed: "Tu es dans la liste.",
      countdown: "Ouverture du drop dans",
      days: "Jours",
      hours: "Heures",
      minutes: "Minutes",
      seconds: "Secondes"
    },
    checkout: {
      successTitle: "Commande recue",
      successBody: "Le paiement est termine. Cette page pourra afficher le suivi lorsque le workflow logistique sera connecte.",
      cancelTitle: "Paiement annule",
      cancelBody: "Ton panier reste sauvegarde.",
      back: "Retour boutique"
    },
    footer: {
      rights: "© 2026 Lantso\nAll rights reserved.",
      secure: "paiements sécurisés"
    }
  },
  ar: {
    nav: {
      home: "الرئيسية",
      shop: "المتجر",
      allProducts: "كل المنتجات",
      jerseys: "القمصان",
      info: "معلومات",
      shipping: "الشحن",
      returns: "الإرجاع",
      faq: "الأسئلة",
      legal: "القانوني",
      terms: "الشروط والأحكام",
      privacy: "سياسة الخصوصية",
      contact: "تواصل",
      locked: "ابق قريبا"
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
      paypal: "ادفع عبر",
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
      checkoutError: "الدفع غير مهيأ بعد. أضف مفاتيح Stripe في .env قبل استقبال الطلبات.",
      estimate: "التوصيل المتوقع"
    },
    info: {
      title: "معلومات",
      shippingBody: "تشحن الطلبات من أوروبا مع تتبع. فرنسا، الاتحاد الأوروبي، المملكة المتحدة، المغرب وبعض الوجهات الدولية مفعلة عند الدفع.",
      returnsBody: "يقبل الإرجاع خلال 14 يوما بعد التسليم إذا كانت القطع غير مستعملة وغير مغسولة ومع تغليفها الأصلي. القطع المحدودة لا تستبدل عند نفاد المقاس.",
      faqTitle: "الأسئلة",
      q1: "متى تصدر القمصان؟",
      a1: "المتجر جاهز لإصدار كأس العالم 2026. يمكن تحديث تاريخ الإطلاق في نصوص الكتالوج.",
      q2: "هل يمكن الطلب من خارج أوروبا؟",
      a2: "نعم، بعض الدول الدولية مفعلة ويمكن إضافة دول أخرى من إعدادات الشحن.",
      q3: "كيف أختار المقاس؟",
      a3: "يجب إضافة دليل المقاسات النهائي بعد قياس العينات في جلسة التصوير."
    },
    legal: {
      title: "القانوني والتواصل",
      termsBody: "تبيع Lantso قمصانا محدودة باليورو. يؤكد الطلب فقط بعد نجاح الدفع عبر Stripe Checkout. يتم تجهيز الطلب يدويا بعد الدفع ثم إرساله بتوصيل متتبع إلى المنزل. للدعم: contact@lantso.com.",
      privacyBody: "تستخدم بيانات العميل للدفع والتوصيل والدعم ومنع الاحتيال والنشرة الاختيارية. بيانات الدفع يعالجها Stripe ولا يخزنها هذا الموقع.",
      contactBody: "للدعم أو المقاسات أو الصحافة أو طلبات الجملة، استخدم النموذج أدناه أو اكتب إلى contact@lantso.com.",
      name: "الاسم",
      email: "البريد الإلكتروني",
      message: "الرسالة",
      send: "إرسال",
      sent: "تم حفظ الرسالة. اربط خدمة البريد قبل الإطلاق."
    },
    roots: {
      title: "قبل التصميم،\nكانت هناك قصة",
      body: "هذه الصفحة مخصصة لقصة Lantso والرسومات الأولية ومسار العلامة من الجذور إلى العالم. البنية جاهزة لإضافة النصوص والرسومات النهائية دون تغيير المتجر."
    },
    club: {
      title: "Join the club",
      name: "الاسم",
      email: "البريد الإلكتروني",
      newsletter: "النشرة والوصول المبكر",
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
    checkout: {
      successTitle: "تم استلام الطلب",
      successBody: "اكتملت عملية الدفع. يمكن توسيع هذه الصفحة بإضافة تتبع الطلب بعد ربط سير التجهيز.",
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
const ACCESS_HASH = "c1111e162eb6d424f42b1b970b98780963ee494bac8ae1f3ad2ef42f426ab3cc";

const state = {
  lang: localStorage.getItem("lantso:lang") || "en",
  cart: loadCart(),
  locked: localStorage.getItem("lantso:access") !== "granted",
  selectedSizes: Object.fromEntries(PRODUCTS.map((product) => [product.id, product.sizes[0]])),
  shippingCountry: localStorage.getItem("lantso:shippingCountry") || "FR"
};

const app = document.querySelector("#app");
const drawer = document.querySelector("[data-cart-drawer]");
const cartBody = document.querySelector("[data-cart-body]");
const cartCount = document.querySelector("[data-cart-count]");
const clubModal = document.querySelector("[data-club-modal]");
let countdownTimer;

function t(path) {
  return path.split(".").reduce((value, key) => value?.[key], I18N[state.lang]) || path;
}

function locale() {
  if (state.lang === "fr") return "fr-FR";
  if (state.lang === "ar") return "ar-MA";
  return "en-GB";
}

function route() {
  const path = window.location.pathname;
  const hashPath = window.location.hash.startsWith("#/") ? window.location.hash.slice(1) : "";
  const active = hashPath || path;
  if (active === "/" || active === "") return { name: "home" };
  if (active === "/shop") return { name: "shop" };
  if (active.startsWith("/product/")) return { name: "product", id: active.split("/").pop() };
  if (active === "/info") return { name: "info" };
  if (active === "/legal") return { name: "legal" };
  if (active === "/roots") return { name: "roots" };
  if (active === "/success") return { name: "success" };
  if (active === "/cancel") return { name: "cancel" };
  return { name: "home" };
}

function navigate(path) {
  history.pushState({}, "", path);
  render();
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

function setLanguage(lang) {
  state.lang = lang;
  localStorage.setItem("lantso:lang", lang);
  document.documentElement.lang = lang;
  document.documentElement.dir = "ltr";
  document.documentElement.classList.toggle("is-arabic", lang === "ar");
  document.querySelectorAll("[data-lang]").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.lang === lang);
  });
  document.querySelector("[data-open-club]").textContent = t("club.title");
  render();
  renderCart();
}

function lineItems() {
  return state.cart
    .map((item) => {
      const product = findProduct(item.productId);
      if (!product) return null;
      return {
        ...item,
        product,
        lineTotal: product.price * item.quantity
      };
    })
    .filter(Boolean);
}

function subtotal() {
  return lineItems().reduce((sum, item) => sum + item.lineTotal, 0);
}

function cartQuantity() {
  return state.cart.reduce((sum, item) => sum + item.quantity, 0);
}

function addToCart(productId, size = state.selectedSizes[productId], quantity = 1, open = true) {
  const product = findProduct(productId);
  if (!product || !product.sizes.includes(size)) return;
  const existing = state.cart.find((item) => item.productId === productId && item.size === size);
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
  if (item.quantity <= 0) {
    state.cart = state.cart.filter((entry) => !(entry.productId === productId && entry.size === size));
  }
  saveCart();
  renderCart();
  render();
}

function removeItem(productId, size) {
  state.cart = state.cart.filter((entry) => !(entry.productId === productId && entry.size === size));
  saveCart();
  renderCart();
  render();
}

function openCart() {
  drawer.classList.add("is-open");
  drawer.setAttribute("aria-hidden", "false");
  document.body.classList.add("drawer-open");
}

function closeCart() {
  drawer.classList.remove("is-open");
  drawer.setAttribute("aria-hidden", "true");
  document.body.classList.remove("drawer-open");
}

function paymentBadges() {
  return document.querySelector("#payment-badges").innerHTML;
}

function placeholder(label = "") {
  const visual = visualFor(label);
  return `
    <figure class="photo-frame ${visual.className}" aria-label="${escapeHtml(label)}">
      <img src="${visual.src}" alt="${escapeHtml(label)}" loading="lazy">
    </figure>
  `;
}

function visualFor(label) {
  const key = label.toLowerCase();
  if (key.includes("detail one")) {
    return { src: "/assets/photos/campaign-1.png", className: "campaign-visual" };
  }
  if (key.includes("detail two")) {
    return { src: "/assets/photos/campaign-3.png", className: "campaign-visual" };
  }
  if (key.includes("detail three")) {
    return { src: "/assets/photos/campaign-4.png", className: "campaign-visual" };
  }
  if (key.includes("roots 01") || key.includes("روتس")) {
    return { src: "/assets/photos/roots-01-khaki.png", className: "product-visual" };
  }
  if (key.includes("atlas") || key.includes("أطلس")) {
    return { src: "/assets/photos/atlas-02-white.png", className: "product-visual" };
  }
  if (key.includes("campaign image one")) {
    return { src: "/assets/photos/campaign-1.png", className: "campaign-visual" };
  }
  if (key.includes("campaign image two")) {
    return { src: "/assets/photos/campaign-2.png", className: "campaign-visual" };
  }
  if (key.includes("campaign image three")) {
    return { src: "/assets/photos/campaign-3.png", className: "campaign-visual" };
  }
  if (key.includes("campaign image four")) {
    return { src: "/assets/photos/campaign-4.png", className: "campaign-visual" };
  }
  if (key.includes("origin") || key.includes("pencil") || key.includes("chapter")) {
    return { src: "/assets/photos/story.png", className: "campaign-visual" };
  }
  return { src: "/assets/photos/hero.png", className: "hero-visual" };
}

function gatePage() {
  const parts = countdownParts();
  return `
    <section class="gate-page">
      <figure class="gate-media" aria-hidden="true">
        <img src="/assets/photos/hero.png" alt="">
      </figure>
      <div class="gate-language" aria-label="Language">
        ${["en", "fr", "ar"]
          .map((lang) => `<button class="lang-button${state.lang === lang ? " is-active" : ""}" type="button" data-gate-lang="${lang}">${lang === "en" ? "🇬🇧" : lang === "fr" ? "🇫🇷" : "🇲🇦"}</button>`)
          .join("")}
      </div>
      <div class="gate-content">
        <img class="gate-logo" src="/Lantso_text.svg" alt="Lantso">
        <p class="gate-date">${t("gate.date")}</p>
        <h1 class="script-title">${t("gate.title").replace("\n", "<br>")}</h1>
        <p class="gate-intro">${t("gate.intro")}</p>
        <div class="countdown" aria-label="${t("gate.countdown")}">
          ${countdownUnit("days", parts.days)}
          ${countdownUnit("hours", parts.hours)}
          ${countdownUnit("minutes", parts.minutes)}
          ${countdownUnit("seconds", parts.seconds)}
        </div>
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
            <input name="email" type="email" autocomplete="email" required>
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
        <img class="mark-symbol" src="/lantso_logo.svg" alt="Lantso">
        <span>${t("footer.rights").replace("\n", "<br>")}</span>
      </div>
      ${footerColumn(t("nav.shop"), [
        [t("nav.allProducts"), "/shop"],
        [t("nav.jerseys"), "/shop"]
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
          <a href="https://instagram.com" rel="noreferrer" target="_blank">IG</a>
          <a href="https://www.tiktok.com" rel="noreferrer" target="_blank">TT</a>
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
      ${links.map(([label, href]) => `<a href="${href}" data-link>${label}</a>`).join("")}
    </div>
  `;
}

function breadcrumb(current) {
  return `
    <div class="breadcrumb">
      <a href="/" data-link>${t("nav.home")}</a>
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
        <a class="button-primary" href="/shop" data-link>${t("hero.step")}</a>
        <span class="hero-arrow" aria-hidden="true"></span>
      </div>
    </section>
    <section class="split-band">
      <div class="split-copy">
        <p class="eyebrow">${t("hero.chapter")}</p>
        <h2 class="headline">${t("hero.headline").replaceAll("\n", "<br>")}</h2>
        <a class="text-link" href="/shop" data-link>${t("hero.discoverShop")}</a>
      </div>
      ${placeholder("Chapter visual")}
    </section>
    <section class="product-feature-grid">
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
  return `
    <article class="product-card">
      <a href="/product/${product.id}" data-link>${placeholder(productName)}</a>
      <div>
        <h2>${productName}</h2>
        <em>${product.story[state.lang] || product.story.en}</em>
      </div>
      <div class="product-card__meta">
        <span>${formatMoney(product.price, locale())}</span>
        <span>${index === 1 && state.lang === "fr" ? "pieces limitees" : t("product.limited")}</span>
      </div>
      <div class="claim-row">
        <button class="button-primary" type="button" data-add="${product.id}">${index === 1 && state.lang !== "en" ? t("product.access") : t("product.claim")}</button>
        <button class="plus-button" type="button" data-quick-add="${product.id}" aria-label="${t("product.add")}">+</button>
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
          <a class="text-link" href="/roots" data-link>${t("hero.discoverRoots")}</a>
        </div>
      </section>
      ${footer()}
    </div>
  `;
}

function shopCard(product) {
  const productName = product.shortName[state.lang] || product.shortName.en;
  const selected = state.selectedSizes[product.id];
  return `
    <article class="shop-card">
      <div>
        <h2>${product.chapter}<br>${product.color[state.lang] || product.color.en}</h2>
      </div>
      <a href="/product/${product.id}" data-link>${placeholder(productName)}</a>
      <div class="shop-meta">
        <span>${t("product.limited")}</span>
        <span>${formatMoney(product.price, locale())}</span>
      </div>
      <div class="size-row" role="group" aria-label="${t("product.size")}">
        ${product.sizes
          .map((size) => {
            const low = product.inventory[size] <= 16 ? " is-low" : "";
            return `<button class="size-button${low}" type="button" data-size="${product.id}:${size}" aria-pressed="${selected === size}">${size}</button>`;
          })
          .join("")}
      </div>
      <div class="claim-row">
        <button class="button-primary" type="button" data-add="${product.id}">${t("product.claim")}</button>
        <button class="plus-button" type="button" data-quick-add="${product.id}" aria-label="${t("product.add")}">+</button>
      </div>
      <button class="button-paypal" type="button" data-paypal="${product.id}">${t("product.paypal")} <strong>PayPal</strong></button>
    </article>
  `;
}

function productPage(productId) {
  const product = findProduct(productId) || PRODUCTS[0];
  const productName = product.shortName[state.lang] || product.shortName.en;
  const selected = state.selectedSizes[product.id];
  const shipping = calculateShipping(state.shippingCountry, product.price, 1);
  return `
    <div class="page-shell">
      ${breadcrumb(productName)}
      <section class="product-detail">
        <div class="product-gallery">
          ${placeholder(productName)}
          <div class="thumb-grid">
            ${placeholder(`${productName} detail one`)}
            ${placeholder(`${productName} detail two`)}
            ${placeholder(`${productName} detail three`)}
          </div>
        </div>
        <article class="product-panel">
          <p class="eyebrow">${product.chapter}</p>
          <h1>${productName}</h1>
          <p>${product.description[state.lang] || product.description.en}</p>
          <div class="detail-list">
            <div><span>${t("product.price")}</span><strong>${formatMoney(product.price, locale())}</strong></div>
            <div><span>${t("product.color")}</span><strong>${product.color[state.lang] || product.color.en}</strong></div>
            <div><span>${t("product.material")}</span><strong>${product.material[state.lang] || product.material.en}</strong></div>
            <div><span>${t("product.measurements")}</span><strong>${sizeGuide(product)}</strong></div>
            <div><span>${t("product.stock")}</span><strong>${t("product.limited")}</strong></div>
            <div><span>${t("product.shippingEstimate")}</span><strong>${formatMoney(shipping.amount, locale())} · ${shipping.zone.eta[state.lang] || shipping.zone.eta.en}</strong></div>
            <div class="detail-long"><span>${t("product.care")}</span><strong>${product.care[state.lang] || product.care.en}</strong></div>
          </div>
          <div class="size-row" role="group" aria-label="${t("product.size")}">
            ${product.sizes
              .map((size) => `<button class="size-button" type="button" data-size="${product.id}:${size}" aria-pressed="${selected === size}">${size}</button>`)
              .join("")}
          </div>
          <div class="claim-row">
            <button class="button-primary" type="button" data-add="${product.id}">${t("product.add")}</button>
            <button class="plus-button" type="button" data-quick-add="${product.id}" aria-label="${t("product.add")}">+</button>
          </div>
          <button class="button-paypal" type="button" data-paypal="${product.id}">${t("product.paypal")} <strong>PayPal</strong></button>
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
        <input name="postal" autocomplete="postal-code">
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
              <label><span>${t("legal.email")}</span><input name="email" type="email" autocomplete="email" required></label>
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
  return `
    <div class="page-shell">
      ${breadcrumb(t("hero.discoverRoots"))}
      <section class="roots-layout">
        <article class="roots-section">
          <h1>${t("roots.title").replace("\n", "<br>")}</h1>
          <div class="prose"><p>${t("roots.body")}</p></div>
        </article>
        <article class="split-band">
          ${placeholder("Pencil sketch one")}
          ${placeholder("Pencil sketch two")}
        </article>
      </section>
      ${footer()}
    </div>
  `;
}

function noticePage(kind) {
  const isSuccess = kind === "success";
  return `
    <div class="page-shell">
      <section class="notice-page">
        <div class="notice-box">
          <h1>${isSuccess ? t("checkout.successTitle") : t("checkout.cancelTitle")}</h1>
          <p>${isSuccess ? t("checkout.successBody") : t("checkout.cancelBody")}</p>
          <a class="button-primary" href="/shop" data-link>${t("checkout.back")}</a>
        </div>
      </section>
      ${footer()}
    </div>
  `;
}

function render() {
  if (state.locked) {
    document.body.classList.add("is-gated");
    document.querySelector(".site-header").hidden = true;
    app.innerHTML = `<div class="page">${gatePage()}</div>`;
    bindGateEvents();
    startCountdown();
    window.scrollTo({ top: 0, behavior: "instant" });
    return;
  }

  stopCountdown();
  document.body.classList.remove("is-gated");
  document.querySelector(".site-header").hidden = false;
  const current = route();
  document.querySelector(".site-header").dataset.floating = current.name === "home";
  if (current.name === "home") app.innerHTML = `<div class="page">${homePage()}</div>`;
  if (current.name === "shop") app.innerHTML = `<div class="page">${shopPage()}</div>`;
  if (current.name === "product") app.innerHTML = `<div class="page">${productPage(current.id)}</div>`;
  if (current.name === "info") app.innerHTML = `<div class="page">${infoPage()}</div>`;
  if (current.name === "legal") app.innerHTML = `<div class="page">${legalPage()}</div>`;
  if (current.name === "roots") app.innerHTML = `<div class="page">${rootsPage()}</div>`;
  if (current.name === "success") app.innerHTML = `<div class="page">${noticePage("success")}</div>`;
  if (current.name === "cancel") app.innerHTML = `<div class="page">${noticePage("cancel")}</div>`;
  bindPageEvents();
  renderCart();
  window.scrollTo({ top: 0, behavior: "instant" });
}

function bindGateEvents() {
  app.querySelectorAll("[data-gate-lang]").forEach((button) => {
    button.addEventListener("click", () => setLanguage(button.dataset.gateLang));
  });

  const accessForm = app.querySelector("[data-access-form]");
  accessForm?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const message = accessForm.querySelector("[data-access-message]");
    const password = new FormData(accessForm).get("password");
    const unlocked = await verifyAccess(password);
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
    const email = new FormData(newsletterForm).get("email");
    const response = await submitForm("club", {
      name: "Launch list",
      email,
      newsletter: "yes"
    });
    message.textContent = response.ok ? t("gate.subscribed") : t("club.error");
    if (response.ok) newsletterForm.reset();
  });
}

function bindPageEvents() {
  app.querySelectorAll("[data-link]").forEach((link) => {
    link.addEventListener("click", (event) => {
      const href = link.getAttribute("href");
      if (!href || href.startsWith("http") || href.includes("#")) return;
      event.preventDefault();
      navigate(href);
    });
  });

  app.querySelectorAll("[data-size]").forEach((button) => {
    button.addEventListener("click", () => {
      const [productId, size] = button.dataset.size.split(":");
      state.selectedSizes[productId] = size;
      render();
    });
  });

  app.querySelectorAll("[data-add], [data-quick-add]").forEach((button) => {
    button.addEventListener("click", () => {
      const productId = button.dataset.add || button.dataset.quickAdd;
      addToCart(productId);
    });
  });

  app.querySelectorAll("[data-paypal]").forEach((button) => {
    button.addEventListener("click", async () => {
      const productId = button.dataset.paypal;
      addToCart(productId, state.selectedSizes[productId], 1, false);
      openCart();
      await checkout("paypal");
    });
  });

  const calculator = app.querySelector("[data-calculator]");
  if (calculator) {
    calculator.addEventListener("submit", (event) => {
      event.preventDefault();
      const data = new FormData(calculator);
      state.shippingCountry = data.get("country");
      localStorage.setItem("lantso:shippingCountry", state.shippingCountry);
      const result = calculateShipping(state.shippingCountry, subtotal() || PRODUCTS[0].price, cartQuantity() || 1);
      calculator.querySelector("[data-calc-result]").textContent = `${result.zone.label[state.lang] || result.zone.label.en}: ${formatMoney(result.amount, locale())} · ${result.zone.eta[state.lang] || result.zone.eta.en}`;
      renderCart();
    });
  }

  const contactForm = app.querySelector("[data-contact-form]");
  if (contactForm) {
    contactForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const message = contactForm.querySelector("[data-contact-message]");
      const payload = Object.fromEntries(new FormData(contactForm));
      const response = await submitForm("contact", payload);
      message.textContent = response.ok ? t("legal.sent") : t("club.error");
      if (response.ok) contactForm.reset();
    });
  }
}

function renderCart() {
  cartCount.textContent = cartQuantity();
  const lines = lineItems();
  if (!lines.length) {
    cartBody.innerHTML = `
      <div class="cart-empty">
        <span class="bag-icon" aria-hidden="true"></span>
        <p>${t("cart.empty")}</p>
        <button class="button-ghost" type="button" data-close-cart>${t("cart.continue")}</button>
      </div>
    `;
    cartBody.querySelector("[data-close-cart]").addEventListener("click", closeCart);
    return;
  }

  const sub = subtotal();
  const shipping = calculateShipping(state.shippingCountry, sub, cartQuantity());
  const total = sub + shipping.amount;
  cartBody.innerHTML = `
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
        <input data-cart-postal autocomplete="postal-code">
      </label>
      <div class="summary-line"><span>${t("cart.subtotal")}</span><strong>${formatMoney(sub, locale())}</strong></div>
      <div class="summary-line"><span>${t("cart.shipping")} · ${shipping.zone.label[state.lang] || shipping.zone.label.en}</span><strong>${shipping.amount === 0 ? t("cart.free") : formatMoney(shipping.amount, locale())}</strong></div>
      <div class="summary-line"><span>${t("cart.estimate")}</span><strong>${shipping.zone.eta[state.lang] || shipping.zone.eta.en}</strong></div>
      <div class="summary-line summary-total"><span>${t("cart.total")}</span><strong>${formatMoney(total, locale())}</strong></div>
      <button class="button-primary" type="button" data-checkout>${t("cart.checkout")}</button>
      <p class="checkout-message" data-checkout-message role="status"></p>
    </div>
  `;

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
    localStorage.setItem("lantso:shippingCountry", state.shippingCountry);
    renderCart();
  });
  cartBody.querySelector("[data-checkout]").addEventListener("click", () => checkout());
}

function cartItem(line) {
  const productName = line.product.shortName[state.lang] || line.product.shortName.en;
  return `
    <article class="cart-item">
      ${placeholder(productName)}
      <div>
        <h3>${productName}</h3>
        <p>${t("product.size")}: ${line.size}</p>
        <p>${formatMoney(line.product.price, locale())}</p>
        <div class="qty-row">
          <button type="button" data-qty="${line.productId}:${line.size}:-1" aria-label="-">-</button>
          <span>${t("cart.qty")} ${line.quantity}</span>
          <button type="button" data-qty="${line.productId}:${line.size}:1" aria-label="+">+</button>
          <button type="button" data-remove="${line.productId}:${line.size}">${t("cart.remove")}</button>
        </div>
      </div>
    </article>
  `;
}

function countryOptions(selected) {
  return SHIPPING_ZONES.map((zone) =>
    zone.countries
      .map((code) => {
        const label = zone.countries.length === 1 ? zone.label[state.lang] || zone.label.en : `${code} · ${zone.label[state.lang] || zone.label.en}`;
        return `<option value="${code}" ${code === selected ? "selected" : ""}>${label}</option>`;
      })
      .join("")
  ).join("");
}

function sizeGuide(product) {
  return product.sizes
    .map((size) => {
      const measure = product.measurements[size];
      return `${size}: ${measure.length}cm x ${measure.width}cm`;
    })
    .join(" / ");
}

async function checkout(preferredMethod = "") {
  const message = cartBody.querySelector("[data-checkout-message]");
  if (message) message.textContent = "";
  const payload = {
    items: state.cart,
    shippingCountry: state.shippingCountry,
    language: state.lang,
    preferredMethod
  };
  const response = await postJson("/api/create-checkout-session", payload);
  if (response.ok && response.data.url) {
    window.location.assign(response.data.url);
    return;
  }
  if (message) message.textContent = response.data?.message || t("cart.checkoutError");
}

async function postJson(url, payload) {
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const data = await response.json().catch(() => ({}));
    return { ok: response.ok, data };
  } catch (error) {
    return { ok: false, data: { message: error.message } };
  }
}

async function submitForm(name, payload) {
  const body = new URLSearchParams({ "form-name": name, ...payload }).toString();
  try {
    const response = await fetch("/", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body
    });
    if (response.ok) return { ok: true, data: {} };
  } catch {
    // Local development falls back to the JSON endpoints below.
  }
  const endpoint = name === "contact" ? "/api/contact" : "/api/club";
  return postJson(endpoint, payload);
}

async function verifyAccess(password) {
  const response = await postJson("/api/access", { password });
  if (response.ok && response.data?.ok) return true;
  return (await sha256(String(password || ""))) === ACCESS_HASH;
}

async function sha256(value) {
  if (!window.crypto?.subtle) return "";
  const bytes = new TextEncoder().encode(value);
  const digest = await window.crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
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

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

document.querySelectorAll("[data-lang]").forEach((button) => {
  button.addEventListener("click", () => setLanguage(button.dataset.lang));
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
  payload.newsletter = form.newsletter.checked ? "yes" : "no";
  const response = await submitForm("club", payload);
  message.textContent = response.ok ? t("club.success") : response.data?.message || t("club.error");
  if (response.ok) form.reset();
});

window.addEventListener("popstate", render);
setLanguage(state.lang);
