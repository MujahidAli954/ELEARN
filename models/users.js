const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');
async = require('async');

// User Schema

const userSchema = mongoose.Schema({
  username: {
    type: String
  },
  email: {
    type: String
  },
  password:{
    type: String,
    bcrypt: true
  },
  type:{
    type: String
  }
});

const User = module.exports =  mongoose.model('User', userSchema);


// Fetch All Classes

module.exports.getUserById = (id, callback)=>{
    User.findById(id, callback);
};

// Fetch Single Class
module.exports.getUserByUsername = (username, callback)=>{
    const query = {username: username};
    User.findOne(query, callback);
};

// Save Student
module.exports.saveStudent = (newUser, newStudent, callback)=>{
    bcrypt.hash(newUser.password, 10, (err, hash)=>{
        if(err) throw err;

        newUser.password = hash;
        // console.log(hash);
        console.log('Student is being saved');
        async.parallel([newUser.save.bind(newUser), newStudent.save.bind(newStudent)], callback);
    });
};

// Save Instructor
module.exports.saveInstructor = (newUser, newInstructor, callback)=>{
    bcrypt.hash(newUser.password, 10,(err, hash)=>{
        if(err) throw err;

        newUser.password = hash;
        console.log('Instructor is being saved');
        async.parallel([newUser.save.bind(newUser), newInstructor.save.bind(newInstructor)], callback);
    });
};

// comparePassword
module.exports.comparePassword = (candidatePassword, hash, callback)=>{
    bcrypt.compare(candidatePassword, hash, (err, isMatch)=>{
        if(err){
          throw err;
        }
        callback(null, isMatch);
    });
};