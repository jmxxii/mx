const express = require('express');
const router  = express.Router();
const Work = require('../models/work')
const User = require('../models/user')
const passport     = require("passport");
const bodyParser   = require('body-parser');
const multer = require('multer');
// const cloudinary = require('cloudinary');
const uploadCloud = require('../config/cloudinary.js');
const cloudinary = require('cloudinary').v2;
const upload  = multer({ dest: './public/uploads/' });

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  } else {
    res.redirect('/login')
  }
}

router.get('/p/dashboard/:id/edit', function (req, res) {
  Work.findById({_id: req.params.id})
  .then(work => { 
    res.render('auth/edit', {work: work} )})
})

router.post('/p/dashboard/update/:id', upload.single('media'),function(req, res){
  Work.findByIdAndUpdate(req.params.id, {
    projectname: req.body.projectname,
    artistname: req.body.artistname,
    genre: req.body.genre,
    media: `/uploads/${req.file.filename}`
  })
  .then(work => { console.log(work) })
  .catch(theError => { console.log(theError) })
  res.redirect('/p/discover')
  })


router.get('/upload', ensureAuthenticated, (req, res, next) => {
  User.findById(req.user._id, (err, user)=> {
    res.render('crud/upload', {user});
    console.log(user)
  })
});


router.post('/upload', upload.single('media') ,(req, res, next)=>{
  const projectName = req.body.projectname;
  const artistName = req.body.artistname;
  const genre = req.body.genre;
  // const albumArt = req.file.url;
  const media = `/uploads/${req.file.filename}`;
  const user = req.user._id;


  Work.create({
    projectname: projectName,
    artistname: artistName,
    genre: genre,
    // albumart: albumArt,
    media: media,
    user: user,})
    .then(work => {
      res.redirect('/p/dashboard')
    })
    .catch(err => {
      console.log(err);
      next(err);
    })
})

router.get('/profile/:id', (req, res, next)=>{

  const ObjectId = require('mongoose').Types.ObjectId;
  const theId = new ObjectId(req.params.id)

  console.log(theId);

  Work.find({user: theId})
  .then(work => { 
    res.render('profile', {work: work, user: req.user} )})
})



module.exports = router;


// router.post('/upload', uploadCloud.single('media'),(req, res, next)=>{
//   const projectName = req.body.projectname;
//   const artistName = req.body.artistname;
//   const genre = req.body.genre;
//   // const albumArt = req.file.url;
//   const media = req.files.url;
//   const user = req.user._id;


//   cloudinary.v2.uploader.upload_large(media,
//     { resource_type: 'video' },
//     function(error, result) {
//       if (error) {
//         // handle error
//       } else {
//         console.log(result);
//       }
//     });