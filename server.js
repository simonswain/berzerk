var server;
var express = require('express');
var app = express();
var less = require('less-middleware');

app.port = 3002;
server = require('http').createServer(app);

app.use(less({
  force: true,
  prefix: '/css',
  src: __dirname + '/public/less',
  dest: __dirname + '/public/css',
}));

app.locals.pretty = true;
app.disable('x-powered-by');

app.set('views', __dirname + '/views');
app.set('view engine', 'jade');

app.use(express.logger('dev'));
app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));

app.use(express.favicon(__dirname + '/public/images/favicon.ico')); 
app.use(express.static(__dirname + '/public'));
app.use('/vendor', express.static(__dirname + '/bower_components'));
app.use(express.methodOverride());
app.use(express.bodyParser());
app.use(app.router);

require('./routes')(app);

server.listen(app.port);

console.log('Berzerk', 'http://127.0.0.1:' + app.port);
