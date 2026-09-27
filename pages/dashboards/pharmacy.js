import { useState, useEffect } from "react";
import axios from "axios";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Pill, Search, AlertTriangle, Plus, ShoppingCart, IndianRupee, Minus, Trash2, X, PackagePlus } from "lucide-react";

export default function PharmacyDashboard() {
    const [inventory, setInventory] = useState([]);
    const [alerts, setAlerts] = useState({ lowStockAlerts: [], expiryAlerts: [] });
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(true);
    const [cart, setCart] = useState({}); // { medicineId: quantity }
    const [discount, setDiscount] = useState(0);
    const [paymentMethod, setPaymentMethod] = useState("Cash");
    const [patientId, setPatientId] = useState("");
    const [patients, setPatients] = useState([]);
    const [saleError, setSaleError] = useState("");
    const [saleSuccess, setSaleSuccess] = useState("");
    const [completing, setCompleting] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [saving, setSaving] = useState(false);
    const [formError, setFormError] = useState("");
    const [medicineForm, setMedicineForm] = useState({
        name: "", genericName: "", manufacturer: "", batchNumber: "",
        expiryDate: "", mrp: 0, stockQuantity: 0, reorderLevel: 10
    });

    const fetchPharmacyData = async () => {
        try {
            const [invRes, alertRes, patRes] = await Promise.all([
                axios.get("/api/pharmacy/inventory"),
                axios.get("/api/pharmacy/alerts"),
                axios.get("/api/patients")
            ]);
            setInventory(invRes.data);
            setAlerts(alertRes.data);
            setPatients(patRes.data);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching pharmacy data:", error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPharmacyData();
    }, []);

    const filteredInventory = inventory.filter(item => 
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        item.genericName?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const alertCount = (alerts.lowStockAlerts?.length || 0) + (alerts.expiryAlerts?.length || 0);

    const addToCart = (item) => {
        const current = cart[item._id] || 0;
        if (current + 1 > item.stockQuantity) {
            setSaleError(`Only ${item.stockQuantity} units of ${item.name} in stock.`);
            return;
        }
        setSaleError("");
        setSaleSuccess("");
        setCart(prev => ({ ...prev, [item._id]: current + 1 }));
    };

    const changeQty = (itemId, delta) => {
        setSaleError("");
        setSaleSuccess("");
        setCart(prev => {
            const next = { ...prev };
            const current = next[itemId] || 0;
            const item = inventory.find(i => i._id === itemId);
            const newQty = Math.max(0, Math.min(item?.stockQuantity || 0, current + delta));
            if (newQty === 0) delete next[itemId];
            else next[itemId] = newQty;
            return next;
        });
    };

    const removeFromCart = (itemId) => {
        setCart(prev => {
            const next = { ...prev };
            delete next[itemId];
            return next;
        });
    };

    const cartItems = Object.entries(cart)
        .map(([id, qty]) => ({ item: inventory.find(i => i._id === id), qty }))
        .filter(entry => entry.item);

    const subtotal = cartItems.reduce((sum, { item, qty }) => sum + item.mrp * qty, 0);
    const finalTotal = Math.max(subtotal - (Number(discount) || 0), 0);

    const completeSale = async () => {
        if (cartItems.length === 0) {
            setSaleError("Cart is empty. Add items from inventory first.");
            return;
        }
        setCompleting(true);
        setSaleError("");
        setSaleSuccess("");
        try {
            await axios.post("/api/pharmacy/dispense", {
                items: cartItems.map(({ item, qty }) => ({ medicine: item._id, quantity: qty })),
                patient: patientId || undefined,
                discount: Number(discount) || 0,
                paymentMethod
            });
            setSaleSuccess(`Sale completed. Total: ₹${finalTotal}`);
            setCart({});
            setDiscount(0);
            setPatientId("");
            await fetchPharmacyData();
        } catch (error) {
            setSaleError(error.response?.data?.error || "Failed to complete sale.");
        }
        setCompleting(false);
    };

    const openAddModal = () => {
        setMedicineForm({
            name: "", genericName: "", manufacturer: "", batchNumber: "",
            expiryDate: "", mrp: 0, stockQuantity: 0, reorderLevel: 10
        });
        setFormError("");
        setShowAddModal(true);
    };

    const submitMedicine = async (e) => {
        e.preventDefault();
        setSaving(true);
        setFormError("");
        try {
            if (!medicineForm.name || !medicineForm.batchNumber || !medicineForm.expiryDate) {
                setFormError("Name, batch number and expiry date are required.");
                setSaving(false);
                return;
            }
            await axios.post("/api/pharmacy/inventory", {
                ...medicineForm,
                mrp: Number(medicineForm.mrp) || 0,
                stockQuantity: Number(medicineForm.stockQuantity) || 0,
                reorderLevel: Number(medicineForm.reorderLevel) || 0
            });
            setShowAddModal(false);
            await fetchPharmacyData();
        } catch (error) {
            setFormError(error.response?.data?.error || "Failed to add medicine.");
        }
        setSaving(false);
    };

    return (
        <DashboardLayout title="Pharmacy Management">
            
            {/* Quick Alerts Banner */}
            {alertCount > 0 && (
                <div className="mb-6 bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-lg shadow-sm">
                    <div className="flex items-center">
                        <AlertTriangle className="text-amber-500 w-6 h-6 mr-3" />
                        <div>
                            <h3 className="text-amber-800 font-medium">Inventory Alerts</h3>
                            <p className="text-amber-700 text-sm mt-1">
                                {alertCount} items require attention (Low stock or near expiry).
                            </p>
                        </div>
                    </div>
                </div>
            )}

            <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
                
                {/* Inventory List */}
                <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                        <h3 className="font-semibold text-gray-800 flex items-center">
                            <Pill className="w-5 h-5 mr-2 text-teal-600" />
                            Inventory
                        </h3>
                        <div className="flex items-center gap-3">
                            <div className="relative w-64">
                                <input 
                                    type="text"
                                    placeholder="Search inventory..."
                                    className="w-full pl-9 pr-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2" />
                            </div>
                            <button
                                onClick={openAddModal}
                                className="flex items-center text-sm font-medium text-teal-600 hover:text-teal-800 bg-teal-50 px-3 py-1.5 rounded-md"
                            >
                                <PackagePlus className="w-4 h-4 mr-1" /> Add Medicine
                            </button>
                        </div>
                    </div>
                    
                    <div className="overflow-x-auto h-[calc(100vh-16rem)]">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-gray-600 uppercase bg-white border-b sticky top-0 shadow-sm z-10">
                                <tr>
                                    <th className="px-6 py-3">Medicine</th>
                                    <th className="px-6 py-3">Batch</th>
                                    <th className="px-6 py-3">Stock</th>
                                    <th className="px-6 py-3">Price</th>
                                    <th className="px-6 py-3">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan="5" className="text-center py-6 text-gray-500">Loading inventory...</td></tr>
                                ) : filteredInventory.length === 0 ? (
                                    <tr><td colSpan="5" className="text-center py-6 text-gray-500">No medicines in inventory.</td></tr>
                                ) : filteredInventory.map(item => (
                                    <tr key={item._id} className="border-b last:border-0 hover:bg-gray-50">
                                        <td className="px-6 py-3">
                                            <div className="font-medium text-gray-900">{item.name}</div>
                                            <div className="text-xs text-gray-500">{item.genericName}</div>
                                        </td>
                                        <td className="px-6 py-3 text-gray-600">{item.batchNumber}</td>
                                        <td className="px-6 py-3">
                                            <span className={`px-2 py-1 rounded text-xs font-medium ${item.stockQuantity <= item.reorderLevel ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}>
                                                {item.stockQuantity} units
                                            </span>
                                        </td>
                                        <td className="px-6 py-3 text-gray-900 font-medium">₹{item.mrp}</td>
                                        <td className="px-6 py-3">
                                            <button
                                                onClick={() => addToCart(item)}
                                                disabled={item.stockQuantity <= 0}
                                                className="text-teal-600 hover:text-teal-800 p-1 bg-teal-50 rounded disabled:opacity-40 disabled:cursor-not-allowed"
                                                title={item.stockQuantity <= 0 ? "Out of stock" : "Add to sale"}
                                            >
                                                <Plus className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Billing / POS */}
                <div className="lg:col-span-1 bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col h-[calc(100vh-10rem)] lg:h-auto">
                    <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-teal-600 text-white rounded-t-xl">
                        <h3 className="font-semibold flex items-center">
                            <ShoppingCart className="w-5 h-5 mr-2" />
                            Current Sale
                        </h3>
                        <span className="text-xs bg-white/20 px-2 py-1 rounded-full">{cartItems.length} items</span>
                    </div>
                    
                    <div className="flex-1 p-4 overflow-y-auto border-b border-gray-100">
                        {cartItems.length === 0 ? (
                            <div className="text-center text-gray-400 h-full flex flex-col items-center justify-center">
                                <ShoppingCart className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                <p>Cart is empty</p>
                                <p className="text-xs mt-1">Use the + button in inventory to add items</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {cartItems.map(({ item, qty }) => (
                                    <div key={item._id} className="flex items-center justify-between bg-gray-50 rounded-lg p-2">
                                        <div className="min-w-0">
                                            <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
                                            <p className="text-xs text-gray-500">₹{item.mrp} × {qty} = ₹{item.mrp * qty}</p>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <button onClick={() => changeQty(item._id, -1)} className="p-1 text-gray-500 hover:text-teal-600 bg-white rounded border border-gray-200">
                                                <Minus className="w-3.5 h-3.5" />
                                            </button>
                                            <span className="text-sm font-semibold w-6 text-center">{qty}</span>
                                            <button onClick={() => changeQty(item._id, 1)} className="p-1 text-gray-500 hover:text-teal-600 bg-white rounded border border-gray-200">
                                                <Plus className="w-3.5 h-3.5" />
                                            </button>
                                            <button onClick={() => removeFromCart(item._id)} className="p-1 text-gray-400 hover:text-red-600">
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    
                    <div className="p-4 bg-gray-50 rounded-b-xl">
                        <div className="mb-3">
                            <label className="block text-xs font-medium text-gray-600 mb-1">Patient (optional)</label>
                            <select
                                className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                                value={patientId}
                                onChange={(e) => setPatientId(e.target.value)}
                            >
                                <option value="">Walk-in customer</option>
                                {patients.map(p => (
                                    <option key={p._id} value={p._id}>{p.name} ({p.opdNumber || "No OPD"})</option>
                                ))}
                            </select>
                        </div>
                        <div className="flex justify-between text-sm mb-2">
                            <span className="text-gray-600">Subtotal</span>
                            <span className="font-medium">₹{subtotal.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-sm mb-2 items-center">
                            <span className="text-gray-600">Discount (₹)</span>
                            <input
                                type="number"
                                min="0"
                                className="w-24 px-2 py-1 border border-gray-300 rounded-md text-sm text-right focus:outline-none focus:ring-1 focus:ring-teal-500"
                                value={discount}
                                onChange={(e) => setDiscount(e.target.value)}
                            />
                        </div>
                        <div className="flex justify-between text-sm mb-2 items-center">
                            <span className="text-gray-600">Payment</span>
                            <select
                                className="px-2 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                                value={paymentMethod}
                                onChange={(e) => setPaymentMethod(e.target.value)}
                            >
                                <option value="Cash">Cash</option>
                                <option value="Card">Card</option>
                                <option value="UPI">UPI</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                        <div className="flex justify-between text-lg font-bold text-gray-900 border-t pt-2 mb-3">
                            <span>Total</span>
                            <span>₹{finalTotal.toLocaleString()}</span>
                        </div>
                        {saleError && <p className="text-xs text-red-600 mb-2">{saleError}</p>}
                        {saleSuccess && <p className="text-xs text-emerald-600 mb-2">{saleSuccess}</p>}
                        <button
                            onClick={completeSale}
                            disabled={completing || cartItems.length === 0}
                            className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <IndianRupee className="w-4 h-4 mr-2" />
                            {completing ? "Processing..." : "Complete Sale"}
                        </button>
                    </div>
                </div>
                
            </div>

            {/* Add Medicine Modal */}
            {showAddModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/50" onClick={() => setShowAddModal(false)}></div>
                    <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl relative z-10 p-6 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-bold text-gray-900">Add Medicine</h3>
                            <button onClick={() => setShowAddModal(false)} className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        {formError && <div className="mb-4 p-3 bg-red-50 text-red-700 border-l-4 border-red-400 rounded text-sm">{formError}</div>}
                        <form onSubmit={submitMedicine} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                                    <input
                                        type="text"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                                        value={medicineForm.name}
                                        onChange={(e) => setMedicineForm({ ...medicineForm, name: e.target.value })}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Generic Name</label>
                                    <input
                                        type="text"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                                        value={medicineForm.genericName}
                                        onChange={(e) => setMedicineForm({ ...medicineForm, genericName: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Manufacturer</label>
                                    <input
                                        type="text"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                                        value={medicineForm.manufacturer}
                                        onChange={(e) => setMedicineForm({ ...medicineForm, manufacturer: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Batch Number *</label>
                                    <input
                                        type="text"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                                        value={medicineForm.batchNumber}
                                        onChange={(e) => setMedicineForm({ ...medicineForm, batchNumber: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date *</label>
                                    <input
                                        type="date"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                                        value={medicineForm.expiryDate}
                                        onChange={(e) => setMedicineForm({ ...medicineForm, expiryDate: e.target.value })}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">MRP (₹) *</label>
                                    <input
                                        type="number"
                                        min="0"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                                        value={medicineForm.mrp}
                                        onChange={(e) => setMedicineForm({ ...medicineForm, mrp: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Stock Quantity *</label>
                                    <input
                                        type="number"
                                        min="0"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                                        value={medicineForm.stockQuantity}
                                        onChange={(e) => setMedicineForm({ ...medicineForm, stockQuantity: e.target.value })}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Reorder Level</label>
                                    <input
                                        type="number"
                                        min="0"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                                        value={medicineForm.reorderLevel}
                                        onChange={(e) => setMedicineForm({ ...medicineForm, reorderLevel: e.target.value })}
                                    />
                                </div>
                            </div>
                            <button
                                type="submit"
                                disabled={saving}
                                className="w-full py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
                            >
                                {saving ? "Saving..." : "Add to Inventory"}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}
