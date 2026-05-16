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
2. Set `PUBLIC_SITE_URL=https://www.lantso.com` in Netlify.
3. Add `STRIPE_SECRET_KEY` in Netlify.
4. Add `STRIPE_WEBHOOK_SECRET` after creating the Stripe webhook.
5. In Stripe, enable the payment methods the business can legally support in its region. Leave `STRIPE_PAYMENT_METHOD_TYPES` empty to let Stripe show eligible dashboard-enabled methods, or set a comma list such as `card,klarna,paypal` after confirming account eligibility.
6. Netlify Blobs stores production stock reservations and paid orders. No extra database account is needed on Netlify, but the dependency must install during the Netlify build.
7. Review `PRODUCTS`, prices, inventory, and copy in `catalog.mjs`.
8. Review `SHIPPING_ZONES` in `catalog.mjs`. Current tiers use the 300g / 32x45x4cm parcel data and calculate a tracked home-delivery rate by country and quantity.
9. Netlify Forms captures launch newsletter, club, and contact submissions. Configure Netlify email notifications to `contact@lantso.com`.
10. Have the business validate legal registration details, tax settings, privacy wording, and terms before taking live orders.

## Launch Gate

The site opens on a password/countdown page for the 06/06/2026 drop. The unlock check is available at `/api/access`, with a committed hash fallback for the requested password.

## Fonts

The layout requests Atkinson Hyperlegible Mono for the interface and Snell Roundhand only for `From the Roots to the World` and `Join the club`. Atkinson currently loads from Google Fonts. For a European production launch, self-host the licensed font files. Snell Roundhand is used as a system/licensed-font fallback; add a licensed webfont if the brand needs the same script on every device.

## Data Captured

The local server appends operational records under `data/`:

- `checkout-sessions.jsonl`
- `paid-orders.jsonl`
- `club-profiles.jsonl`
- `contact-messages.jsonl`
- `inventory-state.json`

For production, Netlify Forms captures club/contact submissions. Netlify Blobs stores checkout reservations, inventory sold counts, and paid-order records outside the Stripe Dashboard.

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

The build writes pre-rendered HTML files to `dist/` for `/`, `/shop`, both product pages, `/info`, `/legal`, and `/roots`. Netlify publishes `dist/`.
