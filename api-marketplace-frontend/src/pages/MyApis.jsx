import { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Globe, Server, Cpu, Database, ArrowRight, Activity, Box, PlusCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

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
        } catch (error) {
            console.error("Endpoint registry error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMyApis();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

    const handleRegister = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await axios.post(`${MGT_URL}/apis/register`, { name, base_url: baseUrl });
            setName('');
            setBaseUrl('');
            fetchMyApis();
        } catch (error) {
            console.error("Registry denied");
        }
        setLoading(false);
    };

    return (
        <div className="animate-fade-in space-y-12">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <div className="flex items-center gap-3">
                        <Terminal className="text-[#10b981]" size={28} />
                        <h1 className="text-3xl font-bold text-white tracking-tight">Provider Terminal</h1>
                    </div>
                    <p className="text-zinc-500 font-medium text-sm mt-1">Register and manage your infrastructure nodes on the global fabric.</p>
                </div>
                <div className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-lg border border-white/5 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-pulse" /> Fabric Link Active
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Deployment Form */}
                <div className="lg:col-span-1">
                    <div className="bg-[#0D0D0D] p-8 rounded-2xl border border-white/5 sticky top-24 space-y-8">
                        <div className="flex items-center gap-2 text-white font-bold text-sm tracking-tight">
                            <PlusCircle className="text-[#10b981]" size={18} /> New API Registration
                        </div>
                        <form onSubmit={handleRegister} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest pl-1">Public Identifier</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="e.g. Core AI Service"
                                    className="w-full bg-black border border-white/5 p-3 rounded-xl text-white text-sm focus:border-[#10b981] outline-none transition"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest pl-1">Upstream Target URL</label>
                                <input
                                    type="url"
                                    value={baseUrl}
                                    onChange={(e) => setBaseUrl(e.target.value)}
                                    placeholder="https://api.yourdomain.com"
                                    className="w-full bg-black border border-white/5 p-3 rounded-xl text-white text-sm focus:border-[#10b981] outline-none transition"
                                    required
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-[#10b981] text-black py-3 rounded-xl font-bold text-sm hover:brightness-110 transition disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {loading ? <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" /> : <Plus size={18} />}
                                Register Endpoint
                            </button>
                        </form>
                    </div>
                </div>

                {/* API Inventory */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                            <Database className="text-zinc-600" size={18} /> Managed Inventory
                        </h2>
                        <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">{apis.length} Nodes Online</span>
                    </div>

                    <div className="grid grid-cols-1 gap-3">
                        <AnimatePresence mode="popLayout">
                            {apis.map((api, index) => (
                                <motion.div
                                    key={api.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.2, delay: index * 0.03 }}
                                    onClick={() => navigate(`/studio/${api.id}`)}
                                    className="bg-[#0D0D0D] border border-white/5 p-5 rounded-xl flex items-center justify-between group hover:border-[#10b981]/30 transition-all cursor-pointer"
                                >
                                    <div className="flex items-center gap-5">
                                        <div className="w-12 h-12 bg-black border border-white/5 rounded-xl flex items-center justify-center text-zinc-700 group-hover:bg-[#10b981]/10 group-hover:text-[#10b981] transition-all">
                                            <Server size={22} />
                                        </div>
                                        <div>
                                            <h3 className="text-white font-semibold group-hover:text-[#10b981] transition-colors uppercase tracking-tight">{api.name}</h3>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <Globe size={10} className="text-zinc-600" />
                                                <span className="text-[10px] text-zinc-600 font-mono italic truncate max-w-[200px]">{api.base_url}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-6">
                                        <div className="hidden sm:flex flex-col items-end">
                                            <span className="text-[9px] text-[#10b981] font-bold uppercase tracking-widest">Active Edge</span>
                                            <span className="text-[10px] text-zinc-600 font-mono">Synced</span>
                                        </div>
                                        <div className="bg-white/5 p-2 rounded-lg text-zinc-600 group-hover:text-[#10b981] group-hover:bg-[#10b981]/10 transition-all">
                                            <ArrowRight size={18} />
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>

                    {apis.length === 0 && !loading && (
                        <div className="py-32 text-center rounded-2xl border border-dashed border-white/5 bg-white/2">
                            <Box className="mx-auto text-zinc-800 mb-4" size={40} />
                            <p className="text-zinc-600 text-sm">No infrastructure nodes registered yet.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MyApis;
