const bruteForceCreate = require('express-rate-limit');

module.exports = bruteForceCreate({
	windowMs: 60 * 60 * 1000,
	max: 5,
	message:
		"Trop de comptes créés à partir de cette adresse IP, veuillez réessayer dans une heure !",
});