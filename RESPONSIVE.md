# RESPONSIVE.md
# Responsive Adaptation & UX Audit
## Reunion Kit 100 Tahun Gontor

## 1. OBJECTIVE

Lakukan comprehensive responsive adaptation terhadap aplikasi yang SUDAH ADA.

IMPORTANT:

Website saat ini SUDAH memiliki:
- design system
- visual direction
- page structure
- business flow
- database integration
- Supabase integration
- cart system
- checkout
- payment flow
- payment proof upload
- location picker
- admin functionality

JANGAN membangun ulang aplikasi.
JANGAN mengganti flow aplikasi.
JANGAN mengubah business logic.
JANGAN mengubah database schema kecuali benar-benar diperlukan untuk memperbaiki bug.
JANGAN mengganti visual identity yang sudah ada.

Tugas utama:
> Adapt existing implementation so it feels intentionally designed for mobile, tablet, and desktop.

Bukan sekadar mengecilkan ukuran desktop.
Responsive implementation harus terasa seperti desain yang memang dirancang untuk setiap ukuran layar.

---

# 2. CORE PRINCIPLE

Gunakan prinsip:

DESKTOP → optimized for information density and wide layouts
TABLET → balanced layout
MOBILE → simplified, prioritized, touch-friendly layout

Jangan menggunakan pendekatan:
Desktop layout -> scale down -> mobile

Tetapi:
Existing UI -> Responsive adaptation -> same flow -> different composition when necessary

---

# 3. ABSOLUTE CONSTRAINTS

JANGAN mengubah:
- URL / routing
- checkout sequence
- cart logic
- product logic
- authentication
- Supabase queries
- order creation logic
- payment validation
- Google Drive upload flow
- payment proof flow
- admin workflow
- order status
- product schema
- pricing logic
- stock logic

JANGAN menghapus functionality hanya karena sulit dibuat responsive.
Jika sebuah component tidak cocok pada mobile -> adapt component-nya, bukan hapus component.

---

# 4. FIRST STEP — AUDIT EXISTING CODE
Sebelum melakukan perubahan:
1. Inspect seluruh frontend.
2. Identify global layout.
3. Identify responsive breakpoints yang sudah digunakan.
4. Identify shared components.
5. Identify pages.
6. Identify components dengan fixed width.
7. Identify overflow horizontal.
8. Identify modal/dialog yang tidak cocok mobile.
9. Identify table yang tidak cocok mobile.
10. Identify form yang terlalu padat.
11. Identify image dengan fixed dimensions.
12. Identify navigation yang terlalu lebar.
13. Identify button yang terlalu kecil.
14. Identify text yang overflow.
15. Identify components yang bergantung pada viewport width.

---

# 5. RESPONSIVE BREAKPOINTS
Mobile: < 640px
Tablet: 640px – 1023px
Desktop: 1024px – 1439px
Large Desktop: ≥ 1440px

Pertahankan Tailwind configuration jika sudah baik.

---

# 6-104. STANDARDS & GUIDELINES
(See detailed execution plan and audit checklist below)
