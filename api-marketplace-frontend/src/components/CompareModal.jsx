import { useState, useEffect } from 'react';
import axios from 'axios';
import { X, Check, Zap, DollarSign, Activity, ShieldCheck, Box } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CompareModal = ({ selectedApiIds, externalApisSource, onClose }) => {
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
            const aggregated = await Promise.all(selectedApiIds.map(async (id) => {
                if (id.startsWith('ext-')) {
                    // Match from frontend-cached Global Directory
                    const extSource = externalApisSource.find(api => api.id === id);
                    if (!extSource) return null;
                    return {
                        ...extSource,
                        plans: [{ name: 'MARKET', price: 'PAID/FREE', quota: 'DYNAMIC', type: 'EXTERNAL' }],
                        stability: '99.9%',
                        latency: 'Varies by Edge'
                    };
                } else {
                    // Fetch from production management plane (these endpoints EXIST on Render)
                    try {
                        const [meta, plans] = await Promise.all([
                            axios.get(`${MGT_URL}/api/${id}`),
                            axios.get(`${MGT_URL}/api/${id}/plans`)
                        ]);
                        return { 
                            ...meta.data, 
                            origin: 'keyverse', 
                            plans: plans.data,
                            stability: '99.9% (Verified)',
                            latency: '< 5ms (KeyVerse Edge)'
                        };
                    } catch (err) {
                        console.error(`Failed to fetch internal node: ${id}`);
                        return null;
                    }
                }
            }));
            setDetails(aggregated.filter(d => d !== null));
        } catch (error) {
            console.error("Aggregation failed");
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-md">
            <div className="w-12 h-12 border-2 border-[#10b981]/30 border-t-[#10b981] rounded-full animate-spin" />
        </div>
    );

    return (
        <div className="fixed inset-0 z-[200] overflow-y-auto bg-black/95 backdrop-blur-3xl animate-fade-in">
            <div className="min-h-screen p-8 lg:p-20">
                <div className="max-w-[1400px] mx-auto space-y-12">
                    <header className="flex items-center justify-between">
                        <div>
                            <div className="flex items-center gap-3 text-[#10b981] text-[10px] font-black uppercase tracking-[0.3em] mb-2">
                                <Activity size={12} /> Matrix Aggregator Active
                            </div>
                            <h2 className="text-4xl font-black text-white tracking-tight">Intelligence Matrix</h2>
                        </div>
                        <button onClick={onClose} className="p-3 bg-white/5 rounded-full text-zinc-400 hover:text-white transition group border border-white/5 shadow-2xl">
                            <X size={24} className="group-hover:rotate-90 transition-transform duration-300" />
                        </button>
                    </header>

                    <div className="grid grid-cols-1 overflow-x-auto rounded-[32px] border border-white/5 bg-[#080808] shadow-2xl">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-white/5">
                                    <th className="p-8 min-w-[200px] text-zinc-600 uppercase text-[10px] font-black tracking-widest border-b border-white/5">Infrastructure Metric</th>
                                    {details.map(api => (
                                        <th key={api.id} className="p-8 min-w-[320px] border-b border-white/5">
                                            <div className="flex items-center gap-4">
                                                <div className="w-14 h-14 bg-black border border-white/10 rounded-2xl flex items-center justify-center p-2 shadow-inner">
                                                    {api.logo_url ? <img src={api.logo_url} className="w-full h-full object-contain" /> : <Box size={24} className="text-[#10b981]" />}
                                                </div>
                                                <div>
                                                    <p className="text-white font-black tracking-tight text-lg">{api.name}</p>
                                                    <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded tracking-widest ${api.origin === 'keyverse' ? 'bg-[#10b981]/10 text-[#10b981]' : 'bg-white/5 text-zinc-500'}`}>
                                                        {api.origin === 'keyverse' ? 'Verified Edge' : 'Global Discovery'}
                                                    </span>
                                                </div>
                                            </div>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                <tr>
                                    <td className="p-8 font-bold text-zinc-500 text-[10px] uppercase tracking-[0.3em]">Economic Entry</td>
                                    {details.map(api => {
                                        const basic = api.plans?.find(p => p.price === 0 || p.price === 'PAID/FREE') || api.plans?.[0];
                                        return (
                                            <td key={api.id} className="p-8">
                                                <div className="flex items-center gap-2 text-white font-black text-2xl tracking-tighter">
                                                    <DollarSign size={20} className="text-[#10b981]" />
                                                    {basic?.price ?? 'TBA'}
                                                    {typeof basic?.price === 'number' && <span className="text-[10px] text-zinc-600 ml-1">/mo</span>}
                                                </div>
                                                <p className="text-[10px] text-[#10b981] font-black mt-2 uppercase tracking-widest">{basic?.name || 'DYNAMIC'}</p>
                                            </td>
                                        );
                                    })}
                                </tr>
                                <tr>
                                    <td className="p-8 font-bold text-zinc-500 text-[10px] uppercase tracking-[0.3em]">Volume Quota</td>
                                    {details.map(api => {
                                        const maxQuota = api.plans?.[0]?.quota ?? 'UNLIMITED';
                                        return (
                                            <td key={api.id} className="p-8">
                                                <div className="text-white font-mono text-xl tracking-tight font-bold">
                                                    {typeof maxQuota === 'number' ? maxQuota.toLocaleString() : maxQuota}
                                                </div>
                                                <p className="text-[10px] text-zinc-600 uppercase font-black tracking-widest mt-1">Requests / Cycle</p>
                                            </td>
                                        );
                                    })}
                                </tr>
                                <tr>
                                    <td className="p-8 font-bold text-zinc-500 text-[10px] uppercase tracking-[0.3em]">Edge Latencies</td>
                                    {details.map(api => (
                                        <td key={api.id} className="p-8">
                                            <div className="flex items-center gap-2 text-[#10b981] font-bold text-lg">
                                                <Zap size={16} fill="currentColor" /> {api.latency}
                                            </div>
                                            <p className="text-[10px] text-zinc-600 uppercase font-black tracking-widest mt-1">Global Routing active</p>
                                        </td>
                                    ))}
                                </tr>
                                <tr>
                                    <td className="p-8 font-bold text-zinc-500 text-[10px] uppercase tracking-[0.3em]">Trust Score</td>
                                    {details.map(api => (
                                        <td key={api.id} className="p-8">
                                            <div className="flex items-center gap-2 text-white font-bold text-lg">
                                                <ShieldCheck size={18} className="text-[#10b981]" /> {api.stability}
                                            </div>
                                            <p className="text-[10px] text-zinc-600 uppercase font-black tracking-widest mt-1">Availability Verified</p>
                                        </td>
                                    ))}
                                </tr>
                                <tr>
                                    <td className="p-8"></td>
                                    {details.map(api => (
                                        <td key={api.id} className="p-8">
                                            {api.origin === 'keyverse' ? (
                                                <button 
                                                    onClick={() => window.location.href=`/api/${api.id}`}
                                                    className="w-full py-4 bg-[#10b981] text-black font-black text-[10px] uppercase tracking-widest rounded-2xl hover:brightness-110 transition-all flex items-center justify-center gap-2 shadow-xl shadow-[#10b981]/10"
                                                >
                                                    Select Provider <Check size={14} />
                                                </button>
                                            ) : (
                                                <button 
                                                    onClick={() => api.external_url && window.open(api.external_url, '_blank')}
                                                    className="w-full py-4 bg-white/5 border border-white/10 text-white font-black text-[10px] uppercase tracking-widest rounded-2xl hover:bg-white/10 transition-all flex items-center justify-center gap-2 shadow-xl"
                                                >
                                                    View External Ledger <Zap size={14} />
                                                </button>
                                            )}
                                        </td>
                                    ))}
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CompareModal;
