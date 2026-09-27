import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import axios from "axios";
import { 
    LayoutDashboard, 
    Stethoscope, 
    Pill, 
    FlaskConical, 
    BedDouble, 
    FileText, 
    BarChart3, 
    BriefcaseMedical,
    LogOut,
    Menu,
    X,
    User,
    Bell
} from "lucide-react";

export default function DashboardLayout({ children, title }) {
    const router = useRouter();
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        axios.get("/api/auth/me")
            .then((res) => {
                if (res.data.role === "patient") {
                    router.replace("/patient/dashboard");
                }
            })
            .catch(() => {});
    }, [router]);

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 1024) {
                setSidebarOpen(false);
                setIsMobile(true);
            } else {
                setSidebarOpen(true);
                setIsMobile(false);
            }
        };

        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const logout = async () => {
        try {
            await axios.post("/api/auth/logout");
            router.push("/auth/signin");
        } catch (error) {
            console.error("Logout failed:", error);
        }
    };

    const navItems = [
        { name: "Overview", icon: LayoutDashboard, path: "/admin-dashboard" },
        { name: "OPD", icon: Stethoscope, path: "/dashboards/opd" },
        { name: "EMR", icon: FileText, path: "/dashboards/emr" },
        { name: "Pharmacy", icon: Pill, path: "/dashboards/pharmacy" },
        { name: "Laboratory", icon: FlaskConical, path: "/dashboards/labs" },
        { name: "IPD", icon: BedDouble, path: "/dashboards/ipd" },
        { name: "CMS & Website", icon: FileText, path: "/dashboards/cms" },
        { name: "Analytics", icon: BarChart3, path: "/dashboards/analytics" },
        { name: "Hiring", icon: BriefcaseMedical, path: "/dashboards/hiring" },
    ];

    return (
        <div className="flex h-screen bg-slate-50 overflow-hidden">
            {/* Sidebar */}
            <aside 
                className={`fixed inset-y-0 left-0 bg-[#002D27] text-white w-64 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col 
                ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:static lg:translate-x-0 h-full flex-shrink-0 scrollbar-hide`}
            >
                <div className="flex items-center justify-between p-6 border-b border-white/10 flex-shrink-0">
                    <h1 className="text-2xl font-bold tracking-tight">Clin<span className="text-[#00C9A7]">X</span> Portal</h1>
                    {isMobile && (
                        <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-white hover:text-gray-200">
                            <X className="w-6 h-6" />
                        </button>
                    )}
                </div>

                <nav className="flex-1 overflow-y-auto overflow-x-hidden py-4 space-y-2 custom-scrollbar">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = router.pathname.includes(item.path);
                        return (
                            <Link 
                                key={item.name} 
                                href={item.path}
                                className={`flex items-center px-6 py-3 text-sm font-medium transition-all duration-200 group
                                    ${isActive 
                                        ? "bg-white/20 border-l-4 border-white text-white shadow-lg" 
                                        : "text-teal-50 hover:bg-white/10 hover:text-white"
                                    }`}
                            >
                                <Icon className={`w-5 h-5 mr-3 transition-transform duration-200 group-hover:scale-110 ${isActive ? "text-white" : ""}`} />
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-white/10 flex-shrink-0">
                    <button 
                        onClick={logout}
                        className="flex items-center w-full px-4 py-3 text-sm font-semibold text-white transition-all transform hover:bg-white/10 hover:translate-x-1 rounded-xl active:scale-95 group"
                    >
                        <LogOut className="w-5 h-5 mr-3 transition-transform group-hover:-rotate-12" />
                        Logout
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden relative">
                {/* Navbar */}
                <header className="bg-white shadow-sm border-b px-4 lg:px-8 py-3 flex items-center justify-between z-30 flex-shrink-0">
                    <div className="flex items-center">
                        <button 
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="mr-4 lg:hidden text-gray-500 hover:text-gray-700 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <Menu className="w-6 h-6" />
                        </button>
                        <h2 className="text-xl font-bold text-gray-800 tracking-tight">{title || "Dashboard"}</h2>
                    </div>

                    <div className="flex items-center space-x-4">
                        <button
                            onClick={() => router.push("/dashboards/cms")}
                            className="p-2 text-gray-400 hover:text-teal-600 hover:bg-teal-50 rounded-full transition-all transform hover:rotate-12"
                            title="Notices & announcements"
                        >
                            <Bell className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => router.push("/admin-dashboard")}
                            className="h-10 w-10 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-bold border border-teal-200 hover:shadow-md hover:border-teal-400 transition-all transform hover:scale-110 active:scale-90"
                            title="Account overview"
                        >
                            <User className="w-5 h-5" />
                        </button>
                    </div>
                </header>

                {/* Page content scroll area */}
                <main className="flex-1 overflow-y-auto bg-slate-50 p-4 lg:p-8 scroll-smooth">
                    <div className="max-w-7xl mx-auto">
                        {children}
                    </div>
                </main>
            </div>

            {/* Mobile Overlay */}
            {sidebarOpen && isMobile && (
                <div 
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}
        </div>
    );
}
