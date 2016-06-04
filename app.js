var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var fs = require('fs');
var jsonfile = require('jsonfile');

var app = express();

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json({limit: '5mb'}));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/bower_components',  express.static(__dirname + '/bower_components'));

app.get('/', function(req, res) {
  res.sendFile('index.html');
});

app.get('/data/json', function(req, res) {
  fs.readFile(__dirname + '/data/' + req.query.accessCode + '_data.json', function(err, data) {
    if (err) {
      res.sendStatus(404);
      console.log(err);
      return;
    }
    res.json(data.toString('utf8'));
  });
});

var lastVersion = 0;

app.post('/data/newData', function(req, res) {
  var body = req.body;
  if (body.data.version > lastVersion) {
      lastVersion = body.data.version;
      jsonfile.writeFileSync(
          __dirname + '/data/' + body.accessCode + '_data.json',
          body.data
      );
      res.sendStatus(200);
  } else {
    res.sendStatus(400);
  }
});

app.listen(8093);

module.exports = app;
