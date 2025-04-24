const PDFDocument = require('pdfkit'); // Import PDFKit to generate PDF
const fs = require('fs'); // Required to save PDF files

// Function to generate the styled PDF receipt
const generateStyledReceipt = (orderData) => {
  const doc = new PDFDocument();
  const receiptPath = './receipt/receipt.pdf';

  doc.pipe(fs.createWriteStream(receiptPath));

  // Set the background color
  doc.rect(0, 0, 595, 842).fill('#f4f4f4');  // A4 page size in points (595x842)

  // Add a header with the company logo (Optional)
  doc.image('./assets/loading.png', 200, 50, { width: 150 }).moveDown(1);

  // Title
  doc.fillColor('#4CAF50').fontSize(24).font('Helvetica-Bold').text('Order Receipt', { align: 'center' }).moveDown(1);

  // Order Number
  doc.fillColor('#000000').fontSize(14).font('Helvetica').text(`Order Number: ${orderData.orderNumber}`, { align: 'center' }).moveDown(1);

  // Billing Information
  doc.fontSize(12).fillColor('#333').text(`Name: ${orderData.billing.name}`, { lineBreak: true });
  doc.text(`Email: ${orderData.billing.email}`).moveDown(1);

  // Divider
  doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();  // Horizontal line
  doc.moveDown(1);

  // Items List (styled)
  doc.fillColor('#333').fontSize(12).font('Helvetica-Bold').text('Items:', { underline: true }).moveDown(0.5);
  orderData.items.forEach((item, index) => {
    doc.text(
      `${index + 1}. ${item.name} (Qty: ${item.quantity}) - ₦${(item.price * item.quantity).toLocaleString('en-NG')}`
    ).moveDown(0.5);
  });

  doc.moveDown(1);

  // Shipping Address
  doc.fillColor('#333').fontSize(12).font('Helvetica-Bold').text('Shipping Address:', { underline: true }).moveDown(0.5);
  const shippingAddress = `${orderData.shipping.address1}, ${orderData.shipping.address2}, ${orderData.shipping.city}, ${orderData.shipping.state}, ${orderData.shipping.country}`;
  doc.text(shippingAddress).moveDown(1);

  // Total Price
  doc.fillColor('#386F4F').fontSize(14).font('Helvetica-Bold').text(`Total: ₦${orderData.total.toLocaleString('en-NG')}`, { align: 'right' });

  // Final Divider
  doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();

  doc.end();
  return receiptPath; // Path to the generated PDF
};

module.exports = { generateStyledReceipt };