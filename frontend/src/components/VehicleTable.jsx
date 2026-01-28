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

    const getPaymentIndicator = (vehicle) => {
        const paid = Number(vehicle.money_paid || 0);
        const total = Number(vehicle.total_charges || 0);

        if (paid === 0) return 'w-1 h-8 bg-rose-500 rounded-full shadow-[0_0_10px_rgba(244,63,94,0.3)]';
        if (paid < total) return 'w-1 h-8 bg-amber-500 rounded-full shadow-[0_0_10px_rgba(245,158,11,0.3)]';
        return 'w-1 h-8 bg-emerald-500 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.3)]';
    };

    const formatMoney = (value) => `₹${Number(value || 0).toLocaleString(undefined, { minimumFractionDigits: 0 })}`;

    if (loading) {
        return (
            <div className="space-y-4 animate-pulse">
                {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} className="h-20 bg-zinc-900/40 rounded-xl border border-zinc-800/50"></div>
                ))}
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Filters */}
            <div className="card border-zinc-800/80">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="md:col-span-2">
                        <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-2 ml-1">
                            Search Portfolio
                        </label>
                        <div className="relative group">
                            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <input
                                type="text"
                                className="input !pl-10"
                                placeholder="Client name or vehicle number..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-2 ml-1">
                            Status Filter
                        </label>
                        <select
                            className="input appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2024%2024%22%20stroke%3D%22%23666%22%3E%3Cpath%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%222%22%20d%3D%22M19%209l-7%207-7-7%22%20%2F%3E%3C%2Fsvg%3E')] bg-[length:1.25em_1.25em] bg-[right_0.75rem_center] bg-no-repeat"
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
                        <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-2 ml-1">
                            Sort Parameters
                        </label>
                        <select
                            className="input appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2024%2024%22%20stroke%3D%22%23666%22%3E%3Cpath%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%222%22%20d%3D%22M19%209l-7%207-7-7%22%20%2F%3E%3C%2Fsvg%3E')] bg-[length:1.25em_1.25em] bg-[right_0.75rem_center] bg-no-repeat"
                            value={`${sortBy}_${sortOrder}`}
                            onChange={(e) => {
                                const [field, order] = e.target.value.split('_');
                                setSortBy(field);
                                setSortOrder(order);
                            }}
                        >
                            <option value="date_DESC">Date (Newest)</option>
                            <option value="date_ASC">Date (Oldest)</option>
                            <option value="total_charges_DESC">Revenue (High to Low)</option>
                            <option value="total_charges_ASC">Revenue (Low to High)</option>
                            <option value="money_paid_DESC">Paid (High to Low)</option>
                            <option value="money_paid_ASC">Paid (Low to High)</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Results Count */}
            <div className="flex items-center justify-between px-2">
                <div className="text-zinc-500 text-xs font-medium uppercase tracking-widest">
                    Showing {vehicles.length} vehicle{vehicles.length !== 1 ? 's' : ''} in registry
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto rounded-2xl border border-zinc-800/80 bg-zinc-900/20">
                {vehicles.length === 0 ? (
                    <div className="text-center py-20 text-zinc-500">
                        <svg className="w-12 h-12 mx-auto mb-4 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        No vehicles found in the current registry view.
                    </div>
                ) : (
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-zinc-800 bg-zinc-800/30">
                                <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-widest">Client / ID</th>
                                <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-widest">Vehicle Details</th>
                                <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-widest">Registration</th>
                                <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-widest">Status</th>
                                <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-widest text-right">Financials</th>
                                <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-widest text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-800/50">
                            {vehicles.map((vehicle) => (
                                <tr
                                    key={vehicle.id}
                                    className="group hover:bg-white/[0.02] transition-colors"
                                >
                                    <td className="px-6 py-5">
                                        <div className="flex items-center space-x-4">
                                            <div className={getPaymentIndicator(vehicle)}></div>
                                            <div>
                                                <p className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors">
                                                    {vehicle.client_name}
                                                </p>
                                                <p className="text-[10px] text-zinc-500 uppercase tracking-wider mt-0.5">
                                                    VEH-{String(vehicle.id).padStart(4, '0')}
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div>
                                            <p className="text-sm font-mono font-medium text-white tracking-widest uppercase">
                                                {vehicle.vehicle_number}
                                            </p>
                                            <p className="text-xs text-zinc-500 mt-0.5">
                                                {vehicle.vehicle_model || 'Standard Model'}
                                            </p>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex flex-col">
                                            <p className="text-xs text-zinc-300">
                                                {new Date(vehicle.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                            </p>
                                            <span className="text-[10px] text-zinc-600 mt-1 flex items-center">
                                                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                </svg>
                                                Verified
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <span className={getStatusBadgeClass(vehicle.process_status)}>
                                            {vehicle.process_status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-5 text-right">
                                        <div className="flex flex-col items-end">
                                            <p className="text-sm font-bold text-white">
                                                {formatMoney(vehicle.total_charges)}
                                            </p>
                                            <p className={`text-[10px] mt-0.5 ${Number(vehicle.pending_amount) > 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
                                                {Number(vehicle.pending_amount) > 0 ? `Unpaid: ${formatMoney(vehicle.pending_amount)}` : 'Fully Settled'}
                                            </p>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex justify-center items-center space-x-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => navigate(`/vehicles/edit/${vehicle.id}`)}
                                                className="p-2 bg-zinc-800 hover:bg-blue-600 rounded-lg text-zinc-400 hover:text-white transition-all"
                                                title="Edit Vehicle"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                                </svg>
                                            </button>

                                            <button
                                                onClick={() => setViewDocsVehicleId(vehicle.id)}
                                                className="p-2 bg-zinc-800 hover:bg-emerald-600 rounded-lg text-zinc-400 hover:text-white transition-all relative"
                                                title="View Documents"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586c-.414.414-.414 1.086 0 1.5s1.086.414 1.5 0l6.586-6.586a2 2 0 012.828 2.828l-6.586 6.586a4 4 0 01-5.656-5.656l6.586-6.586a6 6 0 018.485 8.485L13 18.5" />
                                                </svg>
                                                {Number(vehicle.doc_count) > 0 && (
                                                    <span className="absolute -top-1 -right-1 bg-emerald-500 text-[8px] text-white w-4 h-4 rounded-full flex items-center justify-center font-bold animate-pulse">
                                                        {vehicle.doc_count}
                                                    </span>
                                                )}
                                            </button>

                                            <InvoiceButton vehicleId={vehicle.id} />

                                            <button
                                                onClick={() => handleDelete(vehicle.id)}
                                                className="p-2 bg-zinc-800 hover:bg-rose-600 rounded-lg text-zinc-400 hover:text-white transition-all"
                                                title="Delete Entry"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

            {/* Document Viewer Modal */}
            {viewDocsVehicleId && (
                <div
                    className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-6"
                    onClick={() => setViewDocsVehicleId(null)}
                >
                    <div
                        className="bg-zinc-900 rounded-3xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden border border-zinc-800 shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex justify-between items-center p-6 border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-md">
                            <div>
                                <h3 className="text-xl font-bold text-white">Registry Documents</h3>
                                <p className="text-xs text-zinc-500 mt-1 uppercase tracking-wider">Asset ID: VEH-{String(viewDocsVehicleId).padStart(4, '0')}</p>
                            </div>
                            <button
                                onClick={() => setViewDocsVehicleId(null)}
                                className="p-2 hover:bg-zinc-800 rounded-full text-zinc-400 hover:text-white transition-colors"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <div className="flex-1 overflow-auto p-6 bg-zinc-950/20">
                            <DocumentUploader
                                vehicleId={viewDocsVehicleId}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VehicleTable;
