import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Search, ArrowRight, TrendingUp, Zap, Layers, BarChart2, Plus, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import CompareModal from '../components/CompareModal';

const Landing = () => {
    const navigate = useNavigate();
    const [apis, setApis] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedApis, setSelectedApis] = useState(JSON.parse(localStorage.getItem('stagedApis') || '[]'));
    const [isCompareOpen, setIsCompareOpen] = useState(false);
    const MGT_URL = import.meta.env.VITE_MANAGEMENT_URL;

    useEffect(() => {
        axios.get(`${MGT_URL}/apis/public`)
            .then(res => setApis(res.data))
            .catch(error => console.error("Could not load public APIs", error));
    }, [MGT_URL]);

    useEffect(() => {
        localStorage.setItem('stagedApis', JSON.stringify(selectedApis));
    }, [selectedApis]);

    const toggleSelection = (apiId, e) => {
        e.stopPropagation();
        if (selectedApis.includes(apiId)) {
            setSelectedApis(selectedApis.filter(id => id !== apiId));
        } else {
            if (selectedApis.length < 3) {
                setSelectedApis([...selectedApis, apiId]);
            }
        }
    };

    const filteredApis = apis.filter(api =>
        api.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        api.category?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="animate-fade-in space-y-16 pb-24">
            {/* Minimalist Hero */}
            <section className="py-12 flex flex-col items-center text-center space-y-6">
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[#10b981]/10 border border-[#10b981]/20 text-[#10b981] text-[10px] font-bold tracking-widest uppercase">
                    <Zap size={10} fill="#10b981" /> The Intelligence Protocol
                </div>
                
                <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white max-w-3xl leading-[1.1]">
                    The Universal <span className="text-[#10b981]">API Fabric</span>
                </h1>
                <p className="text-zinc-500 max-w-xl text-lg font-light leading-relaxed">
                    Compare performance, evaluate costs, and choose the best fit.
                    Integrate the world's most stable infrastructure in minutes.
                </p>

                {/* Search Prime */}
                <div className="w-full max-w-2xl pt-8">
                    <div className="relative group">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-[#10b981] transition-colors" size={20} />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search providers (e.g. OpenAI, Stripe, Marketplace)..."
                            className="w-full bg-[#0D0D0D] border border-white/5 rounded-2xl py-5 pl-14 pr-6 text-lg focus:outline-none focus:border-[#10b981]/50 focus:bg-[#121212] transition-all shadow-2xl"
                        />
                    </div>
                </div>
            </section>

            {/* Marketplace Table / Rows */}
            <section className="space-y-6">
                <div className="flex items-center justify-between px-4 pb-2 border-b border-white/5">
                    <div className="flex items-center gap-3 text-zinc-400 font-medium text-sm">
                        <TrendingUp size={16} className="text-[#10b981]" />
                        Active Market Registry
                    </div>
                    <div className="flex items-center gap-4 text-[11px] text-zinc-600 uppercase tracking-widest font-bold">
                        <span className="hidden md:inline">Selection</span>
                        <span className="hidden md:inline">Analytics</span>
                        <span>Gateway</span>
                    </div>
                </div>

                <div className="space-y-2">
                    <AnimatePresence mode="popLayout">
                        {filteredApis.map((api, index) => (
                            <motion.div
                                key={api.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.98 }}
                                transition={{ duration: 0.2, delay: index * 0.03 }}
                                onClick={() => navigate(`/api/${api.id}`)}
                                className={`group flex items-center justify-between p-4 rounded-xl border transition-all cursor-pointer ${
                                    selectedApis.includes(api.id) 
                                    ? 'bg-[#10b981]/5 border-[#10b981]/30 shadow-[0_0_20px_rgba(16,185,129,0.05)]' 
                                    : 'bg-[#0D0D0D] border-white/5 hover:border-[#10b981]/30 hover:bg-[#121212]'
                                }`}
                            >
                                <div className="flex items-center gap-5">
                                    <button 
                                        onClick={(e) => toggleSelection(api.id, e)}
                                        className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${
                                            selectedApis.includes(api.id)
                                            ? 'bg-[#10b981] border-[#10b981] text-black scale-110 shadow-lg shadow-[#10b981]/20'
                                            : 'border-white/10 text-transparent hover:border-[#10b981]'
                                        }`}
                                    >
                                        <Check size={12} />
                                    </button>

                                    <div className="w-12 h-12 rounded-lg bg-zinc-900 border border-white/5 flex items-center justify-center text-zinc-400 group-hover:bg-[#10b981]/10 group-hover:text-[#10b981] transition-all">
                                        {api.logo_url ? <img src={api.logo_url} alt={api.name} className="w-8 h-8 object-contain" /> : <Layers size={22} />}
                                    </div>
                                    <div>
                                        <h3 className="text-white font-semibold group-hover:text-[#10b981] transition-colors">{api.name}</h3>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <span className="text-[10px] text-zinc-500 font-mono tracking-tight">{api.id.split('-')[0]}</span>
                                            <span className="w-1 h-1 rounded-full bg-zinc-700" />
                                            <span className="text-[10px] text-zinc-500 uppercase tracking-wider">{api.category || 'Standard'}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-8 text-right">
                                    <div className="hidden md:flex flex-col items-end">
                                        <div className="flex items-center gap-1.5 text-[10px] text-[#10b981] font-bold">
                                            <div className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-pulse" />
                                            Live
                                        </div>
                                        <span className="text-[10px] text-zinc-600 font-mono">Verified Performance</span>
                                    </div>

                                    <div className="bg-white/5 p-2 rounded-lg text-zinc-500 group-hover:text-[#10b981] transition-all">
                                        <ArrowRight size={18} />
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            </section>

            {/* Floating Comparison Drawer */}
            <AnimatePresence>
                {selectedApis.length > 0 && (
                    <motion.div
                        initial={{ y: 100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 100, opacity: 0 }}
                        className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 w-full max-w-sm"
                    >
                        <div className="bg-[#121212]/80 backdrop-blur-xl border border-[#10b981]/20 p-4 rounded-2xl shadow-2xl flex items-center justify-between gap-4">
                            <div className="flex -space-x-3 overflow-hidden ml-2">
                                {selectedApis.map(id => (
                                    <div key={id} className="inline-block h-8 w-8 rounded-full bg-[#050505] border-2 border-[#121212] flex items-center justify-center text-[#10b981] shadow-xl">
                                        <Box size={14} />
                                    </div>
                                ))}
                                {selectedApis.length < 3 && (
                                    <div className="inline-block h-8 w-8 rounded-full bg-white/5 border-2 border-dashed border-white/10 flex items-center justify-center text-zinc-600">
                                        <Plus size={14} />
                                    </div>
                                )}
                            </div>
                            
                            <div className="flex-1">
                                <p className="text-white text-[11px] font-bold tracking-tight">{selectedApis.length} Provider{selectedApis.length > 1 ? 's' : ''} Staged</p>
                                <p className="text-zinc-500 text-[9px] uppercase tracking-widest font-bold">Ready for Intelligence Matrix</p>
                            </div>

                            <button
                                onClick={() => setIsCompareOpen(true)}
                                className="bg-[#10b981] text-black px-4 py-2 rounded-lg text-xs font-black shadow-lg shadow-[#10b981]/20 hover:brightness-110 active:scale-95 transition-all flex items-center gap-2"
                            >
                                <BarChart2 size={14} /> Compare
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Comparison Modal Overlay */}
            <AnimatePresence>
                {isCompareOpen && (
                    <CompareModal 
                        selectedApiIds={selectedApis} 
                        onClose={() => setIsCompareOpen(false)} 
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

const Box = ({ size }) => <Layers size={size} />;

export default Landing;
