import React, { useState } from 'react';

interface TaskSearchBarProps {
  onSearch: (query: string) => void;
  matchedAgent?: any;
  onDeploy?: () => void;
}

export default function TaskSearchBar({ onSearch, matchedAgent, onDeploy }: TaskSearchBarProps) {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    onSearch(query);
  };

  return (
    <div className="w-full max-w-[680px] mx-auto">
      <form onSubmit={handleSubmit} className="relative group">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-[var(--av-teal)] to-blue-500 rounded-xl blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
        <div className="relative flex items-center bg-[var(--av-surface)] border border-[var(--av-border)] rounded-xl overflow-hidden focus-within:border-[var(--av-teal)] transition-colors">
          <span className="pl-6 text-[var(--av-teal)] font-mono text-lg">{'>'}</span>
          <input
            type="text"
            className="w-full bg-transparent border-none text-lg py-5 px-4 font-mono text-[var(--av-text-1)] placeholder-[var(--av-text-3)] focus:outline-none"
            placeholder="I need competitor research on Zepto vs Blinkit..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {!matchedAgent && (
            <button 
              type="submit"
              className="px-6 py-5 text-[var(--av-text-1)] font-mono font-medium hover:text-[var(--av-teal)] transition-colors border-l border-[var(--av-border)]"
            >
              Match
            </button>
          )}
        </div>
      </form>
      
      {matchedAgent && (
        <div className="mt-4 flex items-center justify-between p-4 bg-[var(--av-surface-2)] border border-[var(--av-border)] rounded-lg animate-in slide-in-from-top-2 fade-in duration-300">
          <div className="font-mono text-sm">
            <span className="text-[var(--av-text-3)]">Matched: </span>
            <span className="text-[var(--av-teal)]">{matchedAgent.name}</span>
          </div>
          <button 
            onClick={onDeploy}
            className="px-4 py-2 bg-[var(--av-teal)] text-[#080B0F] font-mono text-sm font-bold rounded hover:opacity-90 transition-opacity flex items-center gap-2"
          >
            Run {matchedAgent.name.split(' ')[0]} →
          </button>
        </div>
      )}
    </div>
  );
}
