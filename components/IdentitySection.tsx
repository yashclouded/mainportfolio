'use client';
import { motion } from 'motion/react';

export default function IdentitySection() {
  return (
    <div className="min-h-screen relative flex items-center py-32 px-6 md:px-24 overflow-hidden z-20 fluid-blend">
      <div className="w-full max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-32 items-center">
        
        {/* Left Side: Huge Typography */}
        <motion.div 
          initial={{ opacity: 0, y: 100 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-20%" }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          className="col-span-1"
        >
          <h1 className="text-[100px] md:text-[140px] lg:text-[180px] leading-[0.8] tracking-[-0.06em] font-black text-black" style={{ filter: 'url(#liquid-text)' }}>
            I&apos;m <br />
            <span className="opacity-10 hover:opacity-100 transition-opacity duration-700">Yash</span><span className="text-[#FF0000] hover:opacity-0 transition-opacity">.</span>
          </h1>
        </motion.div>

        {/* Right Side: Manifesto */}
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-20%" }}
          transition={{ duration: 1.2, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="col-span-1 flex flex-col gap-12"
        >
          <p className="text-2xl md:text-3xl lg:text-4xl font-light leading-tight tracking-tight text-black">
            I build intelligent products, host ambitious events, and create systems that help people imagine bigger futures.
          </p>
          
          <div className="flex gap-4 items-center group cursor-crosshair">
             <div className="w-12 h-[1px] bg-[#FF0000] group-hover:w-full transition-all duration-1000 ease-in-out origin-left" />
          </div>

          <div className="grid grid-cols-2 gap-8 text-black/50 text-[10px] uppercase tracking-[0.4em] font-semibold leading-relaxed">
            <ul className="flex flex-col gap-4">
              <li className="hover:text-black transition-colors">Teenage Founder</li>
              <li className="hover:text-black transition-colors">AI Engineer</li>
              <li className="hover:text-black transition-colors">Systems Thinker</li>
              <li className="hover:text-black transition-colors">Internet-Native Builder</li>
            </ul>
            <ul className="flex flex-col gap-4">
              <li className="hover:text-black transition-colors">Event Organizer</li>
              <li className="hover:text-black transition-colors">Experimental Product Creator</li>
              <li className="hover:text-black transition-colors">Hackathon Culture</li>
              <li className="hover:text-black transition-colors">Storytelling via Tech</li>
            </ul>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
