// Seeds dummy doctors into the database so the OPD booking page and staff
// dashboards have doctors to show. Idempotent: clears previously seeded
// doctors (seedTag) before inserting. Also re-links any records whose
// doctor reference is dangling to the General Medicine doctor.
// Usage: node scripts/seed-doctors.js
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

const SEED_TAG = "doctor-seed";

// [name, department, contact, consultationFee]
const DOCTORS = [
    ["Dr. Sunil Patil", "Cardiology", "9822001001", 800],
    ["Dr. Anita Deshmukh", "Cardiology", "9822001002", 900],
    ["Dr. Rajesh Joshi", "Orthopedics", "9822001003", 600],
    ["Dr. Swati Kulkarni", "Orthopedics", "9822001004", 700],
    ["Dr. Vijay Chavan", "Pediatrics", "9822001005", 500],
    ["Dr. Madhuri Salunkhe", "Pediatrics", "9822001006", 550],
    ["Dr. Prashant Bhosale", "Neurology", "9822001007", 1000],
    ["Dr. Kavita Gaikwad", "Neurology", "9822001008", 1100],
    ["Dr. Sandeep Shinde", "Dermatology", "9822001009", 700],
    ["Dr. Meenakshi Pawar", "Dermatology", "9822001010", 750],
    ["Dr. Nitin Jadhav", "Gynecology", "9822001011", 650],
    ["Dr. Rohini Kale", "Ophthalmology", "9822001012", 500],
    ["Dr. Ganesh Waghmare", "ENT", "9822001013", 550],
    ["Dr. Vaishali Thakre", "Dentistry", "9822001014", 450],
    ["Dr. Avinash More", "General Medicine", "9822001015", 400],
    ["Dr. Priya Kadam", "General Medicine", "9822001016", 450],
];

async function main() {
    const uri = getMongoUri();
    if (!uri) { console.error("MONGO_URI not found"); process.exit(1); }

    await mongoose.connect(uri);
    const db = mongoose.connection.db;

    // Clear previously seeded doctors for idempotency
    const cleared = await db.collection('doctors').deleteMany({ seedTag: SEED_TAG });
    console.log(`Cleared previous seeded doctors: ${cleared.deletedCount}`);

    const now = new Date();
    const docs = DOCTORS.map(([name, department, contact, consultationFee]) => ({
        name,
        department,
        contact,
        consultationFee,
        seedTag: SEED_TAG,
        creationDate: now,
        lastUpdated: now,
    }));

    const inserted = await db.collection('doctors').insertMany(docs);
    console.log(`Inserted doctors: ${inserted.insertedCount}`);

    // Re-link dangling doctor references (records pointing at doctors that no
    // longer exist) to the first General Medicine doctor.
    const idSet = new Set(Object.values(inserted.insertedIds).map((id) => String(id)));
    const fallback = Object.values(inserted.insertedIds)[DOCTORS.findIndex((d) => d[1] === "General Medicine")];

    const refs = [
        { col: 'appointments', field: 'doctor' },
        { col: 'prescriptions', field: 'doctor' },
        { col: 'laborders', field: 'doctor' },
        { col: 'admissions', field: 'admittingDoctor' },
        { col: 'patients', field: 'doctor' },
    ];

    let relinked = 0;
    for (const { col, field } of refs) {
        const recs = await db.collection(col).find({ [field]: { $exists: true } }).toArray();
        for (const rec of recs) {
            if (!rec[field] || idSet.has(String(rec[field]))) continue;
            await db.collection(col).updateOne({ _id: rec._id }, { $set: { [field]: fallback } });
            relinked++;
        }
    }
    console.log(`Re-linked dangling doctor references: ${relinked}`);

    await mongoose.disconnect();
}

main().catch((err) => { console.error(err); process.exit(1); });
