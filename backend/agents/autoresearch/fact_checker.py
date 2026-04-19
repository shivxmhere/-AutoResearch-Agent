"""
Fact Checker Agent — Verifies key claims against multiple sources.
"""

import os
import time
from langchain_groq import ChatGroq


def get_llm():
    """Create Groq LLM instance."""
    return ChatGroq(
        model="llama-3.3-70b-versatile",
        temperature=0.0,
        max_tokens=2048,
        groq_api_key=os.getenv("GROQ_API_KEY"),
    )


def fact_check_node(state: dict) -> dict:
    try:
        events = []
        analysis = state.get("analysis", "")
        scraped_content = state.get("scraped_content", [])
        raw_sources = state.get("raw_sources", [])

        events.append({
            "agent": "fact_checker",
            "status": "working",
            "message": "Extracting key claims for verification...",
            "timestamp": time.time(),
        })

        # Build evidence base from scraped content
        evidence = "\n\n---\n\n".join([c[:1500] for c in scraped_content[:6]])

        source_list = "\n".join([
            f"- {s.get('title', '')} ({s.get('url', '')})"
            for s in raw_sources[:10]
        ])

        prompt = f"""You are a meticulous fact-checker. Review this research analysis and verify its claims.

ANALYSIS TO VERIFY:
{analysis[:3000]}

AVAILABLE EVIDENCE FROM SOURCES:
{evidence[:4000]}

SOURCES USED:
{source_list}

Your task:
1. Identify the 5-8 most important factual claims in the analysis
2. For each claim, assess: VERIFIED (supported by multiple sources), PARTIALLY VERIFIED (some support), or UNVERIFIED (no clear support)
3. Note any claims that CONTRADICT available evidence
4. Give an overall reliability score (0-100%)

Format your response as:

CLAIM 1: [claim text]
STATUS: [VERIFIED/PARTIALLY VERIFIED/UNVERIFIED]
EVIDENCE: [brief evidence or lack thereof]

...

OVERALL RELIABILITY: [score]%
NOTES: [any important caveats]"""

        try:
            llm = get_llm()
            response = llm.invoke(prompt)
            fact_check_text = response.content
        except Exception as e:
            fact_check_text = f"Fact-check unavailable: {str(e)}"
            events.append({
                "agent": "fact_checker",
                "status": "working",
                "message": f"LLM error: {str(e)[:80]}",
                "timestamp": time.time(),
            })

        # Parse out any contradictions
        contradictions = []
        for line in fact_check_text.split("\n"):
            line_lower = line.lower()
            if "contradict" in line_lower or "unverified" in line_lower:
                contradictions.append(line.strip())

        events.append({
            "agent": "fact_checker",
            "status": "done",
            "message": f"Fact-check complete — found {len(contradictions)} items needing attention",
            "timestamp": time.time(),
        })

        return {
            "fact_check_results": [fact_check_text],
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
