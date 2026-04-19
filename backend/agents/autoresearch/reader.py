"""
Reader Agent — Scrapes content from discovered URLs concurrently.
"""

import time
from concurrent.futures import ThreadPoolExecutor, as_completed
from tools.scraper import scrape_url


MIN_CONTENT_LENGTH = 200
MAX_WORKERS = 5


def _scrape_single(source: dict) -> dict | None:
    """Scrape a single source and return enriched result or None."""
    url = source.get("url", "")
    title = source.get("title", "Unknown")

    if not url:
        return None

    content = scrape_url(url)

    if content and len(content) >= MIN_CONTENT_LENGTH:
        return {
            "url": url,
            "title": title,
            "content": content,
            "snippet": source.get("content", ""),
        }

    return None


def reader_node(state: dict) -> dict:
    try:
        events = []
        raw_sources = state.get("raw_sources", [])

        events.append({
            "agent": "reader",
            "status": "working",
            "message": f"Reading {len(raw_sources)} web pages...",
            "timestamp": time.time(),
        })

        scraped_content = []
        successful = 0

        # Scrape concurrently
        with ThreadPoolExecutor(max_workers=MAX_WORKERS) as executor:
            futures = {}
            for source in raw_sources[:12]:  # Cap at 12 to avoid too many requests
                future = executor.submit(_scrape_single, source)
                futures[future] = source

            for future in as_completed(futures):
                source = futures[future]
                try:
                    result = future.result()
                    if result:
                        scraped_content.append(result["content"])
                        successful += 1
                        events.append({
                            "agent": "reader",
                            "status": "working",
                            "message": f"Read: {source.get('title', 'Unknown')[:60]}",
                            "timestamp": time.time(),
                        })
                except Exception as e:
                    events.append({
                        "agent": "reader",
                        "status": "working",
                        "message": f"Failed to read: {source.get('url', '?')[:50]} — {str(e)[:50]}",
                        "timestamp": time.time(),
                    })

        events.append({
            "agent": "reader",
            "status": "done",
            "message": f"Successfully read {successful} out of {len(raw_sources)} sources",
            "timestamp": time.time(),
        })

        return {
            "scraped_content": scraped_content,
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
