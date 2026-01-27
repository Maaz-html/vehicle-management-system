import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getAllClients, createClient } from '../services/clientService';
import {
  createVehicle,
  updateVehicle,
  getVehicleById,
  uploadDocuments
} from '../services/vehicleService';

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
    if (isEditMode) fetchVehicle();
  }, [id]);

  const fetchClients = async () => {
    try {
      const data = await getAllClients();
      setClients(data);
    } catch (err) {
      console.error(err);
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
    } catch (err) {
      alert('Error loading vehicle');
    }
  };

  const handleClientChange = (e) => {
    const value = e.target.value;
    if (value === 'new') {
      setShowNewClientForm(true);
      setSelectedClientId('');
    } else {
      setShowNewClientForm(false);
      setSelectedClientId(value);
    }
  };

  const handleAddNewClient = async () => {
    if (!newClientName || !/^\d{10}$/.test(newClientPhone)) {
      alert('Enter valid client name & 10 digit phone');
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
    } catch {
      alert('Error creating client');
    }
  };

  const handleChange = (e) => {
    let value = e.target.value;
    if (e.target.name === 'vehicle_number') {
      value = value.replace(/\s/g, '').toUpperCase().slice(0, 10);
    }
    setFormData({ ...formData, [e.target.name]: value });
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

    if (!/^[A-Z0-9]{10}$/.test(formData.vehicle_number)) {
      alert('Vehicle number must be exactly 10 characters');
      return;
    }

    setSubmitting(true);

    try {
      const vehiclePayload = {
        ...formData,
        client_id: selectedClientId
      };

      let vehicleId;

      if (isEditMode) {
        await updateVehicle(id, vehiclePayload);
        vehicleId = id;
      } else {
        const newVehicle = await createVehicle(vehiclePayload);
        vehicleId = newVehicle.id;
      }

      // ✅ Upload documents ONLY if files exist
      if (documents.length > 0) {
        const fd = new FormData();
        fd.append('vehicle_id', vehicleId);

        documents.forEach(file => {
          fd.append('documents', file);
        });

        await uploadDocuments(fd);
      }

      alert(isEditMode ? 'Vehicle updated!' : 'Vehicle added!');
      navigate('/vehicles');
    } catch (err) {
      console.error(err);
      alert(
        err?.response?.data?.error ||
        'Error saving vehicle'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const selectedClient = clients.find(c => c.id == selectedClientId);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="card">
        <h2 className="text-2xl font-bold mb-6">
          {isEditMode ? 'Edit Vehicle' : 'Add New Vehicle'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Client */}
          <div className="grid grid-cols-2 gap-4 bg-blue-50 p-4 rounded">
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
              value={selectedClient?.phone || ''}
              disabled
            />
          </div>

          {/* New Client */}
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
                onChange={e =>
                  setNewClientPhone(e.target.value.replace(/\D/g, '').slice(0, 10))
                }
              />
              <button type="button" onClick={handleAddNewClient} className="btn btn-success col-span-2">
                Save Client
              </button>
            </div>
          )}

          {/* Vehicle Fields */}
          <input
            name="vehicle_number"
            className="input"
            placeholder="Vehicle Number"
            value={formData.vehicle_number}
            onChange={handleChange}
            required
          />

          <input
            name="vehicle_model"
            className="input"
            placeholder="Vehicle Model"
            value={formData.vehicle_model}
            onChange={handleChange}
          />

          <input
            type="date"
            name="date"
            className="input"
            value={formData.date}
            onChange={handleChange}
            required
          />

          <input
            type="number"
            name="money_paid"
            className="input"
            value={formData.money_paid}
            onChange={handleChange}
          />

          <input
            type="number"
            name="total_charges"
            className="input"
            value={formData.total_charges}
            onChange={handleChange}
          />

          {!isEditMode && (
            <input
              type="file"
              multiple
              className="input"
              onChange={handleFileChange}
            />
          )}

          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? 'Saving...' : 'Save Vehicle'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddVehicleForm;
