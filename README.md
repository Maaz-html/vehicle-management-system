# Vehicle Management System

A modern full-stack web application for managing vehicle services, clients, and payments. Built with React frontend and Node.js/Express backend with SQLite database.

## Features

- **Client Management**: Add, edit, delete clients with auto-complete functionality
- **Vehicle Entry System**: Complete vehicle tracking with all required fields
- **Payment Tracking**: Monitor paid, pending, and total charges with color-coded indicators
- **Document Management**: Upload, view, and manage multiple documents per vehicle
- **Search & Filter**: Advanced search by client name/vehicle number with status filtering
- **Export Data**: Export to Excel (.xlsx) and CSV formats
- **Data Backup**: Create complete backups of all data
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## Tech Stack

### Frontend
- React 18+
- Vite
- Tailwind CSS
- React Router
- Axios

### Backend
- Node.js
- Express.js
- SQLite3
- Multer (file uploads)
- ExcelJS (Excel export)

## Installation

### Prerequisites
- Node.js 18+ installed
- npm or yarn package manager

### Setup Instructions

1. **Clone/Navigate to the project directory**
   ```bash
   cd C:\Users\User\.gemini\antigravity\scratch\vehicle-management-system
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   npm run dev
   ```
   Backend will run on http://localhost:5000

3. **Frontend Setup** (in a new terminal)
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   Frontend will run on http://localhost:5173

4. **Access the Application**
   Open your browser and navigate to http://localhost:5173

## Project Structure

```
vehicle-management-system/
├── frontend/
│   ├── src/
│   │   ├── components/         # React components
│   │   ├── pages/              # Page components
│   │   ├── services/           # API service files
│   │   ├── App.jsx             # Main app component
│   │   └── main.jsx            # Entry point
│   └── package.json
│
├── backend/
│   ├── src/
│   │   ├── controllers/        # Route controllers
│   │   ├── routes/             # API routes
│   │   ├── middleware/         # Express middleware
│   │   ├── utils/              # Utility files
│   │   └── server.js           # Server entry point
│   ├── uploads/                # Uploaded documents
│   └── package.json
│
├── database/
│   └── vehicle_management.db   # SQLite database
│
└── README.md
```

## Usage Guide

### Adding a New Vehicle

1. Click "Add New Vehicle" button
2. Select existing client or add a new one
3. Fill in vehicle details (number, model, year, work type)
4. Enter payment information
5. Optionally upload documents
6. Click "Add Vehicle"

### Managing Clients

1. Navigate to "Clients" page
2. Click "Add New Client" to create a new client
3. Edit or delete existing clients using action buttons

### Searching & Filtering

- Use the search box to find vehicles by client name or vehicle number
- Filter by process status (Pending, Processing, Completed, etc.)
- Sort by date, charges, or payment amount

### Exporting Data

1. Navigate to "Reports" page
2. Choose export format:
   - **Excel**: Complete data with separate sheets
   - **CSV**: Vehicle data in CSV format
   - **Backup**: Full backup in Excel format

## API Endpoints

### Clients
- `GET /api/clients` - Get all clients
- `POST /api/clients` - Create new client
- `PUT /api/clients/:id` - Update client
- `DELETE /api/clients/:id` - Delete client

### Vehicles
- `GET /api/vehicles` - Get all vehicles (with filters)
- `POST /api/vehicles` - Create new vehicle
- `PUT /api/vehicles/:id` - Update vehicle
- `DELETE /api/vehicles/:id` - Delete vehicle
- `GET /api/vehicles/summary/payment` - Get payment summary

### Documents
- `POST /api/documents/upload` - Upload documents
- `GET /api/documents/vehicle/:id` - Get documents by vehicle
- `GET /api/documents/:id/download` - Download document
- `DELETE /api/documents/:id` - Delete document

### Export
- `GET /api/export/excel` - Export to Excel
- `GET /api/export/csv` - Export to CSV
- `GET /api/export/backup` - Create backup

## Database Schema

### Clients Table
- id (PRIMARY KEY)
- name
- phone
- created_at
- updated_at

### Vehicles Table
- id (PRIMARY KEY)
- client_id (FOREIGN KEY)
- vehicle_number
- vehicle_model
- manufacturing_year
- work_type
- date
- process_status
- money_paid
- total_charges
- created_at
- updated_at

### Documents Table
- id (PRIMARY KEY)
- vehicle_id (FOREIGN KEY)
- filename
- original_filename
- file_path
- file_size
- uploaded_at

## Development

### Backend Development
```bash
cd backend
npm run dev  # Uses nodemon for auto-restart
```

### Frontend Development
```bash
cd frontend
npm run dev  # Vite dev server with hot reload
```

### Production Build
```bash
# Frontend
cd frontend
npm run build

# Backend
cd backend
npm start
```

## Features Implementation

✅ Client auto-complete and reuse  
✅ Auto-generated vehicle IDs (VEH-001, VEH-002, etc.)  
✅ Color-coded payment status (Red: Unpaid, Yellow: Partial, Green: Paid)  
✅ Multi-document upload per vehicle  
✅ Search by client name or vehicle number  
✅ Filter by process status  
✅ Sort by date, charges, payments  
✅ Excel and CSV export  
✅ Complete data backup functionality  
✅ Responsive design for all screen sizes  

## License

This project is created for internal business use.

## Support

For issues or questions, please contact the development team.
