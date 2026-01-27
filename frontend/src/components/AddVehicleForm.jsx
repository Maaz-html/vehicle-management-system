import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getAllClients, createClient } from '../services/clientService';
import {
    createVehicle,
    updateVehicle,
    getVehicleById,
    uploadDocuments
} from '../services/vehicleService';
import DocumentUploader from './DocumentUploader';
import MultiSelect from './MultiSelect';

const WORK_TYPE_OPTIONS = [
    'General Service',
    'Oil Change',
    'Brake Repair',
    'Engine Diagnostics',
    'Tire Rotation',
    'Car Wash',
    'Detailing',
    'Body Work',
    'AC Repair',
    'Battery Replacement'
];

const AddVehicleForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditMode = !!id;

    const [clients, setClients] = useState([]);
    const [selectedClientId, setSelectedClientId] = useState('');
    const [showNewClientForm, setShowNewClientForm] = useState(false);
    const [newClientName, setNewClientName] = useState('');
    const [newClientPhone, setNewClientPhone] = useState('');

    const [documents, setDocuments] = useState([]);
    const [submitting, setSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        vehicle_number: '',
        vehicle_model: '',
        manufacturing_year: '',
        work_type: [],
        date: new Date().toISOString().split('T')[0],
        process_status: 'Pending',
        money_paid: 0,
        total_charges: 0
    });

    useEffect(() => {
        fetchClients();
        if (isEditMode) fetchVehicle();
    }, [id]);

    const fetchClients = async () => {
        const data = await getAllClients();
        setClients(data);
    };

    const fetchVehicle = async () => {
        const vehicle = await getVehicleById(id);
        setFormData({
            vehicle_number: vehicle.vehicle_number,
            vehicle_model: vehicle.vehicle_model || '',
            manufacturing_year: vehicle.manufacturing_year || '',
            work_type: typeof vehicle.work_type === 'string' && vehicle.work_type.startsWith('[')
                ? JSON.parse(vehicle.work_type)
                : vehicle.work_type ? [vehicle.work_type] : [],
            date: vehicle.date,
            process_status: vehicle.process_status,
            money_paid: Number(vehicle.money_paid || 0),
            total_charges: Number(vehicle.total_charges || 0)
        });
        setSelectedClientId(vehicle.client_id);
    };

    const handleClientChange = (e) => {
        if (e.target.value === 'new') {
            setShowNewClientForm(true);
            setSelectedClientId('');
        } else {
            setShowNewClientForm(false);
            setSelectedClientId(e.target.value);
        }
    };

    const handleAddNewClient = async () => {
        if (!newClientName || !/^\d{10}$/.test(newClientPhone)) {
            alert('Enter valid client name and 10-digit phone');
            return;
        }
        const client = await createClient({ name: newClientName, phone: newClientPhone });
        setClients([...clients, client]);
        setSelectedClientId(client.id);
        setShowNewClientForm(false);
        setNewClientName('');
        setNewClientPhone('');
    };

    const handleChange = (e) => {
        let value = e.target.value;
        if (e.target.name === 'vehicle_number') {
            value = value.replace(/\s/g, '').toUpperCase().slice(0, 10);
        }
        setFormData({ ...formData, [e.target.name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!selectedClientId) {
            alert('Please select a client');
            return;
        }

        if (!/^[A-Z0-9]{10}$/.test(formData.vehicle_number)) {
            alert('Vehicle number must be exactly 10 characters');
            return;
        }

        setSubmitting(true);

        try {
            const payload = {
                ...formData,
                client_id: selectedClientId,
                money_paid: Number(formData.money_paid || 0),
                total_charges: Number(formData.total_charges || 0)
            };

            let vehicleId;
            if (isEditMode) {
                await updateVehicle(id, payload);
                vehicleId = id;
            } else {
                const created = await createVehicle(payload);
                vehicleId = created.id;
            }

            if (documents.length > 0) {
                const fd = new FormData();
                fd.append('vehicle_id', vehicleId);
                documents.forEach(file => fd.append('documents', file));
                await uploadDocuments(fd);
            }

            alert(isEditMode ? 'Vehicle updated successfully' : 'Vehicle added successfully');
            navigate('/vehicles');
        } catch (err) {
            const errorMsg = err?.response?.data?.error || err.message || 'Unknown error';
            alert('Save Failed: ' + errorMsg);
        } finally {
            setSubmitting(false);
        }
    };

    const pendingAmount =
        Number(formData.total_charges || 0) - Number(formData.money_paid || 0);

    return (
        <div className="max-w-4xl mx-auto">
            <div className="card">
                <h2 className="text-2xl font-bold mb-6">
                    {isEditMode ? 'Edit Vehicle' : 'Add New Vehicle'}
                </h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Client */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-blue-50 p-4 rounded">
                        <select className="input" value={selectedClientId} onChange={handleClientChange}>
                            <option value="">Select Client</option>
                            {clients.map(c => (
                                <option key={c.id} value={c.id}>
                                    {c.name} - {c.phone}
                                </option>
                            ))}
                            <option value="new">+ Add New Client</option>
                        </select>
                        <input
                            className="input bg-gray-100"
                            disabled
                            value={clients.find(c => c.id == selectedClientId)?.phone || ''}
                        />
                    </div>

                    {showNewClientForm && (
                        <div className="grid grid-cols-2 gap-4 bg-green-50 p-4 rounded">
                            <input
                                className="input"
                                placeholder="Client Name"
                                value={newClientName}
                                onChange={e => setNewClientName(e.target.value)}
                            />
                            <input
                                className="input"
                                placeholder="10 digit phone"
                                value={newClientPhone}
                                onChange={e => setNewClientPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                            />
                            <button type="button" onClick={handleAddNewClient} className="btn btn-success col-span-2">
                                Save Client
                            </button>
                        </div>
                    )}

                    {/* Vehicle details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input name="vehicle_number" className="input" placeholder="Vehicle Number" value={formData.vehicle_number} onChange={handleChange} required />
                        <input name="vehicle_model" className="input" placeholder="Vehicle Model" value={formData.vehicle_model} onChange={handleChange} />
                        <input type="number" name="manufacturing_year" className="input" placeholder="Manufacturing Year" value={formData.manufacturing_year} onChange={handleChange} />

                        <div>
                            <MultiSelect
                                options={WORK_TYPE_OPTIONS}
                                selected={formData.work_type}
                                onChange={(selected) => setFormData({ ...formData, work_type: selected })}
                                placeholder="Select Work Types"
                            />
                        </div>

                        <input
                            type="date"
                            name="date"
                            className="input"
                            value={formData.date}
                            onChange={handleChange}
                            max={new Date().toISOString().split('T')[0]}
                            required
                        />
                        <select name="process_status" className="input" value={formData.process_status} onChange={handleChange}>
                            <option>Pending</option>
                            <option>Processing</option>
                            <option>Completed</option>
                            <option>On Hold</option>
                            <option>Cancelled</option>
                        </select>
                        <input type="number" name="money_paid" className="input" placeholder="Money Paid" value={formData.money_paid} onChange={handleChange} />
                        <input type="number" name="total_charges" className="input" placeholder="Total Charges" value={formData.total_charges} onChange={handleChange} />
                    </div>

                    {/* Pending */}
                    <div className="p-4 bg-gray-50 rounded text-right font-bold text-red-600">
                        Pending Amount: ₹{pendingAmount.toFixed(2)}
                    </div>

                    {/* Documents */}
                    {isEditMode ? (
                        <DocumentUploader vehicleId={id} />
                    ) : (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Upload Documents</label>
                            <input type="file" multiple className="input" onChange={e => setDocuments(Array.from(e.target.files))} />
                        </div>
                    )}

                    <button className="btn btn-primary" disabled={submitting}>
                        {submitting ? 'Saving…' : 'Save Vehicle'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AddVehicleForm;
