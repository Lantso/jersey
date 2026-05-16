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
      en: "A very limited Morocco-inspired jersey in khaki green, designed for match days, summer nights, and collectors.",
      fr: "Un maillot vert khaki en edition tres limitee, inspire du Maroc et pense pour les jours de match, les soirs d'ete et les collectionneurs.",
      ar: "قميص أخضر كاكي بإصدار محدود جدا، مستوحى من المغرب ومصمم للمباريات والأمسيات الصيفية والمهتمين بالقطع الخاصة."
    },
    material: {
      en: "100% polyester",
      fr: "100% polyester",
      ar: "100% بوليستر"
    },
    care: {
      en: "Machine wash cold at 30C, wash inside out with similar colours, do not bleach, do not tumble dry, cool iron inside out, do not dry clean.",
      fr: "Lavage en machine a froid a 30C, laver sur l'envers avec des couleurs similaires, ne pas blanchir, ne pas secher en machine, repassage doux sur l'envers, nettoyage a sec interdit.",
      ar: "يغسل في الغسالة على 30 درجة، يقلب القميص قبل الغسل، يغسل مع ألوان مشابهة، يمنع المبيض والتجفيف الآلي، كي خفيف من الداخل، يمنع التنظيف الجاف."
    },
    measurements: {
      M: { length: 71, width: 51 },
      L: { length: 73, width: 53 }
    },
    price: 5999,
    sizes: ["M", "L"],
    inventory: {
      M: 13,
      L: 12
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
      en: "A very limited white jersey from the same heritage line, built around contrast, movement, and Moroccan detail.",
      fr: "Un maillot blanc en edition tres limitee dans la meme ligne heritage, construit autour du contraste, du mouvement et du detail marocain.",
      ar: "قميص أبيض بإصدار محدود جدا من نفس خط التراث، مبني على التباين والحركة والتفاصيل المغربية."
    },
    material: {
      en: "100% polyester",
      fr: "100% polyester",
      ar: "100% بوليستر"
    },
    care: {
      en: "Machine wash cold at 30C, wash inside out with similar colours, do not bleach, do not tumble dry, cool iron inside out, do not dry clean.",
      fr: "Lavage en machine a froid a 30C, laver sur l'envers avec des couleurs similaires, ne pas blanchir, ne pas secher en machine, repassage doux sur l'envers, nettoyage a sec interdit.",
      ar: "يغسل في الغسالة على 30 درجة، يقلب القميص قبل الغسل، يغسل مع ألوان مشابهة، يمنع المبيض والتجفيف الآلي، كي خفيف من الداخل، يمنع التنظيف الجاف."
    },
    measurements: {
      M: { length: 71, width: 51 },
      L: { length: 73, width: 53 }
    },
    price: 5999,
    sizes: ["M", "L"],
    inventory: {
      M: 13,
      L: 12
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
    rates: [
      { maxWeight: 1000, amount: 790 },
      { maxWeight: 2000, amount: 990 }
    ],
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
    rates: [
      { maxWeight: 1000, amount: 1590 },
      { maxWeight: 2000, amount: 1890 }
    ],
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
    rates: [
      { maxWeight: 1000, amount: 1890 },
      { maxWeight: 2000, amount: 2490 }
    ],
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
    rates: [
      { maxWeight: 1000, amount: 1890 },
      { maxWeight: 2000, amount: 2490 }
    ],
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
    rates: [
      { maxWeight: 1000, amount: 2990 },
      { maxWeight: 2000, amount: 3990 }
    ],
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

export function calculateShipping(countryCode, subtotal, quantity = 1) {
  const zone = findShippingZone(countryCode);
  const weight = Math.max(1, Number(quantity || 1)) * JERSEY_WEIGHT_GRAMS;
  const tier = zone.rates.find((rate) => weight <= rate.maxWeight) || zone.rates.at(-1);
  const freeShipping = FREE_SHIPPING_THRESHOLD && subtotal >= FREE_SHIPPING_THRESHOLD;
  const amount = freeShipping ? 0 : tier.amount;
  return {
    zone,
    amount,
    weight,
    dimensions: PARCEL_DIMENSIONS_CM
  };
}

export function formatMoney(cents, locale = "fr-FR") {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: CURRENCY.toUpperCase()
  }).format(cents / 100);
}
