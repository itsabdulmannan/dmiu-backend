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
 *     summary: Get users by ID or role
 *     description: Fetch users based on their ID or role. If both parameters are missing, all users will be returned.
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: User(s) retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */

userRouter.get('/get', authenticate, userController.getAllUsers);
/**
 * @swagger
 * /users/update:
 *   put:
 *     summary: Update a user by their token
 *     description: Update a user's details by extracting user ID from the authentication token.
 *     tags: [Users]
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
 *               phone:
 *                 type: string
 *                 example: "+1234567890"
 *               password:
 *                 type: string
 *                 example: "password123"
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

userRouter.put('/update', authenticate, userController.updateUser);


/**
 * @swagger
 * components:
 *   schemas:
 *     SectionHead:
 *       type: object
 *       required:
 *         - title
 *         - country
 *         - firstName
 *         - lastName
 *         - specialization
 *         - affiliation
 *         - email
 *         - phone
 *       properties:
 *         title:
 *           type: string
 *           description: The title of the section head (e.g., Mr., Dr.)
 *         country:
 *           type: string
 *           description: The country of the section head.
 *         firstName:
 *           type: string
 *           description: The first name of the section head.
 *         lastName:
 *           type: string
 *           description: The last name of the section head.
 *         specialization:
 *           type: string
 *           description: The specialization of the section head (e.g., "Physics", "Mathematics").
 *         affiliation:
 *           type: string
 *           description: The affiliation (e.g., the organization or university) of the section head.
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
 *     tags: [SectionHeads And Cheif Editor]
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

/**
 * @swagger
 * /users/section-heads:
 *   get:
 *     summary: Get section heads based on role
 *     description: Fetches a list of users with the role of "sectionHead", with optional pagination.
 *     tags:
 *       - SectionHeads
 *     parameters:
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *         description: The number of records to skip. Default is 0.
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: The number of records to return. Default is 10.
 *     responses:
 *       200:
 *         description: Successfully fetched section heads.
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
 *                   example: Section heads fetched successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 1
 *                       name:
 *                         type: string
 *                         example: John Doe
 *                       email:
 *                         type: string
 *                         example: johndoe@example.com
 *                       role:
 *                         type: string
 *                         example: sectionHead
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                       description: The total number of section heads.
 *                     offset:
 *                       type: integer
 *                       description: The number of records skipped.
 *                     limit:
 *                       type: integer
 *                       description: The number of records returned per page.
 *                     totalPages:
 *                       type: integer
 *                       description: The total number of pages available.
 *                     currentPage:
 *                       type: integer
 *                       description: The current page number.
 *       400:
 *         description: Invalid or missing query parameter.
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
 *                   example: Invalid or missing userRole query parameter
 *       404:
 *         description: No section heads found.
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
 *                   example: No section heads found
 *       500:
 *         description: Internal server error.
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
 *                   example: An error occurred while fetching section heads
 *                 error:
 *                   type: string
 *                   example: Error message
 */

userRouter.get('/section-heads', authenticate, authorize('cheifEditor'), userController.getSectionHead);

module.exports = userRouter;