const epxress = require('express');
const userRouter = epxress.Router();
const userController = require('../controllers/userController');
const { authenticate, authorize } = require('../middleware/auth')

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         title:
 *           type: string
 *           description: The user's title (e.g., Mr., Dr.)
 *         country:
 *           type: string
 *           description: The user's country
 *         firstName:
 *           type: string
 *           description: The user's first name
 *         lastName:
 *           type: string
 *           description: The user's last name
 *         specialization:
 *           type: string
 *           description: The user's specialization
 *         affiliation:
 *           type: string
 *           description: The user's affiliation
 *         email:
 *           type: string
 *           description: The user's email
 *         phone:
 *           type: string
 *           description: The user's phone number
 *         password:
 *           type: string
 *           description: The user's password
 */

/**
 * @swagger
 * /users/create:
 *   post:
 *     summary: Create a new user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: User already exists
 *       500:
 *         description: Internal server error
 */
userRouter.post('/create', userController.createUser);

/**
 * @swagger
 * /users/get:
 *   get:
 *     summary: Get a user by ID
 *     description: Fetch a user's details by their ID (ID passed as query parameter).
 *     tags: [Users]
 *     parameters:
 *       - in: query
 *         name: id
 *         required: false
 *         schema:
 *           type: integer
 *         description: ID of the user to retrieve
 *     responses:
 *       200:
 *         description: User retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
userRouter.get('/get', userController.getAllUsers);

/**
 * @swagger
 * /users/update:
 *   put:
 *     summary: Update a user by ID
 *     description: Update a user's details by their ID (ID passed as query parameter).
 *     tags: [Users]
 *     parameters:
 *       - in: query
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the user to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Dr."
 *               country:
 *                 type: string
 *                 example: "USA"
 *               firstName:
 *                 type: string
 *                 example: "John"
 *               lastName:
 *                 type: string
 *                 example: "Doe"
 *               specialization:
 *                 type: string
 *                 example: "Software Engineer"
 *               affiliation:
 *                 type: string
 *                 example: "ABC Corp"
 *               email:
 *                 type: string
 *                 example: "john.doe@example.com"
 *               phone:
 *                 type: string
 *                 example: "+1234567890"
 *               password:
 *                type: string
 *                example: "password123"
 *     responses:
 *       200:
 *         description: User updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "User updated successfully"
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
userRouter.put('/update', userController.updateUser);

/**
 * @swagger
 * components:
 *   schemas:
 *     SectionHead:
 *       type: object
 *       required:
 *         - title
 *         - firstName
 *         - lastName
 *         - email
 *         - phone
 *       properties:
 *         title:
 *           type: string
 *           description: The title of the section head (e.g., Mr., Dr.)
 *         firstName:
 *           type: string
 *           description: The first name of the section head.
 *         lastName:
 *           type: string
 *           description: The last name of the section head.
 *         email:
 *           type: string
 *           description: The email address of the section head.
 *         phone:
 *           type: string
 *           description: The phone number of the section head.
 * 
 * /users/sectionheads/create:
 *   post:
 *     summary: Create a new Section Head
 *     tags: [SectionHeads]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SectionHead'
 *     responses:
 *       201:
 *         description: Section Head created successfully and login credentials sent to the email.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Section created successfully"
 *                 data:
 *                   $ref: '#/components/schemas/SectionHead'
 *       400:
 *         description: Invalid email format or user already exists.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Invalid email format"
 *       500:
 *         description: Internal server error or failed to send the verification email.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Internal server error"
 */

userRouter.post('/sectionheads/create', authenticate, authorize('cheifEditor'), userController.createSectionheads);

module.exports = userRouter;