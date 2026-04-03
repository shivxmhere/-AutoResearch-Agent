'use client';

import { useState, useRef } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import ResearchView from './components/ResearchView';
import { startResearch } from './lib/stream';
import type { AgentEvent, ResearchReport } from './types';
import { useToast } from './components/ToastContext';
import confetti from 'canvas-confetti';

export default function AutoResearchPage() {
  const [appState, setAppState] = useState<'idle' | 'researching' | 'report'>('idle');
  const [activeAgent, setActiveAgent] = useState('searcher');
  const [progress, setProgress] = useState(0);
  const [events, setEvents] = useState<AgentEvent[]>([]);
  const [reportText, setReportText] = useState<string | null>(null);
  
  const { addToast } = useToast();
  const cleanupRef = useRef<(() => void) | null>(null);

  const resetState = () => {
    if (cleanupRef.current) cleanupRef.current();
    setAppState('idle');
    setEvents([]);
    setReportText(null);
    setActiveAgent('searcher');
    setProgress(0);
  };

  const handleStart = async (query: string, depth: string) => {
    // Basic validation
    if (!query) {
      addToast('Please enter a research query', 'warning');
      return;
    }

    resetState();
    setAppState('researching');
    addToast('Research initialized', 'info');

    try {
      const cleanup = await startResearch(
        query,
        (evt: AgentEvent) => {
          setEvents(prev => [...prev, evt]);
          if (evt.progress) setProgress(evt.progress);
          if (evt.status === 'working') setActiveAgent(evt.agent);
          
          if (evt.status === 'error') {
            addToast(`Error in ${evt.agent}: ${evt.message}`, 'error');
          }
        },
        (rep: ResearchReport) => {
          setProgress(100);
          setAppState('report');
          
          // Reconstruct markdown from report
          const markdown = `
# ${rep.query}

**Confidence Score:** ${rep.confidence_score}%

## Executive Summary
${rep.executive_summary}

## Key Findings
${rep.key_findings.map(f => `- ${f}`).join('\n')}

## Detailed Analysis
${rep.detailed_analysis}

${rep.contradictions && rep.contradictions.length > 0 ? `## Contradictions\n${rep.contradictions.map(c => `- ${c}`).join('\n')}` : ''}

## Sources
${rep.sources.map(s => `1. [${s.title}](${s.url}) (${Math.round(s.relevance_score * 100)}% relevant)`).join('\n')}
          `.trim();

          setReportText(markdown);
          addToast('Intelligence report complete', 'success');

          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#22D3EE', '#818CF8', '#34D399']
          });
        },
        (err: string) => {
          addToast(`Failed to complete research: ${err}`, 'error');
          setAppState('idle');
        }
      );
      cleanupRef.current = cleanup;
    } catch (e: any) {
      addToast(e.message || 'Failed to start research', 'error');
      setAppState('idle');
    }
  };

  return (
    <>
      <Header appState={appState} resetState={resetState} />
      
      <main className="flex flex-col w-full min-h-screen">
        {appState === 'idle' ? (
          <Hero 
            onStart={handleStart} 
            isStarting={false} 
            activeAgent={activeAgent} 
            progress={progress} 
          />
        ) : (
          <ResearchView 
            events={events}
            report={reportText}
            activeAgent={activeAgent}
            progress={progress}
          />
        )}
      </main>
    </>
  );
}
