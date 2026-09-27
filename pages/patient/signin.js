import { useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { User, Lock, ArrowRight, Stethoscope } from "lucide-react";

export default function PatientSignIn() {
    const router = useRouter();
    const [form, setForm] = useState({ username: "", password: "" });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const response = await fetch("/api/auth/signin", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...form, expectedRole: "patient" })
            });

            const text = await response.text();
            let data = {};
            try {
                data = text ? JSON.parse(text) : {};
            } catch {
                data = {};
            }

            if (response.ok) {
                router.push("/patient/dashboard");
            } else {
                setError(data.message || "Invalid email or password");
                setLoading(false);
            }
        } catch (err) {
            setError("Network error. Check your connection and try again.");
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-10 px-8 border border-gray-200 shadow-xl rounded-2xl">
                    <div className="text-center mb-10">
                        <Link href="/" className="inline-block mb-4 hover:scale-105 active:scale-95 transition-transform duration-200">
                            <span className="font-bold text-3xl">
                                <span className="text-neutral-900">Clin</span>
                                <span className="text-[#00C9A7]">X</span>
                            </span>
                        </Link>
                        <div className="flex items-center justify-center gap-2 mb-2">
                            <Stethoscope className="w-5 h-5 text-teal-600" />
                            <span className="text-xs font-semibold uppercase tracking-wider text-teal-600 bg-teal-50 px-3 py-1 rounded-full">Patient Portal</span>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900">Patient Sign In</h2>
                        <p className="text-sm text-gray-500 mt-2">Sign in to book appointments and view your medical history</p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 text-red-700 border-l-4 border-red-400 rounded text-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                                    <User className="h-4 w-4" />
                                </span>
                                <input
                                    type="email"
                                    name="username"
                                    required
                                    value={form.username}
                                    onChange={handleChange}
                                    className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none text-sm transition-all"
                                    placeholder="you@example.com"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                                    <Lock className="h-4 w-4" />
                                </span>
                                <input
                                    type="password"
                                    name="password"
                                    required
                                    value={form.password}
                                    onChange={handleChange}
                                    className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none text-sm transition-all"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full flex justify-center items-center py-3 bg-[#00C9A7] text-white font-bold rounded-lg shadow-md hover:bg-teal-600 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 transition-all transform hover:scale-[1.02] active:scale-[0.98] ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {loading ? "Signing in..." : "Sign In"}
                            {!loading && <ArrowRight className="ml-2 h-4 w-4" />}
                        </button>
                    </form>

                    <p className="mt-8 text-center text-sm text-gray-600">
                        New patient?{" "}
                        <Link href="/patient/signup" className="text-teal-600 font-semibold hover:text-teal-700 hover:underline transition-colors">
                            Create Patient Account
                        </Link>
                    </p>
                    <p className="mt-4 text-center text-sm text-gray-400">
                        Hospital staff?{" "}
                        <Link href="/auth/signin" className="text-gray-500 font-medium hover:text-teal-600 hover:underline transition-colors">
                            Staff Sign In
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

export async function getServerSideProps() {
    return { props: {} };
}
