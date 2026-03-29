"""
Reporter Agent — Generates final structured research report.
"""

import os
import json
import time
from datetime import datetime, timezone
from langchain_groq import ChatGroq


def get_llm():
    """Create Groq LLM instance."""
    return ChatGroq(
        model="llama-3.3-70b-versatile",
        temperature=0.1,
        max_tokens=2048,
        groq_api_key=os.getenv("GROQ_API_KEY"),
    )


def reporter_node(state: dict) -> dict:
    try:
        events = []
        query = state["query"]
        analysis = state.get("analysis", "")
        fact_check = state.get("fact_check_results", [])
        raw_sources = state.get("raw_sources", [])

        events.append({
            "agent": "reporter",
            "status": "working",
            "message": "Generating executive summary...",
            "timestamp": time.time(),
        })

        # Build source list for the report
        source_entries = []
        for s in raw_sources[:10]:
            source_entries.append({
                "url": s.get("url", ""),
                "title": s.get("title", ""),
                "snippet": s.get("content", "")[:200],
                "relevance_score": round(s.get("score", 0.5), 2),
            })

        fact_check_text = "\n".join(fact_check) if fact_check else "No fact-check data available."

        prompt = f"""You are an expert research report writer. Generate a comprehensive research report.

RESEARCH QUERY: {query}

ANALYSIS:
{analysis[:4000]}

FACT-CHECK RESULTS:
{fact_check_text[:2000]}

Generate a JSON response with EXACTLY this structure (no markdown, just raw JSON):
{{
    "executive_summary": "A 2-3 paragraph executive summary of the research findings",
    "key_findings": ["finding 1", "finding 2", "finding 3", "finding 4", "finding 5"],
    "detailed_analysis": "Full detailed analysis in markdown format with ## headers, bullet points, and evidence",
    "contradictions": ["contradiction 1 if any", "contradiction 2 if any"],
    "confidence_score": 75
}}

IMPORTANT: Return ONLY valid JSON. No markdown code blocks. No extra text before or after."""

        try:
            llm = get_llm()

            events.append({
                "agent": "reporter",
                "status": "working",
                "message": "Writing detailed analysis...",
                "timestamp": time.time(),
            })

            response = llm.invoke(prompt)
            response_text = response.content.strip()

            # Try to parse JSON from response
            report_data = _parse_json_response(response_text)

        except Exception as e:
            # Fallback report structure
            report_data = {
                "executive_summary": f"Research on '{query}' encountered an error during report generation: {str(e)[:100]}. The analysis phase completed successfully.",
                "key_findings": ["Analysis was completed but report formatting failed"],
                "detailed_analysis": analysis[:3000] if analysis else "No analysis available.",
                "contradictions": [],
                "confidence_score": 30,
            }

        # Build final report
        final_report = {
            "query": query,
            "executive_summary": report_data.get("executive_summary", ""),
            "key_findings": report_data.get("key_findings", []),
            "detailed_analysis": report_data.get("detailed_analysis", ""),
            "sources": source_entries,
            "contradictions": report_data.get("contradictions", []),
            "confidence_score": report_data.get("confidence_score", 50),
            "generated_at": datetime.now(timezone.utc).isoformat(),
        }

        events.append({
            "agent": "reporter",
            "status": "done",
            "message": f"Report complete! {len(final_report['key_findings'])} key findings, confidence: {final_report['confidence_score']}%",
            "timestamp": time.time(),
        })

        return {
            "final_report": final_report,
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


def _parse_json_response(text: str) -> dict:
    """Parse JSON from LLM response, handling common issues."""
    # Try direct parse
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        pass

    # Try extracting JSON from markdown code block
    if "```json" in text:
        start = text.index("```json") + 7
        end = text.index("```", start)
        try:
            return json.loads(text[start:end].strip())
        except (json.JSONDecodeError, ValueError):
            pass

    if "```" in text:
        start = text.index("```") + 3
        end = text.index("```", start)
        try:
            return json.loads(text[start:end].strip())
        except (json.JSONDecodeError, ValueError):
            pass

    # Try finding JSON object boundaries
    try:
        start = text.index("{")
        end = text.rindex("}") + 1
        return json.loads(text[start:end])
    except (json.JSONDecodeError, ValueError):
        pass

    # Last resort fallback
    return {
        "executive_summary": text[:500],
        "key_findings": ["Report parsing failed — raw analysis available"],
        "detailed_analysis": text,
        "contradictions": [],
        "confidence_score": 40,
    }
