import { parse as parseCookies } from "cookie";
import connectDB from "./db";
import User from "../models/User";
import { verifyToken } from "./auth";

export async function getSessionUser(req) {
    const cookies = parseCookies(req.headers.cookie || "");
    const token = cookies._vercel_jwt || cookies.token || null;
    if (!token) return null;

    const payload = verifyToken(token);
    if (!payload) return null;

    await connectDB();
    const user = await User.findById(payload.id).select("-password");
    return user || null;
}
