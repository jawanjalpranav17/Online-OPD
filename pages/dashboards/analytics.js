import { useState, useEffect } from "react";
import axios from "axios";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { TrendingUp, Users, IndianRupee, Pill, Calendar, Activity } from "lucide-react";

const COLORS = ['#00C9A7', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function AnalyticsDashboard() {
    const [todayRevenue, setTodayRevenue] = useState({ total: 0 });
    const [patientTrend, setPatientTrend] = useState([]);
    const [footfallSummary, setFootfallSummary] = useState({ totalRegistrations: 0, scheduledAppointments: 0 });
    const [footfallData, setFootfallData] = useState([]);
    const [pharmacyData, setPharmacyData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const [revRes, trendRes, footRes, pharmRes] = await Promise.all([
                    axios.get("/api/analytics/revenue"),
                    axios.get("/api/analytics/patient-trend"),
                    axios.get("/api/analytics/footfall"),
                    axios.get("/api/analytics/pharmacy")
                ]);

                const formattedFootfall = footRes.data.footfall.byDepartment.map(item => ({
                    name: item.department || "Unassigned",
                    value: item.count
                }));

                const formattedPharmacy = pharmRes.data.fastMoving.map(item => ({
                    name: item.medicine?.name || "Unknown",
                    sales: item.quantitySold
                }));

                setTodayRevenue(revRes.data.revenue);
                setPatientTrend(trendRes.data.trend || []);
                setFootfallSummary(footRes.data.footfall);
                setFootfallData(formattedFootfall);
                setPharmacyData(formattedPharmacy);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching analytics:", error);
                setLoading(false);
            }
        };
        fetchAnalytics();
    }, []);

    // Real totals from today's revenue and the 7-day patient trend
    const totalRevenue = todayRevenue.total || 0;
    const totalNewPatients = patientTrend.reduce((sum, item) => sum + item.patients, 0);
    const totalAppointments = patientTrend.reduce((sum, item) => sum + item.appointments, 0);

    return (
        <DashboardLayout title="Hospital Analytics & 360 View">
            
            {/* KPI Cards */}
            <div className="grid gap-6 mb-8 md:grid-cols-2 xl:grid-cols-4">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col justify-between hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                        <h4 className="text-gray-500 font-medium">Today's Revenue</h4>
                        <div className="bg-emerald-100 p-2 rounded-lg text-emerald-600">
                            <IndianRupee className="w-5 h-5" />
                        </div>
                    </div>
                    <div>
                        <h3 className="text-2xl font-bold text-gray-900">₹{totalRevenue.toLocaleString()}</h3>
                        <p className="text-sm font-medium text-emerald-600 mt-1">
                            OPD + Pharmacy + IPD
                        </p>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col justify-between hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                        <h4 className="text-gray-500 font-medium">New Patients</h4>
                        <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
                            <Users className="w-5 h-5" />
                        </div>
                    </div>
                    <div>
                        <h3 className="text-2xl font-bold text-gray-900">{totalNewPatients} Patients</h3>
                        <p className="text-sm font-medium text-blue-600 mt-1 flex items-center">
                            <TrendingUp className="w-4 h-4 mr-1" /> In the last 7 days
                        </p>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col justify-between hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                        <h4 className="text-gray-500 font-medium">Appointments</h4>
                        <div className="bg-amber-100 p-2 rounded-lg text-amber-600">
                            <Calendar className="w-5 h-5" />
                        </div>
                    </div>
                    <div>
                        <h3 className="text-2xl font-bold text-gray-900">{totalAppointments}</h3>
                        <p className="text-sm font-medium text-amber-600 mt-1">
                            In the last 7 days
                        </p>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col justify-between hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                        <h4 className="text-gray-500 font-medium">Footfall Today</h4>
                        <div className="bg-violet-100 p-2 rounded-lg text-violet-600">
                            <Activity className="w-5 h-5" />
                        </div>
                    </div>
                    <div>
                        <h3 className="text-2xl font-bold text-gray-900">{footfallSummary.totalRegistrations} Registrations</h3>
                        <p className="text-sm font-medium text-violet-600 mt-1">
                            {footfallSummary.scheduledAppointments} appointments scheduled
                        </p>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center items-center py-20">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-600"></div>
                </div>
            ) : (
                <div className="grid gap-6 lg:grid-cols-2">
                    
                    {/* Patients Trend (Line Chart) */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 col-span-1 lg:col-span-2">
                        <h3 className="font-semibold text-gray-800 mb-6">Patients Trend (Last 7 Days)</h3>
                        <div className="h-80 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={patientTrend} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#6b7280'}} dy={10} />
                                    <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{fill: '#6b7280'}} />
                                    <Tooltip 
                                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Legend />
                                    <Line type="monotone" dataKey="patients" name="New Patients" stroke="#00C9A7" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                                    <Line type="monotone" dataKey="appointments" name="Appointments" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Department Footfall (Pie Chart) */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h3 className="font-semibold text-gray-800 mb-6">Footfall by Department</h3>
                        <div className="h-64 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={footfallData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {footfallData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                    <Legend verticalAlign="bottom" height={36} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Top Pharmacy Sales (Bar Chart) */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h3 className="font-semibold text-gray-800 mb-6 flex items-center">
                            <Pill className="w-5 h-5 mr-2 text-teal-600" /> Top Selling Medicines
                        </h3>
                        <div className="h-64 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={pharmacyData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f3f4f6" />
                                    <XAxis type="number" hide />
                                    <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} width={100} tick={{fill: '#6b7280', fontSize: 12}} />
                                    <Tooltip cursor={{fill: '#f9fafb'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                    <Bar dataKey="sales" name="Units Sold" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={20} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                </div>
            )}
        </DashboardLayout>
    );
}
