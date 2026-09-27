import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import jsPDF from "jspdf";

export default function OPDReceipt() {
    const router = useRouter();
    const { id } = router.query;
    const [patient, setPatient] = useState(null);
    const [prescription, setPrescription] = useState("");
    const [saving, setSaving] = useState(false);
    const [savedNote, setSavedNote] = useState("");
    const receiptRef = useRef(null);

    useEffect(() => {
        if (id) {
            axios.get("/api/patients").then((res) => {
                const found = res.data.find((p) => p._id === id);
                setPatient(found);
                if (found) setPrescription(found.prescription || found.complaints || "");
            });
        }
    }, [id]);

    const handlePrint = async () => {
        // Save the prescription to the patient record first
        if (patient) {
            setSaving(true);
            try {
                await axios.put("/api/patients", { _id: patient._id, prescription });
                setSavedNote("Prescription saved to patient record.");
                setTimeout(() => setSavedNote(""), 4000);
            } catch (error) {
                console.error("Failed to save prescription:", error);
            }
            setSaving(false);
        }

        const doc = new jsPDF();
        doc.text("SHYAM CHILDREN AND MATERNITY CENTER", 20, 20);
        doc.text("C-15 New Azad Nagar, Kalyanpur, Kanpur-208017", 20, 28);
        doc.text("-------------------------------------------------", 20, 34);

        if (patient) {
            doc.text(`OPD No: ${patient.opdNumber || "N/A"}`, 20, 50);
            doc.text(`Patient Name: ${patient.name}`, 20, 60);
            doc.text(`Age/Gender: ${patient.age} / ${patient.gender}`, 140, 60);
            doc.text(`Guardian: ${patient.guardian || "N/A"}`, 20, 70);
            doc.text(`Address: ${patient.address || "N/A"}`, 20, 80);
            doc.text(`Date: ${new Date(patient.creationDate).toLocaleDateString()}`, 140, 80);

            doc.text("Complaints:", 20, 100);
            doc.text(`${patient.complaints || "N/A"}`, 40, 110);

            doc.text("Prescription:", 20, 130);
            doc.text(`${prescription || "N/A"}`, 40, 140);

            doc.text("Doctor:", 20, 160);
            doc.text(`${patient.doctor?.name || "N/A"} (${patient.doctor?.department || "N/A"})`, 40, 170);
        }

        doc.save(`OPD_Receipt_${patient?.opdNumber || "patient"}.pdf`);
    };

    return (
        <div className="max-w-3xl mx-auto p-6 border rounded-lg shadow-md bg-white my-8">
            <h1 className="text-2xl font-bold text-center mb-4">
                SHYAM CHILDREN AND MATERNITY CENTER
            </h1>
            <p className="text-center text-sm">
                C-15 New Azad Nagar, Kalyanpur, Kanpur-208017
            </p>
            <hr className="my-4" />

            {patient && (
                <div className="grid grid-cols-2 gap-4">
                    <p><strong>OPD No:</strong> {patient.opdNumber || "N/A"}</p>
                    <p><strong>Patient Name:</strong> {patient.name}</p>
                    <p><strong>Age/Gender:</strong> {patient.age} / {patient.gender}</p>
                    <p><strong>Guardian:</strong> {patient.guardian || "N/A"}</p>
                    <p className="col-span-2"><strong>Address:</strong> {patient.address || "N/A"}</p>
                    <p><strong>Date:</strong> {new Date(patient.creationDate).toLocaleDateString()}</p>
                    <p><strong>Fee:</strong> ₹{patient.finalFee ?? patient.discount ?? "N/A"}</p>
                </div>
            )}

            <div className="mt-4">
                <label className="font-semibold">Complaints:</label>
                <textarea
                    className="w-full border p-2 mt-2 bg-gray-50"
                    rows="2"
                    value={patient?.complaints || ""}
                    disabled
                />
            </div>

            <div className="mt-4">
                <label className="font-semibold">Prescription:</label>
                <textarea
                    className="w-full border p-2 mt-2"
                    rows="3"
                    value={prescription}
                    onChange={(e) => setPrescription(e.target.value)}
                    placeholder="Write prescribed medicines..."
                />
            </div>

            <div className="mt-4">
                <p><strong>Doctor:</strong> {patient?.doctor?.name || "N/A"} ({patient?.doctor?.department || "N/A"})</p>
            </div>

            {savedNote && <p className="mt-2 text-sm text-emerald-600">{savedNote}</p>}

            <div className="flex gap-4 mt-6">
                <button
                    className="bg-red-500 text-white px-4 py-2 rounded w-full"
                    onClick={() => router.push("/patient-list")}
                >
                    Cancel
                </button>
                <button
                    className="bg-blue-500 text-white px-4 py-2 rounded w-full disabled:opacity-50"
                    onClick={handlePrint}
                    disabled={saving}
                >
                    {saving ? "Saving..." : "Print Receipt"}
                </button>
            </div>
        </div>
    );
}
