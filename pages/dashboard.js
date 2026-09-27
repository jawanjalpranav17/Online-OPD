import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/router";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { UserPlus, Users, ClipboardList, Search, MoreVertical, Edit, Trash2, X, Download } from "lucide-react";

export default function Dashboard() {
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [editingDoctor, setEditingDoctor] = useState(null);
    const [doctorForm, setDoctorForm] = useState({ name: "", department: "", contact: "", consultationFee: 0 });
    const [saving, setSaving] = useState(false);
    const [formError, setFormError] = useState("");
    const router = useRouter();

    const fetchDoctors = async () => {
        try {
            const res = await axios.get("/api/doctors");
            if (res.data) {
                setDoctors(res.data);
            }
            setLoading(false);
        } catch (err) {
            console.error("Error fetching doctors:", err);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDoctors();
    }, []);

    const filteredDoctors = doctors.filter(doc =>
        (doc.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (doc.department || "").toLowerCase().includes(searchTerm.toLowerCase())
    );

    const openEditModal = (doc) => {
        setEditingDoctor(doc);
        setDoctorForm({
            name: doc.name || "",
            department: doc.department || "",
            contact: doc.contact || "",
            consultationFee: doc.consultationFee || 0
        });
        setFormError("");
    };

    const submitEdit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setFormError("");
        try {
            await axios.put("/api/doctors", {
                _id: editingDoctor._id,
                ...doctorForm,
                consultationFee: Number(doctorForm.consultationFee) || 0
            });
            setEditingDoctor(null);
            await fetchDoctors();
        } catch (error) {
            setFormError(error.response?.data?.error || "Failed to update doctor.");
        }
        setSaving(false);
    };

    const deleteDoctor = async (doc) => {
        if (!window.confirm(`Delete doctor "${doc.name}"?`)) return;
        try {
            await axios.delete(`/api/doctors?_id=${doc._id}`);
            await fetchDoctors();
        } catch (error) {
            alert(error.response?.data?.error || "Failed to delete doctor.");
        }
    };

    const exportReport = () => {
        const rows = [
            ["Name", "Department", "Contact", "Consultation Fee"],
            ...filteredDoctors.map(d => [d.name, d.department, d.contact, d.consultationFee])
        ];
        const csv = rows.map(r => r.map(v => `"${String(v ?? "").replace(/"/g, '""')}"`).join(",")).join("\n");
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "doctors_report.csv";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    return (
        <DashboardLayout title="Staff Portal | Overview">
            
            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <button 
                    onClick={() => router.push("/add-doctor")}
                    className="flex items-center p-5 bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-xl hover:border-teal-300 transition-all transform hover:-translate-y-1 group"
                >
                    <div className="p-4 bg-teal-50 text-teal-600 rounded-xl group-hover:bg-teal-600 group-hover:text-white transition-all duration-300 shadow-inner">
                        <UserPlus className="w-7 h-7" />
                    </div>
                    <div className="ml-5 text-left">
                        <h4 className="text-base font-bold text-gray-900">Add Doctor</h4>
                        <p className="text-xs text-gray-500 mt-1">Register new medical staff</p>
                    </div>
                </button>

                <button 
                    onClick={() => router.push("/add-patient")}
                    className="flex items-center p-5 bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-xl hover:border-blue-300 transition-all transform hover:-translate-y-1 group"
                >
                    <div className="p-4 bg-blue-50 text-blue-600 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-all duration-300 shadow-inner">
                        <Users className="w-7 h-7" />
                    </div>
                    <div className="ml-5 text-left">
                        <h4 className="text-base font-bold text-gray-900">New Patient</h4>
                        <p className="text-xs text-gray-500 mt-1">Register for OPD visit</p>
                    </div>
                </button>

                <button 
                    onClick={() => router.push("/patient-list")}
                    className="flex items-center p-5 bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-xl hover:border-amber-300 transition-all transform hover:-translate-y-1 group"
                >
                    <div className="p-4 bg-amber-50 text-amber-600 rounded-xl group-hover:bg-amber-600 group-hover:text-white transition-all duration-300 shadow-inner">
                        <ClipboardList className="w-7 h-7" />
                    </div>
                    <div className="ml-5 text-left">
                        <h4 className="text-base font-bold text-gray-900">Patient Directory</h4>
                        <p className="text-xs text-gray-500 mt-1">View all patient records</p>
                    </div>
                </button>
            </div>

            {/* Doctors List Table */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between flex-wrap gap-4">
                    <h3 className="text-lg font-bold text-gray-900">Medical Practitioners</h3>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input 
                            type="text" 
                            placeholder="Search doctors..." 
                            className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 w-full sm:w-64"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {loading ? (
                    <div className="p-12 text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto"></div>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                                <tr>
                                    <th className="px-6 py-4 font-semibold">Doctor Name</th>
                                    <th className="px-6 py-4 font-semibold">Department</th>
                                    <th className="px-6 py-4 font-semibold">Consultation Fee</th>
                                    <th className="px-6 py-4 font-semibold text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 italic1 text-sm">
                                {filteredDoctors.length > 0 ? filteredDoctors.map((doc) => (
                                    <tr key={doc._id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center">
                                                <div className="h-10 w-10 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-bold mr-3 border border-teal-200 uppercase">
                                                    {doc.name ? doc.name.charAt(0) : "D"}
                                                </div>
                                                <span className="font-medium text-gray-900">{doc.name || "Unknown Doctor"}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                                                {doc.department}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600">₹{(doc.consultationFee || 0).toLocaleString()}</td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button onClick={() => openEditModal(doc)} className="text-gray-400 hover:text-teal-600 p-1" title="Edit">
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button onClick={() => deleteDoctor(doc)} className="text-gray-400 hover:text-red-600 p-1" title="Delete">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="4" className="px-6 py-12 text-center text-gray-500 italic">
                                            No doctors found in the directory.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
                
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                    <p className="text-sm text-gray-500">Showing {filteredDoctors.length} results</p>
                    <button
                        onClick={exportReport}
                        className="text-sm font-semibold text-teal-600 hover:text-teal-700 flex items-center"
                    >
                        <Download className="w-4 h-4 mr-1" /> Export Report
                    </button>
                </div>
            </div>

            {/* Edit Doctor Modal */}
            {editingDoctor && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/50" onClick={() => setEditingDoctor(null)}></div>
                    <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl relative z-10 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-bold text-gray-900">Edit Doctor</h3>
                            <button onClick={() => setEditingDoctor(null)} className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        {formError && <div className="mb-4 p-3 bg-red-50 text-red-700 border-l-4 border-red-400 rounded text-sm">{formError}</div>}
                        <form onSubmit={submitEdit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                                <input
                                    type="text"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                                    value={doctorForm.name}
                                    onChange={(e) => setDoctorForm({ ...doctorForm, name: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                                <input
                                    type="text"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                                    value={doctorForm.department}
                                    onChange={(e) => setDoctorForm({ ...doctorForm, department: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Contact</label>
                                <input
                                    type="text"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                                    value={doctorForm.contact}
                                    onChange={(e) => setDoctorForm({ ...doctorForm, contact: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Consultation Fee (₹)</label>
                                <input
                                    type="number"
                                    min="0"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                                    value={doctorForm.consultationFee}
                                    onChange={(e) => setDoctorForm({ ...doctorForm, consultationFee: e.target.value })}
                                    required
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={saving}
                                className="w-full py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
                            >
                                {saving ? "Saving..." : "Save Changes"}
                            </button>
                        </form>
                    </div>
                </div>
            )}

        </DashboardLayout>
    );
}