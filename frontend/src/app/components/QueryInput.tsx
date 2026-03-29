"use client";

import { useState, useRef, useEffect } from "react";

interface QueryInputProps {
  onSubmit: (query: string, depth: string, maxSources: number) => void;
  isLoading: boolean;
}

const EXAMPLE_QUERIES = [
  "Analyze the AI startup ecosystem in India 2025",
  "Compare React vs Vue vs Svelte for enterprise apps 2025",
  "What are the biggest challenges in quantum computing today?",
  "Research the current state of gene therapy clinical trials",
  "How is AI transforming drug discovery in 2025?",
];

const DEPTHS = [
  { id: "quick",    label: "Quick",    time: "~30s",  icon: "⚡" },
  { id: "standard", label: "Standard", time: "~60s",  icon: "🎯" },
  { id: "deep",     label: "Deep",     time: "~120s", icon: "🔬" },
];

export default function QueryInput({ onSubmit, isLoading }: QueryInputProps) {
  const [query, setQuery] = useState("");
  const [depth, setDepth] = useState("standard");
  const [maxSources, setMaxSources] = useState(10);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    const ta = textareaRef.current;
    if (ta) {
      ta.style.height = "auto";
      ta.style.height = Math.min(ta.scrollHeight, 180) + "px";
    }
  }, [query]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim() && !isLoading) {
      onSubmit(query.trim(), depth, maxSources);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="animate-slide-up" style={{ animationDelay: "0.2s" }}>
      {/* Input Area */}
      <div className="relative group">
        <textarea
          ref={textareaRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask anything... e.g. 'Analyze the AI startup ecosystem in India 2025'"
          disabled={isLoading}
          rows={3}
          className="w-full p-5 pr-36 bg-[var(--bg-card)] border border-[var(--border-card)] rounded-2xl text-[var(--text-primary)] placeholder-[var(--text-muted)] resize-none transition-all duration-300 focus:outline-none focus:border-[var(--cyan)] focus:glow-cyan-sm text-[15px] leading-relaxed"
          style={{ minHeight: "80px" }}
        />
        <div className="absolute right-3 bottom-3 flex items-center gap-2">
          <span className="text-xs text-[var(--text-muted)] font-mono">
            {query.length}
          </span>
          <button
            type="submit"
            disabled={isLoading || !query.trim()}
            className="btn-primary flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin-slow h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Researching...
              </>
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
                </svg>
                Start Research
              </>
            )}
          </button>
        </div>
      </div>

      {/* Controls Row */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
        {/* Depth Selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-[var(--text-muted)] uppercase tracking-wider font-medium">Depth:</span>
          <div className="flex gap-1.5">
            {DEPTHS.map((d) => (
              <button
                key={d.id}
                type="button"
                onClick={() => setDepth(d.id)}
                className={`tab ${depth === d.id ? "tab-active" : ""} flex items-center gap-1.5 text-xs`}
              >
                <span>{d.icon}</span>
                <span>{d.label}</span>
                <span className="text-[10px] opacity-60">{d.time}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Max Sources */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-[var(--text-muted)] uppercase tracking-wider font-medium">Sources:</span>
          <input
            type="range"
            min={3}
            max={15}
            value={maxSources}
            onChange={(e) => setMaxSources(Number(e.target.value))}
            className="w-20 h-1 accent-[var(--cyan)] cursor-pointer"
          />
          <span className="text-xs font-mono text-[var(--cyan)] w-4">{maxSources}</span>
        </div>
      </div>

      {/* Keyboard Hint */}
      <div className="mt-2 text-right">
        <span className="text-[10px] text-[var(--text-muted)]">
          Press <kbd className="px-1.5 py-0.5 bg-[var(--bg-card)] border border-[var(--border-card)] rounded text-[var(--text-secondary)] text-[10px] font-mono">Ctrl+Enter</kbd> to start
        </span>
      </div>

      {/* Example Queries */}
      <div className="mt-5">
        <span className="text-xs text-[var(--text-muted)] uppercase tracking-wider font-medium">Try an example:</span>
        <div className="mt-2 flex flex-wrap gap-2">
          {EXAMPLE_QUERIES.map((eq) => (
            <button
              key={eq}
              type="button"
              onClick={() => setQuery(eq)}
              className="px-3 py-1.5 text-xs rounded-full border border-[var(--border-card)] text-[var(--text-secondary)] hover:border-[var(--cyan)] hover:text-[var(--cyan)] hover:bg-[var(--cyan-dim)] transition-all duration-200 truncate max-w-[280px]"
            >
              {eq}
            </button>
          ))}
        </div>
      </div>
    </form>
  );
}
