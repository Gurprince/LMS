const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors'); // Add CORS package
const authMiddleware = require('./middleware/auth');
const multer = require('multer');
const path = require('path');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('./models/User'); // Assuming User model exists
require('dotenv').config(); // Ensure this is at the top of your server.js

const app = express();

// Enable CORS for frontend origin
app.use(cors({
  origin: 'http://localhost:5173', // Allow requests from Vite frontend
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Allow necessary methods
  allowedHeaders: ['Content-Type', 'Authorization'], // Allow necessary headers
  credentials: true // If cookies or auth tokens are used
}));

app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Multer for file uploads
const storage = multer.diskStorage({
  destination: './uploads/Content',
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({ storage });

// Auth routes
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || 'your_jwt_secret', {
      expiresIn: '1h',
    });
    res.json({ token, user: { _id: user._id, email: user.email, role: user.role } });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Content routes
const Content = require('./models/Content');
app.get('/api/content', authMiddleware, async (req, res) => {
  try {
    const contents = await Content.find()
      .populate('courseId', 'title facultyId')
      .lean();
    const facultyContents = contents.filter(
      (content) => content.courseId.facultyId.toString() === req.user.id
    );
    res.json(facultyContents);
  } catch (err) {
    console.error('Error fetching content:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/content/upload', authMiddleware, upload.single('file'), async (req, res) => {
  try {
    const { courseId } = req.body;
    const content = new Content({
      name: req.file.originalname,
      type: path.extname(req.file.originalname).slice(1),
      courseId,
      filePath: req.file.path,
      uploadDate: new Date(),
    });
    await content.save();
    res.json(content);
  } catch (err) {
    console.error('Error uploading content:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Other routes (add your existing routes here)
app.use('/api/courses', require('./routes/courses'));
app.use('/api/assignments', require('./routes/assignments'));
app.use('/api/analytics', require('./routes/analytics'));

const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));