var router = require('express').Router();
var func = require('../app/func');
var conn = require('../app/conn');

router.get('/setkodrlpu/:date', func.access('admin'), (req, res, next) => { req.datatype = 'pgsql';
  if (!req.params.date) return res.sendStatus(500);
  req.query = "update am_talon set kod_rlpu = (\
              select s_wrach.kod_lpu from\
              gospital\
              left join s_wrach on s_wrach.kod_doc = gospital.kod_doc\
              left join am_route on am_route.nz_gosp = gospital.nz_gosp\
              where am_route.nz_am_tln = am_talon.nz_am_tln\
              limit 1), kod_rplk = (\
              select s_wrach.kod_plk from\
              gospital\
              left join s_wrach on s_wrach.kod_doc = gospital.kod_doc\
              left join am_route on am_route.nz_gosp = gospital.nz_gosp\
              where am_route.nz_am_tln = am_talon.nz_am_tln\
              limit 1)\
              from (select am_talon.nz_am_tln from am_talon left join s_wrach on s_wrach.kod_doc = am_talon.kod_doc where am_talon.day_rpr = $1 and s_wrach.kod_spec in ('AS2G0YUQL4','ARIF0P4P05')) as sub\
              where am_talon.nz_am_tln = sub.nz_am_tln";
  conn.pgsql
  .result(req.query, req.params.date)
  .then(data => { res.data = data; next(); })
  .catch(next);
});

router.post('/ddu/:age', func.access('user'), async (req, res, next) => {
  var where = "";
  switch (req.params.age) {
    case 'adult': where += " and dd.typ_ddu  in ('_57603FF8Z','_57603FF90','_3SN189ZYO','_3SN18A20X','_3SP17EJR9','_3SN189MLY','_3SN189R1A','_3SN189TAG','_5IV0LYQIM','_5IY0X37UK')"; break;
    case 'child': where += " and dd.typ_ddu  in ('_3U216KQGI','_3U216KQGJ','_3U216KQGK','_3V50G4N97','_3SN189VOG','_3SN18A4K8','_3U216KQGL','_3U216KQGM','_3V50G4V4I','_3SN189XMW','_5IY0X37UI','_5IY0X37UJ')"; break;
    default:
  }
  var select;
  var group;
  switch (req.body.group) {
    case 'doc': 
      select = "trim(wm.fam) || ' ' || substr(wm.nam, 1, 1) || '.' || substr(wm.oth, 1, 1) || '.' || ', ' || trim(ss.spec)";
      group = "wm.fam, wm.nam, wm.oth, ss.spec";
      break;
    case 'spec':
      select = "trim(ss.spec)";
      group = "ss.spec";
      break;
    case 'health':
      select = "trim(gz.nam_book)";
      group = "gz.nam_book";
      break;
    case 'plk':
      select = "trim(pl.plk)";
      group = "pl.plk";
      break;
    case 'rpr':
      select = "dd.day_rpr";
      group = "dd.day_rpr";
      break;
    case 'end':
      select = "dd.day_end";
      group = "dd.day_end";
      break;
    case 'age':
      var ondate = req.body.dateto.substring(0,4)+'-12-31';
      select = "case when date_part('year',age('"+ondate+"',pa.day)) < 21 then '00-20' when date_part('year',age('"+ondate+"',pa.day)) >= 21 and date_part('year',age('"+ondate+"',pa.day)) <= 36 then '21-36' when date_part('year',age('"+ondate+"',pa.day)) > 36 and date_part('year',age('"+ondate+"',pa.day)) < 39 then '37-38' when date_part('year',age('"+ondate+"',pa.day)) >= 39 and date_part('year',age('"+ondate+"',pa.day)) <= 60 then '39-60' else '61-99' end";
      group = "pa.day";
      break;
    default:
  }
  if (req.body.snils !== func.niluuid()) {
    where += " and trim(wm.kod_snils) = $(kod_snils)";
  } else {
    if (req.body.spec !== func.niluuid()) {
      where += " and wr.kod_spec = $(kod_spec)";
    }
    if (req.body.doc !== func.niluuid()) {
      where += " and wr.kod_doc = $(kod_doc)";
    }
  }
  if (req.body.sex !== func.niluuid()) {
    where += " and upper(trim(pa.pol)) = $(pol)";
  }
  var join = "";
  if (req.body.pay === '1') {
    join = "join rf_rec rf on rf.nz_table = dd.nz_ddu and rf.sum_accept > 0";
  }
  var select_date = "day_rpr";
  if (req.body.date === '1') {
    select_date = "day_end";
  }
  if (req.body.podr !== func.niluuid()) {
    where +=  " and wr.kod_plk in ($(kod_plk:csv))";
  }
  req.query = "select name,\
              cast(sum(vall) as integer) as vall, \
              cast(sum(v325f) as integer) as v325f, \
              cast(sum(v325s) as integer) as v325s, \
              cast(sum(v220f) as integer) as v220f, \
              cast(sum(v220s) as integer) as v220s, \
              cast(sum(v230) as integer) as v230, \
              cast(sum(v223f) as integer) as v223f, \
              cast(sum(v223s) as integer) as v223s, \
              cast(sum(v231f) as integer) as v231f, \
              cast(sum(v231s) as integer) as v231s, \
              cast(sum(v35f) as integer) as v35f, \
              cast(sum(v35s) as integer) as v35s, \
              cast(sum(v232f) as integer) as v232f, \
              cast(sum(v233) as integer) as v233, \
              cast(sum(v232s) as integer) as v232s, \
              cast(sum(v36) as integer) as v36, \
              cast(sum(vddo1) as integer) as vddo1, \
              cast(sum(vddo2) as integer) as vddo2, \
              cast(sum(vddo3) as integer) as vddo3 from\
              (select " + select + " as name,\
              count(distinct case when not dd.typ_ddu in ('_3SN18A20X','_57603FF90','_3SN18A4K8','_3U216KQGJ','_3V50G4N97','_3V50G4V4I','_5IY0X37UK') then dd.nz_ddu end) as vall,\
              count(distinct case when dd.typ_ddu = '_57603FF8Z' then dd.nz_ddu end) as v325f,\
              count(distinct case when dd.typ_ddu = '_57603FF90' then dd.nz_ddu end) as v325s,\
              count(distinct case when (dd.typ_ddu = '_3SN189ZYO' or dd.typ_ddu = '_5IV0LYQIM') then dd.nz_ddu end) as v220f,\
              count(distinct case when (dd.typ_ddu = '_3SN18A20X' or dd.typ_ddu = '_5IY0X37UK') then dd.nz_ddu end) as v220s,\
              count(distinct case when dd.typ_ddu = '_3SP17EJR9' then dd.nz_ddu end) as v230,\
              count(distinct case when dd.typ_ddu = '_3U216KQGI' then dd.nz_ddu end) as v223f,\
              count(distinct case when dd.typ_ddu = '_3U216KQGJ' then dd.nz_ddu end) as v223s,\
              count(distinct case when dd.typ_ddu in('_3U216KQGK','_5IY0X37UI','_5IY0X37UJ') then dd.nz_ddu end) as v231f,\
              count(distinct case when dd.typ_ddu = '_3V50G4N97' then dd.nz_ddu end) as v231s,\
              count(distinct case when dd.typ_ddu = '_3SN189VOG' then dd.nz_ddu end) as v35f,\
              count(distinct case when dd.typ_ddu = '_3SN18A4K8' then dd.nz_ddu end) as v35s,\
              count(distinct case when dd.typ_ddu = '_3U216KQGL' then dd.nz_ddu end) as v232f,\
              count(distinct case when dd.typ_ddu = '_3U216KQGM' then dd.nz_ddu end) as v233,\
              count(distinct case when dd.typ_ddu = '_3V50G4V4I' then dd.nz_ddu end) as v232s,\
              count(distinct case when dd.typ_ddu = '_3SN189XMW' then dd.nz_ddu end) as v36,\
              count(distinct case when dd.typ_ddu = '_3SN189MLY' then dd.nz_ddu end) as vddo1,\
              count(distinct case when dd.typ_ddu = '_3SN189R1A' then dd.nz_ddu end) as vddo2,\
              count(distinct case when dd.typ_ddu = '_3SN189TAG' then dd.nz_ddu end) as vddo3\
              from ddu dd " + join + "\
              left join s_book gz on gz.kod_book = dd.kod_health and gz.book = 'ГРУППАЗДОР'\
              left join paspor pa on pa.kod = dd.kod\
              left join s_wrach wr on wr.kod_doc = dd.kod_doc\
              left join s_plk pl on wr.kod_plk = pl.kod_plk\
              left join s_spec ss on ss.kod_spec = wr.kod_spec\
              left join sw_man wm on wm.kod_wman = wr.kod_wman\
              left join rf_rec rec on rec.nz_table = dd.nz_ddu\
              where dd." + select_date + " between $(date_from) and $(date_to)" + where + "\
              group by " + group + "\
              ) sub group by sub.name order by sub.name";

            // console.log(req.query)
  conn.pgsql
  .any(req.query, {
    date_from: req.body.datefrom,
    date_to: req.body.dateto,
    kod_spec: req.body.spec,
    kod_doc: req.body.doc,
    kod_snils: req.body.snils,
    pol: req.body.sex,
    kod_plk: await func.getKodPlkArray(req.body.podr),
  })
  .then(data => { res.data = data; next(); })
  .catch(next);
});

router.post('/priem/:age', func.access('user'), async (req, res, next) => {
  var select_priem;
  var select_ddu;
  switch (req.body.group) {
    case 'doc':
      select_priem = "trim(wm.fam) || ' ' || substr(wm.nam, 1, 1) || '.' || substr(wm.oth, 1, 1) || '.' || ', ' || trim(ss.spec)";
      select_ddu = "trim(wm.fam) || ' ' || substr(wm.nam, 1, 1) || '.' || substr(wm.oth, 1, 1) || '.' || ', ' || trim(ss.spec)";
      break;
    case 'spec':
      select_priem = "trim(ss.spec)";
      select_ddu = "trim(ss.spec)";
      break;
    case 'cel':
      select_priem = "trim(b.nam_book)";
      select_ddu = "trim(b.nam_book)";
      break;
    case 'plk':
      select_priem = "trim(pl.plk)";
      select_ddu = "trim(pl.plk)";
      break;
    case 'day':
      select_priem = "pp.day";
      select_ddu = "pp.day";
      break;
    case 'rpr':
      select_priem = "am.day_rpr";
      select_ddu = "dd.day_rpr";
      break;
    case 'end':
      select_priem = "(select max(day) from priem where priem.nz_am_tln = am.nz_am_tln)";
      select_ddu = "dd.day_end";
      break;
    case 'month':
      select_priem = "to_char(am.day_rpr,'YYYY.MM')";
      select_ddu = "to_char(dd.day_rpr,'YYYY.MM')";
      break;
    default:
  }
  var where = "";
  if (req.body.finance !== func.niluuid()) {
    where += " and am.kod_finans = $(kod_finans)";
  }
  if (req.body.snils !== func.niluuid()) {
    where += " and trim(wm.kod_snils) = $(kod_snils)";
  } else {
    if (req.body.spec !== func.niluuid()) {
      where += " and wr.kod_spec = $(kod_spec)";
    }
    if (req.body.doc !== func.niluuid()) {
      where += " and wr.kod_doc = $(kod_doc)";
    }
  }
  if (req.body.cel !== func.niluuid()) {
    where += " and am.kod_cel = $(kod_cel)";
  }
  if (req.body.pay === '1') {
    where += " and rf.sum_accept > 0";
  }
  var select_date_priem;
  var select_date_ddu;
  switch (req.body.date) {
    case func.niluuid():
      select_date_priem = "am.day_rpr";
      select_date_ddu = "dd.day_rpr";
      break;
    case '1':
      select_date_priem = "(select max(day) from priem where priem.nz_am_tln = am.nz_am_tln)"; // Это слишком медленно - нужен другой вариант
      select_date_ddu = "dd.day_end";
      break;
    case '2':
      select_date_priem = "pp.day";
      select_date_ddu = "pp.day";
      break;
    default:
  }
  switch (req.params.age) {
    case 'adult': where += " and extract(year from age(pp.day, pa.day)) >= 18"; break;
    case 'child': where += " and extract(year from age(pp.day, pa.day)) < 18"; break;
    default:
  }
  if (req.body.podr !== func.niluuid()) {
    where += " and wr.kod_plk in ($(kod_plk:csv))";
  }

  // нужно связать это дело с APV_OPL
  var cel_nA = [114,310,311,312,313];
  var cel_pA = [20,21,31,34,35,36,40,41,42,50,60,61,62,80,117,118,210,211,212,213,220,221,222,223,224,226,230,231,232,233,234,235,236,238,239,241,251,252,253,254,256,257,258,314,315,316,317,318,320,325,326,328,329];
  var cel_iA = [0];
  var cel_zA = [116,319,321,322,323,324,327];
  var cel_xA = [10,30,70,110,111,113,115,119]; // цели которые идут в 91/93 в зависимости от количества посещений в талоне
  
  if (new Date(req.body.datefrom) >= new Date('2020-01-01')) {
    cel_nA = [114,310,311,312,313];
    cel_pA = [35,220,223,230,231];
    cel_iA = [20,30,110,117,118,210,211,212,234,235,236,238,239,252,254,258,314,315,317,318,320,326,328,329,330];
    cel_zA = [70,115,116,319,321,322,324,331];
    cel_xA = [0];
  }

  // cel_pA = [21,31,34,36,40,41,42,50,60,61,62,80,213,,221,222,,224,226,,,232,233,241,251,253,256,257,316,,325];
  // cel_zA = [,,,,,,323,,327,];
  // cel_xA = [10,111,113,119]; 

  var cel_n = "to_number(b.mnem_book, '999') in ($(cel_n:csv))";
  var cel_p = "to_number(b.mnem_book, '999') in ($(cel_p:csv))";
  var cel_i = "to_number(b.mnem_book, '999') in ($(cel_i:csv))";
  var cel_z = "to_number(b.mnem_book, '999') in ($(cel_z:csv))";
  var cel_x = "to_number(b.mnem_book, '999') in ($(cel_x:csv))";
  var cel_count = "(select count(*) from priem where priem.nz_am_tln = pp.nz_am_tln)";
  req.query = "select name, count(distinct obr) as obr, count(pos) as pos, count(pos_n) as pos_n, count(pos_p) as pos_p, count(pos_i) as pos_i, count(distinct obr_z) as obr_z, count(pos_z) as pos_z, cast(sum(uet) as float) as uet from ((\
                select " + select_priem + " as name, " + select_date_priem + " as dates,\
                case when am.kod_doc = pp.kod_doc then am.nz_am_tln end as obr,\
                am.nz_am_tln as pos,\
                case when " + cel_n + " then am.nz_am_tln end as pos_n,\
                case when " + cel_i + " then am.nz_am_tln end as pos_i,\
                case when " + cel_p + " or (" + cel_x + " and " + cel_count + " = 1) then am.nz_am_tln end as pos_p,\
                case when am.kod_doc = pp.kod_doc and (" + cel_z + " or (" + cel_x + " and " + cel_count + " > 1)) then am.nz_am_tln end as obr_z,\
                case when " + cel_z + " or (" + cel_x + " and " + cel_count + " > 1) then am.nz_am_tln end as pos_z,\
                (select sum(uet_vr * quant)\
                  from proced\
                  left join sp_uet on proced.kod_proc = sp_uet.kod_proc and proced.day >= sp_uet.day_beg and (proced.day <= sp_uet.day_end or sp_uet.day_end is null)\
                  where proced.nz_priem = pp.nz_priem) as uet\
                from priem pp\
                left join am_talon am on am.nz_am_tln = pp.nz_am_tln\
                left join paspor pa on am.kod = pa.kod\
                left join s_book b on b.kod_book = am.kod_cel\
                left join s_wrach wr on wr.kod_doc = pp.kod_doc\
                left join s_plk pl on wr.kod_plk = pl.kod_plk\
                left join s_spec ss on ss.kod_spec = wr.kod_spec\
                left join sw_man wm on wm.kod_wman = wr.kod_wman\
                left join am_rf rf on rf.nz_amrf = (select nz_amrf from am_rf where am_rf.nz_am_tln = am.nz_am_tln and am_rf.sum_accept > 0 order by am_rf.day limit 1)\
                where b.typ_book <> 9 and wr.kod_lpu = $(kod_lpu)" + where + "\
              ) union all (\
                select " + select_ddu + " as name, " + select_date_ddu + " as dates,\
                case when dd.kod_doc = pp.kod_doc and b.typ_book = 9 then am.nz_am_tln end as obr,\
                case when b.typ_book = 9 then am.nz_am_tln end as pos,\
                null as pos_n,\
                null as pos_i,\
                case when b.typ_book = 9 then am.nz_am_tln end as pos_p,\
                null as obr_z,\
                null as pos_z,\
                null as uet\
                from priem pp\
                left join rddu rd on rd.nz_action = pp.nz_priem\
                left join ddu dd on rd.nz_ddu = dd.nz_ddu\
                left join am_talon am on am.nz_am_tln = pp.nz_am_tln\
                left join paspor pa on am.kod = pa.kod\
                left join s_book b on b.kod_book = am.kod_cel\
                left join s_wrach wr on wr.kod_doc = pp.kod_doc\
                left join s_plk pl on wr.kod_plk = pl.kod_plk\
                left join s_spec ss on ss.kod_spec = wr.kod_spec\
                left join sw_man wm on wm.kod_wman = wr.kod_wman\
                left join rf_rec rf on rf.nz_rfrec = (select nz_rfrec from rf_rec where rf_rec.nz_table = dd.nz_ddu and rf_rec.sum_accept > 0 order by rf_rec.nz_table limit 1)\
                where b.typ_book = 9 and wr.kod_lpu = $(kod_lpu)" + where + "\
              )) uni where dates between $(date_from) and $(date_to) group by name order by name";
              // case when pp.day = (select max(priem.day) from priem where priem.nz_am_tln = pp.nz_am_tln) then am.nz_am_tln end as obr,\
              // case when pp.day = (select max(priem.day) from rddu left join priem on rddu.nz_action = priem.nz_priem where rddu.nz_ddu = dd.nz_ddu) then am.nz_am_tln end as obr,\
  conn.pgsql
  .any(req.query, {
    date_from: req.body.datefrom,
    date_to: req.body.dateto,
    kod_finans: req.body.finance,
    kod_spec: req.body.spec,
    kod_doc: req.body.doc,
    kod_snils: req.body.snils,
    kod_cel: req.body.cel,
    kod_lpu: await func.getSettings('hospital_kodlpu'),
    kod_plk: await func.getKodPlkArray(req.body.podr),
    cel_n: cel_nA,
    cel_p: cel_pA,
    cel_i: cel_iA,
    cel_z: cel_zA,
    cel_x: cel_xA,
  })
  .then(data => { res.data = data; next(); })
  .catch(next);
});

router.post('/diagn/:age', func.access('user'), async (req, res, next) => {
  var where = "";
  if (req.body.finance !== func.niluuid()) {
    where += " and am.kod_finans = $(kod_finans)";
  }
  if (req.body.snils !== func.niluuid()) {
    where += " and trim(wm.kod_snils) = $(kod_snils)";
  } else {
    if (req.body.spec !== func.niluuid()) {
      where += " and wr.kod_spec = $(kod_spec)";
    }
    if (req.body.doc !== func.niluuid()) {
      where += " and wr.kod_doc = $(kod_doc)";
    }
  }
  if (req.body.cel !== func.niluuid()) {
    where += " and am.kod_cel = $(kod_cel)";
  }
  if (req.body.pay === '1') {
    where += " and rf.sum_accept > 0";
  }

  if (req.body.type === 'first') {
    where += " and dn.kod_typd = '_26P0Q5005'";
  } else if (req.body.type === 'du') {
    where += " and du.kod_du = 2";
  }

  
  var wheretype = "";
  if (req.body.typep !== 'all') {
    wheretype = " and c_type = '" + req.body.typep + "'";
  }
  

  var sel0 = "";
  var sel1 = "";
  var select_date_priem;
  var select_date_ddu;
  switch (req.body.date) {
    case func.niluuid():
      select_date_priem = "am.day_rpr";
      select_date_ddu = "dd.day_rpr";
      break;
    case '1':
      select_date_priem = "(select max(day) from priem where priem.nz_am_tln = am.nz_am_tln)"; // Это слишком медленно - нужен другой вариант
      select_date_ddu = "dd.day_end";
      break;
    case '2':
      select_date_priem = "pp.day";
      select_date_ddu = "pp.day";
      break;
    default:
  }
  switch (req.params.age) {
    case 'adult':
      where += " and extract(year from age(pp.day, pa.day)) >= 18";
      sel0 = "count(distinct c_worker_m) as c_worker_m, count(distinct c_retired_m) as c_retired_m, count(distinct c_worker_w) as c_worker_w, count(distinct c_retired_w) as c_retired_w, count(distinct c_worker) as c_worker, count(distinct c_retired) as c_retired";
      sel1 = "\
      case when lower(pa.pol) = 'м' and date_part('year',age(pp.day,pa.day)) >= 18 and date_part('year',age(pp.day,pa.day)) <= 59 then pp.kod end as c_worker_m,\
      case when lower(pa.pol) = 'м' and date_part('year',age(pp.day,pa.day)) >= 60 then pp.kod end as c_retired_m,\
      case when lower(pa.pol) = 'ж' and date_part('year',age(pp.day,pa.day)) >= 18 and date_part('year',age(pp.day,pa.day)) <= 54 then pp.kod end as c_worker_w,\
      case when lower(pa.pol) = 'ж' and date_part('year',age(pp.day,pa.day)) >= 55 then pp.kod end as c_retired_w,\
      case when (lower(pa.pol) = 'м' and date_part('year',age(pp.day,pa.day)) >= 18 and date_part('year',age(pp.day,pa.day)) <= 59) or (lower(pa.pol) = 'ж' and date_part('year',age(pp.day,pa.day)) >= 18 and date_part('year',age(pp.day,pa.day)) <= 54) then pp.kod end as c_worker,\
      case when (lower(pa.pol) = 'м' and date_part('year',age(pp.day,pa.day)) >= 60) or (lower(pa.pol) = 'ж' and date_part('year',age(pp.day,pa.day)) >= 55) then pp.kod end as c_retired,\
      ";
      break;
    case 'child':
      where += " and date_part('year', age(pp.day, pa.day)) < 18";
      sel0 = "count(distinct c_1m) as c_1m, count(distinct c_0) as c_0, count(distinct c_3) as c_3,\
      count(distinct c_4) as c_4, count(distinct c_9) as c_9, count(distinct c_14) as c_14,  count(distinct c_17) as c_17,\
      count(distinct c_4_m) as c_4_m, count(distinct c_9_m) as c_9_m, count(distinct c_14_m) as c_14_m,  count(distinct c_17_m) as c_17_m,\
      count(distinct c_4_w) as c_4_w, count(distinct c_9_w) as c_9_w, count(distinct c_14_w) as c_14_w,  count(distinct c_17_w) as c_17_w";
      sel1 = "\
      case when lower(pa.pol) = 'м' and date_part('year',age(pp.day,pa.day)) >= 15 and date_part('year',age(pp.day,pa.day)) <= 17 then pp.kod end as c_17_m,\
      case when lower(pa.pol) = 'м' and date_part('year',age(pp.day,pa.day)) >= 10 and date_part('year',age(pp.day,pa.day)) <= 14 then pp.kod end as c_14_m,\
      case when lower(pa.pol) = 'м' and date_part('year',age(pp.day,pa.day)) >= 5 and date_part('year',age(pp.day,pa.day)) <= 9 then pp.kod end as c_9_m,\
      case when lower(pa.pol) = 'м' and date_part('year',age(pp.day,pa.day)) <= 4 then pp.kod end as c_4_m,\
      case when lower(pa.pol) = 'ж' and date_part('year',age(pp.day,pa.day)) >= 15 and date_part('year',age(pp.day,pa.day)) <= 17 then pp.kod end as c_17_w,\
      case when lower(pa.pol) = 'ж' and date_part('year',age(pp.day,pa.day)) >= 10 and date_part('year',age(pp.day,pa.day)) <= 14 then pp.kod end as c_14_w,\
      case when lower(pa.pol) = 'ж' and date_part('year',age(pp.day,pa.day)) >= 5 and date_part('year',age(pp.day,pa.day)) <= 9 then pp.kod end as c_9_w,\
      case when lower(pa.pol) = 'ж' and date_part('year',age(pp.day,pa.day)) <= 4 then pp.kod end as c_4_w,\
      case when date_part('year',age(pp.day,pa.day)) >= 15 and date_part('year',age(pp.day,pa.day)) <= 17 then pp.kod end as c_17,\
      case when date_part('year',age(pp.day,pa.day)) >= 10 and date_part('year',age(pp.day,pa.day)) <= 14 then pp.kod end as c_14,\
      case when date_part('year',age(pp.day,pa.day)) >= 5 and date_part('year',age(pp.day,pa.day)) <= 9 then pp.kod end as c_9,\
      case when date_part('year',age(pp.day,pa.day)) <= 4 then pp.kod end as c_4,\
      case when date_part('year',age(pp.day,pa.day)) >= 1 and date_part('year',age(pp.day,pa.day)) <= 3 then pp.kod end as c_3,\
      case when date_part('year',age(pp.day,pa.day)) = 0 then pp.kod end as c_0,\
      case when date_part('year',age(pp.day,pa.day)) = 0 and date_part('month',age(pp.day,pa.day)) = 0 then pp.kod end as c_1m,\
      ";
      break;
    default:
  }


  if (req.body.podr !== func.niluuid()) {
    where += " and wr.kod_plk in ($(kod_plk:csv))";
  }



  req.query = "select name, count(distinct c_all) as c_all, count(distinct c_m) as c_m, count(distinct c_w) as c_w, "+sel0+"\
    from ((\
    select 'app' as c_type,\
      dn.mkb as name, " + select_date_priem + " as dates, pa.kod as c_all,\
      "+sel1+"\
      case when lower(pa.pol) = 'м' then pp.kod end as c_m,\
      case when lower(pa.pol) = 'ж' then pp.kod end as c_w\
    from priem pp\
    left join diagn dn on dn.nz_priem = pp.nz_priem\
    left join d_uchet du on du.nz_diagn = dn.nz_diagn\
    left join am_talon am on am.nz_am_tln = pp.nz_am_tln\
    left join paspor pa on am.kod = pa.kod\
    left join s_book b on b.kod_book = am.kod_cel\
    left join s_wrach wr on wr.kod_doc = pp.kod_doc\
    left join s_plk pl on wr.kod_plk = pl.kod_plk\
    left join s_spec ss on ss.kod_spec = wr.kod_spec\
    left join sw_man wm on wm.kod_wman = wr.kod_wman\
    left join am_rf rf on rf.nz_amrf = (select nz_amrf from am_rf where am_rf.nz_am_tln = am.nz_am_tln and am_rf.sum_accept > 0 order by am_rf.day limit 1)\
    where b.typ_book <> 9" + where + "\
  ) union all (\
    select 'dd' as c_type,\
      dn.mkb as name, " + select_date_ddu + " as dates, pa.kod as c_all,\
      "+sel1+"\
      case when lower(pa.pol) = 'м' then pp.kod end as c_m,\
      case when lower(pa.pol) = 'ж' then pp.kod end as c_w\
    from priem pp\
    left join diagn dn on dn.nz_priem = pp.nz_priem\
    left join d_uchet du on du.nz_diagn = dn.nz_diagn\
    left join rddu rd on rd.nz_action = pp.nz_priem\
    left join ddu dd on rd.nz_ddu = dd.nz_ddu\
    left join am_talon am on am.nz_am_tln = pp.nz_am_tln\
    left join paspor pa on am.kod = pa.kod\
    left join s_book b on b.kod_book = am.kod_cel\
    left join s_wrach wr on wr.kod_doc = pp.kod_doc\
    left join s_plk pl on wr.kod_plk = pl.kod_plk\
    left join s_spec ss on ss.kod_spec = wr.kod_spec\
    left join sw_man wm on wm.kod_wman = wr.kod_wman\
    left join rf_rec rf on rf.nz_rfrec = (select nz_rfrec from rf_rec where rf_rec.nz_table = dd.nz_ddu and rf_rec.sum_accept > 0 order by rf_rec.nz_table limit 1)\
    where b.typ_book = 9" + where + "\
  )) uni where dates between $(date_from) and $(date_to) "+wheretype+" group by name order by name";

  conn.pgsql
  .any(req.query, {
    date_from: req.body.datefrom,
    date_to: req.body.dateto,
    kod_finans: req.body.finance,
    kod_spec: req.body.spec,
    kod_doc: req.body.doc,
    kod_snils: req.body.snils,
    kod_cel: req.body.cel,
    kod_lpu: await func.getSettings('hospital_kodlpu'),
    kod_plk: await func.getKodPlkArray(req.body.podr),
  })
  .then(data => { res.data = data; next(); })
  .catch(next);
});

router.get('/info/:datefrom/:dateto', func.access('user'), (req, res, next) => {
  req.query = "select day_rpr as name,\
              case when count(distinct app_err) > 0 then 'red' when count(distinct app_new) > 0 then 'yellow' when count(distinct app_sent) > 0 then 'blue' when count(distinct app_ok) > 0 then 'green' else null end as app_rowcolor,\
              case when count(distinct usl_err) > 0 then 'red' when count(distinct usl_new) > 0 then 'yellow' when count(distinct usl_sent) > 0 then 'blue' when count(distinct usl_ok) > 0 then 'green' else null end as usl_rowcolor,\
              case when count(distinct dd_err) > 0 then 'red' when count(distinct dd_new) > 0 then 'yellow' when count(distinct dd_sent) > 0 then 'blue' when count(distinct dd_ok) > 0 then 'green' else null end as dd_rowcolor,\
              count(distinct app_all) as app_all, count(distinct app_new) as app_new, count(distinct app_sent) as app_sent, count(distinct app_ok) as app_ok, count(distinct app_err) as app_err,\
              count(distinct usl_all) as usl_all, count(distinct usl_new) as usl_new, count(distinct usl_sent) as usl_sent, count(distinct usl_ok) as usl_ok, count(distinct usl_err) as usl_err,\
              count(distinct dd_all) as dd_all, count(distinct dd_new) as dd_new, count(distinct dd_sent) as dd_sent, count(distinct dd_ok) as dd_ok, count(distinct dd_err) as dd_err, count(distinct dd_bad) as dd_bad\
              from (\
              select day_rpr,\
              case when tmp1.ptype = 'АПП' then tmp1.nz_am_tln end as app_all,\
              case when tmp1.ptype = 'АПП' and tmp1.rowcolor = 'yellow' then tmp1.nz_am_tln end as app_new,\
              case when tmp1.ptype = 'АПП' and tmp1.rowcolor = 'blue' then tmp1.nz_am_tln end as app_sent,\
              case when tmp1.ptype = 'АПП' and tmp1.rowcolor = 'green' then tmp1.nz_am_tln end as app_ok,\
              case when tmp1.ptype = 'АПП' and tmp1.rowcolor = 'red' then tmp1.nz_am_tln end as app_err,\
              case when tmp1.ptype = 'УСЛ' then tmp1.nz_am_tln end as usl_all,\
              case when tmp1.ptype = 'УСЛ' and tmp1.rowcolor = 'yellow' then tmp1.nz_am_tln end as usl_new,\
              case when tmp1.ptype = 'УСЛ' and tmp1.rowcolor = 'blue' then tmp1.nz_am_tln end as usl_sent,\
              case when tmp1.ptype = 'УСЛ' and tmp1.rowcolor = 'green' then tmp1.nz_am_tln end as usl_ok,\
              case when tmp1.ptype = 'УСЛ' and tmp1.rowcolor = 'red' then tmp1.nz_am_tln end as usl_err,\
              case when tmp1.ptype = 'ДД/ПО' then tmp1.nz_ddu end as dd_all,\
              case when tmp1.ptype = 'ДД/ПО' and tmp1.rowcolor = 'yellow' then tmp1.nz_ddu end as dd_new,\
              case when tmp1.ptype = 'ДД/ПО' and tmp1.rowcolor = 'blue' then tmp1.nz_ddu end as dd_sent,\
              case when tmp1.ptype = 'ДД/ПО' and tmp1.rowcolor = 'green' then tmp1.nz_ddu end as dd_ok,\
              case when tmp1.ptype = 'ДД/ПО' and tmp1.rowcolor = 'red' then tmp1.nz_ddu end as dd_err,\
              case when tmp1.ptype = 'ПУСТ' then tmp1.nz_am_tln end as dd_bad\
              from (\
              select am_talon.nz_am_tln, rddu.nz_ddu, \
                tmp0.day_rpr, am_rf.day as day_pay,\
                case when rddu.nz_action is not null then 'ДД/ПО' when am_route.nz_amr is not null then 'УСЛ' when s_book.typ_book = 9 then 'ПУСТ' else 'АПП' end as ptype,\
                case when (am_rf.nz_amrf is null and pr_rf_vu.nz_prrfvu is null and rf_rec.nz_rfrec is null) then 'yellow' when (am_rf.operation = 1 or pr_rf_vu.operation = 1 or reestr.typ_route= 'OUT') then 'blue' when (am_rf.sum_accept > 0 or pr_rf_vu.sum_accept > 0 or rf_rec.sum_accept > 0) then 'green' else 'red' end as rowcolor\
                from (select coalesce(ddu.day_rpr, am_talon.day_rpr) as day_rpr, am_talon.nz_am_tln\
                  from am_talon\
                  left join priem on priem.nz_am_tln = am_talon.nz_am_tln\
                  left join rddu on rddu.nz_action = priem.nz_priem \
                  left join ddu on ddu.nz_ddu = rddu.nz_ddu \
                  where ddu.day_rpr between $1 and $2 or am_talon.day_rpr between $1 and $2\
                ) tmp0\
                left join am_talon on am_talon.nz_am_tln = tmp0.nz_am_tln\
                left join s_book on s_book.kod_book = am_talon.kod_cel\
                left join am_route on am_route.nz_am_tln = am_talon.nz_am_tln\
                left join priem on priem.nz_am_tln = am_talon.nz_am_tln\
                left join proced on proced.nz_priem = priem.nz_priem\
                left join rddu on rddu.nz_action = priem.nz_priem\
                left join am_rf on am_rf.nz_amrf = (select nz_amrf from am_rf where am_rf.nz_am_tln = am_talon.nz_am_tln order by am_rf.day desc, am_rf.time desc limit 1)\
                left join pr_rf_vu on pr_rf_vu.nz_prrfvu = (select nz_prrfvu from pr_rf_vu where am_route.nz_amr is not null and pr_rf_vu.uid_proc = proced.nz_proc order by pr_rf_vu.day desc, pr_rf_vu.time desc limit 1)\
                left join rf_rec on rf_rec.nz_rfrec = (\
                  select nz_rfrec from rf_rec\
                  left join r_file on r_file.nz_rfile = rf_rec.nz_rfile\
                  left join reestr on reestr.nz_reestr = r_file.nz_reestr\
                  where rf_rec.nz_table = rddu.nz_ddu order by reestr.day_make desc, reestr.time_make desc limit 1\
                )\
                left join r_file on r_file.nz_rfile = rf_rec.nz_rfile\
                left join reestr on reestr.nz_reestr = r_file.nz_reestr\
                where am_talon.kod_finans = '_26P0Q50BV' and tmp0.day_rpr between $1 and $2\
                order by priem.day desc) tmp1) tmp2 group by tmp2.day_rpr";
  conn.pgsql
  .any(req.query, [req.params.datefrom, req.params.dateto])
  .then(data => { res.data = data; next(); })
  .catch(next);
});

router.get('/checkerrors/:date', func.access('admin'), (req, res, next) => { req.datatype = 'pgsql';
  req.query = "select count(re_new) as re_new, count(re_err) as re_err \
              from (select am_talon.nz_am_tln, case when am_rf.nz_amrf is null then am_talon.nz_am_tln end as re_new, case when am_rf.sum_accept = 0 then am_talon.nz_am_tln end as re_err\
              from am_talon\
                left join s_book on s_book.kod_book = am_talon.kod_cel\
                left join am_route on am_route.nz_am_tln = am_talon.nz_am_tln\
                left join priem on priem.nz_am_tln = am_talon.nz_am_tln\
                left join rddu on rddu.nz_action = priem.nz_priem\
                left join am_rf on am_rf.nz_amrf = (select nz_amrf from am_rf where am_rf.nz_am_tln = am_talon.nz_am_tln order by am_rf.day desc, am_rf.time desc limit 1)\
                where am_talon.kod_finans = '_26P0Q50BV' and am_talon.day_rpr = $1 and rddu.nz_action is null and am_route.nz_amr is null and not s_book.typ_book = 9\
                and (am_rf.nz_amrf is null or am_rf.sum_accept = 0)\
                group by am_talon.nz_am_tln, am_rf.nz_amrf\
              ) sub";
  conn.pgsql
  .any(req.query, req.params.date)
  .then(data => { res.data = data; next(); })
  .catch(next);
});

router.get('/moveerrors/:date/:type?', func.access('admin'), (req, res, next) => { req.datatype = 'pgsql';
  if (!req.params.date) return res.sendStatus(500);
  var where = '';
  switch (req.params.date) {
    case 'error': where = "am_rf.sum_accept = 0"; break;
    case 'new': where = "am_rf.nz_amrf is null"; break;
    default: where = "(am_rf.nz_amrf is null or am_rf.sum_accept = 0)";
  }
  req.query = "update am_talon\
              set day_rpr = $1\
              from (select am_talon.nz_am_tln from am_talon\
              left join s_book on s_book.kod_book = am_talon.kod_cel\
              left join am_route on am_route.nz_am_tln = am_talon.nz_am_tln\
              left join priem on priem.nz_am_tln = am_talon.nz_am_tln\
              left join rddu on rddu.nz_action = priem.nz_priem\
              left join am_rf on am_rf.nz_amrf = (select nz_amrf from am_rf where am_rf.nz_am_tln = am_talon.nz_am_tln order by am_rf.day desc, am_rf.time desc limit 1)\
              where am_talon.kod_finans = '_26P0Q50BV' and am_talon.day_rpr = $2 and rddu.nz_action is null and am_route.nz_amr is null and not s_book.typ_book = 9\
              and "+where+"\
              group by am_talon.nz_am_tln) as sub\
              where am_talon.nz_am_tln = sub.nz_am_tln";
  conn.pgsql
  .result(req.query, [func.getLastSunday(req.params.date.split('-')[0],req.params.date.split('-')[1]), req.params.date])
  .then(data => { res.data = data; next(); })
  .catch(next);
});

module.exports = router;
