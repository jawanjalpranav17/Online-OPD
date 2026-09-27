// lib/db.js
import mongoose from "mongoose";

const connectDB = async () => {
    if (mongoose.connections[0].readyState) return;

    const uri = process.env.MONGO_URI || process.env.MONGODB_URI;
    if (!uri) {
        throw new Error(
            "Missing MONGO_URI or MONGODB_URI. Set one in .env.local (local) or your hosting provider's Environment Variables (Render/Vercel)."
        );
    }

    await mongoose.connect(uri);
    console.log("MongoDB Connected");
};

export default connectDB;
