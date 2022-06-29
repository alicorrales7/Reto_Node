const passport = require('passport');
const localStrategy = require('passport-local').Strategy;

passport.use('local-signup', new localStrategy({
usernameField:'',
passwordField:'',
passReqToCallback:true
 },(req,username,password,done)=>{
    
 }))