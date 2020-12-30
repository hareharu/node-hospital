var router = require('express').Router();
var func = require('../app/func');
var conn = require('../app/conn');

router.get('/ds', func.access('user'), (req, res, next) => {
  req.query = "select b.kod_book as key, trim(b.nam_book) as text \
              from s_book b \
              where b.book = 'ДИАГНОЗЫ+-' and b.date_end is null\
              order by b.nam_book";
  conn.pgsql
  .any(req.query)
  .then(data => { res.data = data; next(); })
  .catch(next);
});

router.get('/cel', func.access('user'), (req, res, next) => {
  req.query = "select b.kod_book as key, trim(b.nam_book) as text \
              from s_book b \
              where b.book = 'ЦЕЛЬ' and b.date_end is null\
              order by b.nam_book";
  conn.pgsql
  .any(req.query)
  .then(data => { res.data = data; next(); })
  .catch(next);
});

router.get('/finance', func.access('user'), (req, res, next) => {
  req.query = "select b.kod_book as key, trim(b.nam_book) as text \
              from s_book b \
              where b.book = 'ФИНАНС' and b.date_end is null\
              order by b.nam_book";
  conn.pgsql
  .any(req.query)
  .then(data => { res.data = data; next(); })
  .catch(next);
});

router.get('/list', func.access('user'), async (req, res, next) => {
  req.query = "select w.kod_doc as key, trim(m.fam) || ' ' || substr(m.nam, 1, 1) || '.' || substr(m.oth, 1, 1) || '. (' || ws.spec || ')' as text\
              from s_wrach w\
              left join sw_man m on m.kod_wman = w.kod_wman\
              left join s_spec ws ON ws.kod_spec = w.kod_spec\
              where w.day_end is null and w.kod_lpu = '" + await func.getSettings('hospital_kodlpu') + "'\
              order by m.fam, m.nam, m.oth, ws.spec";
  conn.pgsql
  .any(req.query)
  .then(data => { res.data = data; next(); })
  .catch(next);
});

router.get('/list/:podr', func.access('user'), async (req, res, next) => {
  var select_podr = "";
  if (req.params.podr !== func.niluuid()) {
    select_podr =  " and w.kod_plk in ( " + await func.getKodPlkString(req.params.podr) + ")";
  }
  req.query = "select w.kod_doc as key, trim(m.fam) || ' ' || substr(m.nam, 1, 1) || '.' || substr(m.oth, 1, 1) || '. (' || ws.spec || ')' as text \
              from s_wrach w \
              left join sw_man m on m.kod_wman = w.kod_wman \
              left join s_spec ws ON ws.kod_spec = w.kod_spec \
              where w.day_end is null and w.kod_lpu = '" + await func.getSettings('hospital_kodlpu') + "' " + select_podr + " \
              order by m.fam, m.nam, m.oth, ws.spec";
  conn.pgsql
  .any(req.query)
  .then(data => { res.data = data; next(); })
  .catch(next);
});

router.get('/spec/:podr', func.access('user'), async (req, res, next) => {
  var select_podr = "";
  if (req.params.podr !== func.niluuid()) {
    select_podr =  " and w.kod_plk in ( " + await func.getKodPlkString(req.params.podr) + ")";
  }
  req.query = "select w.kod_spec as key, trim(ws.spec) as text \
              from s_wrach w \
              left join s_spec ws ON ws.kod_spec = w.kod_spec \
              where w.day_end is null and w.kod_lpu = '" + await func.getSettings('hospital_kodlpu') + "' " + select_podr + " \
              group by w.kod_spec, ws.spec\
              order by ws.spec";
  conn.pgsql
  .any(req.query)
  .then(data => { res.data = data; next(); })
  .catch(next);
});

module.exports = router;
