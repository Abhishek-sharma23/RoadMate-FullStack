
const express = require("express");
const mongoose = require("mongoose");
const Booking = require("../models/Booking");
const Service = require("../models/Service");
const authMiddleware = require("../middleware/auth");
const providerMiddleware = require("../middleware/providerMiddleware");

const router = express.Router();

// All routes below require a valid login and provider role.
router.use(authMiddleware, providerMiddleware);

// GET /api/provider/bookings
router.get("/bookings", async (req, res) => {
    try {
        const services = await Service.find({
            provider: req.provider._id
        }).select("_id");

        const serviceIds = services.map(service => service._id);

        const bookings = await Booking.find({
            service: { $in: serviceIds }
        })
            .populate("service", "name category price")
            .populate("user", "name email")
            .sort({ createdAt: -1 });

        return res.json({ bookings });
    } catch (error) {
        console.error("Provider bookings error:", error);
        return res.status(500).json({
            message: "Could not fetch provider bookings"
        });
    }
});

// GET /api/provider/dashboard
router.get("/dashboard", async (req, res) => {
    try {
        const services = await Service.find({
            provider: req.provider._id
        }).select("_id");

        const serviceIds = services.map(service => service._id);

        const bookings = await Booking.find({
            service: { $in: serviceIds }
        }).select("status");

        const stats = {
            totalRequests: bookings.length,
            pendingRequests: bookings.filter(
                booking => booking.status === "Pending"
            ).length,
            acceptedRequests: bookings.filter(
                booking => booking.status === "Accepted"
            ).length,
            activeJobs: bookings.filter(
                booking => booking.status === "In Progress"
            ).length,
            completedJobs: bookings.filter(
                booking => booking.status === "Completed"
            ).length,
            rejectedRequests: bookings.filter(
                booking => booking.status === "Rejected"
            ).length,
            cancelledRequests: bookings.filter(
                booking => booking.status === "Cancelled"
            ).length
        };

        return res.json({
            provider: {
                name: req.provider.name,
                email: req.provider.email
            },
            stats
        });
    } catch (error) {
        console.error("Provider dashboard error:", error);
        return res.status(500).json({
            message: "Could not fetch dashboard statistics"
        });
    }
});

// PATCH /api/provider/bookings/:id/status
router.patch("/bookings/:id/status", async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                message: "Invalid booking ID"
            });
        }

        const allowedTransitions = {
            Pending: ["Accepted", "Rejected"],
            Accepted: ["In Progress"],
            "In Progress": ["Completed"]
        };

        if (!["Accepted", "Rejected", "In Progress", "Completed"].includes(status)) {
            return res.status(400).json({
                message: "Invalid provider status update"
            });
        }

        const booking = await Booking.findById(id);

        if (!booking) {
            return res.status(404).json({
                message: "Booking not found"
            });
        }

        // Verify that this booking belongs to a service managed
        // by the currently authenticated provider.
        const ownedService = await Service.findOne({
            _id: booking.service,
            provider: req.provider._id
        });

        if (!ownedService) {
            return res.status(403).json({
                message: "You are not authorized to manage this booking"
            });
        }

        if (!allowedTransitions[booking.status]?.includes(status)) {
            return res.status(400).json({
                message: `Cannot change status from ${booking.status} to ${status}`
            });
        }

        booking.status = status;
        await booking.save();

        const updatedBooking = await Booking.findById(booking._id)
            .populate("service", "name category price")
            .populate("user", "name email");

        return res.json({
            message: "Booking status updated successfully",
            booking: updatedBooking
        });
    } catch (error) {
        console.error("Provider status update error:", error);
        return res.status(500).json({
            message: "Could not update booking status"
        });
    }
});

module.exports = router;
