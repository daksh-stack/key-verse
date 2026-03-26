import { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, List, Globe, Server, Cpu, Database, ArrowRight, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from '../components/LoadingSpinner';

const MyApis = () => {
    const navigate = useNavigate();
    const [apis, setApis] = useState([]);
    const [name, setName] = useState('');
    const [baseUrl, setBaseUrl] = useState('');
    const [loading, setLoading] = useState(true);

    const MGT_URL = import.meta.env.VITE_MANAGEMENT_URL;

    const fetchMyApis = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`${MGT_URL}/apis`);
            setApis(res.data);
        } catch (err) {
            console.error("Endpoint registry error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMyApis();
    }, []);

    if (loading) return <LoadingSpinner />;

    const handleRegister = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await axios.post(`${MGT_URL}/apis/register`, { name, base_url: baseUrl });
            setName('');
            setBaseUrl('');
            fetchMyApis();
        } catch (err) {
            alert("REGISTRY_DENIED");
        }
        setLoading(false);
    };

    return (
        <div className="space-y-12 pb-20">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-4">
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-600/20 rounded-xl flex items-center justify-center border border-indigo-500/30">
                            <Cpu size={20} className="text-indigo-400" />
                        </div>
                        <h1 className="text-4xl font-black italic tracking-tighter text-white uppercase">Provider_Terminal</h1>
                    </div>
                    <p className="text-slate-500 font-bold text-xs tracking-[0.2em] max-w-xl">
                        REGISTER NEW ENDPOINTS INTO THE DATA FABRIC. SYSTEM STATUS: <span className="text-indigo-400 ml-1">READY_FOR_INGESTION</span>
                    </p>
                </div>
                <div className="flex items-center gap-4 text-[10px] font-black tracking-widest text-slate-600">
                    <Activity size={14} className="text-green-500" /> NODE_01_SYNCHRONIZED
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 px-4">
                {/* Deployment Form */}
                <div className="lg:col-span-4">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="glass p-8 rounded-[40px] sticky top-24 border-indigo-500/10"
                    >
                        <h2 className="text-xl font-black italic text-white mb-8 flex items-center gap-3">
                            <Plus className="text-indigo-500" size={20} /> NEW_DEPLOYMENT
                        </h2>
                        <form onSubmit={handleRegister} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Identifier</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="ENDPOINT NAME..."
                                    className="w-full bg-black/40 border border-white/5 p-4 rounded-2xl text-white font-mono text-xs focus:ring-1 focus:ring-indigo-500 outline-none transition"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Source URL</label>
                                <input
                                    type="url"
                                    value={baseUrl}
                                    onChange={(e) => setBaseUrl(e.target.value)}
                                    placeholder="HTTPS://API.SOURCE..."
                                    className="w-full bg-black/40 border border-white/5 p-4 rounded-2xl text-white font-mono text-xs focus:ring-1 focus:ring-indigo-500 outline-none transition"
                                    required
                                />
                            </div>
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                type="submit"
                                disabled={loading}
                                className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black text-xs tracking-[0.2em] shadow-lg shadow-indigo-500/20 hover:bg-indigo-500 transition disabled:opacity-30"
                            >
                                {loading ? "INGESTING..." : "COMMIT TO MARKETPLACE"}
                            </motion.button>
                        </form>
                    </motion.div>
                </div>

                {/* API Inventory */}
                <div className="lg:col-span-8 flex flex-col gap-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-black italic text-white flex items-center gap-3 tracking-tight">
                            <Database className="text-blue-500" size={20} /> REGISTRY_INVENTORY
                        </h2>
                        <div className="h-0.5 flex-1 mx-6 bg-white/5 hidden md:block" />
                        <span className="text-[10px] font-black text-slate-500 tracking-[0.3em]">{apis.length} ACTIVE_NODES</span>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        <AnimatePresence>
                            {apis.map((api, index) => (
                                <motion.div
                                    key={api.id}
                                    initial={{ opacity: 0, scale: 0.98 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="glass p-6 rounded-[32px] flex items-center justify-between group hover:border-indigo-500/20 transition duration-300 relative overflow-hidden"
                                >
                                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-600/0 group-hover:bg-indigo-600 transition duration-500" />

                                    <div className="flex items-center gap-6">
                                        <div className="w-14 h-14 bg-white/2 border border-white/5 rounded-2xl flex items-center justify-center text-slate-500 group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-600 transition duration-500">
                                            <Server size={24} />
                                        </div>
                                        <div className="space-y-1">
                                            <h3 className="text-lg font-black text-white italic group-hover:text-indigo-400 transition">{api.name.toUpperCase()}</h3>
                                            <p className="text-xs text-slate-500 font-mono tracking-tighter flex items-center gap-2">
                                                <Globe size={12} className="text-slate-600" /> {api.base_url}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-6">
                                        <div className="hidden sm:flex flex-col items-end">
                                            <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Protocol</span>
                                            <span className="text-xs font-bold text-white tracking-widest">HTTPS/TLS</span>
                                        </div>
                                        <button
                                            onClick={() => navigate(`/studio/${api.id}`)}
                                            className="p-3 bg-indigo-600/10 rounded-xl border border-indigo-500/20 text-indigo-400 hover:bg-indigo-600 hover:text-white transition group/studio"
                                        >
                                            <ArrowRight size={18} className="group-hover/studio:translate-x-1 transition" />
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>

                    {apis.length === 0 && (
                        <div className="text-center py-20 bg-white/2 rounded-[40px] border border-dashed border-white/10 opacity-30 italic">
                            Registry empty. Waiting for initial deployment...
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MyApis;
