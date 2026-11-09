CREATE EXTENSION IF NOT EXISTS pgcrypto;
DO $$ BEGIN CREATE TYPE transaction_status AS ENUM ('PENDING','PROCESSING','SUCCESSFUL','FAILED','REVERSED'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
CREATE TABLE IF NOT EXISTS users (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), account_id text NOT NULL UNIQUE, name text NOT NULL, email text NOT NULL UNIQUE, phone text NOT NULL, password_hash text NOT NULL, role text NOT NULL DEFAULT 'CUSTOMER', suspended boolean NOT NULL DEFAULT false, created_at timestamptz NOT NULL DEFAULT now());
CREATE INDEX IF NOT EXISTS users_email_idx ON users(email);
CREATE TABLE IF NOT EXISTS wallets (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid NOT NULL UNIQUE REFERENCES users(id), balance_kobo integer NOT NULL DEFAULT 0 CHECK(balance_kobo >= 0), created_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS wallet_ledger (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), wallet_id uuid NOT NULL REFERENCES wallets(id), amount_kobo integer NOT NULL CHECK(amount_kobo <> 0), entry_type text NOT NULL, reference text NOT NULL UNIQUE, description text NOT NULL, created_at timestamptz NOT NULL DEFAULT now());
CREATE INDEX IF NOT EXISTS wallet_ledger_wallet_idx ON wallet_ledger(wallet_id);
CREATE TABLE IF NOT EXISTS data_plans (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), network text NOT NULL, size text NOT NULL, validity text NOT NULL, category text NOT NULL, price_kobo integer NOT NULL CHECK(price_kobo > 0), active boolean NOT NULL DEFAULT true, is_demo boolean NOT NULL DEFAULT true);
CREATE INDEX IF NOT EXISTS data_plans_network_idx ON data_plans(network,active);
CREATE TABLE IF NOT EXISTS transactions (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), reference text NOT NULL UNIQUE, user_id uuid NOT NULL REFERENCES users(id), service text NOT NULL, network text, recipient text NOT NULL, product text NOT NULL, amount_kobo integer NOT NULL CHECK(amount_kobo > 0), provider_reference text, status transaction_status NOT NULL DEFAULT 'PENDING', idempotency_key text NOT NULL, response_details text, demo boolean NOT NULL DEFAULT true, created_at timestamptz NOT NULL DEFAULT now(), UNIQUE(user_id,idempotency_key));
CREATE INDEX IF NOT EXISTS transactions_user_created_idx ON transactions(user_id,created_at);
CREATE INDEX IF NOT EXISTS transactions_status_idx ON transactions(status);
CREATE TABLE IF NOT EXISTS sessions (sid varchar PRIMARY KEY, sess json NOT NULL, expire timestamp(6) NOT NULL);
CREATE INDEX IF NOT EXISTS sessions_expire_idx ON sessions(expire);
CREATE TABLE IF NOT EXISTS airtime_services (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), network text NOT NULL UNIQUE, active boolean NOT NULL DEFAULT true);
CREATE TABLE IF NOT EXISTS payments (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid NOT NULL REFERENCES users(id), reference text NOT NULL UNIQUE, amount_kobo integer NOT NULL, status text NOT NULL, demo boolean NOT NULL DEFAULT true, created_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS refunds (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), transaction_id uuid NOT NULL REFERENCES transactions(id), reference text NOT NULL UNIQUE, amount_kobo integer NOT NULL, created_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS notifications (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid NOT NULL REFERENCES users(id), title text NOT NULL, body text NOT NULL, read boolean NOT NULL DEFAULT false, created_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS admin_roles (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), name text NOT NULL UNIQUE, permissions text NOT NULL);
CREATE TABLE IF NOT EXISTS admin_users (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid NOT NULL UNIQUE REFERENCES users(id), role_id uuid REFERENCES admin_roles(id));
CREATE TABLE IF NOT EXISTS audit_logs (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), actor_id uuid REFERENCES users(id), action text NOT NULL, target text, details text, created_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS provider_settings (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), provider text NOT NULL UNIQUE, enabled boolean NOT NULL DEFAULT false, settings text NOT NULL DEFAULT '{}', updated_at timestamptz NOT NULL DEFAULT now());
INSERT INTO admin_roles(name,permissions) VALUES('ADMIN','all') ON CONFLICT(name) DO NOTHING;
INSERT INTO airtime_services(network) VALUES ('MTN'),('Airtel'),('Glo'),('9mobile') ON CONFLICT(network) DO NOTHING;
-- Demonstration-only illustrative sample prices. Not provider prices.
INSERT INTO data_plans(network,size,validity,category,price_kobo,is_demo) SELECT v.network,v.size,v.validity,v.category,v.price,true FROM (VALUES
('MTN','500MB','1 day','Daily',10000),('MTN','1.5GB','7 days','SME',35000),('MTN','3GB','30 days','Gifting',90000),('MTN','5GB','30 days','Corporate',145000),
('Airtel','500MB','1 day','Daily',11000),('Airtel','1.5GB','7 days','SME',36000),('Airtel','3GB','30 days','Gifting',92000),('Airtel','5GB','30 days','Corporate',148000),
('Glo','1GB','5 days','Weekly',20000),('Glo','3GB','30 days','SME',80000),('Glo','5GB','30 days','Gifting',125000),('Glo','10GB','30 days','Corporate',240000),
('9mobile','500MB','1 day','Daily',12000),('9mobile','2GB','30 days','SME',70000),('9mobile','4GB','30 days','Gifting',130000),('9mobile','10GB','30 days','Corporate',270000)
) AS v(network,size,validity,category,price) WHERE NOT EXISTS (SELECT 1 FROM data_plans);
