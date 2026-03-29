"""
Web Search Tool — Tavily search wrapper with DuckDuckGo fallback.
"""

import os
import requests
from tavily import TavilyClient


def get_tavily_client() -> TavilyClient:
    """Create Tavily client with API key from env."""
    api_key = os.getenv("TAVILY_API_KEY", "")
    return TavilyClient(api_key=api_key)


def tavily_search(query: str, max_results: int = 8) -> list[dict]:
    """
    Search using Tavily API.

    Returns list of dicts: { url, title, content, score }
    Only returns results with relevance score > 0.5.
    Falls back to DuckDuckGo on failure.
    """
    try:
        client = get_tavily_client()
        response = client.search(
            query=query,
            max_results=max_results,
            search_depth="advanced",
            include_answer=False,
        )

        results = []
        for item in response.get("results", []):
            score = item.get("score", 0.0)
            if score > 0.5:
                results.append({
                    "url": item.get("url", ""),
                    "title": item.get("title", ""),
                    "content": item.get("content", ""),
                    "score": score,
                })

        # Sort by relevance score descending
        results.sort(key=lambda x: x["score"], reverse=True)
        return results

    except Exception as e:
        print(f"[WebSearch] Tavily error: {e}. Falling back to DuckDuckGo.")
        return duckduckgo_search(query, max_results)


def duckduckgo_search(query: str, max_results: int = 8) -> list[dict]:
    """
    Fallback search using DuckDuckGo Instant Answer API (no API key needed).
    """
    try:
        url = "https://api.duckduckgo.com/"
        params = {
            "q": query,
            "format": "json",
            "no_html": 1,
            "skip_disambig": 1,
        }
        resp = requests.get(url, params=params, timeout=5)
        data = resp.json()

        results = []

        # Abstract
        if data.get("Abstract"):
            results.append({
                "url": data.get("AbstractURL", ""),
                "title": data.get("Heading", query),
                "content": data.get("Abstract", ""),
                "score": 0.8,
            })

        # Related topics
        for topic in data.get("RelatedTopics", [])[:max_results]:
            if isinstance(topic, dict) and topic.get("Text"):
                results.append({
                    "url": topic.get("FirstURL", ""),
                    "title": topic.get("Text", "")[:100],
                    "content": topic.get("Text", ""),
                    "score": 0.6,
                })

        return results[:max_results]

    except Exception as e:
        print(f"[WebSearch] DuckDuckGo fallback error: {e}")
        return []


def serper_search(query: str, max_results: int = 8) -> list[dict]:
    """
    Alternative search using Serper API (Google results).
    """
    try:
        api_key = os.getenv("SERPER_API_KEY", "")
        if not api_key:
            return []

        resp = requests.post(
            "https://google.serper.dev/search",
            json={"q": query, "num": max_results},
            headers={"X-API-KEY": api_key, "Content-Type": "application/json"},
            timeout=10,
        )
        data = resp.json()

        results = []
        for item in data.get("organic", []):
            results.append({
                "url": item.get("link", ""),
                "title": item.get("title", ""),
                "content": item.get("snippet", ""),
                "score": 0.7,
            })

        return results

    except Exception as e:
        print(f"[WebSearch] Serper error: {e}")
        return []
