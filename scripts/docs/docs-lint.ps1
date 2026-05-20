# docs:lint — front-matter + ID format validator for docs/.
# - Every .md must start with a YAML front-matter block (--- ... ---).
# - Required fields: title, status, last-reviewed, language. ids field must exist (may be []).
# - status ∈ {active, draft, deprecated, archived, wip}.
# - last-reviewed ISO date YYYY-MM-DD.
# - IDs in `ids:` and inline must match canonical patterns:
#     R-[A-Z]{3}-\d{3}    BR-[A-Z]{2,8}-\d{3}    STM-[A-Z]+-T\d{2}    API-[A-Z]+-\d{3}
#     ADR-\d{3}           GAP-\d{3}              NFR-[A-Z]+-\d{3}
# - IDs declared in `ids:` must be unique across all docs (no duplicates).
# Exits 0 if clean, 1 otherwise.

$ErrorActionPreference = 'Stop'
$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot '..\..\')).Path
$docsRoot = Join-Path $repoRoot 'docs'
if (-not (Test-Path $docsRoot)) { Write-Host "docs/ not found"; exit 0 }

# Lint scope: only the canonical 11-folder blueprint structure under docs/.
# Pre-restructure files (docs/agents/, docs/api/, docs/architecture/, docs/business/, etc.) are
# tracked separately as redirect stubs / archived material and not part of the blueprint contract.
$blueprintFolders = @(
    '00-overview','01-requirements','02-domain','03-architecture','04-modules',
    '05-api','06-security','07-operations','08-runbook','09-governance','10-evidence'
)

$violations = @()
$idIndex = @{}  # id -> first file declaring it

# Status values: blueprint docs use {active, draft, deprecated, archived, wip};
# ADR docs use {proposed, accepted, rejected, superseded}; NFR docs may use {planned}.
$validStatus = @('active','draft','deprecated','archived','wip','proposed','accepted','rejected','superseded','planned')
$idPatterns = @(
    '^R-[A-Z]{3}-\d{3}$',
    '^BR-[A-Z]{2,8}-\d{3}$',
    '^STM-[A-Z]+-T\d{2}$',
    '^API-[A-Z]+-\d{3}$',
    '^ADR-\d{3}$',
    '^GAP-\d{3}$',
    '^NFR-[A-Z]+-\d{3}$'
)

function Test-IdFormat($id) {
    foreach ($p in $idPatterns) { if ($id -match $p) { return $true } }
    return $false
}

$mdFiles = Get-ChildItem -Path $docsRoot -Recurse -Filter '*.md' | Where-Object {
    $rel = $_.FullName.Substring($docsRoot.Length).TrimStart('\','/')
    $top = ($rel -split '[\\/]')[0]
    ($blueprintFolders -contains $top) -and ($rel -notmatch '_archive')
}
foreach ($mdFile in $mdFiles) {
    $rel = $mdFile.FullName.Substring($repoRoot.Length).TrimStart('\','/')
    # Skip template skeletons — they intentionally carry placeholder front-matter.
    if ($mdFile.Name -eq '_TEMPLATE.md') { continue }
    # ADR docs follow MADR convention with `id` / `date` / `status` (no `language`/`ids`/`last-reviewed`).
    $isAdr = $rel -match '03-architecture[\\/]+adrs[\\/]+ADR-'
    $raw = Get-Content -Raw -Path $mdFile.FullName
    if (-not $raw.StartsWith('---')) {
        # Skip _archive/* and PR templates
        if ($rel -match '_archive') { continue }
        $violations += "$rel : missing front-matter (must start with ---)"
        continue
    }
    # Parse front-matter block (lines between first --- and second ---)
    $lines = $raw -split "`r?`n"
    $fmEnd = -1
    for ($i = 1; $i -lt $lines.Count; $i++) { if ($lines[$i].Trim() -eq '---') { $fmEnd = $i; break } }
    if ($fmEnd -lt 0) { $violations += "$rel : front-matter block not closed"; continue }
    $fmLines = $lines[1..($fmEnd-1)]

    $fields = @{}
    $idsList = @()
    $inIdsList = $false
    foreach ($ln in $fmLines) {
        if ($inIdsList) {
            if ($ln -match '^\s+-\s+(.+)$') { $idsList += $matches[1].Trim(); continue }
            else { $inIdsList = $false }
        }
        if ($ln -match '^([a-zA-Z_-]+):\s*(.*)$') {
            $key = $matches[1].Trim()
            $val = $matches[2].Trim()
            $fields[$key] = $val
            if ($key -eq 'ids') {
                if ($val -match '^\[(.*)\]$') {
                    $inner = $matches[1]
                    if ($inner.Trim() -ne '') {
                        $idsList += ($inner -split ',') | ForEach-Object { $_.Trim().Trim('"',"'") }
                    }
                } elseif ($val -eq '' -or $val -eq '|' -or $val -eq '>') {
                    $inIdsList = $true
                }
            }
        }
    }

    foreach ($req in @('title','status','last-reviewed','language')) {
        if ($isAdr -and ($req -eq 'last-reviewed' -or $req -eq 'language')) { continue }
        if (-not $fields.ContainsKey($req) -or [string]::IsNullOrWhiteSpace($fields[$req])) {
            $violations += "$rel : missing front-matter field '$req'"
        }
    }
    # ADRs use single `id:` field instead of `ids:` list.
    if ($isAdr) {
        if ($fields.ContainsKey('id') -and -not [string]::IsNullOrWhiteSpace($fields['id'])) {
            $idVal = $fields['id'].Trim().Trim('"',"'")
            if (-not [string]::IsNullOrWhiteSpace($idVal)) { $idsList += $idVal }
        }
    } else {
        if (-not $fields.ContainsKey('ids')) {
            $violations += "$rel : missing front-matter field 'ids' (use [] if none)"
        }
    }

    # ADR `date:` validates as ISO date analogous to last-reviewed.
    if ($isAdr -and $fields.ContainsKey('date')) {
        $d = $fields['date']
        if ($d -notmatch '^\d{4}-\d{2}-\d{2}$') { $violations += "$rel : date='$d' not ISO YYYY-MM-DD" }
    }

    if ($fields.ContainsKey('status')) {
        $st = $fields['status'].ToLower()
        if ($validStatus -notcontains $st) { $violations += "$rel : status='$st' not in $($validStatus -join ',')" }
    }
    if ($fields.ContainsKey('last-reviewed')) {
        $d = $fields['last-reviewed']
        if ($d -notmatch '^\d{4}-\d{2}-\d{2}$') { $violations += "$rel : last-reviewed='$d' not ISO YYYY-MM-DD" }
    }

    foreach ($id in $idsList) {
        if ([string]::IsNullOrWhiteSpace($id)) { continue }
        if (-not (Test-IdFormat $id)) { $violations += "$rel : id '$id' does not match canonical patterns" }
        if ($idIndex.ContainsKey($id)) { $violations += "$rel : duplicate id '$id' (also in $($idIndex[$id]))" }
        else { $idIndex[$id] = $rel }
    }
}

Write-Host "docs:lint  files=$($mdFiles.Count)  ids=$($idIndex.Count)  violations=$($violations.Count)"
if ($violations.Count -gt 0) {
    Write-Host ""
    Write-Host "Violations:"
    $violations | ForEach-Object { Write-Host "  $_" }
    exit 1
}
exit 0
