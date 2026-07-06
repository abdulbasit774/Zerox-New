/**
 * Invoice Generator
 * Generates PDF invoices for orders
 * 
 * PENDING CONFIGURATION: 
 * Requires jsPDF library installation: npm install jspdf html2canvas
 */

import { Order } from '../types';

export interface InvoiceData {
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  orderNumber: string;
  paymentId: string;
  
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  
  billingAddress: string;
  billingCity: string;
  billingState: string;
  billingZip: string;
  billingCountry: string;
  
  shippingAddress: string;
  shippingCity: string;
  shippingState: string;
  shippingZip: string;
  shippingCountry: string;
  
  items: Array<{
    name: string;
    sku?: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }>;
  
  subtotal: number;
  discountAmount: number;
  shippingCost: number;
  taxAmount: number;
  grandTotal: number;
  
  paymentMethod: string;
  cardLast4?: string;
  cardBrand?: string;
  
  notes?: string;
  companyLogo?: string;
}

/**
 * Generate HTML invoice string
 * This can be converted to PDF using jsPDF or similar
 */
export function generateInvoiceHTML(invoiceData: InvoiceData): string {
  const invoiceDate = new Date(invoiceData.invoiceDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  
  const dueDate = new Date(invoiceData.dueDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          color: #333;
          line-height: 1.6;
        }
        
        .invoice-container {
          max-width: 900px;
          margin: 0 auto;
          padding: 40px;
          background: white;
        }
        
        .header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 40px;
          border-bottom: 2px solid #C9A227;
          padding-bottom: 20px;
        }
        
        .company-section h1 {
          font-size: 32px;
          color: #000;
          margin-bottom: 5px;
          font-weight: 900;
        }
        
        .company-section p {
          color: #666;
          font-size: 12px;
        }
        
        .invoice-meta {
          text-align: right;
        }
        
        .invoice-meta h2 {
          font-size: 24px;
          color: #C9A227;
          margin-bottom: 10px;
        }
        
        .invoice-meta-row {
          display: flex;
          justify-content: flex-end;
          gap: 20px;
          margin-bottom: 5px;
          font-size: 12px;
        }
        
        .invoice-meta-row strong {
          width: 120px;
          color: #666;
        }
        
        .addresses {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 30px;
          margin-bottom: 40px;
        }
        
        .address-section h3 {
          color: #C9A227;
          font-size: 12px;
          text-transform: uppercase;
          margin-bottom: 10px;
          font-weight: 600;
        }
        
        .address-section p {
          font-size: 13px;
          color: #333;
          line-height: 1.8;
        }
        
        .items-table {
          width: 100%;
          margin-bottom: 30px;
          border-collapse: collapse;
        }
        
        .items-table thead {
          background: #f5f5f5;
          border: 1px solid #ddd;
        }
        
        .items-table th {
          padding: 12px;
          text-align: left;
          font-weight: 600;
          color: #333;
          font-size: 12px;
          text-transform: uppercase;
          border: 1px solid #ddd;
        }
        
        .items-table td {
          padding: 12px;
          border: 1px solid #ddd;
          font-size: 13px;
        }
        
        .items-table tr:nth-child(even) {
          background: #fafafa;
        }
        
        .text-right {
          text-align: right;
        }
        
        .text-bold {
          font-weight: 600;
        }
        
        .totals-section {
          display: flex;
          justify-content: flex-end;
          margin-bottom: 40px;
        }
        
        .totals-table {
          width: 300px;
        }
        
        .totals-table .row {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          font-size: 13px;
          border-bottom: 1px solid #eee;
        }
        
        .totals-table .row.total {
          border-bottom: 2px solid #C9A227;
          border-top: 2px solid #C9A227;
          padding: 12px 0;
          font-size: 14px;
          font-weight: 700;
          color: #C9A227;
        }
        
        .totals-table .row.subtotal,
        .totals-table .row.tax {
          color: #666;
        }
        
        .payment-info {
          background: #f9f9f9;
          border: 1px solid #ddd;
          padding: 20px;
          margin-bottom: 30px;
          border-radius: 4px;
        }
        
        .payment-info h4 {
          color: #C9A227;
          font-size: 12px;
          text-transform: uppercase;
          margin-bottom: 10px;
          font-weight: 600;
        }
        
        .payment-info p {
          font-size: 13px;
          color: #333;
          margin-bottom: 5px;
        }
        
        .footer {
          border-top: 1px solid #ddd;
          padding-top: 20px;
          text-align: center;
          font-size: 12px;
          color: #666;
        }
        
        .qr-code {
          text-align: center;
          margin: 20px 0;
        }
        
        .qr-code img {
          max-width: 150px;
          border: 1px solid #ddd;
          padding: 5px;
        }
        
        @media print {
          body {
            margin: 0;
            padding: 0;
          }
          .invoice-container {
            max-width: 100%;
            padding: 20px;
          }
        }
      </style>
    </head>
    <body>
      <div class="invoice-container">
        <!-- Header -->
        <div class="header">
          <div class="company-section">
            <h1>ZEROX</h1>
            <p>Premium Athlete Performance Footwear</p>
            <p>77 Fifth Avenue, New York, NY 10003</p>
            <p>support@zerox.com | +1 (555) 901-2384</p>
          </div>
          <div class="invoice-meta">
            <h2>INVOICE</h2>
            <div class="invoice-meta-row">
              <strong>Invoice #:</strong>
              <span>${invoiceData.invoiceNumber}</span>
            </div>
            <div class="invoice-meta-row">
              <strong>Order #:</strong>
              <span>${invoiceData.orderNumber}</span>
            </div>
            <div class="invoice-meta-row">
              <strong>Invoice Date:</strong>
              <span>${invoiceDate}</span>
            </div>
            <div class="invoice-meta-row">
              <strong>Due Date:</strong>
              <span>${dueDate}</span>
            </div>
          </div>
        </div>

        <!-- Addresses -->
        <div class="addresses">
          <div class="address-section">
            <h3>Billing Address</h3>
            <p>
              <strong>${invoiceData.customerName}</strong><br>
              ${invoiceData.billingAddress}<br>
              ${invoiceData.billingCity}, ${invoiceData.billingState} ${invoiceData.billingZip}<br>
              ${invoiceData.billingCountry}<br>
              ${invoiceData.customerEmail}<br>
              ${invoiceData.customerPhone}
            </p>
          </div>
          <div class="address-section">
            <h3>Shipping Address</h3>
            <p>
              <strong>${invoiceData.customerName}</strong><br>
              ${invoiceData.shippingAddress}<br>
              ${invoiceData.shippingCity}, ${invoiceData.shippingState} ${invoiceData.shippingZip}<br>
              ${invoiceData.shippingCountry}
            </p>
          </div>
        </div>

        <!-- Items Table -->
        <table class="items-table">
          <thead>
            <tr>
              <th>Item Description</th>
              <th>SKU</th>
              <th style="width: 80px;">Quantity</th>
              <th style="width: 100px;">Unit Price</th>
              <th style="width: 100px;" class="text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            ${invoiceData.items.map(item => `
              <tr>
                <td>${item.name}</td>
                <td>${item.sku || '-'}</td>
                <td>${item.quantity}</td>
                <td>$${item.unitPrice.toFixed(2)}</td>
                <td class="text-right">$${item.totalPrice.toFixed(2)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <!-- Totals -->
        <div class="totals-section">
          <div class="totals-table">
            <div class="row subtotal">
              <span>Subtotal</span>
              <span>$${invoiceData.subtotal.toFixed(2)}</span>
            </div>
            ${invoiceData.discountAmount > 0 ? `
              <div class="row">
                <span>Discount</span>
                <span style="color: #10b981;">-$${invoiceData.discountAmount.toFixed(2)}</span>
              </div>
            ` : ''}
            <div class="row">
              <span>Shipping</span>
              <span>$${invoiceData.shippingCost.toFixed(2)}</span>
            </div>
            <div class="row tax">
              <span>Tax (8%)</span>
              <span>$${invoiceData.taxAmount.toFixed(2)}</span>
            </div>
            <div class="row total">
              <span>Grand Total</span>
              <span>$${invoiceData.grandTotal.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <!-- Payment Info -->
        <div class="payment-info">
          <h4>Payment Information</h4>
          <p><strong>Method:</strong> ${invoiceData.paymentMethod}</p>
          ${invoiceData.cardBrand ? `
            <p><strong>Card:</strong> ${invoiceData.cardBrand} ending in ${invoiceData.cardLast4}</p>
          ` : ''}
          <p><strong>Transaction ID:</strong> ${invoiceData.paymentId}</p>
        </div>

        <!-- QR Code -->
        <div class="qr-code">
          <p style="font-size: 11px; color: #999;">Scan to track your order</p>
          <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${invoiceData.orderNumber}" alt="Order QR Code">
        </div>

        <!-- Footer -->
        <div class="footer">
          <p><strong>Thank you for your purchase!</strong></p>
          <p>For questions about your order, visit support.zerox.com or email support@zerox.com</p>
          <p style="margin-top: 15px; color: #999;">Generated on ${new Date().toLocaleString()} | Invoice #${invoiceData.invoiceNumber}</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * Download invoice as PDF
 * PENDING CONFIGURATION: Requires jsPDF library
 */
export async function downloadInvoicePDF(invoiceData: InvoiceData, filename?: string): Promise<void> {
  const invoiceHTML = generateInvoiceHTML(invoiceData);
  const docFilename = filename || `invoice-${invoiceData.invoiceNumber}.pdf`;
  
  // Check if jsPDF is available
  const jsPDFAvailable = typeof (window as any).jsPDF !== 'undefined';
  
  if (!jsPDFAvailable) {
    console.warn('[Invoice] jsPDF library not found - PENDING CONFIGURATION');
    console.log('[Invoice] To enable PDF export, install: npm install jspdf html2canvas');
    
    // Fallback: Open HTML in new window for printing
    const newWindow = window.open('', '', 'width=900,height=1200');
    if (newWindow) {
      newWindow.document.write(invoiceHTML);
      newWindow.document.close();
      newWindow.focus();
      newWindow.print();
    }
    return;
  }

  // Dynamic import for jsPDF (if available)
  try {
    const { jsPDF } = await import('jspdf');
    const html2canvas = await import('html2canvas');
    
    // Create a temporary div with invoice HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = invoiceHTML;
    tempDiv.style.position = 'absolute';
    tempDiv.style.left = '-9999px';
    document.body.appendChild(tempDiv);

    // Convert HTML to canvas
    const canvas = await html2canvas.default(tempDiv, {
      scale: 2,
      useCORS: true,
      logging: false,
    });

    // Create PDF from canvas
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const imgData = canvas.toDataURL('image/png');
    const imgWidth = 210; // A4 width in mm
    const pageHeight = 297; // A4 height in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    pdf.save(docFilename);
    document.body.removeChild(tempDiv);
  } catch (error) {
    console.error('[Invoice] Error generating PDF:', error);
    // Fallback to HTML print
    const newWindow = window.open('', '', 'width=900,height=1200');
    if (newWindow) {
      newWindow.document.write(invoiceHTML);
      newWindow.document.close();
      newWindow.focus();
      newWindow.print();
    }
  }
}

/**
 * Print invoice
 */
export function printInvoice(invoiceData: InvoiceData): void {
  const invoiceHTML = generateInvoiceHTML(invoiceData);
  const printWindow = window.open('', '', 'width=900,height=1200');
  
  if (printWindow) {
    printWindow.document.write(invoiceHTML);
    printWindow.document.close();
    printWindow.focus();
    
    setTimeout(() => {
      printWindow.print();
    }, 250);
  }
}

/**
 * Generate invoice number
 */
export function generateInvoiceNumber(): string {
  const year = new Date().getFullYear();
  const month = String(new Date().getMonth() + 1).padStart(2, '0');
  const random = Math.floor(Math.random() * 100000);
  return `INV-${year}-${month}-${String(random).padStart(5, '0')}`;
}

/**
 * Create invoice data from order
 */
export function createInvoiceFromOrder(
  order: Order,
  paymentMethod: string = 'Credit Card',
  cardBrand?: string,
  cardLast4?: string
): InvoiceData {
  return {
    invoiceNumber: generateInvoiceNumber(),
    invoiceDate: new Date().toISOString(),
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    orderNumber: order.id,
    paymentId: `PAY-${order.id}`,
    
    customerName: order.deliveryAddress.name,
    customerEmail: order.deliveryAddress.email,
    customerPhone: '+1 (555) 000-0000',
    
    billingAddress: order.deliveryAddress.address,
    billingCity: order.deliveryAddress.city,
    billingState: 'NY',
    billingZip: '10003',
    billingCountry: order.deliveryAddress.country,
    
    shippingAddress: order.deliveryAddress.address,
    shippingCity: order.deliveryAddress.city,
    shippingState: 'NY',
    shippingZip: '10003',
    shippingCountry: order.deliveryAddress.country,
    
    items: order.items.map(item => ({
      name: item.sneaker.name,
      sku: `ZRX-${item.sneaker.id}`,
      quantity: item.quantity,
      unitPrice: item.sneaker.price,
      totalPrice: item.sneaker.price * item.quantity,
    })),
    
    subtotal: order.subtotal,
    discountAmount: 0,
    shippingCost: order.shipping,
    taxAmount: order.total - order.subtotal - order.shipping,
    grandTotal: order.total,
    
    paymentMethod,
    cardBrand,
    cardLast4,
  };
}
