# Lantso Storefront

Custom no-Shopify storefront for the Lantso 2026 Moroccan jersey drop.

## Run Locally

```bash
npm run dev
```

Open `http://127.0.0.1:5173`.

## Launch Setup

1. Copy `.env.example` to `.env`.
2. Set `PUBLIC_SITE_URL` to the production domain.
3. Add `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET`.
4. Optionally set `STRIPE_API_VERSION` if the Stripe account should pin a specific API version.
5. In Stripe, enable the payment methods the business can legally support in its region. Leave `STRIPE_PAYMENT_METHOD_TYPES` empty to let Stripe show eligible dashboard-enabled methods, or set a comma list such as `card,klarna,paypal` after confirming account eligibility.
6. Review `PRODUCTS`, prices, inventory, and copy in `catalog.mjs`.
7. Review `SHIPPING_ZONES` in `catalog.mjs`. Current tiers are France, EU, UK, Morocco, and selected worldwide destinations, with free shipping over 180 EUR.
8. Replace red placeholder frames with final shooting photos and the real Lantso logo assets.
9. Have the business validate company details, refund wording, tax settings, privacy wording, and terms before taking live orders.

## Fonts

The layout requests Atkinson Hyperlegible Mono for the interface and Snell Roundhand only for `From the Roots to the World` and `Join the club`. Atkinson currently loads from Google Fonts. For a European production launch, self-host the licensed font files. Snell Roundhand is used as a system/licensed-font fallback; add a licensed webfont if the brand needs the same script on every device.

## Data Captured

The local server appends operational records under `data/`:

- `checkout-sessions.jsonl`
- `paid-orders.jsonl`
- `club-profiles.jsonl`
- `contact-messages.jsonl`

For production, move these records to a managed database or durable storage. Passwords for club profiles are salted and hashed before storage.

## Webhook

Point Stripe webhooks to:

```text
https://your-domain.com/api/webhook
```

Listen for:

- `checkout.session.completed`
- `checkout.session.async_payment_succeeded`

The site already verifies Stripe signatures when `STRIPE_WEBHOOK_SECRET` is set.
