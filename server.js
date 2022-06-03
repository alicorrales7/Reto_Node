'use strict';
require('dotenv').config();
const express = require('express');
const myDB = require('./connection');
const fccTesting = require('./freeCodeCamp/fcctesting.js');
const session = require('express-session')
const passport = require('passport');
const routes = require('./routes.js');
const auth = require('./auth.js');
const passportSocketIo = require('passport.socketio');
const cookieParser = require('cookie-parser');

const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

const MongoStore = require('connect-mongo')(session);
const URI = process.env.MONGO_URI;
const store = new MongoStore({ url: URI });

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
  cookie: { secure: false },
  key: 'express.sid',
  store: store,
  
}));

app.use(passport.initialize());
app.use(passport.session())


io.use(
  passportSocketIo.authorize({
    cookieParser: cookieParser,
    key: 'express.sid',
    secret: process.env.SESSION_SECRET,
    store: store,
    success: onAuthorizeSuccess,
    fail: onAuthorizeFail
  })
);



//Se conecta a la base de datos con el try, si no funciona lanza un texto con el catch
myDB(async client => {
  const myDataBase = await client.db('University').collection('users');

  routes(app, myDataBase);
  auth(app, myDataBase);

  let currentUsers = 0;

  io.on('connection', (socket) => {
    ++currentUsers;

    console.log('user ' + socket.request.user + ' connected');
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

function onAuthorizeSuccess(data, accept) {
  console.log('successful connection to socket.io');

  accept(null, true);
}

function onAuthorizeFail(data, message, error, accept) {
  if (error) throw new Error(message);
  console.log('failed connection to socket.io:', message);
  accept(null, false);
}



http.listen(process.env.PORT, () => {
  console.log('Listening on port ' + process.env.PORT);
});




