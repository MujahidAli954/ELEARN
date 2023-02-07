const express = require('express');
const router = express.Router();

Class = require('../models/class');
Student = require('../models/student');
User = require('../models/users');


router.get('/classes', ensureAuthenticated, (req, res, next) =>{
  Student.getStudentByUsername(req.user.username, (err, student)=>{
    if(err){
      console.log(err);
      res.send(err);
    } else {
      res.render('students/classes', { "student": student});
    }
  });
});

router.post('/classes/register', (req, res)=>{
    info = [];
    info['student_username'] = req.user.username;
    info['class_id'] = req.body.class_id;
    info['class_title'] = req.body.class_title;

    Student.register(info, (err, student)=>{
        if(err) throw err;
        console.log(student);
    });

    req.flash('succes', 'You are now registered');
    res.redirect('/students/classes');

});

function ensureAuthenticated(req, res, next){
  if (req.isAuthenticated()){
      return next();
  }
  res.redirect('/');
}

module.exports = router;