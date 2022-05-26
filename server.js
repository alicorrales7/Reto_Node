'use strict';
require('dotenv').config();
const express = require('express');
const myDB = require('./connection');
const fccTesting = require('./freeCodeCamp/fcctesting.js');
const session = require('express-session')
const passport = require('passport');
const cookieParser = require('cookie-parser');
const ObjectID = require('mongodb').ObjectID;
const LocalStrategy = require('passport-local').Strategy;


const app = express();
app.set('view engine', 'pug');


// Genera la vista y con urlencoded le permite a express leer los datos que vienen de un formulario
fccTesting(app);
app.use('/public', express.static(process.cwd() + '/public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


//Levanta la session con los parametros que se le pasan
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: true,
  cookie: { secure: false }
}));

app.use(passport.initialize());
app.use(passport.session())



//Se conecta a la base de datos con el try, si no funciona lanza un texto con el catch
myDB(async client => {
  const myDataBase = await client.db('database').collection('users');

  //Toma los valores username y password  dentro de una funcion y la funsion done 
  passport.use(new LocalStrategy(function (username, password, done) {
      
    myDataBase.findOne({ username: username }, function (err, user) {
      console.log('User ' + username + ' attempted to log in.');
      if (err) { return done(err); }
      if (!user) { return done(null, false); }
      if (password !== user.password) { return done(null, false); }
      return done(null, user);
    });

  }))

  app.route('/').get((req, res) => {
    // Change the response to render the Pug template
    res.render('pug', {
      title: 'Connected to Database',
      message: 'Please login'
    });
  });


  passport.serializeUser((user, done) => {
    done(null, user._id);
  });

  passport.deserializeUser((id, done) => {
    myDataBase.findOne({ _id: new ObjectID(id) }, (err, doc) => {
      done(null, doc);
    });
  });

}).catch(e => {
  app.route('/').get((req, res) => {
    res.render('pug', { title: e, message: 'Unable to login' });
  });
});


app.listen(process.env.PORT, () => {
  console.log('Listening on port ' + process.env.PORT);
});




