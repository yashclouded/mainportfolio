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
      title: 'LISA', 
      subtitle: 'Light-based In-field Spectral Analyser · Startup Ashoka 2026 (2nd Place)',
      desc: 'A frugal, Foldscope-style smartphone spectrometer for testing drinking water, aimed at field kits used under India\'s Jal Jeevan Mission that rely on subjective visual colour matching without digital records. Features an origami card enclosure with a 30×30 mm optical tube, dual razor-blade slit, and diffraction grating film costing ~₹1,500/unit, coupled with an offline-first physics-informed ML runtime (Beer-Lambert, Ridge Regression) measuring absorption from 400–700 nm to quantify phosphate and lead levels against BIS IS 10500:2012 standards with bilingual voice readouts and geotagged logs.',
      tech: 'Physics-Informed ML, Ridge Regression, Beer-Lambert Law, Embedded Optical Hardware, BIS Standards, Python',
      links: [
        { label: 'GitHub', url: 'https://github.com/yashclouded/lisa' }
      ]
    },
    { 
      num: '02', 
      title: 'Ghost', 
      subtitle: 'Through-Wall Fall Detection on a WiFi Chip · ESP32 & PyTorch',
      desc: 'An end-to-end through-wall fall detection pipeline where ESP32 firmware streams WiFi channel-state information (CSI) into a CNN achieving 96% test accuracy and 97.8% fall recall, gated by a debounced state machine. Integrated with an LLM-written caregiver alert system with deterministic fallbacks, a live 3D digital twin of the sensing pipeline, and a custom parametric CAD enclosure and circuit costing ~₹430 ($5) per room.',
      tech: 'Python, PyTorch, ESP32 Firmware, WiFi CSI, CNNs, Three.js, React, Parametric CAD',
      links: [
        { label: 'GitHub', url: 'https://github.com/yashclouded/ghost' }
      ]
    },
    { 
      num: '03', 
      title: 'NextBench', 
      subtitle: 'Verified Campus Marketplace · Kotlin & Android · 300+ Active Users',
      desc: 'A verified-student campus marketplace for trusted buying and selling, campus stories, student clubs, and messaging. The web platform is live and actively used by over 300 students, with the native Android app launching in October 2026.',
      tech: 'Kotlin, Android, React 19, TypeScript, Firebase, Tailwind CSS, PWA',
      links: [
        { label: 'Live', url: 'https://nextbench.in' },
        { label: 'GitHub', url: 'https://github.com/yashclouded/nextbench-1' }
      ]
    },
    { 
      num: '04', 
      title: 'Codiva', 
      subtitle: 'VS Code Extension · 5.0 Rating · 83 Active Users',
      desc: 'A gamified coding extension for Visual Studio Code featuring a distraction-free Pomodoro timer and actionable analytics on coding habits. Helps developers maintain flow state and build consistent programming discipline.',
      tech: 'TypeScript, VS Code Extension API, Pomodoro Engine, Developer Productivity Analytics',
      links: [
        { label: 'GitHub', url: 'https://github.com/yashclouded/codiva' }
      ]
    },
    { 
      num: '05', 
      title: 'Alem', 
      subtitle: 'Lightweight Notes App · Python · Under 25 MB',
      desc: 'Built specifically for low-resource devices under 25 MB total footprint. Features rich text editing, local AI-powered semantic search, dynamic tagging, and secure sharing without cloud bloat.',
      tech: 'Python, Semantic Search, Local Embeddings, Rich Text, Low-Resource Systems',
      links: [
        { label: 'GitHub', url: 'https://github.com/yashclouded/aAlem' }
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
