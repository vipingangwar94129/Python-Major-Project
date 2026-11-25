# Retail Shop Management System

A full-stack Point of Sale (POS), inventory management, GST billing, and sales analytics application built with **React**, **TypeScript**, **Tailwind CSS**, and **Express**.

## Features

- **POS & Store Catalog (`1,000+` Products)**
  - Pre-seeded catalog of 1,000 products across 5 departments: **Electronics**, **Clothing**, **Grocery**, **Stationery**, and **Home Appliances** (200 items each).
  - Live search by Product Name, ID, or SKU, category tabs, and quick barcode/SKU entry (`PRD-0001` or `SKU-ELEC-0001`).
  - **Add Product** directly from the Store Catalog header with auto-suggested next Product ID and category SKU.
- **Shopping Cart, Discounts & GST Billing**
  - Add, increment/decrement, remove, or clear cart items with real-time stock validation.
  - Non-stackable discount engine:
    - Manual promo codes: `SAVE10` (10%), `SAVE20` (20%), `WELCOME5` (5%)
    - Automatic `5%` discount when cart subtotal exceeds `₹1,000` (applied only when no promo code is used).
  - Payment method selection (`UPI`, `Card`, `Cash`) and configurable `18%` GST calculation.
- **Invoices & PDF Export**
  - Generates unique invoice references (`INV-YYYYMMDD-HHMMSS-XXXX`) and downloadable `.pdf` tax invoices saved in `invoices/`.
  - Dedicated **Invoices** tab to search past orders by bill reference, customer name, or mobile number and re-download PDFs.
- **Sales Analytics**
  - Daily revenue, monthly revenue, total transactions, average order value, total discounts provided, payment method breakdown, category-wise sales bars, top-selling products, and low-stock alerts (`<= 10` units).
- **Admin Control Panel**
  - PBKDF2-HMAC-SHA256 password-authenticated manager login (default: `admin` / `Admin@123`, configurable via `RETAIL_ADMIN_USER` and `RETAIL_ADMIN_PASS`).
  - Low-stock filter, one-click `+25` or custom restock, inline price editing, product creation/deletion, promo code activation/creation, daily sales report, and recent transaction monitoring.

## Project Structure

```text
├── server.ts                  # Express server, API routes, PDF download & Vite middleware
├── server/
│   ├── store.ts               # Persistent JSON data store, seeding, auth & business logic
│   └── pdf.ts                 # Native PDF 1.4 tax invoice generator
├── src/
│   ├── App.tsx                # Main application shell and workspace navigation
│   ├── api.ts                 # Typed API client and INR currency formatter
│   ├── types.ts               # Shared TypeScript interfaces
│   └── components/
│       ├── PosView.tsx        # Store catalog, quick scan, add product modal & billing counter
│       ├── InvoicesView.tsx   # Invoice search, preview modal & PDF export
│       ├── AnalyticsView.tsx  # Revenue KPIs, payment/category breakdowns & low-stock alerts
│       └── AdminView.tsx      # Protected manager panel, restocking & promo management
├── data/
│   └── retail_store.json      # Auto-generated persistent store data
├── invoices/                  # Generated PDF tax invoices
├── package.json
└── tsconfig.json
```

## Getting Started

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Run in development**
   ```bash
   npm run dev
   ```
   The app runs on `http://localhost:3000`.

3. **Build & type-check**
   ```bash
   npm run lint
   npm run build
   ```

## Environment Variables

Optional configuration (see `.env.example` for template values):

- `RETAIL_ADMIN_USER` — Default administrator username on first initialization (defaults to `admin`).
- `RETAIL_ADMIN_PASS` — Default administrator password on first initialization (defaults to `Admin@123`).

## API Endpoints

- `POST /api/retail` — Dispatches store actions (`overview`, `products`, `quick_find`, `suggest_product_ids`, `add_product`, `preview_checkout`, `checkout`, `invoices`, `invoice`, `analytics`, `admin_login`, `admin_action`).
- `GET /api/invoices/:billRef/pdf` — Streams or generates the PDF tax invoice for a given bill reference.
