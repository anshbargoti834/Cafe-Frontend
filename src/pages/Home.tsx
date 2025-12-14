import { motion, useScroll, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';
import { HiArrowNarrowRight, HiStar } from 'react-icons/hi';
import { useRef, useEffect, useState, useMemo } from 'react';
import { endpoints } from '../services/api'; 
import { MenuItem } from '../types'; 

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 60 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.2 } }
};

const API_BASE_URL = 'http://localhost:4000'; // NOTE: Change to your IP (e.g., 192.168.x.x) if testing on phone

const Home = () => {
  const [featuredItems, setFeaturedItems] = useState<MenuItem[]>([]);
  const ref = useRef(null);
  
  // Parallax Effect
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const yBg = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);

  // Helper to generate URL
  const getImageUrl = (imagePath: string) => {
    if (!imagePath) return '';
    if (imagePath.startsWith('http')) return imagePath;
    let cleanPath = imagePath.replace(/\\/g, '/');
    if (!cleanPath.startsWith('/')) cleanPath = `/${cleanPath}`;
    return `${API_BASE_URL}${encodeURI(cleanPath)}`;
  };

  useEffect(() => {
    endpoints.menu.getAll()
      .then(res => {
        const allItems = res.data.items || [];
        const validItems = allItems.filter((item: MenuItem) => item.isAvailable === true);
        const topItems = validItems.slice(0, 6); // Get top 6 items
        setFeaturedItems(topItems);

        // --- THE FIX: PRELOAD IMAGES ---
        // This forces the browser to download these 6 images immediately in the background
        // so they are ready BEFORE the user scrolls down.
        topItems.forEach((item: MenuItem) => {
            if (item.image) {
                const img = new Image();
                img.src = getImageUrl(item.image);
            }
        });
      })
      .catch(err => console.error("Failed to load home menu:", err));
  }, []);

  // Memoize the duplicated list
  const marqueeList = useMemo(() => [...featuredItems, ...featuredItems], [featuredItems]);

  return (
    <div className="w-full overflow-hidden">
      
      {/* 0. PURE CSS ANIMATION (GPU ACCELERATED) */}
      <style>{`
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: scroll 40s linear infinite;
        }
        /* Mobile speed adjustment */
        @media (max-width: 768px) {
          .animate-marquee {
            animation: scroll 20s linear infinite;
          }
        }
      `}</style>

      {/* 1. HERO SECTION */}
      <section ref={ref} className="relative h-screen flex items-center justify-center overflow-hidden">
        <motion.div style={{ y: yBg }} className="absolute inset-0 z-0 bg-cover bg-center">
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1497935586351-b67a49e012bf?q=80&w=2071&auto=format&fit=crop')] bg-cover bg-center scale-110" />
            <div className="absolute inset-0 bg-black/40" />
        </motion.div>
        <div className="relative z-20 text-center px-4 max-w-4xl mx-auto mt-16">
          <motion.span initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="block text-cafe-100 font-sans uppercase tracking-[0.4em] mb-6 text-sm font-bold">Est. 2024 • The Art of Coffee</motion.span>
          <motion.h1 initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1 }} className="font-serif text-6xl md:text-9xl text-white mb-8 leading-tight drop-shadow-lg">Sip the <br/><span className="italic text-cafe-300">Extraordinary</span></motion.h1>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }} className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link to="/menu" className="bg-white text-cafe-900 px-10 py-4 hover:bg-cafe-100 transition-all uppercase tracking-widest text-sm font-bold shadow-lg">View Menu</Link>
            <Link to="/reservation" className="border border-white text-white px-10 py-4 hover:bg-white hover:text-cafe-900 transition-all uppercase tracking-widest text-sm font-bold backdrop-blur-sm">Book Table</Link>
          </motion.div>
        </div>
      </section>

      {/* 2. INTRO QUOTE */}
      <section className="py-24 px-6 text-center">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} className="max-w-3xl mx-auto">
          <p className="font-serif text-3xl md:text-5xl text-white leading-snug">"We don't just brew coffee; we curate moments of silence, luxury, and warmth in a chaotic world."</p>
          <div className="h-1 w-20 bg-white/30 mx-auto mt-12"></div>
        </motion.div>
      </section>

      {/* 3. THE TRIO */}
      <section className="py-10 px-6">
        <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { title: "Artisan Roast", desc: "Beans sourced from the Ethiopian highlands, roasted in-house.", icon: "☕" },
            { title: "French Patisserie", desc: "Croissants and tarts baked fresh every morning at 4 AM.", icon: "🥐" },
            { title: "Tranquil Space", desc: "No loud music. No rush. Just you and the aroma.", icon: "✨" }
          ].map((item, idx) => (
            <motion.div variants={fadeInUp} key={idx} className="p-10 bg-white shadow-2xl rounded-sm hover:-translate-y-2 transition-transform duration-500">
              <span className="text-4xl mb-4 block">{item.icon}</span>
              <h3 className="font-serif text-2xl text-cafe-900 mb-4">{item.title}</h3>
              <p className="text-gray-600 font-light leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* 4. SPLIT STORY SECTION */}
      <section className="py-32 px-4 md:px-0">
        <div className="max-w-7xl mx-auto bg-white shadow-2xl overflow-hidden rounded-sm">
          <div className="grid grid-cols-1 md:grid-cols-2">
            <motion.div initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }} viewport={{ once: true }} className="relative h-[400px] md:h-auto">
               <img src="https://images.unsplash.com/photo-1511920170033-f8396924c348?q=80&w=1974&auto=format&fit=crop" alt="Pour over coffee" className="absolute inset-0 w-full h-full object-cover"/>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 50 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.2 }} viewport={{ once: true }} className="p-12 md:p-20 flex flex-col justify-center">
              <span className="text-cafe-500 font-bold uppercase tracking-widest text-xs mb-2">The Process</span>
              <h2 className="font-serif text-4xl text-cafe-900 mb-6">From Bean to Soul</h2>
              <p className="text-gray-600 mb-6 font-light leading-loose">Every cup served at Lumiére starts its journey on sustainable farms. We hand-select beans that tell a story of their origin.</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 5. LIVE INFINITE MENU MARQUEE */}
      <section className="py-24 relative overflow-hidden bg-cafe-900/50 backdrop-blur-sm border-y border-white/10 group">
        <div className="max-w-7xl mx-auto px-6 mb-12 flex justify-between items-end">
          <div>
             <span className="text-white/70 uppercase tracking-widest text-sm font-bold">Discover</span>
             <h2 className="text-4xl font-serif text-white mt-2">Signature Serves</h2>
          </div>
          <Link to="/menu" className="hidden md:flex items-center gap-2 text-white border-b border-white pb-1 hover:text-cafe-300 hover:border-cafe-300 transition-colors">
            View Full Menu <HiArrowNarrowRight/>
          </Link>
        </div>

        {/* MARQUEE CONTAINER */}
        <div className="flex overflow-hidden relative w-full">
           {featuredItems.length > 0 ? (
             <div className="flex gap-8 animate-marquee w-max will-change-transform transform-gpu">
               {marqueeList.map((item, idx) => (
                 <div key={`${item._id}-${idx}`} className="w-[300px] md:w-[400px] flex-shrink-0 group/card cursor-pointer bg-white rounded-sm overflow-hidden shadow-2xl hover:shadow-3xl transition-shadow duration-300">
                    <div className="h-64 overflow-hidden relative bg-cafe-100">
                      {item.image ? (
                        <img 
                          src={getImageUrl(item.image)} 
                          alt={item.name} 
                          // FIX: loading="eager" forces download immediately
                          loading="eager" 
                          decoding="sync" // sync decoding ensures it paints before showing
                          crossOrigin="anonymous"
                          className="w-full h-full object-cover group-hover/card:scale-110 transition-transform duration-700 will-change-transform" 
                          onError={(e) => {
                             (e.target as HTMLImageElement).src = "https://www.transparenttextures.com/patterns/stardust.png"; 
                          }}
                        />
                      ) : (
                          <div className="w-full h-full flex items-center justify-center text-cafe-300 font-serif">Signature Dish</div>
                      )}
                    </div>
                    <div className="p-6">
                      <div className="flex justify-between items-baseline mb-2">
                        <h3 className="font-serif text-xl text-cafe-900 truncate">{item.name}</h3>
                        <span className="font-bold text-cafe-600 font-serif text-lg">${item.price}</span>
                      </div>
                      <p className="text-gray-500 text-sm line-clamp-2">{item.description}</p>
                    </div>
                 </div>
               ))}
             </div>
           ) : (
             <div className="text-white text-center w-full italic">Loading signature dishes...</div>
           )}
        </div>

        <div className="mt-12 text-center md:hidden">
           <Link to="/menu" className="text-white border-b border-white pb-1">View Full Menu</Link>
        </div>
      </section>

      {/* 6. ATMOSPHERE BREAK */}
      <section className="h-[60vh] relative flex items-center justify-center bg-fixed bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&q=80')" }}>
        <div className="absolute inset-0 bg-black/50" />
        <motion.div initial={{ scale: 0.8, opacity: 0 }} whileInView={{ scale: 1, opacity: 1 }} transition={{ duration: 0.8 }} viewport={{ once: true }} className="relative z-10 text-center p-8 border border-white/30 backdrop-blur-sm max-w-2xl">
           <h2 className="text-4xl md:text-6xl font-serif text-white mb-4">The Atmosphere</h2>
           <p className="text-white/90 text-lg font-light">Where time slows down, and the city noise fades away.</p>
        </motion.div>
      </section>

      {/* 7. TESTIMONIALS */}
      <section className="py-24 px-6 bg-cafe-50">
        <div className="max-w-4xl mx-auto text-center">
           <span className="text-cafe-500 uppercase tracking-widest text-sm font-bold">Love Notes</span>
           <h2 className="text-4xl font-serif text-cafe-900 mt-2 mb-12">What Our Guests Say</h2>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <motion.div whileHover={{ y: -5 }} className="bg-white p-8 shadow-lg text-left rounded-sm border-t-4 border-cafe-500">
                 <div className="flex text-yellow-400 mb-4"><HiStar/><HiStar/><HiStar/><HiStar/><HiStar/></div>
                 <p className="text-gray-600 italic mb-6">"The best espresso I've had. The ambiance is unmatched."</p>
                 <h4 className="font-serif font-bold text-cafe-900">– xyz , Food Critic</h4>
              </motion.div>
              <motion.div whileHover={{ y: -5 }} className="bg-white p-8 shadow-lg text-left rounded-sm border-t-4 border-cafe-500">
                 <div className="flex text-yellow-400 mb-4"><HiStar/><HiStar/><HiStar/><HiStar/><HiStar/></div>
                 <p className="text-gray-600 italic mb-6">"I come here every Sunday for the truffle cake."</p>
                 <h4 className="font-serif font-bold text-cafe-900">– abc, Regular</h4>
              </motion.div>
           </div>
        </div>
      </section>

      {/* 8. FOOTER CTA */}
      <section className="py-24 text-center">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }} className="px-4">
          <h2 className="text-5xl md:text-7xl font-serif text-white mb-8">Ready to taste?</h2>
          <Link to="/reservation" className="inline-block bg-white text-cafe-900 px-12 py-5 font-serif text-lg font-bold uppercase tracking-widest hover:bg-cafe-100 hover:scale-105 transition-all shadow-2xl">Reserve Your Seat</Link>
        </motion.div>
      </section>

    </div>
  );
};

export default Home;