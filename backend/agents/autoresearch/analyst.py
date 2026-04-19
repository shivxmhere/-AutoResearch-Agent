"""
Analyst Agent — Synthesizes findings using RAG + Groq LLM.
"""

import os
import time
from langchain_groq import ChatGroq
from tools.rag import RAGStore


def get_llm():
    """Create Groq LLM instance."""
    return ChatGroq(
        model="llama-3.3-70b-versatile",
        temperature=0.1,
        max_tokens=2048,
        groq_api_key=os.getenv("GROQ_API_KEY"),
    )


def analyst_node(state: dict) -> dict:
    try:
        events = []
        query = state["query"]
        scraped_content = state.get("scraped_content", [])
        raw_sources = state.get("raw_sources", [])

        events.append({
            "agent": "analyst",
            "status": "working",
            "message": f"Analyzing {len(scraped_content)} sources...",
            "timestamp": time.time(),
        })

        if scraped_content:
            # Build RAG index
            rag = RAGStore(chunk_size=1000, chunk_overlap=200)
            rag.build_index(scraped_content)

            # Retrieve most relevant chunks
            relevant_chunks = rag.retrieve(query, k=8)

            events.append({
                "agent": "analyst",
                "status": "working",
                "message": f"Retrieved {len(relevant_chunks)} relevant text chunks",
                "timestamp": time.time(),
            })
        else:
            relevant_chunks = []

        # Build source reference list
        source_refs = "\n".join([
            f"- {s.get('title', 'Unknown')} ({s.get('url', '')})"
            for s in raw_sources[:10]
        ])

        # Join chunks for context
        context = "\n\n---\n\n".join(relevant_chunks[:8])

        # Call LLM for analysis
        prompt = f"""You are an expert research analyst. Based on these sources about '{query}':

SOURCES:
{source_refs}

CONTENT:
{context}

Provide a thorough analysis with:
1. KEY FINDINGS (5-7 specific bullet points with evidence)
2. AREAS OF CONSENSUS (what multiple sources agree on)
3. CONTRADICTIONS OR DEBATES (where sources disagree)
4. GAPS IN INFORMATION (what's missing or unclear)
5. CONFIDENCE ASSESSMENT (how reliable are the findings, 0-100%)

Be specific and detailed. Reference sources when making claims.
Format your response with clear headers using markdown."""

        try:
            llm = get_llm()
            response = llm.invoke(prompt)
            analysis = response.content
        except Exception as e:
            analysis = f"Analysis error: {str(e)}. Raw findings from {len(scraped_content)} sources available."
            events.append({
                "agent": "analyst",
                "status": "working",
                "message": f"LLM error, using fallback: {str(e)[:80]}",
                "timestamp": time.time(),
            })

        events.append({
            "agent": "analyst",
            "status": "done",
            "message": f"Analysis complete — synthesized {len(relevant_chunks)} chunks",
            "timestamp": time.time(),
        })

        return {
            "analysis": analysis,
            "events": events,
            "step": state.get("step", 0) + 1,
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
