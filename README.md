# ALEXSUB

Responsive Nigerian VTU application, running in explicitly marked demo mode. No live provider calls, real deposits, transfers, or withdrawals are enabled.

## Setup
1. Node.js 20+, PostgreSQL 14+, npm.
2. `cp .env.example .env`, configure a PostgreSQL database and a random `SESSION_SECRET` (32+ characters).
3. `npm install`
4. `npm run db:migrate`
5. `npm run dev` (Vite: 5173, Express API: 3001) or `npm run build`.

The API now uses PostgreSQL for users, wallets, immutable ledger entries, demo payments, plans, transactions, refunds, audit logs, notifications, and persistent sessions. The migrations seed illustrative data plan prices explicitly marked DEMO. Do not treat those amounts as provider pricing or real value.

## Development administrator
Set `ADMIN_EMAIL` and `ADMIN_PASSWORD` (at least 12 chars) in `.env`, then run `npm run db:seed-admin`. The script provisions/updates an administrator; there is no public admin registration endpoint. Never use a default production password. Admin API login is `/api/admin/login`; all admin APIs require a role-checked session. The current React frontend is customer-focused; admin REST endpoints are provided for an admin UI integration.

## Demo behavior and security notes
Fixed ₦5,000 simulated credits are added only by a server endpoint and are recorded in wallet ledger and payments tables. Purchases reserve/debit from a locked wallet, are idempotent by user/key, and have provider requests only to `mockProvider`; confirmed simulated failures are refunded once. If provider execution or DB finalization errors, transaction remains PROCESSING and is not automatically repeated. No electricity tokens, real credits, deposits, or live VTU products are generated.

The API uses bcrypt, Zod validation, rate limiting, Helmet, PostgreSQL-backed sessions, httpOnly SameSite cookies, and parameterized SQL. HTTPS and secure session cookies are expected in production; CSRF defense, email verification, password recovery, full admin frontend, customer support persistence, FCM, and advanced production monitoring are not yet implemented. This code has not been run in this tool environment. Review and test before deploying or handling personal data.

## VTUGATE
The active adapter is `mockProvider`. `vtugateService.ts` stays disabled; its exact routes and payload fields must be implemented only from current official documentation and with authorized credentials. No provider key is sent to the browser. Do not enable live purchases before authorized end-to-end testing.
