const express = require('express');
const router = express.Router();
const Course = require('../models/Course');
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

// Get all courses
router.get('/', auth, async (req, res) => {
  try {
    const courses = await Course.find().populate('facultyId', 'email');
    res.json(courses);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create course
router.post('/', auth, async (req, res) => {
  if (req.user.role !== 'faculty' && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied' });
  }
  try {
    const { title } = req.body;
    const description = await generateQuiz(`Generate a course description for "${title}"`);
    const course = new Course({ title, description, facultyId: req.user._id });
    await course.save();
    res.status(201).json(course);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Add module
router.post('/:id/modules', auth, async (req, res) => {
  if (req.user.role !== 'faculty' && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied' });
  }
  try {
    const course = await Course.findById(req.params.id);
    if (!course || course.facultyId.toString() !== req.user._id) {
      return res.status(404).json({ message: 'Course not found' });
    }
    course.modules.push(req.body);
    await course.save();
    res.json(req.body);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;