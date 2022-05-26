'use strict';
require('dotenv').config();
const express = require('express');
const myDB = require('./connection');
const fccTesting = require('./freeCodeCamp/fcctesting.js');
const session = require('express-session' )
const passport = require('passport');
const cookieParser = require('cookie-parser');
const ObjectID = require('mongodb').ObjectID;


const app = express();
app.set('view engine', 'pug');


// Genera la vista y con urlencoded le permite a express leer los datos que vienen de un formulario
fccTesting(app); // For fCC testing purposes
app.use('/public', express.static(process.cwd() + '/public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));



app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: true,
  cookie:{ secure: false }
}));

app.use(passport.initialize());
app.use(passport.session())

myDB(async client => {
  const myDataBase = await client.db('database').collection('users');

  app.route('/').get((req, res) => {
  // Change the response to render the Pug template
  res.render('pug', {
    title: 'Connected to Database',
    message: 'Please login'
  });
});

//Data Base with mongoDB
//const client = new  ObjectID(THE_ID)

passport.serializeUser((user, done) => {
  done(null, user._id);
});

passport.deserializeUser((id, done) => {
  myDataBase.findOne({ _id: new ObjectID(id) }, (err, doc) => {
    done(null,doc);
  });
});

}).catch(e => {
  app.route('/').get((req, res) => {
    res.render('pug', { title: e, message: 'Unable to login' });
  });
});

//res.render(process.cwd() + '/views/pug/index', {title: 'Hello', message: 'Please login'});

app.listen(process.env.PORT ,() => {
  console.log('Listening on port ' + process.env.PORT);
});




