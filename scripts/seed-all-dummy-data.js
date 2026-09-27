// Seeds dummy data into every module of the hospital app:
// patients (7-day spread for analytics), appointments, prescriptions,
// lab tests + orders, beds + admissions, medicines + pharmacy sales,
// notices, jobs and applicants. Idempotent via seedTag; existing real
// records (e.g. portal-created patients) are preserved.
// Usage: node scripts/seed-all-dummy-data.js
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

function getMongoUri() {
    const candidates = ['../.env.local', '../.env'];
    for (const rel of candidates) {
        const envPath = path.join(__dirname, rel);
        if (!fs.existsSync(envPath)) continue;
        const env = fs.readFileSync(envPath, 'utf8');
        const match = env.match(/^MONGO_URI=(.*)$/m);
        if (match && match[1].trim()) return match[1].trim();
    }
    return null;
}

const SEED_TAG = "dummy-seed";

const DEPARTMENTS = [
    { dept: "Cardiology", fee: 800 },
    { dept: "Orthopedics", fee: 600 },
    { dept: "Pediatrics", fee: 500 },
    { dept: "Neurology", fee: 1000 },
    { dept: "Dermatology", fee: 700 },
    { dept: "General Medicine", fee: 400 },
    { dept: "Gynecology", fee: 650 },
    { dept: "ENT", fee: 550 },
];

// [name, age, gender, city]
const PEOPLE = [
    ["Sunil Patil", 45, "Male", "Pune"],
    ["Anita Deshmukh", 38, "Female", "Mumbai"],
    ["Rajesh Joshi", 52, "Male", "Nashik"],
    ["Swati Kulkarni", 29, "Female", "Pune"],
    ["Vijay Chavan", 61, "Male", "Kolhapur"],
    ["Madhuri Salunkhe", 34, "Female", "Satara"],
    ["Prashant Bhosale", 41, "Male", "Nagpur"],
    ["Kavita Gaikwad", 47, "Female", "Thane"],
    ["Sandeep Shinde", 36, "Male", "Pune"],
    ["Meenakshi Pawar", 44, "Female", "Aurangabad"],
    ["Avinash More", 55, "Male", "Solapur"],
    ["Priya Kadam", 27, "Female", "Mumbai"],
    ["Nitin Jadhav", 39, "Male", "Pune"],
    ["Rohini Kale", 31, "Female", "Nagpur"],
    ["Ganesh Waghmare", 48, "Male", "Nashik"],
    ["Vaishali Thakre", 26, "Female", "Pune"],
    ["Kiran Dabhade", 58, "Male", "Kolhapur"],
    ["Shubhangi Raut", 33, "Female", "Mumbai"],
    ["Mahesh Gore", 42, "Male", "Satara"],
    ["Supriya Naik", 37, "Female", "Pune"],
    ["Deepak Bhandari", 50, "Male", "Thane"],
    ["Ujjwala Satpute", 46, "Female", "Nagpur"],
    ["Anil Sardar", 63, "Male", "Solapur"],
    ["Renuka Tilekar", 28, "Female", "Pune"],
    ["Bharat Mali", 54, "Male", "Nashik"],
    ["Ashwini Khade", 35, "Female", "Mumbai"],
    ["Sachin Ghorpade", 40, "Male", "Kolhapur"],
    ["Nandini Mule", 30, "Female", "Aurangabad"],
    ["Pradeep Kamble", 49, "Male", "Pune"],
    ["Sneha Wagh", 24, "Female", "Thane"],
    ["Yogesh Sathe", 57, "Male", "Nagpur"],
    ["Manisha Jangam", 32, "Female", "Pune"],
    ["Harshad Agashe", 44, "Male", "Mumbai"],
    ["Pooja Gokhale", 29, "Female", "Satara"],
    ["Sharad Patankar", 60, "Male", "Pune"],
    ["Kanchan Nimbalkar", 43, "Female", "Nashik"],
    ["Umesh Gawade", 37, "Male", "Kolhapur"],
    ["Vandana Shirke", 51, "Female", "Nagpur"],
    ["Balasaheb Thorat", 66, "Male", "Solapur"],
    ["Shalini Pote", 25, "Female", "Mumbai"],
];

const MEDICINES = [
    ["Paracetamol 650mg", "Paracetamol", "Cipla", 30, 220],
    ["Amoxicillin 500mg", "Amoxicillin", "Mankind", 85, 150],
    ["Azithromycin 250mg", "Azithromycin", "Zydus", 120, 40],
    ["Cetirizine 10mg", "Cetirizine", "Sun Pharma", 25, 300],
    ["Omeprazole 20mg", "Omeprazole", "Dr. Reddy's", 45, 180],
    ["Metformin 500mg", "Metformin", "USV", 35, 250],
    ["Amlodipine 5mg", "Amlodipine", "Cipla", 28, 200],
    ["Atorvastatin 10mg", "Atorvastatin", "Lupin", 60, 160],
    ["Vitamin D3 60K", "Cholecalciferol", "Abbott", 110, 90],
    ["Ibuprofen 400mg", "Ibuprofen", "Sun Pharma", 20, 260],
    ["ORS Sachet", "Oral Rehydration Salts", "Cipla", 15, 400],
    ["Cough Syrup 100ml", "Ambroxol+", "Mankind", 90, 120],
];

const LAB_TESTS = [
    ["Complete Blood Count (CBC)", "Hematology", 450, "RBC 4.5-5.5, WBC 4000-11000"],
    ["Blood Glucose (Fasting)", "Biochemistry", 150, "70-100 mg/dL"],
    ["HbA1c", "Biochemistry", 400, "< 5.7%"],
    ["Lipid Profile", "Biochemistry", 600, "Total cholesterol < 200 mg/dL"],
    ["Thyroid Panel (T3, T4, TSH)", "Biochemistry", 700, "TSH 0.4-4.0 mIU/L"],
    ["Liver Function Test", "Biochemistry", 550, "ALT 7-56 U/L"],
    ["Kidney Function Test", "Biochemistry", 650, "Creatinine 0.7-1.3 mg/dL"],
    ["Urine Routine", "Pathology", 200, "No pus cells / protein"],
    ["Chest X-Ray", "Imaging", 350, "Clear lung fields"],
    ["ECG", "Cardiology", 250, "Normal sinus rhythm"],
];

const BEDS = [
    ["General Ward", "GW-01", "General", 800],
    ["General Ward", "GW-02", "General", 800],
    ["General Ward", "GW-03", "General", 800],
    ["General Ward", "GW-04", "General", 800],
    ["ICU", "ICU-01", "ICU", 5000],
    ["ICU", "ICU-02", "ICU", 5000],
    ["Private Ward", "PV-01", "Private", 2500],
    ["Private Ward", "PV-02", "Private", 2500],
    ["Private Ward", "PV-03", "Private", 2500],
    ["Semi-Private Ward", "SP-01", "Semi-Private", 1500],
    ["Semi-Private Ward", "SP-02", "Semi-Private", 1500],
    ["Pediatric Ward", "PD-01", "General", 900],
];

const NOTICES = [
    ["Flu Vaccination Drive", "Free influenza vaccination camp this weekend in the main lobby. Walk-ins welcome.", "Public", 10],
    ["New MRI Machine Installed", "The radiology department now offers 3T MRI scans with faster appointment turnaround.", "All", 20],
    ["Staff Training Session", "Mandatory refresher on the updated EMR workflow, Friday 4 PM, Conference Hall A.", "Staff", 7],
    ["OPD Timings Update", "Outpatient timings extended to 9 PM on weekdays starting next month.", "Patients", 15],
    ["Diabetic Clinic Launch", "Dedicated diabetic clinic every Tuesday with dietician consultations.", "Public", 12],
];

const JOBS = [
    ["Staff Nurse", "Nursing", "Mumbai", "Full-time", "Provide patient care, administer medication and maintain records in the general ward.", ["B.Sc Nursing", "2+ years ward experience"], ["On-site", "Rotational shifts"]],
    ["Lab Technician", "Pathology", "Pune", "Full-time", "Run routine biochemistry and hematology tests and maintain lab equipment.", ["DMLT/B.Sc MLT", "Phlebotomy certified"], ["Day shift"]],
    ["Pharmacist", "Pharmacy", "Mumbai", "Full-time", "Dispense medicines, manage inventory and counsel patients on prescriptions.", ["B.Pharm", "Valid license"], ["On-site"]],
    ["Front Desk Executive", "Administration", "Pune", "Full-time", "Handle patient registrations, appointments and billing queries.", ["Graduate", "Good communication"], ["6-day week"]],
    ["Radiology Technician", "Radiology", "Nashik", "Contract", "Operate X-Ray and CT equipment for outpatient diagnostics.", ["Diploma in radiology", "AERB certified"], ["Contract 1 year"]],
];

const APPLICANTS = [
    ["Riya Sharma", "riya.sharma@mail.com", "9822010001", 3, "Pending"],
    ["Amit Verma", "amit.verma@mail.com", "9822010002", 5, "Reviewed"],
    ["Sneha Iyer", "sneha.iyer@mail.com", "9822010003", 1, "Interviewed"],
    ["Rohit Nair", "rohit.nair@mail.com", "9822010004", 7, "Pending"],
    ["Pooja Hegde", "pooja.hegde@mail.com", "9822010005", 2, "Rejected"],
    ["Kunal Shah", "kunal.shah@mail.com", "9822010006", 4, "Hired"],
];

// [patients, appointments] per day, index 0 = today
const DAY_PLAN = [
    { patients: 8, appointments: 5 },
    { patients: 5, appointments: 4 },
    { patients: 7, appointments: 5 },
    { patients: 4, appointments: 3 },
    { patients: 6, appointments: 4 },
    { patients: 5, appointments: 3 },
    { patients: 5, appointments: 3 },
];

function dayStart(daysAgo) {
    const d = new Date();
    d.setDate(d.getDate() - daysAgo);
    d.setHours(9, 0, 0, 0);
    return d;
}
function atHour(day, hour, minute = 0) {
    const d = new Date(day);
    d.setHours(hour, minute, 0, 0);
    return d;
}

async function main() {
    const uri = getMongoUri();
    if (!uri) { console.error("MONGO_URI not found"); process.exit(1); }

    await mongoose.connect(uri);
    const db = mongoose.connection.db;

    // ---------- Idempotent cleanup ----------
    const collections = ['patients', 'appointments', 'prescriptions', 'laborders', 'admissions',
        'beds', 'pharmacysales', 'medicines', 'labtests', 'notices', 'jobs', 'applicants'];
    for (const col of collections) {
        const res = await db.collection(col).deleteMany({ seedTag: SEED_TAG });
        console.log(`Cleared ${col}: ${res.deletedCount}`);
    }

    // ---------- Read existing doctors (seeded by scripts/seed-doctors.js) ----------
    const doctors = await db.collection('doctors').find({}).toArray();
    if (doctors.length === 0) { console.error("No doctors found - run scripts/seed-doctors.js first"); process.exit(1); }
    const doctorByDept = {};
    for (const doc of doctors) {
        if (!doctorByDept[doc.department]) doctorByDept[doc.department] = doc;
    }
    const fallbackDoctor = doctorByDept["General Medicine"] || doctors[0];

    // ---------- Real portal patients get history records too ----------
    const realPatients = await db.collection('patients').find({ name: { $in: ["Pranavo", "Mohit"] } }).toArray();
    const realById = {};
    for (const p of realPatients) realById[p.name] = p._id;
    console.log(`Linked real patients: ${realPatients.map((p) => p.name).join(", ") || "none"}`);

    // ---------- Lab tests ----------
    const labTestDocs = LAB_TESTS.map(([testName, category, price, normalRange]) => ({
        testName, category, price, normalRange, isActive: true,
        seedTag: SEED_TAG, creationDate: new Date(), lastUpdated: new Date(),
    }));
    const labRes = await db.collection('labtests').insertMany(labTestDocs);
    console.log(`Inserted lab tests: ${labRes.insertedCount}`);

    // ---------- Medicines ----------
    const medDocs = MEDICINES.map(([name, genericName, manufacturer, mrp, stockQuantity]) => ({
        name, genericName, manufacturer,
        batchNumber: `B-${Math.floor(1000 + Math.random() * 9000)}`,
        expiryDate: new Date(Date.now() + (6 + Math.floor(Math.random() * 18)) * 30 * 86400000),
        mrp, stockQuantity, reorderLevel: 50,
        seedTag: SEED_TAG, creationDate: new Date(), lastUpdated: new Date(),
    }));
    const medRes = await db.collection('medicines').insertMany(medDocs);
    console.log(`Inserted medicines: ${medRes.insertedCount}`);

    // ---------- Beds ----------
    const bedDocs = BEDS.map(([wardName, bedNumber, type, pricePerDay]) => ({
        wardName, bedNumber, type, pricePerDay, isOccupied: false,
        seedTag: SEED_TAG, creationDate: new Date(), lastUpdated: new Date(),
    }));
    const bedRes = await db.collection('beds').insertMany(bedDocs);
    console.log(`Inserted beds: ${bedRes.insertedCount}`);

    // ---------- Patients spread over 7 days ----------
    const patientDocs = [];
    let pIdx = 0;
    let opdCounter = 1000;
    for (let day = DAY_PLAN.length - 1; day >= 0; day--) {
        const base = dayStart(day);
        for (let i = 0; i < DAY_PLAN[day].patients; i++) {
            const [name, age, gender, city] = PEOPLE[pIdx % PEOPLE.length];
            const dept = DEPARTMENTS[pIdx % DEPARTMENTS.length];
            const discount = [0, 0, 50, 100][pIdx % 4];
            const when = atHour(base, 9 + (i % 8), (i * 7) % 60);
            opdCounter++;
            patientDocs.push({
                name, age, gender,
                contact: `9822${String(400000 + pIdx * 137).slice(-6)}`,
                email: `${name.toLowerCase().replace(/[^a-z]+/g, ".")}@example.com`,
                address: `Flat ${(pIdx % 30) + 1}, Shanti Nagar, ${city}`,
                guardian: pIdx % 2 === 0 ? "Radha Patil" : "Vithal Joshi",
                opdNumber: `OPD-${opdCounter}`,
                doctor: (doctorByDept[dept.dept] || fallbackDoctor)._id,
                discount,
                finalFee: dept.fee - discount,
                dob: new Date(new Date().getFullYear() - age, 0, 15),
                city, area: "Shanti Nagar", nationality: "Indian",
                patientClass: ["General", "General", "General", "VIP"][pIdx % 4],
                complaints: ["Fever and cough", "Back pain", "Headache", "Skin rash", "Stomach ache", "Fatigue"][pIdx % 6],
                registrationNo: `REG-${opdCounter}`,
                registrationType: "OPD",
                department: dept.dept,
                seedTag: SEED_TAG,
                creationDate: when,
                lastUpdated: when,
            });
            pIdx++;
        }
    }
    const patRes = await db.collection('patients').insertMany(patientDocs);
    console.log(`Inserted patients: ${patRes.insertedCount}`);

    // ---------- Appointments ----------
    const allPatients = patientDocs.concat(realPatients.map((p) => ({ _id: p._id })));
    const appointmentDocs = [];
    let aIdx = 0;
    for (let day = DAY_PLAN.length - 1; day >= 0; day--) {
        const base = dayStart(day);
        for (let i = 0; i < DAY_PLAN[day].appointments; i++) {
            const patient = allPatients[(aIdx * 3) % allPatients.length];
            const doctor = doctors[(aIdx * 2) % doctors.length];
            const hour = 10 + ((aIdx + i) % 8);
            let status = "Completed";
            if (day === 0 && i >= 3) status = "Completed";
            if (day === 0 && i < 3) status = "Scheduled";
            if (day > 0 && (aIdx % 7) === 0) status = "Cancelled";
            appointmentDocs.push({
                patient: patient._id,
                doctor: doctor._id,
                appointmentDate: atHour(base, hour, (aIdx * 9) % 60),
                status,
                queueNumber: (aIdx % 30) + 1,
                notes: aIdx % 4 === 0 ? "Regular check-up" : "",
                seedTag: SEED_TAG,
                creationDate: atHour(base, hour - 1),
                lastUpdated: atHour(base, hour - 1),
            });
            aIdx++;
        }
    }
    // A few upcoming (future) appointments
    for (let i = 0; i < 3; i++) {
        const patient = allPatients[(i * 5) % allPatients.length];
        appointmentDocs.push({
            patient: patient._id,
            doctor: doctors[i % doctors.length]._id,
            appointmentDate: atHour(dayStart(-(i + 1)), 10 + i),
            status: "Scheduled",
            queueNumber: 1 + i,
            seedTag: SEED_TAG,
            creationDate: new Date(),
            lastUpdated: new Date(),
        });
    }
    // Appointments for the real portal patients (so their history shows data)
    if (realById["Pranavo"]) {
        appointmentDocs.push(
            { patient: realById["Pranavo"], doctor: fallbackDoctor._id, appointmentDate: atHour(dayStart(5), 11), status: "Completed", queueNumber: 7, seedTag: SEED_TAG, creationDate: new Date(), lastUpdated: new Date() },
            { patient: realById["Pranavo"], doctor: fallbackDoctor._id, appointmentDate: atHour(dayStart(-1), 12), status: "Scheduled", queueNumber: 2, seedTag: SEED_TAG, creationDate: new Date(), lastUpdated: new Date() }
        );
    }
    if (realById["Mohit"]) {
        appointmentDocs.push(
            { patient: realById["Mohit"], doctor: fallbackDoctor._id, appointmentDate: atHour(dayStart(3), 10), status: "Completed", queueNumber: 5, seedTag: SEED_TAG, creationDate: new Date(), lastUpdated: new Date() },
            { patient: realById["Mohit"], doctor: fallbackDoctor._id, appointmentDate: atHour(dayStart(-2), 11), status: "Scheduled", queueNumber: 4, seedTag: SEED_TAG, creationDate: new Date(), lastUpdated: new Date() }
        );
    }
    const apptRes = await db.collection('appointments').insertMany(appointmentDocs);
    console.log(`Inserted appointments: ${apptRes.insertedCount}`);

    // ---------- Prescriptions ----------
    const prescriptionDocs = [];
    for (let i = 0; i < 10; i++) {
        const patient = allPatients[(i * 4) % allPatients.length];
        const dept = DEPARTMENTS[i % DEPARTMENTS.length];
        const doctor = doctorByDept[dept.dept] || fallbackDoctor;
        const when = atHour(dayStart(1 + (i % 6)), 11 + (i % 5));
        const m1 = MEDICINES[i % MEDICINES.length];
        const m2 = MEDICINES[(i + 3) % MEDICINES.length];
        prescriptionDocs.push({
            patient: patient._id,
            doctor: doctor._id,
            vitals: {
                bloodPressure: `${110 + (i % 30)}/${70 + (i % 20)} mmHg`,
                temperature: `${98 + (i % 2)}.${(i * 3) % 10} F`,
                weight: `${55 + (i % 40)} kg`,
                pulse: `${68 + (i % 25)} bpm`,
                oxygenSaturation: `${96 + (i % 4)}%`,
            },
            symptoms: [["Fever", "Cough", "Weakness"][i % 3], ["Headache", "Body ache"][i % 2]],
            diagnosis: [["Viral fever", "Acute pharyngitis", "Hypertension", "Type 2 Diabetes", "Gastritis", "Migraine"][i % 6]],
            medicines: [
                { name: m1[0], dosage: `${m1[0].match(/\d+mg/) || "1 tab"}`, frequency: ["1-0-1", "1-1-1", "0-1-0"][i % 3], duration: "5 days", instructions: "After meals" },
                { name: m2[0], dosage: `${m2[0].match(/\d+mg/) || "1 tab"}`, frequency: "1-0-0", duration: "7 days", instructions: "Before breakfast" },
            ],
            clinicalNotes: "Patient responded well. Continue medication and review if symptoms persist.",
            nextFollowUp: new Date(when.getTime() + 5 * 86400000),
            seedTag: SEED_TAG,
            creationDate: when,
            lastUpdated: when,
        });
    }
    if (realById["Pranavo"]) {
        const when = atHour(dayStart(4), 12);
        prescriptionDocs.push({
            patient: realById["Pranavo"], doctor: fallbackDoctor._id,
            vitals: { bloodPressure: "120/80 mmHg", temperature: "98.6 F", weight: "68 kg", pulse: "74 bpm", oxygenSaturation: "98%" },
            symptoms: ["Fever", "Sore throat"],
            diagnosis: ["Acute pharyngitis"],
            medicines: [{ name: "Paracetamol 650mg", dosage: "650mg", frequency: "1-0-1", duration: "5 days", instructions: "After meals" }],
            clinicalNotes: "Advised rest and warm fluids.",
            nextFollowUp: new Date(when.getTime() + 5 * 86400000),
            seedTag: SEED_TAG, creationDate: when, lastUpdated: when,
        });
    }
    const rxRes = await db.collection('prescriptions').insertMany(prescriptionDocs);
    console.log(`Inserted prescriptions: ${rxRes.insertedCount}`);

    // ---------- Lab orders ----------
    const labOrderDocs = [];
    for (let i = 0; i < 12; i++) {
        const patient = allPatients[(i * 2 + 1) % allPatients.length];
        const test = labTestDocs[i % labTestDocs.length];
        const when = atHour(dayStart((i % 6)), 10 + (i % 5));
        const status = i < 8 ? "Completed" : (i < 10 ? "In Progress" : "Pending");
        labOrderDocs.push({
            patient: patient._id,
            doctor: fallbackDoctor._id,
            test: test._id,
            orderDate: when,
            status,
            results: status === "Completed" ? `Result values within normal range for ${test.testName}.` : "",
            reportUrl: status === "Completed" ? `/reports/lab-${100 + i}.pdf` : "",
            paymentStatus: i % 3 === 0 ? "Unpaid" : "Paid",
            seedTag: SEED_TAG,
            creationDate: when,
            lastUpdated: when,
        });
    }
    if (realById["Mohit"]) {
        const when = atHour(dayStart(2), 10);
        labOrderDocs.push({
            patient: realById["Mohit"], doctor: fallbackDoctor._id, test: labTestDocs[1]._id,
            orderDate: when, status: "Completed",
            results: "Fasting glucose: 92 mg/dL - within normal limits.",
            reportUrl: "/reports/lab-999.pdf", paymentStatus: "Paid",
            seedTag: SEED_TAG, creationDate: when, lastUpdated: when,
        });
    }
    const labOrderRes = await db.collection('laborders').insertMany(labOrderDocs);
    console.log(`Inserted lab orders: ${labOrderRes.insertedCount}`);

    // ---------- Admissions ----------
    const admissionDocs = [];
    const occupiedBeds = [];
    for (let i = 0; i < 5; i++) {
        const patient = allPatients[(i * 5 + 2) % allPatients.length];
        const bed = bedDocs[(i * 2) % bedDocs.length];
        const admittedAt = atHour(dayStart(2 + i), 14);
        if (i === 4) {
            // Currently admitted - occupies the bed
            admissionDocs.push({
                patient: patient._id, bed: bed._id,
                admittedAt: atHour(dayStart(0), 8),
                status: "Admitted",
                admittingDoctor: fallbackDoctor._id,
                nursingNotes: "Under observation, vitals stable.",
                totalBill: 0, paymentStatus: "Pending",
                seedTag: SEED_TAG, creationDate: new Date(), lastUpdated: new Date(),
            });
            occupiedBeds.push(bed._id);
        } else {
            const dischargedAt = new Date(admittedAt.getTime() + 2 * 86400000);
            admissionDocs.push({
                patient: patient._id, bed: bed._id,
                admittedAt, dischargedAt,
                status: "Discharged",
                admittingDoctor: fallbackDoctor._id,
                nursingNotes: "Recovered well, discharged with medications.",
                totalBill: bed.pricePerDay * 2 + 1200,
                paymentStatus: i % 2 === 0 ? "Paid" : "Pending",
                seedTag: SEED_TAG, creationDate: admittedAt, lastUpdated: dischargedAt,
            });
        }
    }
    if (realById["Pranavo"]) {
        const admittedAt = atHour(dayStart(6), 13);
        const dischargedAt = new Date(admittedAt.getTime() + 2 * 86400000);
        admissionDocs.push({
            patient: realById["Pranavo"], bed: bedDocs[0]._id,
            admittedAt, dischargedAt, status: "Discharged",
            admittingDoctor: fallbackDoctor._id,
            nursingNotes: "Observation for dengue, recovered.",
            totalBill: 1600 + 1200, paymentStatus: "Paid",
            seedTag: SEED_TAG, creationDate: admittedAt, lastUpdated: dischargedAt,
        });
    }
    const admRes = await db.collection('admissions').insertMany(admissionDocs);
    console.log(`Inserted admissions: ${admRes.insertedCount}`);
    for (const bedId of occupiedBeds) {
        await db.collection('beds').updateOne({ _id: bedId }, { $set: { isOccupied: true } });
    }
    console.log(`Marked ${occupiedBeds.length} bed(s) occupied`);

    // ---------- Pharmacy sales ----------
    const saleDocs = [];
    for (let i = 0; i < 8; i++) {
        const patient = allPatients[(i * 3 + 3) % allPatients.length];
        const when = atHour(dayStart(i % 5), 12 + (i % 4));
        const items = [];
        let totalAmount = 0;
        const itemCount = 1 + (i % 3);
        for (let j = 0; j < itemCount; j++) {
            const med = medDocs[(i * 2 + j) % medDocs.length];
            const quantity = 1 + ((i + j) % 3);
            const totalPrice = med.mrp * quantity;
            items.push({ medicine: med._id, quantity, pricePerUnit: med.mrp, totalPrice });
            totalAmount += totalPrice;
        }
        const discount = i % 4 === 0 ? Math.round(totalAmount * 0.1) : 0;
        saleDocs.push({
            patient: patient._id,
            items,
            totalAmount,
            discount,
            finalAmount: totalAmount - discount,
            paymentMethod: ["Cash", "Card", "UPI", "Other"][i % 4],
            seedTag: SEED_TAG,
            saleDate: when,
            lastUpdated: when,
        });
    }
    if (realById["Mohit"]) {
        const when = atHour(dayStart(0), 11);
        const med = medDocs[0];
        const quantity = 2;
        const totalPrice = med.mrp * quantity;
        saleDocs.push({
            patient: realById["Mohit"], items: [{ medicine: med._id, quantity, pricePerUnit: med.mrp, totalPrice }],
            totalAmount: totalPrice, discount: 0, finalAmount: totalPrice, paymentMethod: "UPI",
            seedTag: SEED_TAG, saleDate: when, lastUpdated: when,
        });
    }
    const saleRes = await db.collection('pharmacysales').insertMany(saleDocs);
    console.log(`Inserted pharmacy sales: ${saleRes.insertedCount}`);

    // ---------- Notices ----------
    const noticeDocs = NOTICES.map(([title, content, targetAudience, daysAhead]) => ({
        title, content, targetAudience, isActive: true,
        expiryDate: new Date(Date.now() + daysAhead * 86400000),
        seedTag: SEED_TAG, creationDate: new Date(), lastUpdated: new Date(),
    }));
    const noticeRes = await db.collection('notices').insertMany(noticeDocs);
    console.log(`Inserted notices: ${noticeRes.insertedCount}`);

    // ---------- Jobs ----------
    const jobDocs = JOBS.map(([title, department, location, type, description, requirements, badges]) => ({
        title, department, location, type, description, requirements, badges, isActive: true,
        seedTag: SEED_TAG, creationDate: new Date(), lastUpdated: new Date(),
    }));
    const jobRes = await db.collection('jobs').insertMany(jobDocs);
    console.log(`Inserted jobs: ${jobRes.insertedCount}`);

    // ---------- Applicants ----------
    const applicantDocs = APPLICANTS.map(([name, email, phone, experience, status], i) => ({
        job: Object.values(jobRes.insertedIds)[i % jobDocs.length],
        name, email, phone, experience,
        resumeUrl: `/resumes/${name.toLowerCase().replace(/[^a-z]+/g, "-")}.pdf`,
        status,
        seedTag: SEED_TAG,
        applicationDate: atHour(dayStart((i * 2) % 7), 10),
        lastUpdated: atHour(dayStart((i * 2) % 7), 10),
    }));
    const applRes = await db.collection('applicants').insertMany(applicantDocs);
    console.log(`Inserted applicants: ${applRes.insertedCount}`);

    console.log("\nAll dummy data seeded.");
    await mongoose.disconnect();
}

main().catch((err) => { console.error(err); process.exit(1); });
