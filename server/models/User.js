const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  role: { type: String, enum: ['student', 'teacher', 'principal'], required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  class: { type: String }, // e.g., '10'
  section: { type: String }, // e.g., 'A' or 'B'
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', UserSchema);
