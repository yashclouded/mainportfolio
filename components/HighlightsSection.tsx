'use client';
import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';

export default function HighlightsSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start center", "end end"]
  });

  return (
    <div ref={containerRef} className="py-32 md:py-64 relative z-20 fluid-blend">
      <div className="max-w-7xl mx-auto px-6 md:px-24 flex flex-col gap-32 md:gap-64">
        
        {/* Cinematic Statement 1 */}
        <div className="flex flex-col items-start gap-4">
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="text-2xl md:text-5xl font-light text-black/40 tracking-tight"
          >
            not just building products.
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="text-[60px] md:text-[100px] lg:text-[180px] leading-[0.8] tracking-[-0.06em] font-black"
            style={{ filter: 'url(#liquid-text)' }}
          >
            building <br/> 
            <span className="italic text-black/10 hover:text-black transition-colors duration-1000">ecosystems.</span>
          </motion.div>
        </div>

        {/* List of achievements like editorial credits */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 md:gap-8 border-t border-black/10 pt-16">
          <div className="col-span-1 lg:col-span-4 flex flex-col gap-8">
             <h3 className="text-[10px] uppercase tracking-[0.4em] font-semibold text-black/50">Selected Credentials</h3>
             <div className="w-[1px] h-32 bg-gray-200 hidden lg:block" />
             <span className="hidden lg:block [writing-mode:vertical-rl] rotate-180 text-[10px] uppercase tracking-[0.4em] font-semibold text-gray-400">milestones</span>
          </div>
          
          <div className="col-span-1 lg:col-span-8 flex flex-col gap-12 md:gap-24">
            {[
              { 
                year: "2026 – PRES", 
                title: "CTO, Ashoka Student Govt (MAA)", 
                text: "Leading technology for the ministry representing students' academic interests to the Office of Academic Affairs. Built unified React platforms serving Ashoka's ~4,000-student community and developing AI-powered features for student academic tools." 
              },
              { 
                year: "FOUNDER", 
                title: "Bits&Bytes (Gobitsnbytes.org)", 
                text: "Built a 1,500+ member student tech community running projects, workshops, and hackathons, expanding to 10+ Indian cities as \"Bits&Bytes forks\". Built official websites for Gobitsnbytes.org, Daydream Lucknow, and IndiaInnovates.org." 
              },
              { 
                year: "2026", 
                title: "2nd Place, Startup Ashoka", 
                text: "Awarded 2nd place (₹35,000) for LISA — a frugal, Foldscope-style smartphone spectrometer testing drinking water under India's Jal Jeevan Mission field kits." 
              },
              { 
                year: "SWE INTERN", 
                title: "Software Engineer, Maximally", 
                text: "Built MailAF, an AI-powered cold-outreach tool that automates contact research, email drafting, and multi-stage sending workflows (Next.js, Firebase, Prisma, LLMs)." 
              },
              { 
                year: "COMMUNITY", 
                title: "India Innovates & Hackathons", 
                text: "Partnered with India Innovates (28,000+ registered participants at Bharat Mandapam), Lead Organizer for Scrapyard Lucknow, and mentor for NASA Space Apps Challenge Lucknow (400+ participants)." 
              }
            ].map((item, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                className="group relative"
              >
                <div className="flex flex-col md:flex-row md:items-baseline gap-2 md:gap-8 mb-4">
                  <span className="text-[#FF0000] text-[10px] uppercase tracking-[0.4em] font-semibold">{item.year}</span>
                  <h4 className="text-3xl md:text-5xl font-bold tracking-tight group-hover:pl-4 transition-all duration-500 will-change-transform">{item.title}</h4>
                </div>
                <p className="text-black/60 md:ml-24 text-lg md:text-xl font-light w-full md:w-3/4 leading-relaxed">
                  {item.text}
                </p>
                {/* Minimal red line on hover */}
                <div className="absolute -left-4 top-0 w-[2px] h-0 bg-[#FF0000] group-hover:h-full transition-all duration-700 ease-out" />
              </motion.div>
            ))}
          </div>
        </div>

        {/* Cinematic Statement 2 */}
        <div className="flex flex-col items-end gap-4 mt-32 text-right">
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="text-2xl md:text-5xl font-light text-black/40 tracking-tight"
          >
            not just writing code.
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="text-[60px] md:text-[100px] lg:text-[180px] leading-[0.8] tracking-[-0.06em] font-black"
            style={{ filter: 'url(#liquid-text)' }}
          >
            designing <br/> 
            <span className="italic text-black/10 hover:text-black transition-colors duration-1000">experiences.</span>
          </motion.div>
        </div>

      </div>
    </div>
  );
}
