# Lantso Storefront

Custom no-Shopify storefront for the Lantso 2026 Moroccan jersey drop.

## Run Locally

```bash
npm run dev
```

The local `.env` in this workspace sets `PORT=3000`, so open:

```text
http://127.0.0.1:3000
```

## Launch Setup

1. Copy `.env.example` to `.env` locally, and set the same variables in Netlify.
2. Set `PUBLIC_SITE_URL=https://lantso.com` in Netlify.
3. Add `STRIPE_SECRET_KEY` in Netlify.
4. Add `STRIPE_WEBHOOK_SECRET` after creating the Stripe webhook.
5. In Stripe, enable the payment methods the business can legally support in its region. Leave `STRIPE_PAYMENT_METHOD_TYPES` empty to let Stripe show eligible dashboard-enabled methods, or set a comma list such as `card,klarna,paypal` after confirming account eligibility.
6. Netlify Blobs stores production stock reservations and paid orders. No extra database account is needed on Netlify, but the dependency must install during the Netlify build.
7. Review `PRODUCTS`, prices, inventory, and copy in `catalog.mjs`.
8. Review `SHIPPING_ZONES` in `catalog.mjs`. Current tiers use the 300g / 32x45x4cm parcel data and calculate a tracked home-delivery rate by country and quantity. France uses the requested launch tiers: 1 jersey `8.59€`, 2 jerseys `9.99€`, 3-4 jerseys `11.99€`, 5+ jerseys `13.59€`. EU/Switzerland, UK, Morocco, and rest-of-world use Colissimo-style weight tiers with a 1 euro buffer.
9. Club/newsletter signups go through `/api/club` and are stored in Netlify Blobs under the `lantso-forms` store. The browser also mirrors them to the Netlify `club` form so you have a free Netlify Forms dashboard/export copy.
10. Contact submissions go through `/api/contact`, are stored in Netlify Blobs, and are mirrored to the Netlify `contact` form. In Netlify, add a form submission email notification for the `contact` form to `contact@lantso.com`.
11. For direct support emails from the API, use Resend's free tier: set `RESEND_API_KEY`, `CONTACT_FROM_EMAIL` from a verified sending domain, and `CONTACT_TO_EMAIL=contact@lantso.com`. Set `CONTACT_EMAIL_REQUIRED=true` only if the contact form should fail whenever the direct email cannot be sent.
12. Have the business validate legal registration details, tax settings, privacy wording, and terms before taking live orders.

## Launch Gate

The site is public by default so Google and AI search tools can index the storefront. Only set `LANTSO_GATE_ENABLED=true` for a private pre-launch gate. When the gate is enabled, the edge page deliberately returns `noindex, nofollow`, so it should not be used for public launch SEO. If the gate is enabled, set `LANTSO_ACCESS_HASH` in Netlify; there is no production fallback if the variable is missing or malformed.

## Fonts

The layout requests Atkinson Hyperlegible Mono for the interface and Snell Roundhand only for `From the Roots to the World` and `Join the club`. Atkinson currently loads from Google Fonts. For a European production launch, self-host the licensed font files. Snell Roundhand is used as a system/licensed-font fallback; add a licensed webfont if the brand needs the same script on every device.

## Data Captured

The local server appends operational records under `data/`:

- `checkout-sessions.jsonl`
- `paid-orders.jsonl`
- `club-profiles.json`
- `contact-messages.jsonl`
- `inventory-state.json`

For production, Netlify Blobs stores checkout reservations, inventory sold counts, paid-order records, newsletter/club profiles, and contact submissions outside the Stripe Dashboard. Netlify Forms also receives club/contact submissions for free dashboard access, CSV export, and contact email notifications.

## Inventory Safety

`lib/inventory.mjs` reserves stock before creating a Stripe Checkout Session. It writes the shared stock state with Netlify Blobs conditional writes (`onlyIfMatch` / `onlyIfNew`) and retries on conflicts, so concurrent buyers cannot both reserve the same final piece. Stripe Checkout expiry is set on each session, and expired or failed sessions release their reservation.

## Webhook

Point Stripe webhooks to:

```text
https://your-domain.com/api/webhook
```

Listen for:

- `checkout.session.completed`
- `checkout.session.async_payment_succeeded`
- `checkout.session.expired`
- `checkout.session.async_payment_failed`

The site verifies Stripe signatures when `STRIPE_WEBHOOK_SECRET` is set. The webhook is the only code path that permanently marks inventory as sold and records a paid order.

## SEO Build

```bash
npm run build
```

The build writes pre-rendered HTML files to `dist/` for `/`, `/shop`, both product pages, `/info`, `/legal`, `/roots`, checkout result pages, localized routes, `sitemap.xml`, `robots.txt`, and `llms.txt`. Netlify publishes `dist/`.
