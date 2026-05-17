const mongoose = require('mongoose');

const AttendanceSchema = new mongoose.Schema({
  class: { type: String, required: true },
  section: { type: String, required: true },
  date: { type: Date, default: Date.now },
  presentStudents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  absentStudents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  markedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

module.exports = mongoose.model('Attendance', AttendanceSchema);
