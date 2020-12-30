var router = require('express').Router();
var func = require('../app/func');
var fs = require('fs');
var path = require('path');
var conn = require('../app/conn');

router.get('/webstlog/:log', func.access('admin'), (req, res, next) => {
  if (process.env.RST_LOGS) {
    fs.readFile(path.join(process.env.RST_LOGS, (req.params.log + '.log')), 'utf8', (error, data) => {
      if (error) { 
        res.send('Не удалось прочитать журнал ' + path.join(process.env.RST_LOGS, (req.params.log + '.log')));
      } else {
        res.send(data);
      }
    });
  } else {
    res.send('Параметр RST_LOGS не задан');
  }
});

router.get('/epicload', func.access('admin'), (req, res, next) => {
  req.query = "select \
              l.bgload as load, \
              l.bgdate as date, \
              l.npage +1 as page, \
              case when l.nresult > 0 then l.nresult else 0 end as result, \
              count(e.idman) as found, \
              case \
                when l.nresult = -1 \
                then case when left(l.cbody, 8) = '{\"data\":' then 'Нераспознанная ошибка' else rtrim(l.cbody) end \
                else '' \
              end as error \
              from epicload l left join epicris e on e.idepicload = l.idepicload and e.idman <> '' \
              where l.bgload > date(now()) group by  bgload, l.bgdate, l.npage, l.nresult, error";
  conn.pgsql
  .any(req.query)
  .then(data => { res.data = data; next(); })
  .catch(next);
});

router.get('/hspload', func.access('admin'), (req, res, next) => {
  req.query = "select l.bgdate, l.crdate, l.cfile, l.n_version, s.sp, \
              case when l.crdate is null then 'red' else '' end as rowcolor \
              from hspload l left join sp s on s.idsp = l.idsp \
              where l.bgdate > date(now())";
  conn.pgsql
  .any(req.query)
  .then(data => { res.data = data; next(); })
  .catch(next);
});

module.exports = router;
