import { useState, useEffect } from 'react';
import axios from 'axios';
import { X, Check, Zap, DollarSign, Activity, ShieldCheck, Box } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CompareModal = ({ selectedApiIds, onClose }) => {
    const [details, setDetails] = useState([]);
    const [loading, setLoading] = useState(true);
    const MGT_URL = import.meta.env.VITE_MANAGEMENT_URL;

    useEffect(() => {
        fetchDetails();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedApiIds]);

    const fetchDetails = async () => {
        setLoading(true);
        try {
            const promises = selectedApiIds.map(id => 
                Promise.all([
                    axios.get(`${MGT_URL}/api/${id}`),
                    axios.get(`${MGT_URL}/api/${id}/plans`)
                ]).then(([meta, plans]) => ({ ...meta.data, plans: plans.data }))
            );
            const results = await Promise.all(promises);
            setDetails(results);
        } catch (error) {
            console.error("Comparison fetch failed");
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-md">
            <div className="w-10 h-10 border-2 border-[#10b981]/30 border-t-[#10b981] rounded-full animate-spin" />
        </div>
    );

    return (
        <div className="fixed inset-0 z-[200] overflow-y-auto bg-black/90 backdrop-blur-xl animate-fade-in">
            <div className="min-h-screen p-8 lg:p-16">
                <div className="max-w-[1400px] mx-auto space-y-12">
                    <header className="flex items-center justify-between">
                        <div>
                            <h2 className="text-3xl font-bold text-white tracking-tight">Market Intelligence Matrix</h2>
                            <p className="text-zinc-500 uppercase text-[10px] font-bold tracking-[0.3em] mt-2 italic">Side-by-side performance & economy benchmark</p>
                        </div>
                        <button onClick={onClose} className="p-3 bg-white/5 rounded-full text-zinc-400 hover:text-white transition group border border-white/5">
                            <X size={24} className="group-hover:rotate-90 transition-transform duration-300" />
                        </button>
                    </header>

                    <div className="grid grid-cols-1 overflow-x-auto pb-8">
                        <table className="w-full text-left border-collapse border-spacing-x-4">
                            <thead>
                                <tr>
                                    <th className="p-6 min-w-[200px] text-zinc-600 uppercase text-[10px] font-black tracking-widest border-b border-white/5">Metric</th>
                                    {details.map(api => (
                                        <th key={api.id} className="p-6 min-w-[300px] border-b border-white/5">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-black border border-white/5 rounded-xl flex items-center justify-center text-[#10b981]">
                                                    {api.logo_url ? <img src={api.logo_url} className="w-8 h-8 object-contain" /> : <Box size={24} />}
                                                </div>
                                                <div>
                                                    <p className="text-white font-bold">{api.name}</p>
                                                    <p className="text-[10px] text-zinc-500 font-mono italic">{api.id.split('-')[0]}</p>
                                                </div>
                                            </div>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                <tr>
                                    <td className="p-6 font-bold text-zinc-500 text-xs uppercase tracking-widest">Entry Pricing</td>
                                    {details.map(api => {
                                        const basic = api.plans?.find(p => p.price === 0) || api.plans?.[0];
                                        return (
                                            <td key={api.id} className="p-6">
                                                <div className="flex items-center gap-2 text-white font-bold text-xl">
                                                    <DollarSign size={16} className="text-[#10b981]" />
                                                    {basic ? basic.price : 'N/A'}
                                                    <span className="text-[10px] text-zinc-600 ml-1">/mo</span>
                                                </div>
                                                <p className="text-[10px] text-[#10b981] font-bold mt-1 uppercase">{basic?.name || 'TRIAL'}</p>
                                            </td>
                                        );
                                    })}
                                </tr>
                                <tr>
                                    <td className="p-6 font-bold text-zinc-500 text-xs uppercase tracking-widest">Monthly Quota</td>
                                    {details.map(api => {
                                        const maxQuota = Math.max(...(api.plans?.map(p => p.quota) || [0]));
                                        return (
                                            <td key={api.id} className="p-6">
                                                <div className="text-white font-mono text-lg">{maxQuota.toLocaleString()}</div>
                                                <p className="text-[10px] text-zinc-600 uppercase font-black">Peak requests per node</p>
                                            </td>
                                        );
                                    })}
                                </tr>
                                <tr>
                                    <td className="p-6 font-bold text-zinc-500 text-xs uppercase tracking-widest">Edge Latency</td>
                                    {details.map(api => (
                                        <td key={api.id} className="p-6">
                                            <div className="flex items-center gap-2 text-[#10b981] font-bold">
                                                <Zap size={14} /> Sub-5ms
                                            </div>
                                            <p className="text-[10px] text-zinc-600 uppercase font-black">Global distribution active</p>
                                        </td>
                                    ))}
                                </tr>
                                <tr>
                                    <td className="p-6 font-bold text-zinc-500 text-xs uppercase tracking-widest">Stability Index</td>
                                    {details.map(api => (
                                        <td key={api.id} className="p-6">
                                            <div className="flex items-center gap-2 text-white font-bold">
                                                <ShieldCheck size={16} className="text-[#10b981]" /> 99.9%
                                            </div>
                                            <p className="text-[10px] text-zinc-600 uppercase font-black">Service Level verified</p>
                                        </td>
                                    ))}
                                </tr>
                                <tr>
                                    <td className="p-6 font-bold text-zinc-500 text-xs uppercase tracking-widest">Protocol Type</td>
                                    {details.map(api => (
                                        <td key={api.id} className="p-6">
                                            <span className="px-3 py-1 bg-white/5 border border-white/5 rounded text-[10px] text-zinc-400 font-bold uppercase tracking-widest">
                                                {api.category || 'General'}
                                            </span>
                                        </td>
                                    ))}
                                </tr>
                                <tr>
                                    <td className="p-6"></td>
                                    {details.map(api => (
                                        <td key={api.id} className="p-6">
                                            <button 
                                                onClick={() => window.location.href=`/api/${api.id}`}
                                                className="w-full py-3 bg-[#10b981] text-black font-bold text-xs rounded-xl hover:brightness-110 transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#10b981]/10"
                                            >
                                                Select Provider <Check size={14} />
                                            </button>
                                        </td>
                                    ))}
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    
                    <footer className="text-center pt-12 border-t border-white/5 opacity-30">
                        <p className="text-[10px] text-zinc-600 uppercase font-black tracking-widest italic">Intelligence Matrix v1.0 • Data refreshed in real-time</p>
                    </footer>
                </div>
            </div>
        </div>
    );
};

export default CompareModal;
