const express = require('express');
const router = express.Router();
const { generateQuiz } = require('../services/gemini');
const auth = require('./auth').auth;

// Generate quiz
router.post('/generate', auth, async (req, res) => {
  if (req.user.role !== 'faculty' && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied' });
  }
  try {
    const { courseId } = req.body;
    const quiz = await generateQuiz(`Generate a 5-question quiz for course ID ${courseId}`);
    res.json({ _id: Date.now(), questions: quiz });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;