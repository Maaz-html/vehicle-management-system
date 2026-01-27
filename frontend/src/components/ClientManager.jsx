import { useState, useEffect } from 'react';
import { getAllClients, createClient, updateClient, deleteClient } from '../services/clientService';

const ClientManager = () => {
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingClient, setEditingClient] = useState(null);
    const [formData, setFormData] = useState({ name: '', phone: '' });

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

        // Validate phone number (exactly 10 digits)
        if (!/^\d{10}$/.test(formData.phone)) {
            alert('Phone number must be exactly 10 digits');
            return;
        }

        try {
            if (editingClient) {
                await updateClient(editingClient.id, formData);
                alert('Client updated successfully!');
            } else {
                await createClient(formData);
                alert('Client added successfully!');
            }
            setFormData({ name: '', phone: '' });
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
        setFormData({ name: client.name, phone: client.phone });
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
        setFormData({ name: '', phone: '' });
    };

    const handlePhoneChange = (e) => {
        // Only allow digits, max 10
        const value = e.target.value.replace(/\D/g, '').slice(0, 10);
        setFormData({ ...formData, phone: value });
    };

    if (loading) {
        return <div className="text-center py-8">Loading clients...</div>;
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">Client Management</h2>
                {!showForm && (
                    <button
                        onClick={() => setShowForm(true)}
                        className="btn btn-primary"
                    >
                        + Add New Client
                    </button>
                )}
            </div>

            {/* Form */}
            {showForm && (
                <div className="card bg-blue-50">
                    <h3 className="text-xl font-semibold mb-4 text-gray-800">
                        {editingClient ? 'Edit Client' : 'Add New Client'}
                    </h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Client Name *
                                </label>
                                <input
                                    type="text"
                                    className="input"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Phone Number *
                                </label>
                                <input
                                    type="text"
                                    className="input"
                                    value={formData.phone}
                                    onChange={handlePhoneChange}
                                    placeholder="10 digits only"
                                    pattern="\d{10}"
                                    maxLength="10"
                                    required
                                />
                            </div>
                        </div>

                        <div className="flex space-x-4">
                            <button type="submit" className="btn btn-primary">
                                {editingClient ? 'Update Client' : 'Add Client'}
                            </button>
                            <button type="button" onClick={handleCancel} className="btn btn-secondary">
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Clients List */}
            <div className="card">
                <h3 className="text-xl font-semibold mb-4 text-gray-800">
                    All Clients ({clients.length})
                </h3>

                {clients.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        No clients found. Add your first client to get started!
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-gray-100 border-b">
                                    <th className="px-4 py-3 text-left font-semibold">ID</th>
                                    <th className="px-4 py-3 text-left font-semibold">Name</th>
                                    <th className="px-4 py-3 text-left font-semibold">Phone</th>
                                    <th className="px-4 py-3 text-left font-semibold">Created At</th>
                                    <th className="px-4 py-3 text-center font-semibold">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {clients.map((client) => (
                                    <tr key={client.id} className="border-b hover:bg-gray-50">
                                        <td className="px-4 py-3 font-medium">{client.id}</td>
                                        <td className="px-4 py-3">{client.name}</td>
                                        <td className="px-4 py-3">{client.phone}</td>
                                        <td className="px-4 py-3">
                                            {new Date(client.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex justify-center space-x-2">
                                                <button
                                                    onClick={() => handleEdit(client)}
                                                    className="text-blue-600 hover:text-blue-800"
                                                    title="Edit"
                                                >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                    </svg>
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(client.id)}
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
                    </div>
                )}
            </div>
        </div>
    );
};

export default ClientManager;
