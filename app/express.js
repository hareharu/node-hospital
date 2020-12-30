var express = require('express');
var morgan = require('morgan');
var session = require('express-session');
var fileUpload = require('express-fileupload');
var sessionStore = require('connect-sqlite3')(session);
var cookieParser = require('cookie-parser');

var app = express();

var func = require('./func');

if (process.env.PROXY) app.set('trust proxy', process.env.PROXY);

app.use(express.json());
app.use(cookieParser());
app.use(fileUpload()); // { createParentPath: true }

app.use(session({
  name: (process.env.APPNAME || 'node-hospital') + '.' + process.env.NODE_ENV + '.sid',
  store: new sessionStore({ db: 'database.db', table: 'sessions' }),
  secret: process.env.SECRET || 'there will come soft rains',
  cookie: { maxAge: 60000 },
  saveUninitialized: false,
  unset: 'destroy',
  resave: false,
  secure: false,
}));

app.use(express.static('./client'));
app.use('/file', express.static('./files'))

morgan.token('ip', (req, res, next) => { return func.normalizeIP(req.ip); });
morgan.token('user', (req, res, next) => { return req.session.user ? req.session.user.login : '-'; });
if (process.env.NODE_ENV !== 'production') app.use(morgan(process.env.DEV_LOG || 'dev'));

app.use('/api', require('./router'));
app.use('/api', require('./proxy'));

app.use((req, res, next) => {
  // console.log(res.data);
  if (res.data) return res.json({ status: 'ok', data: res.data, groups: res.groups });
  // if (res.result === 'ok') res.sendStatus(200);
  next();
});

app.use((req, res, next) => {
  res.sendStatus(404);
});

app.use((err, req, res, next) => {
  if (!err.status) err.status = 500;
  if (!err.message) err.message = 'Неизвестная ошибка';
  switch (req.datatype) {
    // case 'pgsql': err.message = err.message; break;
    case 'access': err.message = err.process.message; break;
    case 'dbase': err.message = err.process.message; break;
    // case 'fbird': err.message = err.message; break;
    // case 'sqlite': err.message = err.message; break;
    // case 'soap': err.message = err.message; break;
    default: req.datatype = 'system';
  }
  res.status(err.status);
  if (process.env.NODE_ENV !== 'production') {
    res.json({ status: err.status, type: req.datatype, message: err.message, query: req.query, stack: err.stack });
    console.error(JSON.stringify(err, null, 2));
  } else {
    console.log('ERROR on route ' + req.url);
    res.json({ status: err.status, type: req.datatype, message: err.message });
  }
});

module.exports = app;
