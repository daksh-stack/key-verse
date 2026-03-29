import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Globe, 
  Terminal, 
  Settings, 
  User,
  ChevronLeft,
  ChevronRight,
  LogOut
} from 'lucide-react';
import { motion } from 'framer-motion';

const Sidebar = ({ isCollapsed, setIsCollapsed }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const menuItems = [
    { id: 'hub', label: 'API Hub', icon: Globe, path: '/' },
    { id: 'dashboard', label: 'Monitor', icon: LayoutDashboard, path: '/dashboard' },
    { id: 'studio', label: 'Studio', icon: Terminal, path: '/studio' },
  ];

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <motion.div 
      initial={false}
      animate={{ width: isCollapsed ? 64 : 240 }}
      className="h-screen bg-[#0D0D0D] border-r border-white/5 flex flex-col fixed left-0 top-0 z-50 overflow-hidden"
    >
      {/* Logo Section */}
      <div className="h-16 flex items-center px-4 border-b border-white/5 mb-4">
        <div className="w-8 h-8 rounded bg-[#10b981] flex-shrink-0 flex items-center justify-center font-bold text-black text-sm"> KV </div>
        {!isCollapsed && (
          <motion.span 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="ml-3 font-bold text-xl tracking-tight"
          >
            KeyVerse
          </motion.span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 space-y-1">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path || (item.id === 'hub' && location.pathname.startsWith('/api/'));
          
          // RBAC Check for Studio
          if (item.id === 'studio' && user.role !== 'provider') return null;

          return (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center p-3 rounded-lg transition-all group ${
                isActive 
                ? 'bg-[#10b981]/10 text-[#10b981]' 
                : 'text-zinc-500 hover:text-white hover:bg-white/5'
              }`}
            >
              <item.icon size={20} className={isActive ? 'text-[#10b981]' : ''} />
              {!isCollapsed && (
                <motion.span 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="ml-3 font-medium"
                >
                  {item.label}
                </motion.span>
              )}
              {isActive && !isCollapsed && (
                <motion.div layoutId="active-pill" className="ml-auto w-1 h-4 bg-[#10b981] rounded-full" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer / User Profile */}
      <div className="p-2 border-t border-white/5 space-y-1">
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="w-full flex items-center p-3 text-zinc-500 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
        >
          {isCollapsed ? <ChevronRight size={20} /> : <div className="flex items-center"><ChevronLeft size={20} /> <span className="ml-3">Collapse</span></div>}
        </button>
        
        <button 
          onClick={handleLogout}
          className="w-full flex items-center p-3 text-zinc-500 hover:text-red-400 hover:bg-red-400/5 rounded-lg transition-colors"
        >
          <LogOut size={20} />
          {!isCollapsed && <span className="ml-3 font-medium">Logout</span>}
        </button>
      </div>
    </motion.div>
  );
};

export default Sidebar;
