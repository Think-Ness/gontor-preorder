import { z } from 'zod'

// ============================================================
// Customer Data Schema
// ============================================================
export const customerSchema = z.object({
  stambuk: z.string().min(1, 'Stambuk wajib diisi'),
  full_name: z.string().min(2, 'Nama lengkap wajib diisi'),
  district: z.string().min(1, 'Daerah wajib diisi'),
  generation_year: z
    .number({ message: 'Angkatan harus berupa angka' })
    .int()
    .min(1926, 'Angkatan tidak valid')
    .max(new Date().getFullYear(), 'Angkatan tidak valid'),
  whatsapp: z
    .string()
    .min(1, 'Nomor WhatsApp wajib diisi')
    .regex(/^(\+62|62|0)8[1-9][0-9]{6,11}$/, 'Format nomor HP Indonesia tidak valid'),
})

export type CustomerFormData = z.infer<typeof customerSchema>

// ============================================================
// Address Schema
// ============================================================
export const addressSchema = z.object({
  shipping_address: z.string().min(5, 'Alamat lengkap wajib diisi'),
  shipping_village: z.string().min(1, 'Desa/Kelurahan wajib diisi'),
  shipping_district: z.string().min(1, 'Kecamatan wajib diisi'),
  shipping_city: z.string().min(1, 'Kabupaten/Kota wajib diisi'),
  shipping_province: z.string().min(1, 'Provinsi wajib diisi'),
  shipping_postal_code: z
    .string()
    .regex(/^\d{5}$/, 'Kode pos harus 5 digit'),
})

export type AddressFormData = z.infer<typeof addressSchema>

// ============================================================
// Order Creation Schema
// ============================================================
export const createOrderSchema = z.object({
  // Customer
  stambuk: z.string().min(1),
  full_name: z.string().min(2),
  district: z.string().min(1),
  generation_year: z.number().int(),
  whatsapp: z.string().min(1),

  // Fulfillment
  fulfillment_method: z.enum(['PICKUP', 'DELIVERY']),

  // Address (required for DELIVERY)
  shipping_address: z.string().optional(),
  shipping_village: z.string().optional(),
  shipping_district: z.string().optional(),
  shipping_city: z.string().optional(),
  shipping_province: z.string().optional(),
  shipping_postal_code: z.string().optional(),

  // Cart items
  items: z
    .array(
      z.object({
        productId: z.string().uuid().optional(),
        variantId: z.string().uuid().optional(),
        packageId: z.string().uuid().optional(),
        itemType: z.enum(['PRODUCT', 'VARIANT', 'PACKAGE']),
        quantity: z.number().int().min(1).max(100),
      })
    )
    .min(1, 'Keranjang tidak boleh kosong'),

  // Payment proof
  payment_proof_file_id: z.string().min(1, 'Bukti pembayaran wajib diupload'),
  payment_proof_filename: z.string().min(1),
  payment_proof_mime_type: z.string().min(1),
  payment_proof_size: z.number().int().positive(),

  // Idempotency
  checkout_session_id: z.string().uuid(),
})

export type CreateOrderInput = z.infer<typeof createOrderSchema>

// ============================================================
// Product Admin Schema
// ============================================================
export const productSchema = z.object({
  product_code: z.string().min(1, 'Kode produk wajib diisi'),
  name: z.string().min(2, 'Nama produk wajib diisi'),
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/, 'Slug hanya boleh huruf kecil, angka, dan tanda hubung'),
  description: z.string().optional(),
  product_type: z.enum(['SIMPLE', 'VARIABLE', 'PACKAGE']),
  price: z.number().min(0, 'Harga tidak boleh negatif'),
  has_variants: z.boolean(),
  stock_enabled: z.boolean(),
  stock: z.number().int().min(0).optional().nullable(),
  is_active: z.boolean(),
  display_order: z.number().int().min(0),
  image_drive_file_id: z.string().optional().nullable(),
  image_url: z.string().optional().nullable(),
  image_filename: z.string().optional().nullable(),
})

export type ProductFormData = z.infer<typeof productSchema>

export const productVariantSchema = z.object({
  sku: z.string().optional(),
  name: z.string().min(1, 'Nama varian wajib diisi'),
  price: z.number().min(0),
  stock: z.number().int().min(0).optional().nullable(),
  is_active: z.boolean(),
  display_order: z.number().int().min(0),
})

export type ProductVariantFormData = z.infer<typeof productVariantSchema>

// ============================================================
// Package Schema
// ============================================================
export const packageSchema = z.object({
  package_code: z.string().min(1),
  name: z.string().min(2),
  description: z.string().optional(),
  price: z.number().min(0),
  is_active: z.boolean(),
  display_order: z.number().int().min(0),
  image_drive_file_id: z.string().optional().nullable(),
  image_url: z.string().optional().nullable(),
  image_filename: z.string().optional().nullable(),
  items: z.array(
    z.object({
      product_id: z.string().uuid(),
      variant_id: z.string().uuid().optional().nullable(),
      quantity: z.number().int().min(1),
    })
  ),
})

export type PackageFormData = z.infer<typeof packageSchema>

// ============================================================
// Payment Method Schema
// ============================================================
export const paymentMethodSchema = z.object({
  bank_name: z.string().min(1, 'Nama bank wajib diisi'),
  account_number: z.string().min(5, 'Nomor rekening wajib diisi'),
  account_holder: z.string().min(2, 'Nama pemegang rekening wajib diisi'),
  is_active: z.boolean(),
  display_order: z.number().int().min(0),
})

export type PaymentMethodFormData = z.infer<typeof paymentMethodSchema>

// ============================================================
// Event Settings Schema
// ============================================================
export const eventSettingsSchema = z.object({
  event_name: z.string().min(1),
  event_description: z.string().optional(),
  preorder_start: z.string().datetime().optional().nullable(),
  preorder_end: z.string().datetime().optional().nullable(),
  timezone: z.string().min(1),
  is_active: z.boolean(),
})

export type EventSettingsFormData = z.infer<typeof eventSettingsSchema>
