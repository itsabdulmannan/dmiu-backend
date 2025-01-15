const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const reviewers = sequelize.define('reviewers', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    sectionHeadId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    paperId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    status: {
        type: DataTypes.ENUM('assigned', 'accepted', 'rejected'),
        allowNull: false,
        defaultValue: 'assigned'
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

module.exports = reviewers;