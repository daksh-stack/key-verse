import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import {
    Settings, FileJson, FileText, Share2, Users, DollarSign,
    Save, ChevronLeft, Upload, Eye, EyeOff, CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import LoadingSpinner from '../components/LoadingSpinner';

const Studio = () => {
    const { apiId } = useParams();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('general');
    const [apiData, setApiData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');

    const MGT_URL = import.meta.env.VITE_MANAGEMENT_URL;

    useEffect(() => {
        fetchApiData();
    }, [apiId]);

    const fetchApiData = async () => {
        try {
            setLoading(true);
            const [apiRes, plansRes] = await Promise.all([
                axios.get(`${MGT_URL}/studio/${apiId}`),
                axios.get(`${MGT_URL}/api/${apiId}/plans`)
            ]);
            setApiData({ ...apiRes.data, plans: plansRes.data });
        } catch (err) {
            console.error("Studio sync failed");
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <LoadingSpinner />;

    const handleSave = async () => {
        setSaving(true);
        try {
            await axios.patch(`${MGT_URL}/studio/${apiId}/${activeTab}`, apiData);
            setMessage('SYNC_SUCCESSFUL');
            setTimeout(() => setMessage(''), 3000);
        } catch (err) {
            alert("PATCH_REJECTED");
        }
        setSaving(false);
    };

    const tabs = [
        { id: 'general', name: 'General', icon: Settings },
        { id: 'definitions', name: 'Definitions', icon: FileJson },
        { id: 'docs', name: 'Docs', icon: FileText },
        { id: 'gateway', name: 'Gateway', icon: Share2 },
        { id: 'community', name: 'Community', icon: Users },
        { id: 'monetize', name: 'Monetize', icon: DollarSign },
    ];

    if (loading) return (
        <div className="h-screen flex items-center justify-center bg-bg-deep">
            <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
        </div>
    );

    return (
        <div className="h-[calc(100vh-120px)] flex flex-col gap-6 overflow-hidden">
            {/* Header Info */}
            <div className="flex items-center justify-between px-4">
                <div className="flex items-center gap-6">
                    <button
                        onClick={() => navigate('/my-apis')}
                        className="p-3 bg-white/5 border border-white/5 rounded-2xl text-slate-400 hover:text-white hover:bg-white/10 transition"
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-3xl font-black italic tracking-tighter text-white uppercase">{apiData?.name || 'STUDIO_NODE'}</h1>
                            <span className="text-[10px] bg-indigo-600/20 text-indigo-400 px-2 py-0.5 rounded-full font-black border border-indigo-500/30">v1.2.0</span>
                        </div>
                        <p className="text-xs font-bold text-slate-500 tracking-[0.2em] uppercase">Deployment Area: <span className="text-blue-500 uppercase">{apiData?.category}</span></p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <AnimatePresence>
                        {message && (
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className="flex items-center gap-2 text-green-400 text-xs font-black tracking-widest"
                            >
                                <CheckCircle2 size={16} /> {message}
                            </motion.div>
                        )}
                    </AnimatePresence>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex items-center gap-2 bg-blue-600 text-white px-8 py-3 rounded-xl font-black text-sm shadow-lg shadow-blue-500/20 hover:bg-blue-500 transition disabled:opacity-30"
                    >
                        {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save size={18} />}
                        COMMIT_CHANGES
                    </button>
                </div>
            </div>

            <div className="flex-1 flex gap-6 px-4 overflow-hidden">
                {/* Sidebar Tabs */}
                <div className="w-64 glass p-4 rounded-[32px] flex flex-col gap-2 h-fit">
                    {tabs.map(tab => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl font-black text-xs tracking-widest transition duration-300 relative overflow-hidden group
                  ${isActive ? 'text-white' : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'}`}
                            >
                                {isActive && <div className="absolute inset-0 bg-blue-600/10 border-l-4 border-blue-500" />}
                                <Icon size={18} className={isActive ? 'text-blue-400' : 'text-slate-600 group-hover:text-slate-400'} />
                                {tab.name.toUpperCase()}
                            </button>
                        );
                    })}
                </div>

                {/* Content Area */}
                <div className="flex-1 glass p-8 rounded-[40px] overflow-auto scrollbar-hide">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                            className="h-full"
                        >
                            {activeTab === 'general' && (
                                <div className="max-w-3xl space-y-8">
                                    <header className="space-y-2">
                                        <h2 className="text-2xl font-black text-white italic">GENERAL_CONFIGURATION</h2>
                                        <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Global metadata and visibility settings</p>
                                    </header>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Display Name</label>
                                            <input
                                                type="text"
                                                value={apiData?.name || ''}
                                                onChange={(e) => setApiData({ ...apiData, name: e.target.value })}
                                                className="w-full bg-black/40 border border-white/5 p-4 rounded-2xl text-white font-mono text-xs focus:ring-1 focus:ring-blue-500 outline-none transition"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Category Registry</label>
                                            <select
                                                value={apiData?.category || 'General'}
                                                onChange={(e) => setApiData({ ...apiData, category: e.target.value })}
                                                className="w-full bg-black/40 border border-white/5 p-4 rounded-2xl text-white font-mono text-xs focus:ring-1 focus:ring-blue-500 outline-none transition uppercase"
                                            >
                                                <option value="AI">Artificial Intelligence</option>
                                                <option value="DATA">Data Processing</option>
                                                <option value="FINANCE">Finance & Payments</option>
                                                <option value="NETWORK">Network Services</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Logo Provider URL</label>
                                        <input
                                            type="text"
                                            value={apiData?.logo_url || ''}
                                            onChange={(e) => setApiData({ ...apiData, logo_url: e.target.value })}
                                            placeholder="https://images.cyber/logo.png"
                                            className="w-full bg-black/40 border border-white/5 p-4 rounded-2xl text-white font-mono text-xs focus:ring-1 focus:ring-blue-500 outline-none transition"
                                        />
                                    </div>
                                    <div className="flex items-center gap-6 p-6 bg-white/2 rounded-3xl border border-white/5">
                                        <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                                            {apiData?.visibility?.status === 'public' ? <Eye className="text-blue-500" /> : <EyeOff className="text-slate-500" />}
                                        </div>
                                        <div>
                                            <p className="text-sm font-black text-white italic">INDEX_VISIBILITY</p>
                                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Public endpoints appear in the global fabric search.</p>
                                        </div>
                                        <button
                                            onClick={() => setApiData({ ...apiData, visibility: { status: apiData.visibility?.status === 'public' ? 'private' : 'public' } })}
                                            className={`ml-auto px-6 py-2 rounded-xl text-[10px] font-black tracking-widest transition duration-300
                          ${apiData?.visibility?.status === 'public' ? 'bg-green-600/20 text-green-400 border border-green-500/30' : 'bg-slate-700/20 text-slate-400 border border-slate-500/30'}`}
                                        >
                                            {apiData?.visibility?.status?.toUpperCase()}
                                        </button>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'definitions' && (
                                <div className="h-full flex flex-col gap-6">
                                    <header className="space-y-2">
                                        <h2 className="text-2xl font-black text-white italic">FABRIC_DEFINITIONS</h2>
                                        <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Upload OpenAPI-compatible interface structures (JSON)</p>
                                    </header>
                                    <div className="flex-1 bg-black/40 rounded-3xl border border-white/5 p-8 flex flex-col items-center justify-center text-center space-y-6">
                                        <div className="w-20 h-20 bg-blue-600/10 rounded-[32px] flex items-center justify-center border border-blue-500/20 text-blue-500">
                                            <Upload size={40} />
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-lg font-black text-white italic underline decoration-blue-500">INIT_UPLOADER</p>
                                            <p className="text-xs text-slate-500 font-medium">Drop your <code className="bg-white/5 px-2 py-0.5 rounded">swagger.json</code> or <code className="bg-white/5 px-2 py-0.5 rounded">openapi.json</code> here.</p>
                                        </div>
                                        <textarea
                                            className="w-full h-64 bg-slate-900/50 border border-white/5 rounded-2xl p-6 font-mono text-[10px] text-blue-400 outline-none focus:ring-1 focus:ring-blue-500"
                                            placeholder='{"openapi": "3.0.0", ...}'
                                            value={JSON.stringify(apiData?.openapi_spec || {}, null, 2)}
                                            onChange={(e) => {
                                                try {
                                                    setApiData({ ...apiData, openapi_spec: JSON.parse(e.target.value) });
                                                } catch (err) { }
                                            }}
                                        />
                                    </div>
                                </div>
                            )}

                            {activeTab === 'docs' && (
                                <div className="h-full flex flex-col gap-6">
                                    <header className="space-y-2">
                                        <h2 className="text-2xl font-black text-white italic">DOCS_REPRESENTATION</h2>
                                        <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Interactive Markdown environment for consumer onboarding</p>
                                    </header>
                                    <div className="flex-1 grid grid-cols-2 gap-6 overflow-hidden">
                                        <textarea
                                            className="h-full bg-black/40 border border-white/5 rounded-3xl p-6 font-mono text-xs text-slate-300 outline-none focus:ring-1 focus:ring-indigo-500 resize-none"
                                            value={apiData?.readme_markdown || ''}
                                            onChange={(e) => setApiData({ ...apiData, readme_markdown: e.target.value })}
                                            placeholder="# Heading... \n\nDescribe your API protocols here."
                                        />
                                        <div className="h-full bg-white/2 border border-white/5 rounded-3xl p-8 overflow-auto prose prose-invert prose-sm max-w-none">
                                            <ReactMarkdown>{apiData?.readme_markdown || '*Documentation payload empty. Initializing...*'}</ReactMarkdown>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'gateway' && (
                                <div className="max-w-4xl space-y-10">
                                    <header className="space-y-2">
                                        <h2 className="text-2xl font-black text-white italic">GATEWAY_STRATEGY</h2>
                                        <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Architect latency thresholds, mocking nodes, and transformation rules</p>
                                    </header>
                                    {/* Deployment Topology Control */}
                                    <div className="p-8 bg-white/2 rounded-[40px] border border-white/5 space-y-8">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-2xl bg-orange-600/20 flex items-center justify-center text-orange-400">
                                                    <Share2 size={24} />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-black text-white italic">DEPLOYMENT_TOPOLOGY</p>
                                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Select how your protocol is served to consumers</p>
                                                </div>
                                            </div>
                                            <div className="flex bg-black/40 p-1 rounded-xl border border-white/5">
                                                {['hosted', 'hybrid'].map(mode => (
                                                    <button
                                                        key={mode}
                                                        onClick={() => setApiData({ ...apiData, deployment_type: mode })}
                                                        className={`px-6 py-2 rounded-lg text-[10px] font-black tracking-widest transition-all
                                                            ${(apiData.deployment_type || 'hosted') === mode ? 'bg-orange-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                                                    >
                                                        {mode.toUpperCase()}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {apiData.deployment_type === 'hybrid' && (
                                            <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6">
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">External Gateway Endpoint</label>
                                                    <input
                                                        type="text"
                                                        placeholder="https://my-gateway.workers.dev"
                                                        value={apiData.external_gateway_url || ''}
                                                        onChange={(e) => setApiData({ ...apiData, external_gateway_url: e.target.value })}
                                                        className="w-full bg-black/40 border border-white/5 p-4 rounded-2xl text-orange-400 font-mono text-xs outline-none focus:ring-1 focus:ring-orange-500"
                                                    />
                                                </div>

                                                <div className="p-6 bg-orange-600/5 border border-orange-500/10 rounded-3xl space-y-4">
                                                    <div className="flex items-center justify-between">
                                                        <p className="text-[10px] font-black text-white italic uppercase tracking-widest">Serverless Edge Guide (Cloudflare Workers)</p>
                                                        <button
                                                            className="text-[9px] font-black text-orange-400 hover:underline"
                                                            onClick={() => {
                                                                const code = `export default { 
  async fetch(request, env) {
    const response = await fetch("${apiData.target_url}", request);
    // Push Analytics to ApexHub
    await fetch("${import.meta.env.VITE_MANAGEMENT_URL}/api/analytics/push", {
        method: "POST",
        body: JSON.stringify({ apiKey: request.headers.get("X-API-KEY"), apiId: "${apiId}", usageCount: 1 })
    });
    return response;
  }
}`;
                                                                navigator.clipboard.writeText(code);
                                                                alert("EDGE_CODE_COPIED");
                                                            }}
                                                        >
                                                            COPY_SNIPPET
                                                        </button>
                                                    </div>
                                                    <p className="text-[9px] text-slate-500 leading-relaxed font-bold uppercase">Deploy your own sub-millisecond gateway at the edge. ApexHub will still track your analytics and manage discovery.</p>
                                                </div>
                                            </motion.div>
                                        )}
                                    </div>

                                    {/* Mock Engine Control */}
                                    <div className="p-8 bg-white/2 rounded-[40px] border border-white/5 space-y-8">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 flex items-center justify-center text-indigo-400">
                                                    <Share2 size={24} />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-black text-white italic">MOCK_ENGINE_OVERRIDE</p>
                                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Serve sub-50ms simulated data for dev environments</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => setApiData({ ...apiData, mock_enabled: !apiData.mock_enabled })}
                                                className={`px-8 py-2 rounded-xl text-[10px] font-black tracking-[0.2em] transition-all
                                                    ${apiData.mock_enabled ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'bg-white/5 text-slate-500 border border-white/10'}`}
                                            >
                                                {apiData.mock_enabled ? 'ACTIVE_MIRROR' : 'OFFLINE_MODE'}
                                            </button>
                                        </div>

                                        {apiData.mock_enabled && (
                                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                                                <div className="flex items-center justify-between text-[10px] font-black text-slate-500 uppercase tracking-widest px-2">
                                                    <span>Mock Payload (JSON)</span>
                                                    <span className="text-indigo-400">Status: {apiData.mock_response?.status || 200}</span>
                                                </div>
                                                <div className="grid grid-cols-3 gap-6">
                                                    <div className="col-span-2">
                                                        <textarea
                                                            className="w-full h-48 bg-black/40 border border-white/5 rounded-3xl p-6 font-mono text-xs text-blue-400 outline-none focus:ring-1 focus:ring-indigo-500"
                                                            value={JSON.stringify(apiData.mock_response?.body || {}, null, 2)}
                                                            onChange={(e) => {
                                                                try {
                                                                    setApiData({ ...apiData, mock_response: { ...apiData.mock_response, body: JSON.parse(e.target.value) } });
                                                                } catch (err) { }
                                                            }}
                                                        />
                                                    </div>
                                                    <div className="space-y-4">
                                                        <input
                                                            type="number"
                                                            placeholder="Status (e.g. 200)"
                                                            value={apiData.mock_response?.status || 200}
                                                            onChange={(e) => setApiData({ ...apiData, mock_response: { ...apiData.mock_response, status: parseInt(e.target.value) } })}
                                                            className="w-full bg-black/40 border border-white/5 p-4 rounded-2xl text-white font-black text-center focus:ring-1 focus:ring-indigo-500 outline-none"
                                                        />
                                                        <div className="p-4 bg-yellow-500/5 border border-yellow-500/10 rounded-2xl">
                                                            <p className="text-[9px] text-yellow-500/70 font-bold leading-relaxed uppercase">Mock mode skips upstream calls. Ensure payload matches your schema for best results.</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}
                                    </div>

                                    {/* Dynamic Rules Control */}
                                    <div className="grid grid-cols-2 gap-8">
                                        {/* Transformations */}
                                        <div className="p-8 bg-white/2 rounded-[40px] border border-white/5 space-y-6">
                                            <div className="flex items-center gap-3">
                                                <Settings className="text-indigo-400" size={18} />
                                                <span className="text-[10px] font-black text-white italic uppercase tracking-[0.2em]">Rule_Transformation</span>
                                            </div>
                                            <div className="space-y-4">
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Request Headers (JSON)</label>
                                                    <textarea
                                                        placeholder='{"Authorization": "Bearer token"}'
                                                        className="w-full h-32 bg-black/40 border border-white/5 rounded-2xl p-4 font-mono text-[10px] text-slate-400 outline-none focus:ring-1 focus:ring-indigo-500"
                                                        value={JSON.stringify(apiData.gateway_config?.transformations?.request || {}, null, 2)}
                                                        onChange={(e) => {
                                                            try {
                                                                setApiData({ ...apiData, gateway_config: { ...apiData.gateway_config, transformations: { ...apiData.gateway_config.transformations, request: JSON.parse(e.target.value) } } });
                                                            } catch (err) { }
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Performance Config */}
                                        <div className="p-8 bg-white/2 rounded-[40px] border border-white/5 space-y-6">
                                            <div className="flex items-center gap-3">
                                                <Zap className="text-yellow-500" size={18} />
                                                <span className="text-[10px] font-black text-white italic uppercase tracking-[0.2em]">Latency_Threshold</span>
                                            </div>
                                            <div className="space-y-6">
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Target Timeout (ms)</label>
                                                    <input
                                                        type="number"
                                                        value={apiData?.gateway_config?.timeout || 5000}
                                                        onChange={(e) => setApiData({ ...apiData, gateway_config: { ...apiData.gateway_config, timeout: parseInt(e.target.value) } })}
                                                        className="w-full bg-black/40 border border-white/5 p-4 rounded-2xl text-indigo-400 font-black focus:ring-1 focus:ring-indigo-500 outline-none transition"
                                                    />
                                                </div>
                                                <div className="p-4 bg-indigo-600/5 rounded-2xl border border-indigo-500/10">
                                                    <p className="text-[10px] text-slate-500 leading-relaxed font-bold uppercase">Requests exceeding this threshold will be terminated with a 504 Gateway Timeout status.</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'monetize' && (
                                <div className="max-w-4xl space-y-8">
                                    <header className="space-y-2">
                                        <h2 className="text-2xl font-black text-white italic">MONETIZATION_LAYER</h2>
                                        <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Select revenue model and define service quotas</p>
                                    </header>

                                    <div className="grid grid-cols-3 gap-6">
                                        {['free', 'freemium', 'paid'].map(mode => (
                                            <button
                                                key={mode}
                                                onClick={() => setApiData({ ...apiData, monetization: { ...apiData.monetization, mode } })}
                                                className={`p-6 rounded-[32px] border transition-all duration-500 text-left space-y-4
                            ${apiData?.monetization?.mode === mode ? 'bg-indigo-600/10 border-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.2)]' : 'bg-white/2 border-white/5 opacity-40 hover:opacity-100'}`}
                                            >
                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center 
                             ${apiData?.monetization?.mode === mode ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-500'}`}>
                                                    <DollarSign size={20} />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-black text-white italic uppercase tracking-tighter">{mode}</p>
                                                    <p className="text-[10px] text-slate-500 font-bold uppercase">{mode === 'free' ? 'Unlimited Access' : 'Tiered Access'}</p>
                                                </div>
                                            </button>
                                        ))}
                                    </div>

                                    {apiData?.monetization?.mode !== 'free' && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="p-8 bg-black/40 rounded-[40px] border border-white/5 space-y-6"
                                        >
                                            <div className="flex items-center justify-between">
                                                <h3 className="font-black text-white italic">PRICING_TIERS</h3>
                                                <button className="text-[10px] font-black text-indigo-400 tracking-widest uppercase">Registry: Synchronized</button>
                                            </div>
                                            <div className="space-y-4">
                                                <div className="grid grid-cols-4 gap-4 p-4 bg-white/2 rounded-2xl border border-white/5 items-center">
                                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Plan Name</span>
                                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Monthly Quota</span>
                                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Price Unit</span>
                                                    <span className="text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</span>
                                                </div>
                                                {apiData?.plans?.map((plan, idx) => (
                                                    <div key={idx} className="grid grid-cols-4 gap-4 p-5 bg-white/2 rounded-3xl border border-white/5 items-center group hover:bg-white/5 transition">
                                                        <span className="text-sm font-black text-white italic tracking-tighter uppercase">{plan.name}</span>
                                                        <span className="text-xs font-mono text-indigo-400">{plan.quota.toLocaleString()} REQ</span>
                                                        <span className="text-xs font-black text-white">${plan.price}</span>
                                                        <div className="text-right">
                                                            <div className="inline-block px-3 py-1 rounded-lg bg-green-500/10 text-green-400 text-[8px] font-black tracking-widest border border-green-500/20">ACTIVE</div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </motion.div>
                                    )}
                                </div>
                            )}

                            {activeTab === 'community' && (
                                <div className="h-full flex flex-col gap-6">
                                    <header className="space-y-2">
                                        <h2 className="text-2xl font-black text-white italic">SUBSCRIBER_FABRIC</h2>
                                        <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Manage active community and ecosystem consumers</p>
                                    </header>
                                    <div className="flex-1 bg-black/40 rounded-3xl border border-white/5 flex flex-col items-center justify-center opacity-40">
                                        <Users size={48} className="text-slate-700 mb-4" />
                                        <p className="text-[10px] font-black tracking-[0.4em] uppercase text-slate-600">Syncing with Community Node...</p>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default Studio;
