const Exam = require('../../model/examSchema');
const Cohort = require('../../model/cohortSchema');

/**
 * Get available exams for a student
 */
const getAvailableExams = async (req, res) => {
  try {
    const { studentId } = req.params;
    
    // Find cohorts the student belongs to
    const cohorts = await Cohort.find({ students: studentId });
    
    if (!cohorts.length) {
      return res.status(200).json({
        success: true,
        data: [],
        message: "No exams available - not enrolled in any cohorts"
      });
    }

    // Find exams for these cohorts that the student hasn't taken yet
    const exams = await Exam.find({
      cohortId: { $in: cohorts.map(c => c._id) },
      "studentsTaken.studentId": { $ne: studentId }
    }).select('-questions.correctAnswers -studentsTaken');

    res.status(200).json({
      success: true,
      count: exams.length,
      data: exams
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Get exam for taking (without correct answers)
 */
const getExamForTaking = async (req, res) => {
  try {
    const { examId, studentId } = req.params;

    // Verify student is in the exam's cohort
    const exam = await Exam.findById(examId);
    if (!exam) {
      return res.status(404).json({
        success: false,
        error: "Exam not found"
      });
    }

    const cohort = await Cohort.findOne({
      _id: exam.cohortId,
      students: studentId
    });
    if (!cohort) {
      return res.status(403).json({
        success: false,
        error: "Not enrolled in this cohort"
      });
    }

    // Check if already taken
    const alreadyTaken = exam.studentsTaken.some(
      submission => submission.studentId.toString() === studentId
    );
    if (alreadyTaken) {
      return res.status(400).json({
        success: false,
        error: "Exam already taken"
      });
    }

    // Return exam without correct answers
    const examForStudent = {
      _id: exam._id,
      topic: exam.topic,
      module: exam.module,
      cohortId: exam.cohortId,
      questions: exam.questions.map(q => ({
        _id: q._id,
        questionText: q.questionText,
        options: q.options,
        questionType: q.questionType
      }))
    };

    res.status(200).json({
      success: true,
      data: examForStudent
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Submit exam answers (same as previous implementation)
 */
const submitExam = async (req, res) => {
  try {
    const { studentId, answers } = req.body;
    const exam = await Exam.findById(req.params.id);
    
    if (!exam) {
      return res.status(404).json({
        success: false,
        error: "Exam not found"
      });
    }

    const cohort = await Cohort.findOne({
      _id: exam.cohortId,
      students: studentId
    });
    if (!cohort) {
      return res.status(403).json({
        success: false,
        error: "Not enrolled in this cohort"
      });
    }

    const existingSubmission = exam.studentsTaken.find(
      submission => submission.studentId.toString() === studentId
    );
    if (existingSubmission) {
      return res.status(400).json({
        success: false,
        error: "Exam already submitted"
      });
    }

    const score = calculateScore(exam.questions, answers);

    exam.studentsTaken.push({
      studentId,
      studentName: req.user.name,
      score,
      dateTaken: new Date()
    });

    await exam.save();

    res.status(200).json({
      success: true,
      data: {
        score,
        totalQuestions: exam.questions.length
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Get exam results for a student
 */
const getExamResults = async (req, res) => {
  try {
    const { examId, studentId } = req.params;

    const exam = await Exam.findOne({
      _id: examId,
      "studentsTaken.studentId": studentId
    }).select('topic module studentsTaken.$');

    if (!exam) {
      return res.status(404).json({
        success: false,
        error: "Exam results not found"
      });
    }

    const submission = exam.studentsTaken.find(
      s => s.studentId.toString() === studentId
    );

    res.status(200).json({
      success: true,
      data: {
        examDetails: {
          topic: exam.topic,
          module: exam.module
        },
        result: {
          score: submission.score,
          dateTaken: submission.dateTaken,
          totalQuestions: exam.questions.length
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Helper functions (same as before)
function calculateScore(questions, studentAnswers) {
  let correctCount = 0;
  questions.forEach((question, index) => {
    if (arraysEqual(question.correctAnswers, studentAnswers[index])) {
      correctCount++;
    }
  });
  return Math.round((correctCount / questions.length) * 100);
}

function arraysEqual(a, b) {
  if (a.length !== b.length) return false;
  return a.every((val, i) => val === b[i]);
}

module.exports = {
  getAvailableExams,
  getExamForTaking,
  submitExam,
  getExamResults
};