export const CURRENCY = "eur";
export const FREE_SHIPPING_THRESHOLD = null;
export const JERSEY_WEIGHT_GRAMS = 300;
export const PARCEL_DIMENSIONS_CM = {
  length: 32,
  width: 45,
  height: 4
};

export const PRODUCTS = [
  {
    id: "roots-01-khaki",
    sku: "ROOTS-01-KHAKI",
    chapter: "ROOTS 01",
    name: {
      en: "Roots 01 - Khaki",
      fr: "ROOTS 01 - Khaki",
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
      fr: "Inspiré de 98. Reconstruit pour maintenant.",
      ar: "مستوحى من 98. مصمم للحاضر."
    },
    description: {
      en: "Inspired by Morocco 1998, ROOTS 01 revisits a classic through Lantso's lens. A tribute to a generation, a culture, and a heritage that continue to inspire today.",
      fr: "Inspiré du Maroc 1998, ROOTS 01 revisite un classique à travers le regard de Lantso. Un hommage à une génération, à une culture et à un héritage qui continuent d'inspirer aujourd'hui.",
      ar: "مستوحى من منتخب المغرب 1998، يعيد ROOTS 01 قراءة قميص كلاسيكي من خلال رؤية لانطسو. تحية لجيل وثقافة وإرث ما زالوا مصدر إلهام حتى اليوم."
    },
    material: {
      en: "100% polyester",
      fr: "100% polyester",
      ar: "100% بوليستر"
    },
    care: {
      en: "Machine wash cold at 30C, wash inside out with similar colours, do not bleach, do not tumble dry, cool iron inside out, do not dry clean.",
      fr: "Lavage en machine à froid à 30 °C, laver sur l'envers avec des couleurs similaires, ne pas blanchir, ne pas sécher en machine, repassage doux sur l'envers, nettoyage à sec interdit.",
      ar: "يغسل في الغسالة على 30 درجة، يقلب القميص قبل الغسل، يغسل مع ألوان مشابهة، يمنع المبيض والتجفيف الآلي، كي خفيف من الداخل، يمنع التنظيف الجاف."
    },
    measurements: {
      M: { length: 71, width: 51 },
      L: { length: 73, width: 53 }
    },
    price: 5999,
    sizes: ["S", "M", "L", "XL"],
    inventory: {
      S: 0,
      M: 13,
      L: 12,
      XL: 0
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
      en: "The Maghreb, worn differently.",
      fr: "Le Maghreb, porté autrement.",
      ar: "المغرب العربي، يُرتدى بطريقة مختلفة."
    },
    description: {
      en: "A white jersey elevated by a subtle zellige pattern, where every detail pays tribute to Moroccan heritage. A refined piece, designed to cross generations.",
      fr: "Un maillot blanc sublimé par un motif zellige discret, où chaque détail rend hommage au patrimoine marocain. Une pièce épurée, pensée pour traverser les générations.",
      ar: "قميص أبيض يزدان بنقشة زليج خفية، حيث يكرم كل تفصيل التراث المغربي. قطعة نقية صُممت لتعبر الأجيال."
    },
    material: {
      en: "100% polyester",
      fr: "100% polyester",
      ar: "100% بوليستر"
    },
    care: {
      en: "Machine wash cold at 30C, wash inside out with similar colours, do not bleach, do not tumble dry, cool iron inside out, do not dry clean.",
      fr: "Lavage en machine à froid à 30 °C, laver sur l'envers avec des couleurs similaires, ne pas blanchir, ne pas sécher en machine, repassage doux sur l'envers, nettoyage à sec interdit.",
      ar: "يغسل في الغسالة على 30 درجة، يقلب القميص قبل الغسل، يغسل مع ألوان مشابهة، يمنع المبيض والتجفيف الآلي، كي خفيف من الداخل، يمنع التنظيف الجاف."
    },
    measurements: {
      M: { length: 71, width: 51 },
      L: { length: 73, width: 53 }
    },
    price: 5999,
    sizes: ["S", "M", "L", "XL"],
    inventory: {
      S: 0,
      M: 13,
      L: 12,
      XL: 0
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
    quantityTiers: [
      { maxQuantity: 1, amount: 859 },
      { maxQuantity: 2, amount: 999 },
      { maxQuantity: 4, amount: 1199 },
      { maxQuantity: 999, amount: 1359 }
    ],
    rates: [
      { maxWeight: 500, amount: 859 },
      { maxWeight: 1000, amount: 999 },
      { maxWeight: 2000, amount: 1199 },
      { maxWeight: 5000, amount: 1359 }
    ],
    eta: {
      en: "3 business days",
      fr: "3 jours ouvrés",
      ar: "3 أيام عمل"
    }
  },
  {
    id: "EU",
    label: {
      en: "European Union and Switzerland",
      fr: "Union européenne et Suisse",
      ar: "الاتحاد الأوروبي وسويسرا"
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
      "SE",
      "CH"
    ],
    rates: [
      { maxWeight: 500, amount: 1599 },
      { maxWeight: 1000, amount: 2039 },
      { maxWeight: 2000, amount: 2319 },
      { maxWeight: 5000, amount: 2959 },
      { maxWeight: 10000, amount: 4799 }
    ],
    eta: {
      en: "6-7 business days",
      fr: "6 à 7 jours ouvrés",
      ar: "6 إلى 7 أيام عمل"
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
    rates: [
      { maxWeight: 500, amount: 1999 },
      { maxWeight: 1000, amount: 2439 },
      { maxWeight: 2000, amount: 2719 },
      { maxWeight: 5000, amount: 3359 },
      { maxWeight: 10000, amount: 5799 }
    ],
    eta: {
      en: "7-8 business days",
      fr: "7 à 8 jours ouvrés",
      ar: "7 إلى 8 أيام عمل"
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
    rates: [
      { maxWeight: 500, amount: 2479 },
      { maxWeight: 1000, amount: 2939 },
      { maxWeight: 2000, amount: 3209 },
      { maxWeight: 5000, amount: 4089 },
      { maxWeight: 10000, amount: 7599 }
    ],
    eta: {
      en: "7-8 business days",
      fr: "7 à 8 jours ouvrés",
      ar: "7 إلى 8 أيام عمل"
    }
  },
  {
    id: "WORLD",
    label: {
      en: "Rest of world",
      fr: "Reste du monde",
      ar: "باقي العالم"
    },
    countries: ["US", "CA", "NO", "AE", "SA", "QA", "AU", "JP"],
    rates: [
      { maxWeight: 500, amount: 3619 },
      { maxWeight: 1000, amount: 4019 },
      { maxWeight: 2000, amount: 5499 },
      { maxWeight: 5000, amount: 7969 },
      { maxWeight: 10000, amount: 15799 }
    ],
    eta: {
      en: "7-8 business days",
      fr: "7 à 8 jours ouvrés",
      ar: "7 إلى 8 أيام عمل"
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

export function calculateShipping(countryCode, subtotal, quantity = 1) {
  const zone = findShippingZone(countryCode);
  const weight = Math.max(1, Number(quantity || 1)) * JERSEY_WEIGHT_GRAMS;
  const itemCount = Math.max(1, Math.ceil(Number(quantity || 1)));
  const tier =
    zone.quantityTiers?.find((rate) => itemCount <= rate.maxQuantity) ||
    zone.rates.find((rate) => weight <= rate.maxWeight) ||
    zone.rates.at(-1);
  const freeShipping = FREE_SHIPPING_THRESHOLD && subtotal >= FREE_SHIPPING_THRESHOLD;
  const amount = freeShipping ? 0 : tier.amount;
  return {
    zone,
    amount,
    weight,
    dimensions: PARCEL_DIMENSIONS_CM
  };
}

export function currencyForCountry(countryCode = "FR") {
  return CURRENCY;
}

export function moneyCountryForCurrency(currency = CURRENCY) {
  return "FR";
}

export function convertMoney(cents, countryCode = "FR") {
  return Number(cents || 0);
}

export function formatMoney(cents, locale = "fr-FR", countryCode = "FR") {
  const currency = currencyForCountry(countryCode);
  return formatCurrencyAmount(convertMoney(cents, countryCode), locale, currency);
}

export function formatCurrencyAmount(cents, locale = "fr-FR", currency = CURRENCY) {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currency.toUpperCase(),
    currencyDisplay: "narrowSymbol"
  }).format(Number(cents || 0) / 100);
}
