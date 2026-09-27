import connectDB from "../../../lib/db";
import Applicant from "../../../models/Applicant";
import Job from "../../../models/Job";

export default async function handler(req, res) {
    await connectDB();

    if (req.method === "POST") {
        try {
            const { jobId, name, email, phone, experience, resumeUrl } = req.body;
            
            // Check if job exists
            const job = await Job.findById(jobId);
            if (!job) return res.status(404).json({ error: "Job posting not found" });

            const application = new Applicant({
                job: jobId,
                name,
                email,
                phone,
                experience,
                resumeUrl
            });

            await application.save();
            return res.status(201).json({ message: "Application submitted successfully", application });
        } catch (error) {
            return res.status(400).json({ error: error.message });
        }
    } else if (req.method === "PUT") {
        try {
            const { _id, status, ...updates } = req.body;
            if (!_id) return res.status(400).json({ error: "Applicant _id is required" });

            const applicant = await Applicant.findByIdAndUpdate(
                _id,
                { status, ...updates },
                { new: true, runValidators: true }
            );
            if (!applicant) return res.status(404).json({ error: "Application not found" });

            return res.status(200).json(applicant);
        } catch (error) {
            return res.status(400).json({ error: error.message });
        }
    } else if (req.method === "GET") {
        try {
            const { jobId, status } = req.query;
            let filter = {};
            if (jobId) filter.job = jobId;
            if (status) filter.status = status;

            const applicants = await Applicant.find(filter)
                .populate('job', 'title department')
                .sort({ applicationDate: -1 });

            return res.status(200).json(applicants);
        } catch (error) {
             return res.status(500).json({ error: error.message });
        }
    } else {
        return res.status(405).json({ error: "Method not allowed" });
    }
}
