import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Shield, ArrowRight, Mail, Lock, Key } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Login = () => {
    const navigate = useNavigate();
    const [mode, setMode] = useState('login'); // 'login' or 'signup'
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const MGT_URL = import.meta.env.VITE_MANAGEMENT_URL;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const url = mode === 'login' ? `${MGT_URL}/users/login` : `${MGT_URL}/users/signup`;
            const res = await axios.post(url, { email, password, role: 'consumer' });
            
            if (res.data.user?.api_key) {
                localStorage.setItem('user', JSON.stringify(res.data.user));
                navigate('/dashboard');
            }
        } catch (error) {
            setError(error.response?.data?.error || 'Access Denied: Invalid Credentials');
        }
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center p-6 bg-[#050505] relative overflow-hidden">
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md bg-[#0D0D0D] border border-white/5 p-12 rounded-3xl relative z-10 shadow-2xl"
            >
                <header className="text-center space-y-4 mb-10">
                    <div className="mx-auto w-14 h-14 rounded-2xl bg-[#10b981]/10 flex items-center justify-center text-[#10b981] border border-[#10b981]/20">
                        <Shield size={28} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-white tracking-tight">Identity Vault</h1>
                        <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-[0.2em] mt-1">KeyVerse Authentication Protocol</p>
                    </div>
                </header>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest pl-1 flex items-center gap-2">
                            <Mail size={12} /> Email Address
                        </label>
                        <input 
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-black border border-white/5 p-4 rounded-xl text-white text-sm outline-none focus:border-[#10b981] transition-all"
                            placeholder="name@company.com"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest pl-1 flex items-center gap-2">
                            <Lock size={12} /> Passkey
                        </label>
                        <input 
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-black border border-white/5 p-4 rounded-xl text-white text-sm outline-none focus:border-[#10b981] transition-all"
                            placeholder="••••••••"
                        />
                    </div>

                    <AnimatePresence>
                        {error && (
                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="text-[10px] font-bold text-red-500 text-center uppercase tracking-widest bg-red-500/5 py-3 rounded-lg border border-red-500/10">
                                {error}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <button
                        type="submit"
                        className="w-full bg-[#10b981] text-black font-bold py-4 rounded-xl hover:brightness-110 transition flex items-center justify-center gap-3 shadow-lg shadow-[#10b981]/10"
                    >
                        {mode === 'login' ? 'Authorize Session' : 'Initialize Protocol'}
                        <ArrowRight size={18} />
                    </button>
                </form>

                <footer className="mt-10 text-center border-t border-white/5 pt-6">
                    <button 
                        onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
                        className="text-[10px] font-bold text-zinc-500 hover:text-white transition tracking-widest uppercase"
                    >
                        {mode === 'login' ? "New Identity? Register Here" : "Existing Node? Authorize Here"}
                    </button>
                </footer>
            </motion.div>
        </div>
    );
};

export default Login;
