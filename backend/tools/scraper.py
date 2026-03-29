"""
Web Scraper Tool — BeautifulSoup content extractor.
"""

import requests
from bs4 import BeautifulSoup


HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/124.0.0.0 Safari/537.36"
    ),
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.5",
}

# Tags to remove entirely
REMOVE_TAGS = [
    "script", "style", "nav", "footer", "header", "aside",
    "iframe", "noscript", "svg", "form", "button",
]

# Common ad/cookie/popup class patterns
AD_PATTERNS = [
    "ad", "ads", "advert", "banner", "cookie", "popup", "modal",
    "sidebar", "social", "share", "newsletter", "subscribe",
    "promo", "sponsor",
]

MAX_CONTENT_LENGTH = 4000


def scrape_url(url: str) -> str:
    """
    Scrape and extract clean text content from a URL.

    - Removes nav, footer, script, style, ads
    - Extracts main content area
    - Truncates to 4000 chars
    - Returns empty string on error — never crashes
    """
    try:
        resp = requests.get(url, headers=HEADERS, timeout=2, allow_redirects=True)
        if resp.status_code != 200:
            return ""

        html = resp.text
        return extract_text(html)

    except Exception:
        return ""


def extract_text(html: str) -> str:
    """Extract clean text content from HTML."""
    try:
        soup = BeautifulSoup(html, "html.parser")

        # Remove unwanted tags
        for tag_name in REMOVE_TAGS:
            for tag in soup.find_all(tag_name):
                tag.decompose()

        # Remove elements with ad-related classes/ids
        for element in soup.find_all(True):
            classes = " ".join(element.get("class", [])).lower()
            element_id = (element.get("id") or "").lower()
            combined = classes + " " + element_id
            if any(pattern in combined for pattern in AD_PATTERNS):
                element.decompose()

        # Try to find main content area
        main_content = (
            soup.find("article")
            or soup.find("main")
            or soup.find("div", {"role": "main"})
            or soup.find("div", class_="content")
            or soup.find("div", class_="post")
        )

        # If no main content found, find largest text-containing div
        if not main_content:
            main_content = _find_largest_text_block(soup)

        if not main_content:
            main_content = soup.body or soup

        # Get text and clean whitespace
        text = main_content.get_text(separator="\n")
        lines = [line.strip() for line in text.splitlines()]
        text = "\n".join(line for line in lines if line and len(line) > 2)

        # Truncate
        if len(text) > MAX_CONTENT_LENGTH:
            text = text[:MAX_CONTENT_LENGTH] + "..."

        return text

    except Exception:
        return ""


def _find_largest_text_block(soup: BeautifulSoup):
    """Find the div with the most text content."""
    best = None
    best_len = 0

    for div in soup.find_all("div"):
        text = div.get_text(strip=True)
        if len(text) > best_len:
            best_len = len(text)
            best = div

    return best
