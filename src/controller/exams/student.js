const Exam = require('../../model/examSchema');
const Cohort = require('../../model/cohortSchema');
/**
 * Submit exam answers
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

// Helper Functions
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
  submitExam
};