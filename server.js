const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors'); // Allow cross-origin requests
const PDFDocument = require('pdfkit'); // Import PDFKit to generate PDF
const fs = require('fs'); // Required to save PDF files
require('dotenv').config(); // For loading environment variables from a .env file


const app = express();
const port = 3000;

// Middleware
app.use(express.json());
app.use(cors()); // Enable CORS

// Check if the receipt directory exists, if not, create it
if (!fs.existsSync('./receipt')) {
  fs.mkdirSync('./receipt');
}

// Create a transporter for nodemailer
const transporter = nodemailer.createTransport({
  host: '192.168.0.152', // Replace this with the actual IP address of your SMTP server
  port: 3000, // Replace with the appropriate SMTP port (587 for TLS, 465 for SSL, 25 for non-secure)
  secure: false, // Set to true if using SSL
  service: 'gmail', // Using Gmail as the service
  auth: {
    user: process.env.EMAIL_USER, // Your Gmail account email from .env
    pass: process.env.EMAIL_PASS, // Your App password or email password from .env
  },
  tls: {
    rejectUnauthorized: false, // Allow self-signed certificates (for Gmail)
  },
});

const generateStyledReceipt = (orderData) => {
  try {
    const doc = new PDFDocument({ size: 'A4', margin: 40 });
    const receiptPath = './receipt/receipt.pdf';

    doc.pipe(fs.createWriteStream(receiptPath));

    // Validate orderData
    if (!orderData || typeof orderData !== 'object') {
      throw new Error('Invalid order data');
    }

    // Set default values if they're missing
    const orderNumber = orderData.orderNumber || 'N/A';
    const billingName = orderData.billing?.name || 'Not provided';
    const billingEmail = orderData.billing?.email || 'Not provided';
    const shippingInfo = orderData.shipping || {};
    const items = orderData.items || [];
    const subtotal = Number(orderData.subtotal) || 0;
    const shippingFee = Number(orderData.shippingFee) || 0;
    const total = Number(orderData.total) || subtotal + shippingFee;

    // Light background color
    doc.rect(0, 0, 595, 842).fill('#f8fafc');

    // Header Section
    doc.rect(0, 0, 595, 120).fill('#1e40af');
    doc.fillColor('#ffffff').fontSize(28).font('Helvetica-Bold')
       .text('ORDER RECEIPT', 0, 50, { align: 'center' });
    
    // Order info
    doc.roundedRect(100, 90, 180, 30, 15).fill('#3b82f6');
    doc.fillColor('#ffffff').fontSize(12).font('Helvetica-Bold')
       .text(`ORDER #${orderNumber}`, 110, 98);
    
    const currentDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    doc.roundedRect(300, 90, 180, 30, 15).fill('#3b82f6');
    doc.fillColor('#ffffff').fontSize(12).font('Helvetica-Bold')
       .text(currentDate, 310, 98);

    // Main content
    const startY = 150;

    // Customer Information
    doc.fillColor('#1e293b').fontSize(16).font('Helvetica-Bold')
       .text('CUSTOMER INFORMATION', 50, startY);
    
    doc.moveTo(50, startY + 25).lineTo(250, startY + 25).stroke('#cbd5e1');
    
    doc.fillColor('#334155').fontSize(12).font('Helvetica')
       .text(`Name: ${billingName}`, 50, startY + 40)
       .text(`Email: ${billingEmail}`, 50, startY + 60);
    
    // Shipping Address
    doc.fillColor('#1e293b').fontSize(16).font('Helvetica-Bold')
       .text('SHIPPING ADDRESS', 300, startY);
    
    doc.moveTo(300, startY + 25).lineTo(500, startY + 25).stroke('#cbd5e1');
    
    const shippingAddress = [
      shippingInfo.address1 || '',
      shippingInfo.address2 || '',
      `${shippingInfo.city || ''}, ${shippingInfo.state || ''}`,
      shippingInfo.country || ''
    ].filter(line => line.trim()).join('\n') || 'No shipping address provided';
    
    doc.fillColor('#334155').fontSize(12).font('Helvetica')
       .text(shippingAddress, 300, startY + 40, { lineBreak: false });

    // Items Table
    const itemsStartY = startY + 120;
    doc.fillColor('#1e293b').fontSize(16).font('Helvetica-Bold')
       .text('ORDER ITEMS', 50, itemsStartY);
    
    doc.moveTo(50, itemsStartY + 25).lineTo(550, itemsStartY + 25).stroke('#cbd5e1');
    
    // Table Headers
    doc.fillColor('#334155').fontSize(12).font('Helvetica-Bold')
       .text('Item', 50, itemsStartY + 40)
       .text('Qty', 350, itemsStartY + 40)
       .text('Price', 450, itemsStartY + 40);
    
    // Items List
    let currentY = itemsStartY + 70;
    items.forEach((item, index) => {
      const itemName = item.name || 'Unnamed item';
      const quantity = item.quantity || 0;
      const price = Number(item.price) || 0;
      const itemTotal = quantity * price;

      doc.fillColor('#334155').fontSize(12).font('Helvetica')
         .text(`${index + 1}. ${itemName}`, 50, currentY)
         .text(quantity.toString(), 350, currentY)
         .text(`₦${itemTotal.toLocaleString('en-NG')}`, 450, currentY);
      
      currentY += 25;
    });

    // Total Section
    doc.moveTo(50, currentY + 20).lineTo(550, currentY + 20).stroke('#cbd5e1');
    
    doc.fillColor('#1e293b').fontSize(14).font('Helvetica-Bold')
       .text('Subtotal:', 400, currentY + 40)
       .text(`₦${subtotal.toLocaleString('en-NG')}`, 500, currentY + 40);
    
    doc.fillColor('#1e293b').fontSize(14).font('Helvetica-Bold')
       .text('Shipping:', 400, currentY + 70)
       .text(`₦${shippingFee.toLocaleString('en-NG')}`, 500, currentY + 70);
    
    doc.fillColor('#1e40af').fontSize(18).font('Helvetica-Bold')
       .text('TOTAL:', 400, currentY + 100)
       .text(`₦${total.toLocaleString('en-NG')}`, 500, currentY + 100);
    
    // Footer
    doc.fillColor('#64748b').fontSize(10).font('Helvetica')
       .text('Thank you for your purchase!', 0, 800, { align: 'center' })
       .text('If you have any questions, contact support@example.com', 0, 820, { align: 'center' });

    doc.end();
    return receiptPath;
  } catch (error) {
    console.error('Error generating receipt:', error);
    throw new Error('Failed to generate receipt');
  }
};

// API endpoint to send the order confirmation email
app.post('/send-order-confirmation', (req, res) => {
  const { email, name, orderNumber, items, total, shipping } = req.body;

  // Create a list of items for the email
  const itemList = items
    .map(
      (item, index) =>
        `<li>${index + 1}. ${item.name} (Qty: ${item.quantity}) - ₦${(
          item.price * item.quantity
        ).toLocaleString('en-NG')}</li>`
    )
    .join('');

  // Shipping address
  const shippingAddress = `${shipping.address1}, ${shipping.address2}, ${shipping.city}, ${shipping.state}, ${shipping.country}`;

  // Generate styled receipt PDF
  const orderData = { orderNumber, billing: { name, email }, items, total, shipping }; // Prepare data for receipt
  const receiptPath = generateStyledReceipt(orderData); // Generate the PDF receipt

  // HTML Email body with inline CSS
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: `Order Confirmation - ${orderNumber}`,
    html: `
      <html>
        <body style="font-family: Arial, sans-serif; color: #333; margin: 0; padding: 20px; background-color: #f4f4f4;">
          <div style="max-width: 600px; margin: auto; background-color: #fff; padding: 20px; border-radius: 10px;">
            <img src="cid:loading_image" alt="One.NG Logo" style="width: 150px; display: block; margin: 0 auto;">
            <h2 style="text-align: center; color: #5a9a5a;">Thank you for your order, ${name}!</h2>
            <p>We’ve received your order and it is being processed. Below are the details:</p>
            
            <h3>🧾 Order Number: ${orderNumber}</h3>
            
            <h4>📦 Items:</h4>
            <ul style="padding-left: 20px;">${itemList}</ul>

            <h4>🏠 Shipping Address:</h4>
            <p>${shippingAddress}</p>
            
            <h3 style="color: #386F4F;">💵 Total: ₦${total.toLocaleString('en-NG')}</h3>
            
            <p>Your order is being processed and will be shipped soon.</p>

            <p style="color: #888; font-size: 14px;">Thank you for choosing One.NG! If you have any questions, please contact our support team.</p>

            <p style="font-size: 12px; color: #ccc; text-align: center;">This is an automated email, please do not reply.</p>
          </div>
        </body>
      </html>
    `,
    attachments: [
      {
        filename: 'receipt.pdf',  // This is the generated PDF file
        path: receiptPath,  // Path to the generated receipt
      },
      {
        filename: 'loading.png',
        path: './assets/loading.png',
        cid: 'loading_image',  // This is the Content-ID that will be referenced in the HTML
      }
    ],
  };

  // Send email with the order confirmation and receipt attached
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Error occurred while sending email:', error);  // Log error
      return res.status(500).send({ message: 'Error sending order confirmation', error });
    }
    console.log('Email sent successfully:', info);
    res.status(200).send({ message: 'Order confirmation sent successfully', info });
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://192.168.0.152:${port}`);
});