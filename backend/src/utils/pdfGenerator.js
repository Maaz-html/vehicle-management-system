const PDFDocument = require('pdfkit');
const fs = require('fs');

const generateInvoice = (vehicle, client, res) => {
    const doc = new PDFDocument({ margin: 50 });

    // Pipe to response
    doc.pipe(res);

    // Header
    doc.fillColor('#444444')
        .fontSize(20)
        .text('INVOICE', 50, 57)
        .fontSize(10)
        .text('Arantara Vehicle Management', 200, 50, { align: 'right' })
        .text('123 Business Road', 200, 65, { align: 'right' })
        .text('City, Country, ZIP', 200, 80, { align: 'right' })
        .moveDown();

    // Invoice Details
    doc.text(`Invoice Number: INV-${vehicle.id}`, 50, 200)
        .text(`Invoice Date: ${new Date().toLocaleDateString()}`, 50, 215)
        .text(`Balance Due: ${(vehicle.total_charges - vehicle.money_paid).toFixed(2)}`, 50, 130)
        .moveDown();

    // Client Details
    doc.text(`Bill To:`, 300, 200)
        .text(client.name, 300, 215)
        .text(client.phone, 300, 230)
        .moveDown();

    // Table Header
    const tableTop = 330;
    doc.font('Helvetica-Bold');
    generateTableRow(doc, tableTop, 'Item', 'Description', 'Cost');
    generateHr(doc, tableTop + 20);
    doc.font('Helvetica');

    // Table Row
    const position = tableTop + 30;
    generateTableRow(
        doc,
        position,
        vehicle.work_type,
        `Vehicle: ${vehicle.vehicle_number} (${vehicle.vehicle_model})`,
        vehicle.total_charges
    );
    generateHr(doc, position + 20);

    // Total
    const subtotalPosition = position + 40;
    generateTableRow(doc, subtotalPosition, '', 'Subtotal', vehicle.total_charges);
    const paidPosition = subtotalPosition + 20;
    generateTableRow(doc, paidPosition, '', 'Paid', vehicle.money_paid);

    const duePosition = paidPosition + 25;
    doc.font('Helvetica-Bold');
    generateTableRow(doc, duePosition, '', 'Balance Due', (vehicle.total_charges - vehicle.money_paid).toFixed(2));

    // Footer
    doc.fontSize(10)
        .text('Payment is due within 15 days. Thank you for your business.', 50, 700, { align: 'center', width: 500 });

    doc.end();
};

function generateTableRow(doc, y, item, description, lineTotal) {
    doc.fontSize(10)
        .text(item, 50, y)
        .text(description, 150, y)
        .text(lineTotal, 0, y, { align: 'right' });
}

function generateHr(doc, y) {
    doc.strokeColor('#aaaaaa')
        .lineWidth(1)
        .moveTo(50, y)
        .lineTo(550, y)
        .stroke();
}

module.exports = { generateInvoice };
