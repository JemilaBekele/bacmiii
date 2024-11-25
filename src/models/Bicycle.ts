import mongoose from 'mongoose';
import userReferenceSchema from "../helpers/userReferenceSchema"; 


const { Schema } = mongoose;
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
    status: {
        type: String,
        eum: ['Mantain','Active', 'Charge'],
    },
    createdBy: userReferenceSchema,
    qrCode: {
        type: String, // Store the QR code as a string (base64 or a URL)
      },
}, {
    timestamps: true, // Automatically manage createdAt and updatedAt fields
});

// Create the Bicycle model
const Bicycle = mongoose.model('Bicycle', bicycleSchema);

export default Bicycle;
