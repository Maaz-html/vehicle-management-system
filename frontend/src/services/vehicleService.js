import api from './api';

/* ===================== VEHICLES ===================== */

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

/* ===================== DOCUMENTS ===================== */

/**
 * Upload documents (expects FormData)
 * FormData must contain:
 * - vehicle_id
 * - documents[]
 */
export const uploadDocuments = async (formData) => {
    const response = await api.post('/documents', formData);
    return response.data;
};

export const getDocumentsByVehicle = async (vehicleId) => {
    const response = await api.get(`/documents/vehicle/${vehicleId}`);
    return response.data;
};

export const deleteDocument = async (id) => {
    const response = await api.delete(`/documents/${id}`);
    return response.data;
};

export const downloadDocument = (id) => {
    // Uses same baseURL from api.js (NO localhost)
    window.open(`${import.meta.env.VITE_API_URL}/documents/${id}/download`, '_blank');
};
