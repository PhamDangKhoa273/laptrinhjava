# Seed demo data for full Subscription + Payment flow.
# Usage: .\seed-demo.ps1

$ErrorActionPreference = 'Continue'
$base = 'http://localhost:8080/api/v1'
$enc  = [System.Text.Encoding]::UTF8
$gatewaySecret = 'change-me'  # matches APP_SUBSCRIPTION_GATEWAY_SECRET in docker-compose

function Send-Json {
    param($Url, $Method, $Body, $Headers = @{})
    $params = @{
        Uri         = $Url
        Method      = $Method
        Headers     = $Headers
        ContentType = 'application/json; charset=utf-8'
    }
    if ($Body) {
        $json  = ConvertTo-Json $Body -Depth 10 -Compress
        $bytes = $enc.GetBytes($json)
        $params['Body'] = $bytes
    }
    return Invoke-RestMethod @params
}

function Get-Auth($email, $password) {
    $resp = Send-Json "$base/auth/login" 'POST' @{ email=$email; password=$password }
    if ($resp.data.token) { return $resp.data.token }
    return $resp.data.accessToken
}

function Compute-HmacSha256Base64($secret, $payload) {
    $hmac = New-Object System.Security.Cryptography.HMACSHA256
    $hmac.Key = $enc.GetBytes($secret)
    $sigBytes = $hmac.ComputeHash($enc.GetBytes($payload))
    return [Convert]::ToBase64String($sigBytes)
}

# 1. Login
Write-Host '=== Login admin + farm ==='
$adminToken = Get-Auth 'admin@bicap.com' '123456'
$farmToken  = Get-Auth 'farm@bicap.com'  '123456'
$adminH = @{ Authorization = "Bearer $adminToken" }
$farmH  = @{ Authorization = "Bearer $farmToken"  }
Write-Host 'Admin and Farm logged in'

# 2. Create packages (idempotent)
Write-Host ''
Write-Host '=== Create service packages (admin) ==='
$packages = Get-Content 'backend/demo-packages.json' -Raw -Encoding UTF8 | ConvertFrom-Json
foreach ($pkg in $packages) {
    try {
        $r = Send-Json "$base/packages" 'POST' $pkg $adminH
        Write-Host ("Created {0,-12} -> ID {1} ({2:N0} VND/{3} days)" -f $pkg.packageCode, $r.data.packageId, $pkg.price, $pkg.durationDays)
    } catch {
        Write-Host ("Skip {0}: already exists" -f $pkg.packageCode)
    }
}

$pkgList = Send-Json "$base/packages" 'GET' $null $adminH
$basic = $pkgList.data | Where-Object { $_.packageCode -eq 'BASIC' } | Select-Object -First 1
if (-not $basic) { Write-Host 'No BASIC package found, abort'; exit 1 }
Write-Host ("Selected BASIC package ID = {0}, price = {1:N0} VND" -f $basic.packageId, $basic.price)

# 3. Ensure farm profile + APPROVED
Write-Host ''
Write-Host '=== Ensure farm profile (farm) ==='
$farm = $null
try { $farm = (Send-Json "$base/farms/me" 'GET' $null $farmH).data } catch { }
if (-not $farm -or -not $farm.farmId) {
    Write-Host 'No farm profile, registering...'
    $farmPayload = @{
        farmCode          = 'FARM-DEMO-001'
        farmName          = 'GreenField Farm Demo'
        farmType          = 'Cà phê'
        businessLicenseNo = 'BL-DEMO-2026-001'
        address           = '123 Lê Lợi, Bảo Lộc, Lâm Đồng'
        province          = 'Lâm Đồng'
        totalArea         = 5.5
        contactPerson     = 'Vu The Huong'
        description       = 'Nông trại cà phê hữu cơ phục vụ demo BICAP.'
    }
    $r = Send-Json "$base/farms" 'POST' $farmPayload $farmH
    $farm = $r.data
    Write-Host ("Farm registered -> ID {0}, status={1}" -f $farm.farmId, $farm.approvalStatus)
} else {
    Write-Host ("Farm exists -> ID {0}, status={1}" -f $farm.farmId, $farm.approvalStatus)
}

if ($farm.approvalStatus -ne 'APPROVED') {
    try {
        $r = Send-Json ("$base/farms/{0}/review" -f $farm.farmId) 'POST' @{ approvalStatus='APPROVED'; reviewComment='Demo seed approval' } $adminH
        $farm = $r.data
        Write-Host ("Farm approved -> {0}" -f $farm.approvalStatus)
    } catch {
        Write-Host ("Approve failed: {0}" -f $_.Exception.Message)
    }
}

# 4. Create or reuse subscription PENDING
Write-Host ''
Write-Host '=== Mua goi (farm) ==='
$mySubs = (Send-Json "$base/farm-subscriptions/me" 'GET' $null $farmH).data
$pending = $mySubs | Where-Object { $_.packageId -eq $basic.packageId -and $_.status -eq 'PENDING' } | Select-Object -First 1
if ($pending) {
    $sub = $pending
    Write-Host ("Reusing PENDING subscription -> ID {0}" -f $sub.subscriptionId)
} else {
    try {
        $sub = (Send-Json "$base/farm-subscriptions" 'POST' @{ farmId=$farm.farmId; packageId=$basic.packageId; autoRenew=$false } $farmH).data
        Write-Host ("Subscription created -> ID {0}, status={1}" -f $sub.subscriptionId, $sub.status)
    } catch {
        Write-Host ("Create subscription failed: {0}" -f $_.Exception.Message)
        exit 1
    }
}

# 5. Create payment intent (Thanh toán cho việc mua gói)
Write-Host ''
Write-Host '=== Tao payment intent (farm) ==='
$transactionRef = "DEMO-PAY-{0}-{1}" -f $sub.subscriptionId, ([DateTimeOffset]::Now.ToUnixTimeSeconds())
$paymentPayload = @{
    subscriptionId = $sub.subscriptionId
    amount         = $basic.price
    method         = 'BANK_TRANSFER'
    transactionRef = $transactionRef
}
try {
    $payment = (Send-Json "$base/subscription-payments" 'POST' $paymentPayload $farmH).data
    Write-Host ("Payment intent -> ID {0}, status={1}, amount={2}, txRef={3}" -f $payment.paymentId, $payment.status, $payment.amount, $payment.transactionRef)
} catch {
    Write-Host ("Create payment failed: {0}" -f $_.Exception.Message)
    Write-Host ($_.ErrorDetails.Message)
    exit 1
}

# 6. Simulate gateway callback to ACTIVATE the payment + subscription
Write-Host ''
Write-Host '=== Gateway callback (mo phong thanh toan thanh cong) ==='
$gatewayTxId = "GATEWAY-{0}" -f ([Guid]::NewGuid().ToString('N').Substring(0, 16))
$amountStr   = ([decimal]$basic.price).ToString([System.Globalization.CultureInfo]::InvariantCulture)
$currency    = 'VND'
$status      = 'PAID'
# Service-side payload format:
# subscriptionId|transactionRef|gatewayTransactionId|amount|currency|status
$payload = "{0}|{1}|{2}|{3}|{4}|{5}" -f $sub.subscriptionId, $transactionRef, $gatewayTxId, $amountStr, $currency, $status
$signature = Compute-HmacSha256Base64 $gatewaySecret $payload

$cbPayload = @{
    subscriptionId       = $sub.subscriptionId
    transactionRef       = $transactionRef
    gatewayTransactionId = $gatewayTxId
    currency             = $currency
    amount               = $basic.price
    status               = $status
    signature            = $signature
}
try {
    $callback = (Send-Json "$base/subscription-payments/gateway/callback" 'POST' $cbPayload $adminH).data
    Write-Host ("Gateway callback OK -> payment status = {0}" -f $callback.paymentStatus)
} catch {
    Write-Host ("Gateway callback failed: {0}" -f $_.Exception.Message)
    Write-Host ($_.ErrorDetails.Message)
}

# 7. Final state
Write-Host ''
Write-Host '=== Final state ==='
Write-Host '--- Farm subscriptions ---'
(Send-Json "$base/farm-subscriptions/me" 'GET' $null $farmH).data | ForEach-Object {
    Write-Host ("  #{0} package={1} status={2} ends={3}" -f $_.subscriptionId, $_.packageName, $_.status, $_.endDate)
}
Write-Host '--- Payments ---'
(Send-Json "$base/subscription-payments/me" 'GET' $null $farmH).data | ForEach-Object {
    Write-Host ("  payment#{0} sub={1} amount={2} status={3} txRef={4}" -f $_.paymentId, $_.subscriptionId, $_.amount, $_.paymentStatus, $_.transactionRef)
}

Write-Host ''
Write-Host 'Done. Login as farm@bicap.com / 123456 -> open /farm/subscription to see seeded data.'
