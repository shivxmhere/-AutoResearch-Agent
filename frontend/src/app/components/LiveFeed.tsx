"use client";

import { useEffect, useRef } from "react";
import type { AgentEvent } from "../types";

interface LiveFeedProps {
  events: AgentEvent[];
}

const AGENT_BADGE_CLASS: Record<string, string> = {
  orchestrator: "badge-orchestrator",
  searcher: "badge-searcher",
  reader: "badge-reader",
  analyst: "badge-analyst",
  fact_checker: "badge-fact_checker",
  reporter: "badge-reporter",
  system: "badge-system",
};

function formatTime(timestamp: number): string {
  const date = new Date(timestamp * 1000);
  return date.toLocaleTimeString("en-US", {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function agentLabel(agent: string): string {
  const labels: Record<string, string> = {
    orchestrator: "Planner",
    searcher: "Searcher",
    reader: "Reader",
    analyst: "Analyst",
    fact_checker: "Fact Check",
    reporter: "Reporter",
    system: "System",
  };
  return labels[agent] || agent;
}

export default function LiveFeed({ events }: LiveFeedProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [events]);

  const visibleEvents = events.slice(-50);

  return (
    <div className="card p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wider flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-[var(--cyan)] animate-pulse" />
          Live Agent Feed
        </h3>
        <span className="text-[10px] font-mono text-[var(--text-muted)]">
          {events.length} events
        </span>
      </div>

      <div
        ref={scrollRef}
        className="space-y-1.5 max-h-[280px] overflow-y-auto pr-1"
      >
        {visibleEvents.length === 0 && (
          <p className="text-xs text-[var(--text-muted)] text-center py-8">
            Waiting for events...
          </p>
        )}
        {visibleEvents.map((event, i) => (
          <div
            key={i}
            className="animate-slide-in flex items-start gap-2 py-1.5 px-2 rounded-lg hover:bg-[rgba(255,255,255,0.02)] transition-colors"
            style={{ animationDelay: `${Math.min(i * 0.03, 0.3)}s` }}
          >
            {/* Timestamp */}
            <span className="text-[10px] font-mono text-[var(--text-muted)] mt-0.5 shrink-0 w-16">
              {formatTime(event.timestamp || (Date.now() / 1000))}
            </span>

            {/* Agent Badge */}
            <span
              className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${
                AGENT_BADGE_CLASS[event.agent] || "badge-system"
              }`}
            >
              {agentLabel(event.agent)}
            </span>

            {/* Message */}
            <span className="text-xs text-[var(--text-secondary)] leading-relaxed">
              {event.message}
            </span>

            {/* Status dot */}
            {event.status === "done" && (
              <span className="shrink-0 mt-0.5 text-[var(--success)]">✓</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
