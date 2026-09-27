// models/User.js
import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    isAdmin: { type: Boolean, default: false },
    role: { type: String, enum: ["staff", "patient"], default: "staff" },
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: "Patient" },
}, { timestamps: { createdAt: 'creationDate', updatedAt: 'lastUpdated' } });

export default mongoose.models.User || mongoose.model("User", UserSchema);
