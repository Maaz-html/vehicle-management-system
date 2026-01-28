import { Link } from 'react-router-dom';
import PaymentSummary from '../components/PaymentSummary';
import VehicleTable from '../components/VehicleTable';

const Dashboard = () => {
    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-bold text-white tracking-tight">Executive Dashboard</h1>
                    <p className="text-zinc-500 mt-1">Operational overview of Meer Enterprises.</p>
                </div>
                <Link to="/vehicles/new" className="btn btn-primary px-8 shadow-xl shadow-blue-600/20">
                    + Register New Vehicle
                </Link>
            </div>

            <section>
                <div className="flex items-center space-x-2 mb-6">
                    <div className="w-1.5 h-6 bg-blue-600 rounded-full"></div>
                    <h2 className="text-xl font-bold text-white">Financial Summary</h2>
                </div>
                <PaymentSummary />
            </section>

            <section>
                <div className="flex items-center space-x-2 mb-6">
                    <div className="w-1.5 h-6 bg-amber-500 rounded-full"></div>
                    <h2 className="text-xl font-bold text-white">Recent Activity</h2>
                </div>
                <div className="card !p-0 overflow-hidden border-zinc-800/80">
                    <VehicleTable />
                </div>
            </section>
        </div>
    );
};

export default Dashboard;
