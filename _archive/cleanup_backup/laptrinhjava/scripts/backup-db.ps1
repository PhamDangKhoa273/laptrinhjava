param(
  [string]$DbHost = 'localhost',
  [string]$DbUser = 'root',
  [string]$DbPassword = $env:MYSQL_ROOT_PASSWORD,
  [string]$DbName = 'bicap_db',
  [string]$OutDir = 'backups'
)

New-Item -ItemType Directory -Force -Path $OutDir | Out-Null
$stamp = Get-Date -Format 'yyyy-MM-dd_HHmmss'
$outFile = Join-Path $OutDir "${DbName}_${stamp}.sql"

$env:MYSQL_PWD = $DbPassword
mysqldump -h $DbHost -u $DbUser --single-transaction --routines --triggers $DbName | Out-File -Encoding utf8 $outFile
Remove-Item Env:MYSQL_PWD -ErrorAction SilentlyContinue
Write-Host "DB backup written to $outFile"
