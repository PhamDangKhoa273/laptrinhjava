#!/usr/bin/env bash
# docs:check — Markdown link checker. POSIX bash port of docs-check.ps1.
set -u

repo_root="$(cd "$(dirname "$0")/../.." && pwd)"
docs_root="$repo_root/docs"
[ -d "$docs_root" ] || { echo "docs/ not found"; exit 0; }

broken_count=0
total_links=0
broken_list=""

while IFS= read -r -d '' md_file; do
    file_dir="$(dirname "$md_file")"
    rel_path="${md_file#$repo_root/}"

    # Strip fenced code blocks and inline code spans so demo link syntax in code doesn't false-positive.
    stripped="$(awk '
        BEGIN{infence=0}
        /^```/{ infence = !infence; next }
        infence{ next }
        { gsub(/`[^`]*`/, ""); print }
    ' "$md_file")"

    # Extract markdown links and steering #[[file:...]] refs in one pass.
    while IFS= read -r target; do
        [ -z "$target" ] && continue
        case "$target" in
            http://*|https://*|mailto:*|tel:*|'#'*) continue ;;
        esac
        # strip query/fragment
        clean="${target%%#*}"
        clean="${clean%%\?*}"
        [ -z "$clean" ] && continue
        total_links=$((total_links + 1))

        if [ "${clean:0:1}" = "/" ]; then
            abs="$repo_root${clean}"
        else
            abs="$file_dir/$clean"
        fi
        # Normalize path
        abs_norm="$(cd "$(dirname "$abs")" 2>/dev/null && pwd)/$(basename "$abs")" || abs_norm="$abs"

        if [ ! -e "$abs" ] && [ ! -e "$abs_norm" ]; then
            broken_count=$((broken_count + 1))
            broken_list="$broken_list
  $rel_path -> $target"
        fi
    done < <(echo "$stripped" | grep -oE '\[[^]]*\]\([^)[:space:]]+\)|#\[\[file:[^]]+\]\]' \
        | sed -E 's/.*\(([^)[:space:]]+)\).*/\1/; s/.*#\[\[file:([^]]+)\]\].*/\1/')

done < <(find "$docs_root" -type f -name '*.md' -print0)

echo "docs:check  links=$total_links  broken=$broken_count"
if [ "$broken_count" -gt 0 ]; then
    echo
    echo "Broken links:$broken_list"
    exit 1
fi
exit 0
