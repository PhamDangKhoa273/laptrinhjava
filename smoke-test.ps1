param(
    [string]$BaseUrl = "http://localhost:8080"
)

$ErrorActionPreference = "Continue"
$results = @()

function Login([string]$email, [string]$pwd) {
    $body = "{""email"":""$email"",""password"":""$pwd""}"
    try {
        $r = Invoke-RestMethod -Uri "$BaseUrl/api/v1/auth/login" -Method Post -ContentType 'application/json' -Body $body
        return @{ success = $true; token = $r.data.accessToken; role = ($r.data.user.roles -join ',') }
    } catch {
        return @{ success = $false; err = $_.Exception.Message }
    }
}

function Test-Endpoint([string]$label, [string]$url, $headers, [string]$method = "GET", [string]$body = $null) {
    try {
        if ($body) {
            $resp = Invoke-WebRequest -Uri $url -Headers $headers -Method $method -Body $body -ContentType 'application/json' -UseBasicParsing -ErrorAction Stop
        } else {
            $resp = Invoke-WebRequest -Uri $url -Headers $headers -Method $method -UseBasicParsing -ErrorAction Stop
        }
        return @{ ok = $true; status = $resp.StatusCode; label = $label }
    } catch {
        $s = $_.Exception.Response.StatusCode.value__
        return @{ ok = $false; status = $s; label = $label; err = $_.Exception.Message }
    }
}

$accounts = @(
    @{ role = 'ADMIN'; email = 'admin@bicap.com' },
    @{ role = 'FARM'; email = 'farm@bicap.com' },
    @{ role = 'RETAILER'; email = 'retailer@bicap.com' },
    @{ role = 'SHIPPING_MANAGER'; email = 'manager@bicap.com' },
    @{ role = 'DRIVER'; email = 'driver@bicap.com' },
    @{ role = 'GUEST'; email = 'guest@bicap.com' }
)

Write-Output "===== 1) Test Login cho tất cả role ====="
$tokens = @{}
foreach ($acc in $accounts) {
    $r = Login $acc.email "123456"
    if ($r.success) {
        Write-Output ("  OK {0,-20} roles=[{1}]" -f $acc.email, $r.role)
        $tokens[$acc.role] = $r.token
    } else {
        Write-Output ("  FAIL {0,-20} err={1}" -f $acc.email, $r.err)
    }
}

Write-Output ""
Write-Output "===== 2) Public endpoints (không token) ====="
$publicEndpoints = @(
    '/api/v1/announcements/feed',
    '/api/v1/listings',
    '/api/v1/listings/search?keyword=',
    '/api/v1/search',
    '/api/v1/content',
    '/api/v1/products',
    '/api/v1/categories',
    '/api/v1/batches'
)
foreach ($e in $publicEndpoints) {
    $r = Test-Endpoint "PUBLIC $e" "$BaseUrl$e" @{}
    if ($r.ok) { Write-Output ("  OK  [{0}] {1}" -f $r.status, $r.label) }
    else { Write-Output ("  ERR [{0}] {1}" -f $r.status, $r.label) }
}

Write-Output ""
Write-Output "===== 3) ADMIN endpoints ====="
if ($tokens.ADMIN) {
    $h = @{ Authorization = "Bearer $($tokens.ADMIN)" }
    $adminEps = @(
        '/api/v1/farms',
        '/api/v1/users',
        '/api/v1/users?role=FARM',
        '/api/v1/retailers',
        '/api/v1/drivers',
        '/api/v1/vehicles',
        '/api/v1/shipments',
        '/api/v1/orders',
        '/api/v1/packages',
        '/api/v1/seasons',
        '/api/v1/reports/admin',
        '/api/v1/listings/registrations/pending',
        '/api/v1/blockchain/governance/config',
        '/api/v1/blockchain/governance/transactions',
        '/api/v1/admin/governance',
        '/api/v1/permissions',
        '/api/v1/permissions/role-matrix',
        '/api/v1/content/admin/all',
        '/api/v1/announcements/admin',
        '/api/v1/auth/me'
    )
    foreach ($e in $adminEps) {
        $r = Test-Endpoint "ADMIN $e" "$BaseUrl$e" $h
        if ($r.ok) { Write-Output ("  OK  [{0}] {1}" -f $r.status, $r.label) }
        else { Write-Output ("  ERR [{0}] {1}" -f $r.status, $r.label) }
    }
}

Write-Output ""
Write-Output "===== 4) FARM endpoints ====="
if ($tokens.FARM) {
    $h = @{ Authorization = "Bearer $($tokens.FARM)" }
    $farmEps = @(
        '/api/v1/farms/me',
        '/api/v1/seasons',
        '/api/v1/listings/my',
        '/api/v1/listings/registrations/my',
        '/api/v1/shipments/farm',
        '/api/v1/iot/alerts/me',
        '/api/v1/farm-subscriptions/me',
        '/api/v1/subscription-payments/me',
        '/api/v1/orders',
        '/api/v1/notifications/me',
        '/api/v1/reports/me',
        '/api/v1/contracts/farm/1',
        '/api/v1/contracts/farm/1/active'
    )
    foreach ($e in $farmEps) {
        $r = Test-Endpoint "FARM $e" "$BaseUrl$e" $h
        if ($r.ok) { Write-Output ("  OK  [{0}] {1}" -f $r.status, $r.label) }
        else { Write-Output ("  ERR [{0}] {1}" -f $r.status, $r.label) }
    }
}

Write-Output ""
Write-Output "===== 5) RETAILER endpoints ====="
if ($tokens.RETAILER) {
    $h = @{ Authorization = "Bearer $($tokens.RETAILER)" }
    $retEps = @(
        '/api/v1/orders',
        '/api/v1/shipments/retailer',
        '/api/v1/notifications/me',
        '/api/v1/reports/me',
        '/api/v1/contracts/retailer/1',
        '/api/v1/listings'
    )
    foreach ($e in $retEps) {
        $r = Test-Endpoint "RETAILER $e" "$BaseUrl$e" $h
        if ($r.ok) { Write-Output ("  OK  [{0}] {1}" -f $r.status, $r.label) }
        else { Write-Output ("  ERR [{0}] {1}" -f $r.status, $r.label) }
    }
}

Write-Output ""
Write-Output "===== 6) SHIPPING_MANAGER endpoints ====="
if ($tokens.SHIPPING_MANAGER) {
    $h = @{ Authorization = "Bearer $($tokens.SHIPPING_MANAGER)" }
    $smEps = @(
        '/api/v1/shipments',
        '/api/v1/shipments/eligible-orders',
        '/api/v1/shipments/reports',
        '/api/v1/drivers',
        '/api/v1/vehicles',
        '/api/v1/orders',
        '/api/v1/users?role=DRIVER'
    )
    foreach ($e in $smEps) {
        $r = Test-Endpoint "SM $e" "$BaseUrl$e" $h
        if ($r.ok) { Write-Output ("  OK  [{0}] {1}" -f $r.status, $r.label) }
        else { Write-Output ("  ERR [{0}] {1}" -f $r.status, $r.label) }
    }
}

Write-Output ""
Write-Output "===== 7) DRIVER endpoints ====="
if ($tokens.DRIVER) {
    $h = @{ Authorization = "Bearer $($tokens.DRIVER)" }
    $drEps = @(
        '/api/v1/shipments/mine',
        '/api/v1/notifications/me',
        '/api/v1/auth/me'
    )
    foreach ($e in $drEps) {
        $r = Test-Endpoint "DRIVER $e" "$BaseUrl$e" $h
        if ($r.ok) { Write-Output ("  OK  [{0}] {1}" -f $r.status, $r.label) }
        else { Write-Output ("  ERR [{0}] {1}" -f $r.status, $r.label) }
    }
}

Write-Output ""
Write-Output "===== 8) Refresh + change-password + logout flows (ADMIN) ====="
if ($tokens.ADMIN) {
    $h = @{ Authorization = "Bearer $($tokens.ADMIN)" }
    $r = Test-Endpoint "POST /auth/logout" "$BaseUrl/api/v1/auth/logout" $h "POST"
    if ($r.ok) { Write-Output ("  OK  [{0}] {1}" -f $r.status, $r.label) } else { Write-Output ("  ERR [{0}] {1}" -f $r.status, $r.label) }
}

Write-Output ""
Write-Output "===== DONE ====="
