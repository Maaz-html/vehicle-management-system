import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getAllClients, createClient } from '../services/clientService';
import { createVehicle, updateVehicle, getVehicleById, uploadDocuments } from '../services/vehicleService';

const AddVehicleForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditMode = !!id;

    const [clients, setClients] = useState([]);
    const [selectedClientId, setSelectedClientId] = useState('');
    const [newClientName, setNewClientName] = useState('');
    const [newClientPhone, setNewClientPhone] = useState('');
    const [showNewClientForm, setShowNewClientForm] = useState(false);

    const [formData, setFormData] = useState({
        vehicle_number: '',
        vehicle_model: '',
        manufacturing_year: '',
        work_type: '',
        date: new Date().toISOString().split('T')[0],
        process_status: 'Pending',
        money_paid: 0,
        total_charges: 0
    });

    const [documents, setDocuments] = useState([]);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchClients();
        if (isEditMode) {
            fetchVehicle();
        }
    }, [id]);

    const fetchClients = async () => {
        try {
            const data = await getAllClients();
            setClients(data);
        } catch (error) {
            console.error('Error fetching clients:', error);
        }
    };

    const fetchVehicle = async () => {
        try {
            const vehicle = await getVehicleById(id);
            setFormData({
                vehicle_number: vehicle.vehicle_number,
                vehicle_model: vehicle.vehicle_model || '',
                manufacturing_year: vehicle.manufacturing_year || '',
                work_type: vehicle.work_type || '',
                date: vehicle.date,
                process_status: vehicle.process_status,
                money_paid: vehicle.money_paid,
                total_charges: vehicle.total_charges
            });
            setSelectedClientId(vehicle.client_id);
        } catch (error) {
            console.error('Error fetching vehicle:', error);
            alert('Error loading vehicle data');
        }
    };

    const handleClientChange = (e) => {
        const clientId = e.target.value;
        if (clientId === 'new') {
            setShowNewClientForm(true);
            setSelectedClientId('');
        } else {
            setShowNewClientForm(false);
            setSelectedClientId(clientId);
        }
    };

    const handleAddNewClient = async () => {
        if (!newClientName || !newClientPhone) {
            alert('Please enter client name and phone');
            return;
        }

        // Validate phone number (exactly 10 digits)
        if (!/^\d{10}$/.test(newClientPhone)) {
            alert('Phone number must be exactly 10 digits');
            return;
        }

        try {
            const client = await createClient({
                name: newClientName,
                phone: newClientPhone
            });
            setClients([...clients, client]);
            setSelectedClientId(client.id);
            setShowNewClientForm(false);
            setNewClientName('');
            setNewClientPhone('');
        } catch (error) {
            console.error('Error creating client:', error);
            alert('Error creating client');
        }
    };

    const handleChange = (e) => {
        let value = e.target.value;

        // Vehicle number validation - remove spaces, uppercase, max 10 chars
        if (e.target.name === 'vehicle_number') {
            value = value.replace(/\s/g, '').toUpperCase().slice(0, 10);
        }

        setFormData({
            ...formData,
            [e.target.name]: value
        });
    };

    const handlePhoneChange = (e) => {
        // Only allow digits, max 10
        const value = e.target.value.replace(/\D/g, '').slice(0, 10);
        setNewClientPhone(value);
    };

    const handleFileChange = (e) => {
        setDocuments(Array.from(e.target.files));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!selectedClientId) {
            alert('Please select a client');
            return;
        }

        // Validate vehicle number (exactly 10 alphanumeric characters)
        if (!/^[A-Z0-9]{10}$/.test(formData.vehicle_number)) {
            alert('Vehicle number must be exactly 10 alphanumeric characters (no spaces)');
            return;
        }

        setSubmitting(true);

        try {
            const vehicleData = {
                ...formData,
                client_id: selectedClientId
            };

            let vehicleId;
            if (isEditMode) {
                await updateVehicle(id, vehicleData);
                vehicleId = id;
            } else {
                const newVehicle = await createVehicle(vehicleData);
                vehicleId = newVehicle.id;
            }

            // Upload documents if any
            if (documents.length > 0) {
                await uploadDocuments(vehicleId, documents);
            }

            alert(isEditMode ? 'Vehicle updated successfully!' : 'Vehicle added successfully!');
            navigate('/vehicles');
        } catch (error) {
            console.error('Error saving vehicle:', error);
            alert('Error saving vehicle: ' + error.message);
            setSubmitting(false);
        }
    };

    const selectedClient = clients.find(c => c.id == selectedClientId);

    return (
        <div className="max-w-4xl mx-auto">
            <div className="card">
                <h2 className="text-2xl font-bold mb-6 text-gray-800">
                    {isEditMode ? 'Edit Vehicle' : 'Add New Vehicle'}
                </h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Client Selection */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-blue-50 rounded-lg">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Select Client *
                            </label>
                            <select
                                className="input"
                                value={selectedClientId}
                                onChange={handleClientChange}
                                required
                            >
                                <option value="">-- Select Client --</option>
                                {clients.map((client) => (
                                    <option key={client.id} value={client.id}>
                                        {client.name} - {client.phone}
                                    </option>
                                ))}
                                <option value="new">+ Add New Client</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Client Phone
                            </label>
                            <input
                                type="text"
                                className="input bg-gray-100"
                                value={selectedClient?.phone || ''}
                                disabled
                            />
                        </div>
                    </div>

                    {/* New Client Form */}
                    {showNewClientForm && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-green-50 rounded-lg">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    New Client Name *
                                </label>
                                <input
                                    type="text"
                                    className="input"
                                    value={newClientName}
                                    onChange={(e) => setNewClientName(e.target.value)}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    New Client Phone *
                                </label>
                                <input
                                    type="text"
                                    className="input"
                                    value={newClientPhone}
                                    onChange={handlePhoneChange}
                                    placeholder="10 digits only"
                                    pattern="\d{10}"
                                    maxLength="10"
                                    required
                                />
                            </div>

                            <div className="md:col-span-2">
                                <button
                                    type="button"
                                    onClick={handleAddNewClient}
                                    className="btn btn-success"
                                >
                                    Save New Client
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Vehicle Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Vehicle Number *
                            </label>
                            <input
                                type="text"
                                name="vehicle_number"
                                className="input uppercase"
                                value={formData.vehicle_number}
                                onChange={handleChange}
                                placeholder="e.g., MH12AB1234"
                                pattern="[A-Z0-9]{10}"
                                maxLength="10"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Vehicle Model
                            </label>
                            <input
                                type="text"
                                name="vehicle_model"
                                className="input"
                                value={formData.vehicle_model}
                                onChange={handleChange}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Manufacturing Year
                            </label>
                            <input
                                type="number"
                                name="manufacturing_year"
                                className="input"
                                value={formData.manufacturing_year}
                                onChange={handleChange}
                                min="1900"
                                max={new Date().getFullYear() + 1}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Work Type
                            </label>
                            <input
                                type="text"
                                name="work_type"
                                className="input"
                                value={formData.work_type}
                                onChange={handleChange}
                                placeholder="e.g., Repair, Service, Parts"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Date *
                            </label>
                            <input
                                type="date"
                                name="date"
                                className="input"
                                value={formData.date}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Process Status *
                            </label>
                            <select
                                name="process_status"
                                className="input"
                                value={formData.process_status}
                                onChange={handleChange}
                                required
                            >
                                <option value="Pending">Pending</option>
                                <option value="Processing">Processing</option>
                                <option value="Completed">Completed</option>
                                <option value="On Hold">On Hold</option>
                                <option value="Cancelled">Cancelled</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Money Paid (₹)
                            </label>
                            <input
                                type="number"
                                name="money_paid"
                                className="input"
                                value={formData.money_paid}
                                onChange={handleChange}
                                min="0"
                                step="0.01"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Total Charges (₹)
                            </label>
                            <input
                                type="number"
                                name="total_charges"
                                className="input"
                                value={formData.total_charges}
                                onChange={handleChange}
                                min="0"
                                step="0.01"
                            />
                        </div>
                    </div>

                    {/* Pending Amount Display */}
                    <div className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex justify-between items-center">
                            <span className="font-medium text-gray-700">Pending Amount:</span>
                            <span className="text-2xl font-bold text-red-600">
                                ₹{(parseFloat(formData.total_charges) - parseFloat(formData.money_paid)).toFixed(2)}
                            </span>
                        </div>
                    </div>

                    {/* Document Upload */}
                    {!isEditMode && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Upload Documents (Optional)
                            </label>
                            <input
                                type="file"
                                className="input"
                                onChange={handleFileChange}
                                multiple
                                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                You can upload multiple files. Accepted: PDF, Images, Word, Excel
                            </p>
                            {documents.length > 0 && (
                                <div className="mt-2 text-sm text-gray-600">
                                    {documents.length} file(s) selected
                                </div>
                            )}
                        </div>
                    )}

                    {/* Buttons */}
                    <div className="flex space-x-4">
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={submitting}
                        >
                            {submitting ? 'Saving...' : (isEditMode ? 'Update Vehicle' : 'Add Vehicle')}
                        </button>
                        <button
                            type="button"
                            onClick={() => navigate('/vehicles')}
                            className="btn btn-secondary"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddVehicleForm;
