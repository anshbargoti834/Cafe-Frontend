import { useEffect, useState, useMemo, memo, useRef } from 'react';
import { endpoints } from '../services/api';
import { MenuItem } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import PageHeader from '../components/PageHeader';
import { HiChevronLeft, HiChevronRight } from 'react-icons/hi'; 

const API_BASE_URL = 'http://localhost:4000'; 
const ITEMS_PER_PAGE = 9; 

// --- HELPER: Image URL ---
const getImageUrl = (imagePath: string) => {
  if (!imagePath) return '';
  if (imagePath.startsWith('http')) return imagePath;
  let cleanPath = imagePath.replace(/\\/g, '/');
  if (!cleanPath.startsWith('/')) cleanPath = `/${cleanPath}`;
  return `${API_BASE_URL}${encodeURI(cleanPath)}`;
};

// --- OPTIMIZED CARD ---
const MenuCard = memo(({ item }: { item: MenuItem }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }} 
      animate={{ opacity: 1, scale: 1 }} 
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3 }}
      style={{ contentVisibility: 'auto', containIntrinsicSize: '0 400px' }}
      className={`bg-white p-5 shadow-2xl border-t-4 rounded-sm transition-all duration-300 relative overflow-hidden group ${
        !item.isAvailable 
          ? 'border-gray-300 opacity-75 grayscale' 
          : 'border-cafe-500 hover:-translate-y-2'
      }`}
    >
      <div className="h-48 overflow-hidden mb-5 bg-cafe-100 relative rounded-sm">
        {item.image ? (
          <img 
            src={getImageUrl(item.image)} 
            alt={item.name} 
            decoding="async" 
            crossOrigin="anonymous" 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
            onError={(e) => {
              (e.target as HTMLImageElement).src = "https://www.transparenttextures.com/patterns/stardust.png"; 
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-cafe-300 italic font-serif">Image coming soon</div>
        )}
        {!item.isAvailable && (
          <div className="absolute inset-0 bg-black/50 z-20 flex items-center justify-center backdrop-blur-[1px]">
            <span className="border-2 border-white text-white px-4 py-1 font-bold uppercase tracking-[0.2em] transform -rotate-12 text-sm shadow-lg">Sold Out</span>
          </div>
        )}
        {item.isAvailable && item.category === 'Special' && (
          <div className="absolute top-2 right-2 bg-cafe-500 text-white text-xs px-2 py-1 uppercase tracking-wider shadow-md z-10">Special</div>
        )}
      </div>
      <div className="flex justify-between items-baseline mb-2 border-b border-cafe-100 pb-2">
        <h3 className={`font-serif text-xl ${!item.isAvailable ? 'text-gray-500 line-through decoration-gray-400' : 'text-cafe-900'}`}>{item.name}</h3>
        <span className={`font-bold font-serif text-lg ${!item.isAvailable ? 'text-gray-400' : 'text-cafe-600'}`}>${item.price}</span>
      </div>
      <p className="text-gray-600 text-sm font-light leading-relaxed">{item.description}</p>
    </motion.div>
  );
});

const Menu = () => {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [category, setCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  const isFirstRender = useRef(true);

  // --- 1. FORCE TOP SCROLL ON RELOAD/OPEN ---
  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
    window.scrollTo(0, 0);
    const timer = setTimeout(() => window.scrollTo(0, 0), 10);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    endpoints.menu.getAll()
      .then(res => { setItems(res.data.items); setLoading(false); })
      .catch(err => { console.error(err); setLoading(false); });
  }, []);

  const categories = useMemo(() => {
    return ['All', ...new Set(items.map(i => i.category))];
  }, [items]);

  const filtered = useMemo(() => {
    return category === 'All' ? items : items.filter(i => i.category === category);
  }, [items, category]);

  useEffect(() => {
    setCurrentPage(1);
  }, [category]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  
  const currentItems = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filtered.slice(start, start + ITEMS_PER_PAGE);
  }, [filtered, currentPage]);

  // --- 2. UPDATED PAGINATION SCROLL ---
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return; 
    }
    
    // UPDATED: Scroll to absolute top (0) instead of the menu grid (400)
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
  }, [currentPage]); 

  return (
    <div className="min-h-screen pb-20">
      <PageHeader 
        title="Our Menu" 
        subtitle="Taste the Artistry" 
        image="https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&q=80" 
      />

      <div className="max-w-6xl mx-auto px-4 mt-12 relative z-10">
        <div className="flex justify-center flex-wrap gap-4 mb-16">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-6 py-2 uppercase tracking-wider text-sm transition-colors border rounded-sm shadow-md ${
                category === cat ? 'bg-cafe-500 text-white border-cafe-500' : 'bg-white text-cafe-900 border-white hover:bg-cafe-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center text-cafe-500 animate-pulse font-serif text-xl">Loading culinary delights...</div>
        ) : (
          <>
            <motion.div layout="position" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              <AnimatePresence mode='popLayout'>
                {currentItems.map(item => (
                  <MenuCard key={item._id} item={item} />
                ))}
              </AnimatePresence>
            </motion.div>

            {filtered.length > ITEMS_PER_PAGE && (
              <div className="flex justify-center items-center gap-6">
                <button 
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-3 bg-white border border-gray-200 rounded-full shadow-lg hover:bg-cafe-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-cafe-900"
                >
                    <HiChevronLeft className="text-xl"/>
                </button>
                <span className="font-serif font-bold text-cafe-900 text-lg">
                    Page {currentPage} <span className="text-gray-400 text-sm">/ {totalPages}</span>
                </span>
                <button 
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="p-3 bg-white border border-gray-200 rounded-full shadow-lg hover:bg-cafe-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-cafe-900"
                >
                    <HiChevronRight className="text-xl"/>
                </button>
              </div>
            )}
            
            {filtered.length === 0 && (
                <div className="text-center text-gray-400 py-12">
                    <p>No items found in this category.</p>
                </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Menu;