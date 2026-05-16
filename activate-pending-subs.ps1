# Activate all PENDING subscription payments via gateway callback simulation.
# Run this AFTER you click "Mua gói" + create payment in UI.
$ErrorActionPreference = 'Continue'
$base = 'http://localhost:8080/api/v1'
$enc  = [System.Text.Encoding]::UTF8
$gatewaySecret = 'change-me'

function Send-Json {
    param($Url, $Method, $Body, $Headers = @{})
    $params = @{ Uri = $Url; Method = $Method; Headers = $Headers; ContentType = 'application/json; charset=utf-8' }
    if ($Body) { $params['Body'] = $enc.GetBytes((ConvertTo-Json $Body -Depth 10 -Compress)) }
    return Invoke-RestMethod @params
}

function Get-Auth($email, $password) {
    $resp = Send-Json "$base/auth/login" 'POST' @{ email=$email; password=$password }
    if ($resp.data.token) { return $resp.data.token }; return $resp.data.accessToken
}

function Compute-HmacSha256Base64($secret, $payload) {
    $hmac = New-Object System.Security.Cryptography.HMACSHA256
    $hmac.Key = $enc.GetBytes($secret)
    $sig = $hmac.ComputeHash($enc.GetBytes($payload))
    return [Convert]::ToBase64String($sig)
}

# Login admin (callback endpoint requires authenticated)
$adminToken = Get-Auth 'admin@bicap.com' '123456'
$adminH = @{ Authorization = "Bearer $adminToken" }

# Login as the farm user we want to activate (default huong)
$farmEmail = if ($args[0]) { $args[0] } else { 'huong@gmail.com' }
$farmPwd   = if ($args[1]) { $args[1] } else { 'Thehuong2006' }
$farmToken = Get-Auth $farmEmail $farmPwd
$farmH = @{ Authorization = "Bearer $farmToken" }

# Fetch payments
$payments = (Send-Json "$base/subscription-payments/me" 'GET' $null $farmH).data
$pending = $payments | Where-Object { $_.paymentStatus -eq 'PENDING' -or -not $_.paymentStatus }
if (-not $pending) {
    Write-Host 'No PENDING payments. Tao payment trong UI truoc (Subscription page).'
    exit 0
}

foreach ($p in $pending) {
    $gatewayTxId = "GATEWAY-{0}" -f ([Guid]::NewGuid().ToString('N').Substring(0, 16))
    $amountStr   = ([decimal]$p.amount).ToString([System.Globalization.CultureInfo]::InvariantCulture)
    $currency    = 'VND'
    $status      = 'PAID'
    $payload = "{0}|{1}|{2}|{3}|{4}|{5}" -f $p.subscriptionId, $p.transactionRef, $gatewayTxId, $amountStr, $currency, $status
    $signature = Compute-HmacSha256Base64 $gatewaySecret $payload

    $cb = @{
        subscriptionId       = $p.subscriptionId
        transactionRef       = $p.transactionRef
        gatewayTransactionId = $gatewayTxId
        currency             = $currency
        amount               = $p.amount
        status               = $status
        signature            = $signature
    }
    try {
        $r = Send-Json "$base/subscription-payments/gateway/callback" 'POST' $cb $adminH
        Write-Host ("Activated payment #{0} sub#{1} -> {2}" -f $p.paymentId, $p.subscriptionId, $r.data.paymentStatus)
    } catch {
        Write-Host ("Failed payment #{0}: {1}" -f $p.paymentId, $_.Exception.Message)
        Write-Host ($_.ErrorDetails.Message)
    }
}

# Show final state
Write-Host ''
Write-Host 'Final subscriptions:'
(Send-Json "$base/farm-subscriptions/me" 'GET' $null $farmH).data | ForEach-Object {
    Write-Host ("  #{0} {1} status={2} ends={3}" -f $_.subscriptionId, $_.packageCode, $_.subscriptionStatus, $_.endDate)
}
