const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

function generateHeader(doc) {
  doc
    .fillColor("#444444")
    .fontSize(20)
    .text("Devesh Inc.", 110, 57)
    .fontSize(10)
    .text("H-92 Sector-63", 200, 65, { align: "right" })
    .text("Noida, UP, 201301", 200, 80, { align: "right" })
    .moveDown();
}

function generateCustomerInformation(doc, order) {
  doc.fillColor("#444444").fontSize(20).text("Invoice", 50, 160);

  generateHr(doc, 185);

  const customerInformationTop = 200;

  doc
    .fontSize(10)
    .text("Order ID:", 50, customerInformationTop)
    .font("Helvetica-Bold")
    .text(order._id.toString(), 150, customerInformationTop)
    .font("Helvetica")
    .text("Invoice Date:", 50, customerInformationTop + 15)
    .text(formatDate(new Date()), 150, customerInformationTop + 15)

    .font("Helvetica-Bold")
    .text(order.user.name, 300, customerInformationTop)
    .font("Helvetica")
    .text(`User ID: ${order.user.userId}`, 300, customerInformationTop + 15)
    .moveDown();

  generateHr(doc, 252);
}

function generateInvoiceTable(doc, order) {
  let i;
  const invoiceTableTop = 330;

  doc.font("Helvetica-Bold");
  generateTableRow(
    doc,
    invoiceTableTop,
    "Item",
    "Description",
    "Unit Cost",
    "Quantity",
    "Line Total"
  );
  generateHr(doc, invoiceTableTop + 20);
  doc.font("Helvetica");

  let totalAmount = 0;

  for (i = 0; i < order.products.length; i++) {
    const item = order.products[i];
    const position = invoiceTableTop + (i + 1) * 30;
    const lineTotal = item.product.price * item.quantity;
    totalAmount += lineTotal;

    generateTableRow(
      doc,
      position,
      item.product.title,
      formatCurrency(item.product.price),
      item.quantity,
      formatCurrency(lineTotal)
    );

    generateHr(doc, position + 20);
  }

  const subtotalPosition = invoiceTableTop + (i + 1) * 30;
  doc.font("Helvetica-Bold");
  generateTableRow(
    doc,
    subtotalPosition,
    "",
    "",
    "Total",
    "",
    formatCurrency(totalAmount)
  );
  doc.font("Helvetica");
}

function generateFooter(doc) {
  doc.fontSize(10).text("Thank you for your business.", 50, 780, {
    align: "center",
    width: 500,
  });
}

function generateTableRow(
  doc,
  y,
  item,
  description,
  unitCost,
  quantity,
  lineTotal
) {
  doc
    .fontSize(10)
    .text(item, 50, y)
    .text(description, 150, y)
    .text(unitCost, 280, y, { width: 90, align: "right" })
    .text(quantity, 370, y, { width: 90, align: "right" })
    .text(lineTotal, 0, y, { align: "right" });
}

function generateHr(doc, y) {
  doc.strokeColor("#aaaaaa").lineWidth(1).moveTo(50, y).lineTo(550, y).stroke();
}

function formatCurrency(cents) {
  return "$" + cents.toFixed(2);
}

function formatDate(date) {
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();

  return year + "/" + month + "/" + day;
}

function generateInvoice(order, orderId, res) {
  const invoiceName = `invoice-${orderId}.pdf`;
  const invoicePath = path.join("data", "invoices", invoiceName);

  let doc = new PDFDocument({ size: "A4", margin: 50 });

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `inline; filename="${invoiceName}"`);

  doc.pipe(fs.createWriteStream(invoicePath));
  doc.pipe(res);

  generateHeader(doc);
  generateCustomerInformation(doc, order);
  generateInvoiceTable(doc, order);
  generateFooter(doc);

  doc.end();
}

module.exports = {
  generateInvoice,
};
