import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Cpu, Shield, ArrowRight, Zap, Mail, Lock } from 'lucide-react';
import { motion } from 'framer-motion';

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
            const res = await axios.post(url, { email, password });
            
            if (res.data.user?.api_key) {
                localStorage.setItem('apiKey', res.data.user.api_key);
                localStorage.setItem('user', JSON.stringify(res.data.user));
                navigate('/dashboard');
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Authentication failed');
        }
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center p-6 relative overflow-hidden">
            {/* Background Aesthetics */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-600/10 blur-[120px] -z-10 rounded-full" />
            
            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-md glass p-10 rounded-[40px] border border-white/5 relative z-10"
            >
                <header className="text-center space-y-4 mb-10">
                    <div className="mx-auto w-16 h-16 rounded-2xl bg-blue-600/20 flex items-center justify-center text-blue-400 border border-blue-500/20 shadow-[0_0_20px_rgba(37,99,235,0.2)]">
                        <Cpu size={32} />
                    </div>
                    <h1 className="text-3xl font-black text-white italic tracking-tighter">ACCESS_NODE_{mode.toUpperCase()}</h1>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em]">Authorize your protocols for the AI epoch</p>
                </header>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-2 flex items-center gap-2">
                            <Mail size={12} /> Identity_Email
                        </label>
                        <input 
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-black/40 border border-white/5 p-4 rounded-2xl text-white font-medium outline-none focus:ring-1 focus:ring-blue-500 transition"
                            placeholder="pilot@apexhub.io"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-2 flex items-center gap-2">
                            <Lock size={12} /> Secure_Encrypted_Key
                        </label>
                        <input 
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-black/40 border border-white/5 p-4 rounded-2xl text-white font-medium outline-none focus:ring-1 focus:ring-blue-500 transition"
                            placeholder="••••••••"
                        />
                    </div>

                    {error && (
                        <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="text-[10px] font-black text-red-400 text-center uppercase tracking-widest bg-red-500/5 py-3 rounded-xl border border-red-500/10">
                            {error}
                        </motion.div>
                    )}

                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black py-4 rounded-2xl shadow-lg shadow-blue-500/20 flex items-center justify-center gap-3 group transition"
                    >
                        {mode === 'login' ? 'INITIALIZE_SESSION' : 'REGISTER_PROTOCOL'}
                        <ArrowRight size={18} className="group-hover:translate-x-1 transition" />
                    </motion.button>
                </form>

                <footer className="mt-8 text-center">
                    <button 
                        onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
                        className="text-[10px] font-black text-slate-500 hover:text-blue-400 transition tracking-[0.2em] uppercase"
                    >
                        {mode === 'login' ? "Don't have a protocol? Register_Here" : "Existing Identity? Login_Here"}
                    </button>
                </footer>
            </motion.div>
        </div>
    );
};

export default Login;
