import connectDB from "../../../lib/db";
import LabOrder from "../../../models/LabOrder";
import LabTest from "../../../models/LabTest";
import Patient from "../../../models/Patient";
import Doctor from "../../../models/Doctor";

export default async function handler(req, res) {
    await connectDB();

    if (req.method === "POST") {
        try {
            const order = new LabOrder(req.body);
            await order.save();
            return res.status(201).json(order);
        } catch (error) {
            return res.status(400).json({ error: error.message });
        }
    } else if (req.method === "GET") {
        try {
            const { patientId, status } = req.query;
            let filter = {};
            if (patientId) filter.patient = patientId;
            if (status) filter.status = status;
            
            const orders = await LabOrder.find(filter)
                .populate('patient', 'name contact opdNumber')
                .populate('test', 'testName category price normalRange')
                .populate('doctor', 'name')
                .sort({ orderDate: -1 });
            return res.status(200).json(orders);
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    } else {
        return res.status(405).json({ error: "Method not allowed" });
    }
}
