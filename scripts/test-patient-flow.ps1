$ErrorActionPreference = 'Stop'
$base = 'http://localhost:3000'
$stamp = Get-Date -Format 'HHmmss'

# 1. Patient signup (session cookie captured) - unique email per run
$signupBody = @{ name = 'Rahul Test'; phone = '9822003344'; email = "rahul.test$stamp@clinx.com"; password = 'rahul123' } | ConvertTo-Json
$s = Invoke-WebRequest -Uri "$base/api/auth/patient-signup" -Method POST -ContentType "application/json" -Body $signupBody -SessionVariable sess -UseBasicParsing
Write-Host "1. patient-signup -> $($s.StatusCode) $($s.Content)"

# 2. /api/auth/me with the session cookie
$me = (Invoke-WebRequest -Uri "$base/api/auth/me" -WebSession $sess -UseBasicParsing).Content | ConvertFrom-Json
Write-Host "2. auth/me -> role=$($me.role), patientId=$($me.patientId), username=$($me.username)"

if (-not $me.patientId) { throw "patientId missing on User record - schema still stale" }

# 3. Pick a doctor
$docs = (Invoke-WebRequest -Uri "$base/api/doctors" -UseBasicParsing).Content | ConvertFrom-Json
$doc = $docs | Where-Object { $_.name } | Select-Object -First 1
Write-Host "3. doctor -> $($doc.name) ($($doc._id))"

# 4. Book an appointment (tomorrow 10:00, model fields patient/doctor/appointmentDate)
$apptDate = (Get-Date).AddDays(1).Date.AddHours(10)
$bookBody = @{ patient = $me.patientId; doctor = $doc._id; appointmentDate = $apptDate.ToString('o'); notes = 'patient portal booking test' } | ConvertTo-Json
$b = Invoke-WebRequest -Uri "$base/api/opd/appointments" -Method POST -ContentType "application/json" -Body $bookBody -WebSession $sess -UseBasicParsing
Write-Host "4. book appointment -> $($b.StatusCode) $($b.Content)"

# 5. List my appointments
$mine = (Invoke-WebRequest -Uri "$base/api/opd/appointments?patientId=$($me.patientId)" -UseBasicParsing).Content | ConvertFrom-Json
Write-Host "5. my appointments -> $($mine.Count) found"
$mine | Select-Object -First 3 | ForEach-Object { Write-Host "   - $($_.appointmentDate) status=$($_.status) doctor=$($_.doctor.name)" }

# 6. Pages compile check
foreach ($path in '/book-opd', '/patient/signin', '/patient/signup') {
    try { $r = Invoke-WebRequest -Uri "$base$path" -UseBasicParsing -TimeoutSec 60; Write-Host "6. Page $path -> $($r.StatusCode)" }
    catch { Write-Host "6. Page $path -> FAIL: $($_.Exception.Message)" }
}
