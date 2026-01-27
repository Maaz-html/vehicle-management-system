import { Link } from 'react-router-dom';
import VehicleTable from '../components/VehicleTable';

const Vehicles = () => {
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-800">Vehicle Management</h1>
                <Link to="/vehicles/new" className="btn btn-primary">
                    + Add New Vehicle
                </Link>
            </div>

            <VehicleTable />
        </div>
    );
};

export default Vehicles;
