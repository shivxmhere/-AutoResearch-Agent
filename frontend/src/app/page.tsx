"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import QueryInput from "./components/QueryInput";
import AgentPipeline from "./components/AgentPipeline";
import LiveFeed from "./components/LiveFeed";
import ReportDisplay from "./components/ReportDisplay";
import { startResearch } from "./lib/stream";
import { AgentEvent, ResearchReport } from "./types";

type AppState = "idle" | "researching" | "completed" | "error";

export default function Home() {
  const [appState, setAppState] = useState<AppState>("idle");
  const [events, setEvents] = useState<AgentEvent[]>([]);
  const [report, setReport] = useState<ResearchReport | null>(null);
  const [progress, setProgress] = useState(0);
  const [activeAgent, setActiveAgent] = useState("");
  const [completedAgents, setCompletedAgents] = useState<Set<string>>(new Set());
  const [errorAgents] = useState<Set<string>>(new Set());
  const [errorMsg, setErrorMsg] = useState("");
  const [elapsedTime, setElapsedTime] = useState(0);
  const [currentQuery, setCurrentQuery] = useState("");

  const cleanupRef = useRef<(() => void) | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Elapsed time timer
  useEffect(() => {
    if (appState === "researching") {
      const start = Date.now();
      timerRef.current = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - start) / 1000));
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [appState]);

  const handleResearch = useCallback(async (query: string, depth: string, maxSources: number) => {
    // Reset state
    setAppState("researching");
    setEvents([]);
    setReport(null);
    setProgress(0);
    setActiveAgent("");
    setCompletedAgents(new Set());
    setErrorMsg("");
    setElapsedTime(0);
    setCurrentQuery(query);

    // Cleanup previous
    if (cleanupRef.current) cleanupRef.current();

    const cleanup = await startResearch(
      query,
      (event: AgentEvent) => {
        setEvents((prev) => [...prev, event]);
        if (event.progress !== undefined) {
          setProgress(event.progress);
        }

        if (event.status === "working") {
          setActiveAgent(event.agent);
        }
        if (event.status === "done") {
          setCompletedAgents((prev) => new Set(prev).add(event.agent));
          // Move active to next if this one just completed
          if (event.agent === activeAgent) {
            setActiveAgent("");
          }
        }
      },
      (reportData: ResearchReport) => {
        setReport(reportData);
        setProgress(100);
        setAppState("completed");
        setActiveAgent("");
      },
      (err: string) => {
        setErrorMsg(err);
        setAppState("error");
      }
    );

    cleanupRef.current = cleanup;
  }, [activeAgent]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (cleanupRef.current) cleanupRef.current();
    };
  }, []);

  const isResearching = appState === "researching";

  return (
    <main className="min-h-screen">
      {/* ── Header ────────────────────────────────────── */}
      <header className="border-b border-[var(--border-card)] bg-[rgba(3,10,26,0.8)] backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🤖</span>
            <h1 className="text-lg font-bold text-[var(--cyan)] glow-text-cyan tracking-tight">
              AutoResearch Agent
            </h1>
          </div>
          <p className="hidden md:block text-xs text-[var(--text-muted)]">
            Autonomous AI Research • Powered by <span className="text-[var(--text-secondary)]">LangGraph + LLaMA 3.3</span>
          </p>
          <div className="flex items-center gap-2">
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="px-2.5 py-1 text-[10px] font-semibold rounded-md border border-[var(--border-card)] text-[var(--text-muted)] hover:border-[var(--text-secondary)] transition-colors"
            >
              ⭐ GitHub
            </a>
            <span className="px-2.5 py-1 text-[10px] font-bold rounded-md bg-[var(--gold-dim)] text-[var(--gold)] border border-[rgba(245,166,35,0.25)]">
              Track 2: Agentic AI
            </span>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* ── Hero Section (idle) ────────────────────── */}
        {appState === "idle" && (
          <div className="animate-fade-in">
            <div className="text-center mb-12 pt-8">
              <h2 className="text-5xl sm:text-7xl font-extrabold text-[var(--text-primary)] mb-4 tracking-tight leading-tight">
                Research anything.
              </h2>
              <p className="text-lg sm:text-xl text-[var(--cyan)] font-medium glow-text-cyan">
                One sentence. Five AI agents. Complete intelligence report.
              </p>
            </div>

            {/* Idle Agent Pipeline Preview */}
            <div className="mb-12">
              <AgentPipeline activeAgent="" completedAgents={new Set()} errorAgents={new Set()} />
            </div>
          </div>
        )}

        {/* ── Query Input ───────────────────────────── */}
        <div className="mb-8">
          <QueryInput onSubmit={handleResearch} isLoading={isResearching} />
        </div>

        {/* ── Error Display ──────────────────────────── */}
        {errorMsg && (
          <div className="mb-6 p-4 rounded-xl bg-[var(--error-dim)] border border-[rgba(239,68,68,0.3)] animate-slide-in">
            <div className="flex items-center gap-2">
              <span className="text-[var(--error)]">⚠️</span>
              <p className="text-sm text-[var(--error)]">{errorMsg}</p>
            </div>
          </div>
        )}

        {/* ── Research In Progress ───────────────────── */}
        {(appState === "researching" || appState === "completed") && (
          <div className="space-y-6 animate-slide-up">
            {/* Current Query */}
            <div className="text-center">
              <span className="text-xs text-[var(--text-muted)] uppercase tracking-wider">Researching</span>
              <p className="text-lg font-semibold text-[var(--text-primary)] mt-1">
                &ldquo;{currentQuery}&rdquo;
              </p>
            </div>

            {/* Agent Pipeline */}
            <AgentPipeline
              activeAgent={activeAgent}
              completedAgents={completedAgents}
              errorAgents={errorAgents}
            />

            {/* Progress Bar + Timer */}
            <div className="card p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-[var(--text-secondary)]">
                  {appState === "completed" ? "✅ Research Complete" : "🔄 Research in progress..."}
                </span>
                <span className="text-xs font-mono text-[var(--text-muted)]">
                  {Math.round(progress)}% • {elapsedTime}s elapsed
                </span>
              </div>
              <div className="w-full h-2 bg-[var(--bg-primary)] rounded-full overflow-hidden">
                <div
                  className="progress-bar h-full"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* Live Feed */}
            {events.length > 0 && <LiveFeed events={events} />}
          </div>
        )}

        {/* ── Report ─────────────────────────────────── */}
        {report && (
          <div className="mt-10">
            <ReportDisplay report={report} />
          </div>
        )}

        {/* ── Footer ─────────────────────────────────── */}
        <footer className="mt-20 pt-6 border-t border-[var(--border-card)] text-center">
          <p className="text-xs text-[var(--text-muted)]">
            Built with FastAPI + LangGraph + Groq (LLaMA 3.3 70B) + Tavily Search + FAISS
          </p>
          <p className="text-[10px] text-[var(--text-muted)] mt-1 opacity-60">
            Microsoft Hackathon 2025 • Track 2: Agentic AI
          </p>
        </footer>
      </div>
    </main>
  );
}
