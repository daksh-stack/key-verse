import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Bell, User, Zap } from 'lucide-react';

const Navbar = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  return (
    <header className="h-16 border-b border-white/5 bg-[#050505]/80 backdrop-blur-md sticky top-0 z-40 px-6 flex items-center justify-between">
      {/* Search Bar */}
      <div className="flex-1 max-w-xl">
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-[#10b981] transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="Search APIs, documentation, or providers..." 
            className="w-full bg-[#0D0D0D] border border-white/5 rounded-full py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-[#10b981]/50 focus:bg-[#161616] transition-all"
          />
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-4">
        <button className="p-2 text-zinc-400 hover:text-white transition-colors relative">
          <Bell size={20} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-[#10b981] rounded-full border-2 border-[#050505]" />
        </button>
        
        <div className="h-8 w-px bg-white/5 mx-2" />

        <div className="flex items-center gap-3 pl-2">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium text-white">{user.email?.split('@')[0] || 'Guest'}</p>
            <p className="text-[10px] text-zinc-500 uppercase tracking-widest">{user.role || 'Explorer'}</p>
          </div>
          <button 
            onClick={() => navigate('/dashboard')}
            className="w-10 h-10 rounded-full bg-[#161616] border border-white/10 flex items-center justify-center hover:border-[#10b981]/50 transition-all text-zinc-400 hover:text-[#10b981]"
          >
            <User size={20} />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
