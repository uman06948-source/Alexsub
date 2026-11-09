# ALEXSUB

Responsive Nigerian VTU demo app: **Affordable Data. Instant Connections.** The current repository version is a development/demo scaffold; simulated services only. It is not a real-money wallet and makes no live VTUGATE/provider requests.

## Run locally

- Node.js 20+ and npm
- `cp .env.example .env`, then replace `SESSION_SECRET` with a long random value.
- `npm install`
- `npm run dev` (Vite at port 5173, Express API at port 3001)
- `npm run build`

The demo app currently keeps users, balances, and transactions in process memory; restarting the server clears them. PostgreSQL/Drizzle schema and migration tooling are present as a foundation but are not yet wired into runtime persistence. Do not deploy this in-memory demo as a production service.

## Demo behavior

Register a customer account in the UI, add fixed ₦5,000 simulated demo credits, then try data or airtime. Sample plan prices are explicitly illustrative and do not represent provider prices. Provider results are simulated. No real airtime/data is delivered, credits cannot be withdrawn, and no deposit or transfer is enabled. No default administrator credentials or public admin registration are provided.

## Layout

- `src/` — React, TypeScript, responsive interface and styles
- `server/` — Express API, validation, password hashing, mock provider boundary
- `server/db/schema.ts` — PostgreSQL/Drizzle table definitions
- `server/providers/` — provider interface, active mock adapter, disabled VTUGATE placeholder
- `drizzle.config.ts` — migration generator configuration

## Environment

See `.env.example`. `DATABASE_URL` is used by Drizzle migration tooling, but runtime routes in this scaffold are in-memory. `SESSION_SECRET` must be a private random secret outside local development. `DEMO_MODE=false` disables demo credit and purchase endpoints. Never put API credentials in frontend variables.

## VTUGATE

The active provider is `mockProvider.ts`. The VTUGATE adapter in `server/providers/vtugateService.ts` intentionally throws and is not wired into purchases. The available documentation search did not establish exact endpoint paths, form fields, or response schemas. Before implementation, consult the current official documentation at <https://vtugate.com/docs>, confirm the authorized account/eligibility and exact documented request/response contract, then implement server-only HTTPS Bearer requests with documented form encoding. Do not enable live purchases until independently tested and explicitly authorized. `VITEGATE_API_KEY` is intentionally unused and must not be exposed in a browser build.

## Security and production gaps

The API uses bcrypt password hashing, input validation, basic auth rate limiting, Helmet, HTTP-only SameSite session cookies, and idempotency keys. This is a demo baseline, not a production security review. Session storage is Express's in-memory default; CSRF protections, persistent DB transactions/ledger enforcement, account verification/reset flows, admin management, production migrations/seeds, FCM, and live service providers are not implemented. Add a persistent PostgreSQL-backed session store, CSRF defenses, and atomic DB transactions before any deployment with user data or money. Set HTTPS and secure cookies in production.
