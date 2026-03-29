"use client";

interface AgentPipelineProps {
  activeAgent: string;
  completedAgents: Set<string>;
  errorAgents: Set<string>;
}

const AGENTS = [
  { id: "orchestrator", icon: "🎯", name: "Planner",      color: "#A78BFA" },
  { id: "searcher",     icon: "🔍", name: "Searcher",     color: "#00D4FF" },
  { id: "reader",       icon: "📖", name: "Reader",       color: "#F5A623" },
  { id: "analyst",      icon: "🧠", name: "Analyst",      color: "#EC4899" },
  { id: "fact_checker", icon: "✅", name: "Fact Checker", color: "#06D6A0" },
  { id: "reporter",     icon: "📊", name: "Reporter",     color: "#818CF8" },
];

export default function AgentPipeline({
  activeAgent,
  completedAgents,
  errorAgents,
}: AgentPipelineProps) {
  return (
    <div className="py-6">
      <div className="agent-pipeline flex items-center justify-center gap-2 flex-wrap">
        {AGENTS.map((agent, i) => {
          const isActive = activeAgent === agent.id;
          const isDone = completedAgents.has(agent.id);
          const isError = errorAgents.has(agent.id);
          const isPast = isDone || isError;

          return (
            <div key={agent.id} className="flex items-center gap-2">
              {/* Agent Card */}
              <div
                className={`
                  relative flex flex-col items-center gap-2 px-4 py-3 rounded-xl border transition-all duration-500 min-w-[90px]
                  ${isActive 
                    ? "border-[var(--cyan)] bg-[var(--cyan-dim)] animate-pulse-cyan" 
                    : isDone 
                      ? "border-[var(--success)] bg-[var(--success-dim)]" 
                      : isError
                        ? "border-[var(--error)] bg-[var(--error-dim)]"
                        : "border-[var(--border-card)] bg-[var(--bg-card)]"
                  }
                `}
              >
                {/* Status indicator */}
                {isActive && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-[var(--cyan)] animate-pulse" />
                )}
                {isDone && (
                  <div className="absolute -top-1 -right-1 animate-pop-in">
                    <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                      <circle cx="10" cy="10" r="9" fill="var(--success)" />
                      <path d="M6 10l3 3 5-5" stroke="#030A1A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                )}

                {/* Icon */}
                <span className={`text-2xl transition-transform duration-300 ${isActive ? "animate-float" : ""}`}>
                  {agent.icon}
                </span>

                {/* Name */}
                <span
                  className={`text-[11px] font-semibold tracking-wide transition-colors duration-300 ${
                    isActive ? "text-[var(--cyan)]" : isDone ? "text-[var(--success)]" : "text-[var(--text-muted)]"
                  }`}
                >
                  {agent.name}
                </span>

                {/* Active spinner */}
                {isActive && (
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2">
                    <div className="flex gap-0.5">
                      {[0, 1, 2].map((dot) => (
                        <div
                          key={dot}
                          className="w-1 h-1 rounded-full bg-[var(--cyan)]"
                          style={{
                            animation: `pulse 1s ease-in-out ${dot * 0.2}s infinite`,
                          }}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Arrow */}
              {i < AGENTS.length - 1 && (
                <div className="arrow flex items-center">
                  <svg width="24" height="12" viewBox="0 0 24 12" fill="none">
                    <path
                      d="M0 6h20m0 0l-4-4m4 4l-4 4"
                      stroke={isPast ? "var(--success)" : isActive ? "var(--cyan)" : "var(--border-card)"}
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="transition-colors duration-500"
                    />
                    {(isActive || isPast) && (
                      <path
                        d="M0 6h20"
                        stroke={isPast ? "var(--success)" : "var(--cyan)"}
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeDasharray="4 4"
                        className="transition-colors duration-500"
                        style={{ animation: isPast ? "none" : "dash-flow 0.8s linear infinite" }}
                      />
                    )}
                  </svg>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
