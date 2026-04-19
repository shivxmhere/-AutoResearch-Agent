'use client';

import { useState, useEffect } from 'react';
import AgentDNACard from '@/components/AgentDNACard';
import Link from 'next/link';

export default function MarketplacePage() {
  const [agents, setAgents] = useState<any[]>([]);

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

  return (
    <main className="min-h-screen bg-[var(--av-bg)] text-[var(--av-text-1)] font-display p-12">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-12 border-b border-[var(--av-border)] pb-8">
          <div>
            <Link href="/" className="text-[var(--av-text-2)] hover:text-[var(--av-teal)] font-mono text-sm transition-colors mb-4 block">
              ← Back to Home
            </Link>
            <h1 className="text-4xl font-bold">Agent Marketplace</h1>
            <p className="text-[var(--av-text-2)] mt-2">Discover, deploy, and chain autonomous agents.</p>
          </div>
          <Link href="/arena" className="px-6 py-3 bg-[var(--av-surface-2)] border border-[var(--av-border)] hover:border-[var(--av-teal)] text-[var(--av-teal)] rounded font-mono transition-all">
            Enter Agent Arena ⚔️
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {agents.map((agent) => (
            <div key={agent.id}>
              <AgentDNACard 
                agent={agent} 
                onDeploy={() => window.location.href = `/?agent=${agent.id}`} 
              />
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
