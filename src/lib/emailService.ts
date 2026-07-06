/**
 * Email Service
 * Handles sending transactional emails
 * 
 * PENDING CONFIGURATION:
 * Requires SendGrid API key or SMTP configuration
 * Install: npm install nodemailer (for backend) or use SendGrid SDK
 */

export interface EmailTemplate {
  to: string;
  subject: string;
  html: string;
  text: string;
}

/**
 * Email templates
 */

export function getOrderConfirmationEmail(
  customerName: string,
  orderId: string,
  orderTotal: number,
  shippingAddress: string,
  itemCount: number
): EmailTemplate {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: 'Segoe UI', sans-serif; color: #333; line-height: 1.6; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; background: #f9f9f9; }
        .header { background: #000; color: #C9A227; padding: 20px; text-align: center; }
        .header h1 { margin: 0; font-size: 32px; }
        .content { background: white; padding: 20px; border: 1px solid #ddd; }
        .order-details { background: #f5f5f5; padding: 15px; margin: 15px 0; border-left: 4px solid #C9A227; }
        .button { background: #C9A227; color: black; padding: 12px 20px; text-decoration: none; border-radius: 4px; display: inline-block; margin: 15px 0; font-weight: bold; }
        .footer { text-align: center; color: #666; font-size: 12px; margin-top: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>ZEROX</h1>
          <p>Order Confirmed</p>
        </div>
        
        <div class="content">
          <h2>Hi ${customerName},</h2>
          
          <p>Thank you for your purchase! Your order has been confirmed and is being prepared for shipment.</p>
          
          <div class="order-details">
            <h3 style="margin-top: 0;">Order Details</h3>
            <p><strong>Order ID:</strong> ${orderId}</p>
            <p><strong>Items:</strong> ${itemCount} item(s)</p>
            <p><strong>Order Total:</strong> $${orderTotal.toFixed(2)}</p>
            <p><strong>Shipping To:</strong><br>${shippingAddress}</p>
          </div>
          
          <p>You'll receive another email when your order ships with a tracking number.</p>
          
          <a href="https://zerox.com/orders/${orderId}" class="button">View Order Details</a>
          
          <h3>What's Next?</h3>
          <ul>
            <li>Your order is being prepared for shipment</li>
            <li>You'll receive a shipping confirmation within 24 hours</li>
            <li>Track your order anytime at zerox.com/orders</li>
          </ul>
          
          <p>Questions? <a href="mailto:support@zerox.com">Contact our support team</a></p>
          
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} ZEROX. All rights reserved.</p>
            <p>77 Fifth Avenue, New York, NY 10003 | support@zerox.com | +1 (555) 901-2384</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
  
  return {
    to: 'customer@email.com',
    subject: `Order Confirmed: ${orderId}`,
    html,
    text: `Order Confirmed\n\nHi ${customerName},\n\nThank you for your purchase! Your order #${orderId} has been confirmed.\n\nOrder Total: $${orderTotal.toFixed(2)}\n\nView your order: https://zerox.com/orders/${orderId}\n\nSupport: support@zerox.com`,
  };
}

export function getPaymentSuccessEmail(
  customerName: string,
  orderId: string,
  amount: number,
  paymentMethod: string
): EmailTemplate {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: 'Segoe UI', sans-serif; color: #333; line-height: 1.6; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; background: #f9f9f9; }
        .header { background: #10b981; color: white; padding: 20px; text-align: center; }
        .header h1 { margin: 0; font-size: 24px; }
        .content { background: white; padding: 20px; border: 1px solid #ddd; }
        .success-badge { display: inline-block; background: #10b981; color: white; padding: 8px 12px; border-radius: 4px; font-weight: bold; margin-bottom: 15px; }
        .payment-details { background: #f5f5f5; padding: 15px; margin: 15px 0; border-left: 4px solid #10b981; }
        .footer { text-align: center; color: #666; font-size: 12px; margin-top: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>✓ Payment Successful</h1>
        </div>
        
        <div class="content">
          <h2>Hi ${customerName},</h2>
          
          <div class="success-badge">PAYMENT RECEIVED</div>
          
          <p>Your payment has been processed successfully. Your order is now confirmed and ready for shipment.</p>
          
          <div class="payment-details">
            <h3 style="margin-top: 0;">Payment Details</h3>
            <p><strong>Order ID:</strong> ${orderId}</p>
            <p><strong>Amount Charged:</strong> $${amount.toFixed(2)}</p>
            <p><strong>Payment Method:</strong> ${paymentMethod}</p>
            <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
          </div>
          
          <p>You will receive a shipping confirmation within 24 hours with tracking information.</p>
          
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} ZEROX. All rights reserved.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
  
  return {
    to: 'customer@email.com',
    subject: `Payment Confirmation: ${orderId}`,
    html,
    text: `Payment Successful\n\nYour payment of $${amount.toFixed(2)} has been processed successfully.\n\nOrder ID: ${orderId}\nPayment Method: ${paymentMethod}`,
  };
}

export function getShippingConfirmationEmail(
  customerName: string,
  orderId: string,
  trackingNumber: string,
  carrier: string,
  estimatedDelivery: string
): EmailTemplate {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: 'Segoe UI', sans-serif; color: #333; line-height: 1.6; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; background: #f9f9f9; }
        .header { background: #000; color: #C9A227; padding: 20px; text-align: center; }
        .header h1 { margin: 0; }
        .content { background: white; padding: 20px; border: 1px solid #ddd; }
        .shipping-info { background: #f5f5f5; padding: 15px; margin: 15px 0; border-left: 4px solid #C9A227; }
        .tracking-box { background: #000; color: #C9A227; padding: 15px; border-radius: 4px; font-family: monospace; font-size: 16px; margin: 15px 0; }
        .button { background: #C9A227; color: black; padding: 12px 20px; text-decoration: none; border-radius: 4px; display: inline-block; margin: 15px 0; font-weight: bold; }
        .footer { text-align: center; color: #666; font-size: 12px; margin-top: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Your Order Is On The Way!</h1>
        </div>
        
        <div class="content">
          <h2>Hi ${customerName},</h2>
          
          <p>Great news! Your order has shipped and is on its way to you.</p>
          
          <div class="shipping-info">
            <h3 style="margin-top: 0;">Shipping Information</h3>
            <p><strong>Order ID:</strong> ${orderId}</p>
            <p><strong>Carrier:</strong> ${carrier}</p>
            <p><strong>Estimated Delivery:</strong> ${estimatedDelivery}</p>
          </div>
          
          <h3>Tracking Number</h3>
          <div class="tracking-box">${trackingNumber}</div>
          
          <a href="https://zerox.com/track/${trackingNumber}" class="button">Track Your Package</a>
          
          <p>Click the button above or visit your account to track your shipment in real-time.</p>
          
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} ZEROX. All rights reserved.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
  
  return {
    to: 'customer@email.com',
    subject: `Your Order Is Shipping: ${orderId}`,
    html,
    text: `Your order has shipped!\n\nTracking Number: ${trackingNumber}\nCarrier: ${carrier}\nEstimated Delivery: ${estimatedDelivery}\n\nTrack now: https://zerox.com/track/${trackingNumber}`,
  };
}

export function getRefundConfirmationEmail(
  customerName: string,
  orderId: string,
  refundAmount: number,
  reason: string
): EmailTemplate {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: 'Segoe UI', sans-serif; color: #333; line-height: 1.6; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; background: #f9f9f9; }
        .header { background: #0088ff; color: white; padding: 20px; text-align: center; }
        .header h1 { margin: 0; }
        .content { background: white; padding: 20px; border: 1px solid #ddd; }
        .refund-info { background: #f5f5f5; padding: 15px; margin: 15px 0; border-left: 4px solid #0088ff; }
        .timeline { margin: 20px 0; }
        .timeline-item { padding: 10px 0; border-bottom: 1px solid #eee; }
        .timeline-item:last-child { border-bottom: none; }
        .footer { text-align: center; color: #666; font-size: 12px; margin-top: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Refund Initiated</h1>
        </div>
        
        <div class="content">
          <h2>Hi ${customerName},</h2>
          
          <p>We've received your refund request and have initiated the process.</p>
          
          <div class="refund-info">
            <h3 style="margin-top: 0;">Refund Details</h3>
            <p><strong>Order ID:</strong> ${orderId}</p>
            <p><strong>Refund Amount:</strong> $${refundAmount.toFixed(2)}</p>
            <p><strong>Reason:</strong> ${reason}</p>
          </div>
          
          <h3>Refund Timeline</h3>
          <div class="timeline">
            <div class="timeline-item">
              <strong>✓ Refund Initiated</strong>
              <p>Today</p>
            </div>
            <div class="timeline-item">
              <strong>Processing</strong>
              <p>2-3 business days (depending on your bank)</p>
            </div>
            <div class="timeline-item">
              <strong>Refund Complete</strong>
              <p>The amount will appear in your account</p>
            </div>
          </div>
          
          <p>If you have any questions, please contact our support team at support@zerox.com</p>
          
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} ZEROX. All rights reserved.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
  
  return {
    to: 'customer@email.com',
    subject: `Refund Initiated: ${orderId}`,
    html,
    text: `Your refund has been initiated.\n\nOrder ID: ${orderId}\nRefund Amount: $${refundAmount.toFixed(2)}\nReason: ${reason}\n\nYou will receive the refund in 2-3 business days.`,
  };
}

/**
 * Send email
 * PENDING CONFIGURATION: Requires SendGrid API key or SMTP setup
 */
export async function sendEmail(template: EmailTemplate): Promise<boolean> {
  try {
    console.log('[Email] Sending email to:', template.to);
    console.log('[Email] Subject:', template.subject);
    
    // Check for SendGrid API key
    const apiKey = (window as any).__ENV?.SENDGRID_API_KEY;
    
    if (!apiKey) {
      console.warn('[Email] SendGrid API key not configured - PENDING CONFIGURATION');
      console.log('[Email] To enable email sending:');
      console.log('[Email] 1. Set SENDGRID_API_KEY environment variable');
      console.log('[Email] 2. Or configure SMTP server details');
      
      // Simulate sending
      return new Promise((resolve) => {
        setTimeout(() => {
          console.log('[Email] Email queued (simulated):', template.to);
          resolve(true);
        }, 1000);
      });
    }

    // In production, this would call your backend API
    const response = await fetch('/api/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(template),
    });

    return response.ok;
  } catch (error) {
    console.error('[Email] Error sending email:', error);
    return false;
  }
}

/**
 * Queue email for sending
 */
export async function queueEmail(template: EmailTemplate): Promise<string> {
  const emailId = `email_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  // In production, this would save to database
  console.log('[Email] Queued:', emailId, 'to:', template.to);
  
  // Try to send immediately
  await sendEmail(template);
  
  return emailId;
}

/**
 * Log email event
 */
export async function logEmailEvent(
  emailId: string,
  event: 'sent' | 'opened' | 'clicked' | 'bounced' | 'complained',
  details?: any
): Promise<void> {
  console.log('[Email Event]', event, '- Email ID:', emailId, details || '');
  
  // In production, this would update database
}
