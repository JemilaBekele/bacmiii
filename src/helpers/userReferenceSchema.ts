import mongoose from "mongoose";

const userReferenceSchema = new mongoose.Schema({
  id: {
    type: mongoose.Types.ObjectId,
    ref: 'Employee',
    required: [true, 'Please provide user'],
  }
}, { _id: false });

export default userReferenceSchema;
