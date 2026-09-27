import { useEffect, useState } from "react";
import axios from "axios";
import PatientLayout, { usePatientSession } from "@/components/layouts/PatientLayout";
import {
    CalendarDays, CheckCircle2, Clock, IndianRupee, Phone, UserRound, X,
} from "lucide-react";

const TIME_SLOTS = [
    "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
    "12:00", "12:30", "13:00", "13:30", "14:00", "14:30",
    "15:00", "15:30", "16:00", "16:30", "17:00",
];

function BookAppointments() {
    const me = usePatientSession();
    const [doctors, setDoctors] = useState([]);
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [bookingDoctor, setBookingDoctor] = useState(null);
    const [bookingForm, setBookingForm] = useState({ date: "", time: "10:00", notes: "" });
    const [bookingError, setBookingError] = useState("");
    const [saving, setSaving] = useState(false);
    const [notice, setNotice] = useState("");

    const todayStr = () => new Date().toISOString().split("T")[0];

    const fetchDoctors = async () => {
        const res = await axios.get("/api/doctors");
        setDoctors((res.data || []).filter((d) => d.name));
    };

    const fetchAppointments = async () => {
        const res = await axios.get(`/api/opd/appointments?patientId=${me.patientId}`);
        setAppointments(res.data || []);
    };

    useEffect(() => {
        const load = async () => {
            try {
                await Promise.all([fetchDoctors(), fetchAppointments()]);
            } catch (error) {
                console.error("Failed to load booking data:", error);
            } finally {
                setLoading(false);
            }
        };
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [me.patientId]);

    const openBooking = (doctor) => {
        setBookingDoctor(doctor);
        setBookingForm({ date: todayStr(), time: "10:00", notes: "" });
        setBookingError("");
    };

    const submitBooking = async (e) => {
        e.preventDefault();
        setSaving(true);
        setBookingError("");
        try {
            if (!bookingForm.date || !bookingForm.time) {
                setBookingError("Please pick a date and time slot.");
                setSaving(false);
                return;
            }
            await axios.post("/api/opd/appointments", {
                patient: me.patientId,
                doctor: bookingDoctor._id,
                appointmentDate: new Date(`${bookingForm.date}T${bookingForm.time}`),
                notes: bookingForm.notes,
            });
            setBookingDoctor(null);
            await fetchAppointments();
            setNotice(`Appointment booked with ${bookingDoctor.name}.`);
            setTimeout(() => setNotice(""), 5000);
        } catch (error) {
            setBookingError(error.response?.data?.error || "Failed to book appointment.");
        }
        setSaving(false);
    };

    const cancelAppointment = async (appointment) => {
        if (!confirm(`Cancel appointment with ${appointment.doctor?.name || "doctor"}?`)) return;
        try {
            await axios.delete(`/api/opd/appointments?_id=${appointment._id}`);
            await fetchAppointments();
            setNotice("Appointment cancelled.");
            setTimeout(() => setNotice(""), 5000);
        } catch (error) {
            alert(error.response?.data?.error || "Failed to cancel appointment.");
        }
    };

    const statusBadge = (status) => {
        const styles = {
            Scheduled: "bg-blue-100 text-blue-700",
            Completed: "bg-emerald-100 text-emerald-700",
            Cancelled: "bg-red-100 text-red-700",
        };
        return (
            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${styles[status] || "bg-gray-100 text-gray-600"}`}>
                {status}
            </span>
        );
    };

    if (loading) {
        return (
            <div className="flex justify-center py-16">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600" />
            </div>
        );
    }

    return (
        <>
            {notice && (
                <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    <p className="text-emerald-700 font-medium">{notice}</p>
                </div>
            )}

            <div className="grid gap-8 lg:grid-cols-3">
                <section className="lg:col-span-2">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Choose a doctor</h2>
                    {doctors.length === 0 ? (
                        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-500">
                            No doctors available right now. Please check back later.
                        </div>
                    ) : (
                        <div className="grid gap-4 sm:grid-cols-2">
                            {doctors.map((doctor) => (
                                <div key={doctor._id} className="bg-white rounded-xl border border-gray-200 p-5 flex flex-col justify-between hover:shadow-md transition-shadow">
                                    <div>
                                        <div className="flex items-start justify-between mb-2">
                                            <div>
                                                <h3 className="font-bold text-gray-900">{doctor.name}</h3>
                                                <p className="text-sm text-teal-600 font-medium">{doctor.department}</p>
                                            </div>
                                            <div className="w-10 h-10 bg-teal-50 rounded-full flex items-center justify-center">
                                                <UserRound className="w-5 h-5 text-teal-600" />
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4 text-xs text-gray-500 mt-3">
                                            <span className="flex items-center gap-1">
                                                <IndianRupee className="w-3.5 h-3.5" /> ₹{doctor.consultationFee}
                                            </span>
                                            {doctor.contact && (
                                                <span className="flex items-center gap-1">
                                                    <Phone className="w-3.5 h-3.5" /> {doctor.contact}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => openBooking(doctor)}
                                        className="mt-4 w-full py-2.5 bg-[#00C9A7] text-white text-sm font-bold rounded-lg hover:bg-teal-600"
                                    >
                                        Book Appointment
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </section>

                <section>
                    <h2 className="text-xl font-bold text-gray-900 mb-4">My appointments</h2>
                    {appointments.length === 0 ? (
                        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-500 text-sm">
                            No appointments yet. Book one from the doctors list.
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {appointments.map((appointment) => (
                                <div key={appointment._id} className="bg-white rounded-xl border border-gray-200 p-4">
                                    <div className="flex items-start justify-between mb-2">
                                        <div>
                                            <p className="font-semibold text-gray-900">{appointment.doctor?.name || "Doctor"}</p>
                                            <p className="text-xs text-gray-500">{appointment.doctor?.department}</p>
                                        </div>
                                        {statusBadge(appointment.status)}
                                    </div>
                                    <div className="flex items-center gap-3 text-xs text-gray-600 mt-2">
                                        <span className="flex items-center gap-1">
                                            <CalendarDays className="w-3.5 h-3.5" />
                                            {new Date(appointment.appointmentDate).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Clock className="w-3.5 h-3.5" />
                                            {new Date(appointment.appointmentDate).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                                        </span>
                                    </div>
                                    {appointment.notes && (
                                        <p className="text-xs text-gray-400 mt-2 italic">&ldquo;{appointment.notes}&rdquo;</p>
                                    )}
                                    {appointment.status === "Scheduled" && (
                                        <button
                                            onClick={() => cancelAppointment(appointment)}
                                            className="mt-3 text-xs font-semibold text-red-500 hover:underline"
                                        >
                                            Cancel appointment
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            </div>

            {bookingDoctor && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/50" onClick={() => setBookingDoctor(null)} />
                    <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl relative z-10 p-6">
                        <div className="flex items-start justify-between mb-4">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">Book Appointment</h3>
                                <p className="text-sm text-gray-500">
                                    {bookingDoctor.name} — {bookingDoctor.department}
                                </p>
                            </div>
                            <button onClick={() => setBookingDoctor(null)} className="text-gray-400 hover:text-gray-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        {bookingError && (
                            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
                                {bookingError}
                            </div>
                        )}
                        <form onSubmit={submitBooking} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                                <input
                                    type="date"
                                    required
                                    min={todayStr()}
                                    value={bookingForm.date}
                                    onChange={(e) => setBookingForm({ ...bookingForm, date: e.target.value })}
                                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Time Slot</label>
                                <select
                                    required
                                    value={bookingForm.time}
                                    onChange={(e) => setBookingForm({ ...bookingForm, time: e.target.value })}
                                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none text-sm bg-white"
                                >
                                    {TIME_SLOTS.map((slot) => (
                                        <option key={slot} value={slot}>{slot}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Reason / notes (optional)</label>
                                <textarea
                                    rows="3"
                                    value={bookingForm.notes}
                                    onChange={(e) => setBookingForm({ ...bookingForm, notes: e.target.value })}
                                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none text-sm resize-none"
                                    placeholder="Describe your symptoms or reason for visit"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={saving}
                                className={`w-full py-3 bg-[#00C9A7] text-white font-bold rounded-lg hover:bg-teal-600 ${saving ? "opacity-50 cursor-not-allowed" : ""}`}
                            >
                                {saving ? "Booking..." : "Confirm Booking"}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}

export default function PatientBookPage() {
    return (
        <PatientLayout title="Book OPD Appointment">
            <BookAppointments />
        </PatientLayout>
    );
}
