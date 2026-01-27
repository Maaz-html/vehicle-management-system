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
            setLoading(false);
        } catch (error) {
            console.error('Error fetching payment summary:', error);
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="text-center py-4">Loading payment summary...</div>;
    }

    if (!summary) {
        return <div className="text-center py-4">No data available</div>;
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            {/* Total Vehicles */}
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm opacity-90">Total Vehicles</p>
                        <p className="text-3xl font-bold mt-1">{summary.total_vehicles || 0}</p>
                    </div>
                    <svg className="w-12 h-12 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                </div>
            </div>

            {/* Total Charges */}
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-lg p-6 text-white">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm opacity-90">Total Charges</p>
                        <p className="text-3xl font-bold mt-1">₹{(summary.total_charges || 0).toFixed(2)}</p>
                    </div>
                    <svg className="w-12 h-12 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
            </div>

            {/* Total Paid */}
            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-lg p-6 text-white">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm opacity-90">Total Paid</p>
                        <p className="text-3xl font-bold mt-1">₹{(summary.total_paid || 0).toFixed(2)}</p>
                        <div className="mt-2 text-xs opacity-90">
                            <span className="bg-white bg-opacity-20 px-2 py-1 rounded">{summary.fully_paid_count || 0} Fully Paid</span>
                        </div>
                    </div>
                    <svg className="w-12 h-12 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
            </div>

            {/* Total Pending */}
            <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-lg shadow-lg p-6 text-white">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm opacity-90">Total Pending</p>
                        <p className="text-3xl font-bold mt-1">₹{(summary.total_pending || 0).toFixed(2)}</p>
                        <div className="mt-2 text-xs opacity-90 space-x-1">
                            <span className="bg-white bg-opacity-20 px-2 py-1 rounded">{summary.unpaid_count || 0} Unpaid</span>
                            <span className="bg-white bg-opacity-20 px-2 py-1 rounded">{summary.partial_paid_count || 0} Partial</span>
                        </div>
                    </div>
                    <svg className="w-12 h-12 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
            </div>
        </div>
    );
};

export default PaymentSummary;
