import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

interface ClientDocument extends mongoose.Document {
  phoneNumber: string;
  fullName: string;
  sex: 'Male' | 'Female';
  fiydaIdImage: string;
  fiydaIdImageback: string;
  password: string;
  workplaceId?: string;
  organization?: string;
  locationStart?: string;
  locationEnd?: string;
  createJWT: () => string;
  comparePassword: (candidatePassword: string) => Promise<boolean>;
}

const ClientSchema = new mongoose.Schema<ClientDocument>({
  fullName: {
    type: String,
    required: [true, 'Please provide a full name'],
    minlength: 3,
    maxlength: 100,
  },
  phoneNumber: {
    type: String,
    required: [true, 'Please provide a phone number'],
    unique: true,
  },
  sex: {
    type: String,
    enum: ['Male', 'Female'],
    required: [true, 'Please provide a sex'],
  },
  fiydaIdImage: {
    type: String,
    required: [true, 'Please provide a Fiyda ID'],
  },
  fiydaIdImageback: {
    type: String,
    required: [true, 'Please provide a Fiyda ID'],
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 8,
    maxlength: 32,
  },
  workplaceId: {
    type: String,
    required: false,
  },
  organization: {
    type: String,
    required: false,
  },
  locationStart: {
    type: String,
    required: false,
  },
  locationEnd: {
    type: String,
    required: false,
  },
});

// Hash the password before saving
ClientSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to generate JWT
ClientSchema.methods.createJWT = function () {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not defined in environment variables');
  }
  return jwt.sign(
    { userId: this._id, fullName: this.fullName, role: this.role },
    secret,
    { expiresIn: process.env.JWT_LIFETIME || '1d' }
  );
};

// Method to compare passwords
ClientSchema.methods.comparePassword = async function (candidatePassword: string) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const Client = mongoose.models.Client || mongoose.model<ClientDocument>('Client', ClientSchema);

export default Client;
