import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllVehicles, deleteVehicle } from '../services/vehicleService';

const VehicleTable = () => {
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [sortBy, setSortBy] = useState('date');
    const [sortOrder, setSortOrder] = useState('DESC');
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
            setVehicles(data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching vehicles:', error);
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this vehicle?')) {
            try {
                await deleteVehicle(id);
                fetchVehicles();
            } catch (error) {
                alert('Error deleting vehicle: ' + error.message);
            }
        }
    };

    const getStatusBadgeClass = (status) => {
        const statusMap = {
            'Pending': 'badge-pending',
            'Processing': 'badge-processing',
            'Completed': 'badge-completed',
            'On Hold': 'badge-on-hold',
            'Cancelled': 'badge-cancelled'
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
                                <th className="px-4 py-3 text-left font-semibold">ID</th>
                                <th className="px-4 py-3 text-left font-semibold">Client</th>
                                <th className="px-4 py-3 text-left font-semibold">Phone</th>
                                <th className="px-4 py-3 text-left font-semibold">Vehicle #</th>
                                <th className="px-4 py-3 text-left font-semibold">Model</th>
                                <th className="px-4 py-3 text-left font-semibold">Work Type</th>
                                <th className="px-4 py-3 text-left font-semibold">Date</th>
                                <th className="px-4 py-3 text-left font-semibold">Status</th>
                                <th className="px-4 py-3 text-right font-semibold">Paid</th>
                                <th className="px-4 py-3 text-right font-semibold">Total</th>
                                <th className="px-4 py-3 text-right font-semibold">Pending</th>
                                <th className="px-4 py-3 text-center font-semibold">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {vehicles.map((vehicle) => (
                                <tr
                                    key={vehicle.id}
                                    className={`border-b transition-colors ${getPaymentRowClass(vehicle)}`}
                                >
                                    <td className="px-4 py-3 font-medium">VEH-{String(vehicle.id).padStart(3, '0')}</td>
                                    <td className="px-4 py-3">{vehicle.client_name}</td>
                                    <td className="px-4 py-3">{vehicle.client_phone}</td>
                                    <td className="px-4 py-3 font-medium uppercase">{vehicle.vehicle_number}</td>
                                    <td className="px-4 py-3">{vehicle.vehicle_model || '-'}</td>
                                    <td className="px-4 py-3">{vehicle.work_type || '-'}</td>
                                    <td className="px-4 py-3">{new Date(vehicle.date).toLocaleDateString()}</td>
                                    <td className="px-4 py-3">
                                        <span className={getStatusBadgeClass(vehicle.process_status)}>
                                            {vehicle.process_status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-right font-medium">₹{parseFloat(vehicle.money_paid || 0).toFixed(2)}</td>
                                    <td className="px-4 py-3 text-right font-medium">₹{parseFloat(vehicle.total_charges || 0).toFixed(2)}</td>
                                    <td className="px-4 py-3 text-right font-medium text-red-600">
                                        ₹{parseFloat(vehicle.pending_amount || 0).toFixed(2)}
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex justify-center space-x-2">
                                            <button
                                                onClick={() => navigate(`/vehicles/edit/${vehicle.id}`)}
                                                className="text-blue-600 hover:text-blue-800"
                                                title="Edit"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                </svg>
                                            </button>
                                            <button
                                                onClick={() => handleDelete(vehicle.id)}
                                                className="text-red-600 hover:text-red-800"
                                                title="Delete"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default VehicleTable;
