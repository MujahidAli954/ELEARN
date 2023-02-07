const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
Class = require('../models/class');
classes = mongoose.model('Class')
// Class = require('../models/class');
// GET 
router.get('/',(req, res) =>{
    classes.find({}).lean().exec((err, classes)=>{
      if(err){
        console.log(err);
        res.send(err);
      } else {
        // console.log("Classes Page: " + classes);
        res.render('classes/index', { classes: classes});
      }
    },3);
  
  });
// router.get('/', function(req, res, next) {
//   Class.getClasses(function(err, classes){
//     if(err){
//       console.log(err);
//       res.send(err);
//     } else {
//       console.log("Classes Page: " + classes);
//       res.render('classes/index', { "classes": classes});
//     }
//   },3);

// });
  
  
  router.get('/:id/details',(req, res, next) =>{
    Class.getClassById([req.params.id], function(err, classname){
      if(err){
        console.log(err);
        res.send(err);
      } else {
        console.log(classname);
        res.render('classes/details', { "class": classname});
      }
    });
  });

module.exports = router;