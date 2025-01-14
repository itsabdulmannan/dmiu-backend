const authRouter = require('express').Router();
const authController = require('../controllers/auth.Controller');
const { authenticate, authorize } = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: User Authentication API
 */

/**
 * @swagger
 * /auth/login-author:
 *   post:
 *     summary: Login an author
 *     description: This endpoint authenticates an author and provides a token.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: author@example.com
 *               password:
 *                 type: string
 *                 example: author123
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   example: eyJhbGciOiJIUzI1NiIsInR...
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied
 *       400:
 *         description: Bad Request
 */

authRouter.post('/login', authController.loginAuthor);

/**
 * @swagger
 * /auth/login-admin:
 *   post:
 *     summary: Login a Chief Editor or Section Head
 *     description: This endpoint authenticates a Chief Editor or Section Head and provides a token.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: chiefeditor@example.com
 *               password:
 *                 type: string
 *                 example: chiefeditor123
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   example: eyJhbGciOiJIUzI1NiIsInR...
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied
 *       400:
 *         description: Bad Request
 */
authRouter.post('/login', authController.loginAdmin);

/**
 * @swagger
 * /auth/reset-password:
 *   post:
 *     summary: Reset user password
 *     description: Allows the user to reset their password using a valid reset token.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: johndoe@example.com
 *     responses:
 *       200:
 *         description: Password reset successfully
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
 *                   example: "Password reset successful."
 *       401:
 *         description: Invalid or expired token
 */
authRouter.post('/reset-password', authController.resetPassword);

module.exports = authRouter;
