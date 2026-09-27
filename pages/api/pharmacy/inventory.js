import connectDB from "../../../lib/db";
import Medicine from "../../../models/Medicine";

export default async function handler(req, res) {
    await connectDB();

    if (req.method === "POST") {
        try {
            const medicine = new Medicine(req.body);
            await medicine.save();
            return res.status(201).json(medicine);
        } catch (error) {
            return res.status(400).json({ error: error.message });
        }
    } else if (req.method === "PUT") {
        try {
            const { _id, ...updates } = req.body;
            if (!_id) return res.status(400).json({ error: "Medicine _id is required" });

            // Prevent accidental overwrite of protected fields
            delete updates.salesCount;

            const medicine = await Medicine.findByIdAndUpdate(_id, updates, { new: true, runValidators: true });
            if (!medicine) return res.status(404).json({ error: "Medicine not found" });

            return res.status(200).json(medicine);
        } catch (error) {
            return res.status(400).json({ error: error.message });
        }
    } else if (req.method === "DELETE") {
        try {
            const { _id } = req.query;
            if (!_id) return res.status(400).json({ error: "Medicine _id is required" });

            const medicine = await Medicine.findByIdAndDelete(_id);
            if (!medicine) return res.status(404).json({ error: "Medicine not found" });

            return res.status(200).json({ message: "Medicine removed from inventory" });
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    } else if (req.method === "GET") {
        try {
            const { name } = req.query;
            let filter = {};
            if (name) filter.name = { $regex: name, $options: "i" };
            
            const inventory = await Medicine.find(filter).sort({ name: 1 });
            return res.status(200).json(inventory);
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    } else {
        return res.status(405).json({ error: "Method not allowed" });
    }
}
