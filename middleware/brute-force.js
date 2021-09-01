const bruteForce = require('express-rate-limit');

module.exports = bruteForce({
    windowMs: 5 * 60 * 1000,
    max: 5,
    mesaage: "Vous avez atteint le maximum d'essais, veuiller retenter dans 5 minutes !"
});