'use client';
import { motion } from 'motion/react';

export default function FooterSection() {
  return (
    <div className="h-screen relative flex flex-col justify-between pt-32 pb-8 px-6 md:px-24 z-10 border-t border-black/5 fluid-blend">
      
      <div className="flex-1 flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-10%" }}
          transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
          className="text-center flex flex-col items-center gap-8"
        >
          <span className="text-[10px] uppercase tracking-[0.4em] font-semibold text-gray-400">The internet still has room for</span>
          <h2 className="text-3xl md:text-5xl lg:text-7xl font-sans tracking-tight text-black font-semibold italic" style={{ filter: 'url(#liquid-text)' }}>
            beautiful things<span className="text-[#FF0000]">.</span>
          </h2>
          
          <div className="w-1 h-1 bg-[#FF0000] rounded-full animate-ping mt-12" />
        </motion.div>
      </div>

      <div className="w-full flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] uppercase tracking-[0.4em] font-semibold text-black/40">
        <div className="flex gap-4">
          <a href="https://www.linkedin.com/in/yashvardhansinghbnb/" target="_blank" rel="noopener noreferrer" className="w-10 h-10 border border-gray-200 rounded-full flex items-center justify-center hover:border-[#FF0000] hover:text-black transition-all">IN</a>
          <a href="mailto:yash@gobitsnbytes.org" className="w-10 h-10 border border-gray-200 rounded-full flex items-center justify-center hover:border-[#FF0000] hover:text-black transition-all">ML</a>
        </div>
        
        <div className="flex items-center gap-2">
          <span>&copy; {new Date().getFullYear()} Yash.</span>
          <span className="hidden md:inline">Made with intention.</span>
        </div>
      </div>

    </div>
  );
}
