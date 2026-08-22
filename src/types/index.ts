// ============================================================
// Types — Reunion Kit 100 Tahun Gontor Pre-Order System
// ============================================================

export type ProductType = 'SIMPLE' | 'VARIABLE' | 'PACKAGE'
export type AdminRole = 'super_admin' | 'admin' | 'finance' | 'operator'
export type FulfillmentMethod = 'PICKUP' | 'DELIVERY'
export type AutomatedValidationStatus =
  | 'AUTO_VALID'
  | 'NEEDS_REVIEW'
  | 'AMOUNT_MISMATCH'
  | 'DATE_MISMATCH'
  | 'ACCOUNT_MISMATCH'
  | 'OCR_FAILED'
  | 'INVALID_FILE'

export type OrderStatus =
  | 'DRAFT'
  | 'PROOF_UPLOADED'
  | 'PAYMENT_REVIEW'
  | 'PAID'
  | 'PROCESSING'
  | 'READY_FOR_PICKUP'
  | 'SHIPPED'
  | 'COMPLETED'
  | 'REJECTED'
  | 'CANCELLED'

export type PaymentStatus =
  | 'UNPAID'
  | 'PROOF_UPLOADED'
  | 'UNDER_REVIEW'
  | 'PAID'
  | 'REJECTED'

export type PreorderStatus = 'SCHEDULED' | 'OPEN' | 'CLOSED'

// ============================================================
// Database types
// ============================================================

export interface Product {
  id: string
  product_code: string
  name: string
  slug: string
  description: string | null
  product_type: ProductType
  price: number
  image_drive_file_id: string | null
  image_url: string | null
  image_filename: string | null
  has_variants: boolean
  stock_enabled: boolean
  stock: number | null
  weight_gram?: number | null
  is_active: boolean
  display_order: number
  created_at: string
  updated_at: string
  variants?: ProductVariant[]
}

export interface ProductVariant {
  id: string
  product_id: string
  sku: string | null
  name: string
  price: number
  stock: number | null
  is_active: boolean
  display_order: number
  created_at: string
  updated_at: string
}

export interface Package {
  id: string
  package_code: string
  name: string
  description: string | null
  price: number
  image_drive_file_id: string | null
  image_url: string | null
  image_filename: string | null
  is_active: boolean
  display_order: number
  created_at: string
  updated_at: string
  items?: PackageItem[]
}

export interface PackageItem {
  id: string
  package_id: string
  product_id: string
  variant_id: string | null
  quantity: number
  product?: Product
  variant?: ProductVariant
}

export interface Order {
  id: string
  order_number: string
  is_alumni: boolean
  email: string | null
  stambuk: string
  full_name: string
  district: string
  generation_year: number
  whatsapp: string
  fulfillment_method: FulfillmentMethod
  shipping_address: string | null
  shipping_village: string | null
  shipping_district: string | null
  shipping_city: string | null
  shipping_province: string | null
  shipping_postal_code: string | null
  subtotal: number
  shipping_cost: number
  total_amount: number
  payment_status: PaymentStatus
  order_status: OrderStatus
  payment_proof_file_id: string | null
  payment_proof_url: string | null
  payment_proof_filename: string | null
  payment_proof_mime_type: string | null
  payment_proof_size: number | null
  payment_proof_uploaded_at: string | null
  detected_payment_date: string | null
  detected_payment_amount: number | null
  detected_recipient_name: string | null
  detected_recipient_account: string | null
  ocr_confidence: number | null
  automated_validation_status: AutomatedValidationStatus | null
  admin_note: string | null
  validated_by: string | null
  validated_at: string | null
  created_at: string
  updated_at: string
  items?: OrderItem[]
  order_items?: OrderItem[]
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string | null
  variant_id: string | null
  package_id: string | null
  item_type: 'PRODUCT' | 'VARIANT' | 'PACKAGE'
  item_name_snapshot: string
  variant_name_snapshot: string | null
  unit_price_snapshot: number
  quantity: number
  subtotal: number
  created_at: string
}

export interface PaymentMethod {
  id: string
  bank_name: string
  account_number: string
  account_holder: string
  is_active: boolean
  display_order: number
  created_at: string
  updated_at: string
}

export interface EventSettings {
  id: string
  event_name: string
  event_description: string | null
  preorder_start: string | null
  preorder_end: string | null
  timezone: string
  is_active: boolean
  favicon_url: string | null
  // Footer customization
  footer_tagline: string | null
  footer_hashtags: string | null
  contact_whatsapp: string | null
  social_instagram: string | null
  created_at: string
  updated_at: string
}


export interface AdminProfile {
  id: string
  user_id: string
  full_name: string
  role: AdminRole
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface AuditLog {
  id: string
  admin_id: string | null
  action: string
  entity_type: string
  entity_id: string | null
  old_data: Record<string, unknown> | null
  new_data: Record<string, unknown> | null
  created_at: string
  admin?: AdminProfile
}

// ============================================================
// Cart types (localStorage)
// ============================================================

export interface CartItem {
  id: string // unique cart item id
  productId?: string
  variantId?: string
  packageId?: string
  itemType: 'PRODUCT' | 'VARIANT' | 'PACKAGE'
  name: string
  variantName?: string
  unitPrice: number
  quantity: number
  weightGram?: number | null
  imageUrl?: string | null
  maxStock?: number | null
}

export interface Cart {
  items: CartItem[]
  subtotal: number
}

// ============================================================
// Checkout draft (localStorage)
// ============================================================

export interface CheckoutDraft {
  draftId: string
  isAlumni?: boolean
  stambuk: string
  name: string
  generationYear: string
  whatsapp: string
  email?: string
  fulfillmentMethod: FulfillmentMethod | null
  address: {
    fullAddress: string
    village: string
    district: string
    city: string
    province: string
    postalCode: string
    courierName?: string
    shippingCost?: number
    googleMapsUrl?: string
    latitude?: number
    longitude?: number
  }
  cart: CartItem[]
  paymentStep: number
  createdAt: string
  updatedAt: string
}

// ============================================================
// Server action results
// ============================================================

export interface ActionResult<T = void> {
  success: boolean
  data?: T
  error?: string
}

export interface CreateOrderResult {
  orderNumber: string
  orderId: string
  totalAmount: number
}
