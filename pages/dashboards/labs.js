import { useState, useEffect } from "react";
import axios from "axios";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { FlaskConical, Search, CheckCircle, Clock, FilePlus2, ChevronRight, X, TestTube } from "lucide-react";

export default function LabsDashboard() {
    const [catalog, setCatalog] = useState([]);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [resultOrder, setResultOrder] = useState(null);
    const [resultForm, setResultForm] = useState({ results: "", status: "Completed" });
    const [showAddModal, setShowAddModal] = useState(false);
    const [testForm, setTestForm] = useState({ testName: "", category: "", price: 0, normalRange: "" });
    const [showOrderModal, setShowOrderModal] = useState(false);
    const [orderForm, setOrderForm] = useState({ patientId: "", testId: "", doctorId: "" });
    const [patients, setPatients] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [saving, setSaving] = useState(false);
    const [formError, setFormError] = useState("");

    const fetchLabData = async () => {
        try {
            const [catRes, ordRes, patRes, docRes] = await Promise.all([
                axios.get("/api/labs/catalog"),
                axios.get("/api/labs/order"),
                axios.get("/api/patients"),
                axios.get("/api/doctors")
            ]);
            setCatalog(catRes.data);
            setOrders(ordRes.data);
            setPatients(patRes.data);
            setDoctors(docRes.data);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching lab data:", error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLabData();
    }, []);

    const openResultModal = (order) => {
        setResultOrder(order);
        setResultForm({ results: order.results || "", status: order.status === "Pending" ? "Completed" : order.status });
        setFormError("");
    };

    const submitResult = async (e) => {
        e.preventDefault();
        setSaving(true);
        setFormError("");
        try {
            await axios.put(`/api/labs/report/${resultOrder._id}`, {
                results: resultForm.results,
                status: resultForm.status
            });
            setResultOrder(null);
            await fetchLabData();
        } catch (error) {
            setFormError(error.response?.data?.error || "Failed to save result.");
        }
        setSaving(false);
    };

    const openAddModal = () => {
        setTestForm({ testName: "", category: "", price: 0, normalRange: "" });
        setFormError("");
        setShowAddModal(true);
    };

    const openOrderModal = () => {
        setOrderForm({ patientId: "", testId: "", doctorId: "" });
        setFormError("");
        setShowOrderModal(true);
    };

    const submitOrder = async (e) => {
        e.preventDefault();
        setSaving(true);
        setFormError("");
        try {
            if (!orderForm.patientId || !orderForm.testId) {
                setFormError("Patient and test are required.");
                setSaving(false);
                return;
            }
            await axios.post("/api/labs/order", {
                patient: orderForm.patientId,
                test: orderForm.testId,
                doctor: orderForm.doctorId || undefined
            });
            setShowOrderModal(false);
            await fetchLabData();
        } catch (error) {
            setFormError(error.response?.data?.error || "Failed to create order.");
        }
        setSaving(false);
    };

    const submitTest = async (e) => {
        e.preventDefault();
        setSaving(true);
        setFormError("");
        try {
            if (!testForm.testName || !testForm.category) {
                setFormError("Test name and category are required.");
                setSaving(false);
                return;
            }
            await axios.post("/api/labs/catalog", {
                ...testForm,
                price: Number(testForm.price) || 0
            });
            setShowAddModal(false);
            await fetchLabData();
        } catch (error) {
            setFormError(error.response?.data?.error || "Failed to add test.");
        }
        setSaving(false);
    };

    const pendingOrders = orders.filter(o => o.status === 'Pending');
    const completedOrders = orders.filter(o => o.status === 'Completed');

    return (
        <DashboardLayout title="Laboratory Services">
            
            {/* Top Metrics */}
            <div className="grid gap-6 mb-8 md:grid-cols-3">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex items-center justify-between">
                    <div>
                        <p className="text-gray-500 font-medium mb-1">Available Tests</p>
                        <h4 className="text-3xl font-bold text-gray-900">{catalog.length}</h4>
                    </div>
                    <div className="bg-teal-100 p-4 rounded-full text-teal-600">
                        <FlaskConical className="w-8 h-8" />
                    </div>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex items-center justify-between">
                    <div>
                        <p className="text-gray-500 font-medium mb-1">Pending Reports</p>
                        <h4 className="text-3xl font-bold text-amber-600">{pendingOrders.length}</h4>
                    </div>
                    <div className="bg-amber-100 p-4 rounded-full text-amber-600">
                        <Clock className="w-8 h-8" />
                    </div>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex items-center justify-between">
                    <div>
                        <p className="text-gray-500 font-medium mb-1">Completed Today</p>
                        <h4 className="text-3xl font-bold text-emerald-600">
                            {completedOrders.filter(o => new Date(o.lastUpdated).toDateString() === new Date().toDateString()).length}
                        </h4>
                    </div>
                    <div className="bg-emerald-100 p-4 rounded-full text-emerald-600">
                        <CheckCircle className="w-8 h-8" />
                    </div>
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                
                {/* Pending Orders (Kanban Style Board) */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col h-[calc(100vh-18rem)]">
                    <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-xl">
                        <h3 className="font-semibold text-gray-800 flex items-center">
                            <Clock className="w-5 h-5 mr-2 text-amber-500" />
                            Pending Result Entry
                        </h3>
                        <button
                            onClick={openOrderModal}
                            className="flex items-center text-sm font-medium text-teal-600 hover:text-teal-800"
                        >
                            <FilePlus2 className="w-4 h-4 mr-1" /> New Order
                        </button>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto p-4 bg-gray-50/50">
                        {loading ? (
                            <p className="text-center text-gray-500 py-8">Loading pending orders...</p>
                        ) : pendingOrders.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-gray-400">
                                <CheckCircle className="w-12 h-12 mb-3 text-emerald-300" />
                                <p>All caught up! No pending results.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {pendingOrders.map(order => (
                                    <div key={order._id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:border-teal-300 transition-colors cursor-pointer group">
                                        <div className="flex justify-between items-start mb-2">
                                            <h4 className="font-medium text-gray-900">{order.test?.testName || 'Unknown Test'}</h4>
                                            <span className="text-xs text-gray-500">{new Date(order.orderDate).toLocaleDateString()}</span>
                                        </div>
                                        <div className="text-sm text-gray-500 mb-4">
                                            <p>Patient: <span className="font-medium text-gray-700">{order.patient?.name || 'Unknown'}</span></p>
                                            <p>Ref By: {order.doctor?.name || 'Unknown'}</p>
                                        </div>
                                        <div className="flex justify-end">
                                            <button
                                                onClick={() => openResultModal(order)}
                                                className="flex items-center text-sm font-medium text-teal-600 group-hover:text-teal-700 transition-colors bg-teal-50 px-3 py-1.5 rounded pr-2"
                                            >
                                                Enter Result <ChevronRight className="w-4 h-4 ml-1" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Test Catalog */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col h-[calc(100vh-18rem)]">
                    <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-xl">
                        <h3 className="font-semibold text-gray-800 flex items-center">
                            <FlaskConical className="w-5 h-5 mr-2 text-teal-600" />
                            Test Catalog
                        </h3>
                        <button
                            onClick={openAddModal}
                            className="flex items-center text-sm font-medium text-teal-600 hover:text-teal-800"
                        >
                            <FilePlus2 className="w-4 h-4 mr-1" /> Add New
                        </button>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-gray-600 uppercase bg-white border-b sticky top-0 shadow-sm z-10">
                                <tr>
                                    <th className="px-6 py-3">Test Name</th>
                                    <th className="px-6 py-3">Category</th>
                                    <th className="px-6 py-3">Price</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan="3" className="text-center py-6 text-gray-500">Loading catalog...</td></tr>
                                ) : catalog.map(test => (
                                    <tr key={test._id} className="border-b last:border-0 hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-gray-900">{test.testName}</div>
                                            <div className="text-xs text-gray-500 mt-1">Ref: {test.normalRange}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="px-2 py-1 rounded bg-gray-100 text-gray-600 text-xs font-medium">
                                                {test.category}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 font-medium text-gray-900">
                                            ₹{test.price}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>

            {/* Enter Result Modal */}
            {resultOrder && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/50" onClick={() => setResultOrder(null)}></div>
                    <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl relative z-10 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-bold text-gray-900 flex items-center">
                                <TestTube className="w-5 h-5 mr-2 text-teal-600" />
                                Enter Result
                            </h3>
                            <button onClick={() => setResultOrder(null)} className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="mb-4 p-3 bg-gray-50 rounded-lg text-sm">
                            <p className="font-medium text-gray-900">{resultOrder.test?.testName || "Unknown Test"}</p>
                            <p className="text-gray-500 mt-1">Patient: {resultOrder.patient?.name || "Unknown"}</p>
                            <p className="text-gray-500">Normal range: {resultOrder.test?.normalRange || "N/A"}</p>
                        </div>
                        {formError && <div className="mb-4 p-3 bg-red-50 text-red-700 border-l-4 border-red-400 rounded text-sm">{formError}</div>}
                        <form onSubmit={submitResult} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Results</label>
                                <textarea
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                                    rows="4"
                                    placeholder="Enter test results..."
                                    value={resultForm.results}
                                    onChange={(e) => setResultForm({ ...resultForm, results: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                <select
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                                    value={resultForm.status}
                                    onChange={(e) => setResultForm({ ...resultForm, status: e.target.value })}
                                >
                                    <option value="Pending">Pending</option>
                                    <option value="In Progress">In Progress</option>
                                    <option value="Completed">Completed</option>
                                </select>
                            </div>
                            <button
                                type="submit"
                                disabled={saving}
                                className="w-full py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
                            >
                                {saving ? "Saving..." : "Save Result"}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* New Lab Order Modal */}
            {showOrderModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/50" onClick={() => setShowOrderModal(false)}></div>
                    <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl relative z-10 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-bold text-gray-900">New Lab Order</h3>
                            <button onClick={() => setShowOrderModal(false)} className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        {formError && <div className="mb-4 p-3 bg-red-50 text-red-700 border-l-4 border-red-400 rounded text-sm">{formError}</div>}
                        <form onSubmit={submitOrder} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Patient *</label>
                                <select
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                                    value={orderForm.patientId}
                                    onChange={(e) => setOrderForm({ ...orderForm, patientId: e.target.value })}
                                    required
                                >
                                    <option value="">Select patient...</option>
                                    {patients.map(p => (
                                        <option key={p._id} value={p._id}>{p.name} ({p.opdNumber || "No OPD"})</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Test *</label>
                                <select
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                                    value={orderForm.testId}
                                    onChange={(e) => setOrderForm({ ...orderForm, testId: e.target.value })}
                                    required
                                >
                                    <option value="">Select test...</option>
                                    {catalog.map(t => (
                                        <option key={t._id} value={t._id}>{t.testName} (₹{t.price})</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Referring Doctor</label>
                                <select
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                                    value={orderForm.doctorId}
                                    onChange={(e) => setOrderForm({ ...orderForm, doctorId: e.target.value })}
                                >
                                    <option value="">Select doctor (optional)...</option>
                                    {doctors.map(d => (
                                        <option key={d._id} value={d._id}>{d.name} - {d.department}</option>
                                    ))}
                                </select>
                            </div>
                            <button
                                type="submit"
                                disabled={saving}
                                className="w-full py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
                            >
                                {saving ? "Creating..." : "Create Order"}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Add Test Modal */}
            {showAddModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/50" onClick={() => setShowAddModal(false)}></div>
                    <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl relative z-10 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-bold text-gray-900">Add Lab Test</h3>
                            <button onClick={() => setShowAddModal(false)} className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        {formError && <div className="mb-4 p-3 bg-red-50 text-red-700 border-l-4 border-red-400 rounded text-sm">{formError}</div>}
                        <form onSubmit={submitTest} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Test Name *</label>
                                    <input
                                        type="text"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                                        value={testForm.testName}
                                        onChange={(e) => setTestForm({ ...testForm, testName: e.target.value })}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Blood, Urine, Imaging"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                                        value={testForm.category}
                                        onChange={(e) => setTestForm({ ...testForm, category: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹)</label>
                                    <input
                                        type="number"
                                        min="0"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                                        value={testForm.price}
                                        onChange={(e) => setTestForm({ ...testForm, price: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Normal Range</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. 70-110 mg/dL"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                                        value={testForm.normalRange}
                                        onChange={(e) => setTestForm({ ...testForm, normalRange: e.target.value })}
                                    />
                                </div>
                            </div>
                            <button
                                type="submit"
                                disabled={saving}
                                className="w-full py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
                            >
                                {saving ? "Saving..." : "Add Test"}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}
