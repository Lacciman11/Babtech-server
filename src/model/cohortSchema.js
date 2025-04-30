const mongoose = require('mongoose');

const cohortSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: "" 
  },
  instructorName: {
    type: String,
    required: true
  },
  students: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student' 
  }],
  modules: [{
    type: String,
    trim: true
  }]
}, { timestamps: true });

module.exports = mongoose.model('Cohort', cohortSchema);