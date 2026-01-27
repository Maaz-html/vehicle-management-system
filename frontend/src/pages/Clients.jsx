import ClientManager from '../components/ClientManager';

const Clients = () => {
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-800">Client Management</h1>
            <ClientManager />
        </div>
    );
};

export default Clients;
