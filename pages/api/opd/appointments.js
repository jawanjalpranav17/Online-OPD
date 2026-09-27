import connectDB from "../../../lib/db";
import Appointment from "../../../models/Appointment";
import Patient from "../../../models/Patient";
import Doctor from "../../../models/Doctor";
import { getSessionUser } from "../../../lib/session";

export default async function handler(req, res) {
    await connectDB();
    const sessionUser = await getSessionUser(req);
    const isPatient = sessionUser?.role === "patient" && sessionUser.patientId;

    if (req.method === "POST") {
        try {
            const payload = { ...req.body };
            if (isPatient) {
                payload.patient = sessionUser.patientId;
            }
            const appointment = new Appointment(payload);
            await appointment.save();
            return res.status(201).json(appointment);
        } catch (error) {
            return res.status(400).json({ error: error.message });
        }
    } else if (req.method === "PUT") {
        try {
            const { _id, status, appointmentDate, notes } = req.body;
            if (!_id) return res.status(400).json({ error: "Appointment _id is required" });

            const updates = {};
            if (status !== undefined) updates.status = status;
            if (appointmentDate !== undefined) updates.appointmentDate = appointmentDate;
            if (notes !== undefined) updates.notes = notes;

            const appointment = await Appointment.findByIdAndUpdate(_id, updates, { new: true, runValidators: true });
            if (!appointment) return res.status(404).json({ error: "Appointment not found" });

            return res.status(200).json(appointment);
        } catch (error) {
            return res.status(400).json({ error: error.message });
        }
    } else if (req.method === "DELETE") {
        try {
            const { _id } = req.query;
            if (!_id) return res.status(400).json({ error: "Appointment _id is required" });

            const appointment = await Appointment.findById(_id);
            if (!appointment) return res.status(404).json({ error: "Appointment not found" });
            if (isPatient && String(appointment.patient) !== String(sessionUser.patientId)) {
                return res.status(403).json({ error: "You can only cancel your own appointments." });
            }

            await Appointment.findByIdAndDelete(_id);
            return res.status(200).json({ message: "Appointment deleted" });
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    } else if (req.method === "GET") {
        try {
            const { date, doctorId, patientId } = req.query;
            let filter = {};
            if (isPatient) {
                filter.patient = sessionUser.patientId;
            }
            if (date) {
                // If date provided, find appointments for that day
                const start = new Date(date);
                start.setHours(0, 0, 0, 0);
                const end = new Date(date);
                end.setHours(23, 59, 59, 999);
                filter.appointmentDate = { $gte: start, $lte: end };
            }
            if (doctorId) filter.doctor = doctorId;
            if (!isPatient && patientId) filter.patient = patientId;

            const appointments = await Appointment.find(filter)
                .populate('patient', 'name contact opdNumber')
                .populate('doctor', 'name department')
                .sort({ appointmentDate: 1 });
            return res.status(200).json(appointments);
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    } else {
        return res.status(405).json({ error: "Method not allowed" });
    }
}
