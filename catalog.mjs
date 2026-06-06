export const CURRENCY = "eur";
export const LOCAL_CURRENCY_BY_COUNTRY = {
  CH: "chf",
  GB: "gbp",
  MA: "mad"
};
export const LOCAL_CURRENCY_PREVIEW_RATES = {
  chf: 0.95,
  gbp: 0.86,
  mad: 10.75
};
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
      fr: "Inspiré de 98. Reconstruit pour maintenant.",
      ar: "مستوحى من 98. مصمم للحاضر."
    },
    description: {
      en: "A very limited Morocco-inspired jersey in khaki green, designed for match days, summer nights, and collectors.",
      fr: "Un maillot vert khaki en édition très limitée, inspiré du Maroc et pensé pour les jours de match, les soirs d'été et les collectionneurs.",
      ar: "قميص أخضر كاكي بإصدار محدود جدا، مستوحى من المغرب ومصمم للمباريات والأمسيات الصيفية والمهتمين بالقطع الخاصة."
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
      en: "Seen up close. Felt from afar.",
      fr: "Vu de près. Ressenti de loin.",
      ar: "يظهر عن قرب. ويصل إحساسه من بعيد."
    },
    description: {
      en: "A very limited white jersey from the same heritage line, built around contrast, movement, and Moroccan detail.",
      fr: "Un maillot blanc en édition très limitée dans la même ligne héritage, construit autour du contraste, du mouvement et du détail marocain.",
      ar: "قميص أبيض بإصدار محدود جدا من نفس خط التراث، مبني على التباين والحركة والتفاصيل المغربية."
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
  return LOCAL_CURRENCY_BY_COUNTRY[String(countryCode || "").toUpperCase()] || CURRENCY;
}

export function moneyCountryForCurrency(currency = CURRENCY) {
  const normalized = String(currency || CURRENCY).toLowerCase();
  return Object.entries(LOCAL_CURRENCY_BY_COUNTRY).find(([, value]) => value === normalized)?.[0] || "FR";
}

export function convertMoney(cents, countryCode = "FR") {
  const currency = currencyForCountry(countryCode);
  if (currency === CURRENCY) return cents;
  return Math.round(Number(cents || 0) * LOCAL_CURRENCY_PREVIEW_RATES[currency]);
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
