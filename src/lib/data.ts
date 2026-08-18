import { supabase } from './supabase';
import type { Store, Product, ProductFile, Order, OrderItem, Customer, Coupon, Storefront, StorefrontBlock, StorefrontTheme } from './types';
import { slugify, uid } from './utils';

// ---------- Store ----------
export async function getStoreBySlug(slug: string): Promise<Store | null> {
  const { data, error } = await supabase.from('stores').select('*').eq('slug', slug).maybeSingle();
  if (error) throw error;
  return data as Store | null;
}

export async function getStoreById(id: string): Promise<Store | null> {
  const { data, error } = await supabase.from('stores').select('*').eq('id', id).maybeSingle();
  if (error) throw error;
  return data as Store | null;
}

export async function getStoreForUser(userId: string): Promise<Store | null> {
  const { data, error } = await supabase.from('stores').select('*').eq('user_id', userId).maybeSingle();
  if (error) throw error;
  return data as Store | null;
}

export async function createStore(userId: string, input: {
  name: string;
  slug: string;
  tagline?: string;
  description?: string;
  contact_email?: string;
}): Promise<Store> {
  const { data, error } = await supabase
    .from('stores')
    .insert({
      user_id: userId,
      name: input.name,
      slug: slugify(input.slug) || slugify(input.name),
      tagline: input.tagline || null,
      description: input.description || null,
      contact_email: input.contact_email || null,
      currency: 'USD',
      published: false,
      social_links: {},
    })
    .select()
    .single();
  if (error) throw error;
  return data as Store;
}

export async function updateStore(id: string, patch: Partial<Store>): Promise<Store> {
  const { data, error } = await supabase.from('stores').update(patch).eq('id', id).select().single();
  if (error) throw error;
  return data as Store;
}

// ---------- Products ----------
export async function listProducts(storeId: string): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('store_id', storeId)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []) as Product[];
}

export async function listPublishedProducts(storeId: string): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('store_id', storeId)
    .eq('status', 'published')
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []) as Product[];
}

export async function getProduct(id: string): Promise<Product | null> {
  const { data, error } = await supabase.from('products').select('*').eq('id', id).maybeSingle();
  if (error) throw error;
  return data as Product | null;
}

export async function getProductBySlug(storeId: string, slug: string): Promise<Product | null> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('store_id', storeId)
    .eq('slug', slug)
    .maybeSingle();
  if (error) throw error;
  return data as Product | null;
}

export async function createProduct(storeId: string, input: Partial<Product>): Promise<Product> {
  const title = input.title || 'Untitled product';
  const slug = slugify(input.slug || title);
  const { data, error } = await supabase
    .from('products')
    .insert({
      store_id: storeId,
      title,
      slug: slug || `product-${Date.now().toString(36)}`,
      description: input.description || null,
      price_cents: input.price_cents ?? 0,
      compare_at_cents: input.compare_at_cents ?? null,
      cover_url: input.cover_url || null,
      category: input.category || null,
      tags: input.tags || [],
      status: input.status || 'draft',
      featured: input.featured ?? false,
      sort_order: input.sort_order ?? 0,
    })
    .select()
    .single();
  if (error) throw error;
  return data as Product;
}

export async function updateProduct(id: string, patch: Partial<Product>): Promise<Product> {
  const updatePatch: Record<string, unknown> = { ...patch };
  if (patch.slug) updatePatch.slug = slugify(patch.slug);
  const { data, error } = await supabase.from('products').update(updatePatch).eq('id', id).select().single();
  if (error) throw error;
  return data as Product;
}

export async function deleteProduct(id: string): Promise<void> {
  const { error } = await supabase.from('products').delete().eq('id', id);
  if (error) throw error;
}

// ---------- Product Files ----------
export async function listProductFiles(productId: string): Promise<ProductFile[]> {
  const { data, error } = await supabase
    .from('product_files')
    .select('*')
    .eq('product_id', productId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []) as ProductFile[];
}

export async function addProductFile(productId: string, file: {
  name: string;
  size_bytes: number;
  file_type: string;
  download_url: string;
}): Promise<ProductFile> {
  const { data, error } = await supabase
    .from('product_files')
    .insert({
      product_id: productId,
      name: file.name,
      size_bytes: file.size_bytes,
      file_type: file.file_type,
      download_url: file.download_url,
    })
    .select()
    .single();
  if (error) throw error;
  return data as ProductFile;
}

export async function deleteProductFile(id: string): Promise<void> {
  const { error } = await supabase.from('product_files').delete().eq('id', id);
  if (error) throw error;
}

// ---------- Orders ----------
export async function listOrders(storeId: string): Promise<Order[]> {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('store_id', storeId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []) as Order[];
}

export async function getOrder(id: string): Promise<Order | null> {
  const { data, error } = await supabase.from('orders').select('*').eq('id', id).maybeSingle();
  if (error) throw error;
  return data as Order | null;
}

export async function getOrderByToken(token: string): Promise<Order | null> {
  const { data, error } = await supabase.from('orders').select('*').eq('access_token', token).maybeSingle();
  if (error) throw error;
  return data as Order | null;
}

export async function listOrderItems(orderId: string): Promise<OrderItem[]> {
  const { data, error } = await supabase
    .from('order_items')
    .select('*')
    .eq('order_id', orderId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []) as OrderItem[];
}

export async function createOrder(input: {
  store_id: string;
  customer_email: string;
  customer_name?: string;
  subtotal_cents: number;
  discount_cents: number;
  total_cents: number;
  coupon_code?: string;
  payment_method: string;
  payment_status: string;
  payment_ref: string;
  country?: string;
  notes?: string;
  items: { product_id: string; product_title: string; price_cents: number; cover_url: string | null; quantity: number }[];
}): Promise<{ order: Order; customer: Customer | null }> {
  const { data: orderData, error: orderErr } = await supabase
    .from('orders')
    .insert({
      store_id: input.store_id,
      customer_email: input.customer_email,
      customer_name: input.customer_name || null,
      status: input.payment_status === 'success' ? 'completed' : 'pending',
      payment_method: input.payment_method,
      payment_status: input.payment_status,
      payment_ref: input.payment_ref,
      subtotal_cents: input.subtotal_cents,
      discount_cents: input.discount_cents,
      total_cents: input.total_cents,
      coupon_code: input.coupon_code || null,
      country: input.country || null,
      notes: input.notes || null,
    })
    .select()
    .single();
  if (orderErr) throw orderErr;
  const order = orderData as Order;

  const itemsRows = input.items.map((it) => ({
    order_id: order.id,
    product_id: it.product_id,
    product_title: it.product_title,
    price_cents: it.price_cents,
    cover_url: it.cover_url,
    quantity: it.quantity,
  }));
  if (itemsRows.length > 0) {
    const { error: itemsErr } = await supabase.from('order_items').insert(itemsRows);
    if (itemsErr) throw itemsErr;
  }

  // Upsert customer record
  let customer: Customer | null = null;
  const { data: existing } = await supabase
    .from('customers')
    .select('*')
    .eq('store_id', input.store_id)
    .eq('email', input.customer_email)
    .maybeSingle();

  if (existing) {
    const { data: updated, error: updErr } = await supabase
      .from('customers')
      .update({
        total_spent_cents: (existing as Customer).total_spent_cents + input.total_cents,
        orders_count: (existing as Customer).orders_count + 1,
      })
      .eq('id', (existing as Customer).id)
      .select()
      .single();
    if (updErr) throw updErr;
    customer = updated as Customer;
  } else {
    const { data: created, error: createErr } = await supabase
      .from('customers')
      .insert({
        store_id: input.store_id,
        email: input.customer_email,
        full_name: input.customer_name || null,
        country: input.country || null,
        total_spent_cents: input.total_cents,
        orders_count: 1,
      })
      .select()
      .single();
    if (createErr) throw createErr;
    customer = created as Customer;
  }

  // Update coupon usage
  if (input.coupon_code) {
    const { data: coupon } = await supabase
      .from('coupons')
      .select('*')
      .eq('store_id', input.store_id)
      .eq('code', input.coupon_code)
      .maybeSingle();
    if (coupon) {
      await supabase
        .from('coupons')
        .update({ used_count: (coupon as Coupon).used_count + 1 })
        .eq('id', (coupon as Coupon).id);
    }
  }

  return { order, customer };
}

export async function updateOrderStatus(id: string, status: string, paymentStatus?: string): Promise<Order> {
  const patch: Record<string, unknown> = { status };
  if (paymentStatus) patch.payment_status = paymentStatus;
  const { data, error } = await supabase.from('orders').update(patch).eq('id', id).select().single();
  if (error) throw error;
  return data as Order;
}

// ---------- Customers ----------
export async function listCustomers(storeId: string): Promise<Customer[]> {
  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .eq('store_id', storeId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []) as Customer[];
}

// ---------- Coupons ----------
export async function listCoupons(storeId: string): Promise<Coupon[]> {
  const { data, error } = await supabase
    .from('coupons')
    .select('*')
    .eq('store_id', storeId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []) as Coupon[];
}

export async function createCoupon(storeId: string, input: Partial<Coupon>): Promise<Coupon> {
  const { data, error } = await supabase
    .from('coupons')
    .insert({
      store_id: storeId,
      code: (input.code || '').toUpperCase().trim(),
      description: input.description || null,
      discount_type: input.discount_type || 'percent',
      discount_value: input.discount_value ?? 0,
      max_uses: input.max_uses ?? null,
      active: input.active ?? true,
      expires_at: input.expires_at ?? null,
    })
    .select()
    .single();
  if (error) throw error;
  return data as Coupon;
}

export async function updateCoupon(id: string, patch: Partial<Coupon>): Promise<Coupon> {
  const { data, error } = await supabase.from('coupons').update(patch).eq('id', id).select().single();
  if (error) throw error;
  return data as Coupon;
}

export async function deleteCoupon(id: string): Promise<void> {
  const { error } = await supabase.from('coupons').delete().eq('id', id);
  if (error) throw error;
}

export async function validateCoupon(storeId: string, code: string): Promise<{ valid: boolean; coupon: Coupon | null; message: string }> {
  const { data, error } = await supabase
    .from('coupons')
    .select('*')
    .eq('store_id', storeId)
    .eq('code', code.toUpperCase().trim())
    .maybeSingle();
  if (error) throw error;
  if (!data) return { valid: false, coupon: null, message: 'Coupon not found' };
  const coupon = data as Coupon;
  if (!coupon.active) return { valid: false, coupon, message: 'Coupon is inactive' };
  if (coupon.max_uses !== null && coupon.used_count >= coupon.max_uses)
    return { valid: false, coupon, message: 'Coupon usage limit reached' };
  if (coupon.expires_at && new Date(coupon.expires_at) < new Date())
    return { valid: false, coupon, message: 'Coupon has expired' };
  return { valid: true, coupon, message: 'Coupon applied' };
}

// ---------- Storefronts ----------
export const DEFAULT_THEME: StorefrontTheme = {
  primary: '#45C7B2',
  accent: '#FF8A3D',
  headingFont: 'Manrope',
  radius: 16,
  layout: 'centered',
};

export const DEFAULT_BLOCKS: StorefrontBlock[] = [
  {
    id: uid('blk'),
    type: 'hero',
    title: 'Premium digital products for creators',
    subtitle: 'Instant downloads. Secure checkout. Lifetime access.',
    ctaText: 'Browse products',
    bg: '#EAFBF6',
  },
  {
    id: uid('blk'),
    type: 'products',
    title: 'Featured products',
    limit: 6,
    columns: 3,
  },
  {
    id: uid('blk'),
    type: 'features',
    title: 'Why shop with us',
    items: [
      { icon: 'Download', title: 'Instant download', text: 'Get your files immediately after checkout.' },
      { icon: 'ShieldCheck', title: 'Secure payments', text: 'Card, mobile money, and PayPal supported.' },
      { icon: 'RefreshCw', title: 'Lifetime updates', text: 'Free updates for every product you buy.' },
    ],
  },
];

export async function getStorefront(storeId: string): Promise<Storefront | null> {
  const { data, error } = await supabase.from('storefronts').select('*').eq('store_id', storeId).maybeSingle();
  if (error) throw error;
  return data as Storefront | null;
}

export async function ensureStorefront(storeId: string): Promise<Storefront> {
  const existing = await getStorefront(storeId);
  if (existing) return existing;
  const { data, error } = await supabase
    .from('storefronts')
    .insert({
      store_id: storeId,
      theme: DEFAULT_THEME,
      blocks: DEFAULT_BLOCKS,
    })
    .select()
    .single();
  if (error) throw error;
  return data as Storefront;
}

export async function saveStorefront(storeId: string, theme: StorefrontTheme, blocks: StorefrontBlock[]): Promise<Storefront> {
  const existing = await getStorefront(storeId);
  if (existing) {
    const { data, error } = await supabase
      .from('storefronts')
      .update({ theme, blocks })
      .eq('store_id', storeId)
      .select()
      .single();
    if (error) throw error;
    return data as Storefront;
  }
  const { data, error } = await supabase
    .from('storefronts')
    .insert({ store_id: storeId, theme, blocks })
    .select()
    .single();
  if (error) throw error;
  return data as Storefront;
}

export async function publishStorefront(storeId: string, theme: StorefrontTheme, blocks: StorefrontBlock[]): Promise<Storefront> {
  const existing = await getStorefront(storeId);
  if (existing) {
    const { data, error } = await supabase
      .from('storefronts')
      .update({
        theme,
        blocks,
        published_theme: theme,
        published_blocks: blocks,
      })
      .eq('store_id', storeId)
      .select()
      .single();
    if (error) throw error;
    return data as Storefront;
  }
  const { data, error } = await supabase
    .from('storefronts')
    .insert({
      store_id: storeId,
      theme,
      blocks,
      published_theme: theme,
      published_blocks: blocks,
    })
    .select()
    .single();
  if (error) throw error;
  return data as Storefront;
}

// ---------- Refunds ----------
export async function listRefunds(storeId: string) {
  const { data, error } = await supabase
    .from('refunds')
    .select('*')
    .eq('store_id', storeId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function createRefund(orderId: string, storeId: string, amountCents: number, reason: string) {
  const { data, error } = await supabase
    .from('refunds')
    .insert({ order_id: orderId, store_id: storeId, amount_cents: amountCents, reason, status: 'approved' })
    .select()
    .single();
  if (error) throw error;
  await updateOrderStatus(orderId, 'refunded', 'refunded');
  return data;
}

// ---------- Analytics ----------
export async function trackEvent(storeId: string, eventType: string, meta: Record<string, unknown> = {}) {
  const visitorId = getVisitorId();
  const sessionId = getSessionId();
  await supabase.from('analytics_events').insert({
    store_id: storeId,
    event_type: eventType,
    visitor_id: visitorId,
    session_id: sessionId,
    meta,
    product_id: (meta.product_id as string) || null,
  });
}

export async function listAnalytics(storeId: string, days = 30) {
  const since = new Date();
  since.setDate(since.getDate() - days);
  const { data, error } = await supabase
    .from('analytics_events')
    .select('*')
    .eq('store_id', storeId)
    .gte('created_at', since.toISOString())
    .order('created_at', { ascending: true });
  if (error) throw error;
  return data || [];
}

const VISITOR_KEY = 'digitalia_visitor_id';
const SESSION_KEY = 'digitalia_session_id';

function getVisitorId(): string {
  let id = localStorage.getItem(VISITOR_KEY);
  if (!id) {
    id = `v_${Math.random().toString(36).slice(2)}`;
    localStorage.setItem(VISITOR_KEY, id);
  }
  return id;
}

function getSessionId(): string {
  let id = sessionStorage.getItem(SESSION_KEY);
  if (!id) {
    id = `s_${Math.random().toString(36).slice(2)}`;
    sessionStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

// ---------- AI Mocks ----------
export async function listAiMocks(storeId: string) {
  const { data, error } = await supabase
    .from('ai_mocks')
    .select('*')
    .eq('store_id', storeId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function createAiMock(storeId: string, prompt: string, style: string) {
  const { data, error } = await supabase
    .from('ai_mocks')
    .insert({ store_id: storeId, prompt, style, status: 'pending' })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateAiMock(id: string, patch: { status: string; result_url?: string }) {
  const { data, error } = await supabase.from('ai_mocks').update(patch).eq('id', id).select().single();
  if (error) throw error;
  return data;
}

export async function deleteAiMock(id: string) {
  const { error } = await supabase.from('ai_mocks').delete().eq('id', id);
  if (error) throw error;
}

// ---------- Marketing ----------
export async function listCampaigns(storeId: string) {
  const { data, error } = await supabase
    .from('marketing_campaigns')
    .select('*')
    .eq('store_id', storeId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function createCampaign(storeId: string, input: { name: string; subject: string; body: string; audience: string }) {
  const { data, error } = await supabase
    .from('marketing_campaigns')
    .insert({
      store_id: storeId,
      name: input.name,
      subject: input.subject,
      body: input.body,
      audience: input.audience,
      status: 'draft',
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateCampaign(id: string, patch: Record<string, unknown>) {
  const { data, error } = await supabase.from('marketing_campaigns').update(patch).eq('id', id).select().single();
  if (error) throw error;
  return data;
}

export async function deleteCampaign(id: string) {
  const { error } = await supabase.from('marketing_campaigns').delete().eq('id', id);
  if (error) throw error;
}

export async function sendCampaign(id: string, storeId: string) {
  const customers = await listCustomers(storeId);
  const sentCount = customers.length;
  const openCount = Math.floor(sentCount * 0.42);
  const clickCount = Math.floor(sentCount * 0.18);
  const { data, error } = await supabase
    .from('marketing_campaigns')
    .update({ status: 'sent', sent_count: sentCount, open_count: openCount, click_count: clickCount })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}
