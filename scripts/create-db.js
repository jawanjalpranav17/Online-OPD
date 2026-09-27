// Creates a new database (with the app's collections) on the MongoDB cluster.
// A MongoDB database only exists once it contains data, so this script
// creates empty collections matching the app's Mongoose models.
//
// Usage:
//   node scripts/create-db.js                 (uses MONGO_URI from .env.local)
//   node scripts/create-db.js "mongodb+srv://..."   (explicit URI)
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

// Collection names matching the app's Mongoose models (models/*.js)
const COLLECTIONS = [
    'users', 'patients', 'appointments', 'doctors', 'medicines',
    'labtests', 'laborders', 'beds', 'notices',
    'jobs', 'applicants', 'prescriptions', 'pharmacysales', 'admissions',
];

async function main() {
    const uri = getMongoUri();
    if (!uri) { console.error('MONGO_URI not found in .env.local/.env and no URI argument given'); process.exit(1); }

    const dbName = uri.split('/').pop().split('?')[0];
    console.log(`Connecting to MongoDB (database: "${dbName || 'test'}")...`);
    await mongoose.connect(uri);
    console.log('Connected to MongoDB');
    const db = mongoose.connection.db;

    for (const name of COLLECTIONS) {
        try {
            await db.createCollection(name);
            console.log(`  created collection: ${name}`);
        } catch (err) {
            if (err.codeName === 'NamespaceExists') {
                console.log(`  collection already exists: ${name}`);
            } else {
                console.error(`  ! ${name}: ${err.message}`);
            }
        }
    }

    const cols = await db.listCollections().toArray();
    console.log(`\nDatabase "${dbName || 'test'}" now has ${cols.length} collections:`);
    console.log('  ' + cols.map((c) => c.name).join(', '));

    await mongoose.disconnect();
    console.log('Database setup complete.');
}

main().catch((err) => { console.error('Error:', err.message); process.exit(1); });
