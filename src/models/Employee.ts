import mongoose from 'mongoose';
import bcrypt from 'bcryptjs'; // Use import instead of require
import jwt from 'jsonwebtoken'; // Use import instead of require

const EmployeeSchema = new mongoose.Schema({
  firstname: {
    type: String,
    required: [true, 'Please provide a username'],
    minlength: 3,
    maxlength: 50,
  },
  lastname: {
    type: String,
    required: [true, 'Please provide a username'],
    minlength: 3,
    maxlength: 50,
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 3,
    maxlength: 12,
  },
  role: {
    type: String,
    enum: ['Admin', 'Employee'],
    required: [true, 'Please provide a role'],
  },
  phoneNumber: {
    type: String,
    required: [true, 'Please provide a phone number'],
    unique: true,
  },
  sex: {
    type: String,
    enum: ['Male', 'Female'],
    required: [true, "Please provide a sex"],
  },
  
});

// Hash the password before saving
EmployeeSchema.pre('save', async function (next) {
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to generate JWT
EmployeeSchema.methods.createJWT = function () {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not defined in environment variables");
  }
  return jwt.sign(
    { userId: this._id, firstname: this.firstname, role: this.role },
    secret,
    { expiresIn: process.env.JWT_LIFETIME || "1d" }
  );
};


EmployeeSchema.methods.comparePassword = async function (candidatePassword: string) {
  const isMatch = await bcrypt.compare(candidatePassword, this.password);
  return isMatch;
};

const Employee = mongoose.models.Employee || mongoose.model('Employee', EmployeeSchema);

export default Employee;
