import connectDB from "../../../lib/db";
import Admission from "../../../models/Admission";
import Bed from "../../../models/Bed";
import Patient from "../../../models/Patient";
import Doctor from "../../../models/Doctor";

export default async function handler(req, res) {
    await connectDB();

    if (req.method === "GET") {
        try {
            const { status } = req.query;
            let filter = {};
            if (status) filter.status = status;

            const admissions = await Admission.find(filter)
                .populate('patient', 'name contact opdNumber')
                .populate('bed', 'wardName bedNumber pricePerDay')
                .populate('admittingDoctor', 'name department')
                .sort({ admittedAt: -1 });
            return res.status(200).json(admissions);
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    } else if (req.method === "POST") {
        try {
            const { patient, bed, admittingDoctor, nursingNotes } = req.body;
            
            // Check bed availability
            const targetBed = await Bed.findById(bed);
            if (!targetBed) return res.status(404).json({ error: "Bed not found" });
            if (targetBed.isOccupied) return res.status(400).json({ error: "Bed is already occupied" });

            // Create admission
            const admission = new Admission({
                patient,
                bed,
                admittingDoctor,
                nursingNotes,
                status: "Admitted"
            });

            // Mark bed as occupied
            targetBed.isOccupied = true;
            await targetBed.save();
            await admission.save();

            return res.status(201).json(admission);
        } catch (error) {
             return res.status(400).json({ error: error.message });
        }
    } else {
        return res.status(405).json({ error: "Method not allowed" });
    }
}
