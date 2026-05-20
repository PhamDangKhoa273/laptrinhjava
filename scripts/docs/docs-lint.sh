#!/usr/bin/env bash
# docs:lint — front-matter + ID format validator. Bash port of docs-lint.ps1.
set -u

repo_root="$(cd "$(dirname "$0")/../.." && pwd)"
docs_root="$repo_root/docs"
[ -d "$docs_root" ] || { echo "docs/ not found"; exit 0; }

# Lint scope: only canonical 11-folder blueprint structure.
blueprint_re='^(00-overview|01-requirements|02-domain|03-architecture|04-modules|05-api|06-security|07-operations|08-runbook|09-governance|10-evidence)/'

violations=()
declare -A id_index
file_count=0
id_count=0

# Status values cover blueprint + ADR + NFR conventions.
valid_status_re='^(active|draft|deprecated|archived|wip|proposed|accepted|rejected|superseded|planned)$'
id_patterns=(
    '^R-[A-Z]{3}-[0-9]{3}$'
    '^BR-[A-Z]{2,8}-[0-9]{3}$'
    '^STM-[A-Z]+-T[0-9]{2}$'
    '^API-[A-Z]+-[0-9]{3}$'
    '^ADR-[0-9]{3}$'
    '^GAP-[0-9]{3}$'
    '^NFR-[A-Z]+-[0-9]{3}$'
)

is_valid_id() {
    local id="$1"
    for p in "${id_patterns[@]}"; do
        if [[ "$id" =~ $p ]]; then return 0; fi
    done
    return 1
}

while IFS= read -r -d '' md_file; do
    rel="${md_file#$repo_root/}"
    rel_in_docs="${rel#docs/}"
    # Restrict to blueprint folders.
    [[ "$rel_in_docs" =~ $blueprint_re ]] || continue
    case "$rel_in_docs" in *_archive*) continue ;; esac
    # Skip template skeletons.
    case "$(basename "$md_file")" in _TEMPLATE.md) continue ;; esac
    # ADRs follow MADR convention.
    is_adr=0
    [[ "$rel_in_docs" =~ ^03-architecture/adrs/ADR- ]] && is_adr=1

    file_count=$((file_count + 1))
    first_line="$(head -n 1 "$md_file")"
    if [ "$first_line" != "---" ]; then
        case "$rel" in *_archive*) continue ;; esac
        violations+=("$rel : missing front-matter (must start with ---)")
        continue
    fi

    # Extract front-matter block (lines between first --- and second ---).
    fm="$(awk 'NR==1 && $0=="---"{infm=1; next} infm && $0=="---"{exit} infm{print}' "$md_file")"
    if [ -z "$fm" ]; then
        violations+=("$rel : front-matter block not closed")
        continue
    fi

    declare -A fields=()
    fields=()  # reset per file
    declare -a ids_list=()
    in_ids_list=0

    while IFS= read -r line; do
        if [ "$in_ids_list" = "1" ]; then
            if [[ "$line" =~ ^[[:space:]]+-[[:space:]]+(.+)$ ]]; then
                ids_list+=("$(echo "${BASH_REMATCH[1]}" | sed 's/^[[:space:]]*//;s/[[:space:]]*$//')")
                continue
            else
                in_ids_list=0
            fi
        fi
        if [[ "$line" =~ ^([a-zA-Z_-]+):[[:space:]]*(.*)$ ]]; then
            key="${BASH_REMATCH[1]}"
            val="${BASH_REMATCH[2]}"
            fields["$key"]="$val"
            if [ "$key" = "ids" ]; then
                if [[ "$val" =~ ^\[(.*)\]$ ]]; then
                    inner="${BASH_REMATCH[1]}"
                    if [ -n "${inner// /}" ]; then
                        IFS=',' read -ra parts <<< "$inner"
                        for p in "${parts[@]}"; do
                            ids_list+=("$(echo "$p" | sed 's/^[[:space:]"'\'']*//;s/[[:space:]"'\'']*$//')")
                        done
                    fi
                elif [ -z "$val" ] || [ "$val" = "|" ] || [ "$val" = ">" ]; then
                    in_ids_list=1
                fi
            fi
        fi
    done <<< "$fm"

    for req in title status last-reviewed language; do
        if [ "$is_adr" = "1" ] && { [ "$req" = "last-reviewed" ] || [ "$req" = "language" ]; }; then continue; fi
        if [ -z "${fields[$req]+x}" ] || [ -z "${fields[$req]// /}" ]; then
            violations+=("$rel : missing front-matter field '$req'")
        fi
    done
    if [ "$is_adr" = "1" ]; then
        if [ -n "${fields[id]:-}" ]; then
            id_val="$(echo "${fields[id]}" | sed 's/^[[:space:]"'\'']*//;s/[[:space:]"'\'']*$//')"
            [ -n "$id_val" ] && ids_list+=("$id_val")
        fi
    else
        if [ -z "${fields[ids]+x}" ]; then
            violations+=("$rel : missing front-matter field 'ids' (use [] if none)")
        fi
    fi
    if [ "$is_adr" = "1" ] && [ -n "${fields[date]:-}" ]; then
        d="${fields[date]}"
        if ! [[ "$d" =~ ^[0-9]{4}-[0-9]{2}-[0-9]{2}$ ]]; then
            violations+=("$rel : date='$d' not ISO YYYY-MM-DD")
        fi
    fi

    if [ -n "${fields[status]:-}" ]; then
        st="$(echo "${fields[status]}" | tr 'A-Z' 'a-z')"
        if ! [[ "$st" =~ $valid_status_re ]]; then
            violations+=("$rel : status='$st' not in active|draft|deprecated|archived|wip")
        fi
    fi
    if [ -n "${fields[last-reviewed]:-}" ]; then
        d="${fields[last-reviewed]}"
        if ! [[ "$d" =~ ^[0-9]{4}-[0-9]{2}-[0-9]{2}$ ]]; then
            violations+=("$rel : last-reviewed='$d' not ISO YYYY-MM-DD")
        fi
    fi

    for id in "${ids_list[@]}"; do
        [ -z "${id// /}" ] && continue
        if ! is_valid_id "$id"; then
            violations+=("$rel : id '$id' does not match canonical patterns")
        fi
        if [ -n "${id_index[$id]+x}" ]; then
            violations+=("$rel : duplicate id '$id' (also in ${id_index[$id]})")
        else
            id_index["$id"]="$rel"
            id_count=$((id_count + 1))
        fi
    done
done < <(find "$docs_root" -type f -name '*.md' -print0)

echo "docs:lint  files=$file_count  ids=$id_count  violations=${#violations[@]}"
if [ "${#violations[@]}" -gt 0 ]; then
    echo
    echo "Violations:"
    for v in "${violations[@]}"; do echo "  $v"; done
    exit 1
fi
exit 0
