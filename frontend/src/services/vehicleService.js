import api from './api';
import config from '../config';

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
    const response = await api.get(`/documents/${vehicleId}`);
    return response.data;
};

export const deleteDocument = async (id) => {
    const response = await api.delete(`/documents/${id}`);
    return response.data;
};

export const downloadDocument = (id) => {
    // Uses config.API_URL
    window.open(`${config.API_URL}/documents/${id}/download`, '_blank');
};
