var router = require('express').Router();
var func = require('../app/func');
var conn = require('../app/conn');

router.get('/homepage/list', func.access('admin'), (req, res, next) => {
  req.query = "select *, id as key from homepage order by side, pos";  
  conn.whodb.all(req.query, (error, data) => {
    if (error) next(error);
    res.data = data; next();
  });
});

router.post('/homepage/:action/:id', func.access('admin'), (req, res, next) => {
  if (req.body.text === '') req.body.text = null;
  if (req.body.url === '') req.body.url = null;
  if (req.body.icon === '') req.body.icon = null;
  switch (req.params.action) {
    case 'insert':
      req.query = "insert into homepage (pos, side, type, text, url, icon, id) values (?, ?, ?, ?, ?, ?, ?)";
      req.params = [ req.body.pos, req.body.side, req.body.type, req.body.text, req.body.url, req.body.icon, req.params.id ];
      break;
    case 'update':
      req.query = "update homepage set pos = ?, side = ?, type = ?, text = ?, url = ?, icon = ? where id = ?";
      req.params = [ req.body.pos, req.body.side, req.body.type, req.body.text, req.body.url, req.body.icon, req.params.id ];
      break;
    case 'delete':
      req.query = "delete from homepage where id = ?";
      req.params = [ req.params.id ];
      break;
    default: return res.sendStatus(404);
  }
  conn.whodb.run(req.query, req.params, (err) => {
    if (err) return next(err);
    res.sendStatus(200);
  });
});

router.get('/panels/list', func.access('admin'), (req, res, next) => {
  req.query = "select * from panels order by pos";  
  conn.whodb.all(req.query, (error, data) => {
    if (error) next(error);
    res.data = data; next();
  });
});

router.post('/panels/:action/:id', func.access('admin'), (req, res, next) => {
  if (req.body.name === '') req.body.name = null;
  if (req.body.size === '') req.body.size = null;
  if (req.body.icon === '') req.body.icon = null;
  switch (req.params.action) {
    case 'insert':
      req.query = "insert into panels (pos, key, name, size, icon, id) values (?, ?, ?, ?, ?, ?)";
      req.params = [ req.body.pos, req.body.key, req.body.name, req.body.size, req.body.icon, req.params.id ];
      break;
    case 'update':
      req.query = "update panels set pos = ?, key = ?, name = ?, size = ?, icon = ? where id = ?";
      req.params = [ req.body.pos, req.body.key, req.body.name, req.body.size, req.body.icon, req.params.id ];
      break;
    case 'delete':
      req.query = "delete from panels where id = ?";
      req.params = [ req.params.id ];
      break;
    default: return res.sendStatus(404);
  }
  conn.whodb.run(req.query, req.params, (err) => {
    if (err) return next(err);
    res.sendStatus(200);
  });
});

module.exports = router;
