import { AgentEvent, ResearchReport } from "../types";

// Auto-detect environments. In development, defaults to local backend.
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

// ─── DEMO / MOCK flow ────────────────────────────────────────────────
// Removed: The demo mode was displaying hardcoded text about AI startups
// regardless of user input, causing confusion. The app will now only show
// real research results or display an error if the backend is down.


// ─── MAIN EXPORT ─────────────────────────────────────────────────────

export async function startResearch(
  query: string,
  onEvent: (event: AgentEvent) => void,
  onReport: (report: ResearchReport) => void,
  onError: (error: string) => void
): Promise<() => void> {
  // If no API URL is configured or it's empty (though we set a default above)
  if (!API_URL) {
    console.error("[AutoResearch] No API URL configured");
    onError("Configuration Error: NEXT_PUBLIC_API_URL is missing.");
    return () => {};
  }

  // Try to reach the real backend
  let res: Response;
  try {
    res = await fetch(`${API_URL}/research`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query, max_sources: 8, depth: "standard" }),
    });
  } catch (networkErr: any) {
    // Network error (CORS, connection refused, mixed content, etc.)
    console.error("[AutoResearch] Backend unreachable:", networkErr);
    onError("Network error: Could not reach the backend. Please ensure the backend server is running.");
    return () => {};
  }

  if (!res.ok) {
    console.error(`[AutoResearch] Backend returned ${res.status}`);
    onError(`Server error: Backend returned status ${res.status}.`);
    return () => {};
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
    // JSON parse failed or some other issue
    console.error("[AutoResearch] SSE setup failed:", err);
    onError(`Streaming error: ${err.message || "Unknown error parsing response."}`);
    return () => {};
  }
}
