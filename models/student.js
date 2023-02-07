const mongoose = require('mongoose');

// Student Schema

const studentSchema = mongoose.Schema({
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

const Student = module.exports = mongoose.model('Student', studentSchema);


// Fetch Single Class
module.exports.getStudentByUsername = (username, callback)=>{
    const query = {username: username};
    Student.findOne(query, callback);
};

// Register Student for Class
module.exports.register = (info, callback)=>{

    student_username = info['student_username'];
    class_id = info['class_id'];
    class_title = info['class_title'];

    const query = {username: student_username};

    Student.findOneAndUpdate(
      query,
      {$push: {"classes":
      {
        class_id: class_id,
        class_title: class_title
      }}},
      {save: true, upsert: true},
      callback
    );
};
