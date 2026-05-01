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
            <div 
                className={`flex-1 flex flex-col min-h-screen transition-all duration-300 relative ${isCollapsed ? 'md:ml-16' : 'md:ml-[260px]'}`}
            >
                <div className="h-16" /> {/* Spacer for fixed Navbar */}
                <Navbar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
                <main className="p-4 md:p-8 max-w-[1600px] mx-auto w-full animate-fade-in overflow-x-hidden">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default Layout;
