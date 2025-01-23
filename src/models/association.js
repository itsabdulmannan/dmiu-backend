const User = require('../models/user.Model');
const papers = require('../models/paper.Model')

User.hasMany(papers, { foreignKey: 'userId' });
papers.belongsTo(User, { foreignKey: 'userId', as: 'author' });
