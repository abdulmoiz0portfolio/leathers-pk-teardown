# leathers.pk — Technical Teardown

Reverse-engineering notes for **https://www.leathers.pk** (Pakistani leather-goods e-commerce: belts, wallets, watches).
Crawled 2026-10-13 with curl (browser UA) + page-text inspection. Read-only; no auth, no aggressive scanning.
All code/markup observations are structural. No product images, logos, or marketing copy reproduced here.

---

## 1. Tech stack

| Layer | Detected |
|---|---|
| Backend | **Laravel** — `<meta name="csrf-token">`, `XSRF-TOKEN` + `leathers_pk_session` cookies, `/admin` disallowed in robots.txt |
| Frontend build | **Vite** — hashed assets `/build/assets/app-{hash}.js` (91 KB) / `app-{hash}.css` (180 KB) |
| CSS | **Tailwind CSS** (utility classes everywhere) + custom theme palette `leather-100…900` |
| Server | **Apache** (`Server: Apache` header) |
| Analytics | Google Analytics 4 — `gtag/js?id=G-FC07HY5793` |
| Rendering | Server-rendered HTML (Blade-style), progressive enhancement via one JS module — no SPA framework |
| Sitemap | `https://leathers.pk/sitemap.xml` referenced in robots.txt |

## 2. Architecture

- Classic multi-page app: every route returns full HTML (homepage ~196 KB, category ~268 KB).
- One global `app.js` module (~91 KB) adds interactivity: sticky-cart footer, wishlist toggles, add-to-cart form interception, lazy image fade-in, WhatsApp float button.
- Cart state appears server-side (session); the sticky cart footer is suppressed on `/cart` and `/checkout` paths via `location.pathname` checks in JS.
- Forms POST to `/add-to-cart/{id}` and `/add-deal-to-cart/{id}`; wishlist is the only JSON API: `POST /wishlist/toggle` with `X-CSRF-TOKEN` header and `{"Content-Type":"application/json"}`.

## 3. Site map (observed routes)

```
/                          homepage
/category/belts|wallets|watches
/product/{slug}            e.g. /product/the-duke-belt
/sales                     sale landing
/cart                      cart page (empty-state: "Your cart is empty")
/checkout                  checkout (shipping step observed)
/login  /register
/blog
/contact-us
/page/about-us | /page/exchange-policy | /page/faqs
/page/privacy-policy | /page/shipping-policy | /page/terms-and-conditions
/#categories               homepage anchor
```

## 4. Component breakdown

**Announcement bar** — top strip; free-delivery threshold messaging ("Free Delivery on Orders Above Rs. 5,000" pattern).

**Header / nav** — sticky (`sticky top-0 z-50`), dark `bg-leather-900` nav; links: Home, Shop (dropdown), Belts, Wallets, Watches, Sale, Login/Register. Cart icon with count badge.

**Hero** — full-width dark section (`bg-gradient-to-br from-neutral-900 via-leather-900`), serif display headline, sub-copy, CTA button(s), hero image right.

**Categories** — `#categories` anchor section; 3 tiles (Belts / Wallets / Watches) with imagery.

**Featured products** — heading + responsive grid `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6`.

**Product card** (the signature component):
- `div.product-card.group`, image container `aspect-square overflow-hidden rounded-t-xl` with `animate-pulse bg-neutral-200` skeleton
- `<img loading="lazy">` fades in via `onload` removing `opacity-0 scale-95`; hover `group-hover:scale-105`
- Discount badge: absolute pill `bg-red-600 text-white rounded-full` ("-46%" pattern)
- Hover reveal bar: `absolute inset-x-0 bottom-0 translate-y-full group-hover:translate-y-0` — white/90 backdrop-blur strip with color swatch dots (`w-4 h-4 rounded-full`) + wishlist heart toggle + quick actions
- Below: product name, price row (current + struck original)

**Value props** — "Why Choose …" band with icon + text columns.

**Newsletter** — "Join the Inner Circle" dark band (`bg-leather-900`), email input + button.

**Footer** — `bg-leather-900 text-neutral-300`, columns: Quick Links, Customer Care, Address (+ contact), socials, copyright/payment row.

**Floating WhatsApp button** — brand green `#25D366`, fixed bottom-right, site-wide.

**Cart drawer / sticky footer** — mini-cart summary bar; hidden on cart/checkout pages.

## 5. Product page (`/product/{slug}`)

- Breadcrumb, gallery: main image (`#main-image`) + thumbnail strip (43 gallery/thumb refs), aspect-square
- Title (h1), price block, variant selectors (color swatches; 221 color refs — multi-color products), quantity stepper (8 refs), size refs
- `form#add-to-cart-form` → POST `/add-to-cart/{id}`
- Tabs: Description / Reviews (11 description, 12 review refs)
- SKU refs (34), related-products rail

## 6. Category page

- Sort control, filter sidebar (30 filter refs), price-range filter (14 refs), product grid reusing the product-card component, pagination.

## 7. Cart & checkout flow

1. Add to cart → form POST `/add-to-cart/{id}` (or deal variant `/add-deal-to-cart/{id}`)
2. `/cart` — line items with qty steppers, subtotal, "Your cart is empty" empty state
3. `/checkout` — Shipping step observed (address form); standard Laravel multi-step (shipping → payment → place order)
4. Auth optional: `/login` + `/register` exist; guest checkout pattern typical for this stack

## 8. API endpoints (observed in JS bundle — read-only)

| Method | Endpoint | Notes |
|---|---|---|
| POST | `/wishlist/toggle` | JSON, `X-CSRF-TOKEN` header, `data-product-id` |
| POST | `/add-to-cart/{id}` | HTML form action, intercepted by JS |
| POST | `/add-deal-to-cart/{id}` | deal/bundle variant |
| GET | `/cart`, `/checkout` | full page loads |

No public search API observed in the bundle; search (if any) is likely a GET query page.

## 9. SEO

- `<title>` keyword-rich per page type; `meta robots: index, follow`
- Open Graph + Twitter cards (`og:type website`, `og:image /images/hero/hero.png`)
- JSON-LD `Organization` with logo, phone (+92-311-1222741), multilingual contact (English/Urdu), social `sameAs`
- robots.txt + sitemap.xml; semantic h1/h2 per section; lazy images with alt text

## 10. Design system (observed tokens)

- **Colors:** `leather-900 #171717` (near-black, primary surface), `leather-800 #262626`, neutrals `#f5f5f5/#e3e3e0/#3e3e3a`, WhatsApp `#25D366`, sale red `#…600` badges, gold accents `#b88e2f / #f0c33c`
- **Type:** Display serif `"Playfair Display", Georgia, serif`; body system sans (`ui-sans-serif, system-ui`)
- **Layout:** full-bleed dark hero → white content sections (`py-16`/`py-24`), max-w container, 4-col product grid on desktop
- **Shape language:** `rounded-xl` cards, `rounded-full` badges/pills, generous whitespace, subtle shadows

## 11. Recreation notes

`/recreation/` in this repo is a **clean-room scaffold**: same layout patterns (sticky dark header, hero, 4-col product grid, hover-reveal card, dark footer) rebuilt from scratch with original placeholder copy ("Example Leather Co."), CSS gradient placeholders instead of product photography, and no copied markup/text. See `recreation/README.md`.
