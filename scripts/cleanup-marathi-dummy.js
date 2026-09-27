// Removes the Marathi dummy patients + appointments seeded by
// scripts/seed-marathi-patients.js (tagged "marathi-dummy") and any legacy
// untagged batches from earlier runs of that script.
// Usage: node scripts/cleanup-marathi-dummy.js
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

const DUMMY_NAMES = [
    "Sunil Patil", "Anita Deshmukh", "Rajesh Joshi", "Swati Kulkarni",
    "Vijay Chavan", "Madhuri Salunkhe", "Prashant Bhosale", "Kavita Gaikwad",
    "Sandeep Shinde", "Meenakshi Pawar", "Avinash More", "Priya Kadam",
    "Nitin Jadhav", "Rohini Kale", "Ganesh Waghmare", "Vaishali Thakre",
    "Kiran Dabhade", "Shubhangi Raut", "Mahesh Gore", "Supriya Naik",
    "Deepak Bhandari", "Ujjwala Satpute", "Anil Sardar", "Renuka Tilekar",
    "Bharat Mali", "Ashwini Khade", "Sachin Ghorpade", "Nandini Mule",
    "Pradeep Kamble", "Sneha Wagh", "Yogesh Sathe", "Manisha Jangam",
    "Harshad Agashe", "Pooja Gokhale", "Sharad Patankar", "Kanchan Nimbalkar",
    "Umesh Gawade", "Vandana Shirke", "Balasaheb Thorat", "Shalini Pote",
    "Dattatray Shelke",
];

async function main() {
    const uri = getMongoUri();
    if (!uri) { console.error('MONGO_URI not found in .env.local or .env'); process.exit(1); }

    await mongoose.connect(uri);
    console.log('Connected to MongoDB');
    const db = mongoose.connection.db;

    // Tagged dummy batches from the current seed script
    const taggedPatients = await db.collection('patients').deleteMany({ seedTag: SEED_TAG });
    const taggedAppointments = await db.collection('appointments').deleteMany({ seedTag: SEED_TAG });

    // Legacy untagged batches from earlier runs
    const legacyAppointments = await db.collection('appointments').deleteMany({ seedTag: { $exists: false }, notes: "नियमित तपासणी" });
    const legacyPatients = await db.collection('patients').deleteMany({ seedTag: { $exists: false }, name: { $in: DUMMY_NAMES } });

    const totalPatients = taggedPatients.deletedCount + legacyPatients.deletedCount;
    const totalAppointments = taggedAppointments.deletedCount + legacyAppointments.deletedCount;
    console.log(`Deleted ${totalPatients} dummy patients and ${totalAppointments} dummy appointments`);
    console.log(`  - tagged: ${taggedPatients.deletedCount} patients, ${taggedAppointments.deletedCount} appointments`);
    console.log(`  - legacy: ${legacyPatients.deletedCount} patients, ${legacyAppointments.deletedCount} appointments`);

    const remaining = await db.collection('patients').countDocuments({ seedTag: SEED_TAG });
    console.log(`Remaining marathi-dummy patients in DB: ${remaining}`);

    await mongoose.disconnect();
    console.log('Cleanup complete.');
}

main().catch((err) => { console.error(err); process.exit(1); });
