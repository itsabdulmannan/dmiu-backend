const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const papers = sequelize.define('papers', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    manuScriptTitle: {
        type: DataTypes.STRING,
        allowNull: false
    },
    manuScriptType: {
        type: DataTypes.STRING,
        allowNull: false
    },
    runningTitle: {
        type: DataTypes.STRING,
        allowNull: false
    },
    subject: {
        type: DataTypes.STRING,
        allowNull: false
    },
    abstract: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    correspondingAuthorName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    correspondingAuthorEmail: {
        type: DataTypes.STRING,
        allowNull: false
    },
    noOfAuthors: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    authors: {
        type: DataTypes.JSONB,
        allowNull: false,
        defaultValue: []
    },
    reviewers: {
        type: DataTypes.JSONB,
        allowNull: false,
        defaultValue: []
    },
    authorsConflict: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    dataAvailability: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    mainManuscript: {
        type: DataTypes.STRING,
        allowNull: false,
        get() {
            const rawValue = this.getDataValue('mainManuscript');
            return rawValue ? `${process.env.BASE_URL}${rawValue}` : null;
        }
    },
    coverLetter: {
        type: DataTypes.STRING,
        allowNull: true,
        get() {
            const rawValue = this.getDataValue('coverLetter');
            return rawValue ? `${process.env.BASE_URL}${rawValue}` : null;
        }
    },
    supplementaryFile: {
        type: DataTypes.STRING,
        allowNull: true,
        get() {
            const rawValue = this.getDataValue('supplementaryFile');
            return rawValue ? `${process.env.BASE_URL}${rawValue}` : null;
        }
    },
    paperStatus: {
        type: DataTypes.ENUM('submitted', 'underReview', 'published', 'rejected'),
        allowNull: false,
        defaultValue: 'submitted'
    },
    statusHistory: {
        type: DataTypes.JSONB,
        allowNull: false,
        defaultValue: []
    }
}, {
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

module.exports = papers;