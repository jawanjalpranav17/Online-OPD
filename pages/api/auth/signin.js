import connectDB from "../../../lib/db";
import User from "../../../models/User";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { serialize } from "cookie"; // Use named import

const JWT_SECRET = process.env.JWT_SECRET;

export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ message: "Method not allowed" });
    }

    const { username, password, expectedRole } = req.body;
    if (!username || !password) {
        return res.status(400).json({ message: "Missing fields" });
    }

    try {
        await connectDB();

        const user = await User.findOne({ username });
        if (!user) {
            return res.status(400).json({ message: "Invalid credentials" });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        const role = user.role || "staff";
        if (expectedRole === "patient" && role !== "patient") {
            return res.status(403).json({ message: "This login is for patients. Use Staff Sign In instead." });
        }
        if (expectedRole === "staff" && role === "patient") {
            return res.status(403).json({ message: "This login is for hospital staff. Use Patient Sign In instead." });
        }

        if (!JWT_SECRET) {
            return res.status(500).json({
                message:
                    "Server misconfiguration: JWT_SECRET is not set. Add it in Render (or Vercel) Environment Variables.",
            });
        }

        const token = jwt.sign(
            { id: user._id, username: user.username, isAdmin: user.isAdmin, role: user.role || "staff", patientId: user.patientId || null },
            JWT_SECRET,
            { expiresIn: "1h" }
        );

        res.setHeader(
            "Set-Cookie",
            serialize("_vercel_jwt", token, {
                httpOnly: true,
                secure: process.env.NODE_ENV !== "development",
                maxAge: 3600,
                sameSite: "strict",
                path: "/",
            })
        );

        return res.status(200).json({ message: "Sign in successful", isAdmin: user.isAdmin, role: user.role || "staff", patientId: user.patientId || null });
    } catch (error) {
        console.error("[api/auth/signin]", error);
        const msg = error?.message || "Sign in failed";
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
                    ? "Database hostname does not resolve (DNS error). Replace MONGO_URI with the current mongodb+srv string from Atlas → Database → Connect → Drivers, update the MONGO_URI environment variable, redeploy. IP allowlist 0.0.0.0/0 cannot fix a wrong or deleted cluster hostname."
                    : "Cannot reach the database (network/timeout). Check Atlas Network Access (0.0.0.0/0), cluster status, and MONGO_URI.",
            });
        }
        return res.status(500).json({ message: msg });
    }
}
