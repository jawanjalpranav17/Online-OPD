// Removes ALL demo/dummy data from the target MongoDB database:
// patients, appointments, doctors, medicines, lab tests/orders, beds,
// notices, jobs, applicants, prescriptions, pharmacy sales, admissions.
// Keeps the admin/staff login accounts (admin, user) and removes only the
// patient-portal test accounts so dashboard sign-in still works.
//
// Usage:
//   node scripts/cleanup-all-dummy.js                 (uses MONGO_URI from .env.local)
//   node scripts/cleanup-all-dummy.js "mongodb+srv://..."   (explicit URI)
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

function getMongoUri() {
    const explicit = process.argv[2];
    if (explicit && explicit.startsWith('mongodb')) return explicit;

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

// Collections seeded by scripts/seed-db.js, seed-marathi-patients.js and
// UI/API testing. Wiped completely; user accounts handled separately below.
const WIPE_COLLECTIONS = [
    'patients', 'appointments', 'doctors', 'medicines',
    'labtests', 'laborders', 'beds', 'notices',
    'jobs', 'applicants', 'prescriptions', 'pharmacysales', 'admissions',
];

// Patient-portal test accounts (safe to delete); admin/staff logins are kept.
const TEST_USER_EMAILS = [
    'demo.patient@clinx.com',
    'rahul.test@clinx.com',
];
const TEST_USER_EMAIL_REGEX = /^rahul\.test\d+@clinx\.com$/;

async function wipeCollection(db, name) {
    try {
        const res = await db.collection(name).deleteMany({});
        return res.deletedCount;
    } catch (err) {
        console.error(`  ! ${name}: ${err.message}`);
        return 0;
    }
}

async function main() {
    const uri = getMongoUri();
    if (!uri) { console.error('MONGO_URI not found in .env.local/.env and no URI argument given'); process.exit(1); }

    const dbName = uri.split('/').pop().split('?')[0];
    console.log(`Connecting to MongoDB (database: "${dbName || 'test'}")...`);
    await mongoose.connect(uri);
    console.log('Connected to MongoDB');
    const db = mongoose.connection.db;

    console.log('\n--- Wiping demo collections ---');
    let total = 0;
    for (const name of WIPE_COLLECTIONS) {
        const deleted = await wipeCollection(db, name);
        if (deleted > 0) console.log(`  ${name}: ${deleted} deleted`);
        total += deleted;
    }
    console.log(`Total demo documents deleted: ${total}`);

    console.log('\n--- Cleaning test users ---');
    const byEmail = await db.collection('users').deleteMany({ email: { $in: TEST_USER_EMAILS } });
    const byPattern = await db.collection('users').deleteMany({ email: TEST_USER_EMAIL_REGEX });
    console.log(`  test portal users deleted: ${byEmail.deletedCount + byPattern.deletedCount}`);

    const remainingUsers = await db.collection('users').find({}, { projection: { username: 1, email: 1 } }).toArray();
    console.log('\n--- Remaining user accounts (kept for login) ---');
    remainingUsers.forEach((u) => console.log(`  ${u.username} (${u.email || 'no email'})`));

    const patientCount = await db.collection('patients').countDocuments({});
    console.log(`\nFinal patient count in "${dbName || 'test'}": ${patientCount}`);
    await mongoose.disconnect();
    console.log('Cleanup complete.');
}

main().catch((err) => { console.error('Error:', err.message); process.exit(1); });
