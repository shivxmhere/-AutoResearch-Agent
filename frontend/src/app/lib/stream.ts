import { AgentEvent, ResearchReport } from "../types";

export async function startResearch(
  query: string,
  onEvent: (event: AgentEvent) => void,
  onReport: (report: ResearchReport) => void,
  onError: (error: string) => void
) {
  try {
    // First POST to start research
    const res = await fetch("http://localhost:8000/research", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query, max_sources: 8, depth: "standard" })
    });
    
    if (!res.ok) {
      throw new Error(`Failed to start research: ${res.statusText}`);
    }
    
    const { job_id } = await res.json();
    
    // Then connect to SSE stream
    const eventSource = new EventSource(
      `http://localhost:8000/research/${job_id}/stream`
    );
    
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
      onError("Connection lost. Please try again.");
      eventSource.close();
    });
    
    return () => eventSource.close();
  } catch (err: any) {
    onError(err.message || "Connection failed");
    return () => {};
  }
}
