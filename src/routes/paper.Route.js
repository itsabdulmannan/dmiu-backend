const express = require('express');
const paperController = require('../controllers/paper.Controller');
const upload = require('../middleware/multer');
const paperRouter = express.Router();

/**
 * @swagger
 * tags:
 *   name: Papers
 *   description: API for managing papers
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Paper:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         manuScriptTitle:
 *           type: string
 *         manuScriptType:
 *           type: string
 *         runningTitle:
 *           type: string
 *         subject:
 *           type: string
 *         abstract:
 *           type: string
 *         correspondingAuthorName:
 *           type: string
 *         correspondingAuthorEmail:
 *           type: string
 *         noOfAuthors:
 *           type: integer
 *         authors:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               fullName:
 *                 type: string
 *               affiliation:
 *                 type: string
 *               country:
 *                 type: string
 *               email:
 *                 type: string
 *           default: 
 *             - fullName: "John Doe"
 *               affiliation: "University X"
 *               country: "Country Y"
 *               email: "john.doe@example.com"
 *         reviewers:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               fullName:
 *                 type: string
 *               affiliation:
 *                 type: string
 *               country:
 *                 type: string
 *               email:
 *                 type: string
 *           default:
 *             - fullName: "Reviewer Name"
 *               affiliation: "Institution A"
 *               country: "Country Z"
 *               email: "reviewer@example.com"
 *         authorsConflict:
 *           type: string
 *         dataAvailability:
 *           type: string
 *         mainManuscript:
 *           type: string
 *           format: binary
 *         coverLetter:
 *           type: string
 *           format: binary
 *         supplementaryFile:
 *           type: string
 *           format: binary
 *         paperStatus:
 *           type: string
 *           enum:
 *             - submitted
 *             - under review
 *             - accepted
 *             - rejected
 *             - pending
 */

/**
 * @swagger
 * /papers/create:
 *   post:
 *     summary: Add a new paper with file uploads and authors/reviewers
 *     tags: [Papers]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               manuScriptTitle:
 *                 type: string
 *               manuScriptType:
 *                 type: string
 *               runningTitle:
 *                 type: string
 *               subject:
 *                 type: string
 *               abstract:
 *                 type: string
 *               correspondingAuthorName:
 *                 type: string
 *               correspondingAuthorEmail:
 *                 type: string
 *               noOfAuthors:
 *                 type: integer
 *               authors:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     fullName:
 *                       type: string
 *                     affiliation:
 *                       type: string
 *                     country:
 *                       type: string
 *                     email:
 *                       type: string
 *                 default:
 *                   - fullName: "John Doe"
 *                     affiliation: "University X"
 *                     country: "Country Y"
 *                     email: "john.doe@example.com"
 *               reviewers:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     fullName:
 *                       type: string
 *                     affiliation:
 *                       type: string
 *                     country:
 *                       type: string
 *                     email:
 *                       type: string
 *                 default:
 *                   - fullName: "Reviewer Name"
 *                     affiliation: "Institution A"
 *                     country: "Country Z"
 *                     email: "reviewer@example.com"
 *               authorsConflict:
 *                 type: string
 *               dataAvailability:
 *                 type: string
 *               mainManuscript:
 *                 type: string
 *                 format: binary
 *               coverLetter:
 *                 type: string
 *                 format: binary
 *               supplementaryFile:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Paper added successfully with files
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 paper:
 *                   $ref: '#/components/schemas/Paper'
 *       400:
 *         description: Invalid input data
 *       500:
 *         description: Internal server error
 */
paperRouter.post('/create', upload.fields([
    { name: 'mainManuscript', maxCount: 1 },
    { name: 'coverLetter', maxCount: 1 },
    { name: 'supplementaryFile', maxCount: 1 }
]), paperController.addPaper);

/**
 * @swagger
 * /papers/get:
 *   get:
 *     summary: Get all papers or a paper by ID
 *     tags: [Papers]
 *     parameters:
 *       - in: query
 *         name: id
 *         schema:
 *           type: string
 *         description: Paper ID
 *     responses:
 *       200:
 *         description: A list of papers or a single paper
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Paper'
 *       404:
 *         description: Paper not found
 *       500:
 *         description: Internal server error
 */
paperRouter.get('/get', paperController.getAllPapers);

/**
 * @swagger
 * /paper/updateStatus:
 *   put:
 *     summary: Update the status of a paper
 *     description: Allows a chief editor to update the status of a paper, including adding comments and a date to the status history.
 *     tags:
 *       - Papers
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - paperID
 *               - status
 *               - userId
 *             properties:
 *               paperID:
 *                 type: integer
 *                 description: ID of the paper to update
 *                 example: 1
 *               status:
 *                 type: string
 *                 description: New status of the paper
 *                 example: Approved
 *               comment:
 *                 type: string
 *                 description: Optional comment about the status change
 *                 example: The paper meets all the required standards.
 *               date:
 *                 type: string
 *                 format: date-time
 *                 description: Optional date of the status change
 *                 example: 2025-01-10T12:00:00Z
 *               userId:
 *                 type: integer
 *                 description: ID of the user attempting the status update
 *                 example: 42
 *     responses:
 *       200:
 *         description: Paper status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Paper status updated successfully
 *       403:
 *         description: User is not authorized to update the paper status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Only a chief editor can update the paper status
 *       404:
 *         description: Paper or user not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Paper not found
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Server error
 *                 error:
 *                   type: string
 *                   example: Detailed error message
 */
paperRouter.post('/updateStatus', paperController.updatePaperStatus);

/**
 * @swagger
 * /papers/update/{id}:
 *   put:
 *     summary: Update a paper by ID
 *     tags: [Papers]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Paper ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               manuScriptTitle:
 *                 type: string
 *               manuScriptType:
 *                 type: string
 *               runningTitle:
 *                 type: string
 *               subject:
 *                 type: string
 *               abstract:
 *                 type: string
 *               correspondingAuthorName:
 *                 type: string
 *               correspondingAuthorEmail:
 *                 type: string
 *               noOfAuthors:
 *                 type: integer
 *               authors:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                     email:
 *                       type: string
 *               reviewers:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                     email:
 *                       type: string
 *               authorsConflict:
 *                 type: string
 *               dataAvailability:
 *                 type: string
 *               mainManuscript:
 *                 type: string
 *               coverLetter:
 *                 type: string
 *               supplementaryFile:
 *                 type: string
 *               paperStatus:
 *                 type: string
 *                 enum:
 *                   - submitted
 *                   - under review
 *                   - accepted
 *                   - rejected
 *                   - pending
 *               statusHistory:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     status:
 *                       type: string
 *                     date:
 *                       type: string
 *                       format: date-time
 *     responses:
 *       200:
 *         description: Paper updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 paper:
 *                   $ref: '#/components/schemas/Paper'
 *       400:
 *         description: Invalid input data
 *       404:
 *         description: Paper not found
 *       500:
 *         description: Internal server error
 */
paperRouter.put('/update/:id', paperController.updatePaper);

/**
 * @swagger
 * /papers/delete/{id}:
 *   delete:
 *     summary: Delete a paper by ID
 *     tags: [Papers]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Paper ID
 *     responses:
 *       200:
 *         description: Paper deleted successfully
 *       404:
 *         description: Paper not found
 *       500:
 *         description: Internal server error
 */
paperRouter.delete('/delete/:id', paperController.deletePaper);

module.exports = paperRouter;