'use client';

import { ExternalLink, RotateCcw } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

export default function Header({ appState, resetState }: { appState: 'idle' | 'researching' | 'report', resetState: () => void }) {
  return (
    <header className="fixed top-0 left-0 w-full h-[56px] z-50 flex items-center justify-between px-6 bg-[#080C14]/85 backdrop-blur-[20px] saturate-[180%] border-b border-[var(--border)] shadow-[0_1px_0_rgba(34,211,238,0.05)]">
      
      {/* LEFT GROUP */}
      <div className="flex items-center">
        {/* Geometric Logo */}
        <svg width="24" height="24" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-3">
          <path d="M20 5L33 12.5L33 27.5L20 35L7 27.5L7 12.5L20 5Z" stroke="var(--cyan)" strokeWidth="1.5"/>
          <circle cx="20" cy="5" r="3" fill="var(--cyan)"/>
          <circle cx="7" cy="27.5" r="3" fill="var(--cyan)"/>
          <circle cx="33" cy="27.5" r="3" fill="var(--cyan)"/>
          <path d="M20 5L7 27.5M20 5L33 27.5M7 27.5L33 27.5" stroke="var(--cyan)" strokeWidth="1" strokeDasharray="2 2" opacity="0.5"/>
        </svg>

        <span className="font-display font-bold text-[17px] text-[var(--text-1)]">AutoResearch</span>
        <span className="font-display font-bold text-[17px] text-[var(--cyan)] ml-1">Agent</span>

        <div className="w-[1px] h-[16px] bg-[var(--border-2)] mx-3" />

        <span className="font-mono text-[9px] text-[var(--text-3)] tracking-[0.15em] uppercase hidden sm:block">
          Autonomous Multi-Agent System
        </span>
      </div>

      {/* CENTER GROUP */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center">
        <AnimatePresence mode="wait">
          {appState === 'researching' && (
            <motion.div 
              key="researching"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex items-center bg-[var(--bg-3)] border border-[var(--border-2)] rounded-full px-4 py-1.5"
            >
              <div className="w-2 h-2 rounded-full bg-[var(--amber)] pulse-dot mr-2" />
              <span className="text-[12px] font-medium text-[var(--text-2)]">Agents Running</span>
            </motion.div>
          )}
          {appState === 'report' && (
            <motion.div 
              key="report"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex items-center bg-[var(--bg-3)] border border-[var(--border-2)] rounded-full px-4 py-1.5"
            >
              <div className="w-2 h-2 rounded-full bg-[var(--green)] mr-2 shadow-[0_0_8px_var(--green-dim)]" />
              <span className="text-[12px] font-medium text-[var(--text-2)]">Report Ready</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* RIGHT GROUP */}
      <div className="flex items-center space-x-3">
        <div className="hidden md:flex border border-[var(--border-2)] rounded-full px-2 py-0.5 text-[var(--violet)] text-[10px] font-mono">
          Track 2: Agentic AI
        </div>
        <div className="w-[1px] h-[12px] bg-[var(--border-2)] hidden md:block" />
        <div className="hidden md:flex text-[var(--amber)] text-[10px] font-medium items-center">
          ⚡ Groq
        </div>
        <div className="w-[1px] h-[12px] bg-[var(--border-2)] hidden md:block" />
        
        <a href="https://github.com/shivxmhere/-AutoResearch-Agent" target="_blank" rel="noopener noreferrer" className="text-[var(--text-3)] hover:text-[var(--text-1)] transition-colors p-1">
          <ExternalLink size={16} />
        </a>

        <AnimatePresence>
          {appState === 'report' && (
            <>
              <div className="w-[1px] h-[12px] bg-[var(--border-2)]" />
              <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={resetState}
                className="flex items-center space-x-1 border border-[var(--cyan-dim)] bg-[rgba(34,211,238,0.05)] rounded-full px-3 py-1 text-[var(--cyan)] text-[12px] font-medium transition-colors hover:bg-[rgba(34,211,238,0.1)] glow-cyan"
              >
                <RotateCcw size={12} />
                <span>New Research</span>
              </motion.button>
            </>
          )}
        </AnimatePresence>
      </div>

    </header>
  );
}
