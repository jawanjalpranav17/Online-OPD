// pages/api/doctors.js
import connectDB from "../../lib/db";
import Doctor from "../../models/Doctor";

export default async function handler(req, res) {
    await connectDB();

    if (req.method === "POST") {
        try {
            const doctor = new Doctor(req.body);
            await doctor.save();
            return res.status(201).json(doctor);
        } catch (error) {
            return res.status(400).json({ error: error.message });
        }
    } else if (req.method === "PUT") {
        try {
            const { _id, ...updates } = req.body;
            if (!_id) return res.status(400).json({ error: "Doctor _id is required" });

            const doctor = await Doctor.findByIdAndUpdate(_id, updates, { new: true, runValidators: true });
            if (!doctor) return res.status(404).json({ error: "Doctor not found" });

            return res.status(200).json(doctor);
        } catch (error) {
            return res.status(400).json({ error: error.message });
        }
    } else if (req.method === "DELETE") {
        try {
            const { _id } = req.query;
            if (!_id) return res.status(400).json({ error: "Doctor _id is required" });

            const doctor = await Doctor.findByIdAndDelete(_id);
            if (!doctor) return res.status(404).json({ error: "Doctor not found" });

            return res.status(200).json({ message: "Doctor deleted" });
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    } else if (req.method === "GET") {
        const doctors = await Doctor.find();
        return res.status(200).json(doctors);
    } else {
        return res.status(405).json({ error: "Method not allowed" });
    }
}
