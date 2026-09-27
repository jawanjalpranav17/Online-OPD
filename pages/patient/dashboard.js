import { useEffect, useState } from "react";
import Link from "next/link";
import axios from "axios";
import PatientLayout, { usePatientSession } from "@/components/layouts/PatientLayout";
import { CalendarDays, Clock, FileHeart, Stethoscope, UserRound } from "lucide-react";

function PatientHome() {
    const me = usePatientSession();
    const [history, setHistory] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                const res = await axios.get("/api/patient/history");
                setHistory(res.data);
            } catch (error) {
                console.error("Failed to load patient home:", error);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const patient = history?.patient;
    const upcoming = (history?.appointments || []).filter(
        (a) => a.status === "Scheduled" && new Date(a.appointmentDate) >= new Date(Date.now() - 60 * 60 * 1000)
    );
    const latestPrescription = history?.prescriptions?.[0];

    return (
        <div className="space-y-8">
            <section className="bg-gradient-to-r from-[#002D27] to-[#0A5C52] text-white rounded-2xl p-6 md:p-8">
                <p className="text-teal-200 text-sm font-semibold uppercase tracking-wider mb-2">Welcome back</p>
                <h2 className="text-3xl font-bold mb-2">{patient?.name || me?.username}</h2>
                <p className="text-teal-100 text-sm">
                    Book doctor visits, keep track of appointments, and review your medical history in one place.
                </p>
                <div className="flex flex-wrap gap-4 mt-6 text-sm">
                    {patient?.opdNumber && (
                        <span className="bg-white/10 px-3 py-1.5 rounded-lg">OPD: {patient.opdNumber}</span>
                    )}
                    {patient?.contact && (
                        <span className="bg-white/10 px-3 py-1.5 rounded-lg">Phone: {patient.contact}</span>
                    )}
                    {patient?.gender && (
                        <span className="bg-white/10 px-3 py-1.5 rounded-lg">{patient.gender}{patient.age ? `, ${patient.age}y` : ""}</span>
                    )}
                </div>
            </section>

            <div className="grid gap-4 sm:grid-cols-2">
                <Link href="/patient/book" className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md hover:border-teal-200 transition-all">
                    <Stethoscope className="w-8 h-8 text-teal-600 mb-3" />
                    <h3 className="font-bold text-gray-900">Book OPD Appointment</h3>
                    <p className="text-sm text-gray-500 mt-1">Choose a doctor and pick a time slot.</p>
                </Link>
                <Link href="/patient/history" className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md hover:border-teal-200 transition-all">
                    <FileHeart className="w-8 h-8 text-teal-600 mb-3" />
                    <h3 className="font-bold text-gray-900">Medical History</h3>
                    <p className="text-sm text-gray-500 mt-1">Prescriptions, lab reports, and past visits.</p>
                </Link>
            </div>

            {loading ? (
                <div className="flex justify-center py-10">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600" />
                </div>
            ) : (
                <div className="grid gap-6 lg:grid-cols-2">
                    <section className="bg-white border border-gray-200 rounded-xl p-5">
                        <h3 className="font-bold text-gray-900 mb-4">Upcoming appointments</h3>
                        {upcoming.length === 0 ? (
                            <p className="text-sm text-gray-500">No upcoming visits. Book an appointment when you need care.</p>
                        ) : (
                            <div className="space-y-3">
                                {upcoming.slice(0, 4).map((appointment) => (
                                    <div key={appointment._id} className="border border-gray-100 rounded-lg p-3">
                                        <p className="font-semibold text-gray-900">{appointment.doctor?.name || "Doctor"}</p>
                                        <p className="text-xs text-teal-700">{appointment.doctor?.department}</p>
                                        <div className="flex gap-3 text-xs text-gray-600 mt-2">
                                            <span className="inline-flex items-center gap-1">
                                                <CalendarDays className="w-3.5 h-3.5" />
                                                {new Date(appointment.appointmentDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                                            </span>
                                            <span className="inline-flex items-center gap-1">
                                                <Clock className="w-3.5 h-3.5" />
                                                {new Date(appointment.appointmentDate).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>

                    <section className="bg-white border border-gray-200 rounded-xl p-5">
                        <h3 className="font-bold text-gray-900 mb-4">Latest prescription</h3>
                        {!latestPrescription ? (
                            <p className="text-sm text-gray-500">No prescriptions yet. They will appear here after a consultation.</p>
                        ) : (
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <UserRound className="w-4 h-4 text-teal-600" />
                                    <p className="font-semibold text-gray-900">{latestPrescription.doctor?.name || "Doctor"}</p>
                                </div>
                                <p className="text-xs text-gray-500 mb-3">
                                    {new Date(latestPrescription.creationDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                                </p>
                                {(latestPrescription.diagnosis || []).length > 0 && (
                                    <p className="text-sm text-gray-700 mb-2">
                                        <span className="font-medium">Diagnosis:</span> {latestPrescription.diagnosis.join(", ")}
                                    </p>
                                )}
                                <ul className="text-sm text-gray-600 space-y-1">
                                    {(latestPrescription.medicines || []).slice(0, 4).map((med, idx) => (
                                        <li key={idx}>• {med.name} {med.dosage ? `(${med.dosage})` : ""}</li>
                                    ))}
                                </ul>
                                <Link href="/patient/history" className="inline-block mt-3 text-sm font-semibold text-teal-700 hover:underline">
                                    View full history
                                </Link>
                            </div>
                        )}
                    </section>
                </div>
            )}
        </div>
    );
}

export default function PatientDashboardPage() {
    return (
        <PatientLayout>
            <PatientHome />
        </PatientLayout>
    );
}
