$ErrorActionPreference = 'Stop'
$base = 'http://localhost:3000'

# 1. Sign in as the demo patient (patient portal)
$loginBody = @{ username = 'rahul.test005956@clinx.com'; password = 'rahul123'; expectedRole = 'patient' } | ConvertTo-Json
$login = Invoke-WebRequest -Uri "$base/api/auth/signin" -Method POST -ContentType "application/json" -Body $loginBody -SessionVariable sess -UseBasicParsing
Write-Host "1. signin -> $($login.StatusCode) $($login.Content)"
$me = (Invoke-WebRequest -Uri "$base/api/auth/me" -WebSession $sess -UseBasicParsing).Content | ConvertFrom-Json
$patientId = $me.patientId
Write-Host "   patientId=$patientId role=$($me.role)"

# 2. Pick a doctor
$docs = (Invoke-WebRequest -Uri "$base/api/doctors" -UseBasicParsing).Content | ConvertFrom-Json
$doc = $docs | Where-Object { $_.name } | Select-Object -First 1
Write-Host "2. doctor -> $($doc.name) ($($doc._id))"

# 3. Prescription (EMR)
$rxBody = @{
    patient = $patientId
    doctor = $doc._id
    vitals = @{ bloodPressure = '120/80 mmHg'; temperature = '98.6 F'; weight = '72 kg'; pulse = '76 bpm'; oxygenSaturation = '98%' }
    symptoms = @('Fever', 'Sore throat', 'Body ache')
    diagnosis = @('Acute pharyngitis')
    medicines = @(@{ name = 'Paracetamol'; dosage = '650mg'; frequency = '1-0-1'; duration = '5 days'; instructions = 'After meals' })
    clinicalNotes = 'Patient advised rest and fluids. Review in 5 days.'
    nextFollowUp = (Get-Date).AddDays(5).Date.ToString('o')
} | ConvertTo-Json -Depth 5
$rx = Invoke-WebRequest -Uri "$base/api/emr/prescription" -Method POST -ContentType "application/json" -Body $rxBody -UseBasicParsing
Write-Host "3. prescription -> $($rx.StatusCode)"

# 4. Lab order (completed, with results)
$catalog = (Invoke-WebRequest -Uri "$base/api/labs/catalog" -UseBasicParsing).Content | ConvertFrom-Json
$test = $catalog | Select-Object -First 1
Write-Host "4. lab test -> $($test.testName) ($($test._id))"
$labBody = @{
    patient = $patientId
    doctor = $doc._id
    test = $test._id
    orderDate = (Get-Date).AddDays(-10).Date.AddHours(9).ToString('o')
    status = 'Completed'
    results = 'Hb: 13.2 g/dL, WBC: 6800, Platelets: 2.4 lakh - within normal limits.'
    paymentStatus = 'Paid'
} | ConvertTo-Json
$lab = Invoke-WebRequest -Uri "$base/api/labs/order" -Method POST -ContentType "application/json" -Body $labBody -UseBasicParsing
Write-Host "   lab order -> $($lab.StatusCode)"

# 5. Pharmacy purchase
$inventory = (Invoke-WebRequest -Uri "$base/api/pharmacy/inventory" -UseBasicParsing).Content | ConvertFrom-Json
$med = $inventory | Select-Object -First 1
Write-Host "5. medicine -> $($med.name) ($($med._id))"
$saleBody = @{
    patient = $patientId
    items = @(@{ medicine = $med._id; quantity = 2 })
    discount = 0
    paymentMethod = 'UPI'
} | ConvertTo-Json -Depth 5
$sale = Invoke-WebRequest -Uri "$base/api/pharmacy/dispense" -Method POST -ContentType "application/json" -Body $saleBody -UseBasicParsing
Write-Host "   pharmacy sale -> $($sale.StatusCode)"

# 6. Admission + discharge
$beds = (Invoke-WebRequest -Uri "$base/api/ipd/beds" -UseBasicParsing).Content | ConvertFrom-Json
$bed = $beds | Where-Object { -not $_.isOccupied } | Select-Object -First 1
Write-Host "6. bed -> $($bed.wardName) bed $($bed.bedNumber) ($($bed._id))"
$admitBody = @{ patient = $patientId; bed = $bed._id; admittingDoctor = $doc._id; nursingNotes = 'Admitted with high fever; kept under observation.' } | ConvertTo-Json
$adm = Invoke-WebRequest -Uri "$base/api/ipd/admit" -Method POST -ContentType "application/json" -Body $admitBody -UseBasicParsing
Write-Host "   admit -> $($adm.StatusCode)"
$admJson = $adm.Content | ConvertFrom-Json
$disBody = @{ admissionId = $admJson._id; extraCharges = 1200 } | ConvertTo-Json
$dis = Invoke-WebRequest -Uri "$base/api/ipd/discharge" -Method POST -ContentType "application/json" -Body $disBody -UseBasicParsing
Write-Host "   discharge -> $($dis.StatusCode) $($dis.Content)"

# 7. Past completed appointment
$pastBody = @{
    patient = $patientId
    doctor = $doc._id
    appointmentDate = (Get-Date).AddDays(-10).Date.AddHours(9).ToString('o')
    status = 'Completed'
    notes = 'Follow-up consultation'
} | ConvertTo-Json
$past = Invoke-WebRequest -Uri "$base/api/opd/appointments" -Method POST -ContentType "application/json" -Body $pastBody -UseBasicParsing
Write-Host "7. past appointment -> $($past.StatusCode)"

# 8. Fetch the aggregated history with the patient session
$h = (Invoke-WebRequest -Uri "$base/api/patient/history" -WebSession $sess -UseBasicParsing).Content | ConvertFrom-Json
Write-Host "8. history -> appointments=$($h.appointments.Count) prescriptions=$($h.prescriptions.Count) labs=$($h.labOrders.Count) admissions=$($h.admissions.Count) pharmacy=$($h.pharmacySales.Count)"
Write-Host "   patient -> $($h.patient.name) / $($h.patient.contact)"
$h.appointments | Select-Object -First 3 | ForEach-Object { Write-Host "   appt: $($_.appointmentDate) $($_.status) $($_.doctor.name)" }
