// /**
//  * @swagger
//  * tags:
//  *   name: Admin Exams
//  *   description: Exam management by administrators
//  */

// /**
//  * @swagger
//  * components:
//  *   schemas:
//  *     Exam:
//  *       type: object
//  *       properties:
//  *         _id:
//  *           type: string
//  *           example: "507f1f77bcf86cd799439011"
//  *         topic:
//  *           type: string
//  *           example: "JavaScript Basics"
//  *         module:
//  *           type: string
//  *           example: "Module 1"
//  *         cohortId:
//  *           type: string
//  *           example: "507f1f77bcf86cd799439012"
//  *         questions:
//  *           type: array
//  *           items:
//  *             $ref: '#/components/schemas/Question'
//  *         studentsTaken:
//  *           type: array
//  *           items:
//  *             $ref: '#/components/schemas/StudentSubmission'
//  *         createdAt:
//  *           type: string
//  *           format: date-time
//  *         updatedAt:
//  *           type: string
//  *           format: date-time
//  * 
//  *     Question:
//  *       type: object
//  *       properties:
//  *         _id:
//  *           type: string
//  *         questionText:
//  *           type: string
//  *         options:
//  *           type: array
//  *           items:
//  *             type: string
//  *         correctAnswers:
//  *           type: array
//  *           items:
//  *             type: string
//  */

// /**
//  * @swagger
//  * /admin/exams:
//  *   post:
//  *     tags: [Admin Exams]
//  *     summary: Create a new exam
//  *     security:
//  *       - bearerAuth: []
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema:
//  *             $ref: '#/components/schemas/Exam'
//  *     responses:
//  *       201:
//  *         description: Exam created successfully
//  *         content:
//  *           application/json:
//  *             schema:
//  *               type: object
//  *               properties:
//  *                 success:
//  *                   type: boolean
//  *                 data:
//  *                   $ref: '#/components/schemas/Exam'
//  */

// /**
//  * @swagger
//  * /admin/exams:
//  *   get:
//  *     tags: [Admin Exams]
//  *     summary: Get all exams
//  *     security:
//  *       - bearerAuth: []
//  *     responses:
//  *       200:
//  *         description: List of exams
//  *         content:
//  *           application/json:
//  *             schema:
//  *               type: object
//  *               properties:
//  *                 success:
//  *                   type: boolean
//  *                 count:
//  *                   type: integer
//  *                 data:
//  *                   type: array
//  *                   items:
//  *                     $ref: '#/components/schemas/Exam'
//  */

// /**
//  * @swagger
//  * /admin/exams/{id}:
//  *   get:
//  *     tags: [Admin Exams]
//  *     summary: Get exam details
//  *     security:
//  *       - bearerAuth: []
//  *     parameters:
//  *       - in: path
//  *         name: id
//  *         required: true
//  *         schema:
//  *           type: string
//  *     responses:
//  *       200:
//  *         description: Exam details
//  *         content:
//  *           application/json:
//  *             schema:
//  *               $ref: '#/components/schemas/Exam'
//  */

// /**
//  * @swagger
//  * /admin/exams/{id}:
//  *   delete:
//  *     tags: [Admin Exams]
//  *     summary: Delete an exam
//  *     security:
//  *       - bearerAuth: []
//  *     parameters:
//  *       - in: path
//  *         name: id
//  *         required: true
//  *         schema:
//  *           type: string
//  *     responses:
//  *       200:
//  *         description: Exam deleted successfully
//  *         content:
//  *           application/json:
//  *             schema:
//  *               type: object
//  *               properties:
//  *                 success:
//  *                   type: boolean
//  *                 data:
//  *                   type: object
//  */