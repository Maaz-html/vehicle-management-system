import api from './api';

export const getAllVehicles = async (params = {}) => {
    const response = await api.get('/vehicles', { params });
    return response.data;
};

export const getVehicleById = async (id) => {
    const response = await api.get(`/vehicles/${id}`);
    return response.data;
};

export const createVehicle = async (vehicleData) => {
    const response = await api.post('/vehicles', vehicleData);
    return response.data;
};

export const updateVehicle = async (id, vehicleData) => {
    const response = await api.put(`/vehicles/${id}`, vehicleData);
    return response.data;
};

export const deleteVehicle = async (id) => {
    const response = await api.delete(`/vehicles/${id}`);
    return response.data;
};

export const getPaymentSummary = async () => {
    const response = await api.get('/vehicles/summary/payment');
    return response.data;
};

// Document services
export const uploadDocuments = async (vehicleId, files) => {
    const formData = new FormData();
    formData.append('vehicle_id', vehicleId);

    Array.from(files).forEach((file) => {
        formData.append('documents', file);
    });

    const response = await api.post('/documents/upload', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};

export const getDocumentsByVehicle = async (vehicleId) => {
    const response = await api.get(`/documents/vehicle/${vehicleId}`);
    return response.data;
};

export const downloadDocument = async (id) => {
    window.open(`http://localhost:5000/api/documents/${id}/download`, '_blank');
};

export const deleteDocument = async (id) => {
    const response = await api.delete(`/documents/${id}`);
    return response.data;
};
