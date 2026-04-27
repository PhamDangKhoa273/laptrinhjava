param(
  [string]$UploadDir = 'uploads',
  [string]$OutDir = 'backups'
)

New-Item -ItemType Directory -Force -Path $OutDir | Out-Null
$stamp = Get-Date -Format 'yyyy-MM-dd_HHmmss'
$outFile = Join-Path $OutDir "uploads_${stamp}.zip"
Compress-Archive -Path (Join-Path $UploadDir '*') -DestinationPath $outFile -Force
Write-Host "Upload backup written to $outFile"
