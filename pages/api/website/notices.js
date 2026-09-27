import connectDB from "../../../lib/db";
import Notice from "../../../models/Notice";

export default async function handler(req, res) {
    await connectDB();

    if (req.method === "POST") {
        try {
            const notice = new Notice(req.body);
            await notice.save();
            return res.status(201).json(notice);
        } catch (error) {
            return res.status(400).json({ error: error.message });
        }
    } else if (req.method === "PUT") {
        try {
            const { _id, ...updates } = req.body;
            if (!_id) return res.status(400).json({ error: "Notice _id is required" });

            const notice = await Notice.findByIdAndUpdate(_id, updates, { new: true, runValidators: true });
            if (!notice) return res.status(404).json({ error: "Notice not found" });

            return res.status(200).json(notice);
        } catch (error) {
            return res.status(400).json({ error: error.message });
        }
    } else if (req.method === "DELETE") {
        try {
            const { _id } = req.query;
            if (!_id) return res.status(400).json({ error: "Notice _id is required" });

            const notice = await Notice.findByIdAndDelete(_id);
            if (!notice) return res.status(404).json({ error: "Notice not found" });

            return res.status(200).json({ message: "Notice deleted" });
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    } else if (req.method === "GET") {
        try {
            const { targetAudience } = req.query;
            let filter = { isActive: true };
            if (targetAudience) filter.targetAudience = { $in: [targetAudience, "All"] };
            
            // Exclude expired notices
            filter.$or = [
                { expiryDate: { $exists: false } },
                { expiryDate: null },
                { expiryDate: { $gte: new Date() } }
            ];

            const notices = await Notice.find(filter).sort({ creationDate: -1 });
            return res.status(200).json(notices);
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    } else {
        return res.status(405).json({ error: "Method not allowed" });
    }
}
