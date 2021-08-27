require('dotenv').config();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const User = require('../models/User');

const regexEmail = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
const regexPassword  = /^(?=.*\d).{4,16}$/;
const regexInject = /[\=\'\'\{\}]/; // ne doit pas contenir les caractères suivants : =, ", ", {, }

exports.signup = (req, res, next) => {
    if (!regexEmail.test(req.body.email)) {
        return res.status(400).json({ error: 'email invalide' });
    };

    if (regexInject.test(req.body.password)) {
        return res.status(400).json({ error: 'Mot de passe invalide ne doit pas inclure "=}{' });
    };

    if (!regexPassword.test(req.body.password)) {
        return res.status(400).json({ error: 'Mot de passe invalide (doit avoir une longeur entre 4 et 16 et inclure un chiffre minimum'});
    };
    
    bcrypt.hash(req.body.password, 10)
        .then(hash => {
            const user = new User({
                email: req.body.email,
                password: hash
            });
            user.save()
                .then(() => res.status(201).json({ message: 'Utilisateur créé !'}))
                .catch(error => res.status(400).json({ error }));
        })
        .catch(error => res.status(500).json({ error }));
};

exports.login = (req, res, next) => {
    User.findOne({ email: req.body.email })
        .then(user => {
            if(!user) {
                return res.status(401).json({ error: 'Utilisateur non trouvé !'});
            }
            bcrypt.compare(req.body.password, user.password)
                .then(valid => {
                    if(!valid) {
                        return res.status(401).json({ error: 'Mot de passe incorrect !'});
                    }
                    res.status(200).json({
                        userId: user._id,
                        token: jwt.sign(
                            { userId: user._id },
                            process.env.RTOKEN,
                            { expiresIn: '24h' }
                        )
                    });
                })
                .catch(error => res.status(500).json({ error }));
        })
        .catch(error => res.status(500).json({ error }));
};