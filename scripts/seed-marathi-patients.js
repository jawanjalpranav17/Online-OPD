// Seeds dummy Marathi patients + appointments spread over the last 7 days
// so the Analytics dashboard (Patients Trend, Footfall, Revenue) shows data.
// Usage: node scripts/seed-marathi-patients.js
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

const SEED_TAG = "marathi-dummy";

const DEPARTMENTS = [
    { dept: "Cardiology", fee: 800 },
    { dept: "Orthopedics", fee: 600 },
    { dept: "Pediatrics", fee: 500 },
    { dept: "Neurology", fee: 1000 },
    { dept: "Dermatology", fee: 700 },
    { dept: "General Medicine", fee: 400 },
];

// [name, age, gender, city] — Marathi names transliterated to English
const PEOPLE = [
    ["Sunil Patil", 45, "Male", "पुणे"],
    ["Anita Deshmukh", 38, "Female", "मुंबई"],
    ["Rajesh Joshi", 52, "Male", "नाशिक"],
    ["Swati Kulkarni", 29, "Female", "पुणे"],
    ["Vijay Chavan", 61, "Male", "कोल्हापूर"],
    ["Madhuri Salunkhe", 34, "Female", "सातारा"],
    ["Prashant Bhosale", 41, "Male", "नागपूर"],
    ["Kavita Gaikwad", 47, "Female", "ठाणे"],
    ["Sandeep Shinde", 36, "Male", "सांगली"],
    ["Meenakshi Pawar", 27, "Female", "पुणे"],
    ["Avinash More", 55, "Male", "नाशिक"],
    ["Priya Kadam", 31, "Female", "मुंबई"],
    ["Nitin Jadhav", 44, "Male", "सोलापूर"],
    ["Rohini Kale", 66, "Female", "कोल्हापूर"],
    ["Ganesh Waghmare", 39, "Male", "छत्रपती संभाजीनगर"],
    ["Vaishali Thakre", 42, "Female", "नागपूर"],
    ["Kiran Dabhade", 33, "Male", "सातारा"],
    ["Shubhangi Raut", 58, "Female", "पुणे"],
    ["Mahesh Gore", 49, "Male", "सांगली"],
    ["Supriya Naik", 26, "Female", "ठाणे"],
    ["Deepak Bhandari", 63, "Male", "मुंबई"],
    ["Ujjwala Satpute", 35, "Female", "नाशिक"],
    ["Anil Sardar", 71, "Male", "सोलापूर"],
    ["Renuka Tilekar", 40, "Female", "कोल्हापूर"],
    ["Bharat Mali", 37, "Male", "नागपूर"],
    ["Ashwini Khade", 30, "Female", "पुणे"],
    ["Sachin Ghorpade", 46, "Male", "सातारा"],
    ["Nandini Mule", 24, "Female", "मुंबई"],
    ["Pradeep Kamble", 54, "Male", "छत्रपती संभाजीनगर"],
    ["Sneha Wagh", 28, "Female", "ठाणे"],
    ["Yogesh Sathe", 43, "Male", "पुणे"],
    ["Manisha Jangam", 50, "Female", "नागपूर"],
    ["Harshad Agashe", 32, "Male", "नाशिक"],
    ["Pooja Gokhale", 25, "Female", "कोल्हापूर"],
    ["Sharad Patankar", 59, "Male", "सांगली"],
    ["Kanchan Nimbalkar", 33, "Female", "पुणे"],
    ["Umesh Gawade", 48, "Male", "मुंबई"],
    ["Vandana Shirke", 36, "Female", "नाशिक"],
    ["Balasaheb Thorat", 68, "Male", "कोल्हापूर"],
    ["Shalini Pote", 27, "Female", "नागपूर"],
    ["Dattatray Shelke", 44, "Male", "सातारा"],
];

// patients / appointments per day, oldest (6 days ago) -> today
const DAY_PLAN = [
    { patients: 4, appointments: 3 },
    { patients: 6, appointments: 4 },
    { patients: 5, appointments: 4 },
    { patients: 3, appointments: 2 },
    { patients: 7, appointments: 5 },
    { patients: 4, appointments: 3 },
    { patients: 6, appointments: 5 },
];

function dayStart(daysAgo) {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - daysAgo);
    return d;
}

function atHour(day, hour, minute = 0) {
    const d = new Date(day);
    d.setHours(hour, minute, 0, 0);
    return d;
}

async function seed() {
    const mongoUri = getMongoUri();
    if (!mongoUri) {
        console.error('MONGO_URI not found in .env.local or .env');
        process.exit(1);
    }

    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');
    const db = mongoose.connection.db;

    // Idempotent: clear previously seeded dummy data before re-seeding
    const dummyNames = PEOPLE.map((p) => p[0]);
    const removedPatients = await db.collection('patients').deleteMany({ seedTag: SEED_TAG });
    const removedAppointments = await db.collection('appointments').deleteMany({ seedTag: SEED_TAG });
    // Clean up any legacy untagged dummy batches from earlier runs of this script
    const removedLegacyAppointments = await db.collection('appointments').deleteMany({ seedTag: { $exists: false }, notes: "नियमित तपासणी" });
    const removedLegacyPatients = await db.collection('patients').deleteMany({ seedTag: { $exists: false }, name: { $in: dummyNames } });
    const totalRemoved = removedPatients.deletedCount + removedLegacyPatients.deletedCount;
    const totalRemovedAppt = removedAppointments.deletedCount + removedLegacyAppointments.deletedCount;
    if (totalRemoved || totalRemovedAppt) {
        console.log(`Cleared previous dummy data (${totalRemoved} patients, ${totalRemovedAppt} appointments)`);
    }

    // Pick doctors with the new schema (name field); fall back to any doctor
    const doctors = await db.collection('doctors').find({ name: { $exists: true } }).toArray();
    if (!doctors.length) {
        console.error('No doctors with a "name" field found. Run scripts/seed-db.js first.');
        process.exit(1);
    }
    const doctorByDept = {};
    for (const d of doctors) {
        if (d.department && !doctorByDept[d.department]) doctorByDept[d.department] = d;
    }
    const fallbackDoctor = doctors[0];

    const totalDays = DAY_PLAN.length;
    let personIdx = 0;
    const patientPool = []; // docs created so far, for appointment refs

    for (let dayIdx = 0; dayIdx < totalDays; dayIdx++) {
        const daysAgo = totalDays - 1 - dayIdx;
        const day = dayStart(daysAgo);
        const plan = DAY_PLAN[dayIdx];

        // ---- Patients ----
        const patientDocs = [];
        for (let i = 0; i < plan.patients && personIdx < PEOPLE.length; i++, personIdx++) {
            const [name, age, gender, city] = PEOPLE[personIdx];
            const deptInfo = DEPARTMENTS[personIdx % DEPARTMENTS.length];
            const doctor = doctorByDept[deptInfo.dept] || fallbackDoctor;
            const discount = personIdx % 4 === 0 ? 50 : 0;
            patientDocs.push({
                seedTag: SEED_TAG,
                name,
                age,
                gender,
                contact: `98${String(120000000 + personIdx * 137).padStart(9, '0')}`,
                address: `${city} महाराष्ट्र`,
                guardian: personIdx % 2 === 0 ? "राधा" : "विठ्ठल",
                opdNumber: `OPD-26${String(9000 + personIdx)}`,
                doctor: doctor._id,
                department: deptInfo.dept,
                discount,
                finalFee: deptInfo.fee - discount,
                city,
                nationality: "भारतीय",
                complaints: personIdx % 3 === 0 ? "ताप आणि खोकला" : "पोटदुखी",
                creationDate: atHour(day, 9 + (i % 6), (i * 7) % 60),
                lastUpdated: atHour(day, 9 + (i % 6), (i * 7) % 60),
            });
        }
        if (patientDocs.length) {
            const res = await db.collection('patients').insertMany(patientDocs);
            const created = patientDocs.map((p, i) => ({ _id: res.insertedIds[i], doctor: p.doctor, department: p.department }));
            patientPool.push(...created);
        }

        // ---- Appointments ----
        const appointmentDocs = [];
        for (let i = 0; i < plan.appointments; i++) {
            const src = patientPool[patientPool.length - 1 - i] || patientPool[patientPool.length - 1];
            if (!src) continue;
            const isPast = daysAgo > 0;
            appointmentDocs.push({
                seedTag: SEED_TAG,
                patient: src._id,
                doctor: src.doctor,
                appointmentDate: atHour(day, 10 + i * 2, 30),
                status: isPast ? (i % 5 === 0 ? "Cancelled" : "Completed") : (i % 2 === 0 ? "Scheduled" : "Completed"),
                queueNumber: i + 1,
                notes: "नियमित तपासणी",
                creationDate: atHour(day, 9 + i, 15),
                lastUpdated: atHour(day, 9 + i, 15),
            });
        }
        if (appointmentDocs.length) {
            await db.collection('appointments').insertMany(appointmentDocs);
        }

        console.log(`Day ${dayIdx + 1} (${day.toDateString()}): +${patientDocs.length} patients, +${appointmentDocs.length} appointments`);
    }

    // ---- Today top-up ----
    // Timestamps use "now" so these always land inside the server's current day,
    // even when this script runs in a different timezone than the app server.
    const topUpPatients = [];
    const topUpAppointments = [];
    // Anchor to today around noon so minutes arithmetic can never cross midnight
    const topUpBase = new Date();
    topUpBase.setHours(11, 0, 0, 0);
    for (let i = 0; i < 5 && personIdx < PEOPLE.length; i++, personIdx++) {
        const [name, age, gender, city] = PEOPLE[personIdx];
        const deptInfo = DEPARTMENTS[personIdx % DEPARTMENTS.length];
        const doctor = doctorByDept[deptInfo.dept] || fallbackDoctor;
        const now = new Date(topUpBase.getTime() + i * 30 * 60000);
        topUpPatients.push({
            seedTag: SEED_TAG,
            name,
            age,
            gender,
            contact: `98${String(120000000 + personIdx * 137).padStart(9, '0')}`,
            address: `${city} महाराष्ट्र`,
            guardian: personIdx % 2 === 0 ? "राधा" : "विठ्ठल",
            opdNumber: `OPD-26${String(9000 + personIdx)}`,
            doctor: doctor._id,
            department: deptInfo.dept,
            discount: 0,
            finalFee: deptInfo.fee,
            city,
            nationality: "भारतीय",
            complaints: "नियमित तपासणी",
            creationDate: now,
            lastUpdated: now,
        });
    }
    if (topUpPatients.length) {
        const res = await db.collection('patients').insertMany(topUpPatients);
        topUpPatients.forEach((p, i) => {
            topUpAppointments.push({
                seedTag: SEED_TAG,
                patient: res.insertedIds[i],
                doctor: p.doctor,
                appointmentDate: new Date(topUpBase.getTime() + i * 30 * 60000),
                status: i % 2 === 0 ? "Scheduled" : "Completed",
                queueNumber: i + 1,
                notes: "नियमित तपासणी",
                creationDate: new Date(),
                lastUpdated: new Date(),
            });
        });
        await db.collection('appointments').insertMany(topUpAppointments);
    }
    console.log(`Today top-up: +${topUpPatients.length} patients, +${topUpAppointments.length} appointments`);

    await mongoose.disconnect();
    console.log(`\n✨ Done. ${patientPool.length + topUpPatients.length} Marathi patients and their appointments seeded across the last ${totalDays} days + today.`);
}

seed().catch((err) => {
    console.error('Error:', err.message);
    process.exit(1);
});
