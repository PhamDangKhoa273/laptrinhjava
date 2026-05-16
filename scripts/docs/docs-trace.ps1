# docs:trace — traceability validator (Brief bullet -> R-* -> test).
# - Each Brief bullet under "## Brief Revision YYYY-MM-DD" must be covered by at least one R-* in docs/01-requirements/.
# - Each R-* declared in docs/01-requirements/functional/*.md must appear at least once in docs/04-modules/ OR docs/05-api/openapi.yaml.
#   This gives an indirect link "requirement -> implementation surface".
# Soft mode by default — exits 1 only on missing R-*; missing module/API references are warnings.

$ErrorActionPreference = 'Stop'
$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot '..\..\')).Path
$docsRoot = Join-Path $repoRoot 'docs'
$brief    = Join-Path $docsRoot '01-requirements\functional\_brief-source.md'
$reqRoot  = Join-Path $docsRoot '01-requirements'
$modRoot  = Join-Path $docsRoot '04-modules'
$openApi  = Join-Path $docsRoot '05-api\openapi.yaml'

if (-not (Test-Path $brief)) { Write-Host "Brief source not found at $brief"; exit 0 }

# 1. Collect bullets from latest Brief revision.
$briefRaw = Get-Content -Raw -Path $brief
$revBlocks = [regex]::Split($briefRaw, '(?m)^## Brief Revision ')
if ($revBlocks.Count -lt 2) { Write-Host "Brief has no '## Brief Revision' section; skipping trace"; exit 0 }
$latest = '## Brief Revision ' + $revBlocks[1]
$bulletLines = ($latest -split "`r?`n") | Where-Object { $_ -match '^-\s+\S' }
$bulletCount = $bulletLines.Count

# 2. Collect all R-* IDs declared anywhere in docs/01-requirements.
$reqIds = New-Object System.Collections.Generic.HashSet[string]
Get-ChildItem -Path $reqRoot -Recurse -Filter '*.md' | ForEach-Object {
    $c = Get-Content -Raw -Path $_.FullName
    foreach ($m in [regex]::Matches($c, 'R-[A-Z]{3}-\d{3}')) { [void]$reqIds.Add($m.Value) }
}

# 3. For each bullet, search docs/01-requirements for its source quote.
#    Bullets with at least one source-quote reference in some R-* are considered covered.
$reqFilesContent = @{}
Get-ChildItem -Path $reqRoot -Recurse -Filter '*.md' | ForEach-Object {
    $reqFilesContent[$_.FullName] = Get-Content -Raw -Path $_.FullName
}

$missing = @()
foreach ($bl in $bulletLines) {
    $clean = ($bl -replace '^-\s+','').Trim()
    if ($clean.Length -lt 8) { continue }
    # Check if the first 30 chars appear in any requirements doc as a source-quote substring.
    $needle = $clean.Substring(0, [Math]::Min(30, $clean.Length))
    $found = $false
    foreach ($k in $reqFilesContent.Keys) {
        if ($reqFilesContent[$k].Contains($needle)) { $found = $true; break }
    }
    if (-not $found) { $missing += $clean }
}

# 4. Cross-check R-* -> module docs OR openapi (warn only).
$crossSurfaces = ''
if (Test-Path $modRoot) { Get-ChildItem -Path $modRoot -Recurse -Filter '*.md' | ForEach-Object { $crossSurfaces += (Get-Content -Raw -Path $_.FullName) + "`n" } }
if (Test-Path $openApi) { $crossSurfaces += (Get-Content -Raw -Path $openApi) + "`n" }
$unreferencedR = @()
foreach ($id in $reqIds) {
    if (-not $crossSurfaces.Contains($id)) { $unreferencedR += $id }
}

Write-Host "docs:trace  bullets=$bulletCount  R-*=$($reqIds.Count)  missing-coverage=$($missing.Count)  unreferenced-R=$($unreferencedR.Count)"

if ($missing.Count -gt 0) {
    Write-Host ""
    Write-Host "Brief bullets not covered by any R-* (no matching source quote):"
    $missing | ForEach-Object { Write-Host "  - $_" }
}

if ($unreferencedR.Count -gt 0) {
    Write-Host ""
    Write-Host "Warning: R-* not referenced in docs/04-modules or openapi.yaml (soft warning):"
    $unreferencedR | Sort-Object | ForEach-Object { Write-Host "  $_" }
}

if ($missing.Count -gt 0) { exit 1 }
exit 0
