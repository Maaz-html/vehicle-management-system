import { useState, useEffect } from 'react';
import { getPaymentSummary } from '../services/vehicleService';

const PaymentSummary = () => {
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPaymentSummary();
    }, []);

    const fetchPaymentSummary = async () => {
        try {
            const data = await getPaymentSummary();
            setSummary(data);
        } catch (error) {
            console.error('Error fetching payment summary:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="card h-32 animate-pulse bg-zinc-900/40"></div>
                ))}
            </div>
        );
    }

    if (!summary) {
        return <div className="text-center py-8 text-zinc-500 card">No summary data available</div>;
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Total Vehicles */}
            <div className="card group hover:border-blue-500/50 transition-all duration-300">
                <div className="flex items-center justify-between mb-2">
                    <p className="text-zinc-500 text-sm font-medium">Total Vehicles</p>
                    <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500 group-hover:scale-110 transition-transform">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
                        </svg>
                    </div>
                </div>
                <p className="text-3xl font-bold text-white">
                    {Number(summary.total_vehicles || 0)}
                </p>
            </div>

            {/* Total Charges */}
            <div className="card group hover:border-purple-500/50 transition-all duration-300">
                <div className="flex items-center justify-between mb-2">
                    <p className="text-zinc-500 text-sm font-medium">Total Revenue</p>
                    <div className="p-2 bg-purple-500/10 rounded-lg text-purple-500 group-hover:scale-110 transition-transform">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                </div>
                <p className="text-3xl font-bold text-white">
                    ₹{Number(summary.total_charges || 0).toLocaleString()}
                </p>
            </div>

            {/* Total Paid */}
            <div className="card group hover:border-emerald-500/50 transition-all duration-300">
                <div className="flex items-center justify-between mb-2">
                    <p className="text-zinc-500 text-sm font-medium">Received</p>
                    <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-500 group-hover:scale-110 transition-transform">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                </div>
                <p className="text-3xl font-bold text-white">
                    ₹{Number(summary.total_paid || 0).toLocaleString()}
                </p>
                <div className="mt-2 flex items-center text-xs text-emerald-500 bg-emerald-500/10 py-1 px-2 rounded-full w-fit">
                    {Number(summary.fully_paid_count || 0)} Fully Paid
                </div>
            </div>

            {/* Total Pending */}
            <div className="card group hover:border-rose-500/50 transition-all duration-300">
                <div className="flex items-center justify-between mb-2">
                    <p className="text-zinc-500 text-sm font-medium">Pending</p>
                    <div className="p-2 bg-rose-500/10 rounded-lg text-rose-500 group-hover:scale-110 transition-transform">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                </div>
                <p className="text-3xl font-bold text-white">
                    ₹{Number(summary.total_pending || 0).toLocaleString()}
                </p>
                <div className="mt-2 flex items-center space-x-2">
                    <span className="text-[10px] text-zinc-500 uppercase tracking-wider">
                        {Number(summary.unpaid_count || 0)} Unpaid
                    </span>
                    <span className="text-zinc-800">•</span>
                    <span className="text-[10px] text-zinc-500 uppercase tracking-wider">
                        {Number(summary.partial_paid_count || 0)} Partial
                    </span>
                </div>
            </div>
        </div>
    );
};

export default PaymentSummary;
