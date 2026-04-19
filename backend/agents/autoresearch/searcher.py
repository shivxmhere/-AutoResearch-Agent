"""
Searcher Agent — Runs search queries and deduplicates results.
"""

import time
import requests
from tools.web_search import tavily_search, serper_search

def ddg_search(query):
    try:
        url = f"https://api.duckduckgo.com/?q={query}&format=json&no_html=1"
        r = requests.get(url, timeout=5)
        return [{"url": t.get("FirstURL"), "title": t.get("Text", "")[:50], "content": t.get("Text"), "score": 0.5} for t in r.json().get("RelatedTopics", []) if "FirstURL" in t]
    except Exception:
        return []

def search_node(state: dict) -> dict:
    try:
        events = []
        query = state["query"]
        search_queries = state.get("search_queries", [query])
        max_sources = state.get("max_sources", 10)

        all_results = []
        seen_urls = set()

        for sq in search_queries:
            events.append({
                "agent": "searcher",
                "status": "working",
                "message": f"Searching: {sq}",
                "timestamp": time.time(),
            })

            try:
                # Primary: Tavily
                results = tavily_search(sq, max_results=8)
            except Exception:
                results = []

            # If Tavily returns few results, supplement with Serper or DDG
            if len(results) < 3:
                try:
                    serper_results = serper_search(sq, max_results=5)
                    results.extend(serper_results)
                except Exception:
                    # Fallback to duckduckgo
                    results.extend(ddg_search(sq))

            if not results:
                results.extend(ddg_search(sq))

            # Deduplicate by URL
            for r in results:
                url = r.get("url", "")
                if url and url not in seen_urls:
                    seen_urls.add(url)
                    all_results.append(r)

        # Sort by relevance score
        all_results.sort(key=lambda x: x.get("score", 0), reverse=True)

        # Keep top N
        top_results = all_results[:max_sources]

        events.append({
            "agent": "searcher",
            "status": "done",
            "message": f"Found {len(top_results)} unique sources from {len(search_queries)} queries",
            "timestamp": time.time(),
        })

        return {
            "raw_sources": top_results,
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
