const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  cohort: { type: String, required: true },
  firstname: { type: String, required: true },
  lastname: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isVerified: { type: Boolean, default: false },
  role: { type: String, default: 'student' },
  refreshToken: { type: String }, // Optional: for storing refresh token
  score: { type: Number, default: 0 },
  totalWritten: { type: Number, default: 0 },
  testWritten: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Exam'
    }
  ]}, { timestamps: true });

  const adminSchema = new mongoose.Schema({
    firstname: { type: String, required: true },
    lastname: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['admin', 'instructor'], default: 'admin' },
    refreshToken: { type: String }, // Optional: for storing refresh token
   }, { timestamps: true });

const Student = mongoose.model('Student', studentSchema);
const Admin = mongoose.model('Admin', adminSchema);
module.exports = { Student, Admin };
