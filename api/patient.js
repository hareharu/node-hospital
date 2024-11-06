var router = require('express').Router();
var func = require('../app/func');
var conn = require('../app/conn');

router.get('/get/info/:kod', func.access('doctor'), (req, res, next) => {
  req.query = "select rtrim(p.pcode) as pcode, p.kod_snils as snils, \
              to_char(p.day,'DD.MM.YYYY') as day, to_char(p.day_death,'DD.MM.YYYY') as day_death, to_char(p.day_out,'DD.MM.YYYY') as day_out, \
              p.pol, rtrim(p.fam)||' '||rtrim(p.nam)||' '||rtrim(p.oth) as fio, rtrim(p.fam) as rawfam, rtrim(p.nam) as rawnam, rtrim(p.oth) as rawoth, p.day as rawday, REPLACE(REPLACE(p.kod_snils, '-', ''), ' ', '') as rawsnils, p.tel as telephone \
              from paspor p where p.kod = $1";
  conn.pgsql
  .one(req.query, req.params.kod)
  .then(data => { res.patient = data; next(); })
  .catch(next);
}, (req, res, next) => {
  req.query = "select rtrim(b.nam_book) as smo, rtrim(k.s_polis) as serial, rtrim(k.n_polis) as number, to_char(k.day,'DD.MM.YYYY') as day \
              FROM arh_komp k \
              LEFT JOIN s_book b ON b.kod_book = k.kod_komp and b.book = 'КОМПАНИЯ' \
              where k.kod = $1 and k.day_end is null";
  conn.pgsql
  .any(req.query, req.params.kod)
  .then(data => { res.patient['polis'] = data; next(); })
  .catch(next);
}, (req, res, next) => {
  req.query = "select rtrim(b.nam_book) as type, rtrim(d.s_docum) as serial, rtrim(d.n_docum) as number, to_char(d.day,'DD.MM.YYYY') as day \
              FROM document d \
              LEFT JOIN s_book b ON b.kod_book = d.kod_document and b.book = 'ДОКУМЕНТ' \
              where d.kod = $1 and d.day_end is null";
  conn.pgsql
  .any(req.query, req.params.kod)
  .then(data => { res.patient['document'] = data; next(); })
  .catch(next);
}, (req, res, next) => {
  req.query = "select rtrim(w.nam_work) as org, rtrim(p.nam_prof) as prof \
              FROM arh_work a \
              LEFT JOIN s_work w ON w.kod_work = a.kod_work \
              LEFT JOIN s_prof p ON p.kod_prof = a.kod_prof \
              where a.kod = $1 and a.day_end is null";
  conn.pgsql
  .any(req.query, req.params.kod)
  .then(data => { res.patient['work'] = data; next(); })
  .catch(next);
}, (req, res, next) => {
  req.query = "select t2.namkr_book||' '||t1.town||', '||s2.namkr_book||' '||s1.street||', '||p.home||', '||p.kw as address \
              from paspor p \
              left join s_town t1 on t1.kod_town = p.kod_town \
              left join s_street s1 on s1.kod_street = p.kod_street \
              left join s_book t2 on t2.kod_book = t1.typ_town and t2.book = 'НАС ПУНКТЫ' \
              left join s_book s2 on s2.kod_book = s1.typ_street and s2.book = 'ТИПЫ УЛИЦ' \
              where p.kod = $1";
  conn.pgsql
  .any(req.query, req.params.kod)
  .then(data => { res.patient['address'] = data[0]['address']; next(); })
  .catch(next);
}, (req, res, next) => {
  req.query = "select t2.namkr_book||' '||t1.town||', '||s2.namkr_book||' '||s1.street||', '||p.home||', '||p.kw as address \
              from residenc p \
              left join s_town t1 on t1.kod_town = p.kod_town \
              left join s_street s1 on s1.kod_street = p.kod_street \
              left join s_book t2 on t2.kod_book = t1.typ_town and t2.book = 'НАС ПУНКТЫ' \
              left join s_book s2 on s2.kod_book = s1.typ_street and s2.book = 'ТИПЫ УЛИЦ' \
              where p.kod = $1";
  conn.pgsql
  .any(req.query, req.params.kod)
  .then(data => { if (data[0]) { res.patient['address2'] = data[0]['address']; } else { res.patient['address2'] = null; } next(); })
  .catch(next);
}, (req, res, next) => {
  req.query = undefined;
  var patient = [];
  var polis, enp, document, work;
  if (res.patient['day_death']) {
    patient.push({'field':'', 'value': 'Пациент умер ' + res.patient['day_death'], rowcolor: 'red'});
  } else if (res.patient['day_out']) {
    // patient.push({'field':'', 'value': 'Пациент выбыл ' + res.patient['day_out'], rowcolor: 'yellow'});
  } 
  patient.push({'field':'СНИЛС', 'value': res.patient['snils']});
  patient.push({'field':'ФИО', 'value': res.patient['fio']});
  patient.push({'field':'дата рождения', 'value': res.patient['day']});
  for (var val in res.patient['polis']) {
    if (res.patient['polis'][val]['serial']) {
      polis = polis + res.patient['polis'][val]['serial']+' ';
    }
    polis = res.patient['polis'][val]['number']+', '+res.patient['polis'][val]['smo'];
    enp = res.patient['polis'][val]['number'];
    patient.push({'field':'полис ОМС', 'value': polis});
  }
  for (val in res.patient['document']) {
    document = res.patient['document'][val]['serial']+' '+res.patient['document'][val]['number']+', '+res.patient['document'][val]['type'];
    patient.push({'field':'документ', 'value': document});
  }
  for (val in res.patient['work']) {
    work = res.patient['work'][val]['org'];
    if (res.patient['work'][val]['prof'] !==null) {
      work += ', '+res.patient['work'][val]['prof'];
    }
    patient.push({'field':'место работы', 'value': work})
  }
  patient.push({'field':'адрес', 'value': res.patient['address']})
  patient.push({'field':'адрес прописки', 'value': res.patient['address2']});
  if(res.patient['telephone']) {
    patient.push({'field':'телефон', 'value': res.patient['telephone']});
  }
  res.data = { patient: patient, enp: enp, fam: res.patient['rawfam'], nam: res.patient['rawnam'], oth: res.patient['rawoth'], day: res.patient['rawday'], snils: res.patient['rawsnils'] };
  // res.enp = enp;
  next();
});

router.get('/get/priem/:kod', func.access('doctor'), (req, res, next) => {
  req.query = "select day as date, \
              roworder, talon as rowgroup, rowgroup as rowgroupname, errtag as rowgroupnotes, typpr as loc, doc, string_agg(mkb || ', ' || typd, '; ') as mkb, string_agg(diagn, '; ') as mkb_text \
    , rowgroupcolor\
              from(SELECT a.day_rpr, p.nz_priem, p.nz_am_tln, p.day, rtrim(coalesce(cv.nam_book,'-')) as typpr, \
              trim(m.fam) || ' ' || substr(m.nam, 1, 1) || '.' || substr(m.oth, 1, 1) || '. (' || ws.spec || ')' as doc, \
              to_char(p.rpr,'DD.MM.YYYY')||' '||rtrim(vi.nam_book) as rowgroup,\
              to_char(p.rpr,'YYYYMMDD')||p.nz_am_tln||to_char(p.day,'YYYYMMDD') as roworder,\
              p.rowgroup as talon,\
              d.mkb, lower(ds.diagn) as diagn, string_agg(coalesce(dt.nam_book,'-'), ', ') as typd \
    , coalesce(amrf.nz_amrf, '')||coalesce(ddrf.errtag, '') as errtag\
    , case when a.kod_finans <> '_26P0Q50BV' then '' when (amrf.nz_amrf is null and ddrf.nz_rfrec is null) then 'yellow' when (amrf.operation = 1 or ddre.typ_route= 'OUT') then 'blue' when (amrf.sum_accept > 0 or ddrf.sum_accept > 0) then 'green' else 'red' end as rowgroupcolor\
              FROM ((\
                select pp.*, am.day_rpr as rpr, am.nz_am_tln as rowgroup\
                from priem pp\
                left join am_talon am on am.nz_am_tln = pp.nz_am_tln\
                left join s_book b on b.kod_book = am.kod_cel\
                where b.typ_book <> 9\
              ) union all (\
                select pp.*, dd.day_rpr as rpr, dd.nz_ddu as rowgroup\
                from priem pp\
                left join rddu rd on rd.nz_action = pp.nz_priem\
                left join ddu dd on rd.nz_ddu = dd.nz_ddu\
                left join am_talon am on am.nz_am_tln = pp.nz_am_tln\
                left join s_book b on b.kod_book = am.kod_cel\
                where b.typ_book = 9\
              )) p\
              LEFT JOIN s_wrach w ON w.kod_doc = p.kod_doc \
              left join sw_man m on m.kod_wman = w.kod_wman \
              LEFT JOIN s_spec ws ON ws.kod_spec = w.kod_spec \
              LEFT JOIN (SELECT kod_book, nam_book FROM s_book WHERE book = 'ПОСЕЩЕНИЯ') cv ON p.kod_typpr = cv.kod_book \
              LEFT JOIN am_talon a ON p.nz_am_tln = a.nz_am_tln \
    left join rddu rd on rd.nz_action = p.nz_priem\
              left join s_book vi on vi.kod_book = a.kod_cel and vi.book = 'ЦЕЛЬ'\
              LEFT JOIN diagn d ON d.nz_priem = p.nz_priem and d.mkb <> 'U52' \
              LEFT JOIN s_diagn ds ON ds.mkb= d.mkb \
              LEFT JOIN s_book dt on d.kod_typd = dt.kod_book and dt.book = 'ДИАГНОЗЫ+-' \
    left join am_rf amrf on amrf.nz_amrf = (select nz_amrf from am_rf where am_rf.nz_am_tln = a.nz_am_tln order by am_rf.day desc, am_rf.time desc limit 1)\
    left join rf_rec ddrf on ddrf.nz_rfrec = (\
    select nz_rfrec from rf_rec\
    left join r_file on r_file.nz_rfile = rf_rec.nz_rfile\
    left join reestr on reestr.nz_reestr = r_file.nz_reestr\
    where rf_rec.nz_table = rd.nz_ddu order by reestr.day_make desc, reestr.time_make desc limit 1\
    )\
    left join r_file ddfi on ddfi.nz_rfile = ddrf.nz_rfile\
		left join reestr ddre on ddre.nz_reestr = ddfi.nz_reestr\
              WHERE p.kod = $1\
              group by a.day_rpr, p.nz_priem, p.nz_am_tln, p.day, cv.nam_book, ws.spec, m.fam, m.nam, m.oth, d.mkb, ds.diagn, vi.nam_book, p.rpr, p.rowgroup\
    , amrf.nz_amrf, ddrf.nz_rfrec, amrf.sum_accept, ddrf.sum_accept, a.kod_finans, amrf.errtag, ddrf.errtag, amrf.operation, ddre.typ_route\
              ORDER BY a.day_rpr, p.nz_am_tln, p.day) as te \
              group by day_rpr, nz_priem, nz_am_tln, day, typpr, doc, rowgroup, roworder, talon\
    , rowgroupcolor, errtag\
              order by day desc";
  conn.pgsql
  .any(req.query, req.params.kod)
  .then(data => { res.data = data; next(); })
  .catch(next);
});

router.get('/get/priem_new/:kod', func.access('doctor'), (req, res, next) => {
  req.query = "select 'item' || row_number() over() as key, day_rpr, nz_am_tln as talon, to_char(day,'DD.MM.YYYY') as date, \
              typpr as loc, doc, string_agg(mkb || ', ' || typd, '; ') as mkb \
              from(SELECT a.day_rpr, p.nz_priem, p.nz_am_tln, p.day, rtrim(coalesce(cv.nam_book,'-')) as typpr, \
              trim(m.fam) || ' ' || substr(m.nam, 1, 1) || '.' || substr(m.oth, 1, 1) || '. (' || ws.spec || ')' as doc, \
              d.mkb, string_agg(coalesce(dt.nam_book,'-'), ', ') as typd \
              FROM priem p \
              LEFT JOIN s_wrach w ON w.kod_doc = p.kod_doc \
              left join sw_man m on m.kod_wman = w.kod_wman \
              LEFT JOIN s_spec ws ON ws.kod_spec = w.kod_spec \
              LEFT JOIN (SELECT kod_book, nam_book FROM s_book WHERE book = 'ПОСЕЩЕНИЯ') cv ON p.kod_typpr = cv.kod_book \
              LEFT JOIN am_talon a ON p.nz_am_tln = a.nz_am_tln \
              LEFT JOIN diagn d ON d.nz_priem = p.nz_priem and d.mkb <> 'U52' \
              LEFT JOIN s_diagn ds ON ds.mkb= d.mkb \
              LEFT JOIN s_book dt on d.kod_typd = dt.kod_book and dt.book = 'ДИАГНОЗЫ+-' \
              WHERE p.kod = $1 \
              group by a.day_rpr, p.nz_priem, p.nz_am_tln, p.day, cv.nam_book, ws.spec, m.fam, m.nam, m.oth, d.mkb \
              ORDER BY a.day_rpr, p.nz_am_tln, p.day) as te \
              group by day_rpr, nz_priem, nz_am_tln, day, typpr, doc \
              order by day_rpr, nz_am_tln, day";
  conn.pgsql
  .any(req.query, req.params.kod)
  .then(data => { res.data = data; next(); })
  .catch(next);
}, (req, res, next) => {
  // and priem.day between '2018-01-01' and '2018-12-31'
  req.query = "select 'group' || row_number() over() as key, day_rpr, nz_am_tln as talon, name, count(*) as count, min(row) as \"startIndex\" \
              from (select am_talon.day_rpr, am_talon.nz_am_tln, trim(vis.nam_book) as name, (row_number() over(order by priem.nz_am_tln))-1 as row \
              from priem \
              left join paspor on paspor.kod = priem.kod \
              left join am_talon on priem.nz_am_tln = am_talon.nz_am_tln \
              left join s_book vis on am_talon.kod_cel = vis.kod_book and vis.book = 'ЦЕЛЬ' \
              left join s_book fin on fin.kod_book = am_talon.kod_finans and fin.book = 'ФИНАНС' \
              where priem.kod = $1 and fin.mnem_book = '01' and vis.typ_book <> 9 \
              order by am_talon.day_rpr, priem.nz_am_tln) as talons \
              group by name, day_rpr, nz_am_tln order by day_rpr, nz_am_tln";
  conn.pgsql
  .any(req.query, req.params.kod)
  .then(data => { res.groups = data; next(); })
  .catch(next);
});

router.get('/get/duchet/:kod', func.access('doctor'), (req, res, next) => {
  req.query = "select \
  case when du2.kod_du = 2 then 'Взят' \
  when du2.kod_du = 3 then 'Осмотр' \
  when du2.kod_du = 4 then 'Снят' \
  else '?' \
  end as osmotr, \
  case when du2.kod_du = 4 then du2.day\
  end as day_end, \
  coalesce(du2.day_begin, du1.day) as day, coalesce(du2.day_begin, du1.day) as day_begin, du2.day_next, du1.day as day1, du2.day as day2, (select max(day_end) from d_uchet where mkb = du.mkb and kod = $1) as day_end_old, du.mkb, lower(ds.diagn) as diagn,\
    trim(m.fam) || ' ' || substr(m.nam, 1, 1) || '.' || substr(m.oth, 1, 1) || '. (' || ws.spec || ')' as doc, sd.dugroup\
    from (select min(du.day) as day, du.mkb\
    from d_uchet du \
    where du.kod = $1 group by du.mkb) du\
    left join s_diagn ds on ds.mkb = du.mkb\
    left join d_uchet du1 on du1.nz_du = (select nz_du from d_uchet where mkb = du.mkb and kod = $1 order by day limit 1)\
    left join d_uchet du2 on du2.nz_du = (select nz_du from d_uchet where mkb = du.mkb and kod = $1 order by day desc limit 1)\
    left join sdu_dugroup sd on sd.kod_dugroup = du2.kod_dugroup\
    left join diagn di on di.nz_diagn = du2.nz_diagn\
    left join priem p on p.nz_priem = di.nz_priem\
    LEFT JOIN s_wrach w ON w.kod_doc = p.kod_doc\
    left join sw_man m on m.kod_wman = w.kod_wman\
    LEFT JOIN s_spec ws ON ws.kod_spec = w.kod_spec";
  conn.pgsql
  .any(req.query, req.params.kod)
  .then(data => { res.data = data; next(); })
  .catch(next);
});

router.get('/get/osobo/:kod', func.access('doctor'), (req, res, next) => {
  req.query = "select to_char(o.day_fbeg,'DD.MM.YYYY') as day_fbeg, b.mnem_book, b.nam_book \
              from osobo o left join s_book b on o.kod_osobo = b.kod_book and b.book = 'ОСОБАЯ ОТМ' \
              where o.kod = $1 and o.day_fend is null";
  conn.pgsql
  .any(req.query, req.params.kod)
  .then(data => { res.data = data; next(); })
  .catch(next);
});

router.get('/get/prerec/:kod', func.access('doctor'), (req, res, next) => {
  req.query = "select prerec.day, prerec.time, \
              trim(sw_man.fam) || ' ' || substr(sw_man.nam, 1, 1) || '.' || substr(sw_man.oth, 1, 1) || '. (' || s_spec.spec || ')' as doc, \
              trim(s_book.nam_book) as source, \
              case when prerec.typ_rec = 'VISIT' then 'Прием в поликлинике' \
                when prerec.typ_rec = 'VISITHOME' then 'Вызов на дом' \
                else 'Запись отменена' \
                end as type, \
              case when prerec.typ_rec = 'VISIT' then '' \
                when prerec.typ_rec = 'VISITHOME' then 'blue' \
                else 'red' \
                end as rowcolor, \
                prerec_change.datechange as create \
              from prerec \
              left join prerec_change on prerec_change.nz_prerec = prerec.nz_prerec and prerec_change.coperation = 'INSERT'\
              left join s_wrach on s_wrach.kod_doc = prerec.kod_doc \
              left join s_spec on s_spec.kod_spec = s_wrach.kod_spec \
              left join sw_man on sw_man.kod_wman = s_wrach.kod_wman \
              left join s_book on prerec.kod_chnl = s_book.kod_book \
              where prerec.kod = $1 \
              order by prerec.day desc, prerec.time desc";
  conn.pgsql
  .any(req.query, req.params.kod)
  .then(data => { res.data = data; next(); })
  .catch(next);
});

router.get('/get/ddu/:kod', func.access('doctor'), (req, res, next) => {
  req.query = "select dd.day_beg, dd.day_end, \
              trim(wm.fam) || ' ' || substr(wm.nam, 1, 1) || '.' || substr(wm.oth, 1, 1) || '. (' || ss.spec || ')' as doc, \
              trim(td.nam_book) as type, trim(dd.mkb) as mkb, trim(gz.mnem_book) as gr \
              from ddu dd \
              join s_wrach wr on wr.kod_doc = dd.kod_doc \
              join s_spec ss on ss.kod_spec = wr.kod_spec \
              join sw_man wm on wm.kod_wman = wr.kod_wman \
              join s_book td on td.kod_book = dd.typ_ddu and td.book = 'ТИПДОПДИСП' \
              join s_book gz on gz.kod_book = dd.kod_health and gz.book = 'ГРУППАЗДОР' \
              where dd.kod = $1 \
              order by dd.day_end desc";
  conn.pgsql
  .any(req.query, req.params.kod)
  .then(data => { res.data = data; next(); })
  .catch(next);
});

router.get('/get/epicris/:kod', func.access('doctor'), (req, res, next) => {
  req.query = "select 'guz' as etype, epicris.id, epicris.id as key, epicris.idffoms_v006, epicris.date_in, epicris.dclosem, s_diagn.mkb, rtrim(work.work) as work,\
              trim(s_book.nam_book) as v006,\
              'Эпикриз '||epicris.surname||' '||substring(epicris.name from 1 for 1)||'.'||substring(epicris.otch from 1 for 1)||'. '||to_char(epicris.date_in,'DD.MM.YYYY')||'-'||to_char(epicris.dclosem,'DD.MM.YYYY')||'.pdf' as filename\
              from epicris\
              left join s_book on s_book.kod_esvs = trim(to_char(epicris.idffoms_v006, '99')) and s_book.book = 'V006'\
              left join work on work.workmnem = to_char(epicris.idmu_send, '999999999')\
              left join s_diagn on to_number(s_diagn.kod_esvs, '999999999') = epicris.idmkb10_st and epicris.idmkb10_st > 0\
              where epicris.idepicris in (select max(idepicris)\
              from epicris left join paspor on trim(lower(epicris.surname)) = trim(lower(paspor.fam)) and trim(lower(epicris.name)) = trim(lower(paspor.nam)) and trim(lower(epicris.otch)) = trim(lower(paspor.oth)) and epicris.birthday = paspor.day\
              where paspor.kod = $1\
              group by id)\
              group by 1,2,3,4,5,6,7,8,9,10\
              order by epicris.date_in desc";
  conn.pgsql
  .any(req.query, req.params.kod)
  .then(data => { res.data = data; next(); })
  .catch(next);
});

router.post('/picker', func.access('doctor'), (req, res, next) => {
  var char1 = ['Ф','И','С','В','У','А','П','Р','Ш','О','Л','Д','Ь','Т','Щ','З','Й','К','Ы','Е','Г','М','Ц','Ч','Н','Я'];
	var char2 = ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z'];
  let where = '';
  if (req.body.pcode) {
		where = "pcode = $(pcode)";
	} else {
    if (req.body.fam) req.body.fam = req.body.fam.toUpperCase().replaceArray(char2, char1);
    if (req.body.nam) req.body.nam = req.body.nam.toUpperCase().replaceArray(char2, char1);
    if (req.body.oth) req.body.oth = req.body.oth.toUpperCase().replaceArray(char2, char1);
    where = "upper(fam) like $(fam)||'%'";
    if (req.body.nam) {
      where += " and upper(nam) like $(nam)||'%'"
    }
    if (req.body.oth) {
      where += " and upper(oth) like $(oth)||'%'"
    }
  }
  req.query = "select \
              kod as key, \
              fam||' '||nam||' '||oth as text, \
              to_char(day,'DD.MM.YYYY') as \"secondaryText\", \
              substring(fam from 1 for 1)||substring(nam from 1 for 1) as \"imageInitials\" \
              from paspor where " + where + " order by fam, nam, oth, day limit 10";
  conn.pgsql
  .any(req.query, { pcode:req.body.pcode, fam:req.body.fam, nam:req.body.nam, oth:req.body.oth })
  .then(data => { res.data = data; next(); })
  .catch(next);
});

router.post('/remdlink', func.access('doctor'), async (req, res, next) => {
  var startDate = new Date();
  var endDate = new Date();
  startDate.setFullYear(startDate.getFullYear() - 5);
  var data = {
    surname: req.body.surname,
    name: req.body.name,
    patronymic: req.body.patronymic,
    birthDate: req.body.birthDate,
    unifiedPolicyNumber: req.body.unifiedPolicyNumber,
    snils: req.body.snils,
    startDate: startDate.toISOString().substring(0, 10),
    endDate: endDate.toISOString().substring(0, 10),
    remdEndpoint: await func.getSettings('remd_endpoint'),
    remdClientEntityID: await func.getSettings('remd_clientid'),
    remdIDMU: await func.getSettings('esvs_idmu'),
    remdReplyTo: await func.getSettings('remd_callback'),
    kmiacEndpoint: await func.getSettings('kmiac_endpoint'),
    krasmedEndpoint: await func.getSettings('krasmed_endpoint'),
    krasmedUsername: process.env.RZN_USER,
    krasmedPassword: process.env.RZN_PASS
  }
  var link = await func.getSettings('hospital_remd');
  if (link.charAt(link.length - 1) == '/') link = link.substring(0, link.length - 1);
  link += '/?q=' + Buffer.from(JSON.stringify(data)).toString('base64').replaceAll('+','-').replaceAll('/','_');
  res.data = link;
  next();
});

module.exports = router;
