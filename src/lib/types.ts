export type UUID = string;

export type Profile = {
  id: UUID;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  onboarding_complete: boolean;
  created_at: string;
  updated_at: string;
};

export type Store = {
  id: UUID;
  user_id: UUID;
  name: string;
  slug: string;
  tagline: string | null;
  description: string | null;
  logo_url: string | null;
  cover_url: string | null;
  currency: string;
  published: boolean;
  contact_email: string | null;
  social_links: Record<string, string>;
  created_at: string;
  updated_at: string;
};

export type ProductStatus = 'draft' | 'published' | 'archived';

export type Product = {
  id: UUID;
  store_id: UUID;
  title: string;
  slug: string;
  description: string | null;
  price_cents: number;
  compare_at_cents: number | null;
  cover_url: string | null;
  category: string | null;
  tags: string[];
  status: ProductStatus;
  featured: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type ProductFile = {
  id: UUID;
  product_id: UUID;
  name: string;
  size_bytes: number;
  file_type: string | null;
  storage_path: string | null;
  download_url: string | null;
  created_at: string;
};

export type Customer = {
  id: UUID;
  store_id: UUID;
  email: string;
  full_name: string | null;
  country: string | null;
  total_spent_cents: number;
  orders_count: number;
  created_at: string;
};

export type OrderStatus =
  | 'pending'
  | 'completed'
  | 'failed'
  | 'cancelled'
  | 'refunded';

export type PaymentStatus =
  | 'pending'
  | 'success'
  | 'failed'
  | 'declined'
  | 'timeout'
  | 'cancelled'
  | 'refunded'
  | 'insufficient_funds';

export type PaymentMethod = 'card' | 'mobile_money' | 'paypal';

export type Order = {
  id: UUID;
  store_id: UUID;
  customer_id: UUID | null;
  customer_email: string;
  customer_name: string | null;
  status: OrderStatus;
  payment_method: PaymentMethod | null;
  payment_status: PaymentStatus;
  payment_ref: string | null;
  subtotal_cents: number;
  discount_cents: number;
  total_cents: number;
  currency: string;
  coupon_code: string | null;
  access_token: string;
  country: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type OrderItem = {
  id: UUID;
  order_id: UUID;
  product_id: UUID | null;
  product_title: string;
  price_cents: number;
  cover_url: string | null;
  quantity: number;
  created_at: string;
};

export type Coupon = {
  id: UUID;
  store_id: UUID;
  code: string;
  description: string | null;
  discount_type: 'percent' | 'fixed';
  discount_value: number;
  max_uses: number | null;
  used_count: number;
  active: boolean;
  expires_at: string | null;
  created_at: string;
};

export type StorefrontBlock =
  | { id: string; type: 'hero'; title: string; subtitle: string; ctaText: string; bg: string }
  | { id: string; type: 'products'; title: string; limit: number; columns: number }
  | { id: string; type: 'features'; title: string; items: { icon: string; title: string; text: string }[] }
  | { id: string; type: 'text'; title: string; body: string }
  | { id: string; type: 'image'; src: string; caption: string; rounded: boolean }
  | { id: string; type: 'banner'; text: string; bg: string };

export type StorefrontTheme = {
  primary: string;
  accent: string;
  headingFont: string;
  radius: number;
  layout: 'centered' | 'full';
};

export type Storefront = {
  id: UUID;
  store_id: UUID;
  theme: StorefrontTheme;
  blocks: StorefrontBlock[];
  published_theme: StorefrontTheme | null;
  published_blocks: StorefrontBlock[] | null;
  updated_at: string;
};

export type AiMock = {
  id: UUID;
  store_id: UUID;
  user_id: UUID;
  prompt: string;
  style: string | null;
  result_url: string | null;
  status: 'pending' | 'completed' | 'failed';
  created_at: string;
};

export type MarketingCampaign = {
  id: UUID;
  store_id: UUID;
  name: string;
  subject: string | null;
  body: string | null;
  audience: string;
  status: 'draft' | 'scheduled' | 'sent';
  sent_count: number;
  open_count: number;
  click_count: number;
  scheduled_at: string | null;
  created_at: string;
};

export type Refund = {
  id: UUID;
  order_id: UUID;
  store_id: UUID;
  amount_cents: number;
  reason: string | null;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
};

export type AnalyticsEvent = {
  id: UUID;
  store_id: UUID;
  event_type: string;
  product_id: UUID | null;
  visitor_id: string | null;
  session_id: string | null;
  meta: Record<string, unknown>;
  created_at: string;
};
