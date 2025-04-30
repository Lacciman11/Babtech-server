const Exam = require('../../model/examSchema');
const Cohort = require('../../model/cohortSchema');

/**
 * Create a new exam
 */
const createExam = async (req, res) => {
  try {
    const { topic, module, questions, cohortId } = req.body;

    if (!topic || !module || !questions || !cohortId) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const cohort = await Cohort.findById(cohortId);
    if (!cohort) return res.status(404).json({ error: "Cohort not found" });

    if (!Array.isArray(questions)) {
      return res.status(400).json({ error: "Questions must be an array" });
    }

    const exam = new Exam({ topic, module, questions, cohortId });
    await exam.save();

    res.status(201).json({
      success: true,
      data: exam
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
};

/**
 * Get all exams
 */
const getExams = async (req, res) => {
  try {
    const exams = await Exam.find()
      .populate('cohortId', 'name')
      .select('-questions.correctAnswers');

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
 * Get single exam
 */
const getExamById = async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id)
      .populate('cohortId', 'name description')
      .populate('studentsTaken.studentId', 'name email');

    if (!exam) return res.status(404).json({ error: "Exam not found" });

    res.status(200).json({
      success: true,
      data: exam
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Delete exam
 */
const deleteExam = async (req, res) => {
  try {
    const exam = await Exam.findByIdAndDelete(req.params.id);
    if (!exam) return res.status(404).json({ error: "Exam not found" });

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

module.exports = {
  createExam,
  getExams,
  getExamById,
  deleteExam
};