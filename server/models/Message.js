const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  receiverRole: { type: String, enum: ['student', 'teacher', 'principal', 'all'], required: true },
  targetClass: { type: String }, // For messages to specific classes
  content: { type: String, required: true },
  type: { type: String, enum: ['message', 'homework', 'notice', 'complaint'], default: 'message' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Message', MessageSchema);
