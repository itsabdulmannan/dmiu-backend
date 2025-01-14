const paper = require('../models/paper.Model');
const { Op } = require('sequelize');

const paperController = {
    addPaper: async (req, res) => {
        console.log("FunctionCalled");
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

            console.log(req.files, "Files");
            console.log(req.body, "Data");

            if (!Array.isArray(authors) || authors.length === 0) {
                return res.status(400).json({ message: 'Authors information must be provided as an array of objects.' });
            }

            authors.forEach(author => {
                if (!author.fullName || !author.affiliation || !author.country || !author.email) {
                    return res.status(400).json({ message: 'Each author must have fullName, affiliation, country, and email.' });
                }
            });

            if (!Array.isArray(reviewers) || reviewers.length < 3) {
                return res.status(400).json({ message: 'At least 3 reviewers are required.' });
            }

            reviewers.forEach(reviewer => {
                if (!reviewer.fullName || !reviewer.affiliation || !reviewer.country || !reviewer.email) {
                    return res.status(400).json({ message: 'Each reviewer must have fullName, affiliation, country, and email.' });
                }
            });

            const newPaper = await paper.create({
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
                const papers = await paper.findByPk(id);
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

            const papersList = await paper.findAll({ where: condition });

            if (papersList.length === 0) {
                return res.status(404).json({ message: 'No papers found matching the criteria.' });
            }

            return res.status(200).json(papersList);

        } catch (error) {
            console.error("Error occurred while fetching papers:", error);
            return res.status(500).json({ message: 'Server error', error: error.message });
        }
    },
    updatePaperStatus: async (req, res) => {
        try {
            const { paperID, status, comment, date, userId } = req.body;
            const paper = await paper.findByPk(paperID);
            if (!paper) {
                return res.status(404).json({ message: 'Paper not found' });
            }

            const userRecord = await user.findByPk(userId);
            if (!userRecord) {
                return res.status(404).json({ message: 'User not found' });
            }

            const userRole = userRecord.role;
            if (userRole !== 'chiefEditor') {
                return res.status(403).json({ message: 'Only a chief editor can update the paper status' });
            }

            paperRecord.paperStatus = status;
            paperRecord.statusHistory = [
                ...(paperRecord.statusHistory || []),
                { status, comment, date: date || new Date() },
            ];

            await paperRecord.save();

            return res.status(200).json({ message: 'Paper status updated successfully' });

        } catch (error) {
            console.error("Error while updating paper status", error);
            return res.status(500).json({ message: 'Server error', error: error.message });
        }
    },
    updatePaper: async (req, res) => {
        const { id } = req.params;
        try {
            const paper = await paper.findByPk(id);
            if (!paper) {
                return res.status(404).json({ message: 'Paper not found' });
            }

            const updatedPaper = await paper.update(req.body);
            return res.status(200).json({ message: 'Paper updated successfully', paper: updatedPaper });

        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Server error', error: error.message });
        }
    },
    deletePaper: async (req, res) => {
        const { id } = req.params;
        try {
            const paper = await paper.findByPk(id);
            if (!paper) {
                return res.status(404).json({ message: 'Paper not found' });
            }

            await paper.destroy();
            return res.status(200).json({ message: 'Paper deleted successfully' });

        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Server error', error: error.message });
        }
    }
};

module.exports = paperController;
