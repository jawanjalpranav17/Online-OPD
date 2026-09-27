// Returns the currently signed-in user (from the JWT cookie), if any.
import { parse as parseCookies } from "cookie";
import connectDB from "../../../lib/db";
import User from "../../../models/User";
import { verifyToken } from "../../../lib/auth";

export default async function handler(req, res) {
    if (req.method !== "GET") return res.status(405).json({ message: "Method not allowed" });

    const cookies = parseCookies(req.headers.cookie || "");
    const token = cookies._vercel_jwt || cookies.token || null;
    if (!token) return res.status(401).json({ message: "Not signed in" });

    const payload = verifyToken(token);
    if (!payload) return res.status(401).json({ message: "Session expired" });

    try {
        await connectDB();
        const user = await User.findById(payload.id).select("-password");
        if (!user) return res.status(401).json({ message: "User no longer exists" });

        return res.status(200).json({
            id: user._id,
            username: user.username,
            email: user.email,
            isAdmin: user.isAdmin,
            role: user.role || "staff",
            patientId: user.patientId || null,
        });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}
