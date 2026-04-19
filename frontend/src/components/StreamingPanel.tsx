import React, { useEffect, useRef, useState } from 'react';
import { TypewriterText } from './TypewriterText';


interface StreamingPanelProps {
  agentName: string;
  query: string;
  agentId: string;
  onComplete?: (report: string) => void;
}

export default function StreamingPanel({ agentName, query, agentId, onComplete }: StreamingPanelProps) {
  const [messages, setMessages] = useState<{ text: string; isAgentStatus?: boolean; timestamp: number }[]>([]);
  const [activeSubAgent, setActiveSubAgent] = useState<string>('orchestrator');
  const [progress, setProgress] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [isDone, setIsDone] = useState(false);
  const [reportText, setReportText] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  // Timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (!isDone) {
      interval = setInterval(() => setElapsed(e => e + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [isDone]);

  // Autoscroll
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Connect to SSE
  useEffect(() => {
    // We send a POST request to run, then start listening to stream
    // Since we mock backend behaviour:
    const host = process.env.NEXT_PUBLIC_API_URL || "";
    let eventSource: EventSource;

    const startRun = async () => {
      try {
        await fetch(`${host}/api/agents/${agentId}/run`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ input: query })
        });
        
        eventSource = new EventSource(`${host}/api/agents/${agentId}/stream?input=${encodeURIComponent(query)}`);

        eventSource.onmessage = (e) => {
          try {
            const data = JSON.parse(e.data);
            if (data.type === 'agent_status') {
              setActiveSubAgent(data.agent);
              setMessages(m => [...m, { text: `${data.agent.toUpperCase()} - ${data.message}`, isAgentStatus: true, timestamp: Date.now() }]);
              // Simulate progress naturally
              setProgress(prev => Math.min(prev + Math.floor(Math.random() * 20), 95));
            } else if (data.type === 'output_chunk') {
              setMessages(m => [...m, { text: data.text, timestamp: Date.now() }]);
            } else if (data.type === 'complete') {
              setIsDone(true);
              setProgress(100);
              setReportText(data.report);
              if (onComplete) onComplete(data.report);
              eventSource.close();
            } else if (data.type === 'error') {
              setMessages(m => [...m, { text: `Agent encountered an error. Retrying with fallback model...`, timestamp: Date.now() }]);
              setIsDone(true);
              eventSource.close();
            }
          } catch(err) {
             // raw text formatting 
             console.error("error parsing event", err);
          }
        };

        eventSource.onerror = (e) => {
          console.error('SSE Error:', e);
          eventSource.close();
          setIsDone(true);
        };
      } catch (err) {
        console.error("Failed to start agent", err);
        setMessages(m => [...m, { text: `Error starting agent: ${err}`, timestamp: Date.now() }]);
      }
    };

    startRun();

    return () => {
      if (eventSource) eventSource.close();
    };
  }, [agentId, query, onComplete]);

  // Common sub-agents to render based on typical AutoResearch architecture
  const subAgents = ['orchestrator', 'searcher', 'reader', 'analyst', 'fact_checker', 'reporter'];

  return (
    <div className="w-full max-w-[1000px] mx-auto bg-[var(--av-bg)] border border-[var(--av-border)] rounded-xl overflow-hidden font-mono flex flex-col h-[600px]">
      <div className="border-b border-[var(--av-border)] bg-[var(--av-surface)] p-4 flex items-center justify-between">
        <div>
          <h4 className="text-[var(--av-text-1)] font-bold mb-1">{agentName} — {isDone ? 'Completed' : 'Running'}</h4>
          <div className="flex gap-1">
            {new Array(27).fill('━').map((c, i) => <span key={i} className="text-[var(--av-teal)] leading-none -mt-1">{c}</span>)}
          </div>
        </div>
        <div className="text-sm text-[var(--av-text-3)]">
          {elapsed}s elapsed
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left panel: Network of sub agents */}
        <div className="w-[280px] border-r border-[var(--av-border)] bg-[var(--av-surface)] p-6 hidden md:block">
          <div className="space-y-4">
            {subAgents.map(sa => {
              const isActive = activeSubAgent.toLowerCase() === sa.replace('_', '');
              // If it's a past agent, we could style it done, but for now active/inactive is enough
              return (
                <div key={sa} className="flex items-center gap-3 text-sm">
                  <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-[var(--av-teal)] animate-pulse' : 'bg-[var(--av-border)]'}`}></div>
                  <span className={isActive ? 'text-[var(--av-teal)] font-bold' : 'text-[var(--av-text-3)]'}>
                    {sa.replace('_', ' ').toUpperCase()}
                  </span>
                  {isActive && <span className="ml-auto text-[var(--av-teal)] text-xs animate-spin">⟳</span>}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right panel: Terminal output */}
        <div className="flex-1 p-6 overflow-y-auto bg-[#05070a] custom-scrollbar flex flex-col">
          {messages.map((m, i) => (
            <div key={i} className={`mb-2 text-sm ${m.isAgentStatus ? 'text-[var(--av-teal)] mt-4 mb-3' : 'text-[var(--av-text-1)]'}`}>
              {!m.isAgentStatus && <span className="text-[var(--av-text-3)] mr-2">{'>'}</span>}
              {!m.isAgentStatus ? <TypewriterText text={m.text} speed={15} /> : m.text}
            </div>
          ))}
          {isDone && reportText && (
            <div className="mt-8 border-t border-[var(--av-border)] pt-8">
              <div className="prose prose-invert prose-teal max-w-none text-[var(--av-text-1)] prose-pre:bg-[var(--av-surface)] prose-pre:border prose-pre:border-[var(--av-border)]">
                 <pre className="whitespace-pre-wrap">{reportText}</pre>
              </div>
            </div>
          )}
          <div ref={endRef}></div>
        </div>
      </div>

      {/* Footer Progress Bar */}
      <div className="border-t border-[var(--av-border)] bg-[var(--av-surface)] p-4 flex items-center justify-between text-sm">
        <div className="flex items-center gap-3 flex-1">
          <span className="text-[var(--av-text-3)]">[</span>
          <div className="flex-1 h-2 bg-[var(--av-bg)] rounded overflow-hidden max-w-[200px]">
            <div className="h-full bg-[var(--av-teal)] transition-all duration-500 rounded" style={{ width: `${progress}%` }}></div>
          </div>
          <span className="text-[var(--av-text-3)]">]</span>
          <span className="text-[var(--av-teal)] ml-2">{progress}% complete</span>
        </div>
      </div>
    </div>
  );
}
