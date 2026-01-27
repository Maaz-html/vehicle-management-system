import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllVehicles, deleteVehicle } from '../services/vehicleService';
import InvoiceButton from './InvoiceButton';
import DocumentUploader from './DocumentUploader';

const VehicleTable = () => {
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [sortBy, setSortBy] = useState('date');
    const [sortOrder, setSortOrder] = useState('DESC');
    const [viewDocsVehicleId, setViewDocsVehicleId] = useState(null);

    const navigate = useNavigate();

    useEffect(() => {
        fetchVehicles();
    }, [search, statusFilter, sortBy, sortOrder]);

    const fetchVehicles = async () => {
        try {
            setLoading(true);

            const params = {};
            if (search) params.search = search;
            if (statusFilter) params.status = statusFilter;
            params.sortBy = sortBy;
            params.sortOrder = sortOrder;

            const data = await getAllVehicles(params);
            setVehicles(data || []);
        } catch (error) {
            console.error('Error fetching vehicles:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this vehicle?')) return;

        try {
            await deleteVehicle(id);
            fetchVehicles();
        } catch (error) {
            alert('Error deleting vehicle: ' + error.message);
        }
    };

    const getStatusBadgeClass = (status) => {
        const statusMap = {
            Pending: 'badge-pending',
            Processing: 'badge-processing',
            Completed: 'badge-completed',
            'On Hold': 'badge-on-hold',
            Cancelled: 'badge-cancelled',
        };
        return `badge ${statusMap[status] || 'badge-pending'}`;
    };

    const getPaymentRowClass = (vehicle) => {
        const paid = Number(vehicle.money_paid || 0);
        const total = Number(vehicle.total_charges || 0);

        if (paid === 0) return 'border-l-4 border-l-red-500 hover:bg-gray-50';
        if (paid < total) return 'border-l-4 border-l-orange-500 hover:bg-gray-50';
        return 'border-l-4 border-l-green-500 hover:bg-gray-50';
    };

    const formatMoney = (value) => `₹${Number(value || 0).toFixed(2)}`;

    if (loading) {
        return <div className="text-center py-8">Loading vehicles...</div>;
    }

    return (
        <div className="space-y-4">
            {/* Filters */}
            <div className="card">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Search (Client Name / Vehicle Number)
                        </label>
                        <input
                            type="text"
                            className="input"
                            placeholder="Search..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Status Filter
                        </label>
                        <select
                            className="input"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="">All Statuses</option>
                            <option value="Pending">Pending</option>
                            <option value="Processing">Processing</option>
                            <option value="Completed">Completed</option>
                            <option value="On Hold">On Hold</option>
                            <option value="Cancelled">Cancelled</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Sort By
                        </label>
                        <select
                            className="input"
                            value={`${sortBy}_${sortOrder}`}
                            onChange={(e) => {
                                const [field, order] = e.target.value.split('_');
                                setSortBy(field);
                                setSortOrder(order);
                            }}
                        >
                            <option value="date_DESC">Date (Newest)</option>
                            <option value="date_ASC">Date (Oldest)</option>
                            <option value="total_charges_DESC">Total Charges (High to Low)</option>
                            <option value="total_charges_ASC">Total Charges (Low to High)</option>
                            <option value="money_paid_DESC">Money Paid (High to Low)</option>
                            <option value="money_paid_ASC">Money Paid (Low to High)</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Results Count */}
            <div className="text-sm text-gray-600">
                Showing {vehicles.length} vehicle{vehicles.length !== 1 ? 's' : ''}
            </div>

            {/* Table */}
            <div className="card overflow-x-auto">
                {vehicles.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        No vehicles found. Add your first vehicle to get started!
                    </div>
                ) : (
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-gray-100 border-b">
                                <th className="px-4 py-3 text-left">ID</th>
                                <th className="px-4 py-3 text-left">Client</th>
                                <th className="px-4 py-3 text-left">Phone</th>
                                <th className="px-4 py-3 text-left">Vehicle #</th>
                                <th className="px-4 py-3 text-left">Model</th>
                                <th className="px-4 py-3 text-left">Work Type</th>
                                <th className="px-4 py-3 text-left">Date</th>
                                <th className="px-4 py-3 text-left">Status</th>
                                <th className="px-4 py-3 text-right">Paid</th>
                                <th className="px-4 py-3 text-right">Total</th>
                                <th className="px-4 py-3 text-right">Pending</th>
                                <th className="px-4 py-3 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {vehicles.map((vehicle) => (
                                <tr
                                    key={vehicle.id}
                                    className={`border-b ${getPaymentRowClass(vehicle)}`}
                                >
                                    <td className="px-4 py-3 font-medium">
                                        VEH-{String(vehicle.id).padStart(3, '0')}
                                    </td>
                                    <td className="px-4 py-3">{vehicle.client_name}</td>
                                    <td className="px-4 py-3">{vehicle.client_phone}</td>
                                    <td className="px-4 py-3 uppercase font-medium">
                                        {vehicle.vehicle_number}
                                    </td>
                                    <td className="px-4 py-3">{vehicle.vehicle_model || '-'}</td>
                                    <td className="px-4 py-3">
                                        {(() => {
                                            try {
                                                const wt = vehicle.work_type;
                                                if (!wt) return '-';
                                                if (Array.isArray(wt)) return wt.join(', ');
                                                if (typeof wt === 'string' && wt.trim().startsWith('[')) {
                                                    return JSON.parse(wt).join(', ');
                                                }
                                                return wt;
                                            } catch {
                                                return vehicle.work_type;
                                            }
                                        })()}
                                    </td>
                                    <td className="px-4 py-3">
                                        {new Date(vehicle.date).toLocaleDateString()}
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={getStatusBadgeClass(vehicle.process_status)}>
                                            {vehicle.process_status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-right font-medium">
                                        {formatMoney(vehicle.money_paid)}
                                    </td>
                                    <td className="px-4 py-3 text-right font-medium">
                                        {formatMoney(vehicle.total_charges)}
                                    </td>
                                    <td className="px-4 py-3 text-right font-medium text-red-600">
                                        {formatMoney(vehicle.pending_amount)}
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex justify-center space-x-2">
                                            <button
                                                onClick={() => navigate(`/vehicles/edit/${vehicle.id}`)}
                                                className="text-blue-600 hover:text-blue-800"
                                                title="Edit"
                                            >
                                                ✏️
                                            </button>

                                            <button
                                                onClick={() => handleDelete(vehicle.id)}
                                                className="text-red-600 hover:text-red-800"
                                                title="Delete"
                                            >
                                                🗑️
                                            </button>

                                            <button
                                                onClick={() => setViewDocsVehicleId(vehicle.id)}
                                                className="text-gray-600 hover:text-gray-800"
                                                title="View Documents"
                                            >
                                                📄
                                            </button>

                                            <InvoiceButton vehicleId={vehicle.id} />
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Document Viewer Modal */}
            {viewDocsVehicleId && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
                    onClick={() => setViewDocsVehicleId(null)}
                >
                    <div
                        className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex justify-between items-center p-4 border-b bg-gray-50">
                            <h3 className="text-lg font-semibold">Vehicle Documents</h3>
                            <button
                                onClick={() => setViewDocsVehicleId(null)}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                ✖
                            </button>
                        </div>
                        <div className="flex-1 overflow-auto p-4">
                            <DocumentUploader
                                vehicleId={viewDocsVehicleId}
                                readOnly={true}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VehicleTable;
