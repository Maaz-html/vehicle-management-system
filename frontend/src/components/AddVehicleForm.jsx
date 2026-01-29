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
    'TR',
    'HPTer',
    'HPA',
    'DRC',
    'C/A',
    'RRC',
    'E-Tax',
    'HSRP',
    'Insurance',
    'Mobile No. Update',
    'NOC'
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
            date: vehicle.date ? new Date(vehicle.date).toISOString().split('T')[0] : '',
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
        <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="mb-8">
                <button
                    onClick={() => navigate(-1)}
                    className="text-zinc-500 hover:text-white flex items-center space-x-2 text-sm font-medium transition-colors mb-4"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    <span>Back to Registry</span>
                </button>
                <h1 className="text-4xl font-bold text-white tracking-tight">
                    {isEditMode ? 'Modify Entry' : 'New Registration'}
                </h1>
                <p className="text-zinc-500 mt-1">
                    {isEditMode ? `Updating database record for ${formData.vehicle_number}` : 'Add a new asset to the fleet management system.'}
                </p>
            </div>

            <div className="card !p-8 border-zinc-800/80">
                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Client Selection */}
                    <div className="space-y-4">
                        <div className="flex items-center space-x-2 text-xs font-bold text-zinc-500 uppercase tracking-widest pl-1">
                            <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            <span>Client Association</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-zinc-950/40 p-6 rounded-2xl border border-zinc-800/50">
                            <select
                                className="input !bg-zinc-900 appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2024%2024%22%20stroke%3D%22%23666%22%3E%3Cpath%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%222%22%20d%3D%22M19%209l-7%207-7-7%22%20%2F%3E%3C%2Fsvg%3E')] bg-[length:1.25em_1.25em] bg-[right_0.75rem_center] bg-no-repeat"
                                value={selectedClientId}
                                onChange={handleClientChange}
                                required
                            >
                                <option value="">Select Portfolio</option>
                                {clients.map(c => (
                                    <option key={c.id} value={c.id}>
                                        {c.name} ({c.phone})
                                    </option>
                                ))}
                                <option value="new" className="text-blue-500 font-bold">+ New Acquisition</option>
                            </select>
                            <div className="relative">
                                <input
                                    className="input bg-zinc-900/30 text-zinc-500 border-dashed"
                                    disabled
                                    placeholder="Phone Contact"
                                    value={clients.find(c => c.id == selectedClientId)?.phone || ''}
                                />
                            </div>
                        </div>

                        {showNewClientForm && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-emerald-500/5 p-6 rounded-2xl border border-emerald-500/20 animate-in zoom-in-95 duration-300">
                                <div className="space-y-2">
                                    <label className="text-xs text-emerald-500/70 font-medium ml-1">Legal Name</label>
                                    <input
                                        className="input !border-emerald-500/20 !bg-emerald-500/5"
                                        placeholder="Full Name"
                                        value={newClientName}
                                        onChange={e => setNewClientName(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs text-emerald-500/70 font-medium ml-1">Contact Number</label>
                                    <input
                                        className="input !border-emerald-500/20 !bg-emerald-500/5"
                                        placeholder="10 digit phone"
                                        value={newClientPhone}
                                        onChange={e => setNewClientPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                                    />
                                </div>
                                <button type="button" onClick={handleAddNewClient} className="btn btn-success col-span-2 py-3">
                                    Finalize Client Profile
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Asset Details */}
                    <div className="space-y-6">
                        <div className="flex items-center space-x-2 text-xs font-bold text-zinc-500 uppercase tracking-widest pl-1">
                            <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1" />
                            </svg>
                            <span>Asset Specifications</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                            <div className="space-y-2">
                                <label className="text-xs text-zinc-500 font-medium ml-1 uppercase tracking-wider">Registry Number</label>
                                <input name="vehicle_number" className="input font-mono !uppercase !tracking-widest" placeholder="ABC 123 4567" value={formData.vehicle_number} onChange={handleChange} required />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs text-zinc-500 font-medium ml-1 uppercase tracking-wider">Classification / Model</label>
                                <input name="vehicle_model" className="input" placeholder="Luxury Sedan / SUV" value={formData.vehicle_model} onChange={handleChange} />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs text-zinc-500 font-medium ml-1 uppercase tracking-wider">Manufacturing Vintage</label>
                                <input type="number" name="manufacturing_year" className="input" placeholder="2024" value={formData.manufacturing_year} onChange={handleChange} />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs text-zinc-500 font-medium ml-1 uppercase tracking-wider">Service Scope</label>
                                <MultiSelect
                                    options={WORK_TYPE_OPTIONS}
                                    selected={formData.work_type}
                                    onChange={(selected) => setFormData({ ...formData, work_type: selected })}
                                    placeholder="Multi-select operations"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs text-zinc-500 font-medium ml-1 uppercase tracking-wider">Date of Record</label>
                                <input
                                    type="date"
                                    name="date"
                                    className="input"
                                    value={formData.date}
                                    onChange={handleChange}
                                    max={new Date().toISOString().split('T')[0]}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs text-zinc-500 font-medium ml-1 uppercase tracking-wider">Operational Status</label>
                                <select
                                    name="process_status"
                                    className="input appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2024%2024%22%20stroke%3D%22%23666%22%3E%3Cpath%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%222%22%20d%3D%22M19%209l-7%207-7-7%22%20%2F%3E%3C%2Fsvg%3E')] bg-[length:1.25em_1.25em] bg-[right_0.75rem_center] bg-no-repeat"
                                    value={formData.process_status}
                                    onChange={handleChange}
                                >
                                    <option>Pending</option>
                                    <option>Processing</option>
                                    <option>Completed</option>
                                    <option>On Hold</option>
                                    <option>Cancelled</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Financial Summary */}
                    <div className="space-y-6">
                        <div className="flex items-center space-x-2 text-xs font-bold text-zinc-500 uppercase tracking-widest pl-1">
                            <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>Settlement Details</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                            <div className="space-y-2">
                                <label className="text-xs text-zinc-500 font-medium ml-1 uppercase tracking-wider">Professional Fees</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 font-semibold">₹</span>
                                    <input type="number" name="total_charges" className="input !pl-10" placeholder="0.00" value={formData.total_charges} onChange={handleChange} />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs text-zinc-500 font-medium ml-1 uppercase tracking-wider">Initial Remittance</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 font-semibold">₹</span>
                                    <input type="number" name="money_paid" className="input !pl-10" placeholder="0.00" value={formData.money_paid} onChange={handleChange} />
                                </div>
                            </div>
                        </div>

                        <div className="p-6 bg-zinc-950/60 rounded-2xl border border-zinc-800/80 flex items-center justify-between">
                            <span className="text-sm text-zinc-400 font-medium">Balance Payable</span>
                            <span className={`text-xl font-bold tracking-tight ${pendingAmount > 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
                                ₹{pendingAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </span>
                        </div>
                    </div>

                    {/* Documentation Portfolio */}
                    <div className="space-y-6 pt-4 border-t border-zinc-800/50">
                        <div className="flex items-center space-x-2 text-xs font-bold text-zinc-500 uppercase tracking-widest pl-1">
                            <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 9h3m-3 3h6m-6 3h6" />
                            </svg>
                            <span>Asset Documentation</span>
                        </div>

                        {isEditMode ? (
                            <DocumentUploader vehicleId={id} />
                        ) : (
                            <div className="relative group cursor-pointer">
                                <input
                                    type="file"
                                    multiple
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                    onChange={e => setDocuments(Array.from(e.target.files))}
                                />
                                <div className="bg-zinc-900/40 border-2 border-dashed border-zinc-800 group-hover:border-blue-500/50 group-hover:bg-blue-500/5 p-10 rounded-3xl text-center transition-all">
                                    <svg className="w-10 h-10 mx-auto mb-4 text-zinc-600 group-hover:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                    </svg>
                                    <p className="text-white font-semibold">Drop files or click to upload</p>
                                    <p className="text-zinc-500 text-xs mt-1 uppercase tracking-widest">
                                        {documents.length > 0 ? `${documents.length} files staged for upload` : 'PDF, JPG or PNG (Max 10MB)'}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="pt-6">
                        <button
                            type="submit"
                            className="w-full btn btn-primary py-4 text-lg shadow-2xl shadow-blue-600/20"
                            disabled={submitting}
                        >
                            {submitting ? (
                                <span className="flex items-center justify-center space-x-3">
                                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    <span>Syncing with Database...</span>
                                </span>
                            ) : (
                                <span>{isEditMode ? 'Authorize Changes' : 'Initialize Registration'}</span>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddVehicleForm;
