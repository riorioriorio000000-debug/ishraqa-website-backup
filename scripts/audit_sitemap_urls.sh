#!/usr/bin/env bash
set -euo pipefail

SITE_ORIGIN="${1:-https://al-eshraqa.co}"
MAX_JOBS="${MAX_JOBS:-12}"
STAMP="$(date -u +%Y%m%dT%H%M%SZ)"
REPORT_DIR="audit/indexing-${STAMP}"

mkdir -p "$REPORT_DIR"
SITEMAP_URL="${SITE_ORIGIN%/}/sitemap.xml"

curl --fail --silent --show-error --max-time 30 "$SITEMAP_URL" -o "$REPORT_DIR/sitemap.xml"
grep -oE '<loc>[^<]+' "$REPORT_DIR/sitemap.xml" | sed 's#<loc>##' > "$REPORT_DIR/urls.txt"

if [[ ! -s "$REPORT_DIR/urls.txt" ]]; then
  echo "لم تُستخرج أي روابط من خريطة الموقع: $SITEMAP_URL" >&2
  exit 1
fi

check_url() {
  local url="$1"
  local result output error
  output="$(curl --head --location --silent --show-error --output /dev/null --max-time 30 \
    --write-out '%{http_code}\t%{url_effective}\t%{num_redirects}\t%{content_type}\t%{time_total}' "$url" 2>&1 || true)"
  result="$(printf '%s\n' "$output" | tail -n 1)"
  error="$(printf '%s\n' "$output" | sed '$d' | tr '\n' ' ' | sed 's/[[:space:]]\+$//')"

  if [[ "$result" =~ ^[0-9]{3}$'\t' ]]; then
    printf '%s\t%s\t%s\n' "$url" "$result" "$error"
  else
    printf '%s\t000\t\t0\t\t0\t%s\n' "$url" "$output"
  fi
}

export -f check_url
export LC_ALL=C

{
  printf 'url\tstatus\tfinal_url\tredirects\tcontent_type\ttime_seconds\terror\n'
  xargs -r -n 1 -P "$MAX_JOBS" bash -c 'check_url "$1"' _ < "$REPORT_DIR/urls.txt"
} > "$REPORT_DIR/http-results.tsv"

awk -F '\t' 'NR > 1 { count[$2]++ } END { for (status in count) print status "\t" count[status] }' \
  "$REPORT_DIR/http-results.tsv" | sort -n > "$REPORT_DIR/status-summary.tsv"

{
  printf 'تدقيق خريطة الموقع\n'
  printf 'وقت التنفيذ (UTC): %s\n' "$STAMP"
  printf 'خريطة الموقع: %s\n' "$SITEMAP_URL"
  printf 'عدد الروابط: %s\n\n' "$(wc -l < "$REPORT_DIR/urls.txt" | tr -d ' ')"
  printf 'ملخص حالات HTTP:\n'
  cat "$REPORT_DIR/status-summary.tsv"
  printf '\n\nالنتائج التفصيلية محفوظة في: %s\n' "$REPORT_DIR/http-results.tsv"
} > "$REPORT_DIR/summary.txt"

printf '%s\n' "$REPORT_DIR"
