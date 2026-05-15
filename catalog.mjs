export const CURRENCY = "eur";
export const FREE_SHIPPING_THRESHOLD = 18000;

export const PRODUCTS = [
  {
    id: "roots-01-khaki",
    sku: "ROOTS-01-KHAKI",
    chapter: "ROOTS 01",
    name: {
      en: "Roots 01 - Khaki",
      fr: "Roots 01 - Khaki",
      ar: "روتس 01 - كاكي"
    },
    shortName: {
      en: "ROOTS 01 - KHAKI",
      fr: "ROOTS 01 - KHAKI",
      ar: "روتس 01 - كاكي"
    },
    color: {
      en: "Khaki",
      fr: "Khaki",
      ar: "كاكي"
    },
    story: {
      en: "Inspired by 98. Rebuilt for now.",
      fr: "Inspire de 98. Reconstruit pour maintenant.",
      ar: "مستوحى من 98. مصمم للحاضر."
    },
    description: {
      en: "A limited Morocco-inspired jersey cut for match days, summer nights, and collectors.",
      fr: "Un maillot limite inspire du Maroc, pense pour les jours de match, les soirs d'ete et les collectionneurs.",
      ar: "قميص محدود مستوحى من المغرب، مناسب للمباريات والأمسيات الصيفية والمهتمين بالقطع الخاصة."
    },
    price: 8900,
    sizes: ["S", "M", "L", "XL"],
    inventory: {
      S: 18,
      M: 24,
      L: 24,
      XL: 14
    },
    accent: "#a30000"
  },
  {
    id: "atlas-02-white",
    sku: "ATLAS-02-WHITE",
    chapter: "ATLAS 02",
    name: {
      en: "Atlas 02 - White",
      fr: "Atlas 02 - White",
      ar: "أطلس 02 - أبيض"
    },
    shortName: {
      en: "ATLAS 02 - WHITE",
      fr: "ATLAS 02 - WHITE",
      ar: "أطلس 02 - أبيض"
    },
    color: {
      en: "White",
      fr: "White",
      ar: "أبيض"
    },
    story: {
      en: "Seen up close. Felt from afar.",
      fr: "Vu de pres. Ressenti de loin.",
      ar: "يظهر عن قرب. ويصل إحساسه من بعيد."
    },
    description: {
      en: "A clean white chapter for the same heritage line, designed around contrast and movement.",
      fr: "Un chapitre blanc epure pour la meme ligne heritage, construit autour du contraste et du mouvement.",
      ar: "فصل أبيض نقي من نفس خط التراث، مبني على التباين والحركة."
    },
    price: 8900,
    sizes: ["S", "M", "L", "XL"],
    inventory: {
      S: 16,
      M: 22,
      L: 22,
      XL: 12
    },
    accent: "#a30000"
  }
];

export const SHIPPING_ZONES = [
  {
    id: "FR",
    label: {
      en: "France",
      fr: "France",
      ar: "فرنسا"
    },
    countries: ["FR", "MC"],
    rate: 690,
    eta: {
      en: "2-4 business days",
      fr: "2 a 4 jours ouvres",
      ar: "2 إلى 4 أيام عمل"
    }
  },
  {
    id: "EU",
    label: {
      en: "European Union",
      fr: "Union europeenne",
      ar: "الاتحاد الأوروبي"
    },
    countries: [
      "AT",
      "BE",
      "BG",
      "HR",
      "CY",
      "CZ",
      "DK",
      "EE",
      "FI",
      "DE",
      "GR",
      "HU",
      "IE",
      "IT",
      "LV",
      "LT",
      "LU",
      "MT",
      "NL",
      "PL",
      "PT",
      "RO",
      "SK",
      "SI",
      "ES",
      "SE"
    ],
    rate: 1190,
    eta: {
      en: "4-7 business days",
      fr: "4 a 7 jours ouvres",
      ar: "4 إلى 7 أيام عمل"
    }
  },
  {
    id: "UK",
    label: {
      en: "United Kingdom",
      fr: "Royaume-Uni",
      ar: "المملكة المتحدة"
    },
    countries: ["GB"],
    rate: 1490,
    eta: {
      en: "5-8 business days",
      fr: "5 a 8 jours ouvres",
      ar: "5 إلى 8 أيام عمل"
    }
  },
  {
    id: "MA",
    label: {
      en: "Morocco",
      fr: "Maroc",
      ar: "المغرب"
    },
    countries: ["MA"],
    rate: 1490,
    eta: {
      en: "5-9 business days",
      fr: "5 a 9 jours ouvres",
      ar: "5 إلى 9 أيام عمل"
    }
  },
  {
    id: "WORLD",
    label: {
      en: "Rest of world",
      fr: "Reste du monde",
      ar: "باقي العالم"
    },
    countries: ["US", "CA", "CH", "NO", "AE", "SA", "QA", "AU", "JP"],
    rate: 2490,
    eta: {
      en: "7-14 business days",
      fr: "7 a 14 jours ouvres",
      ar: "7 إلى 14 يوم عمل"
    }
  }
];

export const CHECKOUT_ALLOWED_COUNTRIES = [
  ...new Set(SHIPPING_ZONES.flatMap((zone) => zone.countries))
];

export function findProduct(productId) {
  return PRODUCTS.find((product) => product.id === productId);
}

export function findShippingZone(countryCode = "FR") {
  const normalized = String(countryCode).toUpperCase();
  return (
    SHIPPING_ZONES.find((zone) => zone.countries.includes(normalized)) ||
    SHIPPING_ZONES.find((zone) => zone.id === "WORLD")
  );
}

export function calculateShipping(countryCode, subtotal) {
  const zone = findShippingZone(countryCode);
  const amount = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : zone.rate;
  return {
    zone,
    amount
  };
}

export function formatMoney(cents, locale = "fr-FR") {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: CURRENCY.toUpperCase()
  }).format(cents / 100);
}
