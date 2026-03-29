"""
Pydantic Models — Data schemas for AutoResearch Agent.
"""

from pydantic import BaseModel, Field
from typing import Optional
import time


class ResearchQuery(BaseModel):
    """Incoming research request."""
    query: str = Field(..., description="The research topic or question")
    max_sources: int = Field(default=10, ge=1, le=20, description="Max sources to gather")
    depth: str = Field(default="standard", description="Research depth: quick, standard, deep")


class AgentEvent(BaseModel):
    """Real-time event emitted by an agent during research."""
    agent: str = Field(..., description="Name of the agent emitting the event")
    status: str = Field(..., description="Status: working, done, error")
    message: str = Field(..., description="Human-readable progress message")
    timestamp: float = Field(default_factory=time.time)


class Source(BaseModel):
    """A research source with metadata."""
    url: str = ""
    title: str = ""
    snippet: str = ""
    relevance_score: float = 0.0


class ResearchReport(BaseModel):
    """Final structured research report."""
    query: str
    executive_summary: str = ""
    key_findings: list[str] = Field(default_factory=list)
    detailed_analysis: str = ""
    sources: list[Source] = Field(default_factory=list)
    contradictions: list[str] = Field(default_factory=list)
    confidence_score: float = 0.0
    generated_at: str = ""


class JobResponse(BaseModel):
    """Response when starting a research job."""
    job_id: str
    status: str = "started"


class HealthResponse(BaseModel):
    """Health check response."""
    status: str = "ok"
    agents: int = 5
