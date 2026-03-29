import { ArrowRight, Zap, ShieldCheck, Globe, Cpu, BarChart3, Lock } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const Marketing = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-[#050505] text-white selection:bg-[#10b981]/30">
            {/* Hero Section */}
            <section className="relative pt-32 pb-24 px-6 overflow-hidden">
                {/* Visual Atmosphere */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[800px] bg-gradient-to-b from-[#10b981]/5 to-transparent pointer-events-none" />
                <div className="absolute top-[20%] left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[#10b981]/5 blur-[120px] rounded-full pointer-events-none" />

                <div className="max-w-6xl mx-auto flex flex-col items-center text-center space-y-10 relative z-10">
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-[.3em] text-zinc-400"
                    >
                        <Zap size={12} className="text-[#10b981]" fill="#10b981" /> 
                        The Edge Runtime Intelligence
                    </motion.div>

                    <motion.h1 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.1 }}
                        className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.9] max-w-4xl"
                    >
                        Marketplace for <br/>
                        <span className=" bg-clip-text bg-gradient-to-r from-white to-zinc-500">Atomic APIs.</span>
                    </motion.h1>

                    <motion.p 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-zinc-500 text-lg md:text-xl max-w-2xl font-light leading-relaxed"
                    >
                        KeyVerse is a hyper-minimalist infrastructure hub. Compare performance, 
                        monetize endpoints, and scale with zero-latency overhead. 
                    </motion.p>

                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="flex flex-col sm:flex-row items-center gap-4 pt-6"
                    >
                        <Link to="/hub" className="px-10 py-5 bg-[#10b981] text-black font-black text-sm rounded-2xl hover:brightness-110 active:scale-95 transition-all shadow-2xl shadow-[#10b981]/20 flex items-center gap-3">
                            Enter Platform <ArrowRight size={18} />
                        </Link>
                        <Link to="/login" className="px-10 py-5 bg-white/5 border border-white/10 text-white font-bold text-sm rounded-2xl hover:bg-white/10 transition-all">
                            Partner Access
                        </Link>
                    </motion.div>
                </div>
            </section>

            {/* Feature Grid (The Pillars) */}
            <section className="py-24 px-6 border-t border-white/5 bg-[#080808]">
                <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
                    {[
                        { 
                            title: 'Infrastructure Integrity', 
                            desc: 'Every endpoint is backed by our sub-5ms proxy fabric with auto-healing capabilities.',
                            icon: ShieldCheck 
                        },
                        { 
                            title: 'Algorithmic Economy', 
                            desc: 'Real-time billing, automated quotas, and elastic pricing for global scale.',
                            icon: BarChart3 
                        },
                        { 
                            title: 'Zero-Trust Proxy', 
                            desc: 'Secure identity-node validation at every layer of the request lifecycle.',
                            icon: Lock 
                        }
                    ].map((feature, i) => (
                        <div key={i} className="group space-y-6">
                            <div className="w-14 h-14 rounded-2xl bg-[#0D0D0D] border border-white/5 flex items-center justify-center text-[#10b981] group-hover:bg-[#10b981]/10 group-hover:scale-110 transition-all duration-500">
                                <feature.icon size={28} />
                            </div>
                            <h3 className="text-xl font-bold tracking-tight">{feature.title}</h3>
                            <p className="text-zinc-500 font-light leading-relaxed text-sm">
                                {feature.desc}
                            </p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Mini Footer */}
            <footer className="py-12 border-t border-white/5 text-center">
                <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-[0.3em] italic">
                    Eclipse Design System • Powered by KeyVerse Edge
                </p>
            </footer>
        </div>
    );
};

export default Marketing;
