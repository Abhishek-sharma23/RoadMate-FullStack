
const mongoose = require("mongoose");

const serviceSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },
        description: {
            type: String,
            required: true,
            trim: true
        },
        category: {
            type: String,
            required: true,
            enum: [
                "Mechanic",
                "Puncture Repair",
                "Fuel Delivery",
                "EV Charging",
                "Food Assistance",
                "Driver",
                "Store",
                "ATM"
            ]
        },
        price: {
            type: Number,
            default: 0,
            min: 0
        },
        available: {
            type: Boolean,
            default: true
        },
        provider: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model("Service", serviceSchema);
