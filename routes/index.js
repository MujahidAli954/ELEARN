const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

 
const classes = mongoose.model('Class');
// Class = require('../models/class');
// GET 
router.get('/', (req, res)=>{
//setting some new records on it and
// const newclass = new classes();
// newclass.title = 'Learning React',
// newclass.description = 'learning nodejs is very difficult',
// newclass.instructor = 'code with harry',
// newclass.save();

    classes.find({}).lean().exec((err,classes)=>{
        if(!err){
            // console.log(classes); 
            res.render('index',{ "classes":classes});
        }
        else{
            res.send('Error occcure');
          }
    }); 
  });

 

module.exports = router;