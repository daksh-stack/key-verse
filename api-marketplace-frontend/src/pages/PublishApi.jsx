import { useState } from 'react';
import axios from 'axios';
import { Upload, FileJson, ArrowRight, Server, Plus, FileText, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const PublishApi = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Form State
    const [apiData, setApiData] = useState({
        name: '',
        base_url: '',
        description: '',
        logo_url: '',
        category: 'General',
        openapi_spec: null,
        pricing_tiers: [
            { name: 'BASIC', price: 0, quota: 5000 },
            { name: 'PRO', price: 29, quota: 50000 },
            { name: 'ENTERPRISE', price: 99, quota: 500000 }
        ]
    });

    const MGT_URL = import.meta.env.VITE_MANAGEMENT_URL;

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => setContent(event.target.result);
        reader.readAsText(file);
    };

    const parseSpec = async () => {
        if (!content.trim()) {
            setError("Please paste or upload a valid OpenAPI specification.");
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const token = JSON.parse(localStorage.getItem('user'))?.token;
            const res = await axios.post(`${MGT_URL}/apis/parse`, { content }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            setApiData({
                ...apiData,
                name: res.data.name || '',
                description: res.data.description || '',
                logo_url: res.data.logo_url || '',
                base_url: res.data.base_url || '',
                openapi_spec: res.data.openapi_spec
            });
            setStep(2);
        } catch (err) {
            setError(err.response?.data?.error || "Failed to parse specification.");
        } finally {
            setLoading(false);
        }
    };

    const handlePublish = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const token = JSON.parse(localStorage.getItem('user'))?.token;
            const res = await axios.post(`${MGT_URL}/apis/publish`, apiData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            navigate(`/studio/${res.data.apiId}`);
        } catch (err) {
            setError("Failed to publish API. Please try again.");
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-12 animate-fade-in pb-32">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <div className="flex items-center gap-3">
                        <Upload className="text-[#10b981]" size={28} />
                        <h1 className="text-3xl font-bold text-white tracking-tight">Publish API</h1>
                    </div>
                    <p className="text-zinc-500 font-medium text-sm mt-1">List your infrastructure on KeyVerse and monetize instantly.</p>
                </div>
                
                <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${step >= 1 ? 'bg-[#10b981]' : 'bg-white/10'}`} />
                    <div className={`w-8 h-1 rounded-full ${step >= 2 ? 'bg-[#10b981]' : 'bg-white/10'}`} />
                    <div className={`w-3 h-3 rounded-full ${step >= 2 ? 'bg-[#10b981]' : 'bg-white/10'}`} />
                </div>
            </header>

            <AnimatePresence mode="wait">
                {step === 1 && (
                    <motion.div 
                        initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                        className="bg-[#080808] border border-white/5 p-8 rounded-3xl shadow-2xl space-y-8"
                    >
                        <div>
                            <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                                <FileJson size={20} className="text-[#10b981]" /> Source Specification
                            </h2>
                            <p className="text-zinc-500 text-sm mt-1">Upload your OpenAPI 3.0 / Swagger JSON or YAML file to auto-generate your listing.</p>
                        </div>
                        
                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-xl text-sm font-bold">
                                {error}
                            </div>
                        )}

                        <div className="space-y-4">
                            <label className="border-2 border-dashed border-white/10 bg-white/5 hover:border-[#10b981]/50 hover:bg-[#10b981]/5 transition-all text-center p-12 rounded-2xl cursor-pointer flex flex-col items-center gap-4">
                                <div className="w-16 h-16 bg-[#10b981]/10 text-[#10b981] rounded-2xl flex items-center justify-center">
                                    <FileText size={32} />
                                </div>
                                <div>
                                    <span className="text-white font-bold block mb-1">Click to browse files</span>
                                    <span className="text-zinc-500 text-xs">Supports .json or .yaml</span>
                                </div>
                                <input type="file" accept=".json,.yaml,.yml" className="hidden" onChange={handleFileUpload} />
                            </label>
                            
                            <div className="relative flex items-center py-4">
                                <div className="flex-grow border-t border-white/10"></div>
                                <span className="flex-shrink-0 mx-4 text-xs font-black uppercase text-zinc-600 tracking-widest">OR PASTE RAW</span>
                                <div className="flex-grow border-t border-white/10"></div>
                            </div>

                            <textarea
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                placeholder="openapi: 3.0.0&#10;info:&#10;  title: Minimal API..."
                                className="w-full bg-black border border-white/10 rounded-2xl p-6 text-sm font-mono text-zinc-400 focus:outline-none focus:border-[#10b981] transition-colors h-64 resize-y"
                            />
                        </div>

                        <div className="flex justify-end">
                            <button 
                                onClick={parseSpec}
                                disabled={loading}
                                className="bg-white text-black px-8 py-4 rounded-2xl font-black text-sm hover:scale-105 active:scale-95 transition-all flex items-center gap-3 disabled:opacity-50"
                            >
                                {loading ? <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" /> : <>Parse Manifest <ArrowRight size={18} /></>}
                            </button>
                        </div>
                    </motion.div>
                )}

                {step === 2 && (
                    <motion.div 
                        initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                        className="bg-[#080808] border border-white/5 p-8 rounded-3xl shadow-2xl space-y-8"
                    >
                        <div>
                            <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                                <Server size={20} className="text-[#10b981]" /> Endpoint Configuration
                            </h2>
                            <p className="text-zinc-500 text-sm mt-1">Review the extracted metadata and finalize monetization parameters.</p>
                        </div>

                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-xl text-sm font-bold">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handlePublish} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest pl-1">Public Identifier</label>
                                    <input
                                        type="text"
                                        value={apiData.name}
                                        onChange={(e) => setApiData({...apiData, name: e.target.value})}
                                        className="w-full bg-black border border-white/5 p-4 rounded-2xl text-white text-sm focus:border-[#10b981] outline-none transition"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest pl-1">Target Category</label>
                                    <select
                                        value={apiData.category}
                                        onChange={(e) => setApiData({...apiData, category: e.target.value})}
                                        className="w-full bg-black border border-white/5 p-4 rounded-2xl text-white text-sm focus:border-[#10b981] outline-none transition appearance-none"
                                    >
                                        <option value="General">General Infrastructure</option>
                                        <option value="AI Models">AI & Machine Learning</option>
                                        <option value="Finance">Financial Technology</option>
                                        <option value="Data & Analytics">Data & Analytics</option>
                                        <option value="Blockchain">Blockchain & Web3</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest pl-1">Upstream URI</label>
                                    <input
                                        type="url"
                                        value={apiData.base_url}
                                        onChange={(e) => setApiData({...apiData, base_url: e.target.value})}
                                        className="w-full bg-black border border-white/5 p-4 rounded-2xl text-white text-sm focus:border-[#10b981] outline-none transition"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest pl-1">Logo URL (Optional)</label>
                                    <input
                                        type="url"
                                        value={apiData.logo_url}
                                        onChange={(e) => setApiData({...apiData, logo_url: e.target.value})}
                                        placeholder="https://..."
                                        className="w-full bg-black border border-white/5 p-4 rounded-2xl text-white text-sm focus:border-[#10b981] outline-none transition"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest pl-1">Platform Description</label>
                                <textarea
                                    value={apiData.description}
                                    onChange={(e) => setApiData({...apiData, description: e.target.value})}
                                    className="w-full bg-black border border-white/5 p-4 rounded-2xl text-white text-sm focus:border-[#10b981] outline-none transition h-32 resize-y"
                                />
                            </div>

                            <div className="pt-4 border-t border-white/5 space-y-4">
                                <h3 className="text-sm font-bold text-white flex items-center gap-2">Default Economics</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {apiData.pricing_tiers.map((tier, idx) => (
                                        <div key={idx} className="bg-black border border-white/5 p-4 rounded-2xl">
                                            <p className="text-[10px] text-[#10b981] font-black uppercase tracking-widest mb-2">{tier.name}</p>
                                            <div className="flex justify-between text-white text-sm mb-1">
                                                <span>Price:</span>
                                                <span className="font-mono">${tier.price}/mo</span>
                                            </div>
                                            <div className="flex justify-between text-zinc-500 text-xs">
                                                <span>Quota:</span>
                                                <span className="font-mono">{tier.quota.toLocaleString()}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="flex justify-end pt-4">
                                <button 
                                    type="button"
                                    onClick={() => setStep(1)}
                                    className="px-6 py-4 text-zinc-500 font-bold hover:text-white transition mr-4"
                                >
                                    Back
                                </button>
                                <button 
                                    type="submit"
                                    disabled={loading}
                                    className="bg-[#10b981] text-black px-8 py-4 rounded-2xl font-black text-sm hover:scale-105 active:scale-95 transition-all flex items-center gap-3 shadow-[0_0_20px_rgba(16,185,129,0.2)] disabled:opacity-50"
                                >
                                    {loading ? <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" /> : <>Finalize Publish <Check size={18} /></>}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default PublishApi;
