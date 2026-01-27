import { Link, useLocation } from 'react-router-dom';
import NotificationBell from './NotificationBell';

const Navbar = () => {
    const location = useLocation();

    const isActive = (path) => {
        return location.pathname === path;
    };

    return (
        <nav className="bg-gradient-to-r from-blue-600 to-blue-800 text-white shadow-lg">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center space-x-2">
                        <svg
                            className="w-8 h-8"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2"
                            />
                        </svg>
                        <span className="text-xl font-bold">Vehicle Management System</span>
                    </div>

                    <div className="flex space-x-1">
                        <Link
                            to="/"
                            className={`px-4 py-2 rounded-lg transition-all duration-200 ${isActive('/')
                                ? 'bg-white text-blue-600 font-semibold'
                                : 'hover:bg-blue-700'
                                }`}
                        >
                            Dashboard
                        </Link>
                        <Link
                            to="/vehicles"
                            className={`px-4 py-2 rounded-lg transition-all duration-200 ${isActive('/vehicles') || isActive('/vehicles/new')
                                ? 'bg-white text-blue-600 font-semibold'
                                : 'hover:bg-blue-700'
                                }`}
                        >
                            Vehicles
                        </Link>
                        <Link
                            to="/clients"
                            className={`px-4 py-2 rounded-lg transition-all duration-200 ${isActive('/clients')
                                ? 'bg-white text-blue-600 font-semibold'
                                : 'hover:bg-blue-700'
                                }`}
                        >
                            Clients
                        </Link>
                        <Link
                            to="/reports"
                            className={`px-4 py-2 rounded-lg transition-all duration-200 ${isActive('/reports')
                                ? 'bg-white text-blue-600 font-semibold'
                                : 'hover:bg-blue-700'
                                }`}
                        >
                            Reports
                        </Link>
                    </div>

                    <div className="flex items-center space-x-4">
                        <NotificationBell />
                        <button
                            onClick={() => {
                                localStorage.removeItem('token');
                                window.location.href = '/login';
                            }}
                            className="bg-blue-700 hover:bg-blue-800 px-3 py-1 rounded text-sm"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </div>
        </nav >
    );
};

export default Navbar;
