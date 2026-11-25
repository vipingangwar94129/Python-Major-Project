import fs from 'node:fs';
import path from 'node:path';
import express from 'express';
import { createServer as createViteServer } from 'vite';
import { generateInvoicePdf } from './server/pdf.ts';
import { INVOICES_DIR, retailStore, type PaymentMethod } from './server/store.ts';

const PORT = 3000;
const ROOT_DIR = process.cwd();

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '1mb' }));

  app.post('/api/retail', (req, res) => {
    try {
      const payload = req.body && typeof req.body === 'object' ? req.body : {};
      const action = String(payload.action || '');

      let data: unknown;
      switch (action) {
        case 'overview':
          data = retailStore.getOverview();
          break;
        case 'products':
          data = retailStore.listProducts({
            query: payload.query,
            category: payload.category,
            lowStockOnly: Boolean(payload.lowStockOnly),
            page: payload.page,
            limit: payload.limit,
          });
          break;
        case 'quick_find':
          data = { product: retailStore.findExactProduct(String(payload.code || '')) };
          break;
        case 'suggest_product_ids':
          data = retailStore.suggestNextProductIds(payload.category);
          break;
        case 'add_product':
          data = { product: retailStore.addProduct(payload.product) };
          break;
        case 'preview_checkout':
          data = retailStore.previewCheckout(payload.items || [], payload.promo_code);
          break;
        case 'checkout':
          data = {
            invoice: retailStore.finalizeCheckout({
              items: payload.items || [],
              customer_name: payload.customer_name,
              customer_phone: payload.customer_phone,
              payment_method: payload.payment_method as PaymentMethod,
              promo_code: payload.promo_code,
            }),
          };
          break;
        case 'invoices':
          data = { invoices: retailStore.listInvoices(payload.query) };
          break;
        case 'invoice':
          data = { invoice: retailStore.getInvoice(String(payload.bill_ref || '')) };
          break;
        case 'analytics':
          data = retailStore.getAnalytics();
          break;
        case 'admin_login':
          data = { admin: retailStore.adminLogin(payload.username, payload.password) };
          break;
        case 'admin_action':
          data = retailStore.handleAdminAction(payload);
          break;
        default:
          return res.status(400).json({ ok: false, error: `Unknown action '${action}'.` });
      }

      return res.json({ ok: true, data });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Request failed';
      return res.status(400).json({ ok: false, error: message });
    }
  });

  app.get('/api/invoices/:billRef/pdf', (req, res) => {
    const billRef = String(req.params.billRef || '').trim().toUpperCase();
    if (!/^INV-[A-Z0-9-]+$/.test(billRef)) {
      return res.status(400).json({ ok: false, error: 'Invalid invoice reference format.' });
    }

    const pdfPath = path.join(INVOICES_DIR, `${billRef}.pdf`);
    if (!fs.existsSync(pdfPath)) {
      const invoice = retailStore.getInvoice(billRef);
      if (!invoice) {
        return res.status(404).json({ ok: false, error: 'Invoice PDF not found.' });
      }
      generateInvoicePdf(invoice, INVOICES_DIR);
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${billRef}.pdf"`);
    return res.sendFile(pdfPath);
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.join(ROOT_DIR, 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Retail Shop Management System running on http://localhost:${PORT}`);
  });
}

startServer();
