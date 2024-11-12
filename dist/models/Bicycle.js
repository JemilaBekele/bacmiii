"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const { Schema } = mongoose_1.default;
// Define the Bicycle schema
const bicycleSchema = new Schema({
    bicycleId: {
        type: String,
        required: true,
        unique: true, // Ensure each bicycle has a unique ID
    },
    batteryId: {
        type: String,
        required: true, // Assuming a battery is required for each bicycle
    },
    location: {
        type: String,
        required: true, // Location is necessary for registration
    },
}, {
    timestamps: true, // Automatically manage createdAt and updatedAt fields
});
// Create the Bicycle model
const Bicycle = mongoose_1.default.model('Bicycle', bicycleSchema);
exports.default = Bicycle;
