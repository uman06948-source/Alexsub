# ALEXSUB

Responsive Nigerian VTU application. The selected provider remains mock-only: simulated transactions and wallet credits are not money and are not delivered to mobile networks.

## Setup
1. Use Node.js 20+, PostgreSQL 14+, npm.
2. Copy `.env.example` to `.env`. Set `DATABASE_URL` and a random `SESSION_SECRET` of 32+ characters.
3. Run `npm install`, `npm run db:migrate`, then `npm run dev` (Vite at 5173 and Express at 3001).
4. Check `http://localhost:3001/api/health`. Run `npm run build` to check the frontend/type build.

This repository is edited through GitHub APIs in this session; the app has not been installed, run, or tested here. Verify the migration, typecheck, and UI locally before deployment.

## API key configuration
Never paste provider secrets into React, Vite `VITE_*` variables, source files, commits, chat, or issue comments. For local development, put `VTUGATE_API_KEY=...` in an ignored local `.env` file (the tracked `.env.example` has an empty placeholder only). In Replit, add it as a **Secret** under the project Tools/Secrets interface, available to the backend process as `process.env.VTUGATE_API_KEY`. In production, set it in the server host's encrypted environment/secret manager. Do not expose it in browser bundles or API responses.

The current `vtugateService.ts` adapter deliberately remains disabled and does not read or use the key. The active adapter is `mockProvider`; no live API requests are made. Before implementation, confirm the official current endpoint and request/response schema at <https://vtugate.com/docs>, get provider authorization, and build/test the adapter only on the server. Adding the secret alone will not enable provider calls. No provider API key is required to run demo mode.

## Development admin
Set `ADMIN_EMAIL` and `ADMIN_PASSWORD` (12+ characters) in local `.env`, then run `npm run db:seed-admin`. This provisions a development administrator; never reuse those credentials in production. No public admin registration endpoint exists. Admin APIs are under `/api/admin`; a complete admin UI is not included yet.

## Demo, ledger and provider
The DB schema stores customers, persistent sessions, data plans, wallets, immutable ledger entries, demo payments, transactions, refunds, notifications, admin roles/users and audit logs. The migration seeds explicitly illustrative sample prices. The demo credit route adds a fixed simulated ₦5,000. Purchases use idempotency keys and the active mock provider only. Electricity token generation, real deposits, transfers and withdrawals are disabled. `DEMO_MODE=false` disables demo credit and purchase endpoints.

## Known gaps
The requested full application is not yet complete: no email verification/password reset, customer support ticket persistence, FCM delivery, cable/electricity/exam service backend, or complete admin frontend. Secure sessions, validation, password hashing and rate limits are present as a baseline, but conduct a security review and add CSRF defenses before production deployment. Do not handle real funds or enable live provider purchases until persistence, provider contracts, refunds, and end-to-end testing are independently validated.
