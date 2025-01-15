const express = require('express');
const paperController = require('../controllers/paper.Controller');
const upload = require('../middleware/multer');
const { authenticate, authorize } = require('../middleware/auth');
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
]), authenticate, authorize('author'), paperController.addPaper);

/**
 * @swagger
 * /papers/get:
 *   get:
 *     summary: Get all papers, papers by ID, or filtered papers by archive or inPress
 *     tags: [Papers]
 *     parameters:
 *       - in: query
 *         name: id
 *         schema:
 *           type: string
 *         description: Paper ID
 *       - in: query
 *         name: archive
 *         schema:
 *           type: boolean
 *         description: Set to true to retrieve papers older than 30 days
 *       - in: query
 *         name: inPress
 *         schema:
 *           type: boolean
 *         description: Set to true to retrieve papers posted exactly 30 days ago
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
 * /papers/updateStatus:
 *   put:
 *     summary: Update the status of a paper For The Chief Editor
 *     description: Allows a chief editor to update the status of a paper, including adding comments and a date to the status history.
 *     tags: [SectionHeads And Cheif Editor]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - paperID
 *               - status
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
 *               sectionHeadIds:
 *                 type: array
 *                 description: List of section head IDs to assign the paper to when status is 'assigned'
 *                 items:
 *                   type: integer
 *                   example: 5
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

paperRouter.put('/updateStatus', authenticate, authorize('cheifEditor'), paperController.updatePaperStatusForCheifEditor);

/**
 * @swagger
 * /papers/updateStatusForSectionHead:
 *   put:
 *     summary: Update the status of a paper by a Section Head and assign to section heads
 *     description: Allows a section head to update the status of a paper (e.g., assign it to themselves or others for review).
 *     tags:
 *       - SectionHeads
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - paperID
 *               - status
 *             properties:
 *               paperID:
 *                 type: integer
 *                 description: ID of the paper to update
 *                 example: 1
 *               status:
 *                 type: string
 *                 description: Status to update the paper to (e.g., 'assigned')
 *                 example: assigned
 *               comment:
 *                 type: string
 *                 description: Optional comment about the status change
 *                 example: Assigned for review
 *               date:
 *                 type: string
 *                 format: date-time
 *                 description: Optional date of the status change
 *                 example: 2025-01-15T12:00:00Z
 *     responses:
 *       200:
 *         description: Paper status updated and section head(s) assigned successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Paper status updated and section head(s) assigned successfully
 *       400:
 *         description: Invalid request parameters (e.g., missing section head IDs or invalid status)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Invalid status or missing section head IDs
 *       403:
 *         description: User is not authorized to update the paper status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Only a section head can update the paper status
 *       404:
 *         description: Paper not found
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

paperRouter.put('/updateStatusForSectionHead', authenticate, authorize('sectionHead'), paperController.updatePaperStatusForSectionHead);

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