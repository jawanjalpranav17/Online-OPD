import connectDB from "../../../lib/db";
import Patient from "../../../models/Patient";
import Appointment from "../../../models/Appointment";

export default async function handler(req, res) {
    if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });
    await connectDB();

    try {
        const days = Number(req.query.days) || 7;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const trend = [];
        for (let i = days - 1; i >= 0; i--) {
            const start = new Date(today);
            start.setDate(today.getDate() - i);
            const end = new Date(start);
            end.setDate(start.getDate() + 1);

            const patients = await Patient.countDocuments({
                creationDate: { $gte: start, $lt: end }
            });
            const appointments = await Appointment.countDocuments({
                appointmentDate: { $gte: start, $lt: end }
            });

            trend.push({
                date: start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                patients,
                appointments
            });
        }

        return res.status(200).json({ trend });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}
