import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, User, LogOut, LayoutGrid, Zap, Layers, BarChart2, Menu } from 'lucide-react';
import { motion } from 'framer-motion';

const Navbar = ({ isCollapsed, setIsCollapsed }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const user = JSON.parse(localStorage.getItem('user'));

    const handleLogout = () => {
        localStorage.removeItem('user');
        localStorage.removeItem('apiKey');
        navigate('/');
    };

    // Don't show regular navbar on Marketing page
    if (location.pathname === '/') return null;

    return (
        <nav className="fixed top-0 left-0 right-0 h-16 bg-[#050505]/80 backdrop-blur-xl border-b border-white/5 z-[100] px-6">
            <div className="max-w-[1600px] h-full mx-auto flex items-center justify-between">
                <div className="flex items-center gap-8">
                    <div className="flex items-center gap-4">
                        {setIsCollapsed && (
                            <button 
                                onClick={() => setIsCollapsed(!isCollapsed)}
                                className="md:hidden p-2 text-zinc-400 hover:text-white transition"
                            >
                                <Menu size={20} />
                            </button>
                        )}
                        <Link to="/" className="flex items-center gap-2 group">
                            <div className="w-8 h-8 rounded-lg bg-[#10b981]/10 flex items-center justify-center text-[#10b981] border border-[#10b981]/20 group-hover:bg-[#10b981] group-hover:text-black transition-all">
                                <Zap size={18} fill="currentColor" />
                            </div>
                            <span className="text-white font-black tracking-tighter text-lg italic hidden sm:block">KEYVERSE</span>
                        </Link>
                    </div>

                    {/* <div className="hidden md:flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/5">
                        <Link 
                            to="/hub" 
                            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
                                location.pathname === '/hub' ? 'bg-white/10 text-[#10b981]' : 'text-zinc-500 hover:text-white'
                            }`}
                        >
                            <Layers size={14} /> Market Hub
                        </Link>
                        {user && (
                            <Link 
                                to="/dashboard" 
                                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
                                    location.pathname === '/dashboard' ? 'bg-white/10 text-[#10b981]' : 'text-zinc-500 hover:text-white'
                                }`}
                            >
                                <BarChart2 size={14} /> Node Analytics
                            </Link>
                        )}
                    </div> */}

                    {/* this was the extra on the navbar */}

                </div>

                <div className="flex items-center gap-4">
                    {user ? (
                        <div className="flex items-center gap-5">
                            <div className="hidden sm:flex flex-col items-end">
                                <span className="text-[10px] text-zinc-400 font-bold tracking-tight">{user.email}</span>
                                <span className="text-[10px] text-[#10b981] font-black uppercase tracking-widest">{user.role} mode</span>
                            </div>
                            <button 
                                onClick={handleLogout}
                                className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-zinc-400 hover:text-red-400 hover:bg-red-400/10 transition-all"
                            >
                                <LogOut size={18} />
                            </button>
                        </div>
                    ) : (
                        <Link to="/login" className="px-5 py-2.5 bg-[#10b981] text-black font-black text-xs rounded-xl hover:brightness-110 transition-all shadow-lg shadow-[#10b981]/10 flex items-center gap-2">
                             Authorize <User size={14} />
                        </Link>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
