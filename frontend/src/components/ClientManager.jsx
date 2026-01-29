import React, { useState, useEffect } from 'react';
import { getAllClients, createClient, updateClient, deleteClient } from '../services/clientService';

const ClientManager = () => {
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({ name: '', phone: '', comments: '' });
    const [expandedClientId, setExpandedClientId] = useState(null);
    const [clientVehicles, setClientVehicles] = useState({});
    const [fetchingVehiclesId, setFetchingVehiclesId] = useState(null);

    useEffect(() => {
        fetchClients();
    }, []);

    const fetchClients = async () => {
        try {
            const data = await getAllClients();
            setClients(data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching clients:', error);
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.name || !formData.phone) {
            alert('Please fill in all fields');
            return;
        }

        if (!/^\d{10}$/.test(formData.phone)) {
            alert('Phone number must be exactly 10 digits');
            return;
        }

        try {
            if (editingClient) {
                await updateClient(editingClient.id, formData);
            } else {
                await createClient(formData);
            }
            setFormData({ name: '', phone: '', comments: '' });
            setShowForm(false);
            setEditingClient(null);
            fetchClients();
        } catch (error) {
            console.error('Error saving client:', error);
            alert('Error saving client');
        }
    };

    const handleEdit = (client) => {
        setEditingClient(client);
        setFormData({ name: client.name, phone: client.phone, comments: client.comments || '' });
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this client?')) {
            try {
                await deleteClient(id);
                fetchClients();
            } catch (error) {
                alert('Error: ' + error.response?.data?.error || error.message);
            }
        }
    };

    const handleCancel = () => {
        setShowForm(false);
        setEditingClient(null);
        setFormData({ name: '', phone: '', comments: '' });
    };

    const handlePhoneChange = (e) => {
        const value = e.target.value.replace(/\D/g, '').slice(0, 10);
        setFormData({ ...formData, phone: value });
    };

    const toggleExpand = async (clientId) => {
        if (expandedClientId === clientId) {
            setExpandedClientId(null);
            return;
        }

        setExpandedClientId(clientId);
        if (!clientVehicles[clientId]) {
            setFetchingVehiclesId(clientId);
            try {
                const { getAllVehicles } = await import('../services/vehicleService');
                const data = await getAllVehicles({ client_id: clientId });
                setClientVehicles({ ...clientVehicles, [clientId]: data });
            } catch (error) {
                console.error('Error fetching client vehicles:', error);
            } finally {
                setFetchingVehiclesId(null);
            }
        }
    };

    if (loading) {
        return (
            <div className="space-y-4 animate-pulse">
                {[1, 2, 3].map(i => (
                    <div key={i} className="h-16 bg-zinc-900/40 rounded-xl border border-zinc-800/50"></div>
                ))}
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-white tracking-tight">Portfolio Registry</h2>
                    <p className="text-zinc-500 mt-1">Manage client profiles and associations.</p>
                </div>
                {!showForm && (
                    <button
                        onClick={() => setShowForm(true)}
                        className="btn btn-primary px-8 shadow-xl shadow-blue-600/20"
                    >
                        + Onboard New Client
                    </button>
                )}
            </div>

            {/* Form */}
            {showForm && (
                <div className="card border-blue-500/20 bg-blue-500/[0.02] animate-in zoom-in-95 duration-300">
                    <div className="flex items-center space-x-2 mb-6">
                        <div className="w-1.5 h-6 bg-blue-600 rounded-full"></div>
                        <h3 className="text-lg font-bold text-white">
                            {editingClient ? 'Update Profile' : 'New Client Acquisition'}
                        </h3>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">
                                    Full Name / Entity
                                </label>
                                <input
                                    type="text"
                                    className="input"
                                    placeholder="Enter client name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">
                                    Contact Pathway
                                </label>
                                <input
                                    type="text"
                                    className="input"
                                    value={formData.phone}
                                    onChange={handlePhoneChange}
                                    placeholder="10 digit mobile number"
                                    pattern="\d{10}"
                                    required
                                />
                            </div>

                            <div className="md:col-span-2 space-y-2">
                                <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">
                                    Additional Notes / Comments
                                </label>
                                <textarea
                                    className="input min-h-[100px] py-3"
                                    placeholder="Enter any specific client instructions or background information..."
                                    value={formData.comments}
                                    onChange={(e) => setFormData({ ...formData, comments: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="flex space-x-4 pt-2">
                            <button type="submit" className="btn btn-primary px-8">
                                {editingClient ? 'Save Changes' : 'Initialize Profile'}
                            </button>
                            <button type="button" onClick={handleCancel} className="btn btn-secondary px-8">
                                Discard
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Clients List */}
            <div className="space-y-4">
                <div className="flex items-center justify-between px-2">
                    <div className="text-zinc-500 text-xs font-medium uppercase tracking-widest">
                        Database Audit: {clients.length} profiles active
                    </div>
                </div>

                <div className="overflow-hidden rounded-2xl border border-zinc-800/80 bg-zinc-900/20">
                    {clients.length === 0 ? (
                        <div className="text-center py-20 text-zinc-500">
                            <svg className="w-12 h-12 mx-auto mb-4 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                            No client profiles found in the registry.
                        </div>
                    ) : (
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-zinc-800 bg-zinc-800/30">
                                    <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-widest">Client Identity / Reference</th>
                                    <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-widest">Contact Information</th>
                                    <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-widest">Entry Date</th>
                                    <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-widest text-center">Management</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-800/50">
                                {clients.map((client) => (
                                    <React.Fragment key={client.id}>
                                        <tr className="group hover:bg-white/[0.02] transition-colors cursor-pointer" onClick={() => toggleExpand(client.id)}>
                                            <td className="px-6 py-5">
                                                <div className="flex items-center space-x-4">
                                                    <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400 group-hover:bg-blue-600/10 group-hover:text-blue-500 transition-all font-bold">
                                                        {client.name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors">
                                                            {client.name}
                                                        </p>
                                                        <p className="text-[10px] text-zinc-600 uppercase tracking-widest">
                                                            CID-{String(client.id).padStart(4, '0')}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <p className="text-sm text-zinc-300 font-mono">
                                                    {client.phone}
                                                </p>
                                            </td>
                                            <td className="px-6 py-5">
                                                <p className="text-xs text-zinc-500">
                                                    {new Date(client.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                                </p>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="flex justify-center items-center space-x-3 opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
                                                    <button
                                                        onClick={() => handleEdit(client)}
                                                        className="p-2 bg-zinc-800 hover:bg-blue-600 rounded-lg text-zinc-400 hover:text-white transition-all shadow-lg shadow-black/20"
                                                        title="Modify Profile"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                                        </svg>
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(client.id)}
                                                        className="p-2 bg-zinc-800 hover:bg-rose-600 rounded-lg text-zinc-400 hover:text-white transition-all shadow-lg shadow-black/20"
                                                        title="Decommission Profile"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                        {expandedClientId === client.id && (
                                            <tr className="bg-zinc-950/40">
                                                <td colSpan="4" className="px-10 py-6 border-l-2 border-blue-600/30">
                                                    <div className="space-y-6">
                                                        {client.comments && (
                                                            <div className="bg-blue-500/[0.03] border border-blue-500/10 p-4 rounded-xl">
                                                                <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Internal Notes</h4>
                                                                <p className="text-sm text-zinc-300 italic">{client.comments}</p>
                                                            </div>
                                                        )}

                                                        <div>
                                                            <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-4 flex items-center">
                                                                Associated Assets
                                                                <span className="ml-2 px-1.5 py-0.5 bg-zinc-800 rounded text-zinc-400">
                                                                    {clientVehicles[client.id] ? clientVehicles[client.id].length : 0}
                                                                </span>
                                                            </h4>

                                                            {fetchingVehiclesId === client.id ? (
                                                                <div className="flex items-center space-x-2 text-zinc-500 py-4">
                                                                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                                    </svg>
                                                                    <span className="text-xs uppercase tracking-widest">Querying Registry...</span>
                                                                </div>
                                                            ) : !clientVehicles[client.id] || clientVehicles[client.id].length === 0 ? (
                                                                <p className="text-sm text-zinc-600 italic py-4">No assets registered under this portfolio.</p>
                                                            ) : (
                                                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                                                    {clientVehicles[client.id].map(v => (
                                                                        <div key={v.id} className="bg-zinc-900/40 border border-zinc-800 p-4 rounded-xl hover:border-blue-500/30 transition-all">
                                                                            <div className="flex justify-between items-start mb-2">
                                                                                <span className="text-sm font-mono font-bold text-white tracking-widest">{v.vehicle_number}</span>
                                                                                <span className={`text-[10px] font-bold uppercase transition-colors px-2 py-0.5 rounded-full ${v.process_status === 'Completed' ? 'bg-emerald-500/10 text-emerald-500' :
                                                                                        v.process_status === 'Processing' ? 'bg-blue-500/10 text-blue-500' :
                                                                                            'bg-zinc-800 text-zinc-400'
                                                                                    }`}>
                                                                                    {v.process_status}
                                                                                </span>
                                                                            </div>
                                                                            <p className="text-xs text-zinc-500 mb-2">{v.vehicle_model || 'Standard Asset'}</p>
                                                                            <div className="flex justify-between items-center text-[10px] text-zinc-600 uppercase tracking-widest pt-2 border-t border-zinc-800/50">
                                                                                <span>{new Date(v.date).toLocaleDateString()}</span>
                                                                                <span className={Number(v.pending_amount) > 0 ? 'text-rose-500' : 'text-emerald-500'}>
                                                                                    {Number(v.pending_amount) > 0 ? `₹${v.pending_amount}` : 'Settled'}
                                                                                </span>
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ClientManager;
