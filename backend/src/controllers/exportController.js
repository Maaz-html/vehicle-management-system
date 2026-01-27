const ExcelJS = require('exceljs');
const db = require('../utils/database');

// Export to Excel
exports.exportToExcel = async (req, res) => {
    try {
        const workbook = new ExcelJS.Workbook();

        // Create Clients sheet
        const clientsSheet = workbook.addWorksheet('Clients');
        clientsSheet.columns = [
            { header: 'ID', key: 'id', width: 10 },
            { header: 'Name', key: 'name', width: 30 },
            { header: 'Phone', key: 'phone', width: 20 },
            { header: 'Created At', key: 'created_at', width: 20 }
        ];

        const clients = await new Promise((resolve, reject) => {
            db.all('SELECT * FROM clients ORDER BY id', [], (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });

        clients.forEach(client => {
            clientsSheet.addRow(client);
        });

        // Create Vehicles sheet
        const vehiclesSheet = workbook.addWorksheet('Vehicles');
        vehiclesSheet.columns = [
            { header: 'ID', key: 'id', width: 10 },
            { header: 'Client Name', key: 'client_name', width: 30 },
            { header: 'Client Phone', key: 'client_phone', width: 20 },
            { header: 'Vehicle Number', key: 'vehicle_number', width: 20 },
            { header: 'Vehicle Model', key: 'vehicle_model', width: 20 },
            { header: 'Manufacturing Year', key: 'manufacturing_year', width: 20 },
            { header: 'Work Type', key: 'work_type', width: 20 },
            { header: 'Date', key: 'date', width: 15 },
            { header: 'Process Status', key: 'process_status', width: 20 },
            { header: 'Money Paid', key: 'money_paid', width: 15 },
            { header: 'Total Charges', key: 'total_charges', width: 15 },
            { header: 'Pending Amount', key: 'pending_amount', width: 15 }
        ];

        const vehicles = await new Promise((resolve, reject) => {
            db.all(`
        SELECT v.*, c.name as client_name, c.phone as client_phone,
               (v.total_charges - v.money_paid) as pending_amount
        FROM vehicles v
        JOIN clients c ON v.client_id = c.id
        ORDER BY v.id
      `, [], (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });

        vehicles.forEach(vehicle => {
            vehiclesSheet.addRow(vehicle);
        });

        // Style headers
        [clientsSheet, vehiclesSheet].forEach(sheet => {
            sheet.getRow(1).font = { bold: true };
            sheet.getRow(1).fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FFD3D3D3' }
            };
        });

        // Set response headers
        res.setHeader(
            'Content-Type',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        );
        res.setHeader(
            'Content-Disposition',
            `attachment; filename=vehicle_data_${Date.now()}.xlsx`
        );

        await workbook.xlsx.write(res);
        res.end();

    } catch (error) {
        console.error('Export error:', error);
        res.status(500).json({ error: error.message });
    }
};

// Export to CSV
exports.exportToCSV = (req, res) => {
    const query = `
    SELECT v.id, c.name as client_name, c.phone as client_phone,
           v.vehicle_number, v.vehicle_model, v.manufacturing_year,
           v.work_type, v.date, v.process_status, v.money_paid,
           v.total_charges, (v.total_charges - v.money_paid) as pending_amount
    FROM vehicles v
    JOIN clients c ON v.client_id = c.id
    ORDER BY v.id
  `;

    db.all(query, [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        if (rows.length === 0) {
            return res.status(404).json({ error: 'No data to export' });
        }

        // Create CSV header
        const headers = Object.keys(rows[0]);
        let csv = headers.join(',') + '\n';

        // Add rows
        rows.forEach(row => {
            const values = headers.map(header => {
                const value = row[header];
                // Handle values with commas or quotes
                if (value === null || value === undefined) return '';
                const stringValue = String(value);
                if (stringValue.includes(',') || stringValue.includes('"')) {
                    return `"${stringValue.replace(/"/g, '""')}"`;
                }
                return stringValue;
            });
            csv += values.join(',') + '\n';
        });

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename=vehicle_data_${Date.now()}.csv`);
        res.send(csv);
    });
};

// Create backup
exports.createBackup = async (req, res) => {
    // Backup is essentially the same as Excel export
    exports.exportToExcel(req, res);
};
