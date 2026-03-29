 
import {  } from 'framer-motion';
import { Cpu } from 'lucide-react';

const LoadingSpinner = () => {
    return (
        <div className="flex flex-col items-center justify-center min-h-[400px] space-y-6">
            <div className="relative">
                <div className="absolute inset-0 bg-blue-600 blur-2xl opacity-20 animate-pulse" />
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="relative bg-bg-card p-4 rounded-2xl border border-blue-500/30 text-blue-400 shadow-[0_0_20px_rgba(37,99,235,0.1)]"
                >
                    <Cpu size={32} />
                </motion.div>
            </div>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] animate-pulse">Syncing_Protocols...</p>
        </div>
    );
};

export default LoadingSpinner;
