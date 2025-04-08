const config = require('./config.json');

// Verifica se o usuário é admin
function isAdmin(userId) {
    return config.admins.includes(userId);
}

module.exports = { isAdmin };
