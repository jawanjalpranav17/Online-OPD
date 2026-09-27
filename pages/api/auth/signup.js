// pages/api/auth/signup.js
import connectDB from "@/lib/db";
import User from "../../../models/User";
import bcrypt from "bcryptjs";

export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ message: "Method not allowed" });
    }

    const { username, email, password, isAdmin } = req.body;
    if (!username || !email || !password) {
        return res.status(400).json({ message: "Missing fields" });
    }

    try {
        await connectDB();

        const existingUser = await User.findOne({
            $or: [{ username }, { email }],
        });
        if (existingUser) {
            return res.status(400).json({ message: "User or email already exists" });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({
            username,
            email,
            password: hashedPassword,
            isAdmin: isAdmin || false,
        });
        await user.save();
        return res.status(201).json({ message: "User created successfully" });
    } catch (error) {
        console.error("[api/auth/signup]", error);
        const msg = error?.message || "Registration failed";
        const isConfig = /Missing MONGO_URI|MONGODB_URI|environment variable/i.test(msg);
        if (isConfig) {
            return res.status(500).json({
                message:
                    "Server misconfiguration: database URL is not set. Add MONGO_URI or MONGODB_URI in Render (or Vercel) Environment Variables.",
            });
        }
        if (/querySrv|ENOTFOUND|getaddrinfo|ECONNREFUSED|ETIMEDOUT/i.test(msg)) {
            const dnsLikely = /ENOTFOUND|querySrv|NXDOMAIN|Non-existent domain/i.test(
                String(error?.cause?.message || msg)
            );
            return res.status(503).json({
                message: dnsLikely
                    ? "Database hostname does not resolve (DNS error). Your MONGO_URI points at a cluster host that no longer exists or is wrong—not fixed by IP allowlist alone. In MongoDB Atlas: Database → your live cluster → Connect → Drivers → copy the new mongodb+srv URI → set MONGO_URI in your hosting provider's Environment Variables and in .env.local → Redeploy. Also keep Network Access 0.0.0.0/0 and ensure the cluster is not paused."
                    : "Cannot reach the database (network/timeout). Confirm Atlas Network Access allows 0.0.0.0/0, the cluster is running, and MONGO_URI matches Atlas → Connect → Drivers.",
            });
        }
        return res.status(500).json({ message: msg });
    }
}
