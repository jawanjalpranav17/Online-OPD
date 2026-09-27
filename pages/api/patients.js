import connectDB from "../../lib/db";
import Patient from "../../models/Patient";
import Doctor from "../../models/Doctor";

export default async function handler(req, res) {
    await connectDB();

    if (req.method === "POST") {
        try {
            const {
                name,
                age,
                gender,
                contact,
                address,
                guardian,
                opdNumber,
                doctorId,
                discount,
                abhaNumber,
                abhaAddress,
                mrid,
                pro,
                allergy,
                visitValidity,
                priority,
                caseType,
                sittingLocation,
                religion,
                maritalStatus,
                dob,
                city,
                area,
                nationality,
                patientClass,
                referredBy,
                complaints,
                empanelment,
                cashPatient,
                appointmentBioReceipt,
                registrationNo,
                registrationType,
                consultant,
                department,
                time,
            } = req.body;

            // Fetch the doctor's consultation fee
            const doctor = await Doctor.findById(doctorId);
            if (!doctor) {
                return res.status(400).json({ error: "Doctor not found" });
            }

            const finalFee = Math.max(doctor.consultationFee - (discount || 0), 0);

            const patient = new Patient({
                name,
                age,
                gender,
                contact,
                address,
                guardian,
                opdNumber,
                doctor: doctorId,
                discount: discount || 0,
                finalFee,
                abhaNumber,
                abhaAddress,
                mrid,
                pro,
                allergy,
                visitValidity,
                priority,
                caseType,
                sittingLocation,
                religion,
                maritalStatus,
                dob,
                city,
                area,
                nationality,
                patientClass,
                referredBy,
                complaints,
                empanelment,
                cashPatient,
                appointmentBioReceipt,
                registrationNo,
                registrationType,
                consultant,
                department,
                time,
            });

            await patient.save();

            return res.status(201).json(patient);
        } catch (error) {
            return res.status(400).json({ error: error.message });
        }
    } else if (req.method === "PUT") {
        try {
            const { _id, ...updates } = req.body;
            if (!_id) return res.status(400).json({ error: "Patient _id is required" });

            // If doctor changes, recompute finalFee based on new consultation fee and discount
            if (updates.doctor || updates.discount !== undefined) {
                const existing = await Patient.findById(_id);
                if (!existing) return res.status(404).json({ error: "Patient not found" });

                const doctorId = updates.doctor || existing.doctor;
                const doctor = await Doctor.findById(doctorId);
                if (!doctor) return res.status(400).json({ error: "Doctor not found" });

                const discount = updates.discount !== undefined ? Number(updates.discount) : (existing.discount || 0);
                updates.finalFee = Math.max(doctor.consultationFee - discount, 0);
                updates.doctor = doctorId;
            }

            const patient = await Patient.findByIdAndUpdate(_id, updates, { new: true, runValidators: true }).populate("doctor");
            if (!patient) return res.status(404).json({ error: "Patient not found" });

            return res.status(200).json(patient);
        } catch (error) {
            return res.status(400).json({ error: error.message });
        }
    } else if (req.method === "DELETE") {
        try {
            const { _id } = req.query;
            if (!_id) return res.status(400).json({ error: "Patient _id is required" });

            const patient = await Patient.findByIdAndDelete(_id);
            if (!patient) return res.status(404).json({ error: "Patient not found" });

            return res.status(200).json({ message: "Patient deleted" });
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    } else if (req.method === "GET") {
        // Populate doctor info
        const patients = await Patient.find().populate("doctor");
        return res.status(200).json(patients);
    } else {
        return res.status(405).json({ error: "Method not allowed" });
    }
}