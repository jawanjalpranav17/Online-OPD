import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import axios from "axios";
import { CalendarPlus, FileHeart, Home, LogOut, Stethoscope } from "lucide-react";

const PatientSessionContext = createContext(null);

export function usePatientSession() {
    return useContext(PatientSessionContext);
}

export default function PatientLayout({ children, title }) {
    const router = useRouter();
    const [me, setMe] = useState(null);
    const [checked, setChecked] = useState(false);

    useEffect(() => {
        let cancelled = false;
        const load = async () => {
            try {
                const res = await axios.get("/api/auth/me");
                if (cancelled) return;
                if (res.data.role !== "patient" || !res.data.patientId) {
                    router.replace("/dashboard");
                    return;
                }
                setMe(res.data);
            } catch {
                if (!cancelled) router.replace("/patient/signin");
            } finally {
                if (!cancelled) setChecked(true);
            }
        };
        load();
        return () => { cancelled = true; };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const logout = async () => {
        await axios.post("/api/auth/logout");
        router.push("/");
    };

    const navItems = [
        { name: "Home", icon: Home, path: "/patient/dashboard" },
        { name: "Book Appointment", icon: CalendarPlus, path: "/patient/book" },
        { name: "Medical History", icon: FileHeart, path: "/patient/history" },
    ];

    if (!checked || !me) {
        return (
            <div className="min-h-screen bg-[#F4FBFA] flex justify-center items-center">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-600" />
            </div>
        );
    }

    return (
        <PatientSessionContext.Provider value={me}>
            <div className="min-h-screen bg-[#F4FBFA]">
                <header className="bg-white border-b border-teal-100 sticky top-0 z-40">
                    <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
                        <Link href="/patient/dashboard" className="flex items-center gap-3">
                            <span className="font-bold text-2xl tracking-tight">
                                <span className="text-neutral-900">Clin</span>
                                <span className="text-[#00C9A7]">X</span>
                            </span>
                            <span className="hidden sm:inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-teal-700 bg-teal-50 px-3 py-1 rounded-full">
                                <Stethoscope className="w-3.5 h-3.5" /> Patient Portal
                            </span>
                        </Link>
                        <div className="flex items-center gap-3">
                            <div className="text-right hidden sm:block">
                                <p className="text-sm font-semibold text-gray-800">{me.username}</p>
                                <p className="text-xs text-gray-500">Your health records</p>
                            </div>
                            <button
                                onClick={logout}
                                className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-red-600 border border-red-200 rounded-lg hover:bg-red-50"
                            >
                                <LogOut className="w-4 h-4" /> Logout
                            </button>
                        </div>
                    </div>
                    <nav className="max-w-6xl mx-auto px-4 pb-3 flex gap-2 overflow-x-auto">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const active = router.pathname === item.path;
                            return (
                                <Link
                                    key={item.path}
                                    href={item.path}
                                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap ${
                                        active
                                            ? "bg-[#00C9A7] text-white"
                                            : "text-gray-600 hover:bg-teal-50 hover:text-teal-800"
                                    }`}
                                >
                                    <Icon className="w-4 h-4" />
                                    {item.name}
                                </Link>
                            );
                        })}
                    </nav>
                </header>
                <main className="max-w-6xl mx-auto px-4 py-8">
                    {title && <h1 className="text-2xl font-bold text-gray-900 mb-6">{title}</h1>}
                    {children}
                </main>
            </div>
        </PatientSessionContext.Provider>
    );
}
