import { useState } from 'react'; // 1. Import useState
import { Link, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  HiHome, 
  HiClipboardList, 
  HiCalendar, 
  HiMail, 
  HiLogout,
  HiExternalLink,
  HiMenu, // 2. Import Menu Icon for mobile trigger
  HiX     // 3. Import X Icon for closing sidebar
} from 'react-icons/hi';

const AdminLayout = () => {
  const { logout } = useAuth();
  const location = useLocation();
  
  // 4. State to control sidebar visibility on mobile
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const navItems = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: <HiHome /> },
    { name: 'Menu Manager', path: '/admin/menu', icon: <HiClipboardList /> },
    { name: 'Reservations', path: '/admin/reservations', icon: <HiCalendar /> },
    { name: 'Messages', path: '/admin/messages', icon: <HiMail /> },
  ];

  return (
    <div className="flex h-screen bg-gray-100 font-sans text-gray-900 relative">
      
      {/* 5. MOBILE BACKDROP 
        This darkens the background when the sidebar is open on mobile.
        Clicking it closes the sidebar.
      */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* 6. SIDEBAR LOGIC 
        - fixed inset-y-0 left-0: Fixes it to the left side on mobile.
        - z-30: Puts it above the backdrop.
        - transform & transition: Handles the sliding animation.
        - -translate-x-full: Hides it off-screen by default on mobile.
        - md:relative md:translate-x-0: On Desktop (md+), it becomes a normal block element (not fixed) and is always visible.
      */}
      <aside className={`
        fixed inset-y-0 left-0 z-30 w-64 bg-cafe-900 text-white flex flex-col shadow-xl transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        md:relative md:translate-x-0
      `}>
        
        {/* Brand */}
        <div className="h-20 flex items-center justify-between px-8 border-b border-white/10">
           <span className="font-serif text-2xl font-bold tracking-widest text-white">
             Demo <span className="text-cafe-500">Admin</span>
           </span>
           {/* Close Button (Mobile Only) */}
           <button 
             onClick={() => setIsSidebarOpen(false)} 
             className="md:hidden text-cafe-200 hover:text-white"
           >
             <HiX size={24} />
           </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-6 px-4 space-y-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                // Close sidebar when a link is clicked (Mobile UX)
                onClick={() => setIsSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-md transition-all duration-200 ${
                  isActive 
                    ? 'bg-cafe-500 text-white shadow-lg font-bold' 
                    : 'text-cafe-200 hover:bg-white/10 hover:text-white'
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                <span className="text-sm uppercase tracking-wider">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-white/10 space-y-2">
           <Link to="/" target="_blank" className="flex items-center gap-3 px-4 py-3 text-cafe-300 hover:text-white transition-colors">
             <HiExternalLink className="text-xl"/>
             <span className="text-xs font-bold uppercase tracking-widest">View Live Site</span>
           </Link>
           <button 
             onClick={logout} 
             className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-md transition-all"
           >
             <HiLogout className="text-xl"/>
             <span className="text-xs font-bold uppercase tracking-widest">Sign Out</span>
           </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">
         {/* Top Bar */}
         <header className="h-20 bg-white shadow-sm flex items-center justify-between px-4 md:px-8 z-10 shrink-0">
            
            <div className="flex items-center gap-4">
              {/* 7. HAMBURGER BUTTON 
                 Only visible on Mobile (md:hidden)
              */}
              <button 
                onClick={() => setIsSidebarOpen(true)}
                className="md:hidden text-gray-600 hover:text-cafe-600 p-2 rounded-md focus:outline-none"
              >
                <HiMenu size={28} />
              </button>

              <h2 className="text-xl font-bold text-gray-800 uppercase tracking-wide truncate">
                {navItems.find(i => i.path === location.pathname)?.name || 'Dashboard'}
              </h2>
            </div>

            <div className="flex items-center gap-4">
               <span className="hidden md:inline text-sm text-gray-500">Welcome, <strong>Admin</strong></span>
               <div className="w-10 h-10 bg-cafe-100 rounded-full flex items-center justify-center text-cafe-600 font-bold border border-cafe-200">
                 A
               </div>
            </div>
         </header>

         {/* Page Content Renders Here */}
         {/* Added overflow-y-auto here to ensure only this part scrolls, not the header */}
         <div className="flex-1 overflow-y-auto p-4 md:p-8">
            <Outlet /> 
         </div>
      </main>

    </div>
  );
};

export default AdminLayout;