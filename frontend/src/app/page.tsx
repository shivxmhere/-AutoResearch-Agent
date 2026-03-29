"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, FileText, Brain, CheckCircle, BarChart3,
  Zap, Shield, Globe, ArrowRight, Sparkles,
  Copy, Download, RefreshCw, ChevronDown,
  ExternalLink, AlertTriangle, TrendingUp, Clock,
  Bot, Network, Cpu, Activity, XCircle
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import confetti from "canvas-confetti";
import * as Progress from '@radix-ui/react-progress';
import * as Tabs from '@radix-ui/react-tabs';
import { clsx, type ClassValue } from "clsx";

import { startResearch } from "./lib/stream";
import type { AgentEvent, ResearchReport } from "./types";

// ==============================
// UTILITIES
// ==============================

function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

function formatTime(timestamp: number): string {
  const date = new Date(timestamp * 1000);
  return date.toLocaleTimeString("en-US", {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

// ==============================
// ANIMATION PATTERNS
// ==============================

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 30 } }
};

// ==============================
// COMPONENTS
// ==============================

const ParticleBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let particles: Array<{ x: number, y: number, vx: number, vy: number }> = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initParticles();
    };

    const initParticles = () => {
      particles = [];
      const numParticles = Math.floor((window.innerWidth * window.innerHeight) / 15000);
      for (let i = 0; i < numParticles; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.5,
          vy: (Math.random() - 0.5) * 0.5
        });
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "rgba(0, 212, 255, 0.15)";
      ctx.strokeStyle = "rgba(0, 212, 255, 0.05)";
      ctx.lineWidth = 1;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
        ctx.fill();

        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dist = Math.hypot(p.x - p2.x, p.y - p2.y);
          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      }
      animationFrameId = requestAnimationFrame(draw);
    };

    window.addEventListener('resize', resize);
    resize();
    draw();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      className="fixed inset-0 z-[-1] pointer-events-none"
    />
  );
};

const Header = ({ appState, completedAgentsCount }: { appState: string, completedAgentsCount: number }) => (
  <motion.header 
    initial={{ y: -20, opacity: 0 }}
    animate={{ y: 0, opacity: 1 }}
    className="fixed top-0 inset-x-0 z-50 glass border-b border-[var(--color-cyber-cyan)]/10 px-6 py-4 flex items-center justify-between"
  >
    <div className="flex items-center gap-3">
      <Bot className="w-6 h-6 text-[var(--color-cyber-cyan)]" />
      <div className="flex flex-col">
        <div className="flex items-center gap-1">
          <span className="font-bold text-lg gradient-text-cyan tracking-tight">AutoResearch</span>
          <span className="font-bold text-lg text-white tracking-tight">Agent</span>
        </div>
        <span className="text-[10px] text-slate-400 font-medium tracking-widest uppercase">Autonomous Multi-Agent System</span>
      </div>
    </div>

    <div className="hidden md:flex items-center justify-center">
      <div className="glass rounded-full px-4 py-1.5 flex items-center gap-2">
        {appState === 'idle' && (
          <><div className="w-2.5 h-2.5 rounded-full bg-[var(--color-cyber-green)]" /><span className="text-xs font-semibold text-slate-300">Ready</span></>
        )}
        {appState === 'researching' && (
          <><div className="w-2.5 h-2.5 rounded-full bg-[var(--color-cyber-cyan)] animate-pulse" /><span className="text-xs font-semibold text-[var(--color-cyber-cyan)]">{completedAgentsCount} Agents Completed</span></>
        )}
        {(appState === 'completed' || appState === 'error') && (
          <><div className={`w-2.5 h-2.5 rounded-full ${appState === 'error' ? 'bg-[var(--color-cyber-coral)]' : 'bg-[var(--color-cyber-green)]'}`} /><span className={`text-xs font-semibold ${appState === 'error' ? 'text-[var(--color-cyber-coral)]' : 'text-[var(--color-cyber-green)]'}`}>{appState === 'error' ? 'Error' : 'Report Ready'}</span></>
        )}
      </div>
    </div>

    <div className="flex items-center gap-4">
      <div className="hidden md:flex items-center gap-2">
        <span className="px-2.5 py-1 rounded text-[10px] font-bold bg-[#F59E0B20] text-[var(--color-cyber-gold)] border border-[var(--color-cyber-gold)]/20">
          Track 2: Agentic AI
        </span>
        <span className="px-2.5 py-1 rounded text-[10px] font-bold bg-[#00D4FF20] text-[var(--color-cyber-cyan)] border border-[var(--color-cyber-cyan)]/20 flex items-center gap-1">
          <Zap className="w-3 h-3" /> Groq
        </span>
      </div>
    </div>
  </motion.header>
);

const Footer = () => (
  <footer className="fixed bottom-0 inset-x-0 z-40 py-3 text-center pointer-events-none">
    <p className="text-[11px] font-medium text-slate-500 tracking-wider">
      Built by Shivam Singh • IIT Patna • Team TechLions • <span className="text-[var(--color-cyber-cyan)] opacity-70">Protex: Hack-2-Win 2026</span>
    </p>
  </footer>
);

// ==============================
// MAIN PAGE
// ==============================

type DepthLevel = 'quick' | 'standard' | 'deep';

const AGENTS_CONFIG = [
  { id: 'searcher', name: 'Searcher', icon: Globe, color: 'var(--color-cyber-cyan)', class: 'text-[var(--color-cyber-cyan)]' },
  { id: 'reader', name: 'Reader', icon: FileText, color: 'var(--color-cyber-violet)', class: 'text-[var(--color-cyber-violet)]' },
  { id: 'analyst', name: 'Analyst', icon: Brain, color: 'var(--color-cyber-green)', class: 'text-[var(--color-cyber-green)]' },
  { id: 'fact_checker', name: 'Fact Checker', icon: Shield, color: 'var(--color-cyber-gold)', class: 'text-[var(--color-cyber-gold)]' },
  { id: 'reporter', name: 'Reporter', icon: BarChart3, color: 'var(--color-cyber-coral)', class: 'text-[var(--color-cyber-coral)]' },
];

export default function AutoResearchPage() {
  const [appState, setAppState] = useState<'idle' | 'researching' | 'completed' | 'error'>("idle");
  const [query, setQuery] = useState("");
  const [depth, setDepth] = useState<DepthLevel>('standard');
  const [events, setEvents] = useState<AgentEvent[]>([]);
  const [report, setReport] = useState<ResearchReport | null>(null);
  const [activeAgent, setActiveAgent] = useState<string>("");
  const [completedAgents, setCompletedAgents] = useState<Set<string>>(new Set());
  const [progress, setProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState("");
  const [showConfetti, setShowConfetti] = useState(false);
  
  const eventsEndRef = useRef<HTMLDivElement>(null);
  const cleanupRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (eventsEndRef.current) {
      eventsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [events]);

  useEffect(() => {
    if (appState === 'completed' && !showConfetti) {
      setShowConfetti(true);
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#00D4FF', '#7C3AED', '#10B981', '#F59E0B']
      });
      setTimeout(() => setShowConfetti(false), 3000);
    }
  }, [appState]);

  const handleStart = async (overrideQuery?: string) => {
    const q = overrideQuery || query;
    if (!q.trim()) return;

    // Reset state
    setAppState("researching");
    setEvents([]);
    setReport(null);
    setCompletedAgents(new Set());
    setProgress(0);
    setErrorMsg("");
    setQuery(q);

    if (cleanupRef.current) cleanupRef.current();

    try {
      const cleanup = await startResearch(
        q,
        (evt: AgentEvent) => {
          setEvents(prev => [...prev, evt]);
          if (evt.progress) setProgress(evt.progress);
          if (evt.status === 'working') setActiveAgent(evt.agent);
          if (evt.status === 'error') {
            setActiveAgent("");
          }
          if (evt.status === 'done' || evt.status === 'error') {
            setCompletedAgents(prev => {
              const clone = new Set(prev);
              clone.add(evt.agent);
              return clone;
            });
            if (activeAgent === evt.agent) setActiveAgent("");
          }
        },
        (rep: ResearchReport) => {
          setReport(rep);
          setProgress(100);
          setAppState("completed");
          setActiveAgent("");
        },
        (err: string) => {
          setErrorMsg(err);
          setAppState("error");
          setActiveAgent("");
        }
      );
      cleanupRef.current = cleanup;
    } catch (e: any) {
      setErrorMsg(e.message || "Failed to start");
      setAppState("error");
    }
  };

  const getAgentStatus = (id: string) => {
    if (activeAgent === id || activeAgent === 'orchestrator' && id === 'orchestrator') return 'active';
    if (completedAgents.has(id)) return 'done';
    return 'idle';
  };

  // Prevent scroll when ResearchView is active
  useEffect(() => {
    if (appState !== 'idle') {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [appState]);

  return (
    <div className="min-h-screen relative font-sans text-slate-300">
      <ParticleBackground />
      <Header appState={appState} completedAgentsCount={completedAgents.size} />

      <main className="pt-24 pb-16 px-6 max-w-7xl mx-auto min-h-screen flex flex-col justify-center relative">
        <AnimatePresence mode="wait">
          {appState === 'idle' ? (
            <motion.div 
              key="hero"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0, y: -20, transition: { duration: 0.3 } }}
              className="w-full flex flex-col items-center justify-center my-auto"
            >
              <motion.div variants={itemVariants} className="px-4 py-1.5 rounded-full border border-[var(--color-cyber-cyan)]/30 bg-[var(--color-cyber-cyan)]/10 text-[var(--color-cyber-cyan)] flex items-center gap-2 mb-8 animate-float">
                <Sparkles className="w-4 h-4" />
                <span className="text-xs font-bold tracking-wider">🏆 Protex: Hack-2-Win 2026 • Track 2: Agentic AI</span>
                <span className="w-2 h-2 rounded-full bg-[var(--color-cyber-cyan)] animate-pulse ml-2" />
              </motion.div>

              <motion.div variants={itemVariants} className="text-center mb-8 relative">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-[var(--color-cyber-cyan)]/20 blur-[100px] rounded-full z-[-1]" />
                <h1 className="text-6xl md:text-[80px] font-black tracking-tighter text-white leading-tight mb-2">
                  Research <span className="opacity-90">Anything.</span>
                </h1>
                <h1 className="text-6xl md:text-[80px] font-black tracking-tighter gradient-text-cyan leading-tight drop-shadow-lg">
                  Know Everything.
                </h1>
                <p className="mt-6 text-lg text-slate-400 font-medium max-w-2xl mx-auto">
                  Five autonomous AI agents. One sentence input. Complete intelligence report.
                </p>
              </motion.div>

              <motion.div variants={itemVariants} className="flex items-center gap-4 mb-16 px-6 py-8 glass rounded-3xl w-full max-w-4xl relative overflow-hidden">
                <div className="shimmer absolute inset-0 opacity-20 pointer-events-none" />
                
                {AGENTS_CONFIG.map((agent, i) => (
                  <div key={agent.id} className="flex-1 flex flex-col items-center relative z-10 group cursor-default">
                    <motion.div 
                      whileHover={{ y: -4, scale: 1.05 }}
                      transition={{ type: "spring", stiffness: 400, damping: 25 }}
                      className="w-16 h-16 md:w-20 md:h-20 rounded-2xl glass flex items-center justify-center mb-3 border border-slate-700/50 group-hover:border-[var(--color-cyber-cyan)]/50 transition-colors shadow-lg shadow-black/50"
                    >
                      <agent.icon className={cn("w-8 h-8 opacity-70 group-hover:opacity-100 transition-opacity", agent.class)} />
                    </motion.div>
                    <span className="text-[11px] font-bold text-slate-400 tracking-wider uppercase">{agent.name}</span>
                    
                    {i < AGENTS_CONFIG.length - 1 && (
                      <div className="absolute top-8 left-[calc(50%+20px)] md:left-[calc(50%+28px)] right-[calc(-50%+20px)] md:right-[calc(-50%+28px)] h-[1px] bg-slate-800 -z-10 flex items-center justify-center">
                        <ArrowRight className="w-3 h-3 text-slate-600 absolute bg-[#0A1628] px-0.5" />
                      </div>
                    )}
                  </div>
                ))}
              </motion.div>

              <motion.div variants={itemVariants} className="w-full max-w-3xl glass p-3 rounded-2xl md:rounded-full flex flex-col md:flex-row items-center gap-3 backdrop-blur-2xl border border-[var(--color-cyber-cyan)]/20 shadow-[-10px_-10px_30px_4px_rgba(0,0,0,0.1),_10px_10px_30px_4px_rgba(0,212,255,0.05)]">
                <div className="flex-1 w-full pl-4 flex items-center min-h-[50px]">
                  <Search className="w-5 h-5 text-[var(--color-cyber-cyan)] mr-3 opacity-70" />
                  <input 
                    type="text"
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleStart()}
                    placeholder="Ask anything... e.g. 'Analyze the AI startup ecosystem in India 2025'"
                    className="w-full bg-transparent outline-none text-white text-[15px] md:text-lg font-medium placeholder:text-slate-500 placeholder:font-normal"
                  />
                </div>
                
                <div className="flex w-full md:w-auto items-center justify-between md:justify-end gap-3 px-2">
                  <div className="flex bg-[#0D1F35] rounded-full p-1 border border-slate-700/50">
                    {(['quick', 'standard', 'deep'] as DepthLevel[]).map(d => (
                      <button
                        key={d}
                        onClick={() => setDepth(d)}
                        className={cn(
                          "px-3 py-1.5 rounded-full text-xs font-semibold capitalize flex items-center gap-1 transition-all",
                          depth === d ? "bg-gradient-to-r from-[var(--color-cyber-cyan)] to-[var(--color-cyber-violet)] text-white shadow-lg glow-cyan" : "text-slate-400 hover:text-white"
                        )}
                      >
                        {d === 'quick' && <Zap className="w-3 h-3" />}
                        {d === 'standard' && <CheckCircle className="w-3 h-3" />}
                        {d === 'deep' && <Search className="w-3 h-3" />}
                        <span className="hidden sm:inline">{d}</span>
                      </button>
                    ))}
                  </div>
                  <motion.button 
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleStart()}
                    className="bg-gradient-to-r from-[var(--color-cyber-cyan)] to-[var(--color-cyber-violet)] text-white px-6 py-3 rounded-full font-bold shadow-lg glow-cyan flex items-center justify-center min-w-[140px]"
                  >
                    Start <ArrowRight className="w-4 h-4 ml-2" />
                  </motion.button>
                </div>
              </motion.div>

              <motion.div variants={itemVariants} className="mt-8 flex flex-wrap justify-center gap-2">
                {[
                  "AI startup ecosystem India 2025",
                  "Quantum computing breakthroughs",
                  "Gen Z financial habits 2025"
                ].map(ex => (
                  <button 
                    key={ex}
                    onClick={() => handleStart(ex)}
                    className="px-4 py-2 rounded-full glass text-xs font-medium text-slate-400 hover:text-white hover:border-[var(--color-cyber-cyan)]/50 transition-colors"
                  >
                    "{ex}"
                  </button>
                ))}
              </motion.div>

              <motion.div variants={containerVariants} className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl">
                <div className="glass p-5 rounded-2xl flex items-center gap-4">
                  <div className="p-3 bg-[var(--color-cyber-cyan)]/10 text-[var(--color-cyber-cyan)] rounded-xl"><Zap className="w-6 h-6" /></div>
                  <div><h4 className="font-bold text-white text-lg">&lt; 90 Seconds</h4><p className="text-xs text-slate-400">Full research cycle</p></div>
                </div>
                <div className="glass p-5 rounded-2xl flex items-center gap-4">
                  <div className="p-3 bg-[var(--color-cyber-violet)]/10 text-[var(--color-cyber-violet)] rounded-xl"><Globe className="w-6 h-6" /></div>
                  <div><h4 className="font-bold text-white text-lg">10+ Sources</h4><p className="text-xs text-slate-400">Analyzed per query</p></div>
                </div>
                <div className="glass p-5 rounded-2xl flex items-center gap-4">
                  <div className="p-3 bg-[var(--color-cyber-green)]/10 text-[var(--color-cyber-green)] rounded-xl"><Brain className="w-6 h-6" /></div>
                  <div><h4 className="font-bold text-white text-lg">LLaMA 3.3 70B</h4><p className="text-xs text-slate-400">Groq inference engine</p></div>
                </div>
              </motion.div>
            </motion.div>

          ) : (
            // ==========================================
            // RESEARCH VIEW (ACTIVE OR COMPLETE)
            // ==========================================
            <motion.div 
              key="research"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              className="w-full h-[calc(100vh-140px)] flex flex-col md:flex-row gap-6 mt-6 pb-6"
            >
              {appState === 'completed' && (
                <motion.div 
                  initial={{ opacity: 0, y: -50 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -50 }}
                  className="fixed top-24 right-6 z-50 glass border-[var(--color-cyber-green)] px-6 py-4 rounded-xl flex items-center shadow-xl glow-green bg-[var(--color-cyber-green)]/5"
                >
                  <CheckCircle className="w-6 h-6 text-[var(--color-cyber-green)] mr-3" />
                  <div>
                    <h4 className="text-white font-bold text-sm">Research Complete! 🎉</h4>
                    <p className="text-xs text-green-400/80">Your intelligence report is ready.</p>
                  </div>
                </motion.div>
              )}

              {/* LEFT PANEL - STATUS */}
              <div className="w-full md:w-[35%] flex flex-col glass rounded-2xl overflow-hidden border border-[var(--color-cyber-cyan)]/20 shadow-2xl h-full relative p-4 flex-shrink-0">
                <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--color-cyber-cyan)]/10 blur-[80px] -z-10 rounded-full" />
                
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-700/50">
                  <h3 className="font-bold text-white tracking-wide uppercase flex items-center gap-2">
                    <Activity className="w-4 h-4 text-[var(--color-cyber-cyan)]" /> Agent Activity
                  </h3>
                  <div className="flex items-center gap-2 text-xs font-mono text-slate-400 bg-slate-800/50 px-3 py-1.5 rounded-lg border border-slate-700">
                    <Clock className="w-3 h-3" /> Live Feed
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto pr-2 flex flex-col gap-3 custom-scrollbar mb-4 relative z-10">
                  {AGENTS_CONFIG.map(agent => {
                    const status = getAgentStatus(agent.id);
                    const isWorking = status === 'active';
                    let actionText = "Waiting for input...";
                    if (status === 'done') actionText = "Task completed successfully.";
                    if (isWorking) {
                      const latestEvent = [...events].reverse().find(e => e.agent === agent.id);
                      actionText = latestEvent ? latestEvent.message : "Processing...";
                    }

                    return (
                      <motion.div 
                        key={agent.id}
                        initial={false}
                        animate={{
                          borderColor: isWorking ? agent.color : 'rgba(30, 41, 59, 0.5)',
                          backgroundColor: isWorking ? `color-mix(in srgb, ${agent.color} 5%, transparent)` : 'transparent',
                          scale: isWorking ? 1.02 : 1
                        }}
                        className={cn(
                          "p-3 rounded-xl border flex items-center gap-4 transition-all duration-300 glass",
                          isWorking && "shadow-lg shadow-black/50"
                        )}
                        style={{ boxShadow: isWorking ? `0 0 15px color-mix(in srgb, ${agent.color} 20%, transparent)` : '' }}
                      >
                        <div className={cn("p-2 rounded-lg bg-slate-800", isWorking && "animate-pulse")} style={{ color: agent.color, backgroundColor: `color-mix(in srgb, ${agent.color} 15%, transparent)` }}>
                          <agent.icon className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className={cn("text-sm font-bold uppercase tracking-wider", isWorking ? "text-white" : "text-slate-400")}>{agent.name}</h4>
                          <p className="text-xs text-slate-500 truncate mt-0.5">{actionText}</p>
                        </div>
                        <div className="shrink-0 flex items-center justify-center w-6 h-6">
                          {status === 'idle' && <div className="w-2 h-2 rounded-full bg-slate-600" />}
                          {status === 'active' && <Loader2 color={agent.color} />}
                          {status === 'done' && <CheckCircle className="w-5 h-5 text-green-500" />}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                <div className="pt-4 border-t border-slate-700/50 mt-auto bg-[var(--bg-card)] rounded-xl px-4 py-3 border">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-white uppercase tracking-wider">Overall Progress</span>
                    <span className="text-xs font-mono text-[var(--color-cyber-cyan)]">{Math.round(progress)}%</span>
                  </div>
                  <Progress.Root className="h-2 bg-slate-800 rounded-full overflow-hidden" value={progress}>
                    <Progress.Indicator 
                      className="h-full bg-gradient-to-r from-[var(--color-cyber-cyan)] via-[var(--color-cyber-violet)] to-[var(--color-cyber-green)] transition-all duration-500 ease-out"
                      style={{ transform: `translateX(-${100 - progress}%)` }}
                    />
                  </Progress.Root>
                </div>

                {errorMsg && (
                   <div className="mt-3 bg-red-500/10 border border-red-500/30 p-3 rounded-lg flex items-start text-red-400 text-xs">
                     <AlertTriangle className="w-4 h-4 shrink-0 mr-2 mt-0.5" />
                     <p className="flex-1"><strong>Error:</strong> {errorMsg}</p>
                   </div>
                )}
              </div>

              {/* RIGHT PANEL - REPORT/TERMINAL */}
              <div className="w-full md:w-[65%] glass rounded-2xl flex flex-col border border-[var(--color-cyber-cyan)]/30 glow-cyan h-full overflow-hidden relative">
                
                {appState === 'researching' ? (
                  // LOADING TERMINAL LOGS
                  <div className="flex flex-col h-full bg-[#020817]/80 rounded-2xl overflow-hidden font-mono text-sm relative">
                     <div className="absolute inset-0 grid-bg opacity-30 pointer-events-none" />
                     <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-900/50">
                       <div className="flex gap-2"><div className="w-3 h-3 rounded-full bg-red-500/80"/><div className="w-3 h-3 rounded-full bg-yellow-500/80"/><div className="w-3 h-3 rounded-full bg-green-500/80"/></div>
                       <div className="text-xs text-slate-500">engine/logs.sh</div>
                     </div>
                     
                     <div className="flex-1 p-6 overflow-y-auto custom-scrollbar flex flex-col">
                        <div className="flex-1 space-y-2">
                          {events.length === 0 && <div className="text-slate-500">Connecting to orchestration node...</div>}
                          {events.map((evt, i) => (
                            <motion.div 
                              initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} 
                              key={i} className="flex gap-4 tracking-tight"
                            >
                              <span className="text-slate-600 shrink-0 w-20">[{formatTime(evt.timestamp || Date.now()/1000)}]</span>
                              <span className={cn(
                                "shrink-0 w-28 uppercase text-xs font-bold pt-0.5",
                                AGENTS_CONFIG.find(a => a.id === evt.agent)?.class || "text-slate-400"
                              )}>{evt.agent}</span>
                              <span className={cn("flex-1", evt.status === 'error' ? 'text-red-400' : 'text-slate-300')}>
                                {evt.status === 'done' ? `[OK] ${evt.message}` : evt.message}
                              </span>
                            </motion.div>
                          ))}
                          <div ref={eventsEndRef} />
                        </div>
                        
                        <div className="mt-8 pt-8 flex flex-col items-center justify-center border-t border-slate-800">
                           <div className="animate-spin-slow mb-4">
                              <Network className="w-12 h-12 text-[var(--color-cyber-cyan)] opacity-50" />
                           </div>
                           <h3 className="text-white font-sans font-bold text-lg mb-2">Generating Intelligence Report</h3>
                           <p className="text-slate-500 font-sans text-sm animate-pulse">Running advanced AI synthesis across multiple agents...</p>
                        </div>
                     </div>
                  </div>
                ) : report ? (
                  // RENDERED REPORT
                  <div className="flex flex-col h-full overflow-hidden bg-[var(--bg-secondary)]/30 rounded-2xl relative">
                    <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-[var(--color-cyber-cyan)] via-[var(--color-cyber-violet)] to-[var(--color-cyber-green)]" />
                    
                    <div className="px-6 py-5 border-b border-slate-700/50 bg-[#0A1628]/80 backdrop-blur-md sticky top-0 z-20 flex flex-col gap-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <h2 className="text-white font-bold text-xl md:text-2xl leading-tight truncate mb-1" title={report.query}>
                            {report.query}
                          </h2>
                          <p className="text-xs text-slate-400 font-mono flex items-center gap-2">
                            <Clock className="w-3 h-3" /> Generated in • {report.generated_at ? new Date().toLocaleTimeString() : 'Just now'}
                          </p>
                        </div>
                        <div className="shrink-0 flex flex-col items-end">
                          <div className="relative w-14 h-14 bg-slate-800 rounded-full flex items-center justify-center p-1 glow-cyan border border-[var(--color-cyber-cyan)]/30">
                            <svg className="absolute inset-0 w-full h-full -rotate-90">
                              <circle cx="28" cy="28" r="26" className="stroke-slate-700 fill-none" strokeWidth="4" />
                              <circle cx="28" cy="28" r="26" className="stroke-[var(--color-cyber-cyan)] fill-none stroke-[4px] stroke-linecap-round transition-all duration-1000 ease-out" 
                                strokeDasharray="163" strokeDashoffset={163 - (163 * (report.confidence_score || 0)) / 100} />
                            </svg>
                            <span className="text-[13px] font-black text-white relative z-10">{report.confidence_score || 85}</span>
                          </div>
                          <span className="text-[9px] uppercase font-bold text-slate-400 mt-1 tracking-widest">Confidence</span>
                        </div>
                      </div>
                    </div>

                    <Tabs.Root defaultValue="summary" className="flex-1 flex flex-col min-h-0">
                      <Tabs.List className="flex border-b border-slate-700/50 px-4 bg-[#0A1628]/90 z-20 overflow-x-auto no-scrollbar">
                        <Tabs.Trigger value="summary" className="tab-trigger">📋 Exec Summary</Tabs.Trigger>
                        <Tabs.Trigger value="findings" className="tab-trigger">🔍 Findings</Tabs.Trigger>
                        <Tabs.Trigger value="analysis" className="tab-trigger">📖 Deep Analysis</Tabs.Trigger>
                        <Tabs.Trigger value="sources" className="tab-trigger">🔗 Sources <span className="ml-1.5 text-[10px] bg-slate-700 px-1.5 rounded-full text-white">{report.sources?.length || 0}</span></Tabs.Trigger>
                      </Tabs.List>

                      <div className="flex-1 overflow-y-auto p-6 scroll-smooth custom-scrollbar relative">
                        <Tabs.Content value="summary" className="animate-in fade-in zoom-in-95 duration-300 outline-none">
                          <div className="glass p-6 rounded-2xl border border-slate-700">
                            <div className="prose prose-invert prose-cyan max-w-none text-slate-300 leading-relaxed text-[15px]">
                              <ReactMarkdown>
                                {report.executive_summary}
                              </ReactMarkdown>
                            </div>
                          </div>

                          {report.contradictions && report.contradictions.length > 0 && (
                            <div className="mt-6 bg-[var(--color-cyber-gold)]/10 border border-[var(--color-cyber-gold)]/30 p-5 rounded-2xl">
                              <h3 className="text-[var(--color-cyber-gold)] font-bold mb-3 flex items-center gap-2">
                                <AlertTriangle className="w-5 h-5" /> Contradictions Detected in Research
                              </h3>
                              <ul className="list-disc pl-5 text-sm text-slate-300 space-y-2">
                                {report.contradictions.map((c, i) => <li key={i}>{c}</li>)}
                              </ul>
                            </div>
                          )}
                        </Tabs.Content>

                        <Tabs.Content value="findings" className="animate-in fade-in zoom-in-95 duration-300 outline-none">
                          <div className="grid grid-cols-1 gap-4">
                            {(report.key_findings || []).map((finding, i) => (
                              <motion.div 
                                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                                key={i} className="glass p-4 rounded-xl border border-slate-700/50 flex gap-4 hover:border-[var(--color-cyber-cyan)]/30 transition-colors group"
                              >
                                <div className="shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-[var(--color-cyber-cyan)] to-[var(--color-cyber-violet)] flex items-center justify-center text-white font-bold text-sm shadow-md">
                                  {i + 1}
                                </div>
                                <p className="text-white text-[15px] leading-relaxed pt-1 group-hover:text-cyan-50 transition-colors">{finding}</p>
                              </motion.div>
                            ))}
                          </div>
                        </Tabs.Content>

                        <Tabs.Content value="analysis" className="animate-in fade-in zoom-in-95 duration-300 outline-none">
                          <div className="glass p-6 md:p-8 rounded-2xl border border-slate-700 markdown-body">
                            <div className="prose prose-invert max-w-none prose-headings:text-white prose-a:text-[var(--color-cyber-cyan)] prose-strong:text-white hover:prose-a:underline prose-p:leading-relaxed prose-p:text-slate-300 prose-pre:bg-slate-900 prose-pre:border prose-pre:border-slate-800">
                              <ReactMarkdown remarkPlugins={[remarkGfm as any]}>
                                {report.detailed_analysis}
                              </ReactMarkdown>
                            </div>
                          </div>
                        </Tabs.Content>

                        <Tabs.Content value="sources" className="animate-in fade-in zoom-in-95 duration-300 outline-none">
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            {(report.sources || []).map((source, i) => (
                              <a href={source.url} target="_blank" rel="noreferrer" key={i} className="block glass p-5 rounded-xl border border-slate-700/50 hover:border-[var(--color-cyber-cyan)]/50 transition-all hover:-translate-y-1 hover:shadow-lg glow-cyan group relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-[var(--color-cyber-cyan)] to-[var(--color-cyber-violet)]" />
                                <div className="flex justify-between items-start mb-2">
                                  <h4 className="text-white font-bold text-sm truncate flex-1 pr-4">{source.title}</h4>
                                  <ExternalLink className="w-4 h-4 text-slate-500 group-hover:text-[var(--color-cyber-cyan)] shrink-0" />
                                </div>
                                <p className="text-xs text-slate-400 line-clamp-2 mb-3 leading-relaxed">{source.snippet}</p>
                                <div className="flex items-center justify-between">
                                  <span className="text-[10px] text-[var(--color-cyber-cyan)] truncate max-w-[70%] font-mono bg-[var(--color-cyber-cyan)]/10 px-2 py-0.5 rounded">{new URL(source.url).hostname}</span>
                                  <div className="flex items-center gap-1.5">
                                    <div className="w-12 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                      <div className="h-full bg-[var(--color-cyber-green)]" style={{ width: `${(source.relevance_score || 0) * 100}%` }} />
                                    </div>
                                    <span className="text-[9px] font-bold text-slate-400">{Math.round((source.relevance_score || 0)*100)}%</span>
                                  </div>
                                </div>
                              </a>
                            ))}
                          </div>
                        </Tabs.Content>
                      </div>
                    </Tabs.Root>
                  </div>
                ) : (
                  <div className="m-auto text-slate-500 font-mono text-xs">Awaiting Research Completion...</div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
      
      {appState === 'idle' && <Footer />}
    </div>
  );
}

// Loader Component
const Loader2 = ({ color }: { color: string }) => (
  <svg className="w-5 h-5 animate-spin" style={{ color }} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);
