'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Terminal, CheckCircle2, Copy, PlayCircle, Loader2, FileText } from 'lucide-react';
import { AgentEvent } from '../types';
import { useToast } from './ToastContext';

interface ResearchViewProps {
  events: AgentEvent[];
  report: string | null;
  activeAgent: string;
  progress: number;
}

export default function ResearchView({ events, report, activeAgent, progress }: ResearchViewProps) {
  const logRef = useRef<HTMLDivElement>(null);
  const { addToast } = useToast();
  const [copied, setCopied] = useState(false);

  // Auto-scroll logs
  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [events]);

  const handleCopy = () => {
    if (report) {
      navigator.clipboard.writeText(report);
      setCopied(true);
      addToast('Report copied to clipboard', 'success');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const isComplete = !!report;

  return (
    <div className="w-full flex-1 flex flex-col lg:flex-row pt-[56px] h-screen max-h-screen overflow-hidden">
      
      {/* Left: Terminal / Event Log */}
      <div className="w-full lg:w-[40%] flex flex-col border-r border-[var(--border)] bg-[var(--bg-2)]">
        
        {/* Terminal Header */}
        <div className="h-[48px] border-b border-[var(--border)] flex items-center px-4 bg-[var(--bg-3)] shrink-0">
          <Terminal size={14} className="text-[var(--text-3)] mr-2" />
          <span className="font-mono text-[11px] text-[var(--text-2)] uppercase tracking-wider">Research Terminal</span>
          <div className="ml-auto flex items-center space-x-2">
            {!isComplete && <div className="w-2 h-2 rounded-full bg-[var(--amber)] pulse-dot" />}
            {isComplete && <div className="w-2 h-2 rounded-full bg-[var(--green)] glow-green" />}
          </div>
        </div>

        {/* Global Progress Bar */}
        <div className="h-[2px] w-full bg-[var(--bg-3)] relative">
          <motion.div 
            className="absolute top-0 left-0 h-full glow-cyan"
            style={{ backgroundImage: 'linear-gradient(90deg, var(--cyan-dim) 0%, var(--cyan) 100%)' }}
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ ease: 'easeOut', duration: 0.5 }}
          />
        </div>

        {/* Log Viewer */}
        <div 
          ref={logRef}
          className="flex-1 overflow-y-auto p-4 space-y-3 font-mono text-[13px] custom-scrollbar"
        >
          <AnimatePresence initial={false}>
            {events.map((event, i) => {
              const isDone = event.status === 'done';
              const isError = event.status === 'error';
              
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-start"
                >
                  <span className="text-[var(--text-3)] shrink-0 w-[60px] select-none text-[11px] leading-[1.6]">
                    {new Date().toISOString().substring(11, 19)}
                  </span>
                  <div className="flex flex-col ml-2">
                    <div className="flex items-center">
                      <span className="text-[var(--violet)] font-bold uppercase mr-2 text-[11px]">
                        [{event.agent}]
                      </span>
                      <span className={
                        isError ? 'text-[var(--red)]' : 
                        isDone ? 'text-[var(--green)]' : 
                        'text-[var(--text-1)]'
                      }>
                        {event.message}
                      </span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
          
          {!isComplete && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center text-[var(--text-3)] ml-[68px] mt-2"
            >
              <div className="w-1.5 h-3 bg-[var(--text-2)] cursor-blink" />
            </motion.div>
          )}
        </div>
      </div>

      {/* Right: Report View */}
      <div className="w-full lg:w-[60%] flex flex-col bg-[var(--bg)] relative">
        <div className="h-[48px] border-b border-[var(--border)] flex items-center px-6 justify-between shrink-0 bg-[var(--bg-2)]/80 backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center">
            <FileText size={16} className="text-[var(--text-3)] mr-2" />
            <span className="font-sans font-medium text-[14px] text-[var(--text-1)]">Intelligence Report</span>
          </div>
          
          <div className="flex items-center">
             {isComplete ? (
              <button 
                onClick={handleCopy}
                className="flex items-center space-x-1 hover:bg-[var(--bg-3)] border border-[var(--border)] rounded px-2 py-1 text-[12px] text-[var(--text-2)] hover:text-[var(--text-1)] transition-colors"
              >
                {copied ? <CheckCircle2 size={14} className="text-[var(--green)]" /> : <Copy size={14} />}
                <span>{copied ? 'Copied' : 'Copy markdown'}</span>
              </button>
             ) : (
               <div className="flex items-center bg-[rgba(34,211,238,0.05)] border border-[rgba(34,211,238,0.2)] rounded px-2 py-1 text-[12px] text-[var(--cyan)]">
                 <Loader2 size={12} className="animate-spin mr-1.5" />
                 Synthesizing...
               </div>
             )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-8 relative scroll-smooth custom-scrollbar">
          {!report ? (
             <SkeletonLoader activeAgent={activeAgent} />
          ) : (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="prose prose-invert max-w-none prose-pre:bg-[var(--bg-2)] prose-pre:border prose-pre:border-[var(--border)] prose-a:text-[var(--cyan)] hover:prose-a:text-[var(--cyan-dim)] prose-headings:font-display prose-headings:font-bold prose-h1:text-[32px] prose-h2:text-[24px]"
            >
              <ReactMarkdown
                components={{
                  code({node, inline, className, children, ...props}: any) {
                    const match = /language-(\w+)/.exec(className || '')
                    return !inline && match ? (
                      <SyntaxHighlighter
                        style={vscDarkPlus as any}
                        language={match[1]}
                        PreTag="div"
                        {...props}
                      >
                        {String(children).replace(/\n$/, '')}
                      </SyntaxHighlighter>
                    ) : (
                      <code className="bg-[var(--bg-3)] text-[var(--pink)] px-1.5 py-0.5 rounded text-[0.9em]" {...props}>
                        {children}
                      </code>
                    )
                  }
                }}
              >
                {report}
              </ReactMarkdown>
            </motion.div>
          )}
        </div>
      </div>

    </div>
  );
}

function SkeletonLoader({ activeAgent }: { activeAgent: string }) {
  // Fun skeleton text based on what agent is running
  const getText = () => {
    switch (activeAgent) {
      case 'searcher': return 'Querying web indices...';
      case 'reader': return 'Extracting source text...';
      case 'analyst': return 'Formulating insights...';
      case 'fact_checker': return 'Verifying claims...';
      case 'reporter': return 'Drafting final markdown...';
      default: return 'Initializing...';
    }
  };

  return (
    <div className="w-full max-w-3xl space-y-8 animate-pulse opacity-50">
      
      {/* Title block */}
      <div className="space-y-3">
        <div className="h-8 w-3/4 bg-[var(--bg-3)] rounded shimmer" />
        <div className="h-4 w-1/4 bg-[var(--bg-3)] rounded shimmer" />
      </div>

      {/* Paragraphs */}
      <div className="space-y-4">
        <div className="h-4 w-full bg-[var(--bg-3)] rounded shimmer" />
        <div className="h-4 w-full bg-[var(--bg-3)] rounded shimmer" />
        <div className="h-4 w-5/6 bg-[var(--bg-3)] rounded shimmer" />
      </div>

      {/* Box */}
      <div className="h-[120px] w-full bg-[var(--bg-2)] border border-[var(--border)] rounded-lg shimmer flex items-center justify-center relative overflow-hidden">
         <div className="flex flex-col items-center">
            <Loader2 size={24} className="text-[var(--cyan)] animate-spin mb-3" />
            <p className="font-mono text-[12px] text-[var(--text-2)]">{getText()}</p>
         </div>
         {/* Grid overlay */}
         <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wNSkiLz48L3N2Zz4=')] pointer-events-none" />
      </div>

      <div className="space-y-4">
        <div className="h-4 w-full bg-[var(--bg-3)] rounded shimmer" />
        <div className="h-4 w-4/5 bg-[var(--bg-3)] rounded shimmer" />
      </div>

    </div>
  );
}
