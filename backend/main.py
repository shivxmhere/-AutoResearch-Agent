"""
AutoResearch Agent — FastAPI Application
Main entry point with REST + SSE streaming endpoints.
"""

import os
import sys
import uuid
import json
import time
import asyncio
from pathlib import Path

# Add backend to path so imports work when running from backend/
sys.path.insert(0, str(Path(__file__).parent))

from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sse_starlette.sse import EventSourceResponse

from models.schemas import (
    ResearchQuery,
    ResearchReport,
    Source,
    AgentEvent,
    JobResponse,
    HealthResponse,
)
from agents.orchestrator import build_research_graph, ResearchState

# ─── Demo Data ───────────────────────────────────────────────────────

DEMO_REPORT = {
    "query": "Analyze the AI startup ecosystem in India 2025",
    "executive_summary": "India's AI startup ecosystem has grown exponentially in 2025, with over 1,200 active AI companies and $4.2B in venture funding. Key hubs include Bangalore, Hyderabad, and emerging tier-2 cities. The sector is driven by enterprise AI adoption, government Digital India initiatives, and a strong pool of ML talent from IITs and IIScs.",
    "key_findings": [
        "India now has 1,200+ active AI startups, up 340% from 2022",
        "Total AI startup funding reached $4.2B in 2024, projected $6B by 2025",
        "Bangalore accounts for 42% of all Indian AI companies",
        "Government INDIAAI Mission allocated ₹10,372 crore for AI infrastructure",
        "Top sectors: HealthTech AI (28%), FinTech AI (22%), AgriTech AI (18%)",
        "63% of Indian enterprises now use at least one AI solution",
        "Indian AI talent pool: 420,000 professionals, 2nd largest globally"
    ],
    "detailed_analysis": "## Market Overview\n\nIndia's AI startup landscape in 2025 represents one of the most dynamic emerging markets globally. Factors propelling this growth include active government initiatives, massive pools of engineering talent, and a high rate of digital adoption among enterprises.\n\n## Key Players\n\nSector leaders include Krutrim (Ola's AI division), Sarvam AI, and various vertical-specific players addressing healthcare, agriculture, and finance.\n\n## Challenges\n\nDespite growth, challenges persist: data quality issues, regulatory uncertainty, and infrastructure gaps in non-metro areas.",
    "sources": [
        {"url": "https://nasscom.in/ai-report-2025", "title": "NASSCOM India AI Report 2025", "snippet": "Comprehensive analysis of India's AI ecosystem growth", "relevance_score": 0.95},
        {"url": "https://inc42.com/ai-startups-india", "title": "Inc42: India AI Startups Landscape", "snippet": "Funding trends and key players in Indian AI", "relevance_score": 0.88},
        {"url": "https://indiaaistory.com", "title": "India AI Story — Government Initiatives", "snippet": "INDIAAI Mission and policy framework analysis", "relevance_score": 0.82}
    ],
    "contradictions": [
        "Some analysts cite funding slowdown in H2 2024 while others report record highs",
        "Government claims 100K AI jobs created; industry surveys suggest lower figures"
    ],
    "confidence_score": 87,
    "generated_at": "2025-03-27T10:30:00Z"
}

app = FastAPI(
    title="AutoResearch Agent",
    description="AI-powered multi-agent autonomous research system",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all for hackathon
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory job store (fine for hackathon)
jobs: dict[str, dict] = {}


# ─── Endpoints ───────────────────────────────────────────────────────

@app.get("/", tags=["root"])
async def root():
    return {
        "name": "AutoResearch Agent",
        "version": "1.0.0",
        "endpoints": [
            "POST /research",
            "GET /research/{job_id}/stream",
            "GET /health",
        ],
    }


@app.get("/health", response_model=HealthResponse, tags=["health"])
async def health_check():
    """Health check endpoint."""
    return HealthResponse(status="ok", agents=5)


@app.post("/research", response_model=JobResponse, tags=["research"])
async def start_research(request: ResearchQuery):
    """
    Start a new research job.

    Returns a job_id that can be used with the SSE stream endpoint.
    """
    job_id = str(uuid.uuid4())
    jobs[job_id] = {
        "query": request.query,
        "max_sources": request.max_sources,
        "depth": request.depth,
        "status": "started",
        "created_at": time.time(),
    }
    return JobResponse(job_id=job_id, status="started")


@app.get("/research/{job_id}/stream", tags=["research"])
async def stream_research(job_id: str):
    """
    SSE streaming endpoint — the centerpiece of the demo.

    Runs the LangGraph research pipeline and streams each agent's
    progress events in real-time. When complete, streams the final report.
    """
    job = jobs.get(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    current_job = jobs[job_id]

    async def event_generator():
        query = current_job["query"]
        max_sources = current_job.get("max_sources", 10)
        depth = current_job.get("depth", "standard")

        # Send start event
        yield {
            "data": json.dumps({
                "agent": "system",
                "status": "working",
                "message": f"Starting research: {query}",
                "progress": 0,
                "timestamp": time.time(),
            }),
        }

        # Run the pipeline in a thread to not block the event loop
        try:
            graph = build_research_graph()

            initial_state = {
                "query": query,
                "max_sources": max_sources,
                "depth": depth,
                "search_queries": [],
                "raw_sources": [],
                "scraped_content": [],
                "analysis": "",
                "fact_check_results": [],
                "final_report": {},
                "events": [],
                "step": 0,
            }

            # We use stream mode to get intermediate node outputs
            # This lets us stream events as each agent completes
            node_progress = {
                "generate_queries": 10,
                "search_web": 30,
                "scrape_sources": 50,
                "analyze_content": 70,
                "fact_check": 85,
                "generate_report": 100,
            }

            final_state = None

            # Stream through node executions  
            for output in graph.stream(initial_state):
                for node_name, node_state in output.items():
                    progress = node_progress.get(node_name, 0)

                    # Emit all events from this node
                    node_events = node_state.get("events", [])
                    for evt in node_events:
                        yield {
                            "data": json.dumps({
                                "agent": evt.get("agent", node_name),
                                "status": evt.get("status", "working"),
                                "message": evt.get("message", ""),
                                "progress": progress,
                                "timestamp": evt.get("timestamp", time.time()),
                            }),
                        }
                        await asyncio.sleep(0.05)  # Small delay for smooth streaming

                    final_state = node_state

                await asyncio.sleep(0.1)

            # Send the final report
            report = {}
            if final_state is not None:
                if isinstance(final_state, dict) and "final_report" in final_state:
                    report = final_state["final_report"]
                else:
                    # Use the accumulated state itself if not nested
                    report = final_state

            yield {
                "data": json.dumps({
                    "type": "report",
                    "report": report,
                }),
            }

            # Send completion
            yield {
                "data": json.dumps({
                    "type": "done",
                    "message": "Research complete!",
                    "timestamp": time.time(),
                }),
            }

            # Update job status
            jobs[job_id]["status"] = "completed"
            jobs[job_id]["report"] = report

        except Exception as e:
            yield {
                "data": json.dumps({
                    "type": "error",
                    "message": f"Research failed: {str(e)}",
                    "timestamp": time.time(),
                }),
            }
            jobs[job_id]["status"] = "failed"
            jobs[job_id]["error"] = str(e)

    return EventSourceResponse(event_generator())


@app.get("/research/{job_id}", tags=["research"])
async def get_research_status(job_id: str):
    """Get the status and result of a research job."""
    job = jobs.get(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    return {
        "job_id": job_id,
        "status": job.get("status", "unknown"),
        "query": job.get("query", ""),
        "report": job.get("report"),
    }


@app.get("/demo", tags=["demo"])
async def get_demo_report():
    """Return the static demo report for easy testing."""
    return DEMO_REPORT


# ─── Run ─────────────────────────────────────────────────────────────

if __name__ == "__main__":
    import uvicorn
    print("🚀 AutoResearch Agent starting on http://localhost:8000")
    print("📖 API docs: http://localhost:8000/docs")
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
