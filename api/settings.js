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

module.exports = router;
