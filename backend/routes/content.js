const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const multer = require('multer');

// Authentication middleware
const auth = async (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) {
    console.log('No token provided');
    return res.status(401).json({ message: 'No token, authorization denied' });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    console.log('Token verified:', { userId: decoded._id, role: decoded.role });
    next();
  } catch (err) {
    console.error('Token verification error:', err.message);
    res.status(401).json({ message: 'Invalid token' });
  }
};

// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({ storage });

// Upload content
router.post('/upload', auth, upload.single('file'), async (req, res) => {
  if (req.user.role !== 'faculty' && req.user.role !== 'admin') {
    console.log('Access denied:', { role: req.user.role });
    return res.status(403).json({ message: 'Access denied' });
  }
  try {
    const { courseId } = req.body;
    const file = req.file;
    if (!file) {
      console.log('No file uploaded');
      return res.status(400).json({ message: 'No file uploaded' });
    }
    console.log('File uploaded:', { filename: file.filename, courseId });
    res.json({
      id: Date.now(),
      type: file.mimetype.split('/')[1].toUpperCase(),
      name: file.originalname,
      courseId,
    });
  } catch (err) {
    console.error('Upload error:', err.message, err.stack);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;