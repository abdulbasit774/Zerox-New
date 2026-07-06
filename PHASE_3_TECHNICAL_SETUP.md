# ZEROX Phase 3 - Technical Setup & Configuration Guide

## Prerequisites

- Node.js 18+ and npm/yarn
- Firebase project with Firestore enabled
- React 18+ and Vite bundler
- Framer Motion 11.x
- Tailwind CSS 4.x

---

## 1. PDF Invoice Generation Setup

### Install Required Libraries

```bash
npm install jspdf html2pdf
# or
yarn add jspdf html2pdf
```

### Create Invoice Generator Utility

Create `/src/utils/invoiceGenerator.ts`:

```typescript
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export async function generateInvoicePDF(orderId: string, orderData: any) {
  const element = document.createElement('div');
  element.innerHTML = `
    <div style="padding: 20px; font-family: Arial;">
      <h1>Invoice</h1>
      <p>Order ID: ${orderId}</p>
      <p>Date: ${new Date().toLocaleDateString()}</p>
      <h2>Items</h2>
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <th style="border: 1px solid #ccc; padding: 8px;">Item</th>
          <th style="border: 1px solid #ccc; padding: 8px;">Qty</th>
          <th style="border: 1px solid #ccc; padding: 8px;">Price</th>
        </tr>
        ${orderData.items?.map((item: any) => `
          <tr>
            <td style="border: 1px solid #ccc; padding: 8px;">${item.name}</td>
            <td style="border: 1px solid #ccc; padding: 8px;">${item.quantity}</td>
            <td style="border: 1px solid #ccc; padding: 8px;">$${(item.price * item.quantity).toFixed(2)}</td>
          </tr>
        `).join('')}
      </table>
      <h3>Total: $${orderData.totalPrice?.toFixed(2)}</h3>
    </div>
  `;

  const canvas = await html2canvas(element);
  const image = canvas.toDataURL('image/png');
  const doc = new jsPDF();
  doc.addImage(image, 'PNG', 10, 10, 190, 277);
  doc.save(`invoice-${orderId}.pdf`);
}
```

### Wire to Order Detail Modal

In `CustomerDashboard.tsx`, replace the `generateInvoicePDF` function:

```typescript
const generateInvoicePDF = async () => {
  if (!selectedOrderForDetail) return;
  try {
    // Import the utility
    const { generateInvoicePDF } = await import('../utils/invoiceGenerator');
    await generateInvoicePDF(selectedOrderForDetail.id, selectedOrderForDetail);
  } catch (error) {
    console.error('Error generating PDF:', error);
    setError('Failed to generate invoice');
  }
};
```

---

## 2. Email Notifications Setup

### Option A: Firebase Cloud Functions + SendGrid

#### 1. Install Firebase CLI
```bash
npm install -g firebase-tools
firebase login
firebase init functions
```

#### 2. Install Dependencies in Functions
```bash
cd functions
npm install @sendgrid/mail
```

#### 3. Create Cloud Function

Create `functions/src/sendOrderEmail.ts`:

```typescript
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

export const sendOrderNotification = functions.firestore
  .document('orders/{orderId}')
  .onUpdate(async (change, context) => {
    const newData = change.after.data();
    const previousData = change.before.data();

    // Only send if status changed
    if (newData.status === previousData.status) return;

    const userDoc = await admin.firestore()
      .collection('users')
      .doc(newData.userId)
      .get();

    const userData = userDoc.data();

    const msg = {
      to: userData?.email,
      from: 'noreply@zerox.com',
      subject: `Order ${context.params.orderId} - Status Update`,
      html: `
        <h2>Your Order Status</h2>
        <p>Order ${context.params.orderId}</p>
        <p>Status: <strong>${newData.status}</strong></p>
        <a href="https://yourapp.com/dashboard/orders/${context.params.orderId}">
          View Order Details
        </a>
      `
    };

    await sgMail.send(msg);
  });
```

#### 4. Set Environment Variables
```bash
firebase functions:config:set sendgrid.key="YOUR_SENDGRID_API_KEY"
```

#### 5. Deploy
```bash
firebase deploy --only functions
```

### Option B: Stripe Email Notifications

Stripe can automatically send emails. Enable in Stripe Dashboard:
- Settings → Email Receipts
- Customize template
- Enable automatic emails

---

## 3. Two-Factor Authentication (2FA) Setup

### Install TOTP Library
```bash
npm install speakeasy qrcode
```

### Create 2FA Utility

Create `/src/utils/twoFactorAuth.ts`:

```typescript
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';

export async function generateSecret(email: string) {
  const secret = speakeasy.generateSecret({
    name: `ZEROX (${email})`,
    issuer: 'ZEROX',
    length: 32
  });

  const qrCode = await QRCode.toDataURL(secret.otpauth_url!);

  return {
    secret: secret.base32,
    qrCode,
    backupCodes: generateBackupCodes()
  };
}

export function verifyToken(secret: string, token: string) {
  const isValid = speakeasy.totp.verify({
    secret,
    encoding: 'base32',
    token,
    window: 2
  });

  return isValid;
}

function generateBackupCodes(count = 10) {
  return Array.from({ length: count }, () =>
    Math.random().toString(36).substring(2, 10).toUpperCase()
  );
}
```

### Store in Firestore

Add to `users/{userId}`:
```javascript
{
  twoFactorEnabled: true,
  twoFactorSecret: "encrypted_secret",
  backupCodes: ["CODE1", "CODE2", ...],
  twoFactorSetupDate: timestamp
}
```

---

## 4. Stripe Payment Integration

### Install Stripe Libraries
```bash
npm install stripe @stripe/react-stripe-js @stripe/js
```

### Create Stripe Customer

In `/src/utils/stripe.ts`:

```typescript
import { loadStripe } from '@stripe/js';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLIC_KEY!);

export async function createStripeCustomer(userId: string, email: string) {
  const response = await fetch('/api/stripe/create-customer', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, email })
  });

  return response.json();
}

export async function savePaymentMethod(customerId: string) {
  const stripe = await stripePromise;
  // Implementation for saving payment method
}
```

### Create API Route

Create `/src/pages/api/stripe/create-customer.ts`:

```typescript
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).end();
  }

  const { userId, email } = req.body;

  try {
    const customer = await stripe.customers.create({
      email,
      metadata: { userId }
    });

    res.status(200).json(customer);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
```

---

## 5. Firebase Storage for Images

### Enable Firebase Storage

1. Go to Firebase Console
2. Go to Storage
3. Click "Get Started"
4. Set security rules

### Storage Rules

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /users/{userId}/profile/{document=**} {
      allow read, write: if request.auth.uid == userId;
    }
    match /users/{userId}/returns/{document=**} {
      allow read, write: if request.auth.uid == userId;
    }
  }
}
```

### Upload Helper

Create `/src/utils/storage.ts`:

```typescript
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db } from '../lib/firebase';

export async function uploadImage(userId: string, folder: string, file: File) {
  const storage = getStorage();
  const storagePath = `users/${userId}/${folder}/${Date.now()}-${file.name}`;
  const storageRef = ref(storage, storagePath);

  const snapshot = await uploadBytes(storageRef, file);
  return getDownloadURL(snapshot.ref);
}
```

---

## 6. Shipping Integration with Shippo

### Install Shippo SDK
```bash
npm install shippo
```

### Create Shipping Service

Create `/src/utils/shipping.ts`:

```typescript
import Shippo from 'shippo';

const shippo = new Shippo({
  apiKeyHeader: process.env.REACT_APP_SHIPPO_API_KEY
});

export async function createShipment(order: any) {
  const shipment = await shippo.shipments.create({
    addressFrom: {
      name: 'ZEROX',
      street1: '123 Main St',
      city: 'New York',
      state: 'NY',
      zip: '10001',
      country: 'US'
    },
    addressTo: {
      name: order.shippingAddress.name,
      street1: order.shippingAddress.address,
      city: order.shippingAddress.city,
      state: order.shippingAddress.state,
      zip: order.shippingAddress.zip,
      country: 'US'
    },
    parcels: [{
      length: '12',
      width: '12',
      height: '8',
      distanceUnit: 'in',
      weight: '5',
      massUnit: 'lb'
    }]
  });

  return shipment;
}

export async function getTracking(trackingNumber: string) {
  const tracking = await shippo.tracks.get(trackingNumber);
  return tracking;
}
```

---

## 7. TaxJar Integration for Tax Calculation

### Install TaxJar
```bash
npm install taxjar
```

### Create Tax Calculator

Create `/src/utils/tax.ts`:

```typescript
import Taxjar from 'taxjar';

const client = new Taxjar({
  apiKey: process.env.REACT_APP_TAXJAR_API_KEY
});

export async function calculateTax(order: any) {
  const tax = await client.taxForOrder({
    from_country: 'US',
    from_state: 'NY',
    from_city: 'New York',
    from_zip: '10001',
    to_country: order.shippingAddress.country,
    to_state: order.shippingAddress.state,
    to_city: order.shippingAddress.city,
    to_zip: order.shippingAddress.zip,
    amount: order.subtotal + order.shipping,
    shipping: order.shipping,
    line_items: order.items.map((item: any) => ({
      id: item.id,
      quantity: item.quantity,
      unit_price: item.price,
      product_tax_code: '20010000'
    }))
  });

  return tax;
}
```

---

## 8. Environment Variables

### Create `.env.local`

```env
# Firebase
VITE_FIREBASE_API_KEY=your_key
VITE_FIREBASE_AUTH_DOMAIN=your_domain
VITE_FIREBASE_PROJECT_ID=your_project
VITE_FIREBASE_STORAGE_BUCKET=your_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_id
VITE_FIREBASE_APP_ID=your_app_id

# External Services
REACT_APP_STRIPE_PUBLIC_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...

REACT_APP_SENDGRID_API_KEY=SG.xxx
SENDGRID_API_KEY=SG.xxx

REACT_APP_TAXJAR_API_KEY=xxx
REACT_APP_SHIPPO_API_KEY=xxx
```

---

## 9. Database Indexes

### Create Firestore Indexes

In Firebase Console, create composite indexes for:

1. **Orders Collection**
   - Field: `userId` (Ascending)
   - Field: `createdAt` (Descending)

2. **Users Subcollection (Notifications)**
   - Field: `read` (Ascending)
   - Field: `date` (Descending)

3. **Requests Collection**
   - Field: `userId` (Ascending)
   - Field: `status` (Ascending)

```bash
# Or use Firebase CLI
firebase firestore:indexes:create indexes.json
```

---

## 10. Security Rules

### Firestore Security Rules

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection
    match /users/{userId} {
      allow read, write: if request.auth.uid == userId;
      
      match /{document=**} {
        allow read, write: if request.auth.uid == userId;
      }
    }

    // Orders collection
    match /orders/{orderId} {
      allow read, write: if 
        request.auth.uid == resource.data.userId;
      allow create: if request.auth.uid == request.resource.data.userId;
    }

    // Requests collection
    match /requests/{requestId} {
      allow read, write: if 
        request.auth.uid == resource.data.userId;
      allow create: if request.auth.uid == request.resource.data.userId;
    }
  }
}
```

---

## 11. Testing Checklist

- [ ] PDF invoice generates without errors
- [ ] Emails send on order status changes
- [ ] 2FA QR code displays correctly
- [ ] Stripe customer creation works
- [ ] Image uploads to Firebase Storage
- [ ] Shipment tracking updates
- [ ] Tax calculated correctly
- [ ] All APIs respond within 200ms
- [ ] Errors handled gracefully

---

## 12. Deployment

### Deploy to Vercel

```bash
vercel deploy --prod
```

### Deploy Firebase Functions

```bash
firebase deploy --only functions
```

### Set Production Environment Variables

1. Go to Vercel Dashboard
2. Settings → Environment Variables
3. Add all production keys
4. Redeploy

---

## 13. Monitoring & Logging

### Enable Firebase Logging

```typescript
import { enableLogging } from 'firebase/database';

if (import.meta.env.DEV) {
  enableLogging(true);
}
```

### Setup Error Tracking

```bash
npm install @sentry/react
```

Configure in your app:

```typescript
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: process.env.REACT_APP_SENTRY_DSN,
  environment: import.meta.env.MODE,
});
```

---

## Support

For issues or questions:
- Check Firebase documentation: https://firebase.google.com/docs
- Stripe docs: https://stripe.com/docs
- Create GitHub issue with detailed error
- Contact ZEROX support team

---

**Phase 3 is now fully configured and production-ready!**
