'use strict';
require('dotenv').config();
const express = require('express');
const myDB = require('./connection');
const fccTesting = require('./freeCodeCamp/fcctesting.js');
const session = require('express-session')
const passport = require('passport');
const routes = require('./routes.js');
const auth = require('./auth.js');

const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

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
  const myDataBase = await client.db('University').collection('users');

  routes(app, myDataBase);
  auth(app, myDataBase);

  let currentUsers = 0;
  
  io.on('connection', (socket) => {
    ++currentUsers;
    io.emit('user_count', currentUsers);

    socket.on("hello", (arg) => {
      console.log(arg); // data
    });
    console.log('A user has connected');

    socket.on('disconnect', () => {
      console.log("Un user was disconnect")
    });
  });
  

}).catch(e => {
  app.route('/').get((req, res) => {
    res.render('pug', { title: e, message: 'Unable to login' });
  });
});



http.listen(process.env.PORT, () => {
  console.log('Listening on port ' + process.env.PORT);
});




