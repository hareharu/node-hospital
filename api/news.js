var router = require('express').Router();
var func = require('../app/func');
var conn = require('../app/conn');
var timestamp = require('timestamp-zoned');

router.get('/list', func.access('guest'), (req, res, next) => {
  req.query = "select news.id, news.id as key, news.name, news.text, news.day, coalesce(news.hide, '') as hide, news.categoryid, newscategory.name as category, coalesce(news.edited, news.added) as modified\
              from news left join newscategory on newscategory.id = news.categoryid where news.deleted is null order by news.day desc";  
  conn.whodb.all(req.query, (error, data) => {
    if (error) next(error);
    res.data = data; next();
  });
});

router.get('/list/:id', func.access('guest'), (req, res, next) => {
  req.query = "select * from news where id = ?";
  conn.whodb.get(req.query, req.params.id, (error, data) => {
    if (error) next(error);
    res.data = data; next();
  });
});

router.get('/last', func.access('guest'), (req, res, next) => {
  req.query = "select *, coalesce(edited, added) as modified from news where deleted is null and (hide is null or hide >= ?) order by day desc limit 1";  
  conn.whodb.all(req.query, func.currentDate(), (error, data) => {
    if (error) next(error);
    res.data = data; next();
  });
});

router.post('/delete', func.access('user'), (req, res, next) => {
  req.query = "update news set deleted = ?, editedby = ?, edited = ? where id = ?";
  conn.whodb.run(req.query, [timestamp.getTimestamp(), req.session.user.id, timestamp.getTimestamp(), req.body.id], (err) => {
  if (err) return next(err);
    res.sendStatus(200);
  });
});

router.post('/edit', func.access('user'), (req, res, next) => {
  if (req.body.hide === '') req.body.hide = null;
  if (req.body.id) {
    req.query = "update news set name = ?, day = ?, hide = ?, text = ?, categoryid = ?, editedby = ?, edited = ? where id = ?";
  } else {
    req.body.id = req.body.newid;
    req.query = "insert into news (name, day, hide, text, categoryid, addedby, added, id) values (?, ?, ?, ?, ?, ?, ?, ?)";
  }
  conn.whodb.run(req.query, [ req.body.name, req.body.day, req.body.hide, req.body.text, req.body.categoryid, req.session.user.id, timestamp.getTimestamp(), req.body.id ], function(err) {
    if (err) return next(err);
    if (!req.body.id) {
      res.json({ status: 'ok', id:  this.lastID });
    } else {
      res.json({ status: 'ok', changes:  this.changes });
    }
  });
});

router.post('/category/:action/:id', func.access('user'), (req, res, next) => {
  switch (req.params.action) {
    case 'insert':
      req.query = "insert into newscategory (name, addedby, added, id) values (?, ?, ?, ?)";
      req.params = [ req.body.name, req.session.user.id, timestamp.getTimestamp(), req.params.id ]
      break;
    case 'update':
      req.query = "update newscategory set name = ?, editedby = ?, edited = ? where id = ?";
      req.params = [ req.body.name, req.session.user.id, timestamp.getTimestamp(), req.params.id ]
      break;
    case 'delete':
      req.query = "update newscategory set deleted = ?, editedby = ?, edited = ? where id = ?";
      req.params = [timestamp.getTimestamp(), req.session.user.id, timestamp.getTimestamp(), req.params.id];
      break;
    default: return res.sendStatus(404);
  }
  conn.whodb.run(req.query, req.params, (err) => {
    if (err) return next(err);
    res.sendStatus(200);
  });
});

router.get('/categorydropdown', func.access('user'), (req, res, next) => {
  req.query = "select id as key, name as text from newscategory where deleted is null order by name";  
  conn.whodb.all(req.query, (error, data) => {
    if (error) next(error);
    res.data = data; next();
  });
});

router.get('/category', func.access('guest'), (req, res, next) => {
  req.query = "select *, id as key from newscategory where deleted is null order by name";  
  conn.whodb.all(req.query, (error, data) => {
    if (error) next(error);
    res.data = data; next();
  });
});

module.exports = router;
