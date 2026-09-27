import { useState, useEffect } from "react";
import axios from "axios";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { BedDouble, UserPlus, FileOutput, X } from "lucide-react";

export default function IPDDashboard() {
    const [beds, setBeds] = useState([]);
    const [patients, setPatients] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [admissions, setAdmissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAdmitModal, setShowAdmitModal] = useState(false);
    const [showDischargeModal, setShowDischargeModal] = useState(false);
    const [saving, setSaving] = useState(false);
    const [formError, setFormError] = useState("");
    const [admitForm, setAdmitForm] = useState({ patientId: "", bedId: "", doctorId: "", nursingNotes: "" });
    const [dischargeForm, setDischargeForm] = useState({ admissionId: "", extraCharges: 0 });

    const fetchIPDData = async () => {
        try {
            const [bedsRes, patRes, docRes, admRes] = await Promise.all([
                axios.get("/api/ipd/beds"),
                axios.get("/api/patients"),
                axios.get("/api/doctors"),
                axios.get("/api/ipd/admit")
            ]);
            setBeds(bedsRes.data);
            setPatients(patRes.data);
            setDoctors(docRes.data);
            setAdmissions(admRes.data);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching IPD data:", error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchIPDData();
    }, []);

    // Group beds by ward
    const groupedBeds = beds.reduce((acc, bed) => {
        if (!acc[bed.wardName]) acc[bed.wardName] = [];
        acc[bed.wardName].push(bed);
        return acc;
    }, {});

    const totalBeds = beds.length;
    const occupiedBeds = beds.filter(b => b.isOccupied).length;
    const freeBeds = totalBeds - occupiedBeds;
    const admittedAdmissions = admissions.filter(a => a.status === "Admitted");

    const openAdmitModal = (bed = null) => {
        setAdmitForm({
            patientId: "",
            bedId: bed ? bed._id : "",
            doctorId: "",
            nursingNotes: ""
        });
        setFormError("");
        setShowAdmitModal(true);
    };

    const submitAdmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setFormError("");
        try {
            if (!admitForm.patientId || !admitForm.bedId) {
                setFormError("Patient and bed are required.");
                setSaving(false);
                return;
            }
            await axios.post("/api/ipd/admit", {
                patient: admitForm.patientId,
                bed: admitForm.bedId,
                admittingDoctor: admitForm.doctorId || undefined,
                nursingNotes: admitForm.nursingNotes
            });
            setShowAdmitModal(false);
            await fetchIPDData();
        } catch (error) {
            setFormError(error.response?.data?.error || "Failed to admit patient.");
        }
        setSaving(false);
    };

    const openDischargeModal = () => {
        setDischargeForm({ admissionId: "", extraCharges: 0 });
        setFormError("");
        setShowDischargeModal(true);
    };

    const submitDischarge = async (e) => {
        e.preventDefault();
        setSaving(true);
        setFormError("");
        try {
            if (!dischargeForm.admissionId) {
                setFormError("Select an admitted patient to discharge.");
                setSaving(false);
                return;
            }
            const res = await axios.post("/api/ipd/discharge", {
                admissionId: dischargeForm.admissionId,
                extraCharges: Number(dischargeForm.extraCharges) || 0
            });
            setShowDischargeModal(false);
            const d = res.data.details || {};
            alert(
                `Patient discharged successfully.\nDays stayed: ${d.daysStayed}\nBed charges: ₹${d.bedCharges}\nExtra charges: ₹${d.extraCharges}\nTotal bill: ₹${d.totalBill}`
            );
            await fetchIPDData();
        } catch (error) {
            setFormError(error.response?.data?.error || "Failed to discharge patient.");
        }
        setSaving(false);
    };

    return (
        <DashboardLayout title="In-Patient Department (IPD)">
            
            {/* IPD Stats */}
            <div className="grid gap-6 mb-8 md:grid-cols-3">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col justify-between">
                    <p className="text-gray-500 font-medium mb-2">Overall Occupancy</p>
                    <div className="flex items-end justify-between">
                        <div>
                            <span className="text-4xl font-bold text-gray-900">{totalBeds > 0 ? Math.round((occupiedBeds/totalBeds)*100) : 0}%</span>
                        </div>
                        <div className="text-sm text-gray-500 text-right">
                            <span className="text-emerald-600 font-medium">{freeBeds} Free</span> / {totalBeds} Total
                        </div>
                    </div>
                    {/* Progress Bar */}
                    <div className="w-full bg-gray-200 rounded-full h-2.5 mt-4">
                        <div className="bg-teal-600 h-2.5 rounded-full" style={{ width: `${totalBeds > 0 ? (occupiedBeds/totalBeds)*100 : 0}%` }}></div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex items-center justify-between col-span-1 md:col-span-2">
                    <div>
                        <h3 className="text-lg font-bold text-gray-900 mb-1">IPD Actions</h3>
                        <p className="text-sm text-gray-500 mb-4">Manage patient admissions and discharges</p>
                        <div className="flex space-x-3">
                            <button
                                onClick={() => openAdmitModal()}
                                className="flex items-center px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-lg text-sm transition-colors shadow-sm"
                            >
                                <UserPlus className="w-4 h-4 mr-2" /> Admit Patient
                            </button>
                            <button
                                onClick={openDischargeModal}
                                className="flex items-center px-4 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium rounded-lg text-sm transition-colors"
                            >
                                <FileOutput className="w-4 h-4 mr-2" /> Discharge Patient
                            </button>
                        </div>
                    </div>
                    <div className="hidden lg:block opacity-20">
                        <BedDouble className="w-24 h-24 text-teal-900" />
                    </div>
                </div>
            </div>

            {/* Currently Admitted */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Currently Admitted ({admittedAdmissions.length})</h3>
                {admittedAdmissions.length === 0 ? (
                    <p className="text-gray-500 text-sm">No patients currently admitted.</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-gray-600 uppercase bg-gray-50 border-b">
                                <tr>
                                    <th className="px-4 py-3 font-semibold">Patient</th>
                                    <th className="px-4 py-3 font-semibold">Bed</th>
                                    <th className="px-4 py-3 font-semibold">Doctor</th>
                                    <th className="px-4 py-3 font-semibold">Admitted At</th>
                                </tr>
                            </thead>
                            <tbody>
                                {admittedAdmissions.map(adm => (
                                    <tr key={adm._id} className="border-b last:border-0 hover:bg-gray-50">
                                        <td className="px-4 py-3 font-medium text-gray-900">{adm.patient?.name || "Unknown"}</td>
                                        <td className="px-4 py-3 text-gray-600">{adm.bed?.wardName} / {adm.bed?.bedNumber}</td>
                                        <td className="px-4 py-3 text-gray-600">{adm.admittingDoctor?.name || "—"}</td>
                                        <td className="px-4 py-3 text-gray-600">{new Date(adm.admittedAt).toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Visual Bed Map */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                    <BedDouble className="w-6 h-6 mr-3 text-teal-600" />
                    Live Bed Map
                </h3>

                {loading ? (
                    <div className="flex justify-center items-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
                    </div>
                ) : Object.keys(groupedBeds).length === 0 ? (
                    <p className="text-center text-gray-500 py-8">No beds configured in the system.</p>
                ) : (
                    <div className="space-y-8">
                        {Object.entries(groupedBeds).map(([wardName, wardBeds]) => (
                            <div key={wardName}>
                                <div className="flex items-center mb-4">
                                    <h4 className="font-semibold text-lg text-gray-800">{wardName}</h4>
                                    <span className="ml-3 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                                        {wardBeds.filter(b => !b.isOccupied).length} Available
                                    </span>
                                </div>
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
                                    {wardBeds.map(bed => (
                                        <div 
                                            key={bed._id}
                                            onClick={() => !bed.isOccupied && openAdmitModal(bed)}
                                            className={`relative p-4 rounded-xl border-2 transition-all group 
                                                ${bed.isOccupied 
                                                    ? 'border-red-200 bg-red-50 cursor-default' 
                                                    : 'border-emerald-200 bg-emerald-50 hover:border-emerald-300 cursor-pointer'}`}
                                        >
                                            <div className={`absolute top-2 right-2 w-2 h-2 rounded-full ${bed.isOccupied ? 'bg-red-500' : 'bg-emerald-500'} animate-pulse`}></div>
                                            <BedDouble className={`w-8 h-8 mx-auto mb-2 ${bed.isOccupied ? 'text-red-400' : 'text-emerald-500'}`} />
                                            <p className={`text-center font-bold text-sm ${bed.isOccupied ? 'text-red-900' : 'text-emerald-900'}`}>
                                                {bed.bedNumber}
                                            </p>
                                            <p className={`text-center text-xs mt-1 ${bed.isOccupied ? 'text-red-600' : 'text-emerald-600'}`}>
                                                {bed.isOccupied ? 'Occupied' : 'Free'}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Admit Modal */}
            {showAdmitModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/50" onClick={() => setShowAdmitModal(false)}></div>
                    <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl relative z-10 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-bold text-gray-900">Admit Patient</h3>
                            <button onClick={() => setShowAdmitModal(false)} className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        {formError && <div className="mb-4 p-3 bg-red-50 text-red-700 border-l-4 border-red-400 rounded text-sm">{formError}</div>}
                        <form onSubmit={submitAdmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Patient</label>
                                <select
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                                    value={admitForm.patientId}
                                    onChange={(e) => setAdmitForm({ ...admitForm, patientId: e.target.value })}
                                    required
                                >
                                    <option value="">Select patient...</option>
                                    {patients.map(p => (
                                        <option key={p._id} value={p._id}>{p.name} ({p.opdNumber || "No OPD"})</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Bed</label>
                                <select
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                                    value={admitForm.bedId}
                                    onChange={(e) => setAdmitForm({ ...admitForm, bedId: e.target.value })}
                                    required
                                >
                                    <option value="">Select free bed...</option>
                                    {beds.filter(b => !b.isOccupied).map(b => (
                                        <option key={b._id} value={b._id}>{b.wardName} - {b.bedNumber} (₹{b.pricePerDay}/day)</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Admitting Doctor</label>
                                <select
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                                    value={admitForm.doctorId}
                                    onChange={(e) => setAdmitForm({ ...admitForm, doctorId: e.target.value })}
                                >
                                    <option value="">Select doctor (optional)...</option>
                                    {doctors.map(d => (
                                        <option key={d._id} value={d._id}>{d.name} - {d.department}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nursing Notes</label>
                                <textarea
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                                    rows="2"
                                    placeholder="Optional notes..."
                                    value={admitForm.nursingNotes}
                                    onChange={(e) => setAdmitForm({ ...admitForm, nursingNotes: e.target.value })}
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={saving}
                                className="w-full py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
                            >
                                {saving ? "Admitting..." : "Admit Patient"}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Discharge Modal */}
            {showDischargeModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/50" onClick={() => setShowDischargeModal(false)}></div>
                    <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl relative z-10 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-bold text-gray-900">Discharge Patient</h3>
                            <button onClick={() => setShowDischargeModal(false)} className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        {formError && <div className="mb-4 p-3 bg-red-50 text-red-700 border-l-4 border-red-400 rounded text-sm">{formError}</div>}
                        <form onSubmit={submitDischarge} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Admitted Patient</label>
                                <select
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                                    value={dischargeForm.admissionId}
                                    onChange={(e) => setDischargeForm({ ...dischargeForm, admissionId: e.target.value })}
                                    required
                                >
                                    <option value="">Select admission...</option>
                                    {admittedAdmissions.map(adm => (
                                        <option key={adm._id} value={adm._id}>
                                            {adm.patient?.name || "Unknown"} — {adm.bed?.wardName}/{adm.bed?.bedNumber}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Extra Charges (₹)</label>
                                <input
                                    type="number"
                                    min="0"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                                    value={dischargeForm.extraCharges}
                                    onChange={(e) => setDischargeForm({ ...dischargeForm, extraCharges: e.target.value })}
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={saving}
                                className="w-full py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
                            >
                                {saving ? "Discharging..." : "Discharge & Generate Bill"}
                            </button>
                        </form>
                    </div>
                </div>
            )}
            
        </DashboardLayout>
    );
}
