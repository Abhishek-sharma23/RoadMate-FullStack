
const express = require("express");
const mongoose = require("mongoose");

const Booking = require("../models/Booking.js");
const Service = require("../models/Service.js");
const User = require("../models/user.js");
const authMiddleware = require("../middleware/auth.js");

const router = express.Router();

// Check the current role from the database
const allowRoles = (...roles) => async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id).select("role");

        if (!user) {
            return res.status(401).json({
                message: "User account not found"
            });
        }

        if (!roles.includes(user.role)) {
            return res.status(403).json({
                message: "You do not have permission to perform this action"
            });
        }

        req.currentUser = user;
        next();
    } catch (error) {
        console.error("Role verification error:", error);
        return res.status(500).json({
            message: "Could not verify user permissions"
        });
    }
};

// 1. Create a booking: users and admins
router.post(
    "/",
    authMiddleware,
    allowRoles("user", "admin"),
    async (req, res) => {
        try {
            const {
                service,
                vehicleType,
                vehicleNumber,
                location,
                description
            } = req.body;

            if (!service || !vehicleType || !vehicleNumber || !location) {
                return res.status(400).json({
                    message: "Please fill all required fields"
                });
            }

            if (!mongoose.Types.ObjectId.isValid(service)) {
                return res.status(400).json({
                    message: "Invalid service ID"
                });
            }

            const selectedService = await Service.findById(service);

            if (!selectedService || !selectedService.available) {
                return res.status(404).json({
                    message: "Service not available"
                });
            }

            const booking = await Booking.create({
                user: req.user.id,
                service: selectedService._id,
                vehicleType,
                vehicleNumber,
                location,
                description: description || ""
            });

            return res.status(201).json({
                message: "Booking created successfully",
                booking
            });
        } catch (error) {
            console.error("Booking creation error:", error);
            return res.status(500).json({
                message: "Could not create booking"
            });
        }
    }
);

// 2. Get your own bookings: users and admins
router.get(
    "/my-bookings",
    authMiddleware,
    allowRoles("user", "admin"),
    async (req, res) => {
        try {
            const bookings = await Booking.find({
                user: req.user.id
            })
                .populate("service", "name category price")
                .sort({ createdAt: -1 });

            return res.json(bookings);
        } catch (error) {
            console.error("Fetch bookings error:", error);
            return res.status(500).json({
                message: "Could not fetch bookings"
            });
        }
    }
);

// 3. Admin: view all bookings
router.get(
    "/all",
    authMiddleware,
    allowRoles("admin"),
    async (req, res) => {
        try {
            const bookings = await Booking.find()
                .populate("user", "name email")
                .populate("service", "name category price")
                .sort({ createdAt: -1 });

            return res.json(bookings);
        } catch (error) {
            console.error("Fetch all bookings error:", error);
            return res.status(500).json({
                message: "Could not fetch all bookings"
            });
        }
    }
);

// 4. Admin: update any booking status
router.patch(
    "/:id/status",
    authMiddleware,
    allowRoles("admin"),
    async (req, res) => {
        try {
            const { id } = req.params;
            const { status } = req.body;

            if (!mongoose.Types.ObjectId.isValid(id)) {
                return res.status(400).json({
                    message: "Invalid booking ID"
                });
            }

            const allowedStatuses = [
                "Pending",
                "Accepted",
                "Rejected",
                "In Progress",
                "Completed",
                "Cancelled"
            ];

            if (!allowedStatuses.includes(status)) {
                return res.status(400).json({
                    message: "Invalid booking status"
                });
            }

            const booking = await Booking.findByIdAndUpdate(
                id,
                { status },
                { new: true, runValidators: true }
            )
                .populate("user", "name email")
                .populate("service", "name category price");

            if (!booking) {
                return res.status(404).json({
                    message: "Booking not found"
                });
            }

            return res.json({
                message: "Booking status updated successfully",
                booking
            });
        } catch (error) {
            console.error("Admin booking update error:", error);
            return res.status(500).json({
                message: "Could not update booking status"
            });
        }
    }
);

// 5. Cancel a booking: users can cancel their own;
// admins can cancel any booking.
router.patch(
    "/:id/cancel",
    authMiddleware,
    allowRoles("user", "admin"),
    async (req, res) => {
        try {
            const { id } = req.params;

            if (!mongoose.Types.ObjectId.isValid(id)) {
                return res.status(400).json({
                    message: "Invalid booking ID"
                });
            }

            const filter = { _id: id };

            if (req.currentUser.role !== "admin") {
                filter.user = req.user.id;
            }

            const booking = await Booking.findOne(filter);

            if (!booking) {
                return res.status(404).json({
                    message: "Booking not found"
                });
            }

            if (req.currentUser.role !== "admin") {
                if (!["Pending", "Accepted"].includes(booking.status)) {
                    return res.status(400).json({
                        message:
                            "Only pending or accepted bookings can be cancelled"
                    });
                }
            }

            booking.status = "Cancelled";
            await booking.save();

            return res.json({
                message: "Booking cancelled successfully",
                booking
            });
        } catch (error) {
            console.error("Booking cancellation error:", error);
            return res.status(500).json({
                message: "Could not cancel booking"
            });
        }
    }
);

module.exports = router;
