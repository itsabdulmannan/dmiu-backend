const papers = require('../models/paper.Model');
const { Op } = require('sequelize');
const User = require('../models/user.Model');
const reviewer = require('../models/reviewer.Model')

const paperController = {
    addPaper: async (req, res) => {
        const user = req.user;
        const userId = user.id;
        const checkUser = await User.findByPk(userId);
        if (!checkUser) {
            return res.status(404).json({ message: 'User not found' });
        }
        const userRole = checkUser.role;
        if (userRole !== 'author') {
            return res.status(403).json({ message: 'Only an author can add a paper' });
        }
        try {
            const {
                manuScriptTitle,
                manuScriptType,
                runningTitle,
                subject,
                abstract,
                correspondingAuthorName,
                correspondingAuthorEmail,
                noOfAuthors,
                authors: authorsRaw,
                reviewers: reviewersRaw,
                authorsConflict,
                dataAvailability,
                apcs,
                studiedAndUnderstood
            } = req.body;

            const authors = JSON.parse(authorsRaw);
            const reviewers = JSON.parse(reviewersRaw);

            const mainManuscript = req.files['mainManuscript'] ? `/assets/${req.files['mainManuscript'][0].filename}` : null;
            const coverLetter = req.files['coverLetter'] ? `/assets/${req.files['coverLetter'][0].filename}` : null;
            const supplementaryFile = req.files['supplementaryFile'] ? `/assets/${req.files['supplementaryFile'][0].filename}` : null;

            if (!Array.isArray(authors) || authors.length === 0) {
                return res.status(400).json({ message: 'Authors information must be provided as an array of objects.' });
            }

            if (authors.length < 3) {
                return res.status(400).json({ message: 'At least 3 authors are required.' });
            }

            for (const author of authors) {
                if (!author.fullName || !author.affiliation || !author.country || !author.email) {
                    return res.status(400).json({ message: 'Each author must have fullName, affiliation, country, and email.' });
                }
            }

            if (!Array.isArray(reviewers) || reviewers.length < 3) {
                return res.status(400).json({ message: 'At least 3 reviewers are required.' });
            }

            for (const reviewer of reviewers) {
                if (!reviewer.fullName || !reviewer.affiliation || !reviewer.country || !reviewer.email) {
                    return res.status(400).json({ message: 'Each reviewer must have fullName, affiliation, country, and email.' });
                }
            }

            const newPaper = await papers.create({
                userId,
                manuScriptTitle,
                manuScriptType,
                runningTitle,
                subject,
                abstract,
                correspondingAuthorName,
                correspondingAuthorEmail,
                noOfAuthors,
                authors,
                reviewers,
                authorsConflict,
                dataAvailability,
                mainManuscript,
                coverLetter,
                supplementaryFile,
                apcs,
                studiedAndUnderstood
            });

            return res.status(201).json({ message: 'Paper added successfully!', paper: newPaper });

        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Server error', error: error.message });
        }
    },
    getAllPapers: async (req, res) => {
        try {
            const { id, archive, inPress } = req.query;
            console.log(req.query);

            if (id) {
                const paper = await papers.findByPk(id);
                if (!paper) {
                    return res.status(404).json({ message: 'Paper not found' });
                }
                return res.status(200).json(paper);
            }

            let condition = { paperStatus: 'published' };
            const currentDate = new Date();
            const thirtyDaysAgo = new Date(currentDate);
            thirtyDaysAgo.setDate(currentDate.getDate() - 30);
            const oneMonthAgoStart = new Date(currentDate);
            oneMonthAgoStart.setDate(currentDate.getDate() - 30);

            if (archive === 'true') {
                condition.created_at = { [Op.lt]: thirtyDaysAgo };
            } else if (inPress === 'true') {
                condition.created_at = { [Op.gt]: oneMonthAgoStart };
            }

            const papersList = await papers.findAll({ where: condition });

            if (papersList.length === 0) {
                return res.status(404).json({ message: 'No papers found matching the criteria.' });
            }

            return res.status(200).json({ status: true, message: "Papers fetched successfully.", data: papersList });

        } catch (error) {
            console.error("Error occurred while fetching papers:", error);
            return res.status(500).json({ message: 'Server error', error: error.message });
        }
    },
    updatePaperStatusForCheifEditor: async (req, res) => {
        try {
            const { paperID } = req.params;
            const { status, comment, date, sectionHeadIds } = req.body;
            const user = req.user;
            const userId = user.id;
            const paperRecord = await papers.findByPk(paperID);
            if (!paperRecord) {
                return res.status(404).json({ message: 'Paper not found' });
            }

            const userRecord = await User.findByPk(userId);
            if (!userRecord) {
                return res.status(404).json({ message: 'User not found' });
            }

            const userRole = userRecord.role;
            if (userRole !== 'cheifEditor') {
                return res.status(403).json({ message: 'Only a chief editor can update the paper status' });
            }

            let newStatus;
            let sectionHeads = [];
            if (status === 'acceptAndPublish') {
                newStatus = 'published';
            } else if (status === 'rejected') {
                newStatus = 'rejected';
            } else if (status === 'assigned') {
                if (!sectionHeadIds || sectionHeadIds.length === 0) {
                    return res.status(400).json({ message: 'Section head IDs are required when the status is assigned' });
                }

                newStatus = 'underReview';
                for (let sectionHeadId of sectionHeadIds) {
                    const sectionHead = await User.findByPk(sectionHeadId);
                    if (!sectionHead || sectionHead.role !== 'sectionHead') {
                        return res.status(404).json({ message: `Section head with ID ${sectionHeadId} not found or invalid role` });
                    }

                    await reviewer.create({
                        sectionHeadId: sectionHead.id,
                        paperId: paperID,
                        status: 'assigned',
                        statusHistory: [
                            {
                                status: 'assigned',
                                comment: `Assigned to section head: ${sectionHead.firstName} ${sectionHead.lastName}`,
                                date: date || new Date(),
                            },
                        ],
                    });

                    sectionHeads.push(sectionHead);
                }
            } else {
                return res.status(400).json({ message: 'Invalid status parameter' });
            }

            paperRecord.paperStatus = newStatus;
            paperRecord.statusHistory = [
                ...(paperRecord.statusHistory || []),
                { status: newStatus, comment, date: date || new Date() },
            ];

            await paperRecord.save();

            return res.status(200).json({ status: true, message: 'Paper status updated successfully' });

        } catch (error) {
            console.error("Error while updating paper status", error);
            return res.status(500).json({ message: 'Server error', error: error.message });
        }
    },
    updatePaperStatusForSectionHead: async (req, res) => {
        try {
            const { paperId, status, comment, date } = req.body;
            const user = req.user;
            const sectionHeadId = user.id;

            const paperRecord = await papers.findByPk(paperId);
            if (!paperRecord) {
                return res.status(404).json({ message: 'Paper not found' });
            }

            const userRecord = await User.findByPk(sectionHeadId);
            if (!userRecord || userRecord.role !== 'sectionHead') {
                return res.status(403).json({ message: 'Only a section head can update the paper status' });
            }

            if (paperRecord.paperStatus !== 'underReview') {
                return res.status(400).json({ message: 'Paper must be under review before assigning a section head' });
            }

            const reviewerRecord = await reviewer.findOne({ where: { paperId: paperId, sectionHeadId } });

            reviewerRecord.status = status;
            const statusHistory = reviewerRecord.statusHistory || [];
            statusHistory.push({
                status,
                comment,
                date: date || new Date(),
            });
            reviewerRecord.statusHistory = statusHistory;

            await reviewerRecord.save();

            return res.status(200).json({ message: 'Paper status updated successfully' });
        } catch (error) {
            console.error("Error while updating paper status for section head", error);
            return res.status(500).json({ message: 'Server error', error: error.message });
        }
    },
    getStatusBasePapers: async (req, res) => {
        try {
            const { param, paperId } = req.query;

            // if (!param && !paperId) {
            //     return res.status(400).json({ message: 'Missing parameter in request body.' });
            // }

            let paperStatus;
            if (param) {
                switch (param) {
                    case 'accepted':
                        paperStatus = 'published';
                        break;
                    case 'submitted':
                        paperStatus = 'submitted';
                        break;
                    case 'rejected':
                        paperStatus = 'rejected';
                        break;
                    case 'assigned':
                        paperStatus = 'underReview';
                        break;
                    default:
                        return res.status(400).json({ message: `Invalid parameter value: ${param}` });
                }
            }

            const whereClause = {};
            if (paperStatus) whereClause.paperStatus = paperStatus;
            if (paperId) whereClause.id = paperId;

            const papersList = await papers.findAll({
                where: whereClause,
            });

            if (papersList.length === 0) {
                return res.status(404).json({ message: `No papers found with the specified criteria.` });
            }

            if (param === 'assigned' || (!param && paperId)) {
                const paperIds = papersList.map((paper) => paper.id);

                const reviewersData = await reviewer.findAll({
                    where: {
                        paperId: paperIds,
                    },
                    attributes: ['paperId', 'sectionHeadId'],
                });

                const sectionHeadIds = [...new Set(reviewersData.map((review) => review.sectionHeadId))];

                const sectionHeads = await User.findAll({
                    where: {
                        id: sectionHeadIds,
                    },
                    attributes: ['id', 'firstName', 'lastName'],
                });

                const papersWithReviewers = papersList.map((paper) => {
                    const assignedReviewers = reviewersData
                        .filter((review) => review.paperId === paper.id)
                        .map((review) => {
                            const sectionHead = sectionHeads.find((sh) => sh.id === review.sectionHeadId);
                            return sectionHead
                                ? {
                                    id: sectionHead.id,
                                    firstName: sectionHead.firstName,
                                    lastName: sectionHead.lastName,
                                }
                                : null;
                        })
                        .filter(Boolean);

                    return {
                        ...paper.dataValues,
                        assignedTo: assignedReviewers,
                    };
                });

                return res.status(200).json({ papers: papersWithReviewers });
            }

            return res.status(200).json({ papers: papersList });
        } catch (error) {
            console.error('Error while fetching papers based on status', error);
            return res.status(500).json({ message: 'Server error', error: error.message });
        }
    },
    getAssignedPapersOfSectionHead: async (req, res) => {
        try {
            const { sectionHeadId } = req.query;
            console.log(sectionHeadId, "Called");

            if (!sectionHeadId) {
                return res.status(400).json({ message: "sectionHeadId is required" });
            }

            const papersIds = await reviewer.findAll({
                where: { sectionHeadId },
                attributes: ['paperId'],
            });

            const sectionHeadDetails = await User.findByPk(sectionHeadId);

            if (!sectionHeadDetails) {
                return res.status(404).json({ message: "Section head not found" });
            }

            if (papersIds.length === 0) {
                return res.status(200).json({
                    data: [{
                        sectionHead: {
                            ...sectionHeadDetails.toJSON(),
                            totalAssignedPapers: 0
                        },
                        assignedPapers: []
                    }]
                });
            }

            const paperIds = papersIds.map(paper => paper.paperId);

            const paperDetails = await papers.findAll({
                where: {
                    id: {
                        [Op.in]: paperIds
                    }
                }
            });

            const formattedPaperDetails = paperDetails.map(paper => {
                return {
                    mainManuscript: paper.mainManuscript,
                    coverLetter: paper.coverLetter,
                    supplementaryFile: paper.supplementaryFile,
                    id: paper.id,
                    userId: paper.userId,
                    manuScriptTitle: paper.manuScriptTitle,
                    manuScriptType: paper.manuScriptType,
                    runningTitle: paper.runningTitle,
                    subject: paper.subject,
                    abstract: paper.abstract,
                    correspondingAuthorName: paper.correspondingAuthorName,
                    correspondingAuthorEmail: paper.correspondingAuthorEmail,
                    noOfAuthors: paper.noOfAuthors,
                    authors: paper.authors,
                    reviewers: paper.reviewers,
                    authorsConflict: paper.authorsConflict,
                    dataAvailability: paper.dataAvailability,
                    paperStatus: paper.paperStatus,
                    statusHistory: paper.statusHistory || [],
                    apcs: paper.apcs,
                    studiedAndUnderstood: paper.studiedAndUnderstood,
                    created_at: paper.createdAt,
                    updated_at: paper.updatedAt
                };
            });

            const totalAssignedPapers = papersIds.length;

            return res.status(200).json({
                sectionHead: {
                    ...sectionHeadDetails.toJSON(),
                    totalAssignedPapers: totalAssignedPapers
                },
                assignedPapers: formattedPaperDetails
            });

        } catch (error) {
            console.error("Error while getting assigned papers and section head details", error);
            return res.status(500).json({ message: "Internal server error" });
        }
    }

};

module.exports = paperController;
