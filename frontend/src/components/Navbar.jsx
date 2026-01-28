import { Link, useLocation } from 'react-router-dom';
import NotificationBell from './NotificationBell';

const Navbar = () => {
    const location = useLocation();

    const isActive = (path) => {
        return location.pathname === path;
    };

    return (
        <nav className="bg-zinc-900/60 backdrop-blur-lg border-b border-zinc-800/50 sticky top-0 z-50">
            <div className="container mx-auto px-6">
                <div className="flex items-center justify-between h-20">
                    <Link to="/" className="flex items-center space-x-3 group">
                        <div className="bg-blue-600 p-2 rounded-xl group-hover:rotate-12 transition-transform duration-300">
                            <img src="/assets/logo.png" alt="Logo" className="w-8 h-8 invert brightness-0" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xl font-bold tracking-tight text-white group-hover:text-blue-500 transition-colors">
                                MEER
                            </span>
                            <span className="text-[10px] uppercase tracking-[0.2em] font-medium text-zinc-500 -mt-1">
                                Enterprises
                            </span>
                        </div>
                    </Link>

                    <div className="hidden md:flex items-center bg-zinc-800/30 p-1.5 rounded-2xl border border-zinc-800/50">
                        <Link
                            to="/"
                            className={`px-6 py-2 rounded-xl transition-all duration-300 text-sm font-medium ${isActive('/')
                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40'
                                : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                                }`}
                        >
                            Dashboard
                        </Link>
                        <Link
                            to="/vehicles"
                            className={`px-6 py-2 rounded-xl transition-all duration-300 text-sm font-medium ${isActive('/vehicles') || isActive('/vehicles/new')
                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40'
                                : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                                }`}
                        >
                            Vehicles
                        </Link>
                        <Link
                            to="/clients"
                            className={`px-6 py-2 rounded-xl transition-all duration-300 text-sm font-medium ${isActive('/clients')
                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40'
                                : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                                }`}
                        >
                            Clients
                        </Link>
                    </div>

                    <div className="flex items-center space-x-5">
                        <NotificationBell />
                        <div className="h-8 w-px bg-zinc-800"></div>
                        <button
                            onClick={() => {
                                localStorage.removeItem('token');
                                window.location.href = '/login';
                            }}
                            className="text-zinc-400 hover:text-rose-500 transition-colors flex items-center space-x-2 text-sm font-medium"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            <span>Logout</span>
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
