'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Globe, FileText, Brain, ShieldCheck, BarChart2, Search, ArrowRight, Loader2 } from 'lucide-react';
import clsx from 'clsx';
import { AgentEvent } from '../types';

interface HeroProps {
  onStart: (query: string, depth: string) => void;
  isStarting: boolean;
  activeAgent: string;
  progress: number;
}

const AGENTS = [
  { id: 'searcher', label: 'SEARCHER', icon: Globe, color: 'var(--cyan)' },
  { id: 'reader', label: 'READER', icon: FileText, color: 'var(--violet)' },
  { id: 'analyst', label: 'ANALYST', icon: Brain, color: 'var(--green)' },
  { id: 'fact_checker', label: 'FACT CHECK', icon: ShieldCheck, color: 'var(--amber)' },
  { id: 'reporter', label: 'REPORTER', icon: BarChart2, color: 'var(--pink)' },
];

const CHIPS = [
  "AI regulation India 2025",
  "Quantum computing breakthroughs",
  "Gen Z financial habits",
  "Climate tech investment trends"
];

export default function Hero({ onStart, isStarting, activeAgent, progress }: HeroProps) {
  const [query, setQuery] = useState('');
  const [depth, setDepth] = useState('standard');
  const [stats, setStats] = useState({ seconds: 0, sources: 0 });

  // Number animation
  useEffect(() => {
    let frame: number;
    const startTime = Date.now();
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / 2000, 1);
      
      // Easing out
      const ease = 1 - Math.pow(1 - progress, 3);
      
      setStats({
        seconds: Math.floor(ease * 90),
        sources: Math.floor(ease * 10)
      });
      
      if (progress < 1) frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim() && !isStarting) {
      onStart(query.trim(), depth);
    }
  };

  const getAgentState = (agentId: string, index: number) => {
    if (!isStarting) return 'idle';
    
    // Simple state detection based on progress or active agent string
    const agentIndex = ['searcher', 'reader', 'analyst', 'fact_checker', 'reporter'].indexOf(activeAgent);
    if (agentIndex > index) return 'done';
    if (agentIndex === index) return 'active';
    return 'idle';
  };

  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-center pt-[56px] relative z-10">
      
      {/* Background Grid */}
      <div 
        className="absolute inset-0 z-[-1] opacity-30 pointer-events-none"
        style={{
          backgroundImage: 'linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)',
          backgroundSize: '48px 48px'
        }}
      />

      <div className="w-full max-w-[800px] flex flex-col items-center px-4">
        
        {/* Top Badge */}
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          className="flex items-center gap-2 bg-[rgba(34,211,238,0.06)] border border-[rgba(34,211,238,0.2)] rounded-full px-4 py-1.5 mb-8"
        >
          <Sparkles size={12} color="var(--cyan)" />
          <span className="text-[12px] font-medium text-[var(--text-2)]">
            Protex: Hack-2-Win 2026 • Track 2: Agentic AI
          </span>
          <div className="w-1.5 h-1.5 rounded-full bg-[var(--green)] pulse-dot ml-1" />
        </motion.div>

        {/* Headlines */}
        <h1 className="text-center mb-6">
          <div className="flex justify-center flex-wrap gap-x-4">
            {"Research Anything.".split(' ').map((word, i) => (
              <motion.span 
                key={i}
                initial={{ y: 40, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 25, delay: i * 0.05 }}
                className="font-display font-extrabold text-[80px] leading-[1.1] text-[var(--text-1)] tracking-tight"
              >
                {word}
              </motion.span>
            ))}
          </div>
          <div className="flex justify-center flex-wrap gap-x-4">
            {"Know Everything.".split(' ').map((word, i) => (
              <motion.span 
                key={i}
                initial={{ y: 40, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 25, delay: 0.15 + i * 0.05 }}
                className="font-display font-extrabold text-[80px] leading-[1.1] tracking-tight bg-clip-text text-transparent"
                style={{ backgroundImage: 'linear-gradient(135deg, var(--cyan) 0%, var(--violet) 100%)' }}
              >
                {word}
              </motion.span>
            ))}
          </div>
        </h1>

        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 1 }}
          className="text-center text-[18px] font-light text-[var(--text-2)] max-w-[520px] mb-12"
        >
          Five autonomous AI agents. One sentence input. Complete intelligence report.
        </motion.p>

        {/* Pipeline Visual */}
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.7, type: 'spring' }}
          className="flex items-center justify-center mb-10 h-[100px]"
        >
          {AGENTS.map((agent, i) => {
            const state = getAgentState(agent.id, i);
            const Icon = agent.icon;
            
            return (
              <div key={agent.id} className="flex items-center">
                
                {/* Card */}
                <motion.div 
                  layout
                  className={clsx(
                    "flex flex-col items-center justify-start pt-[24px] w-[80px] h-[88px] rounded-[10px] border relative transition-colors duration-300",
                    state === 'idle' && "bg-[var(--bg-3)] border-[var(--border)]",
                    state === 'active' && "bg-[var(--bg-3)]",
                    state === 'done' && "bg-[var(--bg-3)] border-[rgba(52,211,153,0.4)]"
                  )}
                  style={{
                    backgroundColor: state === 'active' ? `rgba(var(--${agent.id}-rgb, 34,211,238), 0.06)` : undefined,
                    borderColor: state === 'active' ? agent.color : undefined,
                    opacity: state === 'active' ? 1 : state === 'done' ? 1 : 1
                  }}
                >
                  {state === 'active' && (
                     <div 
                        className="absolute inset-0 rounded-[10px] agent-working pointer-events-none" 
                        style={{ boxShadow: `0 0 0 0 ${agent.color}` }}
                     />
                  )}
                  
                  <Icon size={28} color={state === 'active' ? agent.color : state === 'done' ? 'var(--green)' : 'var(--text-3)'} className="mb-3 transition-colors duration-300" />
                  
                  <span className="font-sans font-medium text-[9px] uppercase tracking-[0.1em]" style={{ color: state === 'idle' ? 'var(--text-3)' : 'var(--text-1)' }}>
                    {agent.label}
                  </span>
                  
                  {state === 'done' && (
                    <motion.div 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-1 -right-1 bg-[var(--bg)] rounded-full"
                    >
                      <ShieldCheck size={14} color="var(--green)" />
                    </motion.div>
                  )}
                </motion.div>

                {/* Arrow */}
                {i < AGENTS.length - 1 && (
                  <div className="w-[32px] flex items-center justify-center relative">
                    <svg width="24" height="2" className="overflow-visible">
                      <line x1="0" y1="1" x2="24" y2="1" stroke={state === 'done' ? 'var(--green)' : 'var(--border-2)'} strokeWidth="2" strokeDasharray={state === 'active' ? "4 4" : "none"} className={state === 'active' ? 'animate-[scan_1s_linear_infinite]' : ''} />
                      <polygon points="24,1 20,-2 20,4" fill={state === 'done' ? 'var(--green)' : 'var(--border-2)'} />
                    </svg>
                  </div>
                )}

              </div>
            );
          })}
        </motion.div>

        {/* Input Box */}
        <motion.form 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.8, type: 'spring' }}
          onSubmit={handleSubmit}
          className="w-full max-w-[680px] bg-[var(--bg-2)] border border-[var(--border-2)] rounded-[14px] p-4 transition-all duration-200 focus-within:border-[var(--cyan-dim)] focus-within:shadow-[0_0_0_3px_rgba(34,211,238,0.08),0_0_0_1px_var(--cyan-dim)]"
        >
          <div className="flex items-start pb-3 border-b border-[var(--border)]">
            <AnimatePresence>
              {!query && (
                <motion.div exit={{ opacity: 0, width: 0 }} className="pt-1 mr-3 shrink-0">
                  <Search size={16} color="var(--text-3)" />
                </motion.div>
              )}
            </AnimatePresence>
            
            <textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="E.g. What are the key differences between autonomous agents and standard LLMs?"
              className="w-full bg-transparent border-none outline-none text-[16px] text-[var(--text-1)] placeholder:text-[var(--text-3)] font-sans resize-none"
              rows={query.length > 80 ? 2 : 1}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
            />
          </div>

          <div className="flex items-center justify-between pt-3">
            {/* Depth Selector */}
            <div className="bg-[var(--bg-3)] rounded-lg p-1 inline-flex relative">
              {['quick', 'standard', 'deep'].map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDepth(d)}
                  className={clsx(
                    "relative px-3 py-1 font-sans text-[12px] font-medium transition-colors z-10",
                    depth === d ? "text-[var(--text-1)]" : "text-[var(--text-3)] hover:text-[var(--text-2)]"
                  )}
                >
                  {depth === d && (
                    <motion.div 
                      layoutId="depth-bg"
                      className="absolute inset-0 bg-[var(--bg)] rounded-md shadow-sm z-[-1]"
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    />
                  )}
                  {d === 'quick' && '⚡ Quick'}
                  {d === 'standard' && '◎ Standard'}
                  {d === 'deep' && '⬡ Deep'}
                </button>
              ))}
            </div>

            {/* Start Button */}
            <motion.button
              type="submit"
              disabled={!query.trim() || isStarting}
              whileHover={{ scale: 1.02, y: -1, filter: 'brightness(1.1)' }}
              whileTap={{ scale: 0.97 }}
              className="flex items-center justify-center rounded-[10px] px-5 py-2.5 outline-none border-none glow-cyan disabled:opacity-50 disabled:pointer-events-none"
              style={{ background: 'linear-gradient(135deg, var(--cyan-dim) 0%, #0E7490 100%)' }}
            >
              {isStarting ? (
                <>
                  <Loader2 size={16} className="animate-spin text-white mr-2" />
                  <span className="font-sans font-medium text-[14px] text-white">Researching...</span>
                </>
              ) : (
                <>
                  <span className="font-sans font-medium text-[14px] text-white mr-2">Start Research</span>
                  <ArrowRight size={16} className="text-white" />
                </>
              )}
            </motion.button>
          </div>
        </motion.form>

        {/* Chips */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="flex flex-wrap items-center justify-center gap-2 mt-6 max-w-[680px]"
        >
          {CHIPS.map((chip, i) => (
            <button
              key={i}
              onClick={() => { setQuery(chip); }}
              className="px-3 py-1 bg-transparent border border-[var(--border)] rounded-full text-[12px] text-[var(--text-3)] font-sans hover:border-[var(--border-2)] hover:text-[var(--text-2)] hover:-translate-y-[1px] transition-all"
            >
              {chip}
            </button>
          ))}
        </motion.div>

        {/* Bottom Stats */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.8 }}
          className="flex items-center justify-center mt-16 space-x-8"
        >
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-2 text-[var(--cyan)] mb-1">
              <span className="font-display font-bold text-[18px]">{'<'}{stats.seconds}s</span>
            </div>
            <span className="font-sans text-[12px] text-[var(--text-3)]">Full research</span>
          </div>
          
          <div className="w-[1px] h-8 bg-[var(--border-2)]" />
          
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-2 text-[var(--violet)] mb-1">
              <span className="font-display font-bold text-[18px]">{stats.sources}+</span>
            </div>
            <span className="font-sans text-[12px] text-[var(--text-3)]">Sources analyzed</span>
          </div>

          <div className="w-[1px] h-8 bg-[var(--border-2)]" />
          
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-2 text-[var(--green)] mb-1">
              <span className="font-display font-bold text-[18px]">LLaMA 3</span>
            </div>
            <span className="font-sans text-[12px] text-[var(--text-3)]">70B Inference</span>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
