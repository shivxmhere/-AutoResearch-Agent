'use client';

import { useState, useEffect } from 'react';
import TaskSearchBar from '@/components/TaskSearchBar';
import AgentDNACard from '@/components/AgentDNACard';
import StreamingPanel from '@/components/StreamingPanel';
import Link from 'next/link';

export default function AgentVerseHome() {
  const [agents, setAgents] = useState<any[]>([]);
  const [matchedAgent, setMatchedAgent] = useState<any>(null);
  const [query, setQuery] = useState('');
  const [runningAgent, setRunningAgent] = useState<any>(null);

  useEffect(() => {
    // Fetch agents on mount
    const host = process.env.NEXT_PUBLIC_API_URL || '';
    fetch(`${host}/api/agents`)
      .then(res => res.json())
      .then(data => {
        if(data && Array.isArray(data)) setAgents(data);
      })
      .catch(console.error);
  }, []);

  const handleSearch = async (q: string) => {
    setQuery(q);
    try {
      const host = process.env.NEXT_PUBLIC_API_URL || '';
      const url = `${host}/api/agents/match`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: q })
      });
      const data = await res.json();
      setMatchedAgent(data);
    } catch (err) {
      console.error(err);
      // Fallback
      if (agents.length > 0) setMatchedAgent(agents[0]);
    }
  };

  const deployAgent = (agent: any) => {
    setRunningAgent(agent);
  };

  if (runningAgent) {
    return (
      <main className="min-h-screen bg-[var(--av-bg)] text-[var(--av-text-1)] font-display flex flex-col items-center justify-center p-6 relative z-10">
        <button 
          onClick={() => setRunningAgent(null)}
          className="absolute top-8 left-8 text-[var(--av-text-2)] hover:text-[var(--av-teal)] font-mono text-sm transition-colors"
        >
          ← Back to AgentVerse
        </button>
        <StreamingPanel 
          agentName={runningAgent.name} 
          query={query || 'Running default task...'} 
          agentId={runningAgent.id} 
        />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[var(--av-bg)] text-[var(--av-text-1)] font-display flex flex-col relative overflow-hidden">
      {/* Particle Background CSS Only */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none" style={{
        backgroundImage: 'radial-gradient(circle at 50% 50%, var(--av-teal) 0%, transparent 5%), radial-gradient(circle at 20% 80%, var(--av-teal) 0%, transparent 3%), radial-gradient(circle at 80% 20%, var(--av-teal) 0%, transparent 4%)',
        backgroundSize: '100px 100px',
        animation: 'pulse 10s infinite alternate'
      }}></div>
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes pulse { 0% { opacity: 0.1; } 100% { opacity: 0.3; } }
      `}} />

      <div className="flex-1 flex flex-col items-center justify-center pt-24 pb-12 px-6 z-10">
        <h1 className="text-5xl md:text-7xl font-bold mb-4 tracking-tight">
          Agent<span className="text-[var(--av-teal)]">Verse</span>
        </h1>
        <p className="text-xl md:text-2xl text-[var(--av-text-2)] mb-12 max-w-2xl text-center">
          The internet of agents — where every task finds its mind.
        </p>

        <div className="w-full mb-8">
          <TaskSearchBar 
            onSearch={handleSearch} 
            matchedAgent={matchedAgent} 
            onDeploy={() => deployAgent(matchedAgent)} 
          />
        </div>

        <Link href="/marketplace" className="text-[var(--av-text-3)] hover:text-[var(--av-teal)] transition-colors font-mono tracking-wider text-sm mt-4">
          or browse all agents →
        </Link>
      </div>

      <div className="w-full max-w-7xl mx-auto px-6 pb-24 z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {agents.slice(0, 3).map((agent, index) => (
            <div 
              key={agent.id} 
              className="animate-in slide-in-from-bottom-10 fade-in fill-mode-both"
              style={{ animationDelay: `${index * 150}ms`, animationDuration: '700ms' }}
            >
              <AgentDNACard agent={agent} onDeploy={() => deployAgent(agent)} />
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
