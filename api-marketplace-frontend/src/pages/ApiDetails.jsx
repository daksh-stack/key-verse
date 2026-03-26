import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import SwaggerUI from 'swagger-ui-react';
import 'swagger-ui-react/swagger-ui.css';
import {
    Terminal, FileText, Play, Code2,
    ChevronLeft, ExternalLink, ShieldCheck, Zap,
    Copy, Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import LoadingSpinner from '../components/LoadingSpinner';

const ApiDetails = () => {
    const { apiId } = useParams();
    const navigate = useNavigate();
    const [activeMode, setActiveMode] = useState('docs'); // docs, interactive, snippets
    const [apiData, setApiData] = useState(null);
    const [snippets, setSnippets] = useState([]);
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedSnippet, setSelectedSnippet] = useState(0);
    const [copied, setCopied] = useState(false);
    const [showPlans, setShowPlans] = useState(false);
    const [subscribing, setSubscribing] = useState(false);

    const MGT_URL = import.meta.env.VITE_MANAGEMENT_URL;

    useEffect(() => {
        fetchData();
    }, [apiId]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [metaRes, snippetRes, plansRes] = await Promise.all([
                axios.get(`${MGT_URL}/studio/${apiId}`),
                axios.get(`${MGT_URL}/api/${apiId}/snippets`),
                axios.get(`${MGT_URL}/api/${apiId}/plans`)
            ]);
            setApiData(metaRes.data);
            setSnippets(snippetRes.data || []);
            setPlans(plansRes.data || []);
        } catch (err) {
            console.error("Documentation fetch failed");
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <LoadingSpinner />;

    const handleSubscribe = async (planId) => {
        const apiKey = localStorage.getItem('apex_key');
        if (!apiKey) {
            alert("ACCESS_SIGNAL_MISSING: PLEASE LOGIN FIRST");
            return;
        }
        setSubscribing(true);
        try {
            await axios.post(`${MGT_URL}/api/${apiId}/subscribe`, {
                planId
            }, {
                headers: { 'X-API-Key': apiKey }
            });
            setShowPlans(false);
            navigate('/dashboard');
        } catch (err) {
            alert("SUBSCRIPTION_ENGINE_FAILURE");
        }
        setSubscribing(false);
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (loading) return (
        <div className="h-screen flex items-center justify-center bg-bg-deep">
            <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
        </div>
    );

    return (
        <div className="min-h-[calc(100vh-100px)] flex flex-col gap-8 pb-12">
            {/* Hero Section */}
            <div className="relative group">
                <div className="absolute inset-x-0 -top-40 h-80 bg-blue-600/10 blur-[120px] rounded-full -z-10" />

                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 px-4">
                    <div className="flex items-center gap-8">
                        <div className="w-24 h-24 bg-white/5 border border-white/10 rounded-[32px] flex items-center justify-center overflow-hidden p-4 group-hover:border-blue-500/30 transition duration-500">
                            {apiData?.logo_url ? (
                                <img src={apiData.logo_url} alt="Logo" className="w-full h-full object-contain" />
                            ) : (
                                <Terminal size={40} className="text-slate-600" />
                            )}
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center gap-4">
                                <h1 className="text-4xl font-black text-white italic tracking-tighter uppercase">{apiData?.name || 'API_NODE'}</h1>
                                <span className="bg-green-500/10 text-green-400 text-[10px] font-black px-3 py-1 rounded-full border border-green-500/30 uppercase tracking-widest">Stable</span>
                            </div>
                            <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-widest text-slate-500">
                                <span className="flex items-center gap-1.5"><ShieldCheck size={14} className="text-blue-500" /> Verified_Protocol</span>
                                <span className="flex items-center gap-1.5"><Zap size={14} className="text-yellow-500" /> &lt; 50ms Latency</span>
                                <span className="text-indigo-400">{apiData?.category}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setShowPlans(true)}
                            className="px-8 py-3.5 bg-indigo-600 text-white rounded-2xl font-black text-xs tracking-[0.2em] shadow-lg shadow-indigo-500/20 hover:bg-indigo-500 transition-all uppercase"
                        >
                            Subscribe_Access
                        </button>
                        <button className="p-3.5 bg-white/5 border border-white/5 rounded-2xl text-slate-400 hover:text-white transition">
                            <ExternalLink size={20} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Plan Selector Modal Overlay */}
            <AnimatePresence>
                {showPlans && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-xl"
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            className="glass max-w-4xl w-full p-10 rounded-[48px] border border-white/5 space-y-8 relative overflow-hidden"
                        >
                            <button onClick={() => setShowPlans(false)} className="absolute top-8 right-8 text-slate-500 hover:text-white transition">CLOSE [X]</button>
                            <header className="text-center space-y-2">
                                <h2 className="text-3xl font-black italic text-white tracking-tighter">SELECT_SERVICE_PROTOCOL</h2>
                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.3em]">Commit to a tier to initialize your node access</p>
                            </header>

                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                {plans.map((plan) => (
                                    <div key={plan.id} className="p-6 bg-white/5 rounded-[32px] border border-white/5 flex flex-col gap-6 hover:border-blue-500/30 transition group">
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">{plan.name}</p>
                                            <p className="text-2xl font-black text-white italic">${plan.price}<span className="text-[10px] text-slate-500 font-bold">/MO</span></p>
                                        </div>
                                        <ul className="space-y-3 flex-1">
                                            <li className="text-[10px] font-bold text-slate-400 flex items-center gap-2"><Check size={12} className="text-green-500" /> {plan.quota.toLocaleString()} Requests</li>
                                            <li className="text-[10px] font-bold text-slate-400 flex items-center gap-2"><Check size={12} className="text-green-500" /> Core_Gateway</li>
                                            <li className="text-[10px] font-bold text-slate-400 flex items-center gap-2"><Check size={12} className="text-green-500" /> {plan.price > 0 ? 'Priority_Support' : 'Standard_Sync'}</li>
                                        </ul>
                                        <button
                                            onClick={() => handleSubscribe(plan.id)}
                                            disabled={subscribing}
                                            className="w-full py-3 bg-white/5 border border-white/10 rounded-xl font-black text-[10px] tracking-widest uppercase hover:bg-blue-600 hover:text-white transition group-hover:border-transparent"
                                        >
                                            {subscribing ? 'Processing...' : 'ACTIVATE_NODE'}
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Navigation Tabs */}
            <div className="px-4 border-b border-white/5 flex gap-8">
                {[
                    { id: 'docs', label: 'Documentation', icon: FileText },
                    { id: 'interactive', label: 'Interactive Mirror', icon: Play },
                    { id: 'snippets', label: 'Code Hub', icon: Code2 },
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveMode(tab.id)}
                        className={`pb-4 text-[11px] font-black uppercase tracking-[0.3em] transition-all relative flex items-center gap-2
               ${activeMode === tab.id ? 'text-white' : 'text-slate-600 hover:text-slate-400'}`}
                    >
                        <tab.icon size={14} />
                        {tab.label}
                        {activeMode === tab.id && (
                            <motion.div layoutId="activeDocTab" className="absolute bottom-[-1px] left-0 right-0 h-0.5 bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                        )}
                    </button>
                ))}
            </div>

            {/* Content Area */}
            <div className="px-4 flex-1">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeMode}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="h-full"
                    >
                        {activeMode === 'docs' && (
                            <div className="max-w-4xl mx-auto glass p-10 rounded-[48px] border border-white/5 prose prose-invert prose-blue max-w-none">
                                <ReactMarkdown>{apiData?.readme_markdown || '# Welcome to Documentation\n\nNo extended documentation provided for this API yet.'}</ReactMarkdown>
                            </div>
                        )}

                        {activeMode === 'interactive' && (
                            <div className="max-w-6xl mx-auto glass rounded-[48px] overflow-hidden border border-white/5 bg-slate-900/50">
                                <div className="p-6 border-b border-white/5 bg-black/40 flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-3 h-3 rounded-full bg-red-500/50" />
                                        <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                                        <div className="w-3 h-3 rounded-full bg-green-500/50" />
                                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Interactive_Playground_v1.0</span>
                                    </div>
                                    <div className="text-[10px] font-black text-blue-400 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20 uppercase tracking-widest">
                                        Ready_for_Live_Testing
                                    </div>
                                </div>
                                <div className="swagger-dark p-4">
                                    {apiData?.openapi_spec ? (
                                        <SwaggerUI spec={apiData.openapi_spec} />
                                    ) : (
                                        <div className="h-64 flex flex-col items-center justify-center text-slate-600">
                                            <Play size={48} className="mb-4 opacity-20" />
                                            <p className="text-xs font-black uppercase tracking-widest">No OpenAPI Definition Found</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {activeMode === 'snippets' && (
                            <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
                                {/* Language List */}
                                <div className="glass p-6 rounded-[32px] border border-white/5 h-fit space-y-2">
                                    <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-6 pl-2">Available_Targets</h3>
                                    {snippets.map((snip, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => setSelectedSnippet(idx)}
                                            className={`w-full flex items-center justify-between px-5 py-4 rounded-2xl font-black text-xs transition-all duration-300
                            ${selectedSnippet === idx ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/20' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}
                                        >
                                            {snip.title.replace('_', ' ').toUpperCase()}
                                            {selectedSnippet === idx && <Zap size={14} className="animate-pulse" />}
                                        </button>
                                    ))}
                                </div>

                                {/* Code Display */}
                                <div className="md:col-span-2 space-y-6">
                                    <div className="glass rounded-[32px] border border-white/5 overflow-hidden">
                                        <div className="bg-black/40 px-6 py-4 border-b border-white/5 flex items-center justify-between">
                                            <span className="text-[10px] font-black text-blue-400 tracking-widest uppercase italic">{snippets[selectedSnippet]?.title} Code Payload</span>
                                            <button
                                                onClick={() => copyToClipboard(snippets[selectedSnippet]?.content)}
                                                className="flex items-center gap-2 group text-slate-500 hover:text-white transition"
                                            >
                                                {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} className="group-hover:scale-110 transition" />}
                                                <span className="text-[8px] font-black tracking-widest">{copied ? 'COPIED' : 'COPY_CODE'}</span>
                                            </button>
                                        </div>
                                        <pre className="p-8 font-mono text-xs text-indigo-300 leading-relaxed overflow-x-auto scrollbar-hide bg-slate-900/40 min-h-[400px]">
                                            <code>{snippets[selectedSnippet]?.content}</code>
                                        </pre>
                                    </div>

                                    <div className="p-8 bg-blue-600/5 rounded-[32px] border border-blue-500/10 flex items-center gap-6">
                                        <div className="w-12 h-12 bg-blue-600/20 rounded-2xl flex items-center justify-center text-blue-500">
                                            <Zap size={24} />
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-sm font-black text-white italic">INTEGRATION_HINT</p>
                                            <p className="text-[10px] text-slate-500 font-medium leading-relaxed">Ensure you have the required dependencies (axios, requests, etc.) installed in your local environment. API keys should be passed via the `X-API-KEY` header for all protected protocols.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>

            <style>{`
        /* Swagger UI Dark Mode Theme Overrides */
        .swagger-dark .swagger-ui {
          filter: invert(88%) hue-rotate(180deg) brightness(1.1) contrast(0.9);
        }
        .swagger-dark .info, .swagger-dark .scheme-container {
          display: none;
        }
        .swagger-dark .opblock-tag-section {
          background: transparent !important;
        }
      `}</style>
        </div>
    );
};

export default ApiDetails;
