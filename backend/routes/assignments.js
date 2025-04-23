const express = require('express');
const Assignment = require('../models/Assignment');
const authMiddleware = require('../middleware/auth');
const { generateContent } = require('../services/gemini');
const router = express.Router();

// Create Assignment (faculty/admin)
router.post('/', authMiddleware, async (req, res) => {
  const { title, description, courseId, dueDate } = req.body;
  if (!['faculty', 'admin'].includes(req.user.role)) {
    return res.status(403).json({ message: 'Unauthorized' });
  }
  try {
    const assignment = new Assignment({
      title,
      description,
      courseId,
      dueDate,
    });
    await assignment.save();
    res.status(201).json(assignment);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get All Assignments
router.get('/', async (req, res) => {
  try {
    const assignments = await Assignment.find().populate('courseId', 'title');
    res.json(assignments);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get Assignment by ID
router.get('/:id', async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id).populate('courseId', 'title');
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }
    res.json(assignment);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update Assignment (faculty/admin)
router.put('/:id', authMiddleware, async (req, res) => {
  if (!['faculty', 'admin'].includes(req.user.role)) {
    return res.status(403).json({ message: 'Unauthorized' });
  }
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }
    Object.assign(assignment, req.body);
    await assignment.save();
    res.json(assignment);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete Assignment (faculty/admin)
router.delete('/:id', authMiddleware, async (req, res) => {
  if (!['faculty', 'admin'].includes(req.user.role)) {
    return res.status(403).json({ message: 'Unauthorized' });
  }
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }
    await assignment.deleteOne();
    res.json({ message: 'Assignment deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Generate Feedback (faculty/admin, Gemini)
router.post('/:id/feedback', authMiddleware, async (req, res) => {
  if (!['faculty', 'admin'].includes(req.user.role)) {
    return res.status(403).json({ message: 'Unauthorized' });
  }
  const { submissionText } = req.body;
  try {
    const prompt = `Review this assignment submission: "${submissionText}". Provide constructive feedback (50-100 words) and a grade (0-100).`;
    const feedback = await generateContent(prompt);
    res.json({ feedback });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;