import nodemailer from 'nodemailer'
import { formatRupiah } from '@/lib/utils'

function getTransporter() {
  const host = process.env.SMTP_HOST
  const port = Number(process.env.SMTP_PORT ?? 587)
  const user = process.env.SMTP_USER
  const pass = process.env.SMTP_PASS

  if (!host || !user || !pass) {
    return null
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  })
}

const FROM_EMAIL = process.env.SMTP_FROM || 'Panitia 100 Tahun Gontor <no-reply@gontor.ac.id>'

// Shared email layout wrapper
function wrapEmailHtml(contentHtml: string) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reunion Kit 100 Tahun Gontor</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f4f5f7; margin: 0; padding: 20px; color: #1f2937; }
    .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
    .header { background: #0D4A2B; padding: 24px; text-align: center; color: #ffffff; }
    .header h1 { margin: 0; font-size: 20px; font-weight: 700; letter-spacing: 0.5px; }
    .header p { margin: 4px 0 0 0; font-size: 12px; opacity: 0.85; }
    .body { padding: 32px 24px; }
    .footer { background: #f9fafb; padding: 20px; text-align: center; font-size: 12px; color: #6b7280; border-top: 1px solid #f3f4f6; }
    .card { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 12px; padding: 16px; margin: 16px 0; }
    .badge { display: inline-block; padding: 4px 12px; border-radius: 9999px; font-size: 12px; font-weight: 600; text-transform: uppercase; }
    .badge-amber { background: #fef3c7; color: #92400e; }
    .badge-green { background: #dcfce7; color: #166534; }
    .badge-blue { background: #dbeafe; color: #1e40af; }
    .badge-red { background: #fee2e2; color: #991b1b; }
    .button { display: inline-block; background: #0D4A2B; color: #ffffff !important; padding: 12px 24px; border-radius: 8px; font-weight: 600; text-decoration: none; margin-top: 16px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>100 TAHUN GONTOR</h1>
      <p>Official Merchandise & Reunion Kit Pre-Order</p>
    </div>
    <div class="body">
      ${contentHtml}
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} Panitia 100 Tahun Gontor. Hak cipta dilindungi.</p>
      <p>Jika ada pertanyaan, hubungi panitia melalui kontak WhatsApp resmi.</p>
    </div>
  </div>
</body>
</html>
  `
}

// 1. Email Order Received & Payment Proof Uploaded
export async function sendOrderReceivedEmail(toEmail: string, order: {
  orderNumber: string
  fullName: string
  totalAmount: number
}) {
  const transporter = getTransporter()
  if (!transporter || !toEmail) {
    console.log(`[Email Skipped] Order Received for ${order.orderNumber}`)
    return
  }

  const content = `
    <h2>Halo, ${order.fullName}!</h2>
    <p>Terima kasih telah melakukan pemesanan Reunion Kit 100 Tahun Gontor.</p>
    
    <div class="card">
      <p style="margin:0 0 8px 0; font-size:12px; color:#6b7280;">NOMOR PESANAN</p>
      <p style="margin:0; font-size:22px; font-weight:800; color:#0D4A2B;">${order.orderNumber}</p>
      <hr style="border:none; border-top:1px dashed #e5e7eb; margin:12px 0;">
      <p style="margin:0; font-size:14px; font-weight:600;">Total Pembayaran: ${formatRupiah(order.totalAmount)}</p>
      <p style="margin:4px 0 0 0; font-size:12px; color:#6b7280;">Status: <span class="badge badge-amber">Sedang Diverifikasi Panitia</span></p>
    </div>

    <p>Bukti pembayaran Anda telah berhasil kami terima dan sedang dalam proses verifikasi oleh panitia keuangan. Anda akan menerima notifikasi email berikutnya setelah pembayaran dikonfirmasi.</p>
  `

  try {
    await transporter.sendMail({
      from: FROM_EMAIL,
      to: toEmail,
      subject: `[${order.orderNumber}] Bukti Pembayaran Diterima - 100 Tahun Gontor`,
      html: wrapEmailHtml(content),
    })
    console.log(`[Email Sent] Order Received for ${order.orderNumber}`)
  } catch (err) {
    console.error('[Email Error]', err)
  }
}

// 2. Email Payment Approved (Processing Order)
export async function sendPaymentApprovedEmail(toEmail: string, order: {
  orderNumber: string
  fullName: string
  fulfillmentMethod: 'PICKUP' | 'DELIVERY'
}) {
  const transporter = getTransporter()
  if (!transporter || !toEmail) {
    console.log(`[Email Skipped] Payment Approved for ${order.orderNumber}`)
    return
  }

  const fulfillmentInfo = order.fulfillmentMethod === 'PICKUP'
    ? `<p style="margin:8px 0 0 0; font-size:13px; color:#166534;"><strong>Metode Pengambilan:</strong> Ambil Mandiri di Stand Panitia saat Acara 100 Tahun Gontor.</p>`
    : `<p style="margin:8px 0 0 0; font-size:13px; color:#166534;"><strong>Metode Pengiriman:</strong> Dikirim ke alamat yang telah Anda daftarkan.</p>`

  const content = `
    <h2>Pembayaran Diverifikasi! 🎉</h2>
    <p>Halo, <strong>${order.fullName}</strong>. Pembayaran Anda untuk pesanan <strong>${order.orderNumber}</strong> telah berhasil diverifikasi oleh panitia.</p>

    <div class="card" style="background:#f0fdf4; border-color:#bbf7d0;">
      <p style="margin:0; font-size:14px; font-weight:700; color:#166534;">STATUS PESANAN: DIPROSES</p>
      ${fulfillmentInfo}
    </div>

    <p>Pesanan Anda sedang disiapkan. Kami akan mengirimkan notifikasi lagi saat merchandise Anda siap diambil / siap dikirim!</p>
  `

  try {
    await transporter.sendMail({
      from: FROM_EMAIL,
      to: toEmail,
      subject: `[${order.orderNumber}] Pembayaran Diverifikasi & Pesanan Diproses - 100 Tahun Gontor`,
      html: wrapEmailHtml(content),
    })
    console.log(`[Email Sent] Payment Approved for ${order.orderNumber}`)
  } catch (err) {
    console.error('[Email Error]', err)
  }
}

// 3. Email Payment Rejected / Need Re-upload
export async function sendPaymentRejectedEmail(toEmail: string, order: {
  orderNumber: string
  fullName: string
}, reason: string) {
  const transporter = getTransporter()
  if (!transporter || !toEmail) {
    console.log(`[Email Skipped] Payment Rejected for ${order.orderNumber}`)
    return
  }

  const content = `
    <h2>Upload Ulang Bukti Pembayaran ⚠️</h2>
    <p>Halo, <strong>${order.fullName}</strong>. Bukti pembayaran untuk pesanan <strong>${order.orderNumber}</strong> memerlukan konfirmasi ulang.</p>

    <div class="card" style="background:#fef2f2; border-color:#fecaca;">
      <p style="margin:0; font-size:13px; font-weight:700; color:#991b1b;">Catatan Panitia:</p>
      <p style="margin:4px 0 0 0; font-size:14px; color:#7f1d1d;">"${reason}"</p>
    </div>

    <p>Mohon pastikan nominal transfer dan foto bukti pembayaran terlihat jelas. Silakan upload ulang bukti transfer Anda melalui formulir pemesanan.</p>
  `

  try {
    await transporter.sendMail({
      from: FROM_EMAIL,
      to: toEmail,
      subject: `[${order.orderNumber}] Perlu Upload Ulang Bukti Pembayaran - 100 Tahun Gontor`,
      html: wrapEmailHtml(content),
    })
    console.log(`[Email Sent] Payment Rejected for ${order.orderNumber}`)
  } catch (err) {
    console.error('[Email Error]', err)
  }
}

// 4. Email Status Updated (Ready for Pickup / Shipped)
export async function sendOrderStatusUpdatedEmail(toEmail: string, order: {
  orderNumber: string
  fullName: string
  status: string
  fulfillmentMethod: 'PICKUP' | 'DELIVERY'
}) {
  const transporter = getTransporter()
  if (!transporter || !toEmail) {
    console.log(`[Email Skipped] Status Update for ${order.orderNumber}`)
    return
  }

  let title = 'Update Pesanan Anda'
  let bodyText = ''

  if (order.status === 'READY_FOR_PICKUP') {
    title = 'Siap Diambil di Stand Panitia! 🎒'
    bodyText = `<p>Pesanan Anda <strong>${order.orderNumber}</strong> sudah siap diambil! Silakan tunjukkan email atau nomor order ini kepada petugas di stand merchandise 100 Tahun Gontor.</p>`
  } else if (order.status === 'SHIPPED') {
    title = 'Pesanan Sedang Dikirim! 🚚'
    bodyText = `<p>Pesanan Anda <strong>${order.orderNumber}</strong> telah diserahkan kepada kurir pengiriman dan dalam perjalanan ke alamat Anda.</p>`
  } else if (order.status === 'COMPLETED') {
    title = 'Pesanan Selesai! Terima Kasih ✨'
    bodyText = `<p>Pesanan Anda <strong>${order.orderNumber}</strong> telah selesai diserahterimakan. Terima kasih atas partisipasi Anda dalam peringatan 100 Tahun Gontor!</p>`
  } else {
    bodyText = `<p>Status pesanan Anda <strong>${order.orderNumber}</strong> telah diperbarui menjadi: <strong>${order.status}</strong>.</p>`
  }

  const content = `
    <h2>${title}</h2>
    <p>Halo, <strong>${order.fullName}</strong>.</p>
    ${bodyText}
    <div class="card">
      <p style="margin:0; font-size:12px; color:#6b7280;">NOMOR ORDER</p>
      <p style="margin:0; font-size:18px; font-weight:800; color:#0D4A2B;">${order.orderNumber}</p>
    </div>
  `

  try {
    await transporter.sendMail({
      from: FROM_EMAIL,
      to: toEmail,
      subject: `[${order.orderNumber}] ${title}`,
      html: wrapEmailHtml(content),
    })
    console.log(`[Email Sent] Status Update for ${order.orderNumber}`)
  } catch (err) {
    console.error('[Email Error]', err)
  }
}
