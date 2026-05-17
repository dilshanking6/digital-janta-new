const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

const seedUsers = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/digital-janta');
    console.log('Connected for seeding...');

    // Clear existing users
    await User.deleteMany({});

    const users = [
      { name: 'Admin Principal', email: 'principal@janta.com', password: await bcrypt.hash('admin123', 10), role: 'principal' },
      { name: 'Teacher Sharma', email: 'sharma@janta.com', password: await bcrypt.hash('teacher123', 10), role: 'teacher', class: '10A' },
      { name: 'Student Rahul', email: 'rahul@janta.com', password: await bcrypt.hash('student123', 10), role: 'student', class: '10A' }
    ];

    await User.insertMany(users);
    console.log('Database Seeded Successfully!');
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seedUsers();
