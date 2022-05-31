const passport = require('passport');
const bcrypt = require('bcrypt');

module.exports = function (app, myDataBase) {
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

  //Respuesta para cuando requeire 
app.use((req, res, next) => {
  res.status(404).type('text').send('Not Found');
});

//Middleware Para verificar si esta autenticado
  function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/');
  };
}