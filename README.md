# Lantso

Small custom shop. no shopify.

![preview](assets/readme/preview.gif)

## run

```bash
npm install
npm run dev
```

open `http://127.0.0.1:3000`

## build

```bash
npm test
npm run build
```

Netlify publishes `dist/`.

## map

- `index.html` = shell
- `app.js` = frontend app
- `catalog.mjs` = products, stock, shipping
- `styles.css` = look
- `assets/` = all images, icons, textures, preview
- `lib/` = shared backend code
- `netlify/functions/` = api
- `netlify/edge-functions/access-gate.mjs` = private gate
- `scripts/prerender.mjs` = seo pages

## pages

- `/roots` = origin story + 2 images
- `/archives` = hidden archive placeholders + thanks list
- archive cards / names live in `app.js`

## data

- Stripe checkout takes payment.
- Stripe Dashboard has the paid checkout sessions.
- Netlify Blobs stores stock, paid orders, club signups, contact messages.
- Paid orders live in `lantso-commerce / inventory-v1 / orders`.
- Netlify Forms mirrors club/contact so there is a free dashboard/export thing.
- Resend sends contact + paid order emails if `RESEND_API_KEY` + `CONTACT_FROM_EMAIL` are set.
- Order emails go to `CONTACT_TO_EMAIL`, then `STORE_EMAIL`, then `contact@lantso.com`.

## env

Copy `.env.example`.

Must set in Netlify:

- `PUBLIC_SITE_URL=https://lantso.com`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `LANTSO_ACCESS_HASH` if the gate is on

Optional:

- `RESEND_API_KEY`
- `CONTACT_FROM_EMAIL`
- `CONTACT_TO_EMAIL=contact@lantso.com`

## webhook

Stripe webhook:

```text
https://lantso.com/api/webhook
```

Use the apex URL directly. `www` can redirect, and Stripe wants this endpoint itself to answer `2xx`.

events:

- `checkout.session.completed`
- `checkout.session.async_payment_succeeded`
- `checkout.session.expired`
- `checkout.session.async_payment_failed`

If Stripe emails about webhook failures, fix this first: the webhook records paid orders and stock. Usual issue is wrong URL or wrong live `STRIPE_WEBHOOK_SECRET` for that exact endpoint.

## legal

This website was developed by Wlad Derb (`wladderb.com`) and is licensed/granted for use by Mizan Studio, the client.

All code, design, assets, structure, and related implementation details are proprietary unless written permission says otherwise. No copy, resale, reuse, redistribution, reverse engineering, or derivative use is allowed outside the granted client usage. Any unauthorized usage may be treated as infringement and pursued accordingly.
