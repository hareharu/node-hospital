var router = require('express').Router();
var func = require('../app/func');
var conn = require('../app/conn');

router.get('/list', func.access('guest'), (req, res, next) => {
  conn.whodb.all("select *, name as key from settings order by name", (error, data) => {
    if (error) next(error);
    res.data = data; next();
  });
});

router.get('/value/:name', func.access('guest'), (req, res, next) => {
  conn.whodb.get("select value from settings where name = ?", req.params.name, (error, data) => {
    if (error) next(error);
    if (data === undefined) return res.sendStatus(404);
    res.data = data.value; next();
  });
});

router.post('/value/:name', func.access('admin'), (req, res, next) => {
  conn.whodb.run("update settings set value = ? where name = ?", req.body.value, req.params.name, (err) => {
    if (err) return next(err);
    res.sendStatus(200);
  });
});

router.get('/reset/:name', func.access('admin'), (req, res, next) => {
  conn.whodb.run("update settings set value = defaultvalue where name = ?", req.params.name, (err) => {
    if (err) return next(err);
    res.sendStatus(200);
  });
});

router.get('/hardware/tags', func.access('admin'), (req, res, next) => {





  conn.whodb.all("select *,\
    case\
    when class = 'computer' then 'Компьютер'\
    when class = 'monitor' then 'Монитор'\
    when class = 'printer' then 'Принтер'\
    when class = 'scaner' then 'Сканер'\
    when class = 'ups' then 'ИБП'\
    when class = 'network' then 'Сетевое'\
    end as rowgroup,\
    id as key from hardwaretags order by class, pos, name", (error, data) => {
    if (error) next(error);
    res.data = data; next();
  });
});

router.post('/hardware/tags/:action/:id', func.access('admin'), (req, res, next) => { 
  switch (req.params.action) {
    case 'delete':
      req.values = [ req.params.id ];
      req.query = "delete from hardwaretags where id = ?";
      break;
    case 'update':
      req.values = [ req.body.name, req.body.type, req.body.pos, req.params.id];
      req.query = "update hardwaretags set name = ?, type = ?, pos = ? where id = ?";
      break;
    case 'insert':
      req.body.field = req.body.name.replace(/[^a-zа-я0-9]/gim,"").trim();
      req.values = [ req.params.id, req.body.class, req.body.field, req.body.name, req.body.type, req.body.pos ];
      req.query = "insert into hardwaretags (id, class, field, name, type, pos) values (?, ?, ?, ?, ?, ?)";
      break;
    default:
      return res.sendStatus(404);
  }
  conn.whodb.run(req.query, req.values, function(err) {
    if (err) return next(err);
    res.sendStatus(200);
  });
});

module.exports = router;
