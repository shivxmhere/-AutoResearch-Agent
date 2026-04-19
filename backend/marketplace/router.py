import asyncio
import json
import time
import uuid
from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import List

from backend.models.agent_dna import AgentDNA
from backend.agents.registry import AGENT_REGISTRY
from backend.marketplace.search import match_agent

router = APIRouter()

class MatchRequest(BaseModel):
    query: str

class RunRequest(BaseModel):
    input: str

class ArenaRunRequest(BaseModel):
    agent_id_a: str
    agent_id_b: str
    input: str

# In-memory session tracking
sessions = {}

@router.get("/agents", response_model=List[AgentDNA])
async def get_all_agents():
    return AGENT_REGISTRY

@router.get("/agents/{id}", response_model=AgentDNA)
async def get_agent(id: str):
    agent = next((a for a in AGENT_REGISTRY if a.id == id), None)
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    return agent

@router.post("/agents/match", response_model=AgentDNA)
async def match_agent_endpoint(request: MatchRequest):
    return match_agent(request.query)

@router.post("/agents/{id}/run")
async def run_agent(id: str, request: RunRequest):
    agent = next((a for a in AGENT_REGISTRY if a.id == id), None)
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    return {"status": "success", "agent_id": id, "input": request.input}

@router.get("/agents/{id}/stream")
async def stream_agent(id: str, input: str = ""):
    agent = next((a for a in AGENT_REGISTRY if a.id == id), None)
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")

    async def event_generator():
        if id == "autoresearch":
            try:
                from backend.agents.autoresearch.orchestrator import build_research_graph
                graph = build_research_graph()
                
                initial_state = {
                    "query": input,
                    "max_sources": 5,
                    "depth": "standard",
                    "search_queries": [],
                    "raw_sources": [],
                    "scraped_content": [],
                    "analysis": "",
                    "fact_check_results": [],
                    "final_report": {},
                    "events": [],
                    "step": 0,
                }
                
                node_progress = {
                    "generate_queries": 10,
                    "search_web": 30,
                    "scrape_sources": 50,
                    "analyze_content": 70,
                    "fact_check": 85,
                    "generate_report": 100,
                }

                yield f'data: {{"type": "agent_status", "agent": "orchestrator", "status": "running", "message": "Graph initialized, starting pipeline..."}}\n\n'
                
                final_state = None
                
                for output in graph.stream(initial_state):
                    for node_name, node_state in output.items():
                        progress = node_progress.get(node_name, 0)
                        node_events = node_state.get("events", [])
                        
                        # Just yielding a status for each node entry
                        yield f'data: {{"type": "agent_status", "agent": "{node_name}", "status": "running", "message": "Executing {node_name}..."}}\n\n'
                        
                        for evt in node_events:
                            msg = evt.get("message", "")
                            agent_name = evt.get("agent", node_name)
                            yield f'data: {{"type": "agent_status", "agent": "{agent_name}", "status": "running", "message": "{msg}"}}\n\n'
                            await asyncio.sleep(0.05)
                            
                        # Also stream some text chunk
                        if "analysis" in node_state and node_state["analysis"]:
                            chunk = node_state["analysis"][-50:]
                            yield f'data: {{"type": "output_chunk", "text": "Analyzed segment..."}}\n\n'
                            
                        final_state = node_state
                    await asyncio.sleep(0.1)

                report = {}
                if final_state and isinstance(final_state, dict) and "final_report" in final_state:
                    report = final_state["final_report"]
                else:
                    report = final_state

                import json
                report_md = f"# Research Report: {input}\n\n"
                if "executive_summary" in report:
                    report_md += f"## Executive Summary\n{report['executive_summary']}\n\n"
                if "key_findings" in report:
                    report_md += "## Key Findings\n" + "\n".join([f"- {f}" for f in report['key_findings']]) + "\n\n"
                if "detailed_analysis" in report:
                    report_md += f"## Detailed Analysis\n{report['detailed_analysis']}\n\n"

                yield f'data: {{"type": "complete", "report": {json.dumps(report_md)}}}\n\n'
                return

            except Exception as e:
                import traceback
                print("Error in langgraph:", traceback.format_exc())
                # Fallback to mock if graph fails
                pass

        # Fallback / Mock
        if id == "competescope":
             yield f'data: {{"type": "agent_status", "agent": "searcher", "status": "running", "message": "Scanning 8 sources for {input}..."}}\n\n'
             await asyncio.sleep(2)
             yield f'data: {{"type": "output_chunk", "text": "> Source 1: relevance 94%\\n"}}\n\n'
             yield f'data: {{"type": "agent_status", "agent": "analyst", "status": "running", "message": "Mapping competitor landscape..."}}\n\n'
             await asyncio.sleep(2)
             yield f'data: {{"type": "output_chunk", "text": "> Found 3 direct competitors\\n"}}\n\n'
             yield f'data: {{"type": "agent_status", "agent": "reporter", "status": "running", "message": "Drafting SWOT table..."}}\n\n'
             await asyncio.sleep(2)
             report = f"# CompeteScope Report: {input}\n\n## Competitors\n- Competitor A: High price, great UI\n- Competitor B: Low price, clunky UI\n\n## SWOT\n**Strengths**: Fast growing market\n**Weaknesses**: High CAC"
             import json
             yield f'data: {{"type": "complete", "report": {json.dumps(report)}}}\n\n'
        else:
             yield f'data: {{"type": "agent_status", "agent": "orchestrator", "status": "running", "message": "Running default logic..."}}\n\n'
             await asyncio.sleep(2)
             yield f'data: {{"type": "complete", "report": "# Completed\\n\\nReport for {input}"}}\n\n'

    return StreamingResponse(event_generator(), media_type="text/event-stream")

@router.post("/arena/run")
async def run_arena(request: ArenaRunRequest):
    session_id = str(uuid.uuid4())
    return {"status": "success", "session_id": session_id, "agent_a": request.agent_id_a, "agent_b": request.agent_id_b}

@router.get("/arena/stream/{session_id}")
async def stream_arena(session_id: str, agent_id: str):
    async def event_generator():
        yield f'data: {{"type": "agent_status", "agent": "system", "status": "running", "message": "Starting {agent_id} in arena..."}}\n\n'
        await asyncio.sleep(2)
        yield f'data: {{"type": "complete", "report": "Fast execution completed by {agent_id}"}}\n\n'

    return StreamingResponse(event_generator(), media_type="text/event-stream")
