const mongoose = require('mongoose');

const examSchema = new mongoose.Schema({
  topic: { 
    type: String, 
    required: true 
  },
  module: { 
    type: String, 
    required: true 
  },
  questions: [{
    questionText: { 
      type: String, 
      required: true 
    },
    options: [{ 
      type: String, 
      required: true 
    }], 
    correctAnswers: [{ 
      type: String, 
      required: true 
    }] 
  }],
  studentsTaken: [{
    studentId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Student', 
      required: true 
    },
    studentName: { 
      type: String, 
      required: true 
    },
    score: { 
      type: Number, 
      default: 0 
    },
    dateTaken: { 
      type: Date, 
      default: Date.now 
    }
  }],
  cohortId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Cohort', 
    required: true 
  }
}, { timestamps: true });

module.exports = mongoose.model('Exam', examSchema);