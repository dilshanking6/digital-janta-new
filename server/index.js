const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');
require('dotenv').config();
const { getSheetData, appendSheetData, deleteSheetData, updateSheetData } = require('./googleSheets');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'janta_secret_key_123';

app.use(cors());
app.use(express.json());

// Request Logger
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Serve static files from the React app
app.use(express.static(path.join(__dirname, '../client/dist')));

app.get('/api-status', (req, res) => {
  res.send('Digital Janta Server (Google Sheets) is Running!');
});

// Auth Routes
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const rows = await getSheetData('Users') || []; 
    const usersRows = rows.slice(1);

    if (usersRows.length === 0) return res.status(401).json({ error: 'No users found' });

    const userRow = usersRows.find(row => row[1] === email);
    
    if (!userRow || !(await bcrypt.compare(password, userRow[2]))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = {
      id: userRow[6],
      name: userRow[0],
      email: userRow[1],
      role: userRow[3],
      class: userRow[4],
      section: userRow[5]
    };

    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '1d' });
    res.json({ token, user });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ error: 'Server error during login' });
  }
});

app.post('/api/register', async (req, res) => {
  try {
    const { name, email, password, role, className, section } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const id = Date.now().toString();
    
    await appendSheetData('Users', [name, email, hashedPassword, role, className, section, id]);
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error('Register Error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/users/class/:className/:section', async (req, res) => {
  try {
    const { className, section } = req.params;
    console.log(`Fetching students for Class: ${className}, Section: ${section}`);
    const rows = await getSheetData('Users') || [];
    
    // Improved filtering with trim and string conversion
    const studentRows = rows.slice(1).filter(row => 
      row && 
      String(row[4]).trim() === String(className).trim() && 
      String(row[5]).trim() === String(section).trim() && 
      String(row[3]).trim().toLowerCase() === 'student'
    );
    
    const users = studentRows.map(row => ({
      id: row[6],
      name: row[0],
      email: row[1],
      role: row[3],
      class: row[4],
      section: row[5]
    }));
    
    console.log(`Found ${users.length} students`);
    res.json(users);
  } catch (error) {
    console.error('Fetch Students by Class Error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/users/search', async (req, res) => {
  try {
    const { name } = req.query;
    const rows = await getSheetData('Users') || [];
    const users = rows.slice(1)
      .filter(row => row[0].toLowerCase().includes(name.toLowerCase()) && row[3] === 'student')
      .map(row => ({
        id: row[6],
        name: row[0],
        class: row[4],
        section: row[5]
      }));
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Attendance Routes
app.post('/api/attendance', async (req, res) => {
  try {
    const { className, section, presentStudents, absentStudents, markedBy } = req.body;
    const date = new Date().toISOString();
    const id = 'ATT' + Date.now();
    await appendSheetData('Attendance', [date, className, section, JSON.stringify(presentStudents), JSON.stringify(absentStudents), markedBy, id]);
    res.status(201).json({ message: 'Attendance marked successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/attendance/stats', async (req, res) => {
  try {
    const attendanceRows = await getSheetData('Attendance') || [];
    const userRows = await getSheetData('Users') || [];
    
    const totalStudents = userRows.slice(1).filter(row => row[3] === 'student').length;
    const totalTeachers = userRows.slice(1).filter(row => row[3] === 'teacher').length;
    
    res.json({ 
      attendance: attendanceRows.slice(1).map(row => ({
        date: row[0],
        class: row[1],
        section: row[2],
        presentStudents: JSON.parse(row[3] || '[]'),
        absentStudents: JSON.parse(row[4] || '[]'),
        markedBy: row[5],
        id: row[6]
      })), 
      totalStudents, 
      totalTeachers 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Message Routes
app.post('/api/messages', async (req, res) => {
  try {
    const { senderId, receiverRole, content, type, targetClass, targetStudentId } = req.body;
    if (!senderId || !content) {
      return res.status(400).json({ error: 'Sender ID and content are required' });
    }
    const date = new Date().toISOString();
    const id = 'MSG' + Date.now();
    console.log(`Posting message of type ${type} from ${senderId}`);
    const success = await appendSheetData('Messages', [date, senderId, receiverRole, content, type, targetClass || '', targetStudentId || '', id]);
    if (success) {
      res.status(201).json({ message: 'Message sent successfully' });
    } else {
      res.status(500).json({ error: 'Failed to save message to Google Sheets' });
    }
  } catch (error) {
    console.error('Message Send Error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/messages/:id', async (req, res) => {
  try {
    console.log(`Deleting message with ID: ${req.params.id}`);
    const result = await deleteSheetData('Messages', req.params.id);
    if (result) {
      res.json({ message: 'Deleted successfully' });
    } else {
      res.status(500).json({ error: 'Failed to delete message' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/messages/:id', async (req, res) => {
  try {
    const { content } = req.body;
    console.log(`Updating message content for ID: ${req.params.id}`);
    const rows = await getSheetData('Messages') || [];
    const rowIndex = rows.slice(1).findIndex(row => row[7] === req.params.id);
    
    if (rowIndex === -1) return res.status(404).json({ error: 'Message not found' });
    
    const updatedRow = [...rows[rowIndex + 1]];
    updatedRow[3] = content;
    
    const success = await updateSheetData('Messages', req.params.id, updatedRow);
    if (success) {
      res.json({ message: 'Updated successfully' });
    } else {
      res.status(500).json({ error: 'Failed to update message' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/messages/principal', async (req, res) => {
  try {
    const rows = await getSheetData('Messages') || [];
    const userRows = await getSheetData('Users') || [];
    
    const messages = rows.slice(1)
      .filter(row => row[2] === 'principal' || row[2] === 'all')
      .map(row => {
        const sender = userRows.slice(1).find(u => u[6] === row[1]);
        return {
          createdAt: row[0],
          sender: { name: sender ? sender[0] : 'Unknown' },
          content: row[3],
          type: row[4],
          id: row[7]
        };
      })
      .reverse();
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/messages/student', async (req, res) => {
  try {
    const { className, studentId } = req.query;
    console.log(`Fetching student messages for Class: ${className}, ID: ${studentId}`);
    const rows = await getSheetData('Messages') || [];
    const userRows = await getSheetData('Users') || [];
    
    const messages = rows.slice(1)
      .filter(row => row && row.length >= 7)
      .filter(row => {
        const receiverRole = String(row[2]).toLowerCase();
        const targetClass = String(row[5]);
        const targetId = String(row[6]);
        
        return receiverRole === 'all' || 
               (receiverRole === 'student' && targetClass === String(className)) ||
               (receiverRole === 'student' && targetId === String(studentId));
      })
      .map(row => {
        const sender = userRows.slice(1).find(u => String(u[6]).trim() === String(row[1]).trim());
        return {
          createdAt: row[0],
          sender: { name: sender ? sender[0] : 'School System' },
          senderId: row[1],
          content: row[3],
          type: row[4],
          id: row[7],
          targetStudentId: row[6]
        };
      })
      .reverse();
    res.json(messages);
  } catch (error) {
    console.error('Student Message Fetch Error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/messages/private', async (req, res) => {
  try {
    const { senderId, receiverId, content } = req.body;
    if (!senderId || !receiverId || !content) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const date = new Date().toISOString();
    const id = 'PVT' + Date.now();
    console.log(`Attempting to send private message from ${senderId} to ${receiverId}`);
    
    // Crucial: Append to sheet and check success
    const success = await appendSheetData('PrivateMessages', [date, String(senderId), String(receiverId), content, id]);
    
    if (success) {
      console.log(`Private message ${id} saved successfully`);
      return res.status(201).json({ message: 'Private message sent', id: id });
    } else {
      console.error(`Failed to save private message ${id}`);
      return res.status(500).json({ error: 'Database save failed (Google Sheets error)' });
    }
  } catch (error) {
    console.error('Private Message Send Exception:', error);
    return res.status(500).json({ error: error.message });
  }
});

app.get('/api/messages/private', async (req, res) => {
  try {
    const { user1, user2 } = req.query;
    if (!user1 || !user2) {
      return res.status(400).json({ error: 'Missing user parameters' });
    }
    console.log(`Fetching private messages between ${user1} and ${user2}`);
    const rows = await getSheetData('PrivateMessages') || [];
    
    const messages = rows.slice(1)
      .filter(row => row && row.length >= 4)
      .filter(row => 
        (String(row[1]) === String(user1) && String(row[2]) === String(user2)) || 
        (String(row[1]) === String(user2) && String(row[2]) === String(user1))
      )
      .map(row => ({
        createdAt: row[0],
        senderId: row[1],
        receiverId: row[2],
        content: row[3],
        id: row[4]
      }));
    res.json(messages);
  } catch (error) {
    console.error('Private Message Fetch Error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/notifications/unread/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { role, className } = req.query;
    const rows = await getSheetData('Messages') || [];
    const pvtRows = await getSheetData('PrivateMessages') || [];
    
    const relevantPublic = rows.slice(1).filter(row => {
      const receiverRole = String(row[2]).toLowerCase();
      const targetClass = String(row[5]);
      const targetId = String(row[6]);
      return receiverRole === 'all' || 
             (receiverRole === role && (targetClass === String(className) || targetId === String(userId)));
    }).length;
    
    const relevantPrivate = pvtRows.slice(1).filter(row => 
      String(row[2]).trim() === String(userId).trim()
    ).length;

    res.json({ count: relevantPublic + relevantPrivate });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Catch-all route to serve React's index.html
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
