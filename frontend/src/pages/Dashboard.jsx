import { Link } from 'react-router-dom';
import PaymentSummary from '../components/PaymentSummary';
import VehicleTable from '../components/VehicleTable';

const Dashboard = () => {
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
                <Link to="/vehicles/new" className="btn btn-primary">
                    + Add New Vehicle
                </Link>
            </div>

            <PaymentSummary />

            <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Recent Vehicles</h2>
                <VehicleTable />
            </div>
        </div>
    );
};

export default Dashboard;
