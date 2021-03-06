const Sauce = require('../models/Sauce');
const fs = require('fs');

//creation de la sauce
exports.createSauce = (req, res, next) => {
  const sauceObject = JSON.parse(req.body.sauce);
  delete sauceObject._id;
  const sauce = new Sauce({
    ...sauceObject,
    imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
  });
  sauce.save()
    .then(() => res.status(201).json({ message: 'Objet enregistré !' }))
    .catch(error => res.status(400).json({ error }));
};

//modification de la sauce
exports.modifySauce = (req, res, next) => {
  const sauceObject = req.file ?
  { 
    ...JSON.parse(req.body.sauce),
    imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
  } : { ...req.body };
  Sauce.updateOne({ _id: req.params.id }, { ...sauceObject, _id: req.params.id })
    .then(() => res.status(200).json({ message: 'Objet modifié !'}))
    .catch(error => res.status(400).json({ error }));
};

//suppression de la sauce
exports.deleteSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
    .then(sauce => {
      const filename = sauce.imageUrl.split('/images/')[1];
      //suppression de l'image dans le fichier
      fs.unlink(`images/${filename}`, () => {
        Sauce.deleteOne({ _id: req.params.id })
          .then(() => res.status(200).json({ message: 'Objet supprimé !'}))
          .catch(error => res.status(400).json({ error }))
      });
    })
    .catch(error => res.status(500).json({ error }));
};

//selection de la sauce
exports.getOneSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id })
      .then(sauce => res.status(200).json(sauce))
      .catch(error => res.status(400).json({ error }))
};


//selection des sauces
exports.getAllSauces = (req, res, next) => {
    Sauce.find()
      .then(sauces => res.status(200).json(sauces))
      .catch(error => res.status(400).json({ error }));
};

//ajout d'un like ou d'un dislike
exports.likeOneSauce = (req, res, next) => {
  const like = req.body.like;

  Sauce.findOne({ _id: req.params.id })
    .then(sauce => {
      let message = null;
      if(like === 1) {
        sauce.likes++
        sauce.usersLiked.push(req.body.userId);
        message = "Vous aimez la sauce";
      }
      else if(like === -1){
        sauce.dislikes++;
        sauce.usersDisliked.push(req.body.userId);
        message = "Vous n'aimez pas la sauce";
      }

      if (like === 0){
        if (sauce.usersLiked.find(userId => userId == req.body.userId) != undefined) {
          sauce.likes--;
          const filterUsersLiked = sauce.usersLiked.filter(elt => elt != req.body.userId);
          console.log(filterUsersLiked);
          sauce.usersLiked = filterUsersLiked;
          console.log(sauce.usersLiked);
          message = "J'aime retiré"
        } else {
          sauce.dislikes--;
          const filterUsersDisliked = sauce.usersLiked.filter(elt => elt != req.body.userId);
          sauce.usersDisliked = filterUsersDisliked;
          message = "Je n'aime plus retiré";
        }
      }

      Sauce.updateOne({ _id: sauce._id }, {
        likes: sauce.likes,
        dislikes: sauce.dislikes,
        usersLiked: sauce.usersLiked,
        usersDisliked: sauce.usersDisliked
      })
        .then(() => res.status(200).json({ message: message }))
        .catch(error => res.status(400).json({ error }));
    })
    .catch(error => res.status(400).json({ error }));
};