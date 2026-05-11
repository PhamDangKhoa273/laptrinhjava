$ErrorActionPreference = 'Stop'
$BaseUrl = $env:BICAP_API_BASE_URL
if ([string]::IsNullOrWhiteSpace($BaseUrl)) {
  $BaseUrl = 'http://localhost:8080/api/v1'
}

$Accounts = @(
  @{ Email = 'admin@bicap.com'; Role = 'ADMIN' },
  @{ Email = 'farm@bicap.com'; Role = 'FARM' },
  @{ Email = 'retailer@bicap.com'; Role = 'RETAILER' },
  @{ Email = 'manager@bicap.com'; Role = 'SHIPPING_MANAGER' },
  @{ Email = 'driver@bicap.com'; Role = 'DRIVER' },
  @{ Email = 'guest@bicap.com'; Role = 'GUEST' }
)

function Invoke-Json($Method, $Url, $Token = $null, $Body = $null) {
  $headers = @{}
  if ($Token) { $headers.Authorization = "Bearer $Token" }
  $params = @{
    Method = $Method
    Uri = $Url
    Headers = $headers
    ContentType = 'application/json'
  }
  if ($Body) { $params.Body = ($Body | ConvertTo-Json -Depth 8) }
  Invoke-RestMethod @params
}

$tokens = @{}
foreach ($account in $Accounts) {
  $login = Invoke-Json POST "$BaseUrl/auth/login" $null @{ email = $account.Email; password = '123456' }
  $token = $login.data.accessToken
  if (-not $token) { throw "No access token returned for $($account.Email)" }
  $me = Invoke-Json GET "$BaseUrl/auth/me" $token
  $primaryRole = $me.data.primaryRole
  if ($primaryRole -ne $account.Role) {
    throw "Role mismatch for $($account.Email): expected $($account.Role), got $primaryRole"
  }
  $tokens[$account.Role] = $token
  Write-Host "PASS login/me $($account.Email) => $primaryRole"
}

try {
  Invoke-Json GET "$BaseUrl/users" $tokens['RETAILER'] | Out-Null
  throw 'Retailer unexpectedly accessed admin user API'
} catch {
  if ($_.Exception.Response.StatusCode.value__ -notin @(401, 403)) { throw }
  Write-Host 'PASS retailer blocked from admin user API'
}

try {
  Invoke-Json GET "$BaseUrl/orders" $tokens['GUEST'] | Out-Null
  throw 'Guest unexpectedly accessed private orders API'
} catch {
  if ($_.Exception.Response.StatusCode.value__ -notin @(401, 403)) { throw }
  Write-Host 'PASS guest blocked from private orders API'
}

Invoke-Json GET "$BaseUrl/listings" | Out-Null
Write-Host 'PASS public listings available without token'

Invoke-Json GET "$BaseUrl/search" | Out-Null
Write-Host 'PASS public search available without token'

Write-Host 'BICAP smoke checks completed successfully.'
