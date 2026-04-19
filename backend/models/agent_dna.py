from pydantic import BaseModel
from typing import List, Literal

class AgentDNA(BaseModel):
    id: str
    name: str
    tagline: str
    category: Literal["research", "intelligence", "code", "creative", "data"]
    capabilities: List[str]
    tools_used: List[str]
    avg_speed_seconds: int
    accuracy_score: float
    cost_per_run: float
    agent_count: int
    input_type: str
    output_type: str
    total_runs: int
    star_rating: float
    author: str
    version: str
    status: Literal["live", "beta", "coming_soon"]
    intent_keywords: List[str]
