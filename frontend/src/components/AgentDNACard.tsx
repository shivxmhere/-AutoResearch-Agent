import React from 'react';

interface AgentDNA {
  id: string;
  name: string;
  tagline: string;
  category: string;
  capabilities: string[];
  tools_used: string[];
  avg_speed_seconds: number;
  accuracy_score: number;
  cost_per_run: number;
  agent_count: number;
  input_type: string;
  output_type: string;
  total_runs: number;
  star_rating: number;
  author: string;
  version: string;
  status: 'live' | 'beta' | 'coming_soon';
}

interface AgentDNACardProps {
  agent: AgentDNA;
  onDeploy?: () => void;
}

export default function AgentDNACard({ agent, onDeploy }: AgentDNACardProps) {
  const statusColor = agent.status === 'live' ? 'var(--av-teal)' : agent.status === 'beta' ? 'var(--av-amber)' : 'var(--av-text-2)';
  const statusText = agent.status.toUpperCase().replace('_', ' ');

  return (
    <div className="av-card p-6 flex flex-col h-full font-display">
      <div className="flex justify-between items-start mb-4">
        <div>
          <div className="text-xs font-mono font-bold tracking-wider mb-2" style={{ color: statusColor }}>
            [{statusText}]
          </div>
          <h3 className="text-xl font-bold mb-1">{agent.name} <span className="text-sm font-normal text-[var(--av-text-2)] ml-2" style={{fontFamily: 'JetBrains Mono', color: 'var(--av-text-3)'}}>v{agent.version}</span></h3>
        </div>
      </div>
      
      <p className="text-[var(--av-text-2)] text-sm mb-6 flex-grow">{agent.tagline}</p>
      
      <div className="flex gap-4 font-mono text-sm mb-6 [&>div]:flex [&>div]:items-center [&>div]:gap-1">
        <div><span>⚡</span> <span>{agent.avg_speed_seconds}s</span></div>
        <div><span>🎯</span> <span>{agent.accuracy_score * 100}%</span></div>
        <div><span>💰</span> <span>${agent.cost_per_run.toFixed(2)}</span></div>
        <div><span>🤖</span> <span>{agent.agent_count} ag</span></div>
      </div>

      <div className="text-xs mb-4">
        <span className="text-[var(--av-text-3)] font-mono">Tools: </span>
        <span className="text-[var(--av-text-2)] font-mono">
          {agent.tools_used.slice(0, 3).map((t, i) => `[${t}]`).join(' ')} 
          {agent.tools_used.length > 3 ? ` [+${agent.tools_used.length - 3}]` : ''}
        </span>
      </div>

      <div className="flex items-center gap-2 mb-6 text-sm text-[var(--av-text-2)]">
        <span className="text-[var(--av-teal)]">★★★★★</span>
        <span className="font-mono">{agent.star_rating} • {agent.total_runs.toLocaleString()} runs</span>
      </div>

      <button 
        onClick={onDeploy}
        className="mt-auto w-full py-3 bg-[var(--av-surface-2)] border border-[var(--av-border)] hover:border-[var(--av-teal)] hover:text-[var(--av-teal)] transition-all font-mono text-sm rounded-lg flex justify-center items-center gap-2 group"
      >
        [ Deploy Agent <span className="group-hover:translate-x-1 transition-transform">→</span> ]
      </button>
    </div>
  );
}
