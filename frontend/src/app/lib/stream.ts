import { AgentEvent, ResearchReport } from "../types";

// Auto-detect environments. In development, defaults to local backend.
const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

// ─── DEMO / MOCK flow ────────────────────────────────────────────────
// Used when no backend URL is configured (Vercel deploy without backend)
function startMockResearch(
  query: string,
  onEvent: (event: AgentEvent) => void,
  onReport: (report: ResearchReport) => void,
  _onError: (error: string) => void
): () => void {
  let isCancelled = false;

  const run = async () => {
    const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

    const events: AgentEvent[] = [
      { agent: "system", status: "working", message: `Starting research: ${query}`, progress: 0 },
      { agent: "searcher", status: "working", message: "Generating optimized search queries...", progress: 5 },
      { agent: "searcher", status: "working", message: "Querying DuckDuckGo, Bing & Google Scholar...", progress: 15 },
      { agent: "searcher", status: "working", message: "Scouring the web for sources...", progress: 25 },
      { agent: "searcher", status: "done", message: "Found 24 relevant sources across the web", progress: 35 },
      { agent: "reader", status: "working", message: "Scraping content from top 10 sources...", progress: 42 },
      { agent: "reader", status: "working", message: "Cleaning and extracting article text...", progress: 50 },
      { agent: "reader", status: "done", message: "Successfully extracted and cleaned text from 8 URLs", progress: 58 },
      { agent: "analyst", status: "working", message: "Running LLaMA 3.3 70B via Groq for deep analysis...", progress: 64 },
      { agent: "analyst", status: "working", message: "Analyzing content relevance to the query...", progress: 72 },
      { agent: "analyst", status: "done", message: "Extracted key entities, metrics, and claims", progress: 78 },
      { agent: "fact_checker", status: "working", message: "Cross-referencing claims and statistics...", progress: 82 },
      { agent: "fact_checker", status: "working", message: "Verifying data against trusted sources...", progress: 87 },
      { agent: "fact_checker", status: "done", message: "Detected and documented 2 minor contradictions", progress: 90 },
      { agent: "reporter", status: "working", message: "Structuring final intelligence report...", progress: 94 },
      { agent: "reporter", status: "working", message: "Generating executive summary and key findings...", progress: 97 },
      { agent: "reporter", status: "done", message: "Report generation complete ✓", progress: 100 },
    ];

    for (const evt of events) {
      if (isCancelled) return;
      onEvent({ ...evt, timestamp: Date.now() / 1000 });
      await delay(700 + Math.random() * 900);
    }

    if (isCancelled) return;

    // Small pause before the report for dramatic effect
    await delay(500);

    const userQuery = query.trim() || "Analyze the AI startup ecosystem in India 2025";

    onReport({
      query: userQuery,
      executive_summary:
        `**Research Query: "${userQuery}"**\n\n` +
        "India's AI startup ecosystem has grown exponentially in 2025, with over 1,200 active AI companies and $4.2B in venture funding. " +
        "Key hubs include Bangalore, Hyderabad, and emerging tier-2 cities. The sector is driven by enterprise AI adoption, " +
        "government Digital India initiatives, and a strong pool of ML talent from IITs and IIScs.\n\n" +
        "The ecosystem benefits from a unique combination of factors: world-class engineering talent, " +
        "a massive domestic market of 1.4B people, supportive government policies, and increasing global investor interest. " +
        "Enterprise adoption has accelerated post-COVID, with 63% of Indian enterprises now using at least one AI solution.",
      key_findings: [
        "India now has 1,200+ active AI startups, up 340% from 2022",
        "Total AI startup funding reached $4.2B in 2024, projected $6B by 2025",
        "Bangalore accounts for 42% of all Indian AI companies",
        "Government INDIAAI Mission allocated ₹10,372 crore for AI infrastructure",
        "Top sectors: HealthTech AI (28%), FinTech AI (22%), AgriTech AI (18%)",
        "63% of Indian enterprises now use at least one AI solution",
        "Indian AI talent pool: 420,000 professionals, 2nd largest globally",
      ],
      detailed_analysis:
        "## Market Overview\n\n" +
        "India's AI startup landscape in 2025 represents one of the most dynamic emerging markets globally. " +
        "Factors propelling this growth include active government initiatives, massive pools of engineering talent, " +
        "and a high rate of digital adoption among enterprises.\n\n" +
        "## Funding Landscape\n\n" +
        "Venture capital investment in Indian AI startups has followed a hockey-stick trajectory. " +
        "After a brief slowdown in late 2023, funding rebounded strongly in 2024 with $4.2B in total investment. " +
        "Series A and B rounds have grown 2.5x year-over-year, signaling maturing business models.\n\n" +
        "## Key Players\n\n" +
        "Sector leaders include **Krutrim** (Ola's AI division), **Sarvam AI**, and various vertical-specific " +
        "players addressing healthcare, agriculture, and finance. Notable mentions include **Fractal Analytics**, " +
        "**Haptik**, and **Yellow.ai** in the enterprise AI space.\n\n" +
        "## Government Initiatives\n\n" +
        "The **INDIAAI Mission** has been a catalyst, with ₹10,372 crore allocated for compute infrastructure, " +
        "datasets, and talent development. The government's push for Digital Public Infrastructure (DPI) has created " +
        "unique opportunities for AI companies to build on platforms like UPI, Aadhaar, and DigiLocker.\n\n" +
        "## Challenges\n\n" +
        "Despite growth, challenges persist:\n" +
        "- **Data quality issues** — particularly in regional languages and specialized domains\n" +
        "- **Regulatory uncertainty** — AI regulation framework still under development\n" +
        "- **Infrastructure gaps** — compute access and connectivity in non-metro areas\n" +
        "- **Talent retention** — competition from global tech giants for top ML researchers\n\n" +
        "## Outlook\n\n" +
        "The trajectory points to India becoming the world's 3rd largest AI ecosystem by 2027, " +
        "behind only the US and China. The combination of talent, market size, and policy support " +
        "creates a compelling growth story.",
      sources: [
        {
          url: "https://nasscom.in/ai-report-2025",
          title: "NASSCOM India AI Report 2025",
          snippet: "Comprehensive analysis of India's AI ecosystem growth and market sizing",
          relevance_score: 0.95,
        },
        {
          url: "https://inc42.com/ai-startups-india",
          title: "Inc42: India AI Startups Landscape",
          snippet: "Funding trends and key players in Indian AI startup ecosystem",
          relevance_score: 0.88,
        },
        {
          url: "https://indiaai.gov.in",
          title: "IndiaAI Mission — Government of India",
          snippet: "Official government portal for INDIAAI Mission and policy framework",
          relevance_score: 0.85,
        },
        {
          url: "https://economictimes.com/tech/ai-ecosystem-growth",
          title: "ET: India's AI Ecosystem Growth Report",
          snippet: "Economic Times analysis of AI adoption across Indian enterprises",
          relevance_score: 0.82,
        },
        {
          url: "https://yourstory.com/2025/ai-startups-funding",
          title: "YourStory: AI Startup Funding Tracker 2025",
          snippet: "Real-time tracking of AI startup funding rounds in India",
          relevance_score: 0.78,
        },
      ],
      contradictions: [
        "Some analysts cite funding slowdown in H2 2024 while others report record highs — discrepancy likely due to differing classification of AI vs. non-AI startups",
        "Government claims 100K AI jobs created; industry surveys suggest lower figures around 65K direct positions",
      ],
      confidence_score: 87,
      generated_at: new Date().toISOString(),
    });
  };

  run().catch((err) => {
    if (!isCancelled) _onError(err.message);
  });

  return () => {
    isCancelled = true;
  };
}

// ─── MAIN EXPORT ─────────────────────────────────────────────────────

export async function startResearch(
  query: string,
  onEvent: (event: AgentEvent) => void,
  onReport: (report: ResearchReport) => void,
  onError: (error: string) => void
): Promise<() => void> {
  // If no API URL is configured, go straight to demo mode.
  // This is the case for all Vercel deploys without a backend.
  if (!API_URL) {
    console.info("[AutoResearch] No API URL configured — running in Demo Mode");
    return startMockResearch(query, onEvent, onReport, onError);
  }

  // Try to reach the real backend
  let res: Response;
  try {
    res = await fetch(`${API_URL}/research`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query, max_sources: 8, depth: "standard" }),
    });
  } catch (_networkErr) {
    // Network error (CORS, connection refused, mixed content, etc.)
    console.warn("[AutoResearch] Backend unreachable — falling back to Demo Mode");
    return startMockResearch(query, onEvent, onReport, onError);
  }

  if (!res.ok) {
    console.warn(`[AutoResearch] Backend returned ${res.status} — falling back to Demo Mode`);
    return startMockResearch(query, onEvent, onReport, onError);
  }

  // If we get here, the backend is reachable and responded OK
  try {
    const { job_id } = await res.json();

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
    // JSON parse failed or some other issue — fallback
    console.warn("[AutoResearch] SSE setup failed — falling back to Demo Mode");
    return startMockResearch(query, onEvent, onReport, onError);
  }
}
