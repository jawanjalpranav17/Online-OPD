import { useEffect, useState } from "react";
import Link from "next/link";
import axios from "axios";
import PatientLayout, { usePatientSession } from "@/components/layouts/PatientLayout";
import {
    Activity, BedDouble, CalendarDays, ChevronRight, Clock, FileText,
    FlaskConical, HeartPulse, IndianRupee, Pill, ShoppingCart,
} from "lucide-react";

const TABS = [
    { id: "overview", label: "Overview", icon: Activity },
    { id: "appointments", label: "Appointments", icon: CalendarDays },
    { id: "prescriptions", label: "Prescriptions", icon: Pill },
    { id: "lab", label: "Lab Reports", icon: FlaskConical },
    { id: "admissions", label: "Admissions", icon: BedDouble },
    { id: "pharmacy", label: "Pharmacy", icon: ShoppingCart },
];

const fmtDate = (value) =>
    value
        ? new Date(value).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" })
        : "—";

const fmtTime = (value) =>
    value ? new Date(value).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) : "";

const statusStyles = {
    Scheduled: "bg-blue-100 text-blue-700",
    Completed: "bg-emerald-100 text-emerald-700",
    Cancelled: "bg-red-100 text-red-700",
    Pending: "bg-amber-100 text-amber-700",
    "In Progress": "bg-blue-100 text-blue-700",
    Admitted: "bg-blue-100 text-blue-700",
    Discharged: "bg-emerald-100 text-emerald-700",
    Paid: "bg-emerald-100 text-emerald-700",
    Unpaid: "bg-amber-100 text-amber-700",
};

function StatusBadge({ status }) {
    return (
        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${statusStyles[status] || "bg-gray-100 text-gray-600"}`}>
            {status}
        </span>
    );
}

function EmptyState({ text }) {
    return (
        <div className="bg-white rounded-xl border border-dashed border-gray-300 p-8 text-center text-gray-500 text-sm">
            {text}
        </div>
    );
}

function SectionCard({ date, title, subtitle, right, children }) {
    return (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                    <p className="font-semibold text-gray-900">{title}</p>
                    <p className="text-xs text-gray-500">{subtitle}</p>
                </div>
                <div className="text-right shrink-0">
                    {right}
                    <p className="text-xs text-gray-400 mt-1">{fmtDate(date)}</p>
                </div>
            </div>
            {children}
        </div>
    );
}

function PatientHistoryView() {
    const me = usePatientSession();
    const [history, setHistory] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("overview");

    useEffect(() => {
        const load = async () => {
            try {
                const res = await axios.get("/api/patient/history");
                setHistory(res.data);
            } catch (error) {
                console.error("Failed to load medical history:", error);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const h = history || { patient: null, appointments: [], prescriptions: [], labOrders: [], admissions: [], pharmacySales: [] };
    const patient = h.patient;

    const pharmacySpend = (h.pharmacySales || []).reduce((sum, s) => sum + (s.finalAmount || 0), 0);

    const stats = [
        { label: "Appointments", value: (h.appointments || []).length, icon: CalendarDays, tint: "bg-blue-50 text-blue-600" },
        { label: "Prescriptions", value: (h.prescriptions || []).length, icon: Pill, tint: "bg-teal-50 text-teal-600" },
        { label: "Lab Tests", value: (h.labOrders || []).length, icon: FlaskConical, tint: "bg-purple-50 text-purple-600" },
        { label: "Admissions", value: (h.admissions || []).length, icon: BedDouble, tint: "bg-amber-50 text-amber-600" },
        { label: "Pharmacy Spend", value: `₹${pharmacySpend.toLocaleString("en-IN")}`, icon: IndianRupee, tint: "bg-emerald-50 text-emerald-600" },
    ];

    const activity = []
        .concat((h.appointments || []).map((a) => ({ type: "appointment", date: a.appointmentDate, item: a })))
        .concat((h.prescriptions || []).map((r) => ({ type: "prescription", date: r.creationDate, item: r })))
        .concat((h.labOrders || []).map((l) => ({ type: "lab", date: l.orderDate, item: l })))
        .concat((h.admissions || []).map((a) => ({ type: "admission", date: a.admittedAt, item: a })))
        .concat((h.pharmacySales || []).map((s) => ({ type: "pharmacy", date: s.saleDate, item: s })))
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 6);

    const activityMeta = {
        appointment: { icon: CalendarDays, tint: "bg-blue-50 text-blue-600", text: (i) => `Appointment with ${i.doctor?.name || "doctor"} (${i.status})` },
        prescription: { icon: Pill, tint: "bg-teal-50 text-teal-600", text: (i) => `Prescription by ${i.doctor?.name || "doctor"} — ${(i.diagnosis || []).join(", ") || "No diagnosis recorded"}` },
        lab: { icon: FlaskConical, tint: "bg-purple-50 text-purple-600", text: (i) => `${i.test?.testName || "Lab test"} (${i.status})` },
        admission: { icon: BedDouble, tint: "bg-amber-50 text-amber-600", text: (i) => `Admission — ${i.bed?.wardName || "Ward"} (${i.status})` },
        pharmacy: { icon: ShoppingCart, tint: "bg-emerald-50 text-emerald-600", text: (i) => `Pharmacy purchase of ₹${(i.finalAmount || 0).toLocaleString("en-IN")}` },
    };

    const renderTab = () => {
        switch (activeTab) {
            case "appointments":
                return (
                    <div className="space-y-4">
                        {(h.appointments || []).length === 0 ? (
                            <EmptyState text="No appointments yet. Book one from the doctors list." />
                        ) : (
                            h.appointments.map((a) => (
                                <SectionCard
                                    key={a._id}
                                    date={a.appointmentDate}
                                    title={a.doctor?.name || "Doctor"}
                                    subtitle={a.doctor?.department}
                                    right={<StatusBadge status={a.status} />}
                                >
                                    <div className="flex items-center gap-4 text-xs text-gray-600">
                                        <span className="flex items-center gap-1">
                                            <CalendarDays className="w-3.5 h-3.5" /> {fmtDate(a.appointmentDate)}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Clock className="w-3.5 h-3.5" /> {fmtTime(a.appointmentDate)}
                                        </span>
                                        {a.queueNumber != null && <span className="text-gray-400">Queue #{a.queueNumber}</span>}
                                    </div>
                                    {a.notes && <p className="text-xs text-gray-400 mt-2 italic">&ldquo;{a.notes}&rdquo;</p>}
                                </SectionCard>
                            ))
                        )}
                    </div>
                );
            case "prescriptions":
                return (
                    <div className="space-y-4">
                        {(h.prescriptions || []).length === 0 ? (
                            <EmptyState text="No prescriptions on record yet." />
                        ) : (
                            h.prescriptions.map((r) => (
                                <SectionCard
                                    key={r._id}
                                    date={r.creationDate}
                                    title={r.doctor?.name || "Doctor"}
                                    subtitle={r.doctor?.department}
                                    right={<FileText className="w-5 h-5 text-teal-500" />}
                                >
                                    {r.diagnosis?.length > 0 && (
                                        <div className="mb-2">
                                            <p className="text-xs font-semibold text-gray-500 mb-1">Diagnosis</p>
                                            <div className="flex flex-wrap gap-1.5">
                                                {r.diagnosis.map((d, i) => (
                                                    <span key={i} className="px-2 py-0.5 bg-red-50 text-red-600 text-xs rounded-full">{d}</span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    {r.symptoms?.length > 0 && (
                                        <div className="mb-2">
                                            <p className="text-xs font-semibold text-gray-500 mb-1">Symptoms</p>
                                            <div className="flex flex-wrap gap-1.5">
                                                {r.symptoms.map((s, i) => (
                                                    <span key={i} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">{s}</span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    {r.vitals && Object.values(r.vitals).some(Boolean) && (
                                        <div className="mb-3 grid grid-cols-2 sm:grid-cols-5 gap-2">
                                            {Object.entries(r.vitals)
                                                .filter(([, v]) => v)
                                                .map(([k, v]) => (
                                                    <div key={k} className="bg-slate-50 rounded-lg p-2 text-center">
                                                        <p className="text-[10px] uppercase tracking-wide text-gray-400">{k.replace(/([A-Z])/g, " $1")}</p>
                                                        <p className="text-sm font-semibold text-gray-700">{v}</p>
                                                    </div>
                                                ))}
                                        </div>
                                    )}
                                    {r.medicines?.length > 0 && (
                                        <div className="border border-gray-100 rounded-lg overflow-hidden">
                                            <table className="w-full text-xs">
                                                <thead className="bg-slate-50 text-gray-500">
                                                    <tr>
                                                        <th className="text-left px-3 py-2 font-semibold">Medicine</th>
                                                        <th className="text-left px-3 py-2 font-semibold">Dosage</th>
                                                        <th className="text-left px-3 py-2 font-semibold">Frequency</th>
                                                        <th className="text-left px-3 py-2 font-semibold">Duration</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {r.medicines.map((m, i) => (
                                                        <tr key={i} className="border-t border-gray-100">
                                                            <td className="px-3 py-2 text-gray-800 font-medium">{m.name}</td>
                                                            <td className="px-3 py-2 text-gray-600">{m.dosage || "—"}</td>
                                                            <td className="px-3 py-2 text-gray-600">{m.frequency || "—"}</td>
                                                            <td className="px-3 py-2 text-gray-600">{m.duration || "—"}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                    {r.clinicalNotes && <p className="text-xs text-gray-500 mt-2 italic">&ldquo;{r.clinicalNotes}&rdquo;</p>}
                                    {r.nextFollowUp && (
                                        <p className="text-xs text-teal-600 font-semibold mt-2">Next follow-up: {fmtDate(r.nextFollowUp)}</p>
                                    )}
                                </SectionCard>
                            ))
                        )}
                    </div>
                );
            case "lab":
                return (
                    <div className="space-y-4">
                        {(h.labOrders || []).length === 0 ? (
                            <EmptyState text="No lab tests ordered yet." />
                        ) : (
                            h.labOrders.map((l) => (
                                <SectionCard
                                    key={l._id}
                                    date={l.orderDate}
                                    title={l.test?.testName || "Lab Test"}
                                    subtitle={`${l.test?.category || "Test"} · Ordered by ${l.doctor?.name || "—"}`}
                                    right={<StatusBadge status={l.status} />}
                                >
                                    <div className="grid grid-cols-2 gap-2 text-xs mb-2">
                                        <div className="bg-slate-50 rounded-lg p-2">
                                            <p className="text-gray-400">Normal range</p>
                                            <p className="font-medium text-gray-700">{l.test?.normalRange || "—"}</p>
                                        </div>
                                        <div className="bg-slate-50 rounded-lg p-2">
                                            <p className="text-gray-400">Payment</p>
                                            <p className="font-medium text-gray-700">{l.paymentStatus}</p>
                                        </div>
                                    </div>
                                    {l.results && (
                                        <p className="text-xs text-gray-600 bg-teal-50 rounded-lg p-2.5">
                                            <span className="font-semibold text-teal-700">Result: </span>{l.results}
                                        </p>
                                    )}
                                </SectionCard>
                            ))
                        )}
                    </div>
                );
            case "admissions":
                return (
                    <div className="space-y-4">
                        {(h.admissions || []).length === 0 ? (
                            <EmptyState text="No hospital admissions on record." />
                        ) : (
                            h.admissions.map((a) => (
                                <SectionCard
                                    key={a._id}
                                    date={a.admittedAt}
                                    title={`${a.bed?.wardName || "Ward"} · Bed ${a.bed?.bedNumber || "—"}`}
                                    subtitle={`Admitted under ${a.admittingDoctor?.name || "—"}`}
                                    right={<StatusBadge status={a.status} />}
                                >
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs mb-2">
                                        <div className="bg-slate-50 rounded-lg p-2">
                                            <p className="text-gray-400">Admitted</p>
                                            <p className="font-medium text-gray-700">{fmtDate(a.admittedAt)}</p>
                                        </div>
                                        <div className="bg-slate-50 rounded-lg p-2">
                                            <p className="text-gray-400">Discharged</p>
                                            <p className="font-medium text-gray-700">{fmtDate(a.dischargedAt)}</p>
                                        </div>
                                        <div className="bg-slate-50 rounded-lg p-2">
                                            <p className="text-gray-400">Total bill</p>
                                            <p className="font-medium text-gray-700">₹{(a.totalBill || 0).toLocaleString("en-IN")}</p>
                                        </div>
                                        <div className="bg-slate-50 rounded-lg p-2">
                                            <p className="text-gray-400">Payment</p>
                                            <p className="font-medium text-gray-700">{a.paymentStatus}</p>
                                        </div>
                                    </div>
                                    {a.nursingNotes && <p className="text-xs text-gray-500 italic">&ldquo;{a.nursingNotes}&rdquo;</p>}
                                </SectionCard>
                            ))
                        )}
                    </div>
                );
            case "pharmacy":
                return (
                    <div className="space-y-4">
                        {(h.pharmacySales || []).length === 0 ? (
                            <EmptyState text="No pharmacy purchases yet." />
                        ) : (
                            h.pharmacySales.map((s) => (
                                <SectionCard
                                    key={s._id}
                                    date={s.saleDate}
                                    title={`Purchase · ${s.items?.length || 0} item(s)`}
                                    subtitle={`Paid via ${s.paymentMethod}`}
                                    right={
                                        <p className="text-sm font-bold text-gray-900">
                                            ₹{(s.finalAmount || 0).toLocaleString("en-IN")}
                                        </p>
                                    }
                                >
                                    <div className="divide-y divide-gray-100">
                                        {s.items.map((it, i) => (
                                            <div key={i} className="flex items-center justify-between py-1.5 text-xs">
                                                <span className="text-gray-700 font-medium">{it.medicine?.name || "Medicine"}</span>
                                                <span className="text-gray-500">× {it.quantity} · ₹{(it.totalPrice || 0).toLocaleString("en-IN")}</span>
                                            </div>
                                        ))}
                                    </div>
                                    {s.discount > 0 && (
                                        <p className="text-xs text-emerald-600 mt-2">Discount applied: ₹{s.discount.toLocaleString("en-IN")}</p>
                                    )}
                                </SectionCard>
                            ))
                        )}
                    </div>
                );
            default:
                return (
                    <div className="space-y-6">
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                            {stats.map((s) => (
                                <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-4 text-center">
                                    <div className={`w-9 h-9 rounded-full flex items-center justify-center mx-auto mb-2 ${s.tint}`}>
                                        <s.icon className="w-4.5 h-4.5" />
                                    </div>
                                    <p className="text-lg font-bold text-gray-900">{s.value}</p>
                                    <p className="text-[11px] text-gray-500">{s.label}</p>
                                </div>
                            ))}
                        </div>

                        <div>
                            <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-3 flex items-center gap-2">
                                <Activity className="w-4 h-4 text-teal-600" /> Recent Activity
                            </h3>
                            {activity.length === 0 ? (
                                <EmptyState text="No medical history yet. Your records will appear here as you visit the hospital." />
                            ) : (
                                <div className="space-y-2">
                                    {activity.map((a, i) => {
                                        const meta = activityMeta[a.type];
                                        return (
                                            <div key={i} className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3">
                                                <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${meta.tint}`}>
                                                    <meta.icon className="w-4 h-4" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm text-gray-800 truncate">{meta.text(a.item)}</p>
                                                    <p className="text-xs text-gray-400">{fmtDate(a.date)}</p>
                                                </div>
                                                <ChevronRight className="w-4 h-4 text-gray-300 shrink-0" />
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                );
        }
    };

    return (
        <>
            <section className="bg-gradient-to-r from-[#002D27] to-[#0A5C52] text-white rounded-2xl p-6 md:p-8 mb-6">
                <p className="text-teal-200 text-sm font-semibold uppercase tracking-wider mb-2">Medical History</p>
                <h2 className="text-3xl font-bold mb-2">{patient?.name || me?.username}</h2>
                <div className="flex flex-wrap gap-4 mt-4 text-sm">
                    {patient?.age != null && (
                        <span className="bg-white/10 px-3 py-1.5 rounded-lg">{patient.age}y · {patient.gender}</span>
                    )}
                    {patient?.department && (
                        <span className="bg-white/10 px-3 py-1.5 rounded-lg">Dept: {patient.department}</span>
                    )}
                    {patient?.doctor?.name && (
                        <span className="bg-white/10 px-3 py-1.5 rounded-lg">Assigned: {patient.doctor.name}</span>
                    )}
                    {patient?.opdNumber && (
                        <span className="bg-white/10 px-3 py-1.5 rounded-lg">OPD: {patient.opdNumber}</span>
                    )}
                </div>
            </section>

            <div className="flex gap-2 overflow-x-auto pb-2 mb-6">
                {TABS.map((t) => (
                    <button
                        key={t.id}
                        onClick={() => setActiveTab(t.id)}
                        className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold whitespace-nowrap transition-all ${
                            activeTab === t.id
                                ? "bg-[#00C9A7] text-white shadow-md shadow-teal-200"
                                : "bg-white text-gray-600 border border-gray-200 hover:border-teal-300 hover:text-teal-600"
                        }`}
                    >
                        <t.icon className="w-4 h-4" /> {t.label}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="flex justify-center py-16">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600" />
                </div>
            ) : (
                renderTab()
            )}

            <p className="mt-8 text-center text-xs text-gray-400">
                Need a new consultation?{" "}
                <Link href="/patient/book" className="text-teal-600 font-semibold hover:underline">
                    Book an OPD appointment
                </Link>
            </p>
        </>
    );
}

export default function PatientHistoryPage() {
    return (
        <PatientLayout title="Medical History">
            <PatientHistoryView />
        </PatientLayout>
    );
}
