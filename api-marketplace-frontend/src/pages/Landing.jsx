import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Search, ArrowRight, TrendingUp, Zap, Layers, BarChart2, Check, ShieldAlert, Lock, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import CompareModal from '../components/CompareModal';

const Landing = () => {
    const navigate = useNavigate();
    const [internalApis, setInternalApis] = useState([]);
    const [externalApis, setExternalApis] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [selectedApis, setSelectedApis] = useState(JSON.parse(localStorage.getItem('stagedApis') || '[]'));
    const [isCompareOpen, setIsCompareOpen] = useState(false);
    const [showAuthModal, setShowAuthModal] = useState(false);
    const MGT_URL = import.meta.env.VITE_MANAGEMENT_URL;

    // SaaS Guest Trial State
    const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('user'));
    const [trialUsed, setTrialUsed] = useState(localStorage.getItem('guest_trial_used') === 'true');

    // 1. Fetch Discovery Data (Internal + Global)
    useEffect(() => {
        const fetchDiscovery = async () => {
            setLoading(true);
            try {
                // Fetch Internal Registry from Production Backend
                const intRes = await axios.get(`${MGT_URL}/apis/public`);
                setInternalApis(intRes.data.map(api => ({ ...api, origin: 'keyverse' })));

                // Fetch Global Registry Directly (APIs.guru) - Bypasses backend 404s
                const guruRes = await axios.get('https://api.apis.guru/v2/list.json');
                const guruList = Object.entries(guruRes.data).map(([key, value]) => {
                    const apiName = value.preferred || Object.keys(value.versions)[0];
                    const info = value.versions[apiName].info;
                    return {
                        id: `ext-${key}`,
                        name: info.title,
                        category: 'External Market',
                        logo_url: info['x-logo']?.url || null,
                        origin: 'external',
                        external_url: info['x-origin']?.[0]?.url || null,
                        description: info.description
                    };
                });
                setExternalApis(guruList);
            } catch (error) {
                console.error("Discovery Engine Sync Failure", error);
            } finally {
                setLoading(false);
            }
        };
        fetchDiscovery();
    }, [MGT_URL]);

    // 2. Client-Side Federated Search
    const filteredApis = useMemo(() => {
        const query = searchTerm.toLowerCase();
        
        // Always show internal matches
        const filteredInternal = internalApis.filter(api => 
            api.name?.toLowerCase().includes(query) || 
            api.category?.toLowerCase().includes(query)
        );

        // Only search 2,500 external nodes if query is substantial (UX/Performance)
        let filteredExternal = [];
        if (query.length > 2) {
            filteredExternal = externalApis.filter(api => 
                api.name?.toLowerCase().includes(query) || 
                api.id.toLowerCase().includes(query)
            ).slice(0, 30); // Limit results for readability
        }

        return [...filteredInternal, ...filteredExternal];
    }, [searchTerm, internalApis, externalApis]);

    useEffect(() => {
        localStorage.setItem('stagedApis', JSON.stringify(selectedApis));
    }, [selectedApis]);

    const toggleSelection = (apiId, e) => {
        e.stopPropagation();
        if (!isLoggedIn && trialUsed) {
            setShowAuthModal(true);
            return;
        }
        if (selectedApis.includes(apiId)) {
            setSelectedApis(selectedApis.filter(id => id !== apiId));
        } else {
            if (selectedApis.length < 3) {
                setSelectedApis([...selectedApis, apiId]);
            }
        }
    };

    const handleCompareRequest = () => {
        if (!isLoggedIn && trialUsed) {
            setShowAuthModal(true);
            return;
        }
        setIsCompareOpen(true);
    };

    const handleCloseCompare = () => {
        setIsCompareOpen(false);
        if (!isLoggedIn && selectedApis.length > 0) {
            setTrialUsed(true);
            localStorage.setItem('guest_trial_used', 'true');
        }
    };

    return (
        <div className="animate-fade-in space-y-12 pb-32">
            {/* Global Search Interface */}
            <section className="py-6 flex flex-col items-center text-center space-y-6">
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[#10b981]/10 border border-[#10b981]/20 text-[#10b981] text-[10px] font-bold tracking-widest uppercase">
                    <Globe size={10} className="animate-spin-slow" /> Edge Discovery Protocol Active
                </div>
                
                <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter leading-none">Global Registry</h1>
                <p className="text-zinc-500 max-w-xl text-sm font-light">
                    Aggregating your private nodes with over 2,500 real-world API providers.
                </p>

                <div className="w-full max-w-3xl pt-4">
                    <div className="relative group">
                        <Search className={`absolute left-5 top-1/2 -translate-y-1/2 transition-colors ${loading ? 'text-[#10b981] animate-pulse' : 'text-zinc-500'}`} size={20} />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Identify Infrastructure (e.g. Weather, Stripe, OpenAI)..."
                            className="w-full bg-[#0D0D0D] border border-white/5 rounded-2xl py-6 pl-14 pr-6 text-lg focus:outline-none focus:border-[#10b981]/50 focus:bg-[#121212] transition-all shadow-2xl"
                        />
                        {loading && <div className="absolute right-6 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-[#10b981]/30 border-t-[#10b981] rounded-full animate-spin" />}
                    </div>
                </div>
            </section>

            {/* Marketplace Grid */}
            <section className="space-y-4">
                <div className="flex items-center justify-between px-4 pb-2 border-b border-white/5">
                    <div className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.2em]">
                        Discovery Registry ({filteredApis.length} Results)
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-2">
                    <AnimatePresence mode="popLayout">
                        {filteredApis.map((api, index) => (
                            <motion.div
                                key={api.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.2, delay: index * 0.02 }}
                                onClick={() => api.origin === 'external' ? window.open(api.external_url, '_blank') : navigate(`/api/${api.id}`)}
                                className={`group flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer ${
                                    selectedApis.includes(api.id) 
                                    ? 'bg-[#10b981]/5 border-[#10b981]/30' 
                                    : 'bg-[#0D0D0D] border-white/5 hover:border-[#10b981]/30 hover:bg-[#121212]'
                                }`}
                            >
                                <div className="flex items-center gap-5">
                                    <button 
                                        onClick={(e) => toggleSelection(api.id, e)}
                                        className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${
                                            selectedApis.includes(api.id)
                                            ? 'bg-[#10b981] border-[#10b981] text-black shadow-lg shadow-[#10b981]/20'
                                            : 'border-white/10 text-transparent hover:border-[#10b981]'
                                        }`}
                                    >
                                        <Check size={12} />
                                    </button>

                                    <div className="w-12 h-12 rounded-xl bg-black border border-white/5 flex items-center justify-center text-zinc-500 overflow-hidden shadow-inner">
                                        {api.logo_url ? <img src={api.logo_url} alt="" className="w-full h-full object-contain p-2" /> : <Layers size={22} />}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-3">
                                            <h3 className="text-white font-bold tracking-tight group-hover:text-[#10b981] transition-colors">{api.name}</h3>
                                            {api.origin === 'external' && (
                                                <span className="px-2 py-0.5 rounded text-[8px] font-black bg-white/5 border border-white/10 text-zinc-500 uppercase tracking-widest">Global Discovery</span>
                                            )}
                                            {api.origin === 'keyverse' && (
                                                <span className="px-2 py-0.5 rounded text-[8px] font-black bg-[#10b981]/10 border border-[#10b981]/20 text-[#10b981] uppercase tracking-widest leading-none flex items-center gap-1"><Zap size={8} fill="currentColor"/> Verified Node</span>
                                            )}
                                        </div>
                                        <p className="text-[10px] text-zinc-500 font-mono mt-0.5 max-w-md truncate opacity-60">
                                            {api.description || `${api.category} protocol via production mesh`}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-6">
                                    <div className="hidden sm:flex flex-col items-end">
                                        <div className="flex items-center gap-1.5 text-[10px] text-[#10b981] font-bold">
                                            <div className="w-1 h-1 rounded-full bg-[#10b981] shadow-[0_0_5px_rgba(16,185,129,1)]" />
                                            Online
                                        </div>
                                        <span className="text-[10px] text-zinc-600 font-mono tracking-tighter capitalize">{api.origin} Infrastructure</span>
                                    </div>
                                    <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 text-zinc-600 group-hover:text-white transition-all">
                                        {api.origin === 'external' ? <ArrowRight size={16} /> : <Zap size={16} />}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            </section>

            {/* Staging Drawer */}
            <AnimatePresence>
                {selectedApis.length > 0 && (
                    <motion.div
                        initial={{ y: 100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 100, opacity: 0 }}
                        className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 w-full max-w-sm"
                    >
                        <div className="bg-black/95 backdrop-blur-3xl border border-[#10b981]/20 p-5 rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.7)] flex items-center justify-between gap-4">
                            <div className="flex-1 px-2">
                                <p className="text-white text-xs font-black tracking-tight">{selectedApis.length} Unit{selectedApis.length > 1 ? 's' : ''} Staged</p>
                                <p className="text-[9px] text-[#10b981] uppercase font-black tracking-[0.2em] mt-1">Matrix Load Ready</p>
                            </div>

                            <button
                                onClick={handleCompareRequest}
                                className="bg-[#10b981] text-black px-6 py-3 rounded-2xl text-xs font-black shadow-[0_0_20px_rgba(16,185,129,0.2)] hover:scale-105 active:scale-95 transition-all flex items-center gap-3"
                            >
                                <BarChart2 size={16} /> Benchmark
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Trial Enforcement */}
            <AnimatePresence>
                {showAuthModal && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/95 backdrop-blur-xl"
                    >
                        <motion.div
                            initial={{ scale: 0.95, y: 10 }} animate={{ scale: 1, y: 0 }}
                            className="bg-[#0D0D0D] border border-white/5 max-w-md w-full p-12 rounded-[40px] text-center space-y-8 shadow-[0_0_100px_rgba(0,0,0,1)]"
                        >
                            <div className="mx-auto w-20 h-20 rounded-3xl bg-amber-500/10 flex items-center justify-center text-amber-500 border border-amber-500/20">
                                <ShieldAlert size={40} />
                            </div>
                            <div className="space-y-4">
                                <h2 className="text-3xl font-black text-white tracking-tighter">Trial Concluded</h2>
                                <p className="text-zinc-500 text-sm leading-relaxed font-light">
                                    Your one-time guest benchmark is complete. Establish your developer identity to continue accessesing global infrastructure.
                                </p>
                            </div>
                            <div className="flex flex-col gap-4">
                                <Link to="/login" className="px-8 py-5 bg-[#10b981] text-black font-black text-sm rounded-2xl hover:brightness-110 transition-all flex items-center gap-2">
                                    <Lock size={18} /> Establish Identity
                                </Link>
                                <button onClick={() => setShowAuthModal(false)} className="text-zinc-600 hover:text-white transition text-[10px] font-black uppercase tracking-[0.3em]">
                                    Return to Hub
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Comparison Modal Overlay */}
            <AnimatePresence>
                {isCompareOpen && (
                    <CompareModal 
                        selectedApiIds={selectedApis} 
                        externalApisSource={externalApis} // Pass for frontend aggregation
                        onClose={handleCloseCompare} 
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

export default Landing;
