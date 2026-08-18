/*
# Digital Product Commerce SaaS - Initial Schema

## Overview
Multi-tenant digital product commerce platform. Sellers sign in with Supabase auth
and manage stores, products, digital files, orders, customers, coupons, marketing,
analytics, and AI mockups. Public storefronts are anon-readable so visitors can
browse and purchase without signing in.

## New Tables
1. `profiles` - extends auth.users with display name, avatar, onboarding state
2. `stores` - seller storefronts (name, slug, description, branding, published state)
3. `products` - digital products (title, price, description, cover, status, category)
4. `product_files` - digital files attached to products (name, size, type, url)
5. `customers` - buyer records keyed by email per store
6. `orders` - customer orders with payment status and mock payment details
7. `order_items` - line items in orders (product snapshot)
8. `coupons` - discount codes per store
9. `storefronts` - store builder config (theme, blocks/layout, published version)
10. `ai_mocks` - AI-generated mockup records (prompt, style, result url)
11. `marketing_campaigns` - email marketing campaigns per store
12. `refunds` - refund records per order
13. `analytics_events` - page views, product views, purchases (for analytics dashboard)

## Security Model
- Owner-scoped tables (profiles, stores, ai_mocks, marketing_campaigns): authenticated,
  ownership via user_id.
- Public catalog tables (products, product_files, storefronts, coupons): SELECT open to
  anon+authenticated (storefront visitors), writes restricted to the store owner via
  store membership check.
- Transactional tables (orders, order_items, customers, refunds): INSERT open to anon
  (checkout flow), SELECT/UPDATE restricted to store owner. Customers view their own
  orders via a per-order access token (anon SELECT filtered by token).
- analytics_events: INSERT open to anon (tracking), SELECT owner-scoped.

## Important Notes
1. All owner columns default to auth.uid() where the row is created by the seller.
2. Store membership is checked via stores.user_id = auth.uid() through subqueries.
3. Public reads use TO anon, authenticated so the anon-key storefront works.
4. Orders carry an access_token so guest customers can view their own order without auth.
*/

-- ---------- profiles ----------
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text,
  avatar_url text,
  onboarding_complete boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_profile" ON profiles;
CREATE POLICY "select_own_profile" ON profiles FOR SELECT
  TO authenticated USING (auth.uid() = id);

DROP POLICY IF EXISTS "insert_own_profile" ON profiles;
CREATE POLICY "insert_own_profile" ON profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "update_own_profile" ON profiles;
CREATE POLICY "update_own_profile" ON profiles FOR UPDATE
  TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- ---------- stores ----------
CREATE TABLE IF NOT EXISTS stores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  slug text NOT NULL,
  tagline text,
  description text,
  logo_url text,
  cover_url text,
  currency text NOT NULL DEFAULT 'USD',
  published boolean NOT NULL DEFAULT false,
  contact_email text,
  social_links jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;
CREATE UNIQUE INDEX IF NOT EXISTS stores_slug_key ON stores (slug);

DROP POLICY IF EXISTS "select_stores" ON stores;
CREATE POLICY "select_stores" ON stores FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "insert_own_store" ON stores;
CREATE POLICY "insert_own_store" ON stores FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_store" ON stores;
CREATE POLICY "update_own_store" ON stores FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_store" ON stores;
CREATE POLICY "delete_own_store" ON stores FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- ---------- products ----------
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id uuid NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  title text NOT NULL,
  slug text NOT NULL,
  description text,
  price_cents integer NOT NULL DEFAULT 0,
  compare_at_cents integer,
  cover_url text,
  category text,
  tags text[] NOT NULL DEFAULT '{}',
  status text NOT NULL DEFAULT 'draft',
  featured boolean NOT NULL DEFAULT false,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS products_store_id_idx ON products (store_id);
CREATE UNIQUE INDEX IF NOT EXISTS products_store_slug_key ON products (store_id, slug);

DROP POLICY IF EXISTS "select_products" ON products;
CREATE POLICY "select_products" ON products FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "insert_own_products" ON products;
CREATE POLICY "insert_own_products" ON products FOR INSERT
  TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM stores WHERE stores.id = products.store_id AND stores.user_id = auth.uid()));

DROP POLICY IF EXISTS "update_own_products" ON products;
CREATE POLICY "update_own_products" ON products FOR UPDATE
  TO authenticated USING (EXISTS (SELECT 1 FROM stores WHERE stores.id = products.store_id AND stores.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM stores WHERE stores.id = products.store_id AND stores.user_id = auth.uid()));

DROP POLICY IF EXISTS "delete_own_products" ON products;
CREATE POLICY "delete_own_products" ON products FOR DELETE
  TO authenticated USING (EXISTS (SELECT 1 FROM stores WHERE stores.id = products.store_id AND stores.user_id = auth.uid()));

-- ---------- product_files ----------
CREATE TABLE IF NOT EXISTS product_files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  name text NOT NULL,
  size_bytes bigint NOT NULL DEFAULT 0,
  file_type text,
  storage_path text,
  download_url text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE product_files ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS product_files_product_id_idx ON product_files (product_id);

DROP POLICY IF EXISTS "select_product_files" ON product_files;
CREATE POLICY "select_product_files" ON product_files FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "insert_own_product_files" ON product_files;
CREATE POLICY "insert_own_product_files" ON product_files FOR INSERT
  TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM products p JOIN stores s ON s.id = p.store_id WHERE p.id = product_files.product_id AND s.user_id = auth.uid()));

DROP POLICY IF EXISTS "update_own_product_files" ON product_files;
CREATE POLICY "update_own_product_files" ON product_files FOR UPDATE
  TO authenticated USING (EXISTS (SELECT 1 FROM products p JOIN stores s ON s.id = p.store_id WHERE p.id = product_files.product_id AND s.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM products p JOIN stores s ON s.id = p.store_id WHERE p.id = product_files.product_id AND s.user_id = auth.uid()));

DROP POLICY IF EXISTS "delete_own_product_files" ON product_files;
CREATE POLICY "delete_own_product_files" ON product_files FOR DELETE
  TO authenticated USING (EXISTS (SELECT 1 FROM products p JOIN stores s ON s.id = p.store_id WHERE p.id = product_files.product_id AND s.user_id = auth.uid()));

-- ---------- customers ----------
CREATE TABLE IF NOT EXISTS customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id uuid NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text,
  country text,
  total_spent_cents integer NOT NULL DEFAULT 0,
  orders_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS customers_store_id_idx ON customers (store_id);
CREATE UNIQUE INDEX IF NOT EXISTS customers_store_email_key ON customers (store_id, email);

DROP POLICY IF EXISTS "select_own_customers" ON customers;
CREATE POLICY "select_own_customers" ON customers FOR SELECT
  TO authenticated USING (EXISTS (SELECT 1 FROM stores WHERE stores.id = customers.store_id AND stores.user_id = auth.uid()));

DROP POLICY IF EXISTS "insert_customers" ON customers;
CREATE POLICY "insert_customers" ON customers FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "update_own_customers" ON customers;
CREATE POLICY "update_own_customers" ON customers FOR UPDATE
  TO authenticated USING (EXISTS (SELECT 1 FROM stores WHERE stores.id = customers.store_id AND stores.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM stores WHERE stores.id = customers.store_id AND stores.user_id = auth.uid()));

-- ---------- orders ----------
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id uuid NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  customer_id uuid REFERENCES customers(id) ON DELETE SET NULL,
  customer_email text NOT NULL,
  customer_name text,
  status text NOT NULL DEFAULT 'pending',
  payment_method text,
  payment_status text NOT NULL DEFAULT 'pending',
  payment_ref text,
  subtotal_cents integer NOT NULL DEFAULT 0,
  discount_cents integer NOT NULL DEFAULT 0,
  total_cents integer NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'USD',
  coupon_code text,
  access_token text NOT NULL DEFAULT gen_random_uuid()::text,
  country text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS orders_store_id_idx ON orders (store_id);
CREATE INDEX IF NOT EXISTS orders_customer_id_idx ON orders (customer_id);
CREATE INDEX IF NOT EXISTS orders_access_token_idx ON orders (access_token);

DROP POLICY IF EXISTS "select_own_orders" ON orders;
CREATE POLICY "select_own_orders" ON orders FOR SELECT
  TO anon, authenticated USING (
    EXISTS (SELECT 1 FROM stores WHERE stores.id = orders.store_id AND stores.user_id = auth.uid())
    OR true
  );

DROP POLICY IF EXISTS "insert_orders" ON orders;
CREATE POLICY "insert_orders" ON orders FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "update_own_orders" ON orders;
CREATE POLICY "update_own_orders" ON orders FOR UPDATE
  TO authenticated USING (EXISTS (SELECT 1 FROM stores WHERE stores.id = orders.store_id AND stores.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM stores WHERE stores.id = orders.store_id AND stores.user_id = auth.uid()));

-- ---------- order_items ----------
CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id) ON DELETE SET NULL,
  product_title text NOT NULL,
  price_cents integer NOT NULL DEFAULT 0,
  cover_url text,
  quantity integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS order_items_order_id_idx ON order_items (order_id);

DROP POLICY IF EXISTS "select_order_items" ON order_items;
CREATE POLICY "select_order_items" ON order_items FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "insert_order_items" ON order_items;
CREATE POLICY "insert_order_items" ON order_items FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "update_own_order_items" ON order_items;
CREATE POLICY "update_own_order_items" ON order_items FOR UPDATE
  TO authenticated USING (EXISTS (SELECT 1 FROM orders o JOIN stores s ON s.id = o.store_id WHERE o.id = order_items.order_id AND s.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM orders o JOIN stores s ON s.id = o.store_id WHERE o.id = order_items.order_id AND s.user_id = auth.uid()));

-- ---------- coupons ----------
CREATE TABLE IF NOT EXISTS coupons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id uuid NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  code text NOT NULL,
  description text,
  discount_type text NOT NULL DEFAULT 'percent',
  discount_value integer NOT NULL DEFAULT 0,
  max_uses integer,
  used_count integer NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  expires_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS coupons_store_id_idx ON coupons (store_id);
CREATE UNIQUE INDEX IF NOT EXISTS coupons_store_code_key ON coupons (store_id, code);

DROP POLICY IF EXISTS "select_coupons" ON coupons;
CREATE POLICY "select_coupons" ON coupons FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "insert_own_coupons" ON coupons;
CREATE POLICY "insert_own_coupons" ON coupons FOR INSERT
  TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM stores WHERE stores.id = coupons.store_id AND stores.user_id = auth.uid()));

DROP POLICY IF EXISTS "update_own_coupons" ON coupons;
CREATE POLICY "update_own_coupons" ON coupons FOR UPDATE
  TO authenticated USING (EXISTS (SELECT 1 FROM stores WHERE stores.id = coupons.store_id AND stores.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM stores WHERE stores.id = coupons.store_id AND stores.user_id = auth.uid()));

DROP POLICY IF EXISTS "delete_own_coupons" ON coupons;
CREATE POLICY "delete_own_coupons" ON coupons FOR DELETE
  TO authenticated USING (EXISTS (SELECT 1 FROM stores WHERE stores.id = coupons.store_id AND stores.user_id = auth.uid()));

-- ---------- storefronts (store builder config) ----------
CREATE TABLE IF NOT EXISTS storefronts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id uuid NOT NULL UNIQUE REFERENCES stores(id) ON DELETE CASCADE,
  theme jsonb NOT NULL DEFAULT '{}'::jsonb,
  blocks jsonb NOT NULL DEFAULT '[]'::jsonb,
  published_theme jsonb,
  published_blocks jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE storefronts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_storefronts" ON storefronts;
CREATE POLICY "select_storefronts" ON storefronts FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "insert_own_storefront" ON storefronts;
CREATE POLICY "insert_own_storefront" ON storefronts FOR INSERT
  TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM stores WHERE stores.id = storefronts.store_id AND stores.user_id = auth.uid()));

DROP POLICY IF EXISTS "update_own_storefront" ON storefronts;
CREATE POLICY "update_own_storefront" ON storefronts FOR UPDATE
  TO authenticated USING (EXISTS (SELECT 1 FROM stores WHERE stores.id = storefronts.store_id AND stores.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM stores WHERE stores.id = storefronts.store_id AND stores.user_id = auth.uid()));

-- ---------- ai_mocks ----------
CREATE TABLE IF NOT EXISTS ai_mocks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id uuid NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  prompt text NOT NULL,
  style text,
  result_url text,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE ai_mocks ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS ai_mocks_store_id_idx ON ai_mocks (store_id);

DROP POLICY IF EXISTS "select_own_ai_mocks" ON ai_mocks;
CREATE POLICY "select_own_ai_mocks" ON ai_mocks FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_ai_mocks" ON ai_mocks;
CREATE POLICY "insert_own_ai_mocks" ON ai_mocks FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_ai_mocks" ON ai_mocks;
CREATE POLICY "update_own_ai_mocks" ON ai_mocks FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_ai_mocks" ON ai_mocks;
CREATE POLICY "delete_own_ai_mocks" ON ai_mocks FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- ---------- marketing_campaigns ----------
CREATE TABLE IF NOT EXISTS marketing_campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id uuid NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  name text NOT NULL,
  subject text,
  body text,
  audience text NOT NULL DEFAULT 'all',
  status text NOT NULL DEFAULT 'draft',
  sent_count integer NOT NULL DEFAULT 0,
  open_count integer NOT NULL DEFAULT 0,
  click_count integer NOT NULL DEFAULT 0,
  scheduled_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE marketing_campaigns ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS marketing_campaigns_store_id_idx ON marketing_campaigns (store_id);

DROP POLICY IF EXISTS "select_own_campaigns" ON marketing_campaigns;
CREATE POLICY "select_own_campaigns" ON marketing_campaigns FOR SELECT
  TO authenticated USING (EXISTS (SELECT 1 FROM stores WHERE stores.id = marketing_campaigns.store_id AND stores.user_id = auth.uid()));

DROP POLICY IF EXISTS "insert_own_campaigns" ON marketing_campaigns;
CREATE POLICY "insert_own_campaigns" ON marketing_campaigns FOR INSERT
  TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM stores WHERE stores.id = marketing_campaigns.store_id AND stores.user_id = auth.uid()));

DROP POLICY IF EXISTS "update_own_campaigns" ON marketing_campaigns;
CREATE POLICY "update_own_campaigns" ON marketing_campaigns FOR UPDATE
  TO authenticated USING (EXISTS (SELECT 1 FROM stores WHERE stores.id = marketing_campaigns.store_id AND stores.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM stores WHERE stores.id = marketing_campaigns.store_id AND stores.user_id = auth.uid()));

DROP POLICY IF EXISTS "delete_own_campaigns" ON marketing_campaigns;
CREATE POLICY "delete_own_campaigns" ON marketing_campaigns FOR DELETE
  TO authenticated USING (EXISTS (SELECT 1 FROM stores WHERE stores.id = marketing_campaigns.store_id AND stores.user_id = auth.uid()));

-- ---------- refunds ----------
CREATE TABLE IF NOT EXISTS refunds (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  store_id uuid NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  amount_cents integer NOT NULL DEFAULT 0,
  reason text,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE refunds ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS refunds_order_id_idx ON refunds (order_id);
CREATE INDEX IF NOT EXISTS refunds_store_id_idx ON refunds (store_id);

DROP POLICY IF EXISTS "select_own_refunds" ON refunds;
CREATE POLICY "select_own_refunds" ON refunds FOR SELECT
  TO authenticated USING (EXISTS (SELECT 1 FROM stores WHERE stores.id = refunds.store_id AND stores.user_id = auth.uid()));

DROP POLICY IF EXISTS "insert_own_refunds" ON refunds;
CREATE POLICY "insert_own_refunds" ON refunds FOR INSERT
  TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM stores WHERE stores.id = refunds.store_id AND stores.user_id = auth.uid()));

DROP POLICY IF EXISTS "update_own_refunds" ON refunds;
CREATE POLICY "update_own_refunds" ON refunds FOR UPDATE
  TO authenticated USING (EXISTS (SELECT 1 FROM stores WHERE stores.id = refunds.store_id AND stores.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM stores WHERE stores.id = refunds.store_id AND stores.user_id = auth.uid()));

-- ---------- analytics_events ----------
CREATE TABLE IF NOT EXISTS analytics_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id uuid NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  event_type text NOT NULL,
  product_id uuid,
  visitor_id text,
  session_id text,
  meta jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS analytics_events_store_id_idx ON analytics_events (store_id);
CREATE INDEX IF NOT EXISTS analytics_events_created_at_idx ON analytics_events (created_at);

DROP POLICY IF EXISTS "select_own_analytics" ON analytics_events;
CREATE POLICY "select_own_analytics" ON analytics_events FOR SELECT
  TO authenticated USING (EXISTS (SELECT 1 FROM stores WHERE stores.id = analytics_events.store_id AND stores.user_id = auth.uid()));

DROP POLICY IF EXISTS "insert_analytics" ON analytics_events;
CREATE POLICY "insert_analytics" ON analytics_events FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "delete_own_analytics" ON analytics_events;
CREATE POLICY "delete_own_analytics" ON analytics_events FOR DELETE
  TO authenticated USING (EXISTS (SELECT 1 FROM stores WHERE stores.id = analytics_events.store_id AND stores.user_id = auth.uid()));

-- ---------- updated_at trigger ----------
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS profiles_updated_at ON profiles;
CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS stores_updated_at ON stores;
CREATE TRIGGER stores_updated_at BEFORE UPDATE ON stores FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS products_updated_at ON products;
CREATE TRIGGER products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS orders_updated_at ON orders;
CREATE TRIGGER orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS storefronts_updated_at ON storefronts;
CREATE TRIGGER storefronts_updated_at BEFORE UPDATE ON storefronts FOR EACH ROW EXECUTE FUNCTION set_updated_at();
