const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const User = require('./models/User');
const Message = require('./models/Message');
const Attendance = require('./models/Attendance');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'janta_secret_key_123';
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/digital-janta';

app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Auth Routes
app.post('/api/register', async (req, res) => {
  try {
    const { name, email, password, role, className, section } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashedPassword, role, class: className, section });
    await user.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/users/class/:className/:section', async (req, res) => {
  try {
    const { className, section } = req.params;
    const users = await User.find({ class: className, section, role: 'student' }).select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Attendance Routes
app.post('/api/attendance', async (req, res) => {
  try {
    const { className, section, presentStudents, absentStudents, markedBy } = req.body;
    const attendance = new Attendance({ class: className, section, presentStudents, absentStudents, markedBy });
    await attendance.save();
    res.status(201).json({ message: 'Attendance marked successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/attendance/stats', async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const stats = await Attendance.find({ date: { $gte: today } });
    
    // Also fetch real student and teacher counts
    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalTeachers = await User.countDocuments({ role: 'teacher' });
    
    res.json({ 
      attendance: stats, 
      totalStudents, 
      totalTeachers 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '1d' });
    res.json({ token, user: { id: user._id, name: user.name, role: user.role, class: user.class, section: user.section } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update Profile Route
app.put('/api/users/profile/:id', async (req, res) => {
  try {
    const { email, password } = req.body;
    const updateData = {};
    if (email) updateData.email = email;
    if (password) updateData.password = await bcrypt.hash(password, 10);
    
    const user = await User.findByIdAndUpdate(req.params.id, updateData, { new: true }).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Message Routes
app.post('/api/messages', async (req, res) => {
  try {
    const { senderId, receiverRole, content, type, targetClass } = req.body;
    const message = new Message({ sender: senderId, receiverRole, content, type, targetClass });
    await message.save();
    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/messages/:role', async (req, res) => {
  try {
    const { role } = req.params;
    const { className } = req.query;
    
    let query = { $or: [{ receiverRole: role }, { receiverRole: 'all' }] };
    if (className) {
      query.$or.push({ targetClass: className });
    }
    
    const messages = await Message.find(query).populate('sender', 'name').sort({ createdAt: -1 });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
