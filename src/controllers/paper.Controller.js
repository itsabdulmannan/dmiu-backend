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

            if (id) {
                const papers = await papers.findByPk(id);
                if (!papers) {
                    return res.status(404).json({ message: 'Paper not found' });
                }
                return res.status(200).json(papers);
            }

            let condition = { paperStatus: 'published' };
            const currentDate = new Date();
            const thirtyDaysAgo = new Date(currentDate);
            thirtyDaysAgo.setDate(currentDate.getDate() - 30);
            const oneMonthAgoStart = new Date(currentDate);
            oneMonthAgoStart.setDate(currentDate.getDate() - 30);

            if (archive === 'true') {
                condition.created_at = { [Op.lt]: thirtyDaysAgo };
            }
            else if (inPress === 'true') {
                condition.created_at = { [Op.gt]: oneMonthAgoStart };
            }

            const papersList = await papers.findAll({ where: condition });

            if (papersList.length === 0) {
                return res.status(404).json({ message: 'No papers found matching the criteria.' });
            }

            return res.status(200).json(papersList);

        } catch (error) {
            console.error("Error occurred while fetching papers:", error);
            return res.status(500).json({ message: 'Server error', error: error.message });
        }
    },
    updatePaperStatusForCheifEditor: async (req, res) => {
        try {
            const { paperID, status, comment, date, sectionHeadIds } = req.body;
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

            return res.status(200).json({ message: 'Paper status updated successfully' });

        } catch (error) {
            console.error("Error while updating paper status", error);
            return res.status(500).json({ message: 'Server error', error: error.message });
        }
    },
    updatePaperStatusForSectionHead: async (req, res) => {
        try {
            const { paperID, status, comment, date } = req.body;
            const user = req.user;
            const sectionHeadId = user.id; 

            const paperRecord = await papers.findByPk(paperID);
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

            if (status === 'assigned') {
                await reviewers.create({
                    userId: sectionHeadId,
                    paperId: paperID,
                    status: 'assigned',
                    statusHistory: [
                        { status: 'assigned', comment, date: date || new Date() }
                    ]
                });

                paperRecord.paperStatus = 'assigned';
                await paperRecord.save();

                return res.status(200).json({ message: 'Paper status updated and section head assigned successfully' });
            } else {
                return res.status(400).json({ message: 'Invalid status' });
            }
        } catch (error) {
            console.error("Error while updating paper status for section head", error);
            return res.status(500).json({ message: 'Server error', error: error.message });
        }
    },
    updatePaper: async (req, res) => {
        const { id } = req.params;
        try {
            const paper = await papers.findByPk(id);
            if (!paper) {
                return res.status(404).json({ message: 'Paper not found' });
            }

            const updatedPaper = await papers.update(req.body);
            return res.status(200).json({ message: 'Paper updated successfully', paper: updatedPaper });

        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Server error', error: error.message });
        }
    },
    deletePaper: async (req, res) => {
        const { id } = req.params;
        try {
            const paper = await papers.findByPk(id);
            if (!paper) {
                return res.status(404).json({ message: 'Paper not found' });
            }

            await papers.destroy();
            return res.status(200).json({ message: 'Paper deleted successfully' });

        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Server error', error: error.message });
        }
    }
};

module.exports = paperController;
