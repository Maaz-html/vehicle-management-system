const PDFDocument = require('pdfkit');

const generateInvoice = (vehicle, client, res) => {
    const doc = new PDFDocument({
        margin: 50,
        size: 'A4'
    });

    // Pipe to response
    doc.pipe(res);

    // Primary Colors
    const primaryColor = '#1e293b'; // Slate 800
    const secondaryColor = '#64748b'; // Slate 500
    const accentColor = '#2563eb'; // Blue 600
    const lightBg = '#f8fafc'; // Slate 50

    // --- Header Section ---
    doc.rect(0, 0, 612, 120).fill('#0f172a'); // Header background

    doc.fillColor('#ffffff')
        .fontSize(24)
        .font('Helvetica-Bold')
        .text('MEER ENTERPRISES', 50, 45);

    doc.fontSize(10)
        .font('Helvetica')
        .fillColor('#94a3b8')
        .text('Professional Fleet Management & Car Care', 50, 75);

    doc.fillColor('#ffffff')
        .fontSize(10)
        .text('123 Business Road, Corporate Hub', 350, 45, { align: 'right' })
        .text('City, Country, ZIP 560001', 350, 60, { align: 'right' })
        .text('+91 9876543210 | meer.ent@example.com', 350, 75, { align: 'right' });

    // --- Invoice Info Section ---
    doc.fillColor(primaryColor)
        .fontSize(28)
        .font('Helvetica-Bold')
        .text('INVOICE', 50, 160);

    const infoTop = 210;
    doc.fontSize(10).font('Helvetica-Bold').fillColor(secondaryColor).text('INVOICE NUMBER', 50, infoTop);
    doc.fontSize(12).font('Helvetica-Bold').fillColor(primaryColor).text(`INV-${String(vehicle.id).padStart(5, '0')}`, 50, infoTop + 15);

    doc.fontSize(10).font('Helvetica-Bold').fillColor(secondaryColor).text('DATE ISSUED', 200, infoTop);
    doc.fontSize(12).font('Helvetica-Bold').fillColor(primaryColor).text(new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }), 200, infoTop + 15);

    // Bill To Box
    doc.rect(350, 160, 210, 80).fill(lightBg);
    doc.fontSize(10).font('Helvetica-Bold').fillColor(secondaryColor).text('BILL TO:', 365, 175);
    doc.fontSize(14).font('Helvetica-Bold').fillColor(primaryColor).text(client.name, 365, 195);
    doc.fontSize(11).font('Helvetica').fillColor(secondaryColor).text(client.phone, 365, 215);

    // --- Table Section ---
    const tableTop = 300;

    // Header Row
    doc.rect(50, tableTop, 512, 30).fill(primaryColor);
    doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(10);
    doc.text('ITEM & DESCRIPTION', 65, tableTop + 10);
    doc.text('UNIT PRICE', 350, tableTop + 10, { width: 100, align: 'right' });
    doc.text('TOTAL', 450, tableTop + 10, { width: 100, align: 'right' });

    // Item Row
    const rowY = tableTop + 45;
    doc.fillColor(primaryColor).font('Helvetica-Bold').fontSize(12);
    const workItems = Array.isArray(vehicle.work_type) ? vehicle.work_type : (typeof vehicle.work_type === 'string' ? JSON.parse(vehicle.work_type) : [vehicle.work_type]);
    doc.text(workItems.join(', '), 65, rowY);

    doc.font('Helvetica').fontSize(10).fillColor(secondaryColor);
    doc.text(`Vehicle: ${vehicle.vehicle_number} (${vehicle.vehicle_model || 'Standard Model'})`, 65, rowY + 18);
    doc.text(`Year: ${vehicle.manufacturing_year || 'N/A'}`, 65, rowY + 32);

    doc.font('Helvetica-Bold').fontSize(12).fillColor(primaryColor);
    doc.text(`₹${Number(vehicle.total_charges).toLocaleString()}`, 350, rowY, { width: 100, align: 'right' });
    doc.text(`₹${Number(vehicle.total_charges).toLocaleString()}`, 450, rowY, { width: 100, align: 'right' });

    doc.strokeColor('#e2e8f0').lineWidth(1).moveTo(50, rowY + 55).lineTo(562, rowY + 55).stroke();

    // --- totals Section ---
    const totalsTop = rowY + 80;

    // Summary
    doc.fontSize(10).font('Helvetica').fillColor(secondaryColor).text('Subtotal', 350, totalsTop);
    doc.fontSize(10).font('Helvetica-Bold').fillColor(primaryColor).text(`₹${Number(vehicle.total_charges).toLocaleString()}`, 450, totalsTop, { width: 100, align: 'right' });

    doc.fontSize(10).font('Helvetica').fillColor(secondaryColor).text('Amount Paid', 350, totalsTop + 25);
    doc.fontSize(10).font('Helvetica-Bold').fillColor('#059669').text(`₹${Number(vehicle.money_paid || 0).toLocaleString()}`, 450, totalsTop + 25, { width: 100, align: 'right' });

    // Due Box
    const dueAmount = Number(vehicle.total_charges) - Number(vehicle.money_paid || 0);
    doc.rect(340, totalsTop + 50, 222, 40).fill(dueAmount > 0 ? '#fff1f2' : '#f0fdf4');

    doc.fontSize(12).font('Helvetica-Bold').fillColor(dueAmount > 0 ? '#e11d48' : '#166534');
    doc.text('BALANCE DUE', 350, totalsTop + 63);
    doc.text(`₹${dueAmount.toLocaleString()}`, 450, totalsTop + 63, { width: 100, align: 'right' });

    // --- Footer Section ---
    const footerTop = 750;
    doc.strokeColor(accentColor).lineWidth(2).moveTo(50, footerTop).lineTo(150, footerTop).stroke();

    doc.fontSize(10).font('Helvetica-Bold').fillColor(primaryColor).text('THANK YOU FOR YOUR BUSINESS', 50, footerTop + 15);
    doc.fontSize(9).font('Helvetica').fillColor(secondaryColor).text('Payment is due within 15 days of invoice date. Please quote invoice number for reference.', 50, footerTop + 30);

    doc.end();
};

module.exports = { generateInvoice };
