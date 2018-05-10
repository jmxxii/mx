const express = require('express');
const router  = express.Router();
const User         = require('../models/user');
const bcrypt       = require('bcrypt');
const saltRounds   = 10;
const passport     = require("passport");
const bodyParser   = require('body-parser');
const multer = require('multer');
const cloudinary = require('cloudinary');
const uploadCloud = require('../config/cloudinary.js');
const upload  = multer({ dest: './public/uploads/' });
const Work = require('../models/work')


function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  } else {
    res.redirect('/login')
  }
}

router.get('/search', (req, res, next) => {
  const searchTerm = req.query.celebSearchTerm;
  if(!searchTerm){
      res.render('no-search-view.hbs');
        return;
  }
  const searchRegex = new RegExp(searchTerm, 'i');
  Work.find(
      // {'name': searchRegex},
      { $or:[ {'name':searchRegex}, {'occupation':searchRegex}]},
      (err, searchResults)=>{
      if(err){
          next(err);
          return;
      }
      res.render('search-result-view.hbs',{
      results: searchResults
    });
  }
);
})

router.get('/p/dashboard/', ensureAuthenticated, (req, res, next) => {
  User.findById(req.user._id, (err, user)=> {
    res.render('auth/dashboard', {user});
    console.log(user)
  })
  Work.findOne({owner: req.user._id}, (err, work) => {
    res.render('auth/dashboard', {work: work});
    console.log(work)
  })
});


router.get('/p/discover/', ensureAuthenticated, (req, res, next) => {
  User.findById(req.user._id, (err, user)=> {
    res.render('auth/discover', {user});
    console.log(user)
  })
});


    /* SIGN UP */
    router.get('/signup', (req, res, next) => {
      res.render('auth/signup', {layout: false});
    });

    router.post('/signup',upload.single('profilePic'), function(req, res, next){
      const fullName = req.body.fullname;
      const email = req.body.email;
      const phone = req.body.phone;
      const profilePic = `/uploads/${req.file.filename}`;
      const username = req.body.username;
      const password = req.body.password;
      const role = req.body.role;
      

      if(username ===""||password===""){
        res.render('auth/signup', {
          message: `Missing Credentials.
          Please enter a username and password in order to sign up`
        })
      } else if(username.includes(' ')||password.includes(' ')){
        res.render('auth/signup', {
          message: `Entry Contains Invalid Characters.
          Please Try Again.`
        })
        return;
      };
      
      User.findOne({username:username})
      .then((user)=>{
        if(user !== null){
          res.render('auth/signup', {message:`
          Sorry, that username already exists.
          Please login if you already have an account.`
        })
        return;
      }// end the if statement
      
      
      const salt = bcrypt.genSaltSync(saltRounds);
      const hashPass = bcrypt.hashSync(password, salt);
      
      User.create({  
        fullname: fullName,
        email: email,
        phone: phone,
        profilePic: profilePic,
        username:username, 
        password: hashPass, 
        role:role, })
        .then((theUser)=>{
          res.redirect('/login')
        })
        .catch((err)=>{
          console.log(err);
          next(err);
        })
        
      })//end the .then function for user.findOne query
      .catch((err)=>{
        console.log(err);
        next(err);
      })
    });//end post /signup route
    
    router.get('/login', (req, res, next) => {
      res.render('auth/login', {layout: false});
    })// end get /login
    
    router.post("/login", passport.authenticate("local",
    {
      successRedirect: "/p/dashboard",
      failureRedirect: "/login",
      failureFlash: false,
      passReqToCallback: true
    }))//end post /login
    
    router.get("/logout", (req, res) => {
      req.logout();
      res.redirect("/login");
    });
    
    module.exports = router;  
    
    