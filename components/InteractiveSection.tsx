'use client';
import { useRef, useState } from 'react';
import { motion } from 'motion/react';

function MagneticWord({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouse = (e: React.MouseEvent<HTMLDivElement>) => {
    const { clientX, clientY } = e;
    const { height, width, left, top } = ref.current!.getBoundingClientRect();
    const middleX = clientX - (left + width / 2);
    const middleY = clientY - (top + height / 2);
    setPosition({ x: middleX * 0.2, y: middleY * 0.2 });
  };

  const reset = () => {
    setPosition({ x: 0, y: 0 });
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouse}
      onMouseLeave={reset}
      animate={{ x: position.x, y: position.y }}
      transition={{ type: "spring", stiffness: 150, damping: 15, mass: 0.1 }}
      className="inline-block p-4 mx-2 cursor-crosshair text-[60px] md:text-[100px] lg:text-[140px] leading-[0.8] tracking-[-0.06em] font-black text-black/10 hover:text-[#FF0000] transition-colors duration-300"
    >
      {children}
    </motion.div>
  );
}

export default function InteractiveSection() {
  const words = ['vision', 'systems', 'future', 'design', 'youth', 'ambition', 'intelligence', 'motion', 'internet', 'culture'];

  const projects = [
    { 
      num: '01', 
      title: 'NextBench', 
      subtitle: 'Verified Student Marketplace',
      desc: 'A premium student-to-student marketplace built for trusted campus transactions. NextBench enables verified students to buy, sell, and exchange books, notes, uniforms, and other essentials within a secure ecosystem. Built with scalability, authentication, image hosting, and PWA support to deliver a fast, app-like experience.',
      tech: 'React 19, TypeScript, Tailwind CSS v4, Firebase, Cloudinary, Framer Motion, Vite, PWA',
      links: [
        { label: 'Live', url: 'https://nextbench.in' },
        { label: 'GitHub', url: 'https://github.com/yashclouded/nextbench-1' }
      ]
    },
    { 
      num: '02', 
      title: 'Codiva', 
      subtitle: 'Code Activity Tracker & Gamification',
      desc: 'A gamified productivity platform designed to make coding more engaging through XP systems, streaks, achievements, analytics, and challenges. Codiva rewards meaningful coding activity while preventing spam contributions, helping developers build stronger habits and track long-term progress.',
      tech: 'XP system, streak tracking, achievements, coding challenges, contribution heatmaps, analytics dashboard',
      links: [
        { label: 'GitHub', url: 'https://github.com/yashclouded/codiva' }
      ]
    },
    { 
      num: '03', 
      title: 'ALife Engine v2', 
      subtitle: 'Artificial Life & Evolution Simulator',
      desc: 'A modular artificial life simulator that models evolution through neural-network-driven organisms, genetics, mutation, and emergent behavior. Organisms autonomously reproduce, compete, evolve traits, and form complex ecosystems while simulation data is visualized in real time through an interactive dashboard.',
      tech: 'Neural network brains, genetic evolution, species clustering, reproduction systems, real-time GUI, simulation analytics',
      links: [
        { label: 'GitHub', url: 'https://github.com/yashclouded/algomain' }
      ]
    },
  ];

  return (
    <div className="overflow-hidden">
      
      {/* Magnetic Words Area */}
      <div className="py-32 md:py-64 max-w-7xl mx-auto px-6 flex flex-wrap justify-center items-center gap-y-4 md:gap-y-12 fluid-blend">
        {words.map((word, i) => (
          <MagneticWord key={i}>{word}</MagneticWord>
        ))}
      </div>

      {/* Vertical Projects Gallery */}
      <div className="py-32 relative fluid-blend">
        <div className="max-w-7xl mx-auto px-6 md:px-24">
          <div className="text-[10px] uppercase tracking-[0.4em] font-semibold text-black/40 mb-32">
            Selected Works & Explorations
          </div>

          <div className="flex flex-col gap-48">
            {projects.map((proj, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 100 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-20%" }}
                transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                className="flex flex-col lg:flex-row gap-8 lg:gap-24 group relative"
              >
                {/* Number */}
                <div className="text-black/5 font-black text-[120px] md:text-[200px] leading-[0.8] tracking-[-0.06em] group-hover:text-[#FF0000] transition-colors duration-700 shrink-0">
                  {proj.num}
                </div>

                {/* Content */}
                <div className="flex flex-col justify-center flex-1 lg:pt-8">
                  <h3 
                    className="text-5xl md:text-7xl lg:text-8xl font-black tracking-[-0.04em] text-black mb-4 group-hover:pl-6 transition-all duration-500 will-change-transform"
                    style={{ filter: 'url(#liquid-text)' }}
                  >
                    {proj.title}
                  </h3>
                  <div className="text-xl md:text-2xl font-light text-black/40 mb-8 tracking-tight italic">
                    {proj.subtitle}
                  </div>
                  <p className="text-lg md:text-xl font-light text-black/70 max-w-2xl leading-relaxed mb-12">
                    {proj.desc}
                  </p>
                  
                  {/* Tech/Features */}
                  <div className="mb-12">
                    <div className="text-[10px] uppercase tracking-[0.4em] font-semibold text-black/40 mb-4">Core / Tech</div>
                    <p className="text-sm font-medium text-black/60 max-w-2xl leading-relaxed">
                      {proj.tech}
                    </p>
                  </div>

                  {/* Links */}
                  <div className="flex flex-wrap gap-8">
                    {proj.links.map((link, j) => (
                      <a 
                        key={j} 
                        href={link.url}
                        target="_blank"
                        rel="noreferrer"
                        className="group/link flex items-center gap-4 text-[11px] font-semibold tracking-[0.3em] uppercase cursor-crosshair"
                      >
                        <span className="group-hover/link:text-[#FF0000] transition-colors">{link.label}</span>
                        <div className="w-12 h-[1px] bg-black/20 group-hover/link:bg-[#FF0000] group-hover/link:w-24 transition-all duration-500" />
                      </a>
                    ))}
                  </div>
                </div>

                {/* Subtle red accent line on the left side of content block on hover */}
                <div className="absolute -left-4 md:-left-8 top-0 w-[2px] h-0 bg-[#FF0000] group-hover:h-full transition-all duration-1000 ease-out hidden lg:block" />
              </motion.div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}
