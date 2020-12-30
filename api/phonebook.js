var router = require('express').Router();
var func = require('../app/func');
var conn = require('../app/conn');

router.get('/list', func.access('guest'), (req, res, next) => {
  var query = "select *, id as key,\
              coalesce(dept, ' -') as rowgroup, \
              coalesce(dept, ' -') as roworder, \
              coalesce(room, '')||' '||coalesce(job, '') as title, \
              coalesce(dept, '')||' '||coalesce(job, '')||' '||coalesce(name, '')||' '||coalesce(phone, '')||' '||coalesce(email, '')||' '||coalesce(room, '')||' '||coalesce(replace(replace(replace(replace(phone, ' ', ''), '-', ''), '(', ''), ')', ''),'') as filter\
              from phonebook order by dept, job, name";  
  conn.whodb.all(query, (err, rows) => {
    if (err) return res.sendStatus(500);
    // res.json(rows);
    res.json({ status: 'ok', data: rows });
  });
});

router.post('/:action/:id', func.access('admin'), (req, res, next) => {
  if (req.body.dept === '') req.body.dept = null;
  if (req.body.name === '') req.body.name = null;
  if (req.body.phone === '') req.body.phone = null;
  if (req.body.job === '') req.body.job = null;
  if (req.body.email === '') req.body.email = null;
  if (req.body.room === '') req.body.room = null;
  switch (req.params.action) {
    case 'insert':
      req.query = "insert into phonebook (dept, name, phone, job, email, room, id) values (?, ?, ?, ?, ?, ?, ?)";
      req.params = [ req.body.dept, req.body.name, req.body.phone, req.body.job, req.body.email, req.body.room, req.params.id ];
      break;
    case 'update':
      req.query = "update phonebook set dept = ?, name = ?, phone = ?, job = ?, email = ?, room = ? where id = ?";
      req.params = [ req.body.dept, req.body.name, req.body.phone, req.body.job, req.body.email, req.body.room, req.params.id ];
      break;
    case 'delete':
      req.query = "delete from phonebook where id = ?";
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
