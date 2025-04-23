const mongoose = require('mongoose');

const contentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, required: true }, // e.g., 'pdf', 'video'
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  uploadDate: { type: Date, default: Date.now },
  filePath: { type: String, required: true }, // Path to stored file
});

module.exports = mongoose.model('Content', contentSchema);