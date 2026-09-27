import { useState, useEffect } from "react";
import axios from "axios";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { PlusCircle, Search, Calendar, Clock, User, ClipboardList, CheckCircle2, X, Trash2 } from "lucide-react";

export default function OPDDashboard() {
    const [appointments, setAppointments] = useState([]);
    const [patients, setPatients] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [showNewModal, setShowNewModal] = useState(false);
    const [manageAppt, setManageAppt] = useState(null);
    const [saving, setSaving] = useState(false);
    const [formError, setFormError] = useState("");
    const [newForm, setNewForm] = useState({ patientId: "", doctorId: "", appointmentDate: "", notes: "" });

    const fetchOPDData = async () => {
        try {
            const [apptRes, patRes, docRes] = await Promise.all([
                axios.get("/api/opd/appointments"),
                axios.get("/api/patients"),
                axios.get("/api/doctors")
            ]);
            setAppointments(apptRes.data);
            setPatients(patRes.data);
            setDoctors(docRes.data);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching OPD data:", error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOPDData();
    }, []);

    const filteredAppointments = appointments.filter(app => {
        const query = searchTerm.toLowerCase();
        return (
            app.patient?.name?.toLowerCase().includes(query) ||
            app.patient?.opdNumber?.toLowerCase().includes(query) ||
            app.doctor?.name?.toLowerCase().includes(query) ||
            app.status?.toLowerCase().includes(query)
        );
    });

    const openNewModal = () => {
        setNewForm({ patientId: "", doctorId: "", appointmentDate: "", notes: "" });
        setFormError("");
        setShowNewModal(true);
    };

    const submitNewAppointment = async (e) => {
        e.preventDefault();
        setSaving(true);
        setFormError("");
        try {
            if (!newForm.patientId || !newForm.doctorId || !newForm.appointmentDate) {
                setFormError("Patient, doctor and date are required.");
                setSaving(false);
                return;
            }
            await axios.post("/api/opd/appointments", {
                patient: newForm.patientId,
                doctor: newForm.doctorId,
                appointmentDate: new Date(newForm.appointmentDate).toISOString(),
                notes: newForm.notes
            });
            setShowNewModal(false);
            await fetchOPDData();
        } catch (error) {
            setFormError(error.response?.data?.error || "Failed to create appointment.");
        }
        setSaving(false);
    };

    const openManageModal = (app) => {
        setManageAppt({
            _id: app._id,
            status: app.status,
            appointmentDate: new Date(app.appointmentDate).toISOString().slice(0, 16),
            notes: app.notes || ""
        });
        setFormError("");
    };

    const submitManage = async (e) => {
        e.preventDefault();
        setSaving(true);
        setFormError("");
        try {
            await axios.put("/api/opd/appointments", {
                _id: manageAppt._id,
                status: manageAppt.status,
                appointmentDate: new Date(manageAppt.appointmentDate).toISOString(),
                notes: manageAppt.notes
            });
            setManageAppt(null);
            await fetchOPDData();
        } catch (error) {
            setFormError(error.response?.data?.error || "Failed to update appointment.");
        }
        setSaving(false);
    };

    const deleteAppointment = async () => {
        if (!manageAppt) return;
        setSaving(true);
        try {
            await axios.delete(`/api/opd/appointments?_id=${manageAppt._id}`);
            setManageAppt(null);
            await fetchOPDData();
        } catch (error) {
            setFormError(error.response?.data?.error || "Failed to delete appointment.");
        }
        setSaving(false);
    };

    return (
        <DashboardLayout title="OPD Management">
            {/* Top Stats */}
            <div className="grid gap-6 mb-8 md:grid-cols-2 xl:grid-cols-4">
                <div className="flex items-center p-4 bg-white rounded-lg shadow-sm border border-gray-100">
                    <div className="p-3 mr-4 text-teal-600 bg-teal-100 rounded-full">
                        <ClipboardList className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="mb-2 text-sm font-medium text-gray-600">Today's Queue</p>
                        <p className="text-xl font-semibold text-gray-800">
                            {appointments.filter(a => new Date(a.appointmentDate).toDateString() === new Date().toDateString()).length}
                        </p>
                    </div>
                </div>

                <div className="flex items-center p-4 bg-white rounded-lg shadow-sm border border-gray-100">
                    <div className="p-3 mr-4 text-blue-600 bg-blue-100 rounded-full">
                        <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="mb-2 text-sm font-medium text-gray-600">Completed</p>
                        <p className="text-xl font-semibold text-gray-800">
                            {appointments.filter(a => a.status === 'Completed').length}
                        </p>
                    </div>
                </div>
            </div>

            {/* Actions & Search */}
            <div className="flex flex-col sm:flex-row justify-between mb-6 space-y-4 sm:space-y-0">
                <div className="relative w-full sm:w-96">
                    <input 
                        type="text"
                        placeholder="Search patient, doctor, or status..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <Search className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
                </div>
                <button
                    onClick={openNewModal}
                    className="flex items-center justify-center px-6 py-2 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-lg transition-colors shadow-sm"
                >
                    <PlusCircle className="w-5 h-5 mr-2" />
                    New Appointment
                </button>
            </div>

            {/* Appointments Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-gray-600 uppercase bg-gray-50 border-b">
                            <tr>
                                <th className="px-6 py-4 font-semibold">Patient</th>
                                <th className="px-6 py-4 font-semibold">Doctor</th>
                                <th className="px-6 py-4 font-semibold">Date & Time</th>
                                <th className="px-6 py-4 font-semibold">Status</th>
                                <th className="px-6 py-4 font-semibold">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                                        <div className="animate-pulse flex flex-col items-center">
                                            <div className="h-6 w-6 bg-teal-200 rounded-full mb-2"></div>
                                            Loading appointments...
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredAppointments.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                                        No appointments found.
                                    </td>
                                </tr>
                            ) : (
                                filteredAppointments.map((app) => (
                                    <tr key={app._id} className="border-b last:border-0 hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-gray-900">{app.patient?.name || "Unknown"}</div>
                                            <div className="text-xs text-gray-500 flex items-center mt-1">
                                                <User className="w-3 h-3 mr-1" />
                                                OPD: {app.patient?.opdNumber || "N/A"}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-gray-900">{app.doctor?.name || "Unknown"}</div>
                                            <div className="text-xs text-gray-500">{app.doctor?.department}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center text-gray-700">
                                                <Calendar className="w-4 h-4 mr-2 text-teal-600" />
                                                {new Date(app.appointmentDate).toLocaleDateString()}
                                            </div>
                                            <div className="flex items-center text-gray-500 text-xs mt-1">
                                                <Clock className="w-3 h-3 mr-2" />
                                                {new Date(app.appointmentDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium 
                                                ${app.status === 'Completed' ? 'bg-green-100 text-green-800' : 
                                                  app.status === 'Cancelled' ? 'bg-red-100 text-red-800' : 
                                                  'bg-blue-100 text-blue-800'}`}>
                                                {app.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <button
                                                onClick={() => openManageModal(app)}
                                                className="text-teal-600 hover:text-teal-800 font-medium text-sm transition-colors"
                                            >
                                                Manage
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* New Appointment Modal */}
            {showNewModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/50" onClick={() => setShowNewModal(false)}></div>
                    <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl relative z-10 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-bold text-gray-900">New Appointment</h3>
                            <button onClick={() => setShowNewModal(false)} className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        {formError && <div className="mb-4 p-3 bg-red-50 text-red-700 border-l-4 border-red-400 rounded text-sm">{formError}</div>}
                        <form onSubmit={submitNewAppointment} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Patient</label>
                                <select
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                                    value={newForm.patientId}
                                    onChange={(e) => setNewForm({ ...newForm, patientId: e.target.value })}
                                    required
                                >
                                    <option value="">Select patient...</option>
                                    {patients.map(p => (
                                        <option key={p._id} value={p._id}>{p.name} ({p.opdNumber || "No OPD"})</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Doctor</label>
                                <select
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                                    value={newForm.doctorId}
                                    onChange={(e) => setNewForm({ ...newForm, doctorId: e.target.value })}
                                    required
                                >
                                    <option value="">Select doctor...</option>
                                    {doctors.map(d => (
                                        <option key={d._id} value={d._id}>{d.name} - {d.department}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Date & Time</label>
                                <input
                                    type="datetime-local"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                                    value={newForm.appointmentDate}
                                    onChange={(e) => setNewForm({ ...newForm, appointmentDate: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                                <textarea
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                                    rows="2"
                                    placeholder="Optional notes..."
                                    value={newForm.notes}
                                    onChange={(e) => setNewForm({ ...newForm, notes: e.target.value })}
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={saving}
                                className="w-full py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
                            >
                                {saving ? "Saving..." : "Create Appointment"}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Manage Appointment Modal */}
            {manageAppt && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/50" onClick={() => setManageAppt(null)}></div>
                    <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl relative z-10 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-bold text-gray-900">Manage Appointment</h3>
                            <button onClick={() => setManageAppt(null)} className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        {formError && <div className="mb-4 p-3 bg-red-50 text-red-700 border-l-4 border-red-400 rounded text-sm">{formError}</div>}
                        <form onSubmit={submitManage} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                <select
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                                    value={manageAppt.status}
                                    onChange={(e) => setManageAppt({ ...manageAppt, status: e.target.value })}
                                >
                                    <option value="Scheduled">Scheduled</option>
                                    <option value="Completed">Completed</option>
                                    <option value="Cancelled">Cancelled</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Reschedule Date & Time</label>
                                <input
                                    type="datetime-local"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                                    value={manageAppt.appointmentDate}
                                    onChange={(e) => setManageAppt({ ...manageAppt, appointmentDate: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                                <textarea
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                                    rows="2"
                                    value={manageAppt.notes}
                                    onChange={(e) => setManageAppt({ ...manageAppt, notes: e.target.value })}
                                />
                            </div>
                            <div className="flex gap-3">
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="flex-1 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
                                >
                                    {saving ? "Saving..." : "Save Changes"}
                                </button>
                                <button
                                    type="button"
                                    onClick={deleteAppointment}
                                    disabled={saving}
                                    className="flex items-center justify-center px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-700 font-medium rounded-lg transition-colors disabled:opacity-50"
                                    title="Delete appointment"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}
