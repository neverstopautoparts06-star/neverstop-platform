# NEVERSTOP Platform — V1 Requirements

Version: 1.0  
Status: Planning  
Market: Vietnam  
Primary Language: Vietnamese  
Business: Automotive Parts / Shock Absorbers

---

# 1. Project Goal

NEVERSTOP V1 is an automotive parts website and sales platform focused on the Vietnam market.

The first product category is:

- Shock Absorber
- Giảm xóc ô tô

The architecture must allow additional automotive parts categories in the future.

V1 is NOT intended to be a complex marketplace.

The primary customer journey is:

Vehicle Search
→ Product Match
→ Product Detail
→ Zalo / Inquiry
→ Price Confirmation
→ Order
→ BIDV VietQR Payment
→ Payment Verification
→ Fulfillment

---

# 2. Core Principles

1. Vietnam market first.
2. Mobile-first design.
3. Vietnamese is the primary language.
4. Product and vehicle data must be structured.
5. Product data must be reusable by the inventory system.
6. Customers must be able to find products by vehicle.
7. Customers must be able to search by OE number.
8. Customers must be able to search by NEVERSTOP part number.
9. Zalo inquiry is a primary conversion method.
10. Online payment is secondary to vehicle fitment confirmation.
11. Payment providers must be replaceable.
12. Bank information must NOT be hardcoded into frontend code.
13. System architecture must support future expansion.
14. Website speed and SEO are higher priority than complex animations.
15. Administration must be usable by non-technical staff.

---

# 3. V1 Main Navigation

Main navigation:

- Trang chủ
- Sản phẩm
- Tra cứu theo xe
- Về NEVERSTOP
- Hỗ trợ
- Liên hệ

Persistent actions:

- Search
- Zalo
- Call
- Language switcher

---

# 4. Languages

Architecture must support:

- Vietnamese
- English
- Chinese

Suggested URL structure:

/vi/
/en/
/zh/

Vietnamese is the default and must be complete in V1.

English and Chinese can be gradually completed later.

---

# 5. Homepage

Homepage sections:

## 5.1 Hero

Display:

NEVERSTOP

Giảm xóc ô tô

Supporting messages:

- Hanoi Local Stock
- Nationwide Delivery
- Vehicle Fitment Support

Primary CTA:

Tra cứu giảm xóc

Secondary CTA:

Liên hệ Zalo

The customer should understand within 3 seconds that NEVERSTOP supplies automotive shock absorbers and automotive parts.

---

## 5.2 Vehicle Search

Search flow:

Vehicle Brand
→ Vehicle Model
→ Model Code / Generation
→ Year
→ Compatible Products

Example:

Toyota
→ Vios
→ NCP150
→ 2014-
→ Front / Rear Shock Absorber

---

## 5.3 Popular Vehicles

Examples:

- Toyota Vios
- Toyota Innova
- Toyota Corolla Cross
- Hyundai Grand i10
- Hyundai Tucson
- Mitsubishi Xpander
- Kia K3 / Cerato
- Ford Ranger

Popular vehicles must be editable from the admin panel.

---

## 5.4 Product Categories

Initial category:

Shock Absorber / Giảm xóc ô tô

Future categories may include:

- Suspension Parts
- Steering Parts
- Brake Parts
- Engine Mount
- Other Automotive Parts

Categories must be database-driven and not hardcoded.

---

## 5.5 Trust Section

Display:

- Factory Direct Supply
- Hanoi Local Stock
- Vehicle Fitment Support
- Nationwide Delivery
- After-sales Support

Use real store, warehouse, factory, product and shipping photos where possible.

---

# 6. Vehicle Database

Vehicle data must exist independently from product data.

Suggested hierarchy:

Vehicle Brand
→ Vehicle Model
→ Generation
→ Model Code
→ Year Range

Example:

Toyota
→ Vios
→ NCP150
→ 2014-2018

Products are linked to vehicle records.

Do NOT duplicate vehicle information manually inside every product.

---

# 7. Product Search

Global search must support:

- Vehicle name
- Vehicle model
- Model code
- NEVERSTOP part number
- OE number
- Product name

Examples:

Vios

NCP150

2025-D641-302F

48520-XXXXX

Search should support partial / fuzzy matching where appropriate.

---

# 8. Product Database

Each product should support at minimum:

- Product ID
- NEVERSTOP Part Number
- Product Name
- Vietnamese Product Name
- English Product Name
- Chinese Product Name
- Category
- Product Images
- Product Description
- Installation Position
- Front / Rear
- Left / Right
- OE Numbers
- Compatible Vehicles
- Specifications
- Net Weight
- Gross Weight
- Pieces Per Carton
- Carton Size
- Store Stock
- Warehouse Stock
- Retail Price 1
- Retail Price 2
- Stock Status
- Product Status
- SEO Title
- SEO Description
- URL Slug
- Created Date
- Updated Date

Important:

One product may have multiple OE numbers.

One product may fit multiple vehicles.

Use relational database structure.

Do not store compatibility only as unstructured text.

---

# 9. Product Detail Page

Display:

- Main Product Image
- Vietnamese Product Name
- NEVERSTOP Part Number
- Vehicle Compatibility
- Model Code
- Year Range
- Installation Position
- OE Numbers
- Stock Status
- Product Specifications
- Package Information

Main actions:

- Nhắn Zalo
- Yêu cầu báo giá
- Gọi ngay

Price may be shown depending on product/customer configuration.

---

# 10. Inventory

Internal database must support:

- Store Stock
- Warehouse Stock
- Reserved Stock
- Available Stock

Suggested formula:

Available Stock =
Store Stock
+ Warehouse Stock
- Reserved Stock

Frontend should normally NOT display exact inventory quantity.

Frontend status examples:

- Còn hàng
- Sắp hết hàng
- Liên hệ
- Hết hàng

Exact inventory is visible only to authorized staff.

---

# 11. Inquiry System

Product pages should provide:

Yêu cầu báo giá

Inquiry form should automatically include product information.

Customer fields:

- Name
- Phone
- Zalo
- Vehicle
- Production Year
- Quantity
- Notes

System fields:

- Inquiry ID
- Product ID
- Created Date
- Assigned Staff
- Status

Inquiry statuses:

- New
- Contacted
- Quoted
- Converted
- Closed

An inquiry should be convertible into an order.

---

# 12. Zalo Inquiry

Product pages must contain a prominent:

Nhắn Zalo

Where technically possible, the Zalo inquiry should identify:

- Product Number
- Product Name
- Vehicle
- Year

Example message:

Xin chào NEVERSTOP,

Tôi muốn hỏi sản phẩm:

Mã sản phẩm: [PART NUMBER]

Xe: [VEHICLE]

Năm: [YEAR]

---

# 13. Order System

Each order must support:

- Order ID
- Customer
- Phone
- Zalo
- Products
- Quantity
- Unit Price
- Total Amount
- Payment Method
- Payment Status
- Order Status
- Shipping Address
- Customer Notes
- Internal Notes
- Created Date
- Updated Date

Suggested order number:

NS + YYYYMMDD + Sequence

Example:

NS202610030018

---

# 14. Order Status

Supported statuses:

- Draft
- Pending Payment
- Payment Verification Required
- Paid
- Preparing
- Shipped
- Completed
- Cancelled

Payment status and fulfillment status should remain logically separate.

---

# 15. Payment V1

Initial payment method:

BIDV
+
VietQR
+
Manual Payment Verification

Payment configuration must be stored separately from frontend presentation.

Payment settings should support:

- Bank Name
- Account Number
- Account Holder
- Bank Branch
- Payment Instructions
- QR Enabled
- Provider Enabled

IMPORTANT:

Do NOT hardcode bank information into frontend source code.

Do NOT commit confidential payment credentials or API secrets to GitHub.

Sensitive configuration must use environment variables or protected server configuration.

---

# 16. Dynamic VietQR

Each payable order should generate a payment screen containing:

- Order Number
- Total Amount
- Bank
- Account Holder
- Payment Reference
- VietQR

Example:

Order:
NS202610030018

Amount:
4,800,000 VND

Bank:
BIDV

Payment Reference:
NS202610030018

QR should include where supported:

- Receiving Account
- Amount
- Payment Reference

The customer should not need to manually type the amount where possible.

---

# 17. Manual Payment Confirmation

After transfer, customer may click:

Tôi đã thanh toán

This changes payment state to:

Payment Verification Required

Admin staff checks BIDV.

Admin can then click:

Confirm Payment

System records:

- Payment Amount
- Confirmation Time
- Confirmed By
- Bank Reference / Note
- Internal Note

Payment Status becomes:

Paid

---

# 18. Future Payment Providers

Payment architecture must support additional providers without rebuilding the order system.

Future providers may include:

- BIDV Business Account
- ZaloPay
- MoMo
- VNPAY
- Visa
- Mastercard
- Other Payment Gateways

Recommended abstraction:

Order
→ Payment
→ Payment Provider

Do not build BIDV-specific logic directly into the order database.

---

# 19. Inventory Reservation

Database should support:

Physical Stock

Reserved Stock

Available Stock

Example:

Physical Stock = 20

Reserved Stock = 4

Available Stock = 16

When an order is created, stock may be reserved.

When payment succeeds, stock may be permanently deducted.

When order is cancelled or payment expires, reserved inventory must be released.

Automatic reservation may be disabled during early V1 development, but the database architecture should support it.

---

# 20. Admin Panel

Admin navigation:

- Dashboard
- Products
- Vehicles
- Brands
- Categories
- Inventory
- Inquiries
- Orders
- Customers
- Payments
- Media
- Website Content
- SEO
- Settings

---

# 21. Product Administration

Authorized staff must be able to:

- Create product
- Edit product
- Archive product
- Upload images
- Add OE numbers
- Link vehicles
- Change installation position
- Change prices
- Change stock
- Change packaging information
- Change SEO data

Adding a product must NOT require editing source code.

---

# 22. Vehicle Administration

Admin must be able to manage:

- Vehicle Brands
- Vehicle Models
- Generations
- Model Codes
- Year Ranges

Products are linked to these records.

---

# 23. Media

Product images should not be stored directly inside the database.

Database stores image references / URLs.

Support:

- Main Image
- Gallery Images
- Image Sort Order
- Alt Text

Future support:

- Product Video

Recommended image delivery:

- WebP
- AVIF where appropriate
- CDN / Object Storage
- Automatic compression

---

# 24. SEO

Every product should have an indexable URL.

Example:

/vi/toyota/vios/ncp150/giam-xoc-truoc/

SEO support:

- Meta Title
- Meta Description
- Canonical URL
- Open Graph
- XML Sitemap
- robots.txt
- Structured Data
- Breadcrumb
- Image Alt Text

Example SEO title:

Giảm xóc Toyota Vios NCP150 | NEVERSTOP

Important search topics:

- giảm xóc ô tô
- giảm xóc Toyota Vios
- phuộc ô tô
- shock absorber Vietnam
- OE numbers
- vehicle + shock absorber

---

# 25. Analytics

Architecture should support:

- Google Analytics
- Google Search Console
- Meta Pixel
- TikTok Pixel

Important events:

- View Product
- Vehicle Search
- OE Search
- Click Zalo
- Submit Inquiry
- Create Order
- Start Payment
- Payment Confirmed

---

# 26. Security

Required:

- HTTPS
- Password hashing
- Role-based admin access
- SQL Injection protection
- XSS protection
- CSRF protection
- API authentication
- Rate limiting where appropriate
- Database backups
- Secure secret management

Never commit:

- Database passwords
- Server passwords
- API secrets
- Payment secrets
- Private keys
- Customer exports

Use environment variables for secrets.

---

# 27. Design Direction

Brand direction:

- Black
- Orange / Gold
- White

Style:

- Automotive
- Industrial
- Professional
- Reliable
- Modern
- Clean

Avoid:

- Excessive gradients
- Heavy animation
- Unnecessary 3D effects
- Cheap promotional appearance
- Overcrowded ecommerce layouts

Product information should remain the visual priority.

---

# 28. Mobile First

Primary design widths:

- 375px
- 390px
- 430px

Mobile product pages should provide a persistent bottom action bar:

- Zalo
- Call
- Yêu cầu báo giá

Desktop design is secondary to mobile usability.

---

# 29. Out of Scope for V1

Do NOT prioritize:

- Loyalty points
- Coupons
- Complex membership levels
- Live streaming
- Forums
- Product review system
- Recommendation algorithms
- AI customer service
- Marketplace
- Native mobile app
- Mini App
- Complex ERP
- Complex CRM
- Automated logistics pricing
- Automated refunds

---

# 30. V1 Required Customer Flow

## Flow A — Vehicle Search

Google / Facebook / TikTok
→ Website
→ Search Toyota Vios
→ Select NCP150
→ See Compatible Products
→ Product Detail
→ Zalo / Inquiry

## Flow B — OE Search

Customer enters OE Number
→ Compatible NEVERSTOP Product
→ Product Detail
→ Inquiry
→ Sales Confirms Fitment
→ Sales Confirms Price
→ Order Created
→ BIDV VietQR
→ Customer Transfers
→ Payment Verification
→ Preparing
→ Shipping
→ Completed

---

# 31. Development Priority

## P0 — Must Have

- Project Architecture
- Database
- Admin Authentication
- Vehicle Database
- Product Database
- Product Detail
- Vehicle Search
- OE Search
- Part Number Search
- Inquiry
- Order
- BIDV VietQR
- Payment Verification
- Mobile UI
- Admin Panel

## P1 — Next

- Inventory Synchronization
- Multilingual Content
- SEO
- Analytics
- Meta Pixel
- TikTok Pixel

## P2 — Future

- Dealer Accounts
- Customer-specific Pricing
- ZaloPay
- MoMo
- VNPAY
- Automatic Payment Confirmation
- Shipping Integration
- Electronic Invoice
- Advanced CRM

---

# 32. Development Philosophy

Do not build all future features during V1.

Build a stable foundation first.

Priority:

1. Correct data model
2. Vehicle-product matching
3. Product search
4. Inquiry
5. Order
6. Payment
7. Admin usability
8. Mobile experience
9. SEO
10. Future extensibility

The system should be easy to maintain and extend without rebuilding the entire platform.
