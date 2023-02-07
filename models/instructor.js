const mongoose = require('mongoose');

// Instructor Schema
const instructorSchema = mongoose.Schema({
  first_name: {
    type: String
  },
  last_name: {
    type: String
  },
  username: {
    type: String
  },
  email: {
    type: String,
    unique: true
  },
  classes:[{
    class_id:{type: [mongoose.Schema.Types.ObjectId]},
    class_title:{type: String},
  }]
});

const Instructor = module.exports = mongoose.model('Instructor', instructorSchema);


// Fetch Single Class
module.exports.getInstructorByUsername = (username, callback)=>{
    const query = {username: username};
    Instructor.findOne(query, callback);
};

// Register Instructor for Class
module.exports.register = (info, callback)=>{

    instructor_username = info['instructor_username'];
    class_id = info['class_id'];
    class_title = info['class_title'];

    const query = {username: instructor_username};

    Instructor.findOneAndUpdate(
      query,
      {$push: {"data":
      {
        class_id: class_id,
        class_title: class_title
      }}},
      {save: true, upsert: true},
      callback
    );
};