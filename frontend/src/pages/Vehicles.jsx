import { Link } from 'react-router-dom';
import VehicleTable from '../components/VehicleTable';
import config from '../config';

const Vehicles = () => {
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-zinc-100 italic tracking-tight uppercase">Registry Database</h1>
                <div className="flex gap-4">
                    <button
                        onClick={() => {
                            const token = localStorage.getItem('token');
                            window.open(`${config.API_URL}/export/excel?token=${token}`, '_blank');
                        }}
                        className="btn bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold px-6 py-2.5 rounded-xl border border-zinc-700/50 flex items-center gap-2 transition-all shadow-lg"
                    >
                        <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                        Export All (Excel)
                    </button>
                    <Link to="/vehicles/new" className="btn btn-primary px-8 shadow-xl shadow-blue-600/20">
                        + Add New Vehicle
                    </Link>
                </div>
            </div>

            <VehicleTable />
        </div>
    );
};

export default Vehicles;
