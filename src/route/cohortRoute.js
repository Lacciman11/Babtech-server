const express = require('express');
const router = express.Router();
const {
  createCohort,
  getAllCohorts,
  getCohortById,
  addStudentToCohort,
  getAllStudentsInCohort,
  getStudentInCohort,
  updateCohort,
  deleteCohort
} = require('../controller/cohortController');
const { authMiddleware, isAdmin, isAdminOrInstructor } = require('../middleware/roleAuth');

/**
 * @swagger
 * components:
 *   schemas:
 *     Cohort:
 *       type: object
 *       required:
 *         - name
 *         - instructorName
 *       properties:
 *         name:
 *           type: string
 *           description: Name of the cohort
 *         instructorName:
 *           type: string
 *           description: Name of the instructor
 *         description:
 *           type: string
 *           description: Cohort description
 *         modules:
 *           type: array
 *           items:
 *             type: string
 *           description: List of modules in the cohort
 *         students:
 *           type: array
 *           items:
 *             type: string
 *           description: List of student IDs
 *     Student:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: Student ID
 *         name:
 *           type: string
 *           description: Student's full name
 *         email:
 *           type: string
 *           description: Student's email
 *         role:
 *           type: string
 *           enum: [student]
 *           description: Student role
 */

/**
 * @swagger
 * /api/cohorts:
 *   post:
 *     summary: Create a new cohort
 *     tags: [Cohorts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Cohort'
 *     responses:
 *       201:
 *         description: Cohort created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Cohort'
 *       400:
 *         description: Missing required fields
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied (admin only)
 *       500:
 *         description: Server error
 */
router.post('/', authMiddleware, isAdmin, createCohort);

/**
 * @swagger
 * /api/cohorts:
 *   get:
 *     summary: Get all cohorts
 *     tags: [Cohorts]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all cohorts
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Cohort'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied (admin/instructor only)
 *       500:
 *         description: Server error
 */
router.get('/', authMiddleware, isAdminOrInstructor, getAllCohorts);

/**
 * @swagger
 * /api/cohorts/{id}:
 *   get:
 *     summary: Get a cohort by ID
 *     tags: [Cohorts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Cohort ID
 *     responses:
 *       200:
 *         description: Cohort details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Cohort'
 *       404:
 *         description: Cohort not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied (admin/instructor only)
 *       500:
 *         description: Server error
 */
router.get('/:id', authMiddleware, isAdminOrInstructor, getCohortById);

/**
 * @swagger
 * /api/cohorts/{id}/students:
 *   patch:
 *     summary: Add a student to a cohort
 *     tags: [Cohorts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Cohort ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - studentId
 *             properties:
 *               studentId:
 *                 type: string
 *                 description: ID of the student to add
 *     responses:
 *       200:
 *         description: Student added to cohort
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Cohort'
 *       404:
 *         description: Cohort or student not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied (admin only)
 *       500:
 *         description: Server error
 */
router.patch('/:id/students', authMiddleware, isAdmin, addStudentToCohort);

/**
 * @swagger
 * /api/cohorts/{id}/students:
 *   get:
 *     summary: Get all students in a cohort
 *     tags: [Cohorts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Cohort ID
 *     responses:
 *       200:
 *         description: List of students in the cohort
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Student'
 *       404:
 *         description: Cohort not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied (admin/instructor only)
 *       500:
 *         description: Server error
 */
router.get('/:id/students', authMiddleware, isAdminOrInstructor, getAllStudentsInCohort);

/**
 * @swagger
 * /api/cohorts/{cohortId}/students/{studentId}:
 *   get:
 *     summary: Get a single student in a cohort
 *     tags: [Cohorts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: cohortId
 *         required: true
 *         schema:
 *           type: string
 *         description: Cohort ID
 *       - in: path
 *         name: studentId
 *         required: true
 *         schema:
 *           type: string
 *         description: Student ID
 *     responses:
 *       200:
 *         description: Student details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Student'
 *       404:
 *         description: Cohort or student not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied (admin/instructor only)
 *       500:
 *         description: Server error
 */
router.get('/:cohortId/students/:studentId', authMiddleware, isAdminOrInstructor, getStudentInCohort);

/**
 * @swagger
 * /api/cohorts/{id}:
 *   put:
 *     summary: Update cohort details
 *     tags: [Cohorts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Cohort ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Cohort'
 *     responses:
 *       200:
 *         description: Cohort updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Cohort'
 *       400:
 *         description: Invalid updates
 *       404:
 *         description: Cohort not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied (admin only)
 *       500:
 *         description: Server error
 */
router.put('/:id', authMiddleware, isAdmin, updateCohort);

/**
 * @swagger
 * /api/cohorts/{id}:
 *   delete:
 *     summary: Delete a cohort
 *     tags: [Cohorts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Cohort ID
 *     responses:
 *       200:
 *         description: Cohort deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Cohort deleted successfully
 *       404:
 *         description: Cohort not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied (admin only)
 *       500:
 *         description: Server error
 */
router.delete('/:id', authMiddleware, isAdmin, deleteCohort);

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

module.exports = router;