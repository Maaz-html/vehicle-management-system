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
        return <div className="text-center py-4">Loading payment summary...</div>;
    }

    if (!summary) {
        return <div className="text-center py-4">No data available</div>;
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            {/* Total Vehicles */}
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
                <p className="text-sm opacity-90">Total Vehicles</p>
                <p className="text-3xl font-bold mt-1">
                    {Number(summary.total_vehicles || 0)}
                </p>
            </div>

            {/* Total Charges */}
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-lg p-6 text-white">
                <p className="text-sm opacity-90">Total Charges</p>
                <p className="text-3xl font-bold mt-1">
                    ₹{Number(summary.total_charges || 0).toFixed(2)}
                </p>
            </div>

            {/* Total Paid */}
            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-lg p-6 text-white">
                <p className="text-sm opacity-90">Total Paid</p>
                <p className="text-3xl font-bold mt-1">
                    ₹{Number(summary.total_paid || 0).toFixed(2)}
                </p>
                <p className="text-xs mt-2 opacity-90">
                    {Number(summary.fully_paid_count || 0)} Fully Paid
                </p>
            </div>

            {/* Total Pending */}
            <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-lg shadow-lg p-6 text-white">
                <p className="text-sm opacity-90">Total Pending</p>
                <p className="text-3xl font-bold mt-1">
                    ₹{Number(summary.total_pending || 0).toFixed(2)}
                </p>
                <p className="text-xs mt-2 opacity-90">
                    {Number(summary.unpaid_count || 0)} Unpaid ·{' '}
                    {Number(summary.partial_paid_count || 0)} Partial
                </p>
            </div>
        </div>
    );
};

export default PaymentSummary;
