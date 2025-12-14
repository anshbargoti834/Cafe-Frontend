import { motion } from 'framer-motion';

interface PageHeaderProps {
  title: string;
  subtitle: string;
  image: string;
}

const PageHeader = ({ title, subtitle, image }: PageHeaderProps) => {
  return (
    <div className="relative h-[50vh] min-h-[400px] flex items-center justify-center overflow-hidden">
      {/* Background Image with Parallax-like feel */}
      <div 
        className="absolute inset-0 bg-cover bg-center z-0"
        style={{ backgroundImage: `url('${image}')` }}
      >
         {/* Dark Overlay so Navbar text is always visible */}
        <div className="absolute inset-0 bg-black/50" />
      </div>

      {/* Text Content */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 text-center mt-10"
      >
        <span className="block text-cafe-400 font-sans uppercase tracking-[0.3em] text-sm font-bold mb-4">
          {subtitle}
        </span>
        <h1 className="font-serif text-5xl md:text-7xl text-white drop-shadow-lg">
          {title}
        </h1>
      </motion.div>
    </div>
  );
};

export default PageHeader;