#!/usr/bin/env bash
# docs:trace — Brief bullet -> R-* coverage validator. Bash port of docs-trace.ps1.
set -u

repo_root="$(cd "$(dirname "$0")/../.." && pwd)"
docs_root="$repo_root/docs"
brief="$docs_root/01-requirements/functional/_brief-source.md"
req_root="$docs_root/01-requirements"
mod_root="$docs_root/04-modules"
openapi="$docs_root/05-api/openapi.yaml"

[ -f "$brief" ] || { echo "Brief source not found at $brief"; exit 0; }

# Extract bullets from latest "## Brief Revision" block.
latest="$(awk '
    /^## Brief Revision /{ inrev++; if (inrev>1) exit; print; next }
    inrev{ print }
' "$brief")"
if [ -z "$latest" ]; then echo "Brief has no '## Brief Revision' section; skipping"; exit 0; fi

# bullet lines start with '-' followed by space.
mapfile -t bullets < <(echo "$latest" | grep -E '^-[[:space:]]+\S')
bullet_count="${#bullets[@]}"

# Collect all req files content.
req_blob="$(find "$req_root" -type f -name '*.md' -exec cat {} +)"

# Collect R-* IDs.
mapfile -t req_ids < <(echo "$req_blob" | grep -oE 'R-[A-Z]{3}-[0-9]{3}' | sort -u)
req_id_count="${#req_ids[@]}"

# For each bullet, ensure first 30 chars appear in req docs.
missing=()
for bl in "${bullets[@]}"; do
    clean="$(echo "$bl" | sed -E 's/^-[[:space:]]+//')"
    [ "${#clean}" -lt 8 ] && continue
    needle="${clean:0:30}"
    if ! echo "$req_blob" | grep -F -q "$needle"; then
        missing+=("$clean")
    fi
done

# Cross surface: docs/04-modules + openapi.
cross=""
[ -d "$mod_root" ] && cross="$cross
$(find "$mod_root" -type f -name '*.md' -exec cat {} +)"
[ -f "$openapi" ] && cross="$cross
$(cat "$openapi")"

unref=()
for id in "${req_ids[@]}"; do
    if ! echo "$cross" | grep -F -q "$id"; then unref+=("$id"); fi
done

echo "docs:trace  bullets=$bullet_count  R-*=$req_id_count  missing-coverage=${#missing[@]}  unreferenced-R=${#unref[@]}"

if [ "${#missing[@]}" -gt 0 ]; then
    echo
    echo "Brief bullets not covered by any R-* (no matching source quote):"
    for b in "${missing[@]}"; do echo "  - $b"; done
fi
if [ "${#unref[@]}" -gt 0 ]; then
    echo
    echo "Warning: R-* not referenced in docs/04-modules or openapi.yaml (soft warning):"
    for id in "${unref[@]}"; do echo "  $id"; done
fi

[ "${#missing[@]}" -gt 0 ] && exit 1
exit 0
