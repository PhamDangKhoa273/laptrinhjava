# docs:check — Markdown link checker.
# Walks docs/ and verifies every relative link [text](path) and #[[file:path]] resolves.
# Exits 0 when all links resolve, 1 otherwise.

$ErrorActionPreference = 'Stop'
$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot '..\..\')).Path
$docsRoot = Join-Path $repoRoot 'docs'
if (-not (Test-Path $docsRoot)) { Write-Host "docs/ not found"; exit 0 }

$broken = @()
$totalLinks = 0
$mdFiles = Get-ChildItem -Path $docsRoot -Recurse -Filter '*.md'

# Match standard markdown link [text](target) and steering reference #[[file:target]]
$linkRegex = '\[([^\]]*)\]\(([^)\s]+)\)'
$fileRefRegex = '#\[\[file:([^\]]+)\]\]'

foreach ($mdFile in $mdFiles) {
    $content = Get-Content -Raw -Path $mdFile.FullName
    $fileDir = Split-Path -Parent $mdFile.FullName

    # Strip fenced code blocks (```...```) and inline code spans (`...`) before extracting links —
    # otherwise documentation that demos link syntax (e.g. `[text](path)`) creates false positives.
    $stripped = [regex]::Replace($content, '(?s)```.*?```', '')
    $stripped = [regex]::Replace($stripped, '`[^`\r\n]*`', '')

    $allMatches = @()
    $allMatches += [regex]::Matches($stripped, $linkRegex) | ForEach-Object { @{ raw = $_.Groups[2].Value; line = 0 } }
    $allMatches += [regex]::Matches($stripped, $fileRefRegex) | ForEach-Object { @{ raw = $_.Groups[1].Value; line = 0 } }

    foreach ($m in $allMatches) {
        $target = $m.raw.Trim()
        # Skip absolute URLs and mailto/anchors
        if ($target -match '^(https?:|mailto:|tel:|#)') { continue }
        # Skip placeholder/template syntax (e.g. <canonical-path>, ${var}, {placeholder})
        if ($target -match '[<>{}$|`*]' -or $target -match '\?\?') { continue }
        # Strip query/fragment
        $cleanTarget = ($target -split '#')[0]
        $cleanTarget = ($cleanTarget -split '\?')[0]
        if ([string]::IsNullOrWhiteSpace($cleanTarget)) { continue }
        # Skip anything with illegal Windows path chars
        if ($cleanTarget -match '[<>"|*?]') { continue }
        $totalLinks++

        if ($cleanTarget.StartsWith('/')) {
            $abs = Join-Path $repoRoot ($cleanTarget.TrimStart('/'))
        } else {
            $abs = Join-Path $fileDir $cleanTarget
        }
        try { $abs = [System.IO.Path]::GetFullPath($abs) } catch { continue }

        if (-not (Test-Path -LiteralPath $abs)) {
            $relPath = $mdFile.FullName.Substring($repoRoot.Length).TrimStart('\','/')
            $broken += "$relPath -> $target"
        }
    }
}

Write-Host "docs:check  files=$($mdFiles.Count)  links=$totalLinks  broken=$($broken.Count)"
if ($broken.Count -gt 0) {
    Write-Host ""
    Write-Host "Broken links:"
    $broken | Sort-Object -Unique | ForEach-Object { Write-Host "  $_" }
    exit 1
}
exit 0
