export interface AgentEvent {
  agent: string;
  status: "idle" | "working" | "done" | "error";
  message: string;
  progress?: number;
  timestamp?: number;
}

export interface Source {
  url: string;
  title: string;
  snippet: string;
  relevance_score: number;
}

export interface ResearchReport {
  query: string;
  executive_summary: string;
  key_findings: string[];
  detailed_analysis: string;
  sources: Source[];
  contradictions: string[];
  confidence_score: number;
  generated_at: string;
}
