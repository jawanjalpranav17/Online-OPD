// Patient self-registration: creates a User (role "patient") + linked Patient record,
// then signs the patient in with a JWT cookie.
import connectDB from "../../../lib/db";
import User from "../../../models/User";
import Patient from "../../../models/Patient";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { serialize } from "cookie";

const JWT_SECRET = process.env.JWT_SECRET;

export default async function handler(req, res) {
    if (req.method !== "POST") return res.status(405).json({ message: "Method not allowed" });

    const { name, phone, email, password, age, gender } = req.body;
    if (!name || !phone || !email || !password) {
        return res.status(400).json({ message: "Missing fields" });
    }

    try {
        await connectDB();

        const existingUser = await User.findOne({ $or: [{ username: email }, { email }] });
        if (existingUser) {
            return res.status(400).json({ message: "An account with this email already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const patient = new Patient({
            name,
            contact: phone,
            email,
            age: age ? Number(age) : undefined,
            gender: gender || undefined,
        });
        await patient.save();

        const user = new User({
            username: email,
            email,
            password: hashedPassword,
            isAdmin: false,
            role: "patient",
            patientId: patient._id,
        });
        await user.save();

        // Back-link the patient to the user account
        patient.userId = user._id;
        await patient.save();

        if (!JWT_SECRET) {
            return res.status(500).json({ message: "Server misconfiguration: JWT_SECRET is not set." });
        }

        const token = jwt.sign(
            { id: user._id, username: user.username, isAdmin: false, role: "patient", patientId: patient._id },
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

        return res.status(201).json({ message: "Account created", patientId: patient._id });
    } catch (error) {
        console.error("[api/auth/patient-signup]", error);
        const msg = error?.message || "Registration failed";
        if (/Missing MONGO_URI|MONGODB_URI|environment variable/i.test(msg)) {
            return res.status(500).json({ message: "Server misconfiguration: database URL is not set." });
        }
        return res.status(500).json({ message: msg });
    }
}
