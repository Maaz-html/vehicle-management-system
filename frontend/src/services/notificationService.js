import api from './api';

export const fetchNotifications = async () => {
    const response = await api.get('/notifications');
    return response.data;
};

export const markAsRead = async (id) => {
    await api.put(`/notifications/${id}/read`);
};

export const markAllAsRead = async () => {
    await api.put('/notifications/read-all');
};
