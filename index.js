const express = require('express');
const session = require('express-session');
const passport = require('passport');
const strategy = require('./strategy');
const request = require('request');

const app = express();
app.use( session({
  secret: 'Yo, waddup!',
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(strategy);

passport.serializeUser((user, done) => {
  const { _json } = user;
  done(null, {clientID: _json.clientID, email: _json.email, name: _json.name, followers: _json.follows_url});
});

passport.deserializeUser((obj, done) => {
  done(null, obj);
});

app.get('/login', 
  passport.authenticate('auth0', 
    {successRedirect: '/followers', failureRedirect: '/login', failureFlash: true, connection: 'github'}
  )
);

app.get('/followers', (req, res) => {
  if(!req.user){
    req.redirect('/login');
  } else {
    const FollowersRequest = {
      url: req.user.followers,
      headers: {
        'User-Agent': req.user.clientID
      }
    };
    request(FollowersRequest, (error, response, body) => {
      res.status(200).send(body);
    })
  }
})

const port = 3001;
app.listen( port, () => { console.log(`Server listening on port ${port}`); } );