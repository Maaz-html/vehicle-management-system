import { exportToExcel, exportToCSV, createBackup } from '../services/exportService';

const Reports = () => {
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-800">Reports & Export</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Excel Export */}
                <div className="card bg-gradient-to-br from-green-50 to-green-100 border border-green-200">
                    <div className="text-center space-y-4">
                        <div className="flex justify-center">
                            <svg className="w-16 h-16 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-gray-800">Excel Export</h3>
                            <p className="text-sm text-gray-600 mt-2">
                                Export all data to Excel format (.xlsx) with separate sheets for clients and vehicles
                            </p>
                        </div>
                        <button onClick={exportToExcel} className="btn btn-success w-full">
                            <svg className="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                            Download Excel
                        </button>
                    </div>
                </div>

                {/* CSV Export */}
                <div className="card bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200">
                    <div className="text-center space-y-4">
                        <div className="flex justify-center">
                            <svg className="w-16 h-16 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-gray-800">CSV Export</h3>
                            <p className="text-sm text-gray-600 mt-2">
                                Export vehicle data to CSV format for use in spreadsheet applications
                            </p>
                        </div>
                        <button onClick={exportToCSV} className="btn btn-primary w-full">
                            <svg className="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                            Download CSV
                        </button>
                    </div>
                </div>

                {/* Backup */}
                <div className="card bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200">
                    <div className="text-center space-y-4">
                        <div className="flex justify-center">
                            <svg className="w-16 h-16 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-gray-800">Create Backup</h3>
                            <p className="text-sm text-gray-600 mt-2">
                                Create a complete backup of all data in Excel format for archival purposes
                            </p>
                        </div>
                        <button onClick={createBackup} className="btn bg-purple-600 hover:bg-purple-700 text-white w-full">
                            <svg className="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                            Create Backup
                        </button>
                    </div>
                </div>
            </div>

            {/* Instructions */}
            <div className="card bg-gray-50">
                <h3 className="text-lg font-bold text-gray-800 mb-3">Export Instructions</h3>
                <ul className="list-disc list-inside space-y-2 text-sm text-gray-700">
                    <li>
                        <strong>Excel Export:</strong> Downloads all data in .xlsx format with separate sheets for clients and vehicles. Best for comprehensive data analysis.
                    </li>
                    <li>
                        <strong>CSV Export:</strong> Downloads vehicle data in comma-separated values format. Compatible with all spreadsheet applications.
                    </li>
                    <li>
                        <strong>Backup:</strong> Creates a complete backup file identical to Excel export. Recommended for regular data backups.
                    </li>
                    <li>
                        All exports include complete data with client details, vehicle information, payment status, and calculated pending amounts.
                    </li>
                </ul>
            </div>
        </div>
    );
};

export default Reports;
