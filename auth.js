const passport = require('passport');
const ObjectID = require('mongodb').ObjectID;
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');

module.exports = function (app, myDataBase) {

    passport.serializeUser((user, done) => {
        done(null, user._id);
      });
      passport.deserializeUser((id, done) => {
        myDataBase.findOne({ _id: new ObjectID(id) }, (err, doc) => {
          if (err) return console.error(err);
          done(null, doc);
        });
      });

        //Toma los valores username y password  dentro de una funcion y la funsion done
  // cambia el 3er if, ahora aseguramos que la comparacion sea entra contrasenas cifradas.
      passport.use(new LocalStrategy(
        function(username, password, done) {
          myDataBase.findOne({ username: username }, function (err, user) {
            console.log('User '+ username +' attempted to log in.');
            if (err) { return done(err); }
            if (!user) { return console.log("El user is invalid"), done(null, false); }
            if ((bcrypt.compareSync(password, user.password)) !== true) { return console.log("El pwd is invalid"),done(null, false); }
            console.log(password)
            return done(null, user);
          });
        }
      ));

};
