import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getAllVehicles } from '../services/vehicleService';
import { getAllClients } from '../services/clientService';

const ClientReport = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [client, setClient] = useState(null);
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    useEffect(() => {
        fetchInitialData();
    }, [id]);

    const fetchInitialData = async () => {
        try {
            setLoading(true);
            const clients = await getAllClients();
            const currentClient = clients.find(c => c.id == id);
            setClient(currentClient);

            const data = await getAllVehicles({ client_id: id });
            setVehicles(data);
        } catch (error) {
            console.error('Error fetching report data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFilter = async () => {
        try {
            setLoading(true);
            const data = await getAllVehicles({
                client_id: id,
                startDate,
                endDate
            });
            setVehicles(data);
        } catch (error) {
            console.error('Error filtering report:', error);
        } finally {
            setLoading(false);
        }
    };

    const totalCharges = vehicles.reduce((sum, v) => sum + Number(v.total_charges || 0), 0);
    const totalPaid = vehicles.reduce((sum, v) => sum + Number(v.money_paid || 0), 0);
    const totalPending = totalCharges - totalPaid;

    if (loading && !client) {
        return <div className="p-10 text-center text-zinc-500">Loading Report...</div>;
    }

    return (
        <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-8 bg-white text-zinc-900 min-h-screen print:p-0">
            {/* Action Bar - Hidden in Print */}
            <div className="flex justify-between items-center print:hidden bg-zinc-100 p-4 rounded-2xl border border-zinc-200">
                <button onClick={() => navigate(-1)} className="text-sm font-medium text-zinc-600 hover:text-zinc-900 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                    Back
                </button>
                <div className="flex gap-4">
                    <button onClick={() => window.print()} className="bg-zinc-900 text-white px-6 py-2 rounded-xl text-sm font-bold shadow-lg hover:bg-zinc-800 transition-all flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                        Print Report
                    </button>
                </div>
            </div>

            {/* Header / Summary */}
            <div className="border-b-2 border-zinc-900 pb-8">
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-4xl font-black tracking-tighter uppercase mb-2">Portfolio Report</h1>
                        <p className="text-zinc-500 font-medium">Full Statement of Accounts</p>
                    </div>
                    <div className="text-right">
                        <h2 className="text-xl font-bold">{client?.name}</h2>
                        <p className="text-sm text-zinc-600">{client?.phone}</p>
                        <p className="text-xs text-zinc-400 mt-1 uppercase tracking-widest">CID-{String(id).padStart(4, '0')}</p>
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-8 mt-10">
                    <div className="bg-zinc-50 p-6 rounded-2xl">
                        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Total Revenue</p>
                        <p className="text-2xl font-black">₹{totalCharges.toLocaleString()}</p>
                    </div>
                    <div className="bg-zinc-50 p-6 rounded-2xl">
                        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Total Settlement</p>
                        <p className="text-2xl font-black text-emerald-600">₹{totalPaid.toLocaleString()}</p>
                    </div>
                    <div className="bg-zinc-900 text-white p-6 rounded-2xl shadow-xl">
                        <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Balance Payable</p>
                        <p className="text-2xl font-black text-rose-400">₹{totalPending.toLocaleString()}</p>
                    </div>
                </div>
            </div>

            {/* Filters - Hidden in Print */}
            <div className="print:hidden space-y-4">
                <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Filter by Date Range</h3>
                <div className="flex gap-4 items-end">
                    <div className="flex-1 space-y-1">
                        <label className="text-[10px] font-bold text-zinc-500 uppercase ml-1">From Date</label>
                        <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 transition-all" />
                    </div>
                    <div className="flex-1 space-y-1">
                        <label className="text-[10px] font-bold text-zinc-500 uppercase ml-1">To Date</label>
                        <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 transition-all" />
                    </div>
                    <button onClick={handleFilter} className="bg-zinc-900 text-white px-8 py-2 rounded-xl text-sm font-bold hover:bg-zinc-800 transition-all h-[42px]">
                        Apply
                    </button>
                    <button onClick={() => { setStartDate(''); setEndDate(''); fetchInitialData(); }} className="text-zinc-500 text-sm font-bold h-[42px] px-4 hover:text-zinc-900">
                        Reset
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="space-y-4">
                <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Asset Details ({vehicles.length})</h3>
                <div className="border border-zinc-200 rounded-2xl overflow-hidden divide-y divide-zinc-200">
                    <div className="bg-zinc-50 grid grid-cols-6 p-4 text-[10px] font-black uppercase tracking-widest text-zinc-500">
                        <div className="col-span-1">Date</div>
                        <div className="col-span-1">Reg Number</div>
                        <div className="col-span-1">Model</div>
                        <div className="col-span-1">Status</div>
                        <div className="col-span-1 text-right">Total</div>
                        <div className="col-span-1 text-right">Pending</div>
                    </div>
                    {vehicles.length === 0 ? (
                        <div className="p-10 text-center text-zinc-400 italic">No records found for this period.</div>
                    ) : (
                        vehicles.map(v => (
                            <div key={v.id} className="grid grid-cols-6 p-4 text-xs group hover:bg-zinc-50 transition-colors">
                                <div className="col-span-1 font-medium">{new Date(v.date).toLocaleDateString()}</div>
                                <div className="col-span-1 font-bold font-mono tracking-widest">{v.vehicle_number}</div>
                                <div className="col-span-1 text-zinc-500">{v.vehicle_model || '-'}</div>
                                <div className="col-span-1 uppercase font-black text-[9px] tracking-widest">
                                    <span className={v.process_status === 'Completed' ? 'text-emerald-600' : 'text-zinc-400'}>{v.process_status}</span>
                                </div>
                                <div className="col-span-1 text-right font-bold">₹{Number(v.total_charges).toLocaleString()}</div>
                                <div className="col-span-1 text-right font-bold text-rose-500">₹{(Number(v.total_charges) - Number(v.money_paid)).toLocaleString()}</div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Signatures for print */}
            <div className="hidden print:grid grid-cols-2 gap-20 pt-20 mt-20">
                <div className="border-t border-zinc-900 pt-4 text-center">
                    <p className="text-xs font-bold uppercase tracking-widest">Authorised Signatory</p>
                    <p className="text-[10px] text-zinc-400 mt-1">Meer Enterprises</p>
                </div>
                <div className="border-t border-zinc-900 pt-4 text-center">
                    <p className="text-xs font-bold uppercase tracking-widest">Receiver's Signature</p>
                    <p className="text-[10px] text-zinc-400 mt-1">Acknowledged by Client</p>
                </div>
            </div>
        </div>
    );
};

export default ClientReport;
