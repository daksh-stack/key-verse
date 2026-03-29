import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import { motion } from 'framer-motion';

const Layout = () => {
    const [isCollapsed, setIsCollapsed] = useState(false);

    return (
        <div className="min-h-screen bg-[#050505] text-white flex">
            {/* Sidebar */}
            <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

            {/* Main Content Area */}
            <motion.div 
                animate={{ marginLeft: isCollapsed ? 64 : 260 }}
                className="flex-1 flex flex-col min-h-screen transition-all duration-300 relative"
            >
                <div className="h-16" /> {/* Spacer for fixed Navbar */}
                <Navbar />
                <main className="p-8 max-w-[1600px] mx-auto w-full animate-fade-in">
                    <Outlet />
                </main>
            </motion.div>
        </div>
    );
};

export default Layout;
