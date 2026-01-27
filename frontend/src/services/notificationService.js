import axios from 'axios';

// While we implemented the logic directly in the component for simplicity, 
// a service file is good practice for larger apps.
// We can move the axios calls here if needed in the future.

export const fetchNotifications = async () => {
    const token = localStorage.getItem('token');
    const response = await axios.get('http://localhost:5000/api/notifications', {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};

export const markAsRead = async (id) => {
    const token = localStorage.getItem('token');
    await axios.put(`http://localhost:5000/api/notifications/${id}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` }
    });
};
