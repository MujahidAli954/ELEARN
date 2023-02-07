const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const passport = require('passport');
const LocalStrategy = require('passport-local');
const expressvalidator = require('express-validator');
router.use(expressvalidator());
// const User = mongoose.model('User');
// const Student = mongoose.model('Student');
// const Instructor = mongoose.model('Instructor');

const User = require('../models/users');
const Student = require('../models/student');
const Instructor = require('../models/instructor');

//User Registered
router.get('/register',(req,res,next)=>{
    res.render('users/register');
});

//User Registration
router.post('/register',(req,res,next)=>{
    const first_name = req.body.first_name;
    const last_name = req.body.last_name;
    const email = req.body.email;
    const username = req.body.username;
    const password = req.body.password;
    const password2 = req.body.password2;
    const type = req.body.type;

    // console.log('first_name ' + first_name);
    // console.log('last_name ' + last_name);
    // console.log('zip ' + zip);
    // console.log('email ' + email);
    //
    // console.log('username ' + username);
    // console.log('password1 ' + password);
    // console.log('password2 ' + password2);

    // Form Field Validation
    req.checkBody('first_name', 'First name field is required').notEmpty();
    req.checkBody('last_name', 'Last name field is required').notEmpty();
    req.checkBody('email', 'Email field is required').notEmpty();
    req.checkBody('email', 'Email must be a valid email address').isEmail().withMessage('Invalid Email');
    req.checkBody('username', 'Usrname field is required').notEmpty();
    req.checkBody('password', 'Password field is required').notEmpty();
    req.checkBody('password2', 'Passwords do not match').equals(req.body.password);

    const errors = req.validationErrors();

    if (errors){
          res.render('users/register', {
              errors: errors
          });
    } else {

        const newUser = User({
          email: email,
          username: username,
          password: password,
          type: type
        });
        if(type == 'student'){
        const newStudent = new Student({
            first_name: first_name,
            last_name: last_name,
            email: email,
            username: username
        });
        User.saveStudent(newUser, newStudent, (err, user)=>{
            console.log('Student created');
        });
    }
    else{
        const newInstructor = new Instructor({
            first_name: first_name,
            last_name: last_name,
            email: email,
            username: username
        });
        User.saveInstructor(newUser, newInstructor,(err, user)=>{
            console.log('Instructor created');
        });
    }
        req.flash('success_msg', 'User added');
        res.redirect('/');
    }
});



passport.serializeUser((user, done)=>{
    done(null, user._id);
});

passport.deserializeUser((id, done)=>{
    User.getUserById(id, (err, user)=>{
      done(err, user);
    });
});

router.post('/login',passport.authenticate('local',{failureRedirect:'/',failureflash:true}),(req,res,next)=>{
    req.flash('success_msg', 'you are now logged in');
    const usertype = req.user.type;
    res.redirect('/'+usertype + 's/classes');

});


passport.use(new LocalStrategy(
    (username, password, done)=>{

      console.log("username: " + username);
      console.log("password: " + password);

      User.getUserByUsername(username, (err, user)=>{

          if (err) throw err;

          if(!user){
            console.log("Unknown user " + username);
            return done(null, false, { message: 'Unknown user ' + username });
          }

          User.comparePassword(password, user.password, (err, isMatch)=>{

            if (err) {
              console.log("error " + err);
              return done(err);
            }

            if(isMatch){
              console.log('Password Match');
              return done(null, user);
            } else {
              console.log('Invalid Password');
              return done(null, false, {message: 'Invalid password'});
            }
          });
      });
    }
));

router.get('/logout', (req, res)=>{
    req.logout();
    req.flash('success_msg', "You have logged out");
    res.redirect('/');
});

function ensureAuthenticated(req, res, next){
  if (req.isAuthenticated()){
      return next();
  }
  res.redirect('/');
}


module.exports = router;