var router = require('express').Router();
var func = require('../app/func');
var conn = require('../app/conn');

router.post('/list', func.access('doctor'), (req, res, next) => {
  var where1 = "";
  var where2 = "";
  var where3 = "";
  if (req.body.sign === '2') {
    where3 = " and d.date_sign is not null";
  }
  if (req.body.type === '2') {
    where1 = " idffoms_v006 <> 4 and ";
    where2 = " and l.idffoms_v006 <> 4 "; // in (1, 2, 5, 11)
  }
  if (req.body.type === '3') {
    where1 = " idffoms_v006 = 4 and ";
    where2 = " and l.idffoms_v006 = 4 "; // in (1, 2, 5, 11)
  }
  var date1 = "epicris.dclosem";
  var date2 = "l.dclosem";
  if (req.body.date === '2') {
    date1 = "epicload.crload";
    date2 = "d.crdate";
  }
  req.query = "select '' as rowcolor, 'guz' as etype, e.surname||' '||e.name||' '||e.otch as fio, e.birthday, rtrim(w.work) as work, \
              coalesce(t2.namkr_book||' '||t1.town||', '||s2.namkr_book||' '||s1.street||', д. '||e.dom||e.bdom||(case when e.kor <> 0 then ', кор. '||e.kor else '' end)||(case when e.kv <> 0 then ', кв. '||e.kv||e.bkv else '' end), case when not e.p_city = '' and not e.ul = '' then e.p_city||', '||e.ul||', д. '||e.dom||e.bdom||(case when e.kor <> 0 then ', кор. '||e.kor else '' end)||(case when e.kv <> 0 then ', кв. '||e.kv||e.bkv else '' end) else '-' end) as address,\
              e.idffoms_v006 as gosptype, e.date_in, e.dclosem, e.id, e.id as key, coalesce(d.mkb,'') as mkb, e.id_ul, e.dom, bit_length(e.epicrisis_m) as bits, \
              'Эпикриз '||surname||' '||substring(name from 1 for 1)||'.'||substring(otch from 1 for 1)||'. '||to_char(date_in,'DD.MM.YYYY')||'-'||to_char(dclosem,'DD.MM.YYYY')||'.pdf' as filename \
              from epicris e \
              left join s_street s1 on s1.kod_esvs = to_char(e.id_ul, '999999999')\
              left join s_town t1 on t1.kod_town = s1.kod_town\
              left join s_book t2 on t2.kod_book = t1.typ_town and t2.book = 'НАС ПУНКТЫ'\
              left join s_book s2 on s2.kod_book = s1.typ_street and s2.book = 'ТИПЫ УЛИЦ'\
              left join work w on w.workmnem = to_char(e.idmu_send, '999999999')\
              left join s_diagn d on to_number(d.kod_esvs, '999999999') = e.idmkb10_st and e.idmkb10_st > 0\
              where e.idepicris in (select max(idepicris) \
              from epicris left join epicload on epicris.idepicload = epicload.idepicload where "+where1+date1+" between $1 and $2 \
              and lower(surname) like lower(trim($3)||'%') \
              and lower(name) like lower(trim($4)||'%') \
              and lower(otch) like lower(trim($5)||'%') group by id) \
              group by 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, e.surname, e.name, e.otch, e.id_ul, e.dom, e.epicrisis_m\
              order by e.surname, e.name, e.otch, e.dclosem";
  conn.pgsql
  .any(req.query, [req.body.datefrom + ' 00:00:00', req.body.dateto + ' 23:59:59', req.body.surname, req.body.name, req.body.patronymic])
  .then(data_guz => { req.datatype = 'fbird';
    conn.fbird.attach(conn.options, async function(err, db) {
      if (err) next(err);
      req.query2 = "select bit_length(d.doc_contents) as bits, case when d.date_sign is null then trim('red') else trim('yellow') end as rowcolor, trim('rst') as etype, hp.fio, p.birthday, mu.podr AS work, \
                    coalesce(coalesce(a_city.tadressh||' '||a_city.adressh||', ', (coalesce(t_city.tadressh||' ', '')|| h_adr.reg_city||', '), '')|| \
                    coalesce(a_ul.tadressh||' '||a_ul.adressh||', ', (coalesce(t_ul.tadressh||' ', '') ||h_adr.reg_ul||', '), '')|| \
                    coalesce('д. '||h_adr.house, '')|| \
                    coalesce(h_adr.houselit, '')|| \
                    coalesce(', кв. '||h_adr.kvart||coalesce(h_adr.bkv, ''), ''), '-') as address,\
                    l.idffoms_v006 AS gosptype, l.date_in, l.dclosem, trim(d.IDLIST) AS id, trim(d.IDLIST) AS key, coalesce(m.KODMKB10,'') AS mkb, coalesce(h_adr.idadres_ul, h_adr.idtadres_ul) as id_ul,\
                    'Эпикриз '||hp.fio_sh||' '||substring(100+extract(day from l.date_in) from 2 for 2)||'.'||substring(100+extract(month from l.date_in) from 2 for 2)||'.'||extract(year from l.date_in)||'-'||substring(100+extract(day from l.DCLOSEM) from 2 for 2)||'.'||substring(100+extract(month from l.DCLOSEM) from 2 for 2)||'.'||extract(year from l.dclosem)||'.pdf' as filename \
                    from f_document d\
                    left join list l on l.idlist = d.idlist\
                    LEFT JOIN mkb10 m ON m.IDMKB10 = l.IDMKB10_ST\
                    left join list_st ls on ls.idlist = l.idlist\
                    left join podr pd on pd.idpodr = ls.idpodr_out\
                    left join podr mu on mu.idpodr = pd.IDLPU\
                    left join pacient p on p.idpacient = l.idpacient \
                    left join hlistadr h_adr on h_adr.idhlistadr = l.idhlistadr \
                    left join adres a_obl on a_obl.idadres = h_adr.idadres_obl\
                    left join adres a_rn on a_rn.idadres = h_adr.idadres_raion\
                    left join adres a_city on  a_city.idadres = h_adr.idadres_naspunkt\
                    left join tadres t_city on t_city.idtadres = h_adr.idtadres_np\
                    left join adres a_ul on a_ul.idadres = h_adr.idadres_ul\
                    left join tadres t_ul on t_ul.idtadres = h_adr.idtadres_ul \
                    left join hlist_pasport hp on hp.idhlist_pasport = l.idhlist_pasport\
                    where "+date2+" between '"+req.body.datefrom+" 00:00:00' and '"+req.body.dateto+" 23:59:59' and d.idmdoctype = 1 "+where3+where2+"\
                    and lower(hp.surname) like lower('"+req.body.surname+"%') and lower(hp.name) like lower('"+req.body.name+"%') and lower(hp.otch) like lower('"+req.body.patronymic+"%')\
                    order by hp.fio, l.dclosem";
      db.query(req.query2, async function(err, data_rst) {
        var data = [];
        data = data_guz;
        if (data_rst) {
          data_rst.forEach(rec => {
            if ((data_guz.find((rec1) => rec1.id.indexOf(rec.id) > -1)) === undefined){
              data.push(rec);
            }
          });
        } else {
         // data = data_guz;
        }
        var uchastok = [];
        var test = await conn.whodb.oneSync("select name from sqlite_master where type='table' and lower(name)='uchastok'");
        if (test) {
          uchastok = await conn.whodb.allSync("select uchastok.uchastok, uchastok.idtip_uch, uchastok.n_uch, coalesce(adres1.idadres, adr_uch.idadres) as IDADRES, adr_uch.n_domov\
                                              from adr_uch left join uchastok on uchastok.iduchastok = adr_uch.iduchastok\
                                              left join adres1 on adres1.idparent = adr_uch.idadres\
                                              where adr_uch.cldate is null and uchastok.idoffice = 15672");
        }
        var getUch = (idadres, numdom, adult = true) => {
          if (!idadres) return '-';
          var uch = uchastok.find(item => item.IDTIP_UCH === (adult ? 1 : 2) && item.IDADRES === parseInt(idadres, 10) && (item.N_DOMOV === null || ','+item.N_DOMOV+','.includes(','+numdom+',')));
          if (uch) return uch.N_UCH;
          return '-';
        }
        for (var element in data) {
          var rec = data[element];
          var gosp;
          switch (rec.gosptype) {
            case 1: case '1': gosp = 'КС'; break; // Стационарно (0)
            case 2: case '2': gosp = 'ДС'; break; // В дневном стационаре при стационаре (2)
            case 3: case '3': gosp = 'АПП'; break; // Амбулаторно (4)
            case 4: case '4': gosp = 'СМП'; break; // Вне медицинской организации (9)
            case 5: case '5': gosp = 'ДС'; break; // В дневном стационаре при поликлинике (1)
            case 6: case '6': gosp = 'ДС'; break; // В дневном стационаре на дому (53)
            case 10: case '10': gosp = '10'; break; // Социально-значимый стационар (3)
            case 11: case '11': gosp = 'ДС'; break; // Дневной стационар (5)
            case 12: case '12': gosp = '12'; break; // Внешние услуги (6)
            case 13: case '13': gosp = '13'; break; // Все виды помощи (7)
            case 14: case '14': gosp = '14'; break; // Стоматологическая помощь (8)
            case 15: case '15': gosp = '15'; break; // Паллиативная МП (10)
            case 16: case '16': gosp = '16'; break; // Высокотехнологическая медпомощь (краевой бюджет) (11)
            case 17: case '17': gosp = 'АПП'; break; // АПП (Посещения с профилактической целью) (41)
            case 18: case '18': gosp = 'АПП'; break; // АПП (Обращения по поводу заболевания) (42)
            case 19: case '19': gosp = 'НП'; break; // Посещения по неотложной медицинской помощи (43)
            case 20: case '20': gosp = 'АПП'; break; // АПП (посещения по заболеваниям) (44)
            case 21: case '21': gosp = '21'; break; // ДИСП (диспансеризация взрослых 1 раз в 3 года) (45)
            case 22: case '22': gosp = '22'; break; // ДИСП (диспансеризация детей сирот в стационарных учреждениях) (46)
            case 23: case '23': gosp = '23'; break; // ДИСП (диспансеризация детей сирот опекаемых) (47)
            case 27: case '27': gosp = '27'; break; // ДИСП (профилактические медосмотры детей) (48)
            case 28: case '28': gosp = '28'; break; // ДИСП (предварительные медосмотры детей) (49)
            case 29: case '29': gosp = '29'; break; // ДИСП (периодические медосмотры детей) (50)
            case 30: case '30': gosp = '30'; break; // ДИСП (профилактические медосмотры взрослых) (51)
            case 31: case '31': gosp = 'АПП'; break; // АПП (Посещения с иными целями) (52)
            case 34: case '34': gosp = '34'; break; // Высокотехнологическая медпомощь (ОМС) (12)
            case 38: case '38': gosp = '38'; break; // Диспансеризация всего (54)
            case 39: case '39': gosp = 'АПП'; break; // АПП(Посещения с профилактическими и иными целями) (40)
            case 40: case '40': gosp = '40'; break; // Лечебно-диагностические услуги в условиях КС и ДС (60)
            case 41: case '41': gosp = '41'; break; // ДИСП (диспансеризация взрослых 1 раз в 2 года) (55)
            case 42: case '42': gosp = '42'; break; // Дополнительная диспансеризация работающих (13)
            case 43: case '43': gosp = '43'; break; // Дополнительная диспансеризация детей-сирот (19)
            case 44: case '44': gosp = '44'; break; // Дополнительная диспансеризация бюджетная сфера (14)                 
            default: gosp = '?';
          }
          rec.gosptype = gosp;
          // определение участка
          rec.uchastok = getUch(rec.id_ul, rec.dom, func.calculateAge(rec.birthday, rec.dclosem) >= 18);
        }
        res.data = data;
        db.detach();
        next();
      });
    });

  })
  .catch(next);
});

router.get('/guz/:idepicris', func.access('doctor'), (req, res, next) => {
  req.query = "select 'Эпикриз '||surname||' '||substring(name from 1 for 1)||'.'||substring(otch from 1 for 1)||'. '||to_char(date_in,'DD.MM.YYYY')||'-'||to_char(dclosem,'DD.MM.YYYY')||'.pdf' as filename, \
              epicrisis_m as epicrisis from epicris where rtrim(id) = $1 limit 1";
  conn.pgsql
  .any(req.query, req.params.idepicris)
  .then(data => {
    if(data[0]) {
      data = data[0];
      var epicrisis = data.epicrisis;
      var filename = encodeURIComponent(data.filename);
      var pdf = Buffer.from(epicrisis, 'base64');
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Description','File Transfer');
      res.setHeader('Content-Disposition', 'inline; filename="' + filename + '"'); //attachment/inline
      res.end(pdf);
    } else {
      return res.sendStatus(404);
    }
  })
  .catch(next);
});

router.get('/rst/:idepicris', func.access('doctor'), (req, res, next) => {
  conn.fbird.attach(conn.options, function(err, db) {
    if (err) next(err);
    req.query = "select d.doc_contents as epicrisis,\
                'Эпикриз '||hp.fio_sh||' '||substring(100+extract(day from l.date_in) from 2 for 2)||'.'||substring(100+extract(month from l.date_in) from 2 for 2)||'.'||extract(year from l.date_in)||'-'||substring(100+extract(day from l.DCLOSEM) from 2 for 2)||'.'||substring(100+extract(month from l.DCLOSEM) from 2 for 2)||'.'||extract(year from l.dclosem)||'.pdf' as filename\
                from f_document d\
                left join list l on l.idlist = d.idlist\
                left join hlist_pasport hp on hp.idhlist_pasport = l.idhlist_pasport\
                where d.IDLIST = '"+req.params.idepicris+"'";
    db.query(req.query, function(err, data) {
      if (err) next(err);
      if (data[0]) {
        data = data[0];
        data.epicrisis(function(err, name, eventemitter) {
          if (err) next(err);
          var buffers = []; 
          eventemitter.on('data', function(chunk) {
            buffers.push(chunk); 
          });
          eventemitter.on('end', async function() {
            var filename = encodeURIComponent(data.filename);
            var buffer = Buffer.concat(buffers); 
            const iconv = require('iconv-lite');
            var text = iconv.decode(buffer, 'cp1251').toString().replace(/\n/g, "<br />");
            db.detach();
            var html = '<!DOCTYPE html><html lang="ru"><head><meta charset="utf-8"><title>' + filename + '</title></head><body style="margin:0px;">' + text + '</body></html>';
            const puppeteer = require('puppeteer');
            const browser = await puppeteer.launch();
            const page = await browser.newPage();
            await page.goto(`data:text/html,${html}`) // тут должно быть setContent(html) но она почему-то упорно отказывается отображать контент в utf-8
            const pdf = await page.pdf({format: 'A4', margin: {top: '1.5cm', right: '1cm', bottom: '1.5cm', left: '2cm'}});
            browser.close();
            res.setHeader('Content-Description','File Transfer');
            res.setHeader('Content-Disposition', 'inline; filename="' + filename + '"'); // attachment/inline
            res.setHeader('Content-Type', 'application/pdf');
            res.end(pdf);
          });
        });
      } else {
        return res.sendStatus(404);
      }
    });
  });
});

module.exports = router;
