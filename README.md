# YungDrip

Modern full-stack e-commerce storefront for a clothing brand built with Next.js App Router, Tailwind CSS, Framer Motion, and MongoDB with Mongoose.

## Features

- Premium homepage with animated hero, featured products, and category sections
- Responsive product listing with category filter, sorting, and search
- Product detail pages with thumbnail gallery, size/color selection, and add-to-cart feedback
- Persistent cart powered by React Context and `localStorage`
- User authentication with account pages and order history
- Checkout flow with Razorpay order creation and payment verification
- Order tracking view with payment and delivery status
- Admin order management with status updates
- MongoDB-backed rate limiting on auth and checkout routes
- Origin validation on all mutating API routes
- Razorpay webhook verification endpoint
- REST APIs for products, auth, orders, checkout, admin, and seed

## Getting Started

1. Install dependencies:

```bash
npm install
```

2. Configure environment:

```bash
cp .env.example .env.local
```

Required variables:

| Variable | Description |
|----------|-------------|
| `MONGODB_URI` | MongoDB connection string |
| `MONGODB_DB_NAME` | Database name |
| `NEXT_PUBLIC_STORE_CURRENCY` | Currency code (e.g. `INR`) |
| `APP_URL` | Full origin URL (e.g. `https://yourdomain.com`) |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | Razorpay public key |
| `RAZORPAY_KEY_ID` | Razorpay key ID (server) |
| `RAZORPAY_KEY_SECRET` | Razorpay secret key |
| `RAZORPAY_WEBHOOK_SECRET` | Razorpay webhook signing secret |
| `ADMIN_EMAILS` | Comma-separated admin emails |
| `ENABLE_SEED_ROUTE` | Set to `true` only when seeding (`false` otherwise) |

3. Seed the database:

```bash
npm run seed
```

4. Start the app:

```bash
npm run dev
```

## API Routes

**Products**
- `GET /api/products` — list with optional `category`, `search`, `sort`, `featured`
- `GET /api/products/:id`
- `POST /api/products` — admin only
- `PUT /api/products/:id` — admin only
- `DELETE /api/products/:id` — admin only
- `POST /api/seed` — admin only, requires `ENABLE_SEED_ROUTE=true`

**Auth**
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/session`

**Orders (user)**
- `GET /api/orders`
- `GET /api/orders/:id`

**Checkout**
- `POST /api/checkout/create-order`
- `POST /api/checkout/verify`

**Webhooks**
- `POST /api/webhooks/razorpay`

**Admin**
- `GET /api/admin/orders` — supports `status` and `search` filters
- `GET /api/admin/orders/:id`
- `PUT /api/admin/orders/:id` — update order status

## Security

- Passwords hashed with `scrypt`
- Sessions stored in MongoDB, cookie is `httpOnly`, `sameSite=lax`, `secure` in production
- Rate limiting persisted in MongoDB on login, register, and checkout endpoints
- Origin header validated on all state-changing routes
- Admin routes enforce `role: "admin"` or `ADMIN_EMAILS` match
- Razorpay webhook signature verified with HMAC-SHA256

## Notes

- Sample products live in `data/seed-products.json`
- The Razorpay flow: create order on server → open checkout in browser → verify signature on server → mark paid
- Admin access is granted to users whose email appears in `ADMIN_EMAILS` or whose stored `role` is `admin`
- For production-grade abuse resistance, place a CDN/WAF (Cloudflare, Vercel Edge) in front as an outer layer

## Remaining Work

| # | Item | Notes |
|---|------|-------|
| 1 | **Route guard middleware** | No `middleware.js` exists. Protected pages (`/account`, `/checkout`, `/admin`) currently rely on client-side auth checks — users see a loading flash before redirect. A Next.js middleware should read the session cookie and redirect server-side. |
| 2 | **Admin order detail — status update UI** | `/admin/orders/[id]` is view-only. Status can only be changed from the list view dropdown, not from the detail page. |
| 3 | **Admin order search UI** | Backend supports `search` query param (order number, name, email), api-client passes it, but the admin dashboard has no search input wired up. |
| 4 | **Password reset flow** | No forgot-password or reset-password pages or API routes. Users who lose their password have no self-service recovery. |
| 5 | **Admin product management UI** | Product create/update/delete APIs exist and are admin-gated, but there is no UI. Catalog management requires hitting the API manually. |
| 6 | **Nav "Collection" link** | Both "New In" and "Collection" in the navbar point to `/shop`. No separate collection or category landing page exists. |
| 7 | **Cart merge on login** | Cart is `localStorage`-only. No server-side cart, no merge when a guest logs in on the same browser from a different context, no cross-device cart. |
| 8 | **Transactional emails** | No emails are sent — not on registration, not on order placed, not on status changes (shipped, delivered, etc.). |
| 9 | **Inventory / stock tracking** | Products have `sizes` and `colors` but no quantity field. Nothing prevents overselling. |
| 10 | **`NEXT_PUBLIC_APP_URL` undocumented** | `lib/security.js` reads this as a fallback for origin validation but it is not in `.env.example`. Add it if deploying to Vercel or any host that sets it. |
