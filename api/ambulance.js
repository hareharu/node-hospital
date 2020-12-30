var router = require('express').Router();
var func = require('../app/func');
var conn = require('../app/conn');

router.get('/list/:datefrom/:dateto/:street', func.access('doctor'), (req, res, next) => {
  conn.fbird.attach(conn.options, function(err, db) {
    if (err) next(err);
    var date1 = req.params.datefrom;
    var date2 = req.params.dateto;
    var where = '';
    if (req.params.street !== 'ALL') {
      if (req.params.street === 'NOT') {
        where = " and a_ul.idadres is null";
      } else {
        where = " and a_ul.idadres = '" + req.params.street + "'";
      }
    }
    req.query = "select \
                m.mu, \
                cast(call.call_time as date) as call_time, \
                hp.fio, \
                cast(p.birthday as date) as birthday, \
                replace (call.address_str,  'Красноярский Край, ', '') as disp_addr, \
                coalesce(a_rn.adres||', ', h_adr.r_name||', ', '')|| \
                coalesce( \
                  a_city.adres||', ', \
                  (coalesce( \
                      t_city.tadressh||' ', '')|| h_adr.reg_city||', '), \
                  '' \
                )|| \
                coalesce( \
                  a_ul.adres||', ', \
                  (coalesce(t_ul.tadressh||' ', '') ||h_adr.reg_ul||', '), \
                  '' \
                )|| \
                coalesce('д. '||h_adr.house, '')|| \
                coalesce(h_adr.houselit, '')|| \
                coalesce(', кв. '||h_adr.kvart||coalesce(h_adr.bkv, ''), '') as addr, \
                u.uchastok, \
                mkb.kodmkb10, \
                lower(mkb.mkb10) as diagn, \
                v009.ffoms_v009, \
                s.stt, \
                coalesce(vrach.fam_v || ' ' || substring(vrach.im_v from 1 for 1) || '.' || substring(vrach.ot_v from 1 for 1) || '.', '-') as vrach \
                from call_smp call \
                inner join dispatch d on d.idcall_smp = call.idcall_smp \
                inner join list_smp smp on smp.iddispatch = d.iddispatch \
                join list l on l.idlist = smp.idlist \
                join pacient p on p.idpacient = l.idpacient \
                join hlist_pasport hp on hp.idhlist_pasport = l.idhlist_pasport \
                left join brigade_vrach on brigade_vrach.idbrigade = d.idbrigade and brigade_vrach.fl_main = 1 \
                left join postncards on postncards.pcod = brigade_vrach.pcod \
                left join vrach on vrach.snils = postncards.snils \
                left join mkb10 mkb on mkb.idmkb10 = smp.idmkb_in \
                left join ffoms_v009 v009 on v009.idffoms_v009 = smp.idffoms_v009 \
                left join stt s on s.idstt = l.idtravma \
                left join mu m on m.idmu = p.idmu_p \
                left join hlistadr h_adr on h_adr.idhlistadr = l.idhlistadr \
                left join adres a_obl on a_obl.idadres = h_adr.idadres_obl \
                left join adres a_rn on a_rn.idadres = h_adr.idadres_raion \
                left join adres a_city on  a_city.idadres = h_adr.idadres_naspunkt \
                left join tadres t_city on t_city.idtadres = h_adr.idtadres_np \
                left join adres a_ul on a_ul.idadres = h_adr.idadres_ul \
                left join tadres t_ul on t_ul.idtadres = h_adr.idtadres_ul \
                left join uchastok u on u.iduchastok = p.iduchastok \
                where cast(call.call_time as date) between '"+date1+"' and '"+date2+"' \
                and h_adr.flag_registr = 1" +where+" \
                order by 1 desc ,2";
    db.query(req.query, function(err, data) {
      res.data = data; 
      db.detach();
      next();
    });
  });
});

router.get('/streets/:datefrom/:dateto', func.access('guest'), (req, res, next) => {
  conn.fbird.attach(conn.options, function(err, db) {
    if (err) next(err);
    var date1 = req.params.datefrom;
    var date2 = req.params.dateto;
    req.query = "select \
              distinct \
              a_ul.idadres as key, \
              coalesce( \
                a_city.adres||', ', \
                (coalesce( \
                    t_city.tadressh||' ', '')|| h_adr.reg_city||', '), \
                '' \
              )|| \
              coalesce( \
                a_ul.adres, \
                (coalesce(t_ul.tadressh||' ', '') ||h_adr.reg_ul), \
                '' \
              ) as text \
            from call_smp call \
                inner join dispatch d on d.idcall_smp = call.idcall_smp \
                inner join list_smp smp on smp.iddispatch = d.iddispatch \
              join list l on l.idlist = smp.idlist \
              join pacient p on p.idpacient = l.idpacient \
              join hlist_pasport hp on hp.idhlist_pasport = l.idhlist_pasport \
              left join mkb10 mkb on mkb.idmkb10 = smp.idmkb_in \
              left join ffoms_v009 v009 on v009.idffoms_v009 = smp.idffoms_v009 \
              left join stt s on s.idstt = l.idtravma \
              left join mu m on m.idmu = p.idmu_p \
              left join hlistadr h_adr on h_adr.idhlistadr = l.idhlistadr \
              left join adres a_obl on a_obl.idadres = h_adr.idadres_obl \
              left join adres a_rn on a_rn.idadres = h_adr.idadres_raion \
              left join adres a_city on  a_city.idadres = h_adr.idadres_naspunkt \
              left join tadres t_city on t_city.idtadres = h_adr.idtadres_np \
              left join adres a_ul on a_ul.idadres = h_adr.idadres_ul \
              left join tadres t_ul on t_ul.idtadres = h_adr.idtadres_ul \
              left join uchastok u on u.iduchastok = p.iduchastok \
            where cast(call.call_time as date) between '"+date1+"' and '"+date2+"' \
            and h_adr.flag_registr = 1 and a_ul.idadres > 0 \
            order by 2";
    db.query(req.query, function(err, data) {
        res.data = [ {key:"ALL", text: 'Все адреса'}, {key:"NOT", text: 'Адреса не из справочника'}, ...data]; 
        db.detach();
        next();
    });
  });
});

module.exports = router;
