const config = require('./config.json');

function isAdmin(userId) {
    return Array.isArray(config.admins) && config.admins.includes(userId);
}

module.exports = { isAdmin };
