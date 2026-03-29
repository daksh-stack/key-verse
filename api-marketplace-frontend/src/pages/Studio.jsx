import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import {
    Settings, FileJson, FileText, Share2, Users, DollarSign,
    Save, ChevronLeft, Upload, Eye, EyeOff, CheckCircle2, Trash2, PlusCircle, Layout, Globe
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

    const fetchApiData = async () => {
        try {
            setLoading(true);
            const [apiRes, plansRes] = await Promise.all([
                axios.get(`${MGT_URL}/studio/${apiId}`),
                axios.get(`${MGT_URL}/api/${apiId}/plans`)
            ]);
            setApiData({ ...apiRes.data, plans: plansRes.data });
        } catch (error) {
            console.error("Studio sync failed", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await axios.patch(`${MGT_URL}/studio/${apiId}/${activeTab}`, apiData);
            setMessage('Changes Synced');
            setTimeout(() => setMessage(''), 3000);
        } catch (error) {
            console.error(error);
        }
        setSaving(false);
    };

    const handleDeletePlan = async (planId) => {
        if (!confirm("Delete this pricing tier permanently?")) return;
        try {
            await axios.delete(`${MGT_URL}/plans/${planId}`);
            setApiData(prev => ({ ...prev, plans: prev.plans.filter(p => p.id !== planId) }));
        } catch (error) {
            console.error(error);
        }
    };

    const handleAddPlan = async () => {
        const name = prompt("Tier Name (e.g. Pro, Ultra)");
        const quota = prompt("Monthly Quota (calls)");
        const price = prompt("Price (USD)");
        const type = prompt("Type (standard/pay_per_use)", "standard");
        
        if (!name || !quota || !price) return;

        try {
            const res = await axios.post(`${MGT_URL}/api/${apiId}/plans`, { 
                name, quota: parseInt(quota), price: parseFloat(price), type 
            });
            setApiData(prev => ({ ...prev, plans: [...(prev.plans || []), res.data] }));
        } catch (error) {
            console.error(error);
        }
    };

    const tabs = [
        { id: 'general', name: 'General', icon: Settings },
        { id: 'definitions', name: 'Definitions', icon: FileJson },
        { id: 'docs', name: 'Documentation', icon: FileText },
        { id: 'gateway', name: 'Gateway', icon: Globe },
        { id: 'community', name: 'Subscribers', icon: Users },
        { id: 'monetize', name: 'Monetize', icon: DollarSign },
    ];

    if (loading) return (
        <div className="h-[60vh] flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-[#10b981]/30 border-t-[#10b981] rounded-full animate-spin" />
        </div>
    );

    return (
        <div className="animate-fade-in space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                    <button onClick={() => navigate('/dashboard')} className="p-2 text-zinc-500 hover:text-white transition">
                        <ChevronLeft size={24} />
                    </button>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-bold text-white tracking-tight">{apiData?.name}</h1>
                            <span className="text-[10px] bg-white/5 text-zinc-500 px-2 py-0.5 rounded border border-white/5 uppercase font-bold tracking-widest">Studio 1.0</span>
                        </div>
                        <p className="text-xs text-zinc-500 mt-1 uppercase tracking-widest font-medium">Provider Console</p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <AnimatePresence>
                        {message && (
                            <motion.span initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="text-[#10b981] text-xs font-bold">
                                {message}
                            </motion.span>
                        )}
                    </AnimatePresence>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="bg-[#10b981] text-black px-6 py-2.5 rounded-xl font-bold text-sm hover:brightness-110 transition disabled:opacity-50 flex items-center gap-2"
                    >
                        {saving ? <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" /> : <Save size={18} />}
                        Save Changes
                    </button>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Secondary Sidebar (Tabs) */}
                <div className="lg:w-64 space-y-1">
                    {tabs.map(tab => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all
                                    ${isActive 
                                        ? 'bg-[#10b981]/10 text-[#10b981]' 
                                        : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/5'}`}
                            >
                                <Icon size={18} />
                                {tab.name}
                            </button>
                        );
                    })}
                </div>

                {/* Tab Content */}
                <div className="flex-1 bg-[#0D0D0D] border border-white/5 rounded-2xl p-8 min-h-[500px]">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                            className="space-y-8"
                        >
                            {activeTab === 'general' && (
                                <div className="max-w-2xl space-y-6">
                                    <h3 className="text-lg font-bold text-white">General Configuration</h3>
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] text-zinc-500 uppercase font-black tracking-widest">Public Name</label>
                                            <input
                                                type="text"
                                                value={apiData?.name || ''}
                                                onChange={(e) => setApiData({ ...apiData, name: e.target.value })}
                                                className="w-full bg-black border border-white/5 p-3 rounded-xl text-white text-sm focus:border-[#10b981] transition-all"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] text-zinc-500 uppercase font-black tracking-widest">Category</label>
                                            <select
                                                value={apiData?.category || 'General'}
                                                onChange={(e) => setApiData({ ...apiData, category: e.target.value })}
                                                className="w-full bg-black border border-white/5 p-3 rounded-xl text-white text-sm focus:border-[#10b981] outline-none"
                                            >
                                                <option value="AI">AI & ML</option>
                                                <option value="DATA">Data & Analytics</option>
                                                <option value="FINANCE">Finance</option>
                                                <option value="NETWORK">Networking</option>
                                                <option value="General">General</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] text-zinc-500 uppercase font-black tracking-widest">Icon URL</label>
                                        <input
                                            type="text"
                                            value={apiData?.logo_url || ''}
                                            onChange={(e) => setApiData({ ...apiData, logo_url: e.target.value })}
                                            className="w-full bg-black border border-white/5 p-3 rounded-xl text-white text-sm"
                                        />
                                    </div>
                                    <div className="flex items-center justify-between p-6 bg-white/5 rounded-2xl border border-white/5">
                                        <div>
                                            <p className="font-bold text-white">Marketplace Visibility</p>
                                            <p className="text-xs text-zinc-500">Public APIs are discoverable in the global hub.</p>
                                        </div>
                                        <button
                                            onClick={() => setApiData({ ...apiData, visibility: { status: apiData.visibility?.status === 'public' ? 'private' : 'public' } })}
                                            className={`px-6 py-2 rounded-lg text-xs font-bold transition-all
                                                ${apiData?.visibility?.status === 'public' ? 'bg-[#10b981]/20 text-[#10b981]' : 'bg-white/5 text-zinc-500'}`}
                                        >
                                            {apiData?.visibility?.status === 'public' ? 'Public' : 'Private'}
                                        </button>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'definitions' && (
                                <div className="space-y-6">
                                    <h3 className="text-lg font-bold text-white">Interface Definition</h3>
                                    <div className="bg-black border border-white/5 rounded-xl p-4">
                                        <textarea
                                            className="w-full h-80 bg-transparent font-mono text-[11px] text-[#10b981]/80 outline-none resize-none"
                                            value={JSON.stringify(apiData?.openapi_spec || {}, null, 2)}
                                            onChange={(e) => {
                                                try { setApiData({ ...apiData, openapi_spec: JSON.parse(e.target.value) }); } catch(err){}
                                            }}
                                        />
                                    </div>
                                </div>
                            )}

                            {activeTab === 'docs' && (
                                <div className="grid grid-cols-2 gap-8 h-[500px]">
                                    <div className="space-y-4 flex flex-col">
                                        <h3 className="text-lg font-bold text-white">Markdown Source</h3>
                                        <textarea
                                            className="flex-1 w-full bg-black border border-white/5 p-6 rounded-xl font-mono text-xs text-zinc-400 focus:border-[#10b981] outline-none resize-none"
                                            value={apiData?.readme_markdown || ''}
                                            onChange={(e) => setApiData({ ...apiData, readme_markdown: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-4 flex flex-col">
                                        <h3 className="text-lg font-bold text-white">Live Render</h3>
                                        <div className="flex-1 bg-white/5 p-6 rounded-xl border border-white/5 overflow-auto prose prose-invert prose-emerald min-w-full">
                                            <ReactMarkdown>{apiData?.readme_markdown || '*No documentation provided.*'}</ReactMarkdown>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'gateway' && (
                                <div className="max-w-3xl space-y-10">
                                    <div className="p-6 rounded-2xl bg-white/5 border border-white/5 space-y-6">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="font-bold text-white uppercase text-sm tracking-tight">Relay Strategy</p>
                                                <p className="text-xs text-zinc-500 mt-1">Configure how traffic should reach your upstream.</p>
                                            </div>
                                            <div className="flex p-1 bg-black rounded-lg border border-white/5">
                                                {['hosted', 'hybrid'].map(m => (
                                                    <button 
                                                        key={m}
                                                        onClick={() => setApiData({...apiData, deployment_type: m})}
                                                        className={`px-4 py-1.5 rounded-md text-[10px] font-bold transition-all
                                                            ${(apiData.deployment_type || 'hosted') === m ? 'bg-[#10b981] text-black' : 'text-zinc-500 hover:text-zinc-300'}`}
                                                    >
                                                        {m.toUpperCase()}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                        {apiData.deployment_type === 'hybrid' && (
                                            <div className="space-y-2 pt-4 border-t border-white/5">
                                                <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">External Gateway URL</label>
                                                <input 
                                                    type="text" 
                                                    className="w-full bg-black border border-white/5 p-3 rounded-lg text-xs text-[#10b981] font-mono"
                                                    value={apiData.external_gateway_url || ''}
                                                    onChange={e => setApiData({...apiData, external_gateway_url: e.target.value})}
                                                />
                                            </div>
                                        )}
                                    </div>

                                    <div className="p-6 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between">
                                        <div>
                                            <p className="font-bold text-white uppercase text-sm">Response Mocking</p>
                                            <p className="text-xs text-zinc-500 mt-1">Return static mock responses instead of calling target.</p>
                                        </div>
                                        <button 
                                            onClick={() => setApiData({...apiData, mock_enabled: !apiData.mock_enabled})}
                                            className={`px-6 py-2 rounded-lg text-xs font-bold transition-all border
                                                ${apiData.mock_enabled ? 'bg-[#10b981] text-black border-[#10b981]' : 'bg-transparent text-zinc-500 border-white/10'}`}
                                        >
                                            {apiData.mock_enabled ? 'Active' : 'Disabled'}
                                        </button>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'monetize' && (
                                <div className="space-y-8">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-lg font-bold text-white">Pricing Tiers</h3>
                                        <button onClick={handleAddPlan} className="bg-white/5 border border-white/10 text-white px-4 py-2 rounded-xl text-[10px] font-bold tracking-widest hover:bg-[#10b981] hover:text-black transition-all">
                                            NEW_TIER +
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {apiData?.plans?.map(plan => (
                                            <div key={plan.id} className="p-6 rounded-2xl bg-white/2 border border-white/5 flex items-center justify-between group hover:bg-[#10b981]/5 hover:border-[#10b981]/30 transition-all">
                                                <div className="flex gap-10">
                                                    <div>
                                                        <p className="text-xs font-black text-zinc-500 uppercase">{plan.name}</p>
                                                        <p className="text-xl font-bold text-white mt-1 italic">${plan.price}<span className="text-[10px] text-zinc-600 block">per month</span></p>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-black text-zinc-500 uppercase">Quota</p>
                                                        <p className="text-lg font-mono text-[#10b981] mt-1">{plan.quota.toLocaleString()}</p>
                                                    </div>
                                                </div>
                                                <button onClick={() => handleDeletePlan(plan.id)} className="p-2 text-zinc-700 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all">
                                                    <Trash2 size={20} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {activeTab === 'community' && (
                              <div className="h-64 flex flex-col items-center justify-center text-zinc-800 italic">
                                  <Users size={48} className="mb-4 opacity-10" />
                                  <p className="text-xs font-bold uppercase tracking-widest">Active Subscriber Insights Coming Soon</p>
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
