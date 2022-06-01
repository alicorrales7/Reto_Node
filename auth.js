const passport = require('passport');
const ObjectID = require('mongodb').ObjectID;
const LocalStrategy = require('passport-local').Strategy;
const GitHubStrategy = require('passport-github').Strategy;
require('dotenv').config();
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
            return done(null, user);
          });
        }
      ));
    
      passport.use(new GitHubStrategy({
        clientID: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        callbackURL: process.env.CALL_BACK
      },
        function(accessToken, refreshToken, profile, cb) {
          console.log(profile);
          myDataBase.findOneAndUpdate(
            { id: profile.id },
            {
              $setOnInsert: {
                id: profile.id,
                name: profile.displayName || 'John Doe',
                photo: profile.photos[0].value || '',
                email: Array.isArray(profile.emails)
                  ? profile.emails[0].value
                  : 'No public email',
                created_on: new Date(),
                provider: profile.provider || ''
              },
              $set: {
                last_login: new Date()
              },
              $inc: {
                login_count: 1
              }
            },
            { upsert: true, new: true },
            (err, doc) => {
              return cb(null, doc.value);
            }
          );
        }
      ));
};
