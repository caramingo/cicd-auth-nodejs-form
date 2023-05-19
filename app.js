
/**
 * Module dependencies.
 */
const fileUtility = require('./file-utility');

let masterDirectoryToList = '/home/pasu';
const express = require('express')
, http = require('http')
, bodyParser = require('body-parser')
, cookieparser = require('cookie-parser')
, session = require('express-session')
, path = require('path'),
serviceIndex = require('serve-index')
;
const app = express();

const mustacheExpress = require('mustache-express');

app.set('port', process.env.PORT || 3000);
app.engine('html', mustacheExpress());
app.set('views', __dirname + '/views');
app.set('view engine', 'html');
app.use(cookieparser());
app.use(bodyParser.json({limit: '1mb'}));

//app.use('/ftp', serviceIndex(__dirname + '/node_modules'));
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(session({ secret: 'passsss',
  resave: true,
  saveUninitialized: true
  }));

app.get('/login', function (req, res) {
  res.render('login');
});

app.post('/login', function (req, res) {
  var post = req.body;
  if (post.user && post.password && validateAuth(post.user, post.password)) {
    req.session.user_id = post.user;
    res.redirect('/ftp');
  } else {
    res.send('Bad user/pass');
  }
});

app.use('/ftp', checkAuth, express.static(masterDirectoryToList));
app.use('/ftp', checkAuth, serviceIndex(masterDirectoryToList));

app.get('/logout', function (req, res) {
  delete req.session.user_id;
  res.redirect('/login');
});  

app.get('/*', checkAuth, function (req, res) {
  res.render('error404');
});
http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});


// Party starts here
function checkAuth(req, res, next) {
  if (req.session && req.session.user_id) {
    next();
  } else {
    res.redirect('/login');
  }
}

function validateAuth(user, pass) {
  let authKeys = fileUtility.readAuthFile();
  let isValid = false;
  if(authKeys.users) {
    authKeys.users.forEach(function (userObject) {
      if(userObject.user === user && userObject.pass === pass) {
        isValid = true;
      }
    });
  }
  return isValid;
}

