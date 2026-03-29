import { AgentEvent, ResearchReport } from "../types";

// Auto-detect environments. In development, defaults to local backend.
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// A mock function for when the backend is unreachable (e.g. deployed to Vercel without a backend or mixed content error)
function startMockResearch(
  query: string,
  onEvent: (event: AgentEvent) => void,
  onReport: (report: ResearchReport) => void,
  onError: (error: string) => void
) {
  let isCancelled = false;

  const run = async () => {
    const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

    const events: AgentEvent[] = [
      { agent: "system", status: "working", message: `Starting research: ${query}`, progress: 0 },
      { agent: "searcher", status: "working", message: "Generating optimized search queries...", progress: 10 },
      { agent: "searcher", status: "working", message: "Scouring the web for sources...", progress: 30 },
      { agent: "searcher", status: "done", message: "Found 24 relevant sources across the web", progress: 40 },
      { agent: "reader", status: "working", message: "Scraping content from top 10 sources...", progress: 50 },
      { agent: "reader", status: "done", message: "Successfully extracted and cleaned text from 8 URLs", progress: 60 },
      { agent: "analyst", status: "working", message: "Analyzing content relevance to the query...", progress: 70 },
      { agent: "analyst", status: "done", message: "Extracted key entities, metrics, and claims", progress: 80 },
      { agent: "fact_checker", status: "working", message: "Cross-referencing claims and statistics...", progress: 85 },
      { agent: "fact_checker", status: "done", message: "Detected and documented 2 minor contradictions", progress: 90 },
      { agent: "reporter", status: "working", message: "Structuring final intelligence report...", progress: 100 },
      { agent: "reporter", status: "done", message: "Drafting complete", progress: 100 },
    ];

    for (const evt of events) {
      if (isCancelled) return;
      onEvent({ ...evt, timestamp: Date.now() / 1000 });
      await delay(800 + Math.random() * 1000); // 0.8-1.8s delay per step
    }

    if (isCancelled) return;

    onReport({
      query: query || "Analyze the AI startup ecosystem in India 2025",
      executive_summary: "India's AI startup ecosystem has grown exponentially in 2025, with over 1,200 active AI companies and $4.2B in venture funding. Key hubs include Bangalore, Hyderabad, and emerging tier-2 cities. The sector is driven by enterprise AI adoption, government Digital India initiatives, and a strong pool of ML talent from IITs and IIScs.",
      key_findings: [
        "India now has 1,200+ active AI startups, up 340% from 2022",
        "Total AI startup funding reached $4.2B in 2024, projected $6B by 2025",
        "Bangalore accounts for 42% of all Indian AI companies",
        "Government INDIAAI Mission allocated ₹10,372 crore for AI infrastructure",
        "Top sectors: HealthTech AI (28%), FinTech AI (22%), AgriTech AI (18%)",
        "63% of Indian enterprises now use at least one AI solution",
        "Indian AI talent pool: 420,000 professionals, 2nd largest globally"
      ],
      detailed_analysis: "*(Demo Mode)*\n\n## Market Overview\n\nIndia's AI startup landscape in 2025 represents one of the most dynamic emerging markets globally. Factors propelling this growth include active government initiatives, massive pools of engineering talent, and a high rate of digital adoption among enterprises.\n\n## Key Players\n\nSector leaders include Krutrim (Ola's AI division), Sarvam AI, and various vertical-specific players addressing healthcare, agriculture, and finance.\n\n## Challenges\n\nDespite growth, challenges persist: data quality issues, regulatory uncertainty, and infrastructure gaps in non-metro areas.",
      sources: [
        { url: "https://nasscom.in/ai-report-2025", title: "NASSCOM India AI Report 2025", snippet: "Comprehensive analysis of India's AI ecosystem growth", relevance_score: 0.95 },
        { url: "https://inc42.com/ai-startups-india", title: "Inc42: India AI Startups Landscape", snippet: "Funding trends and key players in Indian AI", relevance_score: 0.88 },
        { url: "https://indiaaistory.com", title: "India AI Story — Government Initiatives", snippet: "INDIAAI Mission and policy framework analysis", relevance_score: 0.82 }
      ],
      contradictions: [
        "Some analysts cite funding slowdown in H2 2024 while others report record highs",
        "Government claims 100K AI jobs created; industry surveys suggest lower figures"
      ],
      confidence_score: 87,
      generated_at: new Date().toISOString()
    });
  };

  run().catch(err => {
    if (!isCancelled) onError(err.message);
  });

  return () => { isCancelled = true; };
}

export async function startResearch(
  query: string,
  onEvent: (event: AgentEvent) => void,
  onReport: (report: ResearchReport) => void,
  onError: (error: string) => void
) {
  try {
    // First POST to start research
    const res = await fetch(`${API_URL}/research`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query, max_sources: 8, depth: "standard" })
    }).catch((err) => {
      // Catch network errors (like CORS or connection actively refused)
      throw new Error(`NETWORK_ERROR: ${err.message}`);
    });
    
    if (!res.ok) {
      throw new Error(`Failed to start research (Status ${res.status}): ${res.statusText}`);
    }
    
    const { job_id } = await res.json();
    
    // Then connect to SSE stream
    const eventSource = new EventSource(`${API_URL}/research/${job_id}/stream`);
    
    eventSource.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        if (data.type === "report") {
          onReport(data.report);
          eventSource.close();
        } else if (data.type === "error") {
          onError(data.message || "Unknown error occurred.");
          eventSource.close();
        } else if (data.type === "done") {
          eventSource.close();
        } else {
          onEvent(data as AgentEvent);
        }
      } catch (err) {
        console.error("Failed to parse event data", err);
      }
    };
    
    eventSource.addEventListener("error", () => {
      if (eventSource.readyState === EventSource.CLOSED) return;
      onError("Connection lost. Please try again.");
      eventSource.close();
    });
    
    return () => eventSource.close();
  } catch (err: any) {
    if (err.message.includes("NETWORK_ERROR") || err.message.includes("Failed to fetch")) {
      console.warn("Backend unreachable. Falling back to DEMO Mode.");
      return startMockResearch(query, onEvent, onReport, onError);
    }
    onError(err.message || "Connection failed");
    return () => {};
  }
}
