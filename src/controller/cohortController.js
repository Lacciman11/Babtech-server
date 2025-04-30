const Cohort = require('./models/Cohort');
const Student = require('./models/Student'); // Assuming you have a Student model

/**
 * @desc    Create a new cohort
 * @route   POST /api/cohorts
 * @access  Admin
 */
const createCohort = async (req, res) => {
  try {
    const { name, instructorName, description = "", modules = [] } = req.body;

    // Validate required fields
    if (!name || !instructorName) {
      return res.status(400).json({ error: "Name and instructor name are required" });
    }

    const cohort = new Cohort({ name, instructorName, description, modules });
    await cohort.save();

    res.status(201).json(cohort);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * @desc    Get all cohorts
 * @route   GET /api/cohorts
 * @access  Admin/Instructor
 */
const getAllCohorts = async (req, res) => {
  try {
    const cohorts = await Cohort.find()
      .populate('students', 'name email') // Optional: populate student details
      .select('-__v'); // Exclude version key

    res.status(200).json(cohorts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * @desc    Get single cohort by ID
 * @route   GET /api/cohorts/:id
 * @access  Admin/Instructor
 */
const getCohortById = async (req, res) => {
  try {
    const cohort = await Cohort.findById(req.params.id)
      .populate('students', 'name email');

    if (!cohort) {
      return res.status(404).json({ error: "Cohort not found" });
    }

    res.status(200).json(cohort);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * @desc    Add student to cohort
 * @route   PATCH /api/cohorts/:id/students
 * @access  Admin
 */
const addStudentToCohort = async (req, res) => {
  try {
    const { studentId } = req.body;

    // Validate student exists
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ error: "Student not found" });
    }

    const cohort = await Cohort.findByIdAndUpdate(
      req.params.id,
      { $addToSet: { students: studentId } }, // Prevent duplicates
      { new: true }
    ).populate('students', 'name email');

    if (!cohort) {
      return res.status(404).json({ error: "Cohort not found" });
    }

    res.status(200).json(cohort);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * @desc    Update cohort details
 * @route   PUT /api/cohorts/:id
 * @access  Admin
 */
const updateCohort = async (req, res) => {
  try {
    const updates = Object.keys(req.body);
    const allowedUpdates = ['name', 'description', 'instructorName', 'modules'];
    const isValidOperation = updates.every(update => allowedUpdates.includes(update));

    if (!isValidOperation) {
      return res.status(400).json({ error: "Invalid updates!" });
    }

    const cohort = await Cohort.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!cohort) {
      return res.status(404).json({ error: "Cohort not found" });
    }

    res.status(200).json(cohort);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


/**
 * @desc    Get all students in a cohort
 * @route   GET /api/cohorts/:id/students
 * @access  Admin/Instructor
 */
const getAllStudentsInCohort = async (req, res) => {
    try {
      // 1. Find the cohort and populate student details
      const cohort = await Cohort.findById(req.params.id)
        .populate({
          path: 'students',
          select: 'name email role', // Only show these fields
          options: { sort: { name: 1 } } // Sort by name A-Z
        });
  
      // 2. Check if cohort exists
      if (!cohort) {
        return res.status(404).json({ error: "Cohort not found" });
      }
  
      // 3. Return just the students array
      res.status(200).json(cohort.students);
      
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };


/**
 * @desc    Get a single student in a cohort
 * @route   GET /api/cohorts/:cohortId/students/:studentId
 * @access  Admin/Instructor
 */
const getStudentInCohort = async (req, res) => {
    try {
      // 1. Find the cohort
      const cohort = await Cohort.findById(req.params.cohortId);
      
      // 2. Check if cohort exists
      if (!cohort) {
        return res.status(404).json({ error: "Cohort not found" });
      }
  
      // 3. Check if student is in this cohort
      const isInCohort = cohort.students.some(id => id.toString() === req.params.studentId);
      if (!isInCohort) {
        return res.status(404).json({ error: "Student not found in this cohort" });
      }
  
      // 4. Get full student details
      const student = await Student.findById(req.params.studentId)
        .select('-password'); // Don't return password
  
      res.status(200).json(student);
      
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

/**
 * @desc    Delete a cohort
 * @route   DELETE /api/cohorts/:id
 * @access  Admin
 */
const deleteCohort = async (req, res) => {
  try {
    const cohort = await Cohort.findByIdAndDelete(req.params.id);

    if (!cohort) {
      return res.status(404).json({ error: "Cohort not found" });
    }

    res.status(200).json({ message: "Cohort deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createCohort,
  getAllCohorts,
  getCohortById,
  addStudentToCohort,
  getAllStudentsInCohort,
  getStudentInCohort,  
  updateCohort,
  deleteCohort
};