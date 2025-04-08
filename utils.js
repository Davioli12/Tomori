const config = require('./config.json');

function isAdmin(userId) {
    return config.admins.includes(userId);
}

module.exports = { isAdmin };
