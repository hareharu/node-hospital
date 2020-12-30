var router = require('express').Router();
var func = require('../app/func');
var conn = require('../app/conn');

router.post('/suspition', func.access('doctor'), (req, res, next) => {
  let where = "";
  switch (req.body.date) {
    case '1': where = "am_talon.day_rpr"; break;
    case '2': where = "priem.day"; break;
    default:
  }
  req.query = "select priem.day as day_priem, trim(paspor.fam)||' '||trim(paspor.nam)||' '||trim(paspor.oth) as name, paspor.day,\
              trim(sw_man.fam) || ' ' || substr(sw_man.nam, 1, 1) || '.' || substr(sw_man.oth, 1, 1) || '. (' || s_spec.spec || ')' as doc,\
              gospital.day_go, trim(s_lpu.lpu_abbr) as mo, am_talon.day_rpr, am_rf.day as day_pay, coalesce(am_rf.errtag, '')||coalesce(rf_rec.errtag, '') as errtag,\
              case when rddu.nz_action is not null then 'ДД/ПО' else 'АПП' end as ptype,\
              case when (am_rf.nz_amrf is null and rf_rec.nz_rfrec is null) then 'yellow' when (am_rf.operation = 1 or reestr.typ_route= 'OUT') then 'blue' when (am_rf.sum_accept > 0 or rf_rec.sum_accept > 0) then 'green' else 'red' end as rowcolor\
              from diagn\
              left join paspor on paspor.kod = diagn.kod\
              left join priem on priem.nz_priem = diagn.nz_priem\
              left join rddu on rddu.nz_action = priem.nz_priem\
              left join am_talon on am_talon.nz_am_tln = priem.nz_am_tln\
              left join s_wrach on s_wrach.kod_doc = priem.kod_doc\
              left join sw_man on sw_man.kod_wman = s_wrach.kod_wman\
              left join s_spec on s_spec.kod_spec = s_wrach.kod_spec\
              left join pr_route on pr_route.nz_priem = priem.nz_priem\
              left join gospital on gospital.nz_gosp = pr_route.nz_gosp\
              left join s_lpu on s_lpu.kod_lpu = gospital.kod_lpu\
              left join am_rf on am_rf.nz_amrf = (select nz_amrf from am_rf where am_rf.nz_am_tln = am_talon.nz_am_tln order by am_rf.day desc, am_rf.time desc limit 1)\
              left join rf_rec on rf_rec.nz_rfrec = (\
                select nz_rfrec from rf_rec\
                left join r_file on r_file.nz_rfile = rf_rec.nz_rfile\
                left join reestr on reestr.nz_reestr = r_file.nz_reestr\
                where rf_rec.nz_table = rddu.nz_ddu order by reestr.day_make desc, reestr.time_make desc limit 1\
              )\
              left join r_file on r_file.nz_rfile = rf_rec.nz_rfile\
              left join reestr on reestr.nz_reestr = r_file.nz_reestr\
              where diagn.mkb = 'U52' and "+where+" between $1 and $2\
              order by priem.day desc";
  conn.pgsql
  .any(req.query, [ req.body.datefrom, req.body.dateto ])
  .then(data => { res.data = data; next(); })
  .catch(next);
});

router.post('/diagnosis', func.access('doctor'), (req, res, next) => {
  let where = "";
  switch (req.body.date) {
    case '1': where = "am_talon.day_rpr"; break;
    case '2': where = "priem.day"; break;
    default:
  }
  req.query = "select diagntemp.mkb, s_n002.n002 as stad, s_n003.kod_t, s_n004.kod_n, s_n005.kod_m, s_n018.n018 as reason, priem.day as day_priem, trim(paspor.fam)||' '||trim(paspor.nam)||' '||trim(paspor.oth) as name, paspor.day,\
              trim(sw_man.fam) || ' ' || substr(sw_man.nam, 1, 1) || '.' || substr(sw_man.oth, 1, 1) || '. (' || s_spec.spec || ')' as doc,\
              am_talon.day_rpr, am_rf.day as day_pay, coalesce(am_rf.errtag, '')||coalesce(rf_rec.errtag, '') as errtag,\
              case when rddu.nz_action is not null then 'ДД/ПО' else 'АПП' end as ptype,\
              case when (am_rf.nz_amrf is null and rf_rec.nz_rfrec is null) then 'yellow' when (am_rf.operation = 1 or reestr.typ_route= 'OUT') then 'blue' when (am_rf.sum_accept > 0 or rf_rec.sum_accept > 0) then 'green' else 'red' end as rowcolor\
              from (select nz_priem, mkb from diagn where mkb in (select mkb from sd_onco) group by nz_priem, mkb) diagntemp\
              left join priem on priem.nz_priem = diagntemp.nz_priem\
              left join paspor on paspor.kod = priem.kod\
              left join rddu on rddu.nz_action = priem.nz_priem\
              left join am_talon on am_talon.nz_am_tln = priem.nz_am_tln\
              left join s_wrach on s_wrach.kod_doc = priem.kod_doc\
              left join sw_man on sw_man.kod_wman = s_wrach.kod_wman\
              left join s_spec on s_spec.kod_spec = s_wrach.kod_spec\
              left join am_rf on am_rf.nz_amrf = (select nz_amrf from am_rf where am_rf.nz_am_tln = am_talon.nz_am_tln order by am_rf.day desc, am_rf.time desc limit 1)\
              left join d_onco on d_onco.nz_donco = (select d_onco.nz_donco from d_onco left join diagn on diagn.nz_diagn = d_onco.nz_diagn where diagn.nz_priem = priem.nz_priem limit 1)\
              left join rf_rec on rf_rec.nz_rfrec = (\
                select nz_rfrec from rf_rec\
                left join r_file on r_file.nz_rfile = rf_rec.nz_rfile\
                left join reestr on reestr.nz_reestr = r_file.nz_reestr\
                where rf_rec.nz_table = rddu.nz_ddu order by reestr.day_make desc, reestr.time_make desc limit 1\
              )\
              left join r_file on r_file.nz_rfile = rf_rec.nz_rfile\
              left join reestr on reestr.nz_reestr = r_file.nz_reestr\
              left join s_n002 on s_n002.nz_n002 = d_onco.nz_n002\
              left join s_n003 on s_n003.nz_n003 = d_onco.nz_n003\
              left join s_n004 on s_n004.nz_n004 = d_onco.nz_n004\
              left join s_n005 on s_n005.nz_n005 = d_onco.nz_n005\
              left join s_n018 on s_n018.nz_n018 = d_onco.nz_n018\
              where "+where+" between $1 and $2\
              order by priem.day desc";
  conn.pgsql
  .any(req.query, [ req.body.datefrom, req.body.dateto ])
  .then(data => { res.data = data; next(); })
  .catch(next);
});

module.exports = router;
