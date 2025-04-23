const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Course = require('../models/Course');
const Assignment = require('../models/Assignment');
const { generateQuiz } = require('../services/gemini');

// Middleware to verify token
const auth = async (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ message: 'No token' });
  try {
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

// Get student analytics for faculty
router.get('/students', auth, async (req, res) => {
  if (req.user.role !== 'faculty' && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied' });
  }
  try {
    // Get faculty's courses
    const courses = await Course.find({ facultyId: req.user._id });
    const courseIds = courses.map((c) => c._id);

    // Get students (simplified, assume all users for now)
    const students = await User.find({ role: 'student' }).select('email _id');

    // Get assignments for faculty's courses
    const assignments = await Assignment.find({ courseId: { $in: courseIds } });

    // Mock AI-generated analytics
    const analytics = await Promise.all(
      students.map(async (student) => {
        const submissions = await Assignment.find({
          courseId: { $in: courseIds },
          'submissions.studentId': student._id,
        });
        const progress = submissions.length
          ? (submissions.filter((s) => s.submissions.find((sub) => sub.studentId.toString() === student._id.toString())?.grade).length / submissions.length) * 100
          : 0;
        const feedback = await generateQuiz(`Generate feedback for student ${student.email} with progress ${progress}%`);
        return {
          studentId: student._id,
          studentEmail: student.email,
          progress: progress.toFixed(2),
          feedback,
        };
      })
    );

    console.log('Analytics fetched:', analytics);
    res.json(analytics);
  } catch (err) {
    console.error('Analytics error:', err.message, err.stack);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;