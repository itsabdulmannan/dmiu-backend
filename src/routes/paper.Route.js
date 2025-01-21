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
 *               apcs:
 *                 type: boolean
 *                 description: Indicates whether APCs have been agreed upon.
 *                 default: false
 *               studiedAndUnderstood:
 *                 type: boolean
 *                 description: Confirms that all instructions have been studied and understood.
 *                 default: false
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
 * /papers/fetch-papers/status:
 *   get:
 *     summary: Retrieve papers based on their status and optionally by paper ID
 *     description: Fetches papers with the status of 'published', 'rejected', 'submitted', or 'underReview' based on the input parameter ('accepted', 'rejected', 'assigned', 'submitted'). If the status is 'underReview' and a paper ID is provided, it will also retrieve the details of the section heads assigned to the paper.
 *     tags:
 *       - Papers
 *     parameters:
 *       - in: query
 *         name: param
 *         schema:
 *           type: string
 *           enum:
 *             - accepted
 *             - rejected
 *             - assigned
 *             - submitted
 *         required: false
 *         description: Determines the paper status to filter by.
 *       - in: query
 *         name: paperId
 *         schema:
 *           type: integer
 *         required: false
 *         description: The ID of a specific paper to retrieve. If provided, only this paper will be returned with its assigned section heads (if applicable).
 *     responses:
 *       200:
 *         description: Successfully retrieved the list of papers.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 papers:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         description: The unique ID of the paper.
 *                       title:
 *                         type: string
 *                         description: The title of the paper.
 *                       paperStatus:
 *                         type: string
 *                         description: The current status of the paper.
 *                         example: underReview
 *                       assignedTo:
 *                         type: array
 *                         description: Details of section heads assigned to the paper (only if status is 'underReview' and applicable).
 *                         items:
 *                           type: object
 *                           properties:
 *                             id:
 *                               type: integer
 *                               description: The ID of the section head.
 *                             firstName:
 *                               type: string
 *                               description: The first name of the section head.
 *                             lastName:
 *                               type: string
 *                               description: The last name of the section head.
 *       400:
 *         description: Missing or invalid query parameter.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Invalid parameter value.
 *       404:
 *         description: No papers found for the provided status or ID.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "No papers found with status: underReview"
 *       500:
 *         description: Server error while processing the request.
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
 *                   example: Error details here
 */
paperRouter.get('/fetch-papers/status', paperController.getStatusBasePapers);

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
 * /papers/updateStatus/{paperID}:
 *   put:
 *     summary: Update the status of a paper For The Chief Editor
 *     description: Allows a chief editor to update the status of a paper, including adding comments and a date to the status history.
 *     tags: [SectionHeads And Cheif Editor]
 *     parameters:
 *       - in: path
 *         name: paperID
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the paper to update
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
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

paperRouter.put('/updateStatus/:paperID', authenticate, authorize('cheifEditor'), paperController.updatePaperStatusForCheifEditor);

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
 * /papers/update-status:
 *   patch:
 *     summary: Update the status of a paper for a section head
 *     tags:
 *       - SectionHeads And Cheif Editor
 *     description: Allows a section head to update the status of a paper (e.g., accepted or rejected). Only section heads are authorized to perform this action.
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
 *                 description: ID of the paper to update.
 *                 example: 123
 *               status:
 *                 type: string
 *                 description: The new status to assign to the paper (accepted or rejected).
 *                 enum: [accepted, rejected]
 *                 example: accepted
 *               comment:
 *                 type: string
 *                 description: An optional comment to provide additional context for the status update.
 *                 example: "The paper has been accepted for its originality and impact."
 *               date:
 *                 type: string
 *                 format: date-time
 *                 description: The date when the status update is applied. Defaults to the current date if not provided.
 *                 example: "2025-01-15T10:30:00Z"
 *     responses:
 *       200:
 *         description: Paper status updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Paper status updated to 'accepted' successfully."
 *       400:
 *         description: Invalid input or action.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Invalid status. Valid statuses are: accepted, rejected."
 *       403:
 *         description: Unauthorized action (not a section head).
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Only a section head can update the paper status."
 *       404:
 *         description: Paper not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Paper not found."
 *       500:
 *         description: Server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Server error"
 *                 error:
 *                   type: string
 *                   example: "An unexpected error occurred."
 *     security:
 *       - bearerAuth: []
 */
paperRouter.patch('/update-status:', authenticate, authorize('sectionHead'), paperController.updatePaperStatusForSectionHead);

/**
 * @swagger
 * /papers/assigned-papers:
 *   get:
 *     summary: Get all papers assigned to a specific section head
 *     description: Retrieve all the paper IDs assigned to a particular section head by `sectionHeadId`. Optionally, filter the assigned papers by their `status`.
 *     parameters:
 *       - in: query
 *         name: sectionHeadId
 *         required: true
 *         schema:
 *           type: string
 *         description: The unique ID of the section head.
 *       - in: query
 *         name: status
 *         required: false
 *         schema:
 *           type: string
 *           enum: [assigned, accepted, rejected]
 *         description: Filter the assigned papers based on their status. Valid values are `assigned`, `accepted`, and `rejected`.
 *     responses:
 *       200:
 *         description: A list of papers assigned to the section head
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 sectionHead:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       description: The ID of the section head.
 *                     firstName:
 *                       type: string
 *                       description: The first name of the section head.
 *                     lastName:
 *                       type: string
 *                       description: The last name of the section head.
 *                     email:
 *                       type: string
 *                       description: The email of the section head.
 *                     totalAssignedPapers:
 *                       type: integer
 *                       description: The total number of papers assigned to the section head.
 *                 assignedPapers:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         description: The unique ID of the paper.
 *                       manuScriptTitle:
 *                         type: string
 *                         description: The title of the manuscript.
 *                       manuScriptType:
 *                         type: string
 *                         description: The type of the manuscript.
 *                       paperStatus:
 *                         type: string
 *                         description: The current status of the paper.
 *                       correspondingAuthorName:
 *                         type: string
 *                         description: The name of the corresponding author.
 *                       correspondingAuthorEmail:
 *                         type: string
 *                         description: The email of the corresponding author.
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *                         description: The date and time when the paper was created.
 *                       updated_at:
 *                         type: string
 *                         format: date-time
 *                         description: The date and time when the paper was last updated.
 *       400:
 *         description: Bad request, sectionHeadId is missing or invalid
 *       500:
 *         description: Internal server error
 */

paperRouter.get('/assigned-papers', paperController.getAssignedPapersOfSectionHead);

module.exports = paperRouter;