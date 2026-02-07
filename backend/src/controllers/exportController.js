const ExcelJS = require('exceljs');
const pool = require('../utils/database');

exports.exportToExcel = async (req, res) => {
    try {
        const query = `
            SELECT v.*, c.name AS client_name, c.phone AS client_phone
            FROM vehicles v
            JOIN clients c ON v.client_id = c.id
            ORDER BY v.date DESC
        `;
        const result = await pool.query(query);
        const vehicles = result.rows;

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Vehicles Registry');

        // Style headers
        worksheet.columns = [
            { header: 'ID', key: 'id', width: 10 },
            { header: 'Date', key: 'date', width: 15 },
            { header: 'Client Name', key: 'client_name', width: 25 },
            { header: 'Phone', key: 'client_phone', width: 15 },
            { header: 'Vehicle Number', key: 'vehicle_number', width: 20 },
            { header: 'Model', key: 'vehicle_model', width: 20 },
            { header: 'Year', key: 'manufacturing_year', width: 10 },
            { header: 'Work Type', key: 'work_type', width: 30 },
            { header: 'Status', key: 'process_status', width: 15 },
            { header: 'Total Charges', key: 'total_charges', width: 15 },
            { header: 'Money Paid', key: 'money_paid', width: 15 },
            { header: 'Pending Amount', key: 'pending_amount', width: 15 },
            { header: 'Notes', key: 'notes', width: 40 }
        ];

        worksheet.getRow(1).font = { bold: true };
        worksheet.getRow(1).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFE2E8F0' }
        };

        // Add data
        vehicles.forEach(v => {
            const workTypes = Array.isArray(v.work_type)
                ? v.work_type
                : (typeof v.work_type === 'string' && v.work_type.startsWith('[') ? JSON.parse(v.work_type) : [v.work_type]);

            worksheet.addRow({
                id: v.id,
                date: new Date(v.date).toLocaleDateString(),
                client_name: v.client_name,
                client_phone: v.client_phone,
                vehicle_number: v.vehicle_number,
                vehicle_model: v.vehicle_model,
                manufacturing_year: v.manufacturing_year,
                work_type: Array.isArray(workTypes) ? workTypes.join(', ') : workTypes,
                process_status: v.process_status,
                total_charges: Number(v.total_charges),
                money_paid: Number(v.money_paid),
                pending_amount: Number(v.total_charges) - Number(v.money_paid),
                notes: v.notes
            });
        });

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=vehicle_registry_export.xlsx');

        await workbook.xlsx.write(res);
        res.end();
    } catch (error) {
        console.error('Export Error:', error);
        res.status(500).json({ error: 'Failed to generate Excel export' });
    }
};
