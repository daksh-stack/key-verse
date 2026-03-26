import { useState, useEffect } from 'react';
import axios from 'axios';
import { Key, Activity, Send, Terminal, LogOut, Zap, Clock, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import LoadingSpinner from '../components/LoadingSpinner';

const Dashboard = () => {
    const [apiKey, setApiKey] = useState(localStorage.getItem('apex_key') || '');
    const [stats, setStats] = useState(null);
    const [apis, setApis] = useState([]);
    const [selectedApiId, setSelectedApiId] = useState('');
    const [testResult, setTestResult] = useState(null);
    const [loading, setLoading] = useState(true);

    const MGT_URL = import.meta.env.VITE_MANAGEMENT_URL;
    const PROXY_URL = import.meta.env.VITE_PROXY_URL;

    useEffect(() => {
        setLoading(true);
        axios.get(`${MGT_URL}/apis`).then(res => setApis(res.data)).finally(() => setLoading(false));
        if (apiKey) fetchStats(apiKey);
    }, [apiKey]);

    const fetchStats = async (key) => {
        try {
            setLoading(true);
            const res = await axios.get(`${MGT_URL}/stats/${key}`);
            setStats(res.data);
        } catch (err) {
            console.error("Stats sync failed");
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <LoadingSpinner />;

    const handleSignup = async () => {
        const email = prompt("ENTER EMAIL IDENTIFIER");
        const password = prompt("ESTABLISH PASSWORD");
        if (!email || !password) return;

        try {
            const res = await axios.post(`${MGT_URL}/users/signup`, { email, password, role: 'consumer' });
            const newKey = res.data.user.api_key;
            setApiKey(newKey);
            localStorage.setItem('apex_key', newKey);
        } catch (err) {
            alert("REGISTRATION REJECTED");
        }
    };

    const testProxy = async () => {
        if (!apiKey || !selectedApiId) return;
        setLoading(true);
        setTestResult(null);
        try {
            const res = await axios.get(`${PROXY_URL}/proxy/${selectedApiId}/todos/1`, {
                headers: { 'X-API-Key': apiKey }
            });
            setTestResult(res.data);
            fetchStats(apiKey);
        } catch (err) {
            setTestResult({ status: 'ERROR', message: err.response?.data?.error || "RUNTIME_FAILURE" });
        }
        setLoading(false);
    };

    return (
        <div className="h-[calc(100vh-120px)] flex flex-col gap-6 overflow-hidden">
            {/* Top Bar / Account Summary */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 px-4">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-blue-600/20 flex items-center justify-center border border-blue-500/30">
                        <Terminal size={24} className="text-blue-400" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black italic tracking-tighter text-white">CONTROL_PLANE</h1>
                        <p className="text-xs font-bold text-slate-500 tracking-[0.3em] uppercase">Status: <span className="text-green-500 animate-pulse">Online</span> • Registry: Central</p>
                    </div>
                </div>

                {!apiKey ? (
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleSignup}
                        className="bg-blue-600 text-white px-8 py-3 rounded-xl font-black text-sm shadow-lg shadow-blue-500/20 border-b-4 border-blue-800 hover:border-b-0 hover:translate-y-1 transition-all"
                    >
                        INITIALIZE ACCESS KEY
                    </motion.button>
                ) : (
                    <div className="flex items-center gap-4 bg-white/5 border border-white/5 p-2 pr-6 rounded-2xl">
                        <div className="p-2 bg-slate-900 rounded-xl font-mono text-[10px] text-slate-400 tracking-tight max-w-[200px] truncate border border-white/10">
                            {apiKey}
                        </div>
                        <button
                            onClick={() => { localStorage.clear(); setApiKey(''); }}
                            className="text-slate-500 hover:text-red-400 p-2 transition duration-300"
                        >
                            <LogOut size={18} />
                        </button>
                    </div>
                )}
            </div>

            {/* Main Grid */}
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-6 px-4 overflow-hidden">
                {/* Left Panel: Analytics */}
                <div className="lg:col-span-1 flex flex-col gap-6 overflow-hidden">
                    <div className="glass p-6 rounded-[32px] space-y-6">
                        <h2 className="text-sm font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
                            <Activity size={14} className="text-blue-500" /> PROTOCOL_HEALTH
                        </h2>

                        {stats?.subscriptions?.length > 0 ? (
                            <div className="space-y-6 overflow-auto max-h-[400px] pr-2 scrollbar-hide">
                                {stats.subscriptions.map((sub, idx) => {
                                    const percent = Math.min((sub.usage / sub.quota) * 100, 100);
                                    return (
                                        <motion.div
                                            key={idx}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            className="p-5 bg-white/2 rounded-[32px] border border-white/5 space-y-4 hover:bg-white/5 transition group"
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="space-y-1">
                                                    <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">{sub.api_name}</p>
                                                    <p className="text-[9px] font-bold text-slate-500 uppercase">{sub.plan_name} NODE</p>
                                                </div>
                                                <div className="relative w-10 h-10">
                                                    <svg className="w-full h-full -rotate-90">
                                                        <circle cx="20" cy="20" r="18" fill="none" stroke="currentColor" strokeWidth="3" className="text-white/5" />
                                                        <motion.circle
                                                            cx="20" cy="20" r="18" fill="none" stroke="currentColor" strokeWidth="3"
                                                            strokeDasharray={113}
                                                            strokeDashoffset={113 - (113 * percent) / 100}
                                                            className="text-blue-500"
                                                        />
                                                    </svg>
                                                    <div className="absolute inset-0 flex items-center justify-center text-[8px] font-black text-white">
                                                        {Math.round(percent)}%
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-end justify-between">
                                                <div>
                                                    <p className="text-xl font-black text-white italic tracking-tighter">{sub.usage.toLocaleString()}</p>
                                                    <p className="text-[8px] font-bold text-slate-600 uppercase tracking-widest">Calls_Executed</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-xs font-black text-slate-400">{(sub.quota - sub.usage).toLocaleString()}</p>
                                                    <p className="text-[8px] font-bold text-slate-600 uppercase tracking-widest">Left_This_Month</p>
                                                </div>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="text-center py-10 flex flex-col items-center gap-4 opacity-30">
                                <Zap size={32} className="text-slate-700" />
                                <p className="text-[10px] font-black uppercase tracking-[0.2em]">Searching for active sync...</p>
                            </div>
                        )}
                    </div>

                    <div className="glass p-6 rounded-[32px] flex-1 space-y-4">
                        <h2 className="text-sm font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
                            <ShieldCheck size={14} className="text-green-500" /> ACTIVE_PROTOCOLS
                        </h2>
                        <div className="space-y-3">
                            {['OAuth 2.1', 'JWT Verification', 'Rate Limiting'].map(proto => (
                                <div key={proto} className="p-3 bg-white/2 rounded-xl border border-white/5 text-[10px] font-black text-slate-400 flex items-center justify-between group hover:border-blue-500/30 transition">
                                    {proto.toUpperCase()}
                                    <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Panel: Terminal / Playground */}
                <div className="lg:col-span-3 glass p-8 rounded-[40px] flex flex-col gap-6 overflow-hidden">
                    <div className="flex items-center justify-between border-b border-white/5 pb-6">
                        <div className="space-y-1">
                            <h2 className="text-xl font-black italic text-white tracking-tight">RUNTIME_PLAYGROUND</h2>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Execute requests directly through the Proxy Fabric</p>
                        </div>
                        <select
                            value={selectedApiId}
                            onChange={(e) => setSelectedApiId(e.target.value)}
                            className="bg-slate-900 border border-white/10 text-[11px] font-black px-4 py-2 rounded-xl text-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500 transition"
                        >
                            <option value="">SELECT ENDPOINT...</option>
                            {apis.map(api => (
                                <option key={api.id} value={api.id}>{api.name.toUpperCase()}</option>
                            ))}
                        </select>
                    </div>

                    <div className="flex-1 flex flex-col gap-4 overflow-hidden relative">
                        <button
                            onClick={testProxy}
                            disabled={loading || !selectedApiId || !apiKey}
                            className="bg-white/5 hover:bg-white/10 border border-white/10 text-white py-4 rounded-2xl font-black text-sm tracking-[0.2em] transition duration-300 disabled:opacity-20 flex items-center justify-center gap-3 group"
                        >
                            {loading ? (
                                <Zap className="animate-spin text-blue-500" size={18} />
                            ) : (
                                <><Send size={16} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition duration-300" /> EXECUTE_CALL_v1.0</>
                            )}
                        </button>

                        <div className="flex-1 bg-black/40 rounded-3xl border border-white/5 p-6 font-mono text-[11px] overflow-auto relative shadow-inner">
                            <div className="absolute top-4 right-4 text-[9px] font-black text-slate-700 tracking-widest uppercase">Response Terminal</div>
                            <AnimatePresence mode="wait">
                                {testResult ? (
                                    <motion.pre
                                        key="result"
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className="text-blue-400/90 whitespace-pre-wrap leading-relaxed"
                                    >
                                        <span className="text-slate-600 italic">// Request successful at {new Date().toLocaleTimeString()}</span>
                                        <br />
                                        {JSON.stringify(testResult, null, 2)}
                                    </motion.pre>
                                ) : (
                                    <motion.div
                                        key="placeholder"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 0.2 }}
                                        className="h-full flex items-center justify-center italic text-slate-500"
                                    >
                                        IDLE: System waiting for execution command...
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
