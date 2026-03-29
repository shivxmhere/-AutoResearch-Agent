"""
Orchestrator Agent — Master LangGraph pipeline that coordinates all agents.
"""

import os
import time
import operator
from typing import TypedDict, Annotated

from langgraph.graph import StateGraph, END
from langchain_groq import ChatGroq

from agents.searcher import search_node
from agents.reader import reader_node
from agents.analyst import analyst_node
from agents.fact_checker import fact_check_node
from agents.reporter import reporter_node


# ─── State Definition ───────────────────────────────────────────────

class ResearchState(TypedDict):
    query: str
    max_sources: int
    search_queries: list[str]
    raw_sources: list[dict]
    scraped_content: list[str]
    analysis: str
    fact_check_results: list[str]
    final_report: dict
    events: Annotated[list, operator.add]
    step: int


# ─── Query Generation Node ──────────────────────────────────────────

def generate_queries_node(state: dict) -> dict:
    try:
        events = []
        query = state["query"]
        depth = state.get("depth", "standard")

        events.append({
            "agent": "orchestrator",
            "status": "working",
            "message": f"Planning research strategy for: {query}",
            "timestamp": time.time(),
        })

        num_queries = {"quick": 3, "standard": 5, "deep": 7}.get(depth, 5)

        try:
            llm = ChatGroq(
                model="llama-3.3-70b-versatile",
                temperature=0.1,
                max_tokens=2048,
                groq_api_key=os.getenv("GROQ_API_KEY"),
            )

            prompt = f"""You are a research planning assistant. Given this research topic:

"{query}"

Generate exactly {num_queries} diverse and specific search queries that would help thoroughly research this topic.
The queries should cover different aspects, perspectives, and angles.

Return ONLY the queries, one per line. No numbering, no bullets, no extra text."""

            response = llm.invoke(prompt)
            # Cast response.content to str
            content_str = str(response.content).strip()
            queries: list[str] = [
                q.strip().strip("-").strip("•").strip()
                for q in content_str.split("\n")
                if q.strip() and len(q.strip()) > 10
            ]
            queries = queries[:int(num_queries)]

            # Always include the original query
            if query not in queries:
                queries.insert(0, query)

        except Exception as e:
            # Fallback: generate simple query variations
            fallback_list: list[str] = [
                str(query),
                f"{query} overview",
                f"{query} latest research",
                f"{query} analysis",
                f"{query} pros and cons",
            ]
            queries = fallback_list[:int(num_queries)]
            events.append({
                "agent": "orchestrator",
                "status": "working",
                "message": f"LLM query generation failed, using fallback: {str(e)[:60]}",
                "timestamp": time.time(),
            })

        events.append({
            "agent": "orchestrator",
            "status": "done",
            "message": f"Generated {len(queries)} research queries",
            "timestamp": time.time(),
        })

        return {
            "search_queries": queries,
            "events": events,
            "step": 1,
        }
    except Exception as e:
        events = state.get("events", [])
        events.append({
            "agent": "system",
            "status": "error",
            "message": str(e),
            "timestamp": time.time(),
        })
        return {"events": events}


# ─── Build the LangGraph Pipeline ───────────────────────────────────

def build_research_graph() -> StateGraph:
    """Build and compile the multi-agent research pipeline."""

    workflow = StateGraph(ResearchState)

    # Add all agent nodes
    workflow.add_node("generate_queries", generate_queries_node)
    workflow.add_node("search_web", search_node)
    workflow.add_node("scrape_sources", reader_node)
    workflow.add_node("analyze_content", analyst_node)
    workflow.add_node("fact_check", fact_check_node)
    workflow.add_node("generate_report", reporter_node)

    # Define the pipeline flow
    workflow.set_entry_point("generate_queries")
    workflow.add_edge("generate_queries", "search_web")
    workflow.add_edge("search_web", "scrape_sources")
    workflow.add_edge("scrape_sources", "analyze_content")
    workflow.add_edge("analyze_content", "fact_check")
    workflow.add_edge("fact_check", "generate_report")
    workflow.add_edge("generate_report", END)

    return workflow.compile()


# Module-level compiled graph (singleton)
research_graph = build_research_graph()


def run_research(query: str, max_sources: int = 10, depth: str = "standard") -> dict:
    """
    Run the full research pipeline synchronously.

    Returns the final state dict with the report.
    """
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

    final_state = research_graph.invoke(initial_state)
    return final_state
