from backend.models.agent_dna import AgentDNA
from backend.agents.registry import AGENT_REGISTRY

def match_agent(query: str) -> AgentDNA:
    query_lower = query.lower()
    scores = {}
    for agent in AGENT_REGISTRY:
        if agent.status == "coming_soon":
            continue
        score = sum(1 for kw in agent.intent_keywords if kw in query_lower)
        scores[agent.id] = score
    
    if not scores:
        return AGENT_REGISTRY[0]
        
    best = max(scores, key=scores.get)
    if scores[best] == 0:
        return AGENT_REGISTRY[0]  # default to AutoResearch
    return next(a for a in AGENT_REGISTRY if a.id == best)
