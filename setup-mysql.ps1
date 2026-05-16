param(
    [string]$RootPassword = "1234"
)

$ErrorActionPreference = "Stop"
$mysqlBase = "C:\Program Files\MySQL\MySQL Server 8.4"
$programData = "C:\ProgramData\MySQL\MySQL Server 8.4"
$dataDir = Join-Path $programData "Data"
$iniPath = Join-Path $programData "my.ini"

Write-Output "1/6 Creating data dir: $programData"
New-Item -ItemType Directory -Path $programData -Force | Out-Null
New-Item -ItemType Directory -Path $dataDir -Force | Out-Null

Write-Output "2/6 Writing my.ini"
@"
[mysqld]
port=3306
basedir="$($mysqlBase -replace '\\','/')"
datadir="$($dataDir -replace '\\','/')"
default-storage-engine=INNODB
character-set-server=utf8mb4
collation-server=utf8mb4_unicode_ci
bind-address=127.0.0.1

[client]
port=3306
default-character-set=utf8mb4
"@ | Set-Content -Path $iniPath -Encoding ASCII

$mysqld = Join-Path $mysqlBase "bin\mysqld.exe"

Write-Output "3/6 Initialize data dir with insecure root (will set password after)"
$initArgs = @("--defaults-file=$iniPath", "--initialize-insecure", "--console")
$needInit = $true
if (Test-Path (Join-Path $dataDir "mysql")) {
    Write-Output "   -> data dir already initialized, skipping"
    $needInit = $false
}
if ($needInit) {
    & $mysqld @initArgs
}

Write-Output "4/6 Install Windows service MySQL84"
$svc = Get-Service -Name MySQL84 -ErrorAction SilentlyContinue
if ($svc) {
    Write-Output "   -> service MySQL84 already exists"
} else {
    & $mysqld "--install" "MySQL84" "--defaults-file=$iniPath"
}

Write-Output "5/6 Start service"
Start-Service -Name MySQL84
Get-Service -Name MySQL84

Write-Output "6/6 Set root password + create DB"
Start-Sleep -Seconds 5
$mysqlCli = Join-Path $mysqlBase "bin\mysql.exe"
$sql = "ALTER USER 'root'@'localhost' IDENTIFIED BY '$RootPassword'; FLUSH PRIVILEGES; CREATE DATABASE IF NOT EXISTS bicap_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
& $mysqlCli "-uroot" "--skip-password" "-e" $sql
Write-Output "DONE. MySQL running on 3306, root password = $RootPassword, db = bicap_db"
