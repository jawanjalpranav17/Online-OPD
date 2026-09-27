import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/router";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import jsPDF from "jspdf";
import { Search, UserPlus, HeartPulse, Stethoscope, FileText, Download, X, Plus, Trash2 } from "lucide-react";

const emptyMedicine = { name: "", dosage: "", frequency: "", duration: "" };

export default function EMRDashboard() {
    const [patients, setPatients] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [patientHistory, setPatientHistory] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [showRxModal, setShowRxModal] = useState(false);
    const [rxForm, setRxForm] = useState({
        doctorId: "",
        vitals: { bloodPressure: "", temperature: "", pulseRate: "" },
        symptoms: "",
        diagnosis: "",
        medicines: [emptyMedicine]
    });
    const [saving, setSaving] = useState(false);
    const [formError, setFormError] = useState("");
    const router = useRouter();

    useEffect(() => {
        const fetchPatients = async () => {
            try {
                const [patRes, docRes] = await Promise.all([
                    axios.get("/api/patients"),
                    axios.get("/api/doctors")
                ]);
                setPatients(patRes.data);
                setDoctors(docRes.data);
            } catch (error) {
                console.error("Error fetching patients:", error);
            }
        };
        fetchPatients();
    }, []);

    const handleSelectPatient = async (patient) => {
        setSelectedPatient(patient);
        try {
            const res = await axios.get(`/api/emr/patient/${patient._id}`);
            setPatientHistory(res.data);
        } catch (error) {
            console.error("Error fetching history:", error);
        }
    };

    const filteredPatients = patients.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        p.contact.includes(searchTerm)
    );

    const openRxModal = () => {
        setRxForm({
            doctorId: "",
            vitals: { bloodPressure: "", temperature: "", pulseRate: "" },
            symptoms: "",
            diagnosis: "",
            medicines: [emptyMedicine]
        });
        setFormError("");
        setShowRxModal(true);
    };

    const updateMedicine = (index, field, value) => {
        const medicines = rxForm.medicines.map((m, i) => i === index ? { ...m, [field]: value } : m);
        setRxForm({ ...rxForm, medicines });
    };

    const addMedicineRow = () => {
        setRxForm({ ...rxForm, medicines: [...rxForm.medicines, emptyMedicine] });
    };

    const removeMedicineRow = (index) => {
        const medicines = rxForm.medicines.filter((_, i) => i !== index);
        setRxForm({ ...rxForm, medicines: medicines.length ? medicines : [emptyMedicine] });
    };

    const submitPrescription = async (e) => {
        e.preventDefault();
        setSaving(true);
        setFormError("");
        try {
            if (!rxForm.doctorId) {
                setFormError("Select the prescribing doctor.");
                setSaving(false);
                return;
            }
            const medicines = rxForm.medicines
                .map(m => ({ ...m, name: m.name.trim() }))
                .filter(m => m.name);
            await axios.post("/api/emr/prescription", {
                patient: selectedPatient._id,
                doctor: rxForm.doctorId,
                vitals: rxForm.vitals,
                symptoms: rxForm.symptoms.split(",").map(s => s.trim()).filter(Boolean),
                diagnosis: rxForm.diagnosis.split(",").map(s => s.trim()).filter(Boolean),
                medicines
            });
            setShowRxModal(false);
            await handleSelectPatient(selectedPatient);
        } catch (error) {
            setFormError(error.response?.data?.error || "Failed to save prescription.");
        }
        setSaving(false);
    };

    const downloadPrescription = (record) => {
        const doc = new jsPDF();
        doc.setFontSize(16);
        doc.text("ClinX Hospital - Prescription", 20, 20);
        doc.setFontSize(11);
        doc.text(`Patient: ${selectedPatient?.name || "N/A"} (OPD: ${selectedPatient?.opdNumber || "N/A"})`, 20, 32);
        doc.text(`Date: ${new Date(record.creationDate).toLocaleDateString()}`, 20, 40);
        if (record.vitals) {
            doc.text(
                `Vitals - BP: ${record.vitals.bloodPressure || "N/A"} | Temp: ${record.vitals.temperature || "N/A"} | Pulse: ${record.vitals.pulseRate || "N/A"}`,
                20, 52
            );
        }
        doc.text(`Symptoms: ${record.symptoms?.join(", ") || "N/A"}`, 20, 64);
        doc.text(`Diagnosis: ${record.diagnosis?.join(", ") || "N/A"}`, 20, 72);
        doc.text("Medicines:", 20, 84);
        let y = 92;
        (record.medicines || []).forEach(med => {
            doc.text(`- ${med.name} | ${med.dosage || ""} | ${med.frequency || ""} | ${med.duration || ""}`, 26, y);
            y += 8;
        });
        doc.save(`Prescription_${selectedPatient?.opdNumber || "patient"}.pdf`);
    };

    const prescriptions = patientHistory?.prescriptions || [];

    return (
        <DashboardLayout title="Electronic Medical Records (EMR)">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Patient Selection Column */}
                <div className="col-span-1 bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col h-[calc(100vh-8rem)]">
                    <div className="p-4 border-b border-gray-100">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Patient Directory</h3>
                        <div className="relative">
                            <input 
                                type="text"
                                placeholder="Search by name or phone..."
                                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all text-sm"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                        </div>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto p-2">
                        {filteredPatients.map(patient => (
                            <div 
                                key={patient._id} 
                                onClick={() => handleSelectPatient(patient)}
                                className={`p-3 mb-2 rounded-lg cursor-pointer transition-colors border ${
                                    selectedPatient?._id === patient._id 
                                        ? "bg-teal-50 border-teal-200" 
                                        : "border-transparent hover:bg-gray-50"
                                }`}
                            >
                                <div className="font-medium text-gray-900">{patient.name}</div>
                                <div className="text-xs text-gray-500 mt-1 flex justify-between">
                                    <span>{patient.gender}, {patient.age}y</span>
                                    <span>OPD: {patient.opdNumber || "N/A"}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="p-4 border-t border-gray-100">
                        <button
                            onClick={() => router.push("/add-patient")}
                            className="w-full py-2 bg-teal-50 text-teal-700 font-medium rounded-lg hover:bg-teal-100 transition-colors flex items-center justify-center text-sm"
                        >
                            <UserPlus className="w-4 h-4 mr-2" />
                            New Patient
                        </button>
                    </div>
                </div>

                {/* EMR Detail Column */}
                <div className="col-span-1 lg:col-span-2">
                    {selectedPatient ? (
                        <div className="space-y-6">
                            {/* Patient Profile Header */}
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-start justify-between">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900">{selectedPatient.name}</h2>
                                    <p className="text-sm text-gray-500 mt-1">
                                        {selectedPatient.gender} • {selectedPatient.age} years • Contact: {selectedPatient.contact}
                                    </p>
                                </div>
                                <button
                                    onClick={openRxModal}
                                    className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-lg transition-colors flex items-center text-sm"
                                >
                                    <Stethoscope className="w-4 h-4 mr-2" />
                                    Write Prescription
                                </button>
                            </div>

                            {/* Medical History */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                                    <h3 className="font-semibold text-gray-800 flex items-center">
                                        <FileText className="w-5 h-5 mr-2 text-teal-600" />
                                        Visit History
                                    </h3>
                                    <span className="text-xs text-gray-500">{prescriptions.length} prescription(s)</span>
                                </div>
                                <div className="p-6">
                                    {prescriptions.length > 0 ? (
                                        <div className="space-y-6">
                                            {prescriptions.map((record, index) => (
                                                <div key={record._id || index} className="border-l-2 border-teal-100 pl-4 pb-4">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <div className="text-sm font-semibold text-gray-900">
                                                            {new Date(record.creationDate).toLocaleDateString()}
                                                            <span className="ml-2 text-xs font-normal text-gray-500">{record.doctor?.name || "N/A"}</span>
                                                        </div>
                                                        <button
                                                            onClick={() => downloadPrescription(record)}
                                                            className="text-teal-600 hover:text-teal-800 p-1"
                                                            title="Download PDF"
                                                        >
                                                            <Download className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                    
                                                    {record.vitals && (
                                                        <div className="flex gap-4 mb-3 text-xs bg-gray-50 p-2 rounded">
                                                            <span className="flex items-center"><HeartPulse className="w-3 h-3 text-red-500 mr-1"/> BP: {record.vitals.bloodPressure || 'N/A'}</span>
                                                            <span>Temp: {record.vitals.temperature || 'N/A'}</span>
                                                            <span>Pulse: {record.vitals.pulseRate || 'N/A'}</span>
                                                        </div>
                                                    )}
                                                    
                                                    <div className="text-sm">
                                                        <p><span className="font-medium">Symptoms:</span> {record.symptoms?.join(", ") || "N/A"}</p>
                                                        <p className="mt-1"><span className="font-medium text-teal-700">Diagnosis:</span> {record.diagnosis?.join(", ") || "N/A"}</p>
                                                    </div>
                                                    {record.medicines?.length > 0 && (
                                                        <div className="mt-3 bg-gray-50 rounded p-3">
                                                            <p className="text-xs font-semibold text-gray-700 mb-2">Rx Medicines</p>
                                                            {record.medicines.map((med, i) => (
                                                                <p key={i} className="text-xs text-gray-600">
                                                                    • {med.name} — {med.dosage || "-"} | {med.frequency || "-"} | {med.duration || "-"}
                                                                </p>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-8 text-gray-500">
                                            No previous medical records found for this patient.
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 h-[calc(100vh-8rem)] flex items-center justify-center">
                            <div className="text-center">
                                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <FileText className="w-8 h-8 text-gray-400" />
                                </div>
                                <h3 className="text-lg font-medium text-gray-900">No Patient Selected</h3>
                                <p className="text-gray-500 mt-2">Select a patient from the directory to view their EMR.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Write Prescription Modal */}
            {showRxModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/50" onClick={() => setShowRxModal(false)}></div>
                    <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl relative z-10 p-6 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-bold text-gray-900">Write Prescription — {selectedPatient.name}</h3>
                            <button onClick={() => setShowRxModal(false)} className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        {formError && <div className="mb-4 p-3 bg-red-50 text-red-700 border-l-4 border-red-400 rounded text-sm">{formError}</div>}
                        <form onSubmit={submitPrescription} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Prescribing Doctor *</label>
                                <select
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                                    value={rxForm.doctorId}
                                    onChange={(e) => setRxForm({ ...rxForm, doctorId: e.target.value })}
                                    required
                                >
                                    <option value="">Select doctor...</option>
                                    {doctors.map(d => (
                                        <option key={d._id} value={d._id}>{d.name} - {d.department}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Blood Pressure</label>
                                    <input
                                        type="text"
                                        placeholder="120/80"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                                        value={rxForm.vitals.bloodPressure}
                                        onChange={(e) => setRxForm({ ...rxForm, vitals: { ...rxForm.vitals, bloodPressure: e.target.value } })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Temperature</label>
                                    <input
                                        type="text"
                                        placeholder="98.6"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                                        value={rxForm.vitals.temperature}
                                        onChange={(e) => setRxForm({ ...rxForm, vitals: { ...rxForm.vitals, temperature: e.target.value } })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Pulse Rate</label>
                                    <input
                                        type="text"
                                        placeholder="72"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                                        value={rxForm.vitals.pulseRate}
                                        onChange={(e) => setRxForm({ ...rxForm, vitals: { ...rxForm.vitals, pulseRate: e.target.value } })}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Symptoms (comma separated)</label>
                                <textarea
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                                    rows="2"
                                    placeholder="Headache, Fever, ..."
                                    value={rxForm.symptoms}
                                    onChange={(e) => setRxForm({ ...rxForm, symptoms: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Diagnosis (comma separated)</label>
                                <textarea
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                                    rows="2"
                                    placeholder="Common Cold, ..."
                                    value={rxForm.diagnosis}
                                    onChange={(e) => setRxForm({ ...rxForm, diagnosis: e.target.value })}
                                />
                            </div>
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label className="text-sm font-medium text-gray-700">Medicines</label>
                                    <button
                                        type="button"
                                        onClick={addMedicineRow}
                                        className="flex items-center text-xs font-medium text-teal-600 hover:text-teal-800"
                                    >
                                        <Plus className="w-3.5 h-3.5 mr-1" /> Add Medicine
                                    </button>
                                </div>
                                {rxForm.medicines.map((med, index) => (
                                    <div key={index} className="grid grid-cols-12 gap-2 mb-2">
                                        <input
                                            type="text"
                                            placeholder="Name"
                                            className="col-span-3 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                                            value={med.name}
                                            onChange={(e) => updateMedicine(index, "name", e.target.value)}
                                        />
                                        <input
                                            type="text"
                                            placeholder="Dosage"
                                            className="col-span-3 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                                            value={med.dosage}
                                            onChange={(e) => updateMedicine(index, "dosage", e.target.value)}
                                        />
                                        <input
                                            type="text"
                                            placeholder="Frequency"
                                            className="col-span-2 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                                            value={med.frequency}
                                            onChange={(e) => updateMedicine(index, "frequency", e.target.value)}
                                        />
                                        <input
                                            type="text"
                                            placeholder="Duration"
                                            className="col-span-3 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                                            value={med.duration}
                                            onChange={(e) => updateMedicine(index, "duration", e.target.value)}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => removeMedicineRow(index)}
                                            className="col-span-1 flex items-center justify-center text-gray-400 hover:text-red-600"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                            <button
                                type="submit"
                                disabled={saving}
                                className="w-full py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
                            >
                                {saving ? "Saving..." : "Save Prescription"}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}
