var router = require('express').Router();
var func = require('../app/func');
var conn = require('../app/conn');

router.get('/:datefrom/:dateto/:podr/:doc/:pay/:date', func.access('user'), async (req, res, next) => { req.datatype = 'pgsql';

var where  = '';

where += " w.kod_lpu = '" + await func.getSettings('hospital_kodlpu') + "' and ";

if (req.params.podr !== func.niluuid()) {
  where +=  " w.kod_plk in ( " + await func.getKodPlkString(req.params.podr)  + ") and ";
}

 if (req.params.doc !== func.niluuid()) {
  where += " w.kod_doc = '" + req.params.doc + "' and ";
 }

  var day_select = "a.day_rpr";

  req.query = "select \
              sp.spec as spec, \
              b.nam_book as vis, \
              count(*) as obr, \
              sum((select count(*) from priem p where p.nz_am_tln = a.nz_am_tln)) as pos, \
              sum(case when (select count(*) from priem p where p.nz_am_tln = a.nz_am_tln) = 1 then 1 else 0 end) as obr1, \
              sum(case when (select count(*) from priem p where p.nz_am_tln = a.nz_am_tln) > 1 then 1 else 0 end) as obr2, \
              count(distinct a.kod) as pac, \
              sum((select sum(ps.koef_proc*pr.quant) from priem p left join proced pr on p.nz_priem = pr.nz_priem left join s_proced ps on pr.kod_proc = ps.kod_proc and not substr(ps.mnem_new,1,1) = 'Z' where p.nz_am_tln = a.nz_am_tln)) as uet \
              from am_talon a \
              left join s_book b on a.kod_cel = b.kod_book and b.book = 'ЦЕЛЬ' \
              LEFT JOIN s_book f on f.kod_book = a.kod_finans and f.book = 'ФИНАНС' \
              left join s_wrach w on w.kod_doc = a.kod_doc \
              left join s_spec sp on sp.kod_spec = w.kod_spec \
              where " + where + " " + day_select + " between $1 and $2 and rtrim(f.mnem_book) in ('01', '02', '03', '04') \
              group by sp.spec, b.nam_book order by sp.spec, b.nam_book";

// console.log(req.query)

 req.query2 = "select \
              count(distinct a.kod) as pac \
              from am_talon a \
              left join s_wrach w on w.kod_doc = a.kod_doc \
              LEFT JOIN s_book f on f.kod_book = a.kod_finans and f.book = 'ФИНАНС' \
              where " + where + " " + day_select + " between $1 and $2 and rtrim(f.mnem_book) in ('01', '02', '03', '04')";



  conn.pgsql
  .one(req.query2, [req.params.datefrom + ' 00:00:00', req.params.dateto + ' 23:59:59'])
  .then(data => { res.patient = data.pac; next(); })
  .catch(next);
}, (req, res, next) => {

  conn.pgsql
  .any(req.query, [req.params.datefrom + ' 00:00:00', req.params.dateto + ' 23:59:59'])
  .then(data => {

  var sum = func.fillArray(0, 9);
  var output = '';

  for (var row in data) {

      var spec = data[row].spec;
      var vis = data[row].vis;
      var obr = parseInt(data[row].obr);
      var pos = parseInt(data[row].pos);
      var obr1 = parseInt(data[row].obr1);
      var obr2 = parseInt(data[row].obr2);
      var pac = parseInt(data[row].pac);
      var uet = parseFloat(data[row].uet);

      if (!uet > 0) { uet = 0;}
      output += '<tr><td>' + spec + '</td><td>' + vis + '</td><td>' + obr + '</td><td>' + pos + '</td><td>' + obr1 + '</td><td>' + obr2 + '</td><td>' + pac + '</td><td>' + uet + '</td></tr>';

  
      sum[3] += obr;
      sum[4] += pos;
      sum[5] += obr1;
      sum[6] += obr2;
      sum[7] += pac;
      sum[8] += uet;

    }

    sum[7] = res.patient;

    var table = '<table border="1"> \
                <thead align="center"> \
              <tr style="font-weight:bold;"> \
              <td>Специальность</td> \
              <td>Цель</td> \
              <td>Обращения</td> \
              <td>Посещения</td> \
              <td>Обр. с пос. = 1</td> \
              <td>Обр. с пос. >= 2</td> \
              <td>Пациентов</td> \
              <td>УЕТ</td> \
            </tr><tr>';
    for (var i = 1; i <= 8; i++) {
      table += '<th>' + i + '</th>';
    }
    table += '</tr> \
              </thead> \
              <tbody>' + output + '</tbody> \
              <tfoot> \
                <tr style="font-weight:bold;"> \
                  <td align="left" colspan="2">Итого</td>';
    for (i = 3; i <= 8; i++) {
      table += '<td>' + sum[i] + '</td>';
    }
    table += '</tr> \
              </tfoot> \
              </table>';

    res.send(table);
  })
  .catch(next);
});

module.exports = router;
