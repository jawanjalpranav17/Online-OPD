// Cleans up test accounts created while verifying the patient portal.
// Removes users/patients created before the User schema gained role/patientId
// (those records have no userId link). Keeps the working demo account.
// Usage: node scripts/cleanup-test-users.js
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

const STALE_EMAILS = ["demo.patient@clinx.com", "rahul.test@clinx.com", "buildtest@clinx.com"];
const STALE_NAMES = ["Demo Patient", "Rahul Test"];

async function main() {
    const uri = getMongoUri();
    if (!uri) { console.error("MONGO_URI not found"); process.exit(1); }

    await mongoose.connect(uri);
    const db = mongoose.connection.db;

    // Users created while the User schema was stale (no role/patientId)
    const uRes = await db.collection('users').deleteMany({ email: { $in: STALE_EMAILS } });
    console.log(`Deleted stale users: ${uRes.deletedCount}`);

    // Patients linked to those users (unlinked: userId missing on stale docs)
    const pRes = await db.collection('patients').deleteMany({
        name: { $in: STALE_NAMES },
        userId: { $exists: false },
    });
    console.log(`Deleted unlinked test patients: ${pRes.deletedCount}`);

    const kept = await db.collection('patients')
        .find({ name: { $in: STALE_NAMES } })
        .project({ name: 1, email: 1, userId: 1 })
        .toArray();
    console.log("Remaining test-named patients (kept):");
    kept.forEach((p) => console.log(`  - ${p.name} (${p.email || "no email"}) userId=${!!p.userId}`));

    // Orphaned timestamped test users (their patient link was deleted above)
    const oRes = await db.collection('users').deleteMany({ email: /^rahul\.test\d+@clinx\.com$/ });
    console.log(`Deleted orphaned timestamped test users: ${oRes.deletedCount}`);

    // Test appointments booked by the flow test
    const aRes = await db.collection('appointments').deleteMany({ notes: "patient portal booking test" });
    console.log(`Deleted flow-test appointments: ${aRes.deletedCount}`);

    await mongoose.disconnect();
}

main().catch((err) => { console.error(err); process.exit(1); });
