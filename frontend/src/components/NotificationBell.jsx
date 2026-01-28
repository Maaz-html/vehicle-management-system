import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchNotifications as getNotifications, markAsRead as markRead, markAllAsRead } from '../services/notificationService';

const NotificationBell = () => {
    const [notifications, setNotifications] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        loadNotifications();
        // Poll every 30 seconds
        const interval = setInterval(loadNotifications, 30000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const loadNotifications = async () => {
        try {
            const data = await getNotifications();
            setNotifications(data);
            setUnreadCount(data.filter(n => !n.is_read).length);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        }
    };

    const handleMarkAsRead = async (id) => {
        try {
            await markRead(id);
            loadNotifications();
        } catch (error) {
            console.error('Error marking as read:', error);
        }
    };

    const handleMarkAllRead = async () => {
        try {
            await markAllAsRead();
            loadNotifications();
        } catch (error) {
            console.error('Error marking all as read:', error);
        }
    };

    const handleNotificationClick = (notification) => {
        handleMarkAsRead(notification.id);
        setShowDropdown(false);
        if (notification.vehicle_id) {
            navigate(`/vehicles/edit/${notification.vehicle_id}`);
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                className={`relative p-2.5 rounded-xl transition-all duration-300 ${showDropdown ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-white hover:bg-zinc-800'}`}
                onClick={() => setShowDropdown(!showDropdown)}
            >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {unreadCount > 0 && (
                    <span className="absolute top-2 right-2 flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                    </span>
                )}
            </button>

            {showDropdown && (
                <div className="absolute right-0 w-96 mt-4 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden z-[100] backdrop-blur-xl animate-in fade-in zoom-in-95 duration-200">
                    <div className="px-5 py-4 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/50">
                        <span className="text-sm font-bold text-white tracking-tight">Intelligence Feed</span>
                        {unreadCount > 0 && (
                            <button onClick={handleMarkAllRead} className="text-[10px] font-bold text-blue-500 hover:text-blue-400 uppercase tracking-widest transition-colors">
                                Clear All
                            </button>
                        )}
                    </div>
                    <div className="max-h-[450px] overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="px-4 py-12 text-center text-zinc-600 text-sm">
                                <svg className="w-8 h-8 mx-auto mb-3 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                No new notifications
                            </div>
                        ) : (
                            notifications.map(notification => (
                                <div
                                    key={notification.id}
                                    className={`px-5 py-4 hover:bg-white/[0.02] cursor-pointer border-b border-zinc-800/50 transition-colors ${notification.is_read ? 'opacity-50' : 'bg-blue-500/[0.02]'}`}
                                    onClick={() => handleNotificationClick(notification)}
                                >
                                    <div className="flex items-start space-x-3">
                                        <div className={`mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0 ${notification.is_read ? 'bg-zinc-700' : 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]'}`}></div>
                                        <div>
                                            <p className="text-sm text-zinc-200 leading-relaxed">{notification.message}</p>
                                            <p className="text-[10px] text-zinc-600 mt-1.5 font-medium uppercase tracking-wider">
                                                {new Date(notification.created_at).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationBell;
