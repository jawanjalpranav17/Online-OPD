// Patient medical history: aggregates appointments, prescriptions, lab orders,
// admissions and pharmacy purchases for one patient. Only the patient's own
// account (or a staff member) may view the records.
import connectDB from "../../../lib/db";
import Patient from "../../../models/Patient";
import Appointment from "../../../models/Appointment";
import Doctor from "../../../models/Doctor";
import Prescription from "../../../models/Prescription";
import LabOrder from "../../../models/LabOrder";
import LabTest from "../../../models/LabTest";
import Admission from "../../../models/Admission";
import Bed from "../../../models/Bed";
import PharmacySale from "../../../models/PharmacySale";
import Medicine from "../../../models/Medicine";
import { getSessionUser } from "../../../lib/session";

export default async function handler(req, res) {
    if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

    await connectDB();

    const { patientId } = req.query;

    const sessionUser = await getSessionUser(req);
    if (!sessionUser) return res.status(401).json({ error: "Sign in required" });

    // Patients can only fetch their own history (patientId derived from the
    // session when not passed explicitly); staff may pass any patientId.
    const resolvedPatientId = patientId || (sessionUser.role === "patient" ? sessionUser.patientId : null);
    if (!resolvedPatientId) return res.status(400).json({ error: "patientId is required" });
    if (sessionUser.role === "patient" && String(sessionUser.patientId) !== String(resolvedPatientId)) {
        return res.status(403).json({ error: "You can only view your own records." });
    }

    try {
        const [patient, appointments, prescriptions, labOrders, admissions, pharmacySales] = await Promise.all([
            Patient.findById(resolvedPatientId).populate('doctor', 'name department'),
            Appointment.find({ patient: resolvedPatientId })
                .populate('doctor', 'name department')
                .sort({ appointmentDate: -1 }),
            Prescription.find({ patient: resolvedPatientId })
                .populate('doctor', 'name department')
                .sort({ creationDate: -1 }),
            LabOrder.find({ patient: resolvedPatientId })
                .populate('test', 'testName category normalRange price')
                .populate('doctor', 'name')
                .sort({ orderDate: -1 }),
            Admission.find({ patient: resolvedPatientId })
                .populate('bed', 'wardName bedNumber pricePerDay')
                .populate('admittingDoctor', 'name department')
                .sort({ admittedAt: -1 }),
            PharmacySale.find({ patient: resolvedPatientId })
                .populate('items.medicine', 'name')
                .sort({ saleDate: -1 }),
        ]);

        if (!patient) return res.status(404).json({ error: "Patient not found" });

        return res.status(200).json({
            patient,
            appointments,
            prescriptions,
            labOrders,
            admissions,
            pharmacySales,
        });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}
