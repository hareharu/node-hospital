var router = require('express').Router();
var func = require('../app/func');
var conn = require('../app/conn');

router.get('/query/:id', func.access('admin'), (req, res, next) => {
  req.query = "select query from queries where id = ?";
  conn.whodb.get(req.query, req.params.id, (error, data) => {
    if (error) next(error);
    if (data === undefined) return res.sendStatus(404);
    res.data = data.query; next();
  });
});

router.get('/queries/:id', func.access('admin'), (req, res, next) => {
  req.query = "select id, id as key, name from queries where db = ? order by name";
  conn.whodb.all(req.query, req.params.id, (error, data) => {
    if (error) next(error);
    res.data = data; next();
  });
});

router.get('/delete/:id', func.access('admin'), (req, res, next) => {
  req.query = "delete from queries where id = ?";
  conn.whodb.run(req.query, req.params.id, (error) => {
    if (error) return next(error);
    res.sendStatus(200);
  });
});

router.post('/save/:id', func.access('admin'), (req, res, next) => {
  req.query = "update queries set name = ?, query = ?, db = ? where id = ?";
  conn.whodb.run(req.query, req.body.name, req.body.query, req.body.db, req.params.id, (error) => {
    if (error) return next(error);
    res.sendStatus(200);
  });
});

router.post('/rename/:id', func.access('admin'), (req, res, next) => {
  req.query = "update queries set name = ? where id = ?";
  conn.whodb.run(req.query, req.body.name, req.params.id, (error) => {
    if (error) return next(error);
    res.sendStatus(200);
  });
});

router.post('/new/:id', func.access('admin'), (req, res, next) => {
  req.query = "insert into queries (name, query, db, id) values (?, ?, ?, ?)";
  conn.whodb.run(req.query, req.body.name, req.body.query, req.body.db, req.params.id, (error) => {
    if (error) return next(error);
    res.sendStatus(200);
  });
});

var generateColumns = (row) => {
  if (row === undefined) return []
  var keyNames = Object.keys(row);
  var columns = [];
  keyNames.forEach(key => columns.push({ key: key, name: key, fieldName: key, isResizable: true, minWidth: 10, maxWidth: 100 }));
  return columns;
}

router.post('/run/who', func.access('admin'), (req, res, next) => {
  conn.whodb.all(req.body.query, req.body.params, (error, data) => {
    if (error) {
      res.data = { result: -1, items: [], columns: [], message: JSON.stringify(error) }; return next();
    };
    if (data[0] !== undefined) {
      res.data = { result: 1, items: data, columns: generateColumns(data[0]) };
    } else {
      res.data = { result: 0, items: [], columns: [] };
    }
    // console.log(res.data);
    next();
  });
});

router.post('/run/fpr', func.access('admin'), (req, res, next) => {
  conn.fproc.all(req.body.query, req.body.params, (error, data) => {
    if (error) {
      res.data = { result: -1, items: [], columns: [], message: JSON.stringify(error) }; return next();
    };
    if (data[0] !== undefined) {
      res.data = { result: 1, items: data, columns: generateColumns(data[0]) };
    } else {
      res.data = { result: 0, items: [], columns: [] };
    }
    // console.log(res.data);
    next();
  });
});

router.post('/run/pgh', func.access('admin'), (req, res, next) => { 
  conn.pgsql.any(req.body.query, req.body.params)
  .then(data => {
    if (data[0] !== undefined) {
      res.data = { result: 1, items: data, columns: generateColumns(data[0]) };
    } else {
      res.data = { result: 0, items: [], columns: [] };
    }
    next();
  })
  .catch(error => {
    res.data = { result: -1, items: [], columns: [], message: JSON.stringify(error) }; next();
  });
});

router.post('/run/rst', func.access('admin'), (req, res, next) => {
  conn.fbird.attach(conn.options, function(err, db) {
    if (err) { res.data = { result: -1, items: [], columns: [], message: JSON.stringify(err) }; return next(); }
    db.query(req.body.query, req.body.params, function(err, data) {
        if (err) { res.data = { result: -1, items: [], columns: [], message: JSON.stringify(err) }; db.detach(); return next(); }
        if (data[0] !== undefined) {
          res.data = { result: 1, items: data, columns: generateColumns(data[0]) };
        } else {
          res.data = { result: 0, items: [], columns: [] };
        }
        db.detach();
        next();
    });
  });
});

module.exports = router;
