import { Link, useLocation } from 'react-router-dom';
import { Shield, Cpu, Activity, User, Home } from 'lucide-react';
import { motion } from 'framer-motion';

const Navbar = () => {
    const location = useLocation();

    const navLinks = [
        { name: 'Dashboard', path: '/dashboard', icon: Activity },
        { name: 'Provider', path: '/my-apis', icon: Shield },
    ];

    return (
        <nav className="glass sticky top-0 z-50 px-6 py-4">
            <div className="max-w-7xl mx-auto flex justify-between items-center">
                {/* Logo Section */}
                <Link to="/" className="flex items-center gap-3 group">
                    <div className="relative">
                        <div className="absolute inset-0 bg-blue-500 blur-lg opacity-40 group-hover:opacity-100 transition duration-500 rounded-full" />
                        <div className="relative bg-bg-card p-2 rounded-xl border border-blue-500/30">
                            <Cpu className="text-blue-400 w-6 h-6 group-hover:scale-110 transition duration-300" />
                        </div>
                    </div>
                    <span className="text-2xl font-bold tracking-tighter neon-text bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                        APEX<span className="text-blue-500">HUB</span>
                    </span>
                </Link>

                {/* Navigation Links */}
                <div className="hidden md:flex items-center gap-1 bg-white/5 p-1 rounded-2xl border border-white/5">
                    {navLinks.map((link) => {
                        const isActive = location.pathname === link.path;
                        const Icon = link.icon;

                        return (
                            <Link
                                key={link.path}
                                to={link.path}
                                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-all duration-300 relative group
                  ${isActive ? 'text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                            >
                                {isActive && (
                                    <motion.div
                                        layoutId="nav-bg"
                                        className="absolute inset-0 bg-blue-600 rounded-xl -z-10 shadow-[0_0_15px_rgba(37,99,235,0.4)]"
                                        transition={{ type: "spring", bounce: 0.25, duration: 0.5 }}
                                    />
                                )}
                                <Icon size={18} className={isActive ? 'text-white' : 'text-slate-400 group-hover:text-blue-400'} />
                                {link.name}
                            </Link>
                        );
                    })}
                </div>

                {/* User / Action Profile */}
                <div className="flex items-center gap-4">
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => navigate(localStorage.getItem('apiKey') ? '/dashboard' : '/login')}
                        className="flex items-center gap-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-2.5 rounded-xl text-sm font-black shadow-lg shadow-blue-500/20"
                    >
                        <User size={18} />
                        <span>{localStorage.getItem('apiKey') ? 'USER_CONSOLE' : 'ACCESS_PULSE'}</span>
                    </motion.button>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
