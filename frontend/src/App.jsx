import { useState } from 'react';

import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Vehicles from './pages/Vehicles';
import Clients from './pages/Clients';
import AddVehicleForm from './components/AddVehicleForm';
import Login from './pages/Login';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));

  if (!isAuthenticated) {
    return <Login onLogin={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/vehicles" element={<Vehicles />} />
          <Route path="/vehicles/new" element={<AddVehicleForm />} />
          <Route path="/vehicles/edit/:id" element={<AddVehicleForm />} />
          <Route path="/clients" element={<Clients />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
