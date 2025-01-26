const express = require("express");
const paperController = require("../controllers/paper.Controller");
const upload = require("../middleware/multer");
const { authenticate, authorize } = require("../middleware/auth");
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

paperRouter.post(
    "/create",
    upload.fields([
        { name: "mainManuscript", maxCount: 1 },
        { name: "coverLetter", maxCount: 1 },
        { name: "supplementaryFile", maxCount: 1 },
    ]),
    authenticate,
    authorize("author"),
    paperController.addPaper
);

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
 *         description: Successfully retrieved the list of papers.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   description: Whether the operation was successful.
 *                 message:
 *                   type: string
 *                   description: A message describing the result.
 *                 data:
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
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                       description: The total number of papers matching the query.
 *                     offset:
 *                       type: integer
 *                       description: The number of records skipped (current offset).
 *                     limit:
 *                       type: integer
 *                       description: The number of records per page (current limit).
 *                     totalPages:
 *                       type: integer
 *                       description: The total number of pages available.
 *                     currentPage:
 *                       type: integer
 *                       description: The current page number.
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

paperRouter.get("/fetch-papers/status", paperController.getStatusBasePapers);

/**
 * @swagger
 * /papers/get:
 *   get:
 *     summary: Get all papers, papers by ID, or filtered papers by type (archive or inPress)
 *     tags: [Papers]
 *     parameters:
 *       - in: query
 *         name: id
 *         schema:
 *           type: string
 *         description: Paper ID
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [archive, inPress]
 *         description: Optional. Specify 'archive' for papers older than 30 days or 'inPress' for papers created in the last 30 days.
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
 *         description: A list of papers or a single paper
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
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Paper'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                       description: Total number of records
 *                     offset:
 *                       type: integer
 *                       description: The number of records skipped
 *                     limit:
 *                       type: integer
 *                       description: The number of records returned per page
 *                     totalPages:
 *                       type: integer
 *                       description: Total number of pages
 *                     currentPage:
 *                       type: integer
 *                       description: The current page number
 *       404:
 *         description: Paper not found or no papers matching the criteria
 *       500:
 *         description: Internal server error
 */

paperRouter.get("/get", paperController.getAllPapers);

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

paperRouter.put(
    "/updateStatus/:paperID",
    authenticate,
    authorize("cheifEditor"),
    paperController.updatePaperStatusForCheifEditor
);

/**
 * @swagger
 * /papers/sectionHead/updateStatus/{paperID}:
 *   put:
 *     summary: Update the status of a paper by a Section Head and assign to section heads
 *     description: Allows a section head to update the status of a paper (e.g., assign it to themselves or others for review).
 *     tags:
 *       - SectionHeads
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

paperRouter.put(
    "/sectionHead/updateStatus/:paperID",
    authenticate,
    authorize("sectionHead"),
    paperController.updatePaperStatusForSectionHead
);

/**
 * @swagger
 * /papers/assigned-papers:
 *   get:
 *     summary: Get all papers assigned to a specific section head
 *     description: Retrieve all the paper IDs assigned to a particular section head by `sectionHeadId`. Optionally, filter the assigned papers by their `status` and paginate the results.
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
 *       - in: query
 *         name: offset
 *         required: false
 *         schema:
 *           type: integer
 *           default: 0
 *         description: The number of items to skip for pagination. Defaults to 0.
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: integer
 *           default: 10
 *         description: The number of items to return per page. Defaults to 10.
 *     responses:
 *       200:
 *         description: A list of papers assigned to the section head with pagination details
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
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     offset:
 *                       type: integer
 *                       description: The offset used for pagination.
 *                     limit:
 *                       type: integer
 *                       description: The limit used for pagination.
 *                     total:
 *                       type: integer
 *                       description: The total number of papers available.
 *       400:
 *         description: Bad request, sectionHeadId is missing or invalid
 *       500:
 *         description: Internal server error
 */

paperRouter.get(
    "/assigned-papers",
    paperController.getAssignedPapersOfSectionHead
);

/**
 * @swagger
 * /papers/author:
 *   get:
 *     summary: Get all papers for a specific author with pagination and optional search filters
 *     tags: [Papers]
 *     parameters:
 *       - in: query
 *         name: userId
 *         required: false
 *         schema:
 *           type: string
 *         description: The userId of the author to retrieve papers for (optional)
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *         description: The number of records to skip for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: The number of records to retrieve for pagination
 *       - in: query
 *         name: title
 *         schema:
 *           type: string
 *         description: Title of the author to filter papers by (matches with `title` in the `users` table)
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *         description: Name of the author to filter papers by (can match `firstName` or `lastName` in the `users` table)
 *       - in: query
 *         name: manuScriptTitle
 *         schema:
 *           type: string
 *         description: Manuscript title to filter papers by (matches with `manuScriptTitle` in the `papers` table)
 *     responses:
 *       200:
 *         description: A list of papers for the specified author with pagination
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   description: The success status of the request
 *                 message:
 *                   type: string
 *                   description: A message indicating the result of the request
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Paper'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                       description: Total number of papers for the userId
 *                     offset:
 *                       type: integer
 *                       description: The number of records skipped
 *                     limit:
 *                       type: integer
 *                       description: The number of records retrieved
 *       404:
 *         description: No papers found matching the criteria for the provided userId
 *       500:
 *         description: Internal server error
 */

paperRouter.get("/author", paperController.getPapersForAuthor);

module.exports = paperRouter;
