'use client';

import { useState, useEffect } from 'react';
import StreamingPanel from '@/components/StreamingPanel';
import Link from 'next/link';

export default function ArenaPage() {
  const [agents, setAgents] = useState<any[]>([]);
  const [agentA, setAgentA] = useState('autoresearch');
  const [agentB, setAgentB] = useState('competescope');
  const [query, setQuery] = useState('');
  const [isRacing, setIsRacing] = useState(false);

  useEffect(() => {
    const host = process.env.NEXT_PUBLIC_API_URL || 'https://agentverse-backend.vercel.app';
    const url = `${host}/api/agents`;
    fetch(url)
      .then(res => res.json())
      .then(data => {
        if(data && Array.isArray(data)) setAgents(data);
      })
      .catch(console.error);
  }, []);

  const handleStartArena = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query) return;
    setIsRacing(true);
  };

  return (
    <main className="min-h-screen bg-[var(--av-bg)] text-[var(--av-text-1)] font-display p-8">
      <div className="max-w-[1600px] mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link href="/" className="text-[var(--av-text-2)] hover:text-[var(--av-teal)] font-mono text-sm transition-colors mb-2 block">
              ← Back to Home
            </Link>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              Agent Arena <span className="text-[var(--av-teal)]">⚔️</span>
            </h1>
          </div>
        </div>

        {!isRacing ? (
          <div className="max-w-3xl mx-auto mt-24">
            <div className="bg-[var(--av-surface)] border border-[var(--av-border)] rounded-xl p-8 shadow-2xl">
              <h2 className="text-2xl mb-8 font-mono text-center">Configure Match</h2>
              
              <form onSubmit={handleStartArena} className="space-y-8">
                <div className="flex gap-8 justify-center items-center">
                  <div className="flex-1">
                    <label className="block text-sm font-mono text-[var(--av-text-3)] mb-2">Agent A</label>
                    <select 
                      value={agentA} 
                      onChange={e => setAgentA(e.target.value)}
                      className="w-full bg-[var(--av-surface-2)] border border-[var(--av-border)] text-white p-3 rounded font-mono focus:border-[var(--av-teal)] outline-none"
                    >
                      {agents.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                    </select>
                  </div>
                  
                  <div className="font-bold text-2xl text-[var(--av-text-3)] font-mono">VS</div>
                  
                  <div className="flex-1">
                    <label className="block text-sm font-mono text-[var(--av-text-3)] mb-2">Agent B</label>
                    <select 
                      value={agentB} 
                      onChange={e => setAgentB(e.target.value)}
                      className="w-full bg-[var(--av-surface-2)] border border-[var(--av-border)] text-white p-3 rounded font-mono focus:border-[var(--av-teal)] outline-none"
                    >
                      {agents.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-mono text-[var(--av-text-3)] mb-2">Task Prompt</label>
                  <input 
                    type="text"
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    placeholder="Enter a task for both agents to compete on..."
                    className="w-full bg-[var(--av-surface-2)] border border-[var(--av-border)] p-4 rounded font-mono focus:border-[var(--av-teal)] outline-none text-[var(--av-teal)]"
                  />
                </div>

                <button 
                  type="submit"
                  className="w-full py-4 bg-[var(--av-teal)] text-[var(--av-bg)] font-bold font-mono text-lg rounded hover:opacity-90 transition-opacity"
                >
                  START ARENA RACE →
                </button>
              </form>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <div className="border border-[var(--av-border)] rounded-xl overflow-hidden bg-[var(--av-surface)]">
              <div className="bg-[var(--av-surface-2)] p-4 border-b border-[var(--av-border)] font-mono flex justify-between items-center">
                 <span className="text-[var(--av-teal)] font-bold">🔴 {agents.find(a => a.id === agentA)?.name || agentA}</span>
              </div>
              <StreamingPanel 
                agentName={agents.find(a => a.id === agentA)?.name || agentA} 
                query={query} 
                agentId={agentA} 
              />
            </div>

            <div className="border border-[var(--av-border)] rounded-xl overflow-hidden bg-[var(--av-surface)]">
               <div className="bg-[var(--av-surface-2)] p-4 border-b border-[var(--av-border)] font-mono flex justify-between items-center">
                 <span className="text-blue-400 font-bold">🔵 {agents.find(a => a.id === agentB)?.name || agentB}</span>
              </div>
              <StreamingPanel 
                agentName={agents.find(a => a.id === agentB)?.name || agentB} 
                query={query} 
                agentId={agentB} 
              />
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
