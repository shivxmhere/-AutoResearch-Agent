"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { ResearchReport, Source } from "../types";

interface ReportDisplayProps {
  report: ResearchReport;
}

type TabId = "summary" | "findings" | "analysis" | "sources";

const TABS: { id: TabId; label: string; icon: string }[] = [
  { id: "summary",  label: "Summary",  icon: "📋" },
  { id: "findings", label: "Findings", icon: "💡" },
  { id: "analysis", label: "Analysis", icon: "🔎" },
  { id: "sources",  label: "Sources",  icon: "🔗" },
];

function ConfidenceGauge({ score }: { score: number }) {
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 70 ? "var(--success)" : score >= 40 ? "var(--gold)" : "var(--error)";

  return (
    <div className="flex flex-col items-center gap-2">
      <svg width="130" height="130" viewBox="0 0 130 130">
        {/* Background circle */}
        <circle
          cx="65" cy="65" r={radius}
          fill="none"
          stroke="var(--border-card)"
          strokeWidth="8"
        />
        {/* Progress circle */}
        <circle
          cx="65" cy="65" r={radius}
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="gauge-circle"
          transform="rotate(-90 65 65)"
          style={{ filter: `drop-shadow(0 0 8px ${color})` }}
        />
        {/* Score text */}
        <text x="65" y="60" textAnchor="middle" fill={color} fontSize="28" fontWeight="700" fontFamily="Inter">
          {score}
        </text>
        <text x="65" y="80" textAnchor="middle" fill="var(--text-muted)" fontSize="11" fontWeight="500">
          confidence
        </text>
      </svg>
    </div>
  );
}

function SourceCard({ source, index }: { source: Source; index: number }) {
  const scorePercent = Math.round(source.relevance_score * 100);
  const barColor = scorePercent >= 70 ? "var(--success)" : scorePercent >= 40 ? "var(--gold)" : "var(--error)";

  return (
    <a
      href={source.url}
      target="_blank"
      rel="noopener noreferrer"
      className="card p-4 block group hover:border-[var(--cyan)] transition-all duration-300"
    >
      <div className="flex items-start gap-3">
        <span className="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-lg bg-[var(--cyan-dim)] text-[var(--cyan)] text-xs font-bold font-mono">
          {index}
        </span>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-medium text-[var(--text-primary)] group-hover:text-[var(--cyan)] transition-colors truncate">
            {source.title || "Untitled Source"}
          </h4>
          <p className="text-[11px] text-[var(--text-muted)] truncate mt-0.5 font-mono">
            {source.url}
          </p>
          {source.snippet && (
            <p className="text-xs text-[var(--text-secondary)] mt-2 line-clamp-2 leading-relaxed">
              {source.snippet}
            </p>
          )}
          {/* Relevance bar */}
          <div className="mt-2 flex items-center gap-2">
            <div className="flex-1 h-1.5 bg-[var(--bg-primary)] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${scorePercent}%`, background: barColor }}
              />
            </div>
            <span className="text-[10px] font-mono" style={{ color: barColor }}>
              {scorePercent}%
            </span>
          </div>
        </div>
      </div>
    </a>
  );
}

export default function ReportDisplay({ report }: ReportDisplayProps) {
  const [activeTab, setActiveTab] = useState<TabId>("summary");
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const fullReport = `# ${report.query}\n\n## Executive Summary\n${report.executive_summary}\n\n## Key Findings\n${report.key_findings.map((f) => `- ${f}`).join("\n")}\n\n## Detailed Analysis\n${report.detailed_analysis}\n\n## Contradictions\n${report.contradictions.map((c) => `- ${c}`).join("\n") || "None found."}\n\n## Sources\n${report.sources.map((s) => `- [${s.title}](${s.url})`).join("\n")}`;
    navigator.clipboard.writeText(fullReport);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const fullReport = `# ${report.query}\n\n## Executive Summary\n${report.executive_summary}\n\n## Key Findings\n${report.key_findings.map((f) => `- ${f}`).join("\n")}\n\n## Detailed Analysis\n${report.detailed_analysis}\n\n## Contradictions\n${report.contradictions.map((c) => `- ${c}`).join("\n") || "None found."}\n\n## Sources\n${report.sources.map((s) => `- [${s.title}](${s.url})`).join("\n")}`;
    const blob = new Blob([fullReport], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `research-report-${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="animate-slide-up">
      {/* Header Row */}
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <h2 className="text-xl font-bold text-[var(--text-primary)] flex items-center gap-2">
          📄 Research Report
        </h2>
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="px-3 py-1.5 text-xs font-medium rounded-lg border border-[var(--border-card)] text-[var(--text-secondary)] hover:border-[var(--cyan)] hover:text-[var(--cyan)] transition-all"
          >
            {copied ? "✓ Copied!" : "📋 Copy Markdown"}
          </button>
          <button
            onClick={handleDownload}
            className="px-3 py-1.5 text-xs font-medium rounded-lg border border-[var(--border-card)] text-[var(--text-secondary)] hover:border-[var(--cyan)] hover:text-[var(--cyan)] transition-all"
          >
            ⬇️ Download
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
        {/* Report Content — 3 cols */}
        <div className="lg:col-span-3">
          {/* Tabs */}
          <div className="flex gap-1 mb-5 p-1 bg-[var(--bg-card)] rounded-xl border border-[var(--border-card)]">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`tab flex-1 text-center ${activeTab === t.id ? "tab-active" : ""}`}
              >
                <span className="mr-1.5">{t.icon}</span>{t.label}
              </button>
            ))}
          </div>

          <div className="card p-6">
            {activeTab === "summary" && (
              <div className="report-content animate-fade-in">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {report.executive_summary || "No summary available."}
                </ReactMarkdown>

                {(report.contradictions?.length || 0) > 0 && (
                  <div className="mt-6 p-4 rounded-xl bg-[var(--gold-dim)] border border-[rgba(245,166,35,0.2)]">
                    <h4 className="text-sm font-semibold text-[var(--gold)] mb-2">⚠️ Contradictions Found</h4>
                    <ul className="space-y-1">
                      {(report.contradictions || []).map((c, i) => (
                        <li key={i} className="text-xs text-[var(--text-secondary)] flex items-start gap-2">
                          <span className="text-[var(--gold)] mt-0.5">•</span>{c}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {activeTab === "findings" && (
              <div className="space-y-3 animate-fade-in">
                {(report.key_findings || []).map((finding, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 p-3 rounded-xl bg-[rgba(255,255,255,0.02)] hover:bg-[rgba(0,212,255,0.03)] transition-colors"
                  >
                    <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-lg bg-[var(--cyan-dim)] text-[var(--cyan)] text-[11px] font-bold font-mono">
                      {i + 1}
                    </span>
                    <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{finding}</p>
                  </div>
                ))}
              </div>
            )}

            {activeTab === "analysis" && (
              <div className="report-content animate-fade-in">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {report.detailed_analysis || "No detailed analysis available."}
                </ReactMarkdown>
              </div>
            )}

            {activeTab === "sources" && (
              <div className="space-y-3 animate-fade-in">
                {(report.sources || []).map((source, i) => (
                  <SourceCard key={i} source={source} index={i + 1} />
                ))}
                {(report.sources || []).length === 0 && (
                  <p className="text-sm text-[var(--text-muted)] text-center py-8">No sources available.</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar — 1 col */}
        <div className="space-y-5">
          {/* Confidence Gauge */}
          <div className="card p-5 flex flex-col items-center">
            <ConfidenceGauge score={report.confidence_score} />
          </div>

          {/* Quick Stats */}
          <div className="card p-4 space-y-3">
            <h4 className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Quick Stats</h4>
            <div className="flex items-center justify-between text-sm">
              <span className="text-[var(--text-secondary)]">Key Findings</span>
              <span className="font-mono text-[var(--cyan)]">{(report.key_findings || []).length}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-[var(--text-secondary)]">Sources</span>
              <span className="font-mono text-[var(--cyan)]">{(report.sources || []).length}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-[var(--text-secondary)]">Contradictions</span>
              <span className="font-mono text-[var(--gold)]">{(report.contradictions || []).length}</span>
            </div>
            {report.generated_at && (
              <div className="pt-2 border-t border-[var(--border-card)]">
                <span className="text-[10px] text-[var(--text-muted)] font-mono">
                  Generated: {new Date(report.generated_at).toLocaleString()}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
