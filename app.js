const express =require('express');
const expresshandlebars = require('express-handlebars');
const path = require('path');
const logger = require('morgan');
const cookieparsers = require('cookie-parser');
const bodyParser = require('body-parser');
const favicon = require('serve-favicon');
const expressvalidator = require('express-validator');
const flash = require('connect-flash');
const session = require('express-session');
const passport = require('passport');
const localStrategy = require('passport-local');
const mongo = require('mongodb');
const mongoose = require('mongoose');
async = require('async');
const crypto = require('crypto');
const multer = require('multer');
const {GridFsStorage} = require('multer-gridfs-storage');
const Grid = require('gridfs-stream');
const methodOverride = require('method-override');


 mongoose.connect('mongodb://localhost:27017/Elearn',(err)=>{
    if(!err){
        console.log('connection succeded');
    }else{
        console.log('error occure');
    }
});

const Class = require('./models/class');


const routes = require('./routes/index');
const users = require('./routes/users');
const classes = require('./routes/classes');
const students = require('./routes/students');
const instructors = require('./routes/instructors');
// const uploadfiles = require('./routes/uploadfiles');

const app = express();

app.set('view engine', path.join(__dirname, 'views'));
app.engine('handlebars',expresshandlebars({
    extname:'handlebars',
    defaultlayout:'mainlayout',
    layoutsDir:__dirname + '/views/layouts'
}));
app.set('view engine','handlebars');


app.use(logger('dev')); 
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));
app.use(cookieparsers());
app.use(express.static(path.join(__dirname,'public')));
app.use(methodOverride('_method'));

// Express Session
app.use(session({
    secret: 'secret',
    saveUninitialized:true,
    resave: true
}));

 // passport
 app.use(passport.initialize());
 app.use(passport.session());

 //Express Validator

 app.use(expressvalidator({
     errorFormatter:(param,msg,value)=>{
         const namespace = param.split('.'),
         root = namespace.shift(),
         formParam = root;
         while(namespace.length){
             formParam += '[' + namespace.shift() + ']';
         }
         return {
             param:formParam,
             msg:msg,
             value: value
         };
     }
 }));

 // App Flash
 app.use(flash());

 app.use(function(req, res, next){
    res.locals.messages = require('express-messages')(req, res);
  
    if(req.url == '/'){
      res.locals.isHome = true;
    }
    next();
  });

 app.get('*', function(req, res, next){
    res.locals.user = req.user || null;
    if(req.user){
      res.locals.usertype = req.user.type;
    }
    next();
});
 //Global Vars
 app.use((req,res, next)=>{
     res.locals.success_msg = req.flash('success_msg');
     res.locals.error_msg = req.flash('error_msg');
     res.locals.error = req.flash('error');
     next();
 });

 
app.use('/',routes);
app.use('/users',users);
app.use('/classes',classes);
app.use('/students', students);
app.use('/instructors', instructors);
// app.use('/', uploadfiles);

// app.use((req, res,next)=>{
//     const err = new Error('Not Found');
//     err.status = 404;
//     next(err);
// });



app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: {}
    });
  });


//upload Files
const mongoURI = 'mongodb://localhost:27017/Elearn';

// Create mongo connection
const conn = mongoose.createConnection(mongoURI);

// Init gfs
let gfs;
conn.once('open', () => {
  // Init stream
  gfs = Grid(conn.db, mongoose.mongo);
  gfs.collection('uploads');
});


// Create storage engine
const storage = new GridFsStorage({
    url: mongoURI,
    file: (req, file) => {
      return new Promise((resolve, reject) => {
        crypto.randomBytes(16, (err, buf) => {
          if (err) {
            return reject(err);
          }
          const filename = buf.toString('hex') + path.extname(file.originalname);
          const fileInfo = {
            filename: filename,
            bucketName: 'uploads'
          };
          resolve(fileInfo);
        });
      });
    }
  });
  const upload = multer({ storage });


  // @route GET /
// @desc Loads form
app.get('/', (req, res) => {
    gfs.files.find().toArray((err, files) => {
      // Check if files
      if (!files || files.length === 0) {
        res.render('index', { files: false });
      } else {
        files.map(file => {
          if (
            file.contentType === 'image/jpeg' || 
            file.contentType === 'image/png'
          ) {
            file.isImage = true;
          } else {
            file.isImage = false;
          }
        });
        res.render('index', { files: files });
      }
    });
  });
  
  // @route POST /upload
  // @desc  Uploads file to DB
  app.post('/upload', upload.single('file'), (req, res) => {
    // res.json({ file: req.file });
    res.redirect('/');
  });
  
  // @route GET /files
  // @desc  Display all files in JSON
  app.get('/files', (req, res) => {
    gfs.files.find().toArray((err, files) => {
      // Check if files
      if (!files || files.length === 0) {
        return res.status(404).json({
          err: 'No files exist'
        });
      }
      // Files exist
      return res.json(files);
    });
  });
  
  // @route GET /files/:filename
  // @desc  Display single file object
  app.get('/files/:filename', (req, res) => { 
    gfs.files.findOne({ filename: req.params.filename }, (err, file) => {
      // Check if file
      if (!file || file.length === 0) {
        return res.status(404).json({
          err: 'No file exists'
        });
      }
      // File exists
      return res.json(file);
    });
  });
  
  // @route GET /image/:filename
  // @desc Display Image
  app.get('/image/:filename', (req, res) => {
    gfs.files.findOne({ filename: req.params.filename }, (err, file) => {
      // Check if file
      if (!file || file.length === 0) {
        return res.status(404).json({
          err: 'No file exists'
        });
      }
  
      // Check if image
      if (file.contentType === 'image/jpeg' || file.contentType === 'image/png') {
        // Read output to browser
        const readstream = gfs.createReadStream(file.filename);
        readstream.pipe(res);
      } else {
        res.status(404).json({
          err: 'Not an image'
        });
      }
    });
  });
  
  // @route DELETE /files/:id
  // @desc  Delete file
  app.delete('/files/:id', (req, res) => {
    gfs.remove({ _id: req.params.id, root: 'uploads' }, (err, gridStore) => {
      if (err) {
        return res.status(404).json({ err: err });
      }
      res.redirect('/');
    });
  });












app.listen(8000 ,()=>{
    console.log('port is listening on port 8000')
});
