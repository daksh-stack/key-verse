import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Globe, 
  Terminal, 
  ChevronLeft,
  ChevronRight,
  LogOut,
  Zap
} from 'lucide-react';
import { motion } from 'framer-motion';

const Sidebar = ({ isCollapsed, setIsCollapsed }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const menuItems = [
    { id: 'hub', label: 'Infrastructure Hub', icon: Globe, path: '/hub' },
    { id: 'dashboard', label: 'Node Analytics', icon: LayoutDashboard, path: '/dashboard' },
    { id: 'studio', label: 'Provider Studio', icon: Terminal, path: '/studio' },
  ];

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('apiKey');
    navigate('/');
  };

  return (
    <motion.div 
      initial={false}
      animate={{ width: isCollapsed ? 64 : 260 }}
      className="h-screen bg-[#080808] border-r border-white/5 flex flex-col fixed left-0 top-0 z-[110] overflow-hidden shadow-2xl"
    >
      {/* SaaS Branding */}
      <div className="h-16 flex items-center px-4 border-b border-white/5 mb-6">
        <div className="w-8 h-8 rounded-lg bg-[#10b981]/10 flex-shrink-0 flex items-center justify-center text-[#10b981] border border-[#10b981]/20"> 
            <Zap size={16} fill="currentColor" />
        </div>
        {!isCollapsed && (
          <motion.span 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="ml-3 font-black text-lg tracking-tighter text-white uppercase italic"
          >
            KeyVerse
          </motion.span>
        )}
      </div>

      {/* Navigation Ecosystem */}
      <nav className="flex-1 px-3 space-y-2">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path || (item.id === 'hub' && location.pathname.startsWith('/api/'));
          
          // RBAC: Hide Studio if not a provider
          if (item.id === 'studio' && user.role !== 'provider') return null;
          // Hide Dashboard for anonymous users
          if (item.id === 'dashboard' && !user.api_key) return null;

          return (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center p-3.5 rounded-xl transition-all group ${
                isActive 
                ? 'bg-[#10b981]/10 text-[#10b981] shadow-inner border border-[#10b981]/10' 
                : 'text-zinc-500 hover:text-white hover:bg-white/5'
              }`}
            >
              <item.icon size={20} className={isActive ? 'text-[#10b981]' : 'group-hover:text-white transition-colors'} />
              {!isCollapsed && (
                <motion.span 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="ml-4 text-xs font-bold uppercase tracking-widest"
                >
                  {item.label}
                </motion.span>
              )}
              {isActive && !isCollapsed && (
                <div className="ml-auto w-1 h-5 bg-[#10b981] rounded-full shadow-[0_0_10px_#10b981]" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Persistence Controls */}
      <div className="p-3 border-t border-white/5 space-y-2">
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="w-full flex items-center p-3 text-zinc-600 hover:text-white transition-colors"
        >
          {isCollapsed ? <ChevronRight size={20} /> : <div className="flex items-center gap-4"><ChevronLeft size={18} /> <span className="text-[10px] font-bold uppercase tracking-widest">Collapse Node</span></div>}
        </button>
        
        {user.api_key && (
            <button 
                onClick={handleLogout}
                className="w-full flex items-center p-3 text-zinc-600 hover:text-red-400 hover:bg-red-400/5 rounded-xl transition-all"
            >
                <LogOut size={18} />
                {!isCollapsed && <span className="ml-4 text-[10px] font-bold uppercase tracking-widest">Terminate Session</span>}
            </button>
        )}
      </div>
    </motion.div>
  );
};

export default Sidebar;
