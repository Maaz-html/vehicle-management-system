import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import config from '../config';

const Login = () => {
    const [formData, setFormData] = useState({
        username: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const apiUrl = config.API_URL;
            const response = await axios.post(`${apiUrl}/auth/login`, formData);

            if (response.data.token) {
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('user', JSON.stringify(response.data.user));
                window.location.href = '/';
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex bg-[#0A0A0B] overflow-hidden">
            {/* Left Side: Hero Image */}
            <div className="hidden lg:block lg:w-3/5 relative overflow-hidden">
                <img
                    src="/assets/login-hero.png"
                    alt="Luxury Vehicle Management"
                    className="absolute inset-0 w-full h-full object-cover animate-breathing opacity-80"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#0A0A0B]/20 to-[#0A0A0B]"></div>
                <div className="absolute bottom-12 left-12">
                    <h1 className="text-5xl font-bold text-white mb-4 tracking-tight">
                        Excellence in <br />
                        <span className="text-blue-500">Vehicle Management</span>
                    </h1>
                    <p className="text-zinc-400 text-lg max-w-md">
                        Managing luxury portfolios with precision and elegance.
                    </p>
                </div>
            </div>

            {/* Right Side: Login Form */}
            <div className="w-full lg:w-2/5 flex items-center justify-center p-8 lg:p-12">
                <div className="w-full max-w-md">
                    <div className="mb-12">
                        <img src="/assets/logo.png" alt="Meer Enterprises" className="h-12 w-auto mb-6" />
                        <h2 className="text-3xl font-bold text-white mb-2">Welcome Back</h2>
                        <p className="text-zinc-400">Sign in to manage your fleet.</p>
                    </div>

                    {error && (
                        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-500 px-4 py-3 rounded-xl mb-6 text-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-zinc-400 text-sm font-medium mb-2 pl-1">
                                Username
                            </label>
                            <input
                                type="text"
                                name="username"
                                value={formData.username}
                                onChange={handleChange}
                                className="input"
                                placeholder="Enter your username"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-zinc-400 text-sm font-medium mb-2 pl-1">
                                Password
                            </label>
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                className="input"
                                placeholder="••••••••"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full btn btn-primary py-3.5 flex items-center justify-center space-x-2"
                        >
                            {loading ? (
                                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            ) : (
                                <span>Sign In to Dashboard</span>
                            )}
                        </button>
                    </form>

                    <footer className="mt-12 text-center">
                        <p className="text-zinc-600 text-xs">
                            &copy; {new Date().getFullYear()} Meer Enterprises. All rights reserved.
                        </p>
                    </footer>
                </div>
            </div>
        </div>
    );
};

export default Login;
