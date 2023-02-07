const express = require('express');
const router = express.Router();

Class = require('../models/class');
Instructor = require('../models/instructor');
User = require('../models/users');


router.get('/classes', ensureAuthenticated, (req, res)=>{
  Instructor.find({}).lean().exec((req.user.username, (err, instructor)=>{
    if(err){
      console.log(err);
      res.send(err);
    } else {
      console.log('router.get(/classes... ' + JSON.stringify(instructor));
      res.render('instructors/classes', { "instructor": instructor});
      // console.log(instructor);
    }
  }));
});

router.post('/classes/register',(req, res)=>{
    info = [];
    info['instructor_username'] = req.user.username;
    info['class_id'] = req.body.class_id;
    info['class_title'] = req.body.class_title;

    Instructor.register(info, (err, instructor)=>{
        if(err) throw err;  
        console.log(instructor);
    });

    req.flash('success_msg', 'You are now registered to teach this class');
    res.redirect('/instructors/classes');

});


router.get('/classes/:id/lessons/new', ensureAuthenticated, (req, res)=>{
      res.render('instructors/newlesson', { "class_id": req.params.id});
});


router.post('/classes/:id/lessons/new', ensureAuthenticated,(req, res, next)=>{

      const info = [];
      info['class_id']        = req.params.id;
      info['lesson_number']   = req.body.lesson_number;
      info['lesson_title']    = req.body.lesson_title;
      info['lesson_body']     = req.body.lesson_body;
      Class.addLesson(info, (err, lesson)=>{
          console.log('Lesson Added');
      });
      req.flash('success_msg', 'Lesson Added');
      res.redirect('/instructors/classes');
});



function ensureAuthenticated(req, res, next){
  if (req.isAuthenticated()){
      return next();
  }
  res.redirect('/');
}

module.exports = router;