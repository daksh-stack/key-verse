import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Search, ChevronRight, Zap, ArrowRight, ShieldCheck, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Landing = () => {
    const navigate = useNavigate();
    const [apis, setApis] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const MGT_URL = import.meta.env.VITE_MANAGEMENT_URL;

    useEffect(() => {
        axios.get(`${MGT_URL}/apis/public`)
            .then(res => setApis(res.data))
            .catch(err => console.error("Could not load public APIs"));
    }, []);

    const filteredApis = apis.filter(api =>
        api.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-24 pb-20 overflow-hidden">
            {/* Hero Section */}
            <section className="relative min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
                {/* Background Glows */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/10 blur-[120px] -z-10 rounded-full animate-pulse" />
                <div className="absolute top-1/2 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-purple-600/5 blur-[100px] -z-10 rounded-full" />

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="space-y-8 max-w-4xl"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-bold tracking-widest uppercase">
                        <Zap size={14} className="fill-blue-400" /> API Fabric for the AI Era
                    </div>

                    <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-tight italic">
                        BUILD THE <br />
                        <span className="text-white neon-text">NEXT-GEN</span> <br />
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">ECOSYSTEM</span>
                    </h1>

                    <p className="text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed font-light">
                        Deploy telco-grade APIs with zero-trust security and native AI orchestration.
                        The marketplace reimagined for the <span className="text-white font-medium italic underline decoration-blue-500">autonomous agent epoch.</span>
                    </p>

                    <div className="flex flex-wrap justify-center gap-6 pt-4">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="bg-blue-600 text-white px-10 py-5 rounded-2xl font-black text-lg shadow-[0_0_30px_rgba(37,99,235,0.3)] hover:shadow-[0_0_50px_rgba(37,99,235,0.5)] transition duration-500"
                        >
                            INITIATE PROTOCOL
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="bg-white/5 border border-white/10 text-white px-10 py-5 rounded-2xl font-black text-lg hover:bg-white/10 transition backdrop-blur-sm"
                        >
                            READ DOCS
                        </motion.button>
                    </div>
                </motion.div>
            </section>

            {/* Marketplace Explorer */}
            <section className="max-w-7xl mx-auto px-6 space-y-12">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                    <div className="space-y-2">
                        <h2 className="text-4xl font-black text-white italic tracking-tight">ACTIVE MARKET</h2>
                        <div className="h-1.5 w-24 speed-gradient rounded-full" />
                    </div>

                    <div className="relative group min-w-[300px]">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-hover:text-blue-500 transition" size={20} />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search Marketplace..."
                            className="w-full pl-12 pr-6 py-4 bg-white/5 border border-white/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-medium text-white placeholder:text-slate-600"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <AnimatePresence>
                        {filteredApis.map((api, index) => (
                            <motion.div
                                key={api.id}
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ duration: 0.4, delay: index * 0.05 }}
                                onClick={() => navigate(`/api/${api.id}`)}
                                className="glass p-8 rounded-[40px] relative group hover:-translate-y-2 transition duration-500 overflow-hidden cursor-pointer"
                            >
                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500/50 to-transparent opacity-0 group-hover:opacity-100 transition duration-500" />

                                <div className="flex items-start justify-between mb-8">
                                    <div className="p-4 bg-blue-500/10 rounded-3xl text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition duration-500 shadow-inner">
                                        <Globe size={28} />
                                    </div>
                                    <div className="flex items-center gap-2 text-xs font-black text-slate-500 uppercase tracking-[0.2em]">
                                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" /> Live
                                    </div>
                                </div>

                                <h3 className="text-2xl font-black text-white mb-2 tracking-tight group-hover:text-blue-400 transition duration-300">
                                    {api.name?.toUpperCase()}
                                </h3>
                                <p className="text-slate-400 text-sm mb-8 leading-relaxed font-normal">
                                    Secure gateway to {api.base_url}. Optimized for sub-ms latency in AI workflows.
                                </p>

                                <div className="flex items-center justify-between pt-6 border-t border-white/5 group-hover:border-blue-500/20 transition">
                                    <div className="flex items-center gap-2 text-blue-400 font-black text-xs">
                                        <Zap size={14} /> 99.9% UPTIME
                                    </div>
                                    <button className="flex items-center gap-2 text-white font-black text-sm group/btn bg-white/5 px-4 py-2 rounded-xl border border-white/5 hover:bg-blue-600 hover:border-blue-600 transition duration-300">
                                        INIT <ArrowRight size={16} className="group-hover/btn:translate-x-1 transition duration-300" />
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>

                {filteredApis.length === 0 && (
                    <div className="text-center py-20 bg-white/2 rounded-[40px] border border-dashed border-white/10">
                        <Search className="mx-auto text-slate-700 mb-4" size={48} />
                        <p className="text-slate-500 font-medium text-lg">No endpoints found matching your query.</p>
                    </div>
                )}
            </section>
        </div>
    );
};

export default Landing;
