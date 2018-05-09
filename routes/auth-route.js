const express = require('express');
const router  = express.Router();
const User         = require('../models/user');
const bcrypt       = require('bcrypt');
const saltRounds   = 10;
const passport     = require("passport");
const bodyParser   = require('body-parser');






function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  } else {
    res.redirect('/login')
  }
}


router.get('/p/dashboard/:username', ensureAuthenticated, (req, res, next) => {
  User.findOne({username: req.params.id}, (err, user)=> {
    res.render('auth/dashboard', {username: req.params.username});
    console.log(user)
  })
});

// router.get('/characters/:id', (req,res, next) => {
//   Characters.findOne({id: req.params.id}, (err, theCharacter) => {
//       res.json(theCharacter)
//       console.log(theCharacter)
//   })
// })

/* SIGN UP */
router.get('/signup', (req, res, next) => {
  res.render('auth/signup', {layout: false});
});

router.post('/signup', (req, res, next)=>{
  const fullName = req.body.fullname;
  const email = req.body.email;
  const phone = req.body.phone;
  const profilePic = req.body.profilePic;
  const username = req.body.username;
  const password = req.body.password;
  const role = req.body.role;

  if(username ===""||password===""){
    res.render('auth/signup', {
      message: `Missing Credentials.
      Please enter a username and password in order to sign up`
    })
  }
  else if(username.includes(' ')||password.includes(' ')){
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
   successRedirect: "/p/dashboard/:username",
   failureRedirect: "/login",
   failureFlash: false,
   passReqToCallback: true
 }));//end post /login

router.get("/logout", (req, res) => {
  req.logout();
  res.redirect("/login");
});

module.exports = router;  

