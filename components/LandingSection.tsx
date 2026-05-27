'use client';
import { useRef } from 'react';
import { motion, useScroll, useTransform, useSpring, MotionValue } from 'motion/react';

function ScrollWord({ 
  word, 
  i, 
  scrollYProgress 
}: { 
  word: string, 
  i: number, 
  scrollYProgress: MotionValue<number> 
}) {
  const pauseStart = 0.18 + (i * 0.18);
  const pauseEnd = 0.28 + (i * 0.18);
  const fadeInStart = pauseStart - 0.08;
  const fadeOutEnd = pauseEnd + 0.08;
  
  const opacityRaw = useTransform(
    scrollYProgress,
    [fadeInStart, pauseStart, pauseEnd, fadeOutEnd],
    [0.05, 1, 1, 0.05]
  );
  
  const blurRawNum = useTransform(
    scrollYProgress,
    [fadeInStart, pauseStart, pauseEnd, fadeOutEnd],
    [20, 0, 0, 20]
  );

  const opacity = useSpring(opacityRaw, { stiffness: 60, damping: 20 });
  const blurNum = useSpring(blurRawNum, { stiffness: 60, damping: 20 });
  
  const blur = useTransform(blurNum, (v) => `blur(${v}px) url(#liquid-text)`);

  return (
    <div className="w-screen h-full flex items-center justify-center shrink-0">
      <motion.span 
        className="text-[50px] sm:text-[70px] md:text-[120px] lg:text-[180px] leading-[0.8] tracking-[-0.06em] font-black text-black cursor-crosshair text-center px-6"
        style={{ opacity, filter: blur }}
        whileHover={{ scale: 1.05 }}
        transition={{ duration: 0.3 }}
      >
        {word}
      </motion.span>
    </div>
  );
}

export default function LandingSection() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end']
  });

  // Fade out earlier and explicitly hide
  const helloOpacity = useTransform(scrollYProgress, [0.02, 0.08], [1, 0]);
  const helloScale = useTransform(scrollYProgress, [0, 0.1], [1, 20]);
  const helloX = useTransform(scrollYProgress, [0, 0.1], ['0%', '-500%']);
  const helloDisplay = useTransform(scrollYProgress, (v) => v > 0.1 ? 'none' : 'flex');
  
  const textOpacity = useTransform(scrollYProgress, [0, 0.05], [1, 0]);

  // Inertial mapped chunks with pauses
  const xRaw = useTransform(
    scrollYProgress, 
    [0.10, 0.18, 0.28, 0.36, 0.46, 0.54, 0.64, 0.72, 0.82, 0.90, 1.0], 
    ['100vw', '0vw', '0vw', '-100vw', '-100vw', '-200vw', '-200vw', '-300vw', '-300vw', '-400vw', '-400vw']
  );
  
  // Apply spring for buttery inertial feeling
  const xTransform = useSpring(xRaw, { stiffness: 60, damping: 20, mass: 0.8 });

  const wordsOpacityRaw = useTransform(scrollYProgress, [0.1, 0.15], [0, 1]);
  const wordsOpacity = useSpring(wordsOpacityRaw, { stiffness: 60, damping: 20 });

  const words = ['AI AGENTS', 'SYSTEMS', 'WEBSITES', 'EXPERIENCES', 'HACKATHONS'];

  return (
    <div ref={containerRef} className="h-[500vh] relative">
      <div className="sticky top-0 h-screen flex flex-col items-center justify-center overflow-hidden fluid-blend">
        
        {/* Initial Hello State */}
        <motion.div 
          className="absolute inset-0 items-center px-6 md:px-24 justify-between z-20"
          style={{ 
            opacity: helloOpacity, 
            display: helloDisplay 
          }}
        >
          <motion.div 
            className="flex items-center text-[70px] md:text-[120px] lg:text-[180px] leading-[0.8] tracking-[-0.06em] font-black"
            style={{ x: helloX, scale: helloScale, transformOrigin: 'left center' }}
          >
            hello<motion.span className="text-[#FF0000]">.</motion.span>
            <motion.div 
              animate={{ opacity: [1, 0] }} 
              transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
              className="w-[4px] h-[70px] md:h-[100px] lg:h-[140px] bg-[#FF0000] ml-2 align-middle"
            />
          </motion.div>
          
          <motion.div 
            className="max-w-xs md:max-w-sm text-xs font-light text-gray-500 leading-relaxed text-right ml-auto"
            style={{ opacity: textOpacity }}
          >
            <p className="mb-4">
              builder, founder, engineer, storyteller.<br />
              currently exploring the edges of ai, internet culture, and youth innovation.
            </p>
            <p className="text-black font-normal">
              based in india. building for the internet.
            </p>
          </motion.div>
        </motion.div>

        {/* Horizontal Scrolling Centered Words */}
        <motion.div 
          className="absolute top-0 left-0 h-full flex items-center z-10"
          style={{ x: xTransform, opacity: wordsOpacity }}
        >
          {words.map((word, i) => (
            <ScrollWord key={i} word={word} i={i} scrollYProgress={scrollYProgress} />
          ))}
        </motion.div>
      </div>
    </div>
  );
}
