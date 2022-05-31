'use strict';
require('dotenv').config();
const express = require('express');
const myDB = require('./connection');
const fccTesting = require('./freeCodeCamp/fcctesting.js');
const session = require('express-session')
const passport = require('passport');
const ObjectID = require('mongodb').ObjectID;
const LocalStrategy = require('passport-local').Strategy;

//Middleware Para verificar si esta autenticado
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
      return next();
  }
  res.redirect('/');
};

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
      message: 'Please login',
      showLogin:true,
      showRegistration:true
    });
  });

  //Levanta la tura Post login , con el  passport.authenticate(local,) definimos la esrategia a usar con el middleware.
  // FailuerRedirect define qeu si algo sale mal entonces me lleva a la ruta "/"
  //La function representa la ruta satisfactoria
  app.route('/login').post(passport.authenticate('local', { failureRedirect: '/' }), (req, res) => {
    res.redirect('/profile');
  });

  //Si el user no esta autenticado y trata de entrar a /profile se le redirecciona al login
  app.route('/profile').get(ensureAuthenticated, (req,res) => {
    res.render(process.cwd() + '/views/pug/profile', { username: req.user.username });
 });

 //Ruta para cerrar la session de un user
 app.route('/logout').get((req, res) => {
    req.logout();
    res.redirect('/');
});

//Respuesta para cuando requeire 
app.use((req, res, next) => {
  res.status(404).type('text').send('Not Found');
});

  app.route('/chat').get((req, res) => {
    res.render(process.cwd() + '/views/pug/chat');
    
  });
  
  //se define la ruta de registro de un usuario, en caso de no existir ningun error
  // redireccionamos a la ruta de Login sino se redirecciona a ruta principal.
  //En el siguinte tiket vamos a cambiar la seguridad asignando una clave hash a nuestro
  //req.body.password.
  
  app.route('/register')
  .post((req, res, next) => {
    const hash = bcrypt.hashSync(req.body.password, 12);
    myDataBase.findOne({ username: req.body.username }, function(err, user) {
      if (err) {
        next(err);
      } else if (user) {
        res.redirect('/');
      } else {
        myDataBase.insertOne({
          username: req.body.username,
          password: hash
        },
          (err, doc) => {
            if (err) {
              res.redirect('/');
            } else {
              // The inserted document is held within
              // the ops property of the doc
              next(null, doc.ops[0]);
            }
          }
        )
      }
    })
  },
    passport.authenticate('local', { failureRedirect: '/' }),
    (req, res, next) => {
      res.redirect('/profile');
    }
  );
  

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




