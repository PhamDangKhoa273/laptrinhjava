# Seed approve farm for huong@gmail.com (Vu The Huong).
# Uses curl + UTF-8 file body to avoid PowerShell encoding bugs.
$ErrorActionPreference = 'Continue'
$base = 'http://localhost:8080/api/v1'
$enc  = [System.Text.Encoding]::UTF8

function Write-Utf8File($path, $content) {
    [System.IO.File]::WriteAllBytes($path, $enc.GetBytes($content))
}

function Get-Auth($email, $password) {
    $body = '{"email":"' + $email + '","password":"' + $password + '"}'
    Write-Utf8File "$PWD\.tmp-auth.json" $body
    $resp = curl.exe -s -X POST "$base/auth/login" -H 'Content-Type: application/json; charset=utf-8' --data-binary "@.tmp-auth.json" | ConvertFrom-Json
    Remove-Item "$PWD\.tmp-auth.json" -ErrorAction SilentlyContinue
    if ($resp.data.token) { return $resp.data.token } else { return $resp.data.accessToken }
}

# Login
$adminToken = Get-Auth 'admin@bicap.com' '123456'
$huongToken = Get-Auth 'huong@gmail.com' 'Thehuong2006'

# Register farm if absent
$existing = curl.exe -s -X GET "$base/farms/me" -H "Authorization: Bearer $huongToken" | ConvertFrom-Json
if ($existing.success -and $existing.data.farmId) {
    $farm = $existing.data
    Write-Host ("Farm exists -> ID {0}, name='{1}', status={2}" -f $farm.farmId, $farm.farmName, $farm.approvalStatus)
} else {
    $payload = '{"farmCode":"FARM-HUONG-001","farmName":"Trang trại Hương Lâm","farmType":"Cà phê + Tiêu","businessLicenseNo":"BL-HUONG-2026-001","address":"45 Hùng Vương, Bảo Lộc, Lâm Đồng","province":"Lâm Đồng","totalArea":8.2,"contactPerson":"Vu The Huong","description":"Trang trại của Vu The Huong - cà phê hữu cơ và tiêu sạch."}'
    Write-Utf8File "$PWD\.tmp-farm.json" $payload
    $r = curl.exe -s -X POST "$base/farms" -H "Authorization: Bearer $huongToken" -H 'Content-Type: application/json; charset=utf-8' --data-binary "@.tmp-farm.json" | ConvertFrom-Json
    Remove-Item "$PWD\.tmp-farm.json" -ErrorAction SilentlyContinue
    $farm = $r.data
    Write-Host ("Farm registered -> ID {0}, name='{1}', status={2}" -f $farm.farmId, $farm.farmName, $farm.approvalStatus)
}

# Approve
if ($farm.approvalStatus -ne 'APPROVED') {
    $approve = '{"approvalStatus":"APPROVED","reviewComment":"Demo seed approval"}'
    Write-Utf8File "$PWD\.tmp-approve.json" $approve
    $r = curl.exe -s -X POST ("$base/farms/{0}/review" -f $farm.farmId) -H "Authorization: Bearer $adminToken" -H 'Content-Type: application/json; charset=utf-8' --data-binary "@.tmp-approve.json" | ConvertFrom-Json
    Remove-Item "$PWD\.tmp-approve.json" -ErrorAction SilentlyContinue
    Write-Host ("Farm approved -> {0}" -f $r.data.approvalStatus)
}

Write-Host ''
Write-Host 'Done. Login huong@gmail.com / Thehuong2006 -> /farm/profile, /farm/subscription, /dashboard/farm.'
