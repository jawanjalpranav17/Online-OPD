import { useState, useEffect } from "react";
import axios from "axios";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Briefcase, Users, FilePlus, ExternalLink, ShieldCheck, Mail, Phone, ChevronDown, ChevronUp, X } from "lucide-react";

const emptyJobForm = { title: "", department: "", location: "", type: "Full-time", description: "", requirements: "" };

export default function HiringDashboard() {
    const [jobs, setJobs] = useState([]);
    const [applicants, setApplicants] = useState({});
    const [loading, setLoading] = useState(true);
    const [expandedJob, setExpandedJob] = useState(null);
    const [showJobModal, setShowJobModal] = useState(false);
    const [jobForm, setJobForm] = useState(emptyJobForm);
    const [saving, setSaving] = useState(false);
    const [formError, setFormError] = useState("");

    const fetchHiringData = async () => {
        try {
            // Fetch basic jobs
            const jobsRes = await axios.get("/api/hiring/jobs");
            const jobsData = jobsRes.data;
            setJobs(jobsData);
            
            // Fetch all applicants and group them by jobId
            const applicantsRes = await axios.get("/api/hiring/apply");
            const applicantsData = applicantsRes.data;
            
            const applicantsMap = {};
            // Initialize map with empty arrays for each job
            jobsData.forEach(job => {
                applicantsMap[job._id] = [];
            });
            
            // Fill map with actual applicants
            applicantsData.forEach(applicant => {
                const jId = typeof applicant.job === 'object' ? applicant.job._id : applicant.job;
                if (!applicantsMap[jId]) applicantsMap[jId] = [];
                applicantsMap[jId].push(applicant);
            });
            
            setApplicants(applicantsMap);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching hiring data:", error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHiringData();
    }, []);

    const toggleJob = (jobId) => {
        if (expandedJob === jobId) {
            setExpandedJob(null);
        } else {
            setExpandedJob(jobId);
        }
    };

    const openJobModal = () => {
        setJobForm(emptyJobForm);
        setFormError("");
        setShowJobModal(true);
    };

    const submitJob = async (e) => {
        e.preventDefault();
        setSaving(true);
        setFormError("");
        try {
            if (!jobForm.title || !jobForm.department || !jobForm.description) {
                setFormError("Title, department and description are required.");
                setSaving(false);
                return;
            }
            await axios.post("/api/hiring/jobs", {
                title: jobForm.title,
                department: jobForm.department,
                location: jobForm.location,
                type: jobForm.type,
                description: jobForm.description,
                requirements: jobForm.requirements.split(",").map(r => r.trim()).filter(Boolean)
            });
            setShowJobModal(false);
            await fetchHiringData();
        } catch (error) {
            setFormError(error.response?.data?.error || "Failed to post job.");
        }
        setSaving(false);
    };

    const shortlistApplicant = async (applicant) => {
        try {
            await axios.put("/api/hiring/apply", {
                _id: applicant._id,
                status: applicant.status === "Reviewed" ? "Pending" : "Reviewed"
            });
            await fetchHiringData();
        } catch (error) {
            alert(error.response?.data?.error || "Failed to update applicant.");
        }
    };

    return (
        <DashboardLayout title="Hiring & Recruitment">
            
            <div className="flex flex-col md:flex-row justify-between mb-8 space-y-4 md:space-y-0">
                <div className="flex gap-4">
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex items-center min-w-[200px]">
                        <div className="p-3 bg-teal-100 text-teal-600 rounded-full mr-4">
                            <Briefcase className="w-6 h-6" />
                        </div>
                        <div>
                            <h4 className="text-gray-500 font-medium text-sm">Open Positions</h4>
                            <p className="text-2xl font-bold text-gray-900">{jobs.filter(j => j.isActive !== false).length}</p>
                        </div>
                    </div>
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex items-center min-w-[200px]">
                        <div className="p-3 bg-blue-100 text-blue-600 rounded-full mr-4">
                            <Users className="w-6 h-6" />
                        </div>
                        <div>
                            <h4 className="text-gray-500 font-medium text-sm">Total Applicants</h4>
                            <p className="text-2xl font-bold text-gray-900">
                                {Object.values(applicants).flat().length}
                            </p>
                        </div>
                    </div>
                </div>
                
                <button
                    onClick={openJobModal}
                    className="flex items-center justify-center px-6 py-4 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-xl transition-colors shadow-md self-stretch"
                >
                    <FilePlus className="w-5 h-5 mr-3" />
                    Post New Job
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-6 border-b border-gray-100 bg-gray-50">
                    <h3 className="font-semibold text-gray-800 text-lg">Job Listings & Applications</h3>
                </div>

                {loading ? (
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto mb-4"></div>
                        <p className="text-gray-500">Loading recruitment data...</p>
                    </div>
                ) : jobs.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                        <Briefcase className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                        No job postings found. Create one to start hiring.
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {jobs.map(job => {
                            const jobApplicants = applicants[job._id] || [];
                            const isExpanded = expandedJob === job._id;
                            
                            return (
                                <div key={job._id} className="transition-all">
                                    <div 
                                        className={`p-6 cursor-pointer hover:bg-gray-50 transition-colors flex flex-col md:flex-row justify-between items-start md:items-center ${isExpanded ? 'bg-teal-50/30' : ''}`}
                                        onClick={() => toggleJob(job._id)}
                                    >
                                        <div className="mb-4 md:mb-0">
                                            <div className="flex items-center">
                                                <h4 className="text-lg font-bold text-gray-900 mr-3">{job.title}</h4>
                                                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${job.isActive !== false ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'}`}>
                                                    {job.isActive !== false ? "Open" : "Closed"}
                                                </span>
                                            </div>
                                            <div className="text-sm text-gray-500 mt-1 flex items-center space-x-4">
                                                <span>{job.department}</span>
                                                <span className="flex items-center"><Briefcase className="w-3 h-3 mr-1" /> {job.type || "Full-time"}</span>
                                                <span>{job.location || "Hybrid"}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-6 w-full md:w-auto justify-between md:justify-end">
                                            <div className="text-center">
                                                <p className="text-2xl font-bold text-teal-600">{jobApplicants.length}</p>
                                                <p className="text-xs text-gray-500 uppercase tracking-wide">Applicants</p>
                                            </div>
                                            {isExpanded ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                                        </div>
                                    </div>

                                    {/* Expanded Applicants View */}
                                    {isExpanded && (
                                        <div className="bg-gray-50 border-t border-gray-100 p-6">
                                            {jobApplicants.length === 0 ? (
                                                <p className="text-center text-gray-500 py-4">No applicants yet for this position.</p>
                                            ) : (
                                                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                                    {jobApplicants.map(applicant => (
                                                        <div key={applicant._id} className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                                                            <div className="flex justify-between items-start mb-3">
                                                                <div>
                                                                    <h5 className="font-semibold text-gray-900">{applicant.name}</h5>
                                                                    <p className="text-xs text-gray-500 mt-0.5">{applicant.experience} yrs experience</p>
                                                                </div>
                                                                <span className={`px-2 py-1 rounded text-xs font-medium ${
                                                                    applicant.status === "Reviewed" ? "bg-emerald-100 text-emerald-700" :
                                                                    applicant.status === "Rejected" ? "bg-red-100 text-red-700" :
                                                                    "bg-amber-100 text-amber-700"
                                                                }`}>
                                                                    {applicant.status}
                                                                </span>
                                                            </div>
                                                            <div className="space-y-2 mt-4 text-sm text-gray-600">
                                                                <p className="flex items-center"><Mail className="w-3.5 h-3.5 mr-2" /> {applicant.email}</p>
                                                                <p className="flex items-center"><Phone className="w-3.5 h-3.5 mr-2" /> {applicant.phone}</p>
                                                            </div>
                                                            <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between">
                                                                <a href={applicant.resumeUrl || '#'} target="_blank" rel="noreferrer" className="text-teal-600 hover:text-teal-800 text-sm font-medium flex items-center">
                                                                    Resume <ExternalLink className="w-3.5 h-3.5 ml-1" />
                                                                </a>
                                                                <button
                                                                    onClick={() => shortlistApplicant(applicant)}
                                                                    className={`transition-colors ${applicant.status === "Reviewed" ? "text-emerald-600" : "text-gray-500 hover:text-emerald-600"}`}
                                                                    title={applicant.status === "Reviewed" ? "Un-shortlist" : "Shortlist"}
                                                                >
                                                                    <ShieldCheck className="w-4 h-4" />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Post New Job Modal */}
            {showJobModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/50" onClick={() => setShowJobModal(false)}></div>
                    <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl relative z-10 p-6 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-bold text-gray-900">Post New Job</h3>
                            <button onClick={() => setShowJobModal(false)} className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        {formError && <div className="mb-4 p-3 bg-red-50 text-red-700 border-l-4 border-red-400 rounded text-sm">{formError}</div>}
                        <form onSubmit={submitJob} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                                    <input
                                        type="text"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                                        value={jobForm.title}
                                        onChange={(e) => setJobForm({ ...jobForm, title: e.target.value })}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Department *</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Nursing, Cardiology"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                                        value={jobForm.department}
                                        onChange={(e) => setJobForm({ ...jobForm, department: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Kanpur, Hybrid"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                                        value={jobForm.location}
                                        onChange={(e) => setJobForm({ ...jobForm, location: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                                    <select
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                                        value={jobForm.type}
                                        onChange={(e) => setJobForm({ ...jobForm, type: e.target.value })}
                                    >
                                        <option value="Full-time">Full-time</option>
                                        <option value="Part-time">Part-time</option>
                                        <option value="Contract">Contract</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                                <textarea
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                                    rows="3"
                                    value={jobForm.description}
                                    onChange={(e) => setJobForm({ ...jobForm, description: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Requirements (comma separated)</label>
                                <textarea
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                                    rows="2"
                                    placeholder="B.Sc Nursing, 2+ years experience, ..."
                                    value={jobForm.requirements}
                                    onChange={(e) => setJobForm({ ...jobForm, requirements: e.target.value })}
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={saving}
                                className="w-full py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
                            >
                                {saving ? "Posting..." : "Post Job"}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}
