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

router.get('/edit/profile/:id',ensureAuthenticated,(req, res, next) => {
  User.findById({_id: req.params.id})
    .then(user => { 
      // console.log(" ================ who is logged in: ", user)
      res.render('auth/edit-profile', {user: user})
  })
})

router.post('/edit/profile/:id', upload.single('profilePic'), (req, res, next)=> {
  User.findById(req.params.id)
  .then(user => {
    // console.log("===========", user);
    console.log("currentPassword: ",req.body.currentPassword)
    console.log("newPassword: ",req.body.newPassword)

    var currentPassword = req.body.currentPassword;
    var newPassword = req.body.newPassword;

    user.fullname = req.body.editedFullname;
    user.email = req.body.email;
    user.phone = req.body.phone;
    user.username = req.body.username;
    user.role = req.body.role;

    if((currentPassword ==="" && newPassword !=="") || (currentPassword !=="" && newPassword ==="" )){
      console.log("in the if")
      res.redirect(`/edit/profile/${user._id}`)
      return;
    }
    // console.log("============================")
    // console.log("password from db: ", req.user.password)
    // console.log("current pass: ", currentPassword);
    // console.log("new pass: ", newPassword)
    // console.log("============================")
console.log("old hash from db before saving: ", user.password)
    if (currentPassword && newPassword && bcrypt.compareSync(currentPassword, user.password)) {
      console.log("in the weird password thing")
      const salt = bcrypt.genSaltSync(10);
      const hashPass = bcrypt.hashSync(newPassword, salt);
      user.password = hashPass;
     console.log("============================")
      console.log("hash: ",hashPass);
      console.log("db pass: ",user.password)
      console.log("============================")

    }
    if(req.file){
      user.profilePic = `/uploads/${req.file.filename}`
    } else {
      user.profilePic = user.profilePic
    }
    user.save()
    .then(savedUser => {
      console.log("new pass: ", savedUser.password)
      res.redirect(`/profile/${user._id}`)
    })
    .catch( err => {
      console.log("Error while saving updated user: ", err)
    })
  })
  .catch(err => {
    console.log("Error while finding the user: ", err)
  })
})


router.get('/p/dashboard/', ensureAuthenticated, (req, res, next) => {
  // User.findById(req.user._id, (err, user)=> {       //=========================HERE===========================
  //   res.render('auth/dashboard', {user});
  //   console.log(user)
  // })
  Work.find({user: req.user._id}, (err, work) => {
    // console.log('===============================>')
    // console.log(work)
    res.render('auth/dashboard', {work: work, user: req.user} );
  })
});


router.get('/p/discover/', ensureAuthenticated, (req, res, next) => {
  Work.find({}, (err, work)=> {
    if (err){
      return next(err)
    }
    res.render('auth/discover', {work: work, user: req.user});
    console.log(work)
  })
});


router.post('/p/dashboard/:id/delete', function(req, res, next){
  Work.findOne({
    _id: req.params.id
  }, (err, theWork) => {
    if (err){
    return next(err);
  }
  theWork.remove((err) => {
    if (err) {
      return next(err);
    }
    res.redirect('/p/dashboard');
  })
})
})


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
    
    