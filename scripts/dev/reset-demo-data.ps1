param(
    [string]$EnvFile = ".env.local",
    [string]$ContainerName = "bicap-mysql",
    [string]$SqlFile = "scripts/dev/reset-demo-data.sql"
)

$ErrorActionPreference = "Stop"

function Read-EnvValue {
    param(
        [string]$Path,
        [string]$Name,
        [string]$DefaultValue = ""
    )

    if (-not (Test-Path $Path)) {
        return $DefaultValue
    }

    $line = Get-Content $Path | Where-Object { $_ -match "^$Name=" } | Select-Object -First 1
    if (-not $line) {
        return $DefaultValue
    }

    return ($line -replace "^$Name=", "").Trim()
}

$mysqlPassword = Read-EnvValue -Path $EnvFile -Name "MYSQL_ROOT_PASSWORD"
$database = Read-EnvValue -Path $EnvFile -Name "MYSQL_DATABASE" -DefaultValue "bicap_db"

if ([string]::IsNullOrWhiteSpace($mysqlPassword)) {
    throw "MYSQL_ROOT_PASSWORD was not found in $EnvFile."
}

if (-not (Test-Path $SqlFile)) {
    throw "SQL file not found: $SqlFile"
}

Write-Host "Resetting BICAP local demo data in database '$database' on container '$ContainerName'..." -ForegroundColor Yellow
Write-Host "This is a local/dev destructive reset. Demo accounts use password: 123456" -ForegroundColor Yellow

$containerSqlFile = "/tmp/bicap-reset-demo-data.sql"

docker cp $SqlFile "${ContainerName}:$containerSqlFile"
docker exec $ContainerName sh -c "mysql --default-character-set=utf8mb4 -uroot '-p$mysqlPassword' '$database' < '$containerSqlFile'"
docker exec $ContainerName rm -f $containerSqlFile

Write-Host "BICAP demo data reset completed." -ForegroundColor Green
Write-Host "Demo login examples:" -ForegroundColor Cyan
Write-Host "  admin01@bicap.demo / 123456"
Write-Host "  farm01@bicap.demo / 123456"
Write-Host "  retailer01@bicap.demo / 123456"
Write-Host "  shipper01@bicap.demo / 123456"
Write-Host "  driver01@bicap.demo / 123456"
Write-Host "  guest01@bicap.demo / 123456"
