import { useState, useEffect } from 'react';
import axios from 'axios';
import { Key, Activity, Send, Terminal, Zap, Clock, ShieldCheck, Box, ExternalLink, Copy, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Dashboard = () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const [stats, setStats] = useState(null);
    const [apis, setApis] = useState([]);
    const [selectedApiId, setSelectedApiId] = useState('');
    const [testResult, setTestResult] = useState(null);
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState(false);

    const MGT_URL = import.meta.env.VITE_MANAGEMENT_URL;
    const PROXY_URL = import.meta.env.VITE_PROXY_URL;

    useEffect(() => {
        fetchInitialData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const fetchInitialData = async () => {
        try {
            setLoading(true);
            const apisRes = await axios.get(`${MGT_URL}/apis/public`);
            setApis(apisRes.data);
            if (user.api_key) {
                const statsRes = await axios.get(`${MGT_URL}/stats/${user.api_key}`);
                setStats(statsRes.data);
            }
        } catch (error) {
            console.error("Dashboard sync failed");
        } finally {
            setLoading(false);
        }
    };

    const testProxy = async () => {
        if (!user.api_key || !selectedApiId) return;
        setLoading(true);
        try {
            const res = await axios.get(`${PROXY_URL}/proxy/${selectedApiId}/todos/1`, {
                headers: { 'X-API-Key': user.api_key }
            });
            setTestResult(res.data);
            // Refresh stats
            const statsRes = await axios.get(`${MGT_URL}/stats/${user.api_key}`);
            setStats(statsRes.data);
        } catch (error) {
            setTestResult({ error: error.response?.data?.error || "Upstream Failure" });
        }
        setLoading(false);
    };

    const copyKey = () => {
        navigator.clipboard.writeText(user.api_key);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (loading && !stats) return (
        <div className="h-[60vh] flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-[#10b981]/30 border-t-[#10b981] rounded-full animate-spin" />
        </div>
    );

    return (
        <div className="animate-fade-in space-y-8">
            {/* Top Stat Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-[#0D0D0D] border border-white/5 p-6 rounded-2xl space-y-4">
                    <div className="flex items-center gap-3 text-zinc-500 text-xs font-bold uppercase tracking-widest">
                        <Activity size={14} className="text-[#10b981]" /> Total Requests
                    </div>
                    <p className="text-4xl font-bold text-white tracking-tighter">
                        {stats?.totalUsage?.toLocaleString() || 0}
                    </p>
                    <div className="text-[10px] text-zinc-600 flex items-center gap-1">
                        <Zap size={10} className="text-[#10b981]" /> All Subscribed Nodes
                    </div>
                </div>

                <div className="bg-[#0D0D0D] border border-white/5 p-6 rounded-2xl space-y-4">
                    <div className="flex items-center gap-3 text-zinc-500 text-xs font-bold uppercase tracking-widest">
                        <Box size={14} className="text-[#10b981]" /> Active Subscriptions
                    </div>
                    <p className="text-4xl font-bold text-white tracking-tighter">
                        {stats?.subscriptions?.length || 0}
                    </p>
                    <div className="text-[10px] text-zinc-600 flex items-center gap-1">
                        <ShieldCheck size={10} className="text-[#10b981]" /> KeyVerse Verified
                    </div>
                </div>

                <div className="bg-[#0D0D0D] border border-white/5 p-6 rounded-2xl space-y-4">
                    <div className="flex items-center gap-3 text-zinc-500 text-xs font-bold uppercase tracking-widest">
                        <Key size={14} className="text-[#10b981]" /> Identity Key
                    </div>
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex-1 bg-black border border-white/5 px-4 py-2 rounded text-[10px] font-mono text-zinc-500 truncate">
                            {user.api_key || 'NO_KEY_ESTABLISHED'}
                        </div>
                        <button onClick={copyKey} className="p-2 text-zinc-500 hover:text-white transition">
                            {copied ? <Check size={16} className="text-[#10b981]" /> : <Copy size={16} />}
                        </button>
                    </div>
                    <div className="text-[10px] text-zinc-600">Global Secret • Do Not Share</div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Usage Detail Table */}
                <div className="lg:col-span-2 space-y-6">
                    <h3 className="text-lg font-bold text-white tracking-tight">Infrastructure Usage</h3>
                    <div className="bg-[#0D0D0D] border border-white/5 rounded-2xl overflow-hidden">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-white/5 bg-white/2">
                                    <th className="px-6 py-4 text-[10px] uppercase font-black tracking-widest text-zinc-500">Node Destination</th>
                                    <th className="px-6 py-4 text-[10px] uppercase font-black tracking-widest text-zinc-500 text-right">Consumption</th>
                                    <th className="px-6 py-4 text-[10px] uppercase font-black tracking-widest text-zinc-500 text-right">Threshold</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {stats?.subscriptions?.map((sub, idx) => (
                                    <tr key={idx} className="hover:bg-white/2 transition-colors group">
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-2 h-2 rounded-full bg-[#10b981]" />
                                                <div>
                                                    <p className="text-sm font-semibold text-white">{sub.api_name}</p>
                                                    <p className="text-[10px] text-zinc-600 uppercase font-bold tracking-tight">{sub.plan_name} Plan</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-right">
                                            <span className="text-sm font-mono text-zinc-300">{sub.usage.toLocaleString()} req</span>
                                        </td>
                                        <td className="px-6 py-5 text-right w-48">
                                            <div className="flex flex-col items-end gap-1.5">
                                                <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                                                    <div 
                                                        className="h-full bg-[#10b981] transition-all duration-1000" 
                                                        style={{ width: `${Math.min((sub.usage / sub.quota) * 100, 100)}%` }}
                                                    />
                                                </div>
                                                <span className="text-[9px] font-bold text-zinc-600 tracking-tighter uppercase">{Math.round((sub.usage / sub.quota) * 100)}% Used</span>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {(!stats?.subscriptions || stats.subscriptions.length === 0) && (
                            <div className="py-20 text-center opacity-30 italic text-sm text-zinc-500">
                                No active intelligence nodes found.
                            </div>
                        )}
                    </div>
                </div>

                {/* Runtime Console */}
                <div className="space-y-6">
                    <h3 className="text-lg font-bold text-white tracking-tight">Runtime Terminal</h3>
                    <div className="bg-[#0D0D0D] border border-white/5 rounded-2xl p-6 space-y-6 sticky top-24">
                        <div className="space-y-4">
                            <select 
                                value={selectedApiId}
                                onChange={(e) => setSelectedApiId(e.target.value)}
                                className="w-full bg-black border border-white/5 p-3 rounded-xl text-xs text-zinc-400 focus:border-[#10b981] outline-none"
                            >
                                <option value="">Select Target Node...</option>
                                {apis.map(api => (
                                    <option key={api.id} value={api.id}>{api.name}</option>
                                ))}
                            </select>
                            
                            <button 
                                onClick={testProxy}
                                disabled={loading || !selectedApiId}
                                className="w-full py-3 bg-white/5 border border-white/10 text-white rounded-xl text-xs font-bold hover:bg-[#10b981] hover:text-black hover:border-transparent transition-all flex items-center justify-center gap-2"
                            >
                                {loading ? <Zap size={14} className="animate-spin text-[#10b981]" /> : <><Send size={14} /> Execute Call</>}
                            </button>
                        </div>

                        <div className="bg-black rounded-xl border border-white/5 overflow-hidden h-64 flex flex-col font-mono text-[10px]">
                            <div className="p-3 bg-white/5 border-b border-white/5 text-zinc-600 uppercase font-black tracking-widest">
                                Response Buffer
                            </div>
                            <div className="flex-1 p-4 overflow-auto scrollbar-hide">
                                <AnimatePresence mode="wait">
                                    {testResult ? (
                                        <motion.pre initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[#10b981]/80 whitespace-pre-wrap">
                                            {JSON.stringify(testResult, null, 2)}
                                        </motion.pre>
                                    ) : (
                                        <div className="h-full flex items-center justify-center text-zinc-800 italic">
                                            Waiting for data...
                                        </div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
