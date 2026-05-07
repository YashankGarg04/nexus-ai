'use client';

import Link from "next/link";
import { Terminal, Zap, Code2, Globe2, ShieldCheck, Blocks, ArrowRight, Activity } from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

// Reusable component for smooth scroll-triggered fade-ins
const FadeIn = ({ children, delay = 0, className = "" }: { children: React.ReactNode, delay?: number, className?: string }) => (
  <motion.div
    initial={{ opacity: 0, y: 40 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-100px" }}
    transition={{ duration: 0.8, delay, ease: [0.21, 0.47, 0.32, 0.98] }}
    className={className}
  >
    {children}
  </motion.div>
);

export default function Home() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start start", "end start"] });
  
  // Parallax effect for the background glow
  const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);

  return (
    <main ref={containerRef} className="flex flex-col items-center justify-start w-full relative overflow-x-hidden bg-gray-950 selection:bg-blue-500/30">
      
      {/* Parallax Background Elements */}
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none z-0" />
      <motion.div 
        style={{ y: backgroundY }}
        className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-blue-600/15 blur-[120px] rounded-[100%] pointer-events-none z-0" 
      />

      {/* 1. HERO SECTION */}
      <section className="w-full min-h-screen flex flex-col items-center justify-center text-center relative z-10 px-6 pt-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="mb-8"
        >
          <svg width="120" height="120" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="mx-auto mb-8 drop-shadow-[0_0_30px_rgba(37,99,235,0.5)]">
            <path d="M50 10L85 30V70L50 90L15 70V30L50 10Z" stroke="#2563EB" strokeWidth="4" strokeLinejoin="round"/>
            <circle cx="50" cy="50" r="8" fill="white"/>
            <path d="M50 10V42M85 30L58 46M85 70L58 54M50 90V58M15 70L42 54M15 30L42 46" stroke="#2563EB" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-mono font-bold mb-8 uppercase tracking-widest backdrop-blur-sm"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
          </span>
          Mainnet Beta Live
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="text-7xl md:text-9xl font-black text-white tracking-tighter mb-4 leading-none"
        >
          Nexus<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-cyan-400 to-blue-500 animate-[pulse_4s_ease-in-out_infinite]">.ai</span>
        </motion.h1>

        {/* NEW PROFESSIONAL SUBTEXT */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-2xl md:text-3xl font-medium text-gray-300 mb-8 tracking-tight"
        >
          The abstraction layer for decentralized finance.
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="text-gray-400 text-lg md:text-xl max-w-3xl mx-auto font-medium mb-12 leading-relaxed"
        >
          Execute complex blockchain interactions effortlessly. We translate human intent into deterministic, cryptographically secure on-chain actions.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <Link 
            href="/terminal" 
            className="group relative inline-flex items-center justify-center gap-3 px-10 py-5 font-bold text-white transition-all duration-300 bg-blue-600 rounded-2xl hover:bg-blue-500 hover:scale-105 hover:shadow-[0_0_40px_rgba(37,99,235,0.5)] overflow-hidden"
          >
            <div className="absolute inset-0 flex h-full w-full justify-center [transform:skew(-12deg)_translateX(-100%)] group-hover:duration-1000 group-hover:[transform:skew(-12deg)_translateX(100%)]">
              <div className="relative h-full w-8 bg-white/20" />
            </div>
            <Terminal className="w-6 h-6" /> 
            <span className="text-lg">Launch Terminal</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.5 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-gray-500 animate-bounce"
        >
          <span className="text-xs font-mono uppercase tracking-widest">Scroll to explore</span>
          <div className="w-[1px] h-12 bg-gradient-to-b from-gray-500 to-transparent" />
        </motion.div>
      </section>

      {/* 2. THE PROBLEM (New Professional Rewrite) */}
      <section className="w-full max-w-5xl mx-auto px-6 py-48 text-center relative z-10">
        <FadeIn>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-medium text-gray-400 leading-tight">
            Decentralized networks are fragmented and complex.<br/>
            <span className="text-white font-bold">Nexus makes the blockchain invisible.</span>
          </h2>
        </FadeIn>
      </section>

      {/* 3. THE SOLUTION (Split layout) */}
      <section className="w-full max-w-7xl mx-auto px-6 py-32 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          <div className="flex-1 space-y-8">
            <FadeIn>
              <h3 className="text-4xl md:text-5xl font-bold text-white leading-tight">
                Plain English is the new Smart Contract.
              </h3>
            </FadeIn>
            <FadeIn delay={0.2}>
              <p className="text-xl text-gray-400 leading-relaxed">
                Stop juggling addresses, deciphering gas fees, and navigating clunky dApps. With Nexus, you simply type what you want to do. The LLM translates your human intent into exact, cryptographically secure on-chain actions.
              </p>
            </FadeIn>
            <FadeIn delay={0.3}>
              <ul className="space-y-4 text-gray-300 font-mono text-sm">
                <li className="flex items-center gap-3"><Zap className="w-4 h-4 text-cyan-400" /> "Swap 5 SOL for USDC"</li>
                <li className="flex items-center gap-3"><Zap className="w-4 h-4 text-cyan-400" /> "What is the floor price of Mad Lads?"</li>
                <li className="flex items-center gap-3"><Zap className="w-4 h-4 text-cyan-400" /> "Stake 10 SOL with Jito"</li>
              </ul>
            </FadeIn>
          </div>
          <FadeIn delay={0.4} className="flex-1 w-full flex justify-center">
             <div className="w-full max-w-lg aspect-square bg-gradient-to-b from-gray-900 to-black border border-gray-800 rounded-3xl shadow-2xl flex items-center justify-center relative overflow-hidden group p-2">
               <div className="absolute inset-0 bg-blue-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-700 z-10 pointer-events-none" />
               <img 
                 src="/terminal.png" 
                 alt="Nexus Terminal Interface" 
                 className="w-full h-full object-cover rounded-2xl border border-gray-800/50 relative z-0 transition-transform duration-700 group-hover:scale-105"
               />
             </div>
          </FadeIn>
        </div>
      </section>

      {/* 4. THE ECOSYSTEM (Staggered Grid) */}
      <section className="w-full max-w-7xl mx-auto px-6 py-32 relative z-10 border-t border-white/5">
        <FadeIn>
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">An Expanding Neural Network</h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">Install plugins from the marketplace to instantly teach Nexus new capabilities without updating your core wallet.</p>
          </div>
        </FadeIn>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <FadeIn delay={0.1}>
            <div className="h-full bg-gray-900/50 border border-white/5 rounded-3xl p-10 hover:border-blue-500/50 transition-colors group relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                <Activity className="w-32 h-32 text-blue-500" />
              </div>
              <Activity className="w-12 h-12 text-blue-400 mb-6" />
              <h3 className="text-2xl font-bold text-white mb-4">Native DeFi</h3>
              <p className="text-gray-400 leading-relaxed">Powered by Jupiter and native Solana programs. Swap tokens and stake SOL instantly with zero friction.</p>
            </div>
          </FadeIn>
          
          <FadeIn delay={0.3}>
            <div className="h-full bg-gray-900/50 border border-white/5 rounded-3xl p-10 hover:border-[#2081E2]/50 transition-colors group relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                <Globe2 className="w-32 h-32 text-[#2081E2]" />
              </div>
              <Globe2 className="w-12 h-12 text-[#2081E2] mb-6" />
              <h3 className="text-2xl font-bold text-white mb-4">OpenSea Explorer</h3>
              <p className="text-gray-400 leading-relaxed">Drop a collection name or paste an OpenSea link. The AI automatically parses slugs and fetches live floor prices and volumes.</p>
            </div>
          </FadeIn>

          <FadeIn delay={0.5}>
            <div className="h-full bg-gray-900/50 border border-white/5 rounded-3xl p-10 hover:border-cyan-500/50 transition-colors group relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                <Blocks className="w-32 h-32 text-cyan-500" />
              </div>
              <Blocks className="w-12 h-12 text-cyan-400 mb-6" />
              <h3 className="text-2xl font-bold text-white mb-4">Live Alpha</h3>
              <p className="text-gray-400 leading-relaxed">Connected to CryptoCompare's live feeds. Ask Nexus to scan the web for the latest ecosystem news and breaking alpha.</p>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* 5. THE DEVELOPER PITCH */}
      <section className="w-full bg-black border-y border-white/10 relative z-10 py-32 mt-12 overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,rgba(37,99,235,0.4)_0,transparent_50%)]" />
        
        <div className="max-w-7xl mx-auto px-6 flex flex-col items-center text-center relative z-20">
          <FadeIn>
            <Code2 className="w-16 h-16 text-blue-500 mb-8 mx-auto" />
            <h2 className="text-4xl md:text-6xl font-bold text-white leading-tight mb-8">
              Built by Developers, for Developers.
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed mb-12">
              Our plugin architecture turns simple React components into AI-powered tools. Define your JSON schema, inject your API route, and let the Groq-powered LLM handle the natural language routing.
            </p>
            <Link href="/plugins" className="inline-flex items-center gap-2 px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold rounded-xl transition-all">
              <Blocks className="w-5 h-5" /> Visit Plugin Store
            </Link>
          </FadeIn>
        </div>
      </section>

      <footer className="w-full py-12 text-center text-gray-600 text-sm mt-auto relative z-10 bg-gray-950">
        <div className="flex items-center justify-center gap-2 mb-4">
           <svg width="24" height="24" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="opacity-50">
            <path d="M50 10L85 30V70L50 90L15 70V30L50 10Z" stroke="currentColor" strokeWidth="4" strokeLinejoin="round"/>
            <circle cx="50" cy="50" r="8" fill="currentColor"/>
          </svg>
          <span className="font-bold tracking-widest uppercase">Nexus.ai</span>
        </div>
        <p>© {new Date().getFullYear()} Built for the Decentralized Future.</p>
      </footer>
    </main>
  );
}