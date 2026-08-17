#!/usr/bin/env python3
"""Audit sitemap URLs for crawl-ready HTTP and server-rendered SEO essentials."""

from __future__ import annotations

import concurrent.futures
import json
import sys
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import urlsplit, urlunsplit
from xml.etree import ElementTree

import requests
from bs4 import BeautifulSoup


SITE_ORIGIN = sys.argv[1].rstrip("/") if len(sys.argv) > 1 else "https://al-eshraqa.co"
WORKERS = 12
TIMEOUT_SECONDS = 30
USER_AGENT = "IshraqaTechnicalAudit/1.0 (+https://al-eshraqa.co/)"


def normalise_url(url: str) -> str:
    parts = urlsplit(url)
    path = parts.path or "/"
    return urlunsplit((parts.scheme.lower(), parts.netloc.lower(), path, parts.query, ""))


def get_sitemap_urls(sitemap_url: str) -> list[str]:
    response = requests.get(sitemap_url, timeout=TIMEOUT_SECONDS, headers={"User-Agent": USER_AGENT})
    response.raise_for_status()
    root = ElementTree.fromstring(response.content)
    return [element.text.strip() for element in root.findall("{*}url/{*}loc") if element.text]


def audit_url(url: str) -> dict[str, object]:
    result: dict[str, object] = {"url": url, "issues": []}
    try:
        response = requests.get(
            url,
            timeout=TIMEOUT_SECONDS,
            allow_redirects=True,
            headers={"User-Agent": USER_AGENT},
        )
        result.update(
            {
                "status": response.status_code,
                "final_url": response.url,
                "redirects": len(response.history),
                "content_type": response.headers.get("content-type", ""),
                "elapsed_seconds": round(response.elapsed.total_seconds(), 3),
            }
        )
        issues: list[str] = result["issues"]  # type: ignore[assignment]
        if response.status_code != 200:
            issues.append(f"HTTP_{response.status_code}")
        if response.history:
            issues.append("redirect_in_sitemap")
        if "text/html" not in response.headers.get("content-type", ""):
            issues.append("non_html_response")
            return result

        soup = BeautifulSoup(response.text, "html.parser")
        title = soup.title.get_text(" ", strip=True) if soup.title else ""
        description_tag = soup.find("meta", attrs={"name": lambda value: value and value.lower() == "description"})
        description = description_tag.get("content", "").strip() if description_tag else ""
        canonical_tag = soup.find(
            "link",
            attrs={"rel": lambda value: value and "canonical" in [entry.lower() for entry in (value if isinstance(value, list) else str(value).split())]},
        )
        canonical = canonical_tag.get("href", "").strip() if canonical_tag else ""
        robots_tag = soup.find("meta", attrs={"name": lambda value: value and value.lower() == "robots"})
        robots = robots_tag.get("content", "").strip().lower() if robots_tag else ""
        result.update({"title": title, "description": description, "canonical": canonical, "robots": robots})

        if not title:
            issues.append("missing_title")
        if not description:
            issues.append("missing_meta_description")
        if not canonical:
            issues.append("missing_canonical")
        elif normalise_url(canonical) != normalise_url(url):
            issues.append("canonical_mismatch")
        if "noindex" in robots:
            issues.append("noindex")
    except requests.RequestException as error:
        result["issues"] = ["request_failed"]
        result["error"] = str(error)
    return result


def main() -> int:
    stamp = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")
    report_dir = Path("audit") / f"seo-{stamp}"
    report_dir.mkdir(parents=True, exist_ok=True)
    sitemap_url = f"{SITE_ORIGIN}/sitemap.xml"
    try:
        urls = get_sitemap_urls(sitemap_url)
    except (requests.RequestException, ElementTree.ParseError) as error:
        print(f"تعذر تحميل خريطة الموقع: {error}", file=sys.stderr)
        return 1

    with (report_dir / "urls.txt").open("w", encoding="utf-8") as handle:
        handle.write("\n".join(urls) + "\n")

    with concurrent.futures.ThreadPoolExecutor(max_workers=WORKERS) as executor:
        results = list(executor.map(audit_url, urls))

    issue_results = [result for result in results if result["issues"]]
    summary = {
        "generated_at_utc": stamp,
        "sitemap": sitemap_url,
        "url_count": len(results),
        "passed_count": len(results) - len(issue_results),
        "issue_count": len(issue_results),
        "status_counts": {str(status): sum(1 for result in results if result.get("status") == status) for status in sorted({result.get("status") for result in results})},
        "issues": issue_results,
    }
    with (report_dir / "results.json").open("w", encoding="utf-8") as handle:
        json.dump(results, handle, ensure_ascii=False, indent=2)
    with (report_dir / "summary.json").open("w", encoding="utf-8") as handle:
        json.dump(summary, handle, ensure_ascii=False, indent=2)
    print(report_dir)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
