'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { Blocks } from "lucide-react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

const WalletMultiButtonDynamic = dynamic(
  async () => (await import("@solana/wallet-adapter-react-ui")).WalletMultiButton,
  { ssr: false }
);

export default function Navbar() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // 400px ensures it only triggers after the main hero text has scrolled out of view
      setIsScrolled(window.scrollY > 400); 
    };
    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Check immediately on mount
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Always show the full navbar on pages other than the homepage
  const showFullNav = isScrolled || pathname !== '/';

  return (
    <motion.nav 
      initial={{ backgroundColor: "rgba(3, 7, 18, 0)", borderBottomColor: "rgba(31, 41, 55, 0)" }}
      animate={{ 
        backgroundColor: showFullNav ? "rgba(3, 7, 18, 0.8)" : "rgba(3, 7, 18, 0)",
        borderBottomColor: showFullNav ? "rgba(31, 41, 55, 1)" : "rgba(31, 41, 55, 0)",
        backdropFilter: showFullNav ? "blur(12px)" : "blur(0px)"
      }}
      transition={{ duration: 0.4 }}
      className="fixed top-0 left-0 right-0 h-24 z-50 flex items-center justify-between px-6 md:px-12 border-b"
    >
      {/* Left side: Logo */}
      <div className="flex-1">
        <AnimatePresence>
          {showFullNav && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Link href="/" className="flex items-center gap-3 w-fit group">
                <div className="w-10 h-10 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3">
                  <svg width="100%" height="100%" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M50 10L85 30V70L50 90L15 70V30L50 10Z" stroke="#2563EB" strokeWidth="4" strokeLinejoin="round"/>
                    <circle cx="50" cy="50" r="8" fill="white"/>
                    <path d="M50 10V42M85 30L58 46M85 70L58 54M50 90V58M15 70L42 54M15 30L42 46" stroke="#2563EB" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </div>
                <span className="text-2xl font-black text-white tracking-wide">Nexus.ai</span>
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Right side: Actions */}
      <div className="flex items-center gap-6 justify-end flex-1">
        {pathname !== '/plugins' && (
          <Link 
            href="/plugins" 
            className="hidden sm:flex items-center gap-2 px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm font-bold text-gray-300 hover:text-white transition-all duration-300"
          >
            <Blocks className="w-4 h-4 text-blue-400" />
            Plugin Store
          </Link>
        )}
        
        <div className="p-[1px] rounded-xl bg-gradient-to-r from-blue-500/50 via-cyan-500/50 to-purple-500/50 hover:from-blue-400 hover:via-cyan-400 hover:to-purple-400 transition-colors duration-500 shadow-[0_0_20px_rgba(37,99,235,0.2)]">
          <WalletMultiButtonDynamic className="!bg-gray-950 hover:!bg-gray-900 transition-colors !rounded-xl !h-11 !px-6 !text-sm !font-bold" />
        </div>
      </div>
    </motion.nav>
  );
}