import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { HiMenuAlt3, HiX } from 'react-icons/hi';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  // 1. Detect Scroll
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 2. Close mobile menu on route change
  useEffect(() => setMobileMenuOpen(false), [location]);

  const isGlass = scrolled;

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Menu', path: '/menu' },
    { name: 'Reservation', path: '/reservation' },
    { name: 'Contact', path: '/contact' },
  ];

  return (
    <>
      {/* --- NAVBAR ITSELF --- */}
      <motion.nav 
        className={`fixed top-0 w-full z-50 transition-all duration-500 flex justify-between items-center px-6 md:px-12 ${
          isGlass 
            ? 'py-4 bg-cafe-900/40 backdrop-blur-md border-b border-white/10 shadow-sm' 
            : 'py-6 bg-transparent border-transparent'
        }`}
        initial={{ y: -100 }} animate={{ y: 0 }}
      >
        <Link to="/" className="text-2xl font-serif font-bold text-cafe-100 tracking-widest uppercase flex items-center gap-2 z-50">
          Demo <span className="text-cafe-500">Café</span>
        </Link>
        
        {/* Desktop Menu */}
        <div className="hidden md:flex gap-10 items-center">
          {navLinks.map((link) => (
            <Link 
              key={link.name} 
              to={link.path}
              className="relative group"
            >
              <span className={`font-sans text-xs uppercase tracking-[0.2em] transition-colors duration-300 ${
                location.pathname === link.path ? 'text-white font-bold' : 'text-cafe-200 group-hover:text-white'
              }`}>
                {link.name}
              </span>
              <span className={`absolute -bottom-2 left-0 h-[1px] bg-cafe-500 transition-all duration-300 ${
                 location.pathname === link.path ? 'w-full' : 'w-0 group-hover:w-full'
              }`}></span>
            </Link>
          ))}

          <Link to="/reservation" className="
              bg-cafe-500 text-white 
              px-7 py-3 rounded-sm 
              font-serif text-sm uppercase tracking-wider font-bold
              border border-cafe-500 
              hover:bg-cafe-600 hover:border-cafe-600 
              transition-all shadow-lg hover:shadow-cafe-500/30
          ">
            Book Table
          </Link>
        </div>

        {/* Mobile Toggle Button */}
        <button 
          className="md:hidden text-white text-2xl z-50 focus:outline-none"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <HiX /> : <HiMenuAlt3 />}
        </button>
      </motion.nav>

      {/* --- MOBILE MENU (Moved OUTSIDE the nav to fix the bug) --- */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            transition={{ type: "tween", duration: 0.4 }}
            // Added 'top-0' to ensure it starts at the very top of the screen
            className="fixed inset-0 top-0 left-0 bg-cafe-900/95 backdrop-blur-xl z-40 flex flex-col items-center justify-center gap-8 md:hidden"
          >
            {navLinks.map((link) => (
              <Link 
                key={link.name} 
                to={link.path}
                className="text-3xl font-serif text-white/90 hover:text-cafe-500 transition-colors"
              >
                {link.name}
              </Link>
            ))}
            <Link to="/reservation" className="mt-8 bg-cafe-500 text-white px-8 py-3 uppercase tracking-widest text-sm font-bold rounded-sm shadow-xl hover:bg-cafe-600 transition-all">
              Reserve Now
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;