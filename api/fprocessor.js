var router = require('express').Router();
var func = require('../app/func');
var conn = require('../app/conn');

router.post('/download/:type/:id', func.access('doctor'), (req, res, next) => {
  switch (req.params.type) {
    case 'sended': req.query = "select name_out as name_clean, name_out as name_real from filesout where id_out = ? and name_arc is not null"; break; 
    case 'recieved': req.query = "select name_in as name_clean, name_arc as name_real, prot from filesin where id_in = ? and name_arc is not null"; break; 
    default: return res.sendStatus(500);
  }
  conn.fproc.get(req.query, req.params.id, (error, data) => {
    if (error) next(error);
    if (data) {
      var path = require('path');
      if (req.params.type === 'recieved' && !data.prot) req.params.type = 'unknown';
      var filePath = path.join(path.parse(process.env.FPR_BASE).dir, req.params.type, data.name_real);
      var fs = require('fs');
      if (!fs.existsSync(filePath)) return res.sendStatus(404);
      fs.readFile(filePath, 'binary', (err, file) => {
        if (err) return res.sendStatus(500);
        var stats = fs.statSync(filePath);
        res.setHeader('Content-Type', 'application/zip');
        res.setHeader('Content-Description','File Transfer');
        res.setHeader('Content-Disposition', 'attachment; filename="'+data.name_clean+'"');
        res.setHeader('Content-Length', stats['size']);
        res.write(file, 'binary');
        res.end();
      });
    } else {
      return res.sendStatus(404);
    }
  });
});

router.get('/recieved/:id', func.access('user'), (req, res, next) => {
  req.query = "select i.id_in as key, i.id_in, i.name_in, i.name_arc, i.date_in, p.name as protocol\
              from filesin i\
              left join protocol p on i.prot = p.code\
              where i.id_out = ?\
              order by i.date_in";  
  conn.fproc.all(req.query, req.params.id, (error, data) => {
    if (error) next(error);
    res.data = data; next();
  });
});

router.get('/sended/:id', func.access('user'), (req, res, next) => {
  req.query = "select o.id_out as key, o.id_out, o.name_arc, o.soft_name, o.soft_ver, o.xml_ver, o.date_out, t.name as type, s.name as sender, o.name_old, o.date_old, o.name_out, o.date_send, st.name as status\
              from ((filesout o\
              left join sender s ON o.sender = s.code)\
              left join status st ON o.status = st.code)\
              left join type t ON o.type = t.code\
              where o.id_out = ?";  
  conn.fproc.all(req.query, req.params.id, (error, data) => {
    if (error) next(error);
    res.data = data; next();
  });
});

router.get('/sended/:datefrom/:dateto/:type/:sender', func.access('user'), (req, res, next) => {
  var params = [req.params.datefrom + ' 00:00:00', req.params.dateto + ' 23:59:59'];
  params.push(req.params.sender === 'all' ? '%' : req.params.sender);
  params.push(req.params.type === 'all' ? '%' : req.params.type);
  req.query = "select o.id_out, o.soft_name, o.soft_ver, o.date_out, t.name as type, s.name as sender, o.name_arc, o.name_old, o.date_old, o.name_out, o.date_send, st.name as status,\
              i.id_in, i.name_in, i.name_arc as name_arc_in,\
              case\
              when o.status in ('COPY','INVALID','ERROR','RE_ERROR') then 'red'\
              when o.status = 'NEW' or (o.status = 'SENDED' and o.type not in ('N','G')) then 'yellow'\
              when o.status = 'RE_DB' then 'blue'\
              else '' end as rowcolor\
              from (((filesout o\
              left join sender s ON o.sender = s.code)\
              left join status st ON o.status = st.code)\
              left join type t ON o.type = t.code)\
              left join filesin i on i.id_in = (select max(id_in) from filesin where id_out = o.id_out)\
              where o.date_out between ? and ? and o.sender like ? and o.type like ?\
              order by o.date_out";  
  conn.fproc.all(req.query, params, (error, data) => {
    if (error) next(error);
    res.data = data; next();
  });
});

router.get('/senders', func.access('user'), (req, res, next) => {
  req.query = "select code as key, name as text from sender order by name";  
  conn.fproc.all(req.query, (error, data) => {
    if (error) next(error);
    res.data = data; next();
  });
});

router.get('/types', func.access('user'), (req, res, next) => {
  req.query = "select code as key, name as text from type order by name";  
  conn.fproc.all(req.query, (error, data) => {
    if (error) next(error);
    res.data = data; next();
  });
});

router.get('/exam/:sender/:type/:year/:month', func.access('user'), async (req, res, next) => {
  var params = {}
  if (req.params.sender === 'all') {
    params = { $year: req.params.year, $month: req.params.month === func.niluuid() ? 13 : req.params.month }
    if (req.params.type === 'adult') {
      req.query = "select sd.dept as name,\
                  coalesce((select sum(dds.dv220f) from exam dds JOIN sender sds ON dds.sender = sds.code where sds.dept = sd.dept and dds.year = $year and dds.month = $month), 0) || ' (' || coalesce(sum(dd.dv220f), 0) || ')' as dv220f,\
                  coalesce((select sum(dds.dv220s) from exam dds JOIN sender sds ON dds.sender = sds.code where sds.dept = sd.dept and dds.year = $year and dds.month = $month), 0) || ' (' || coalesce(sum(dd.dv220s), 0) || ')' as dv220s,\
                  coalesce((select sum(dds.dv325f) from exam dds JOIN sender sds ON dds.sender = sds.code where sds.dept = sd.dept and dds.year = $year and dds.month = $month), 0) || ' (' || coalesce(sum(dd.dv325f), 0) || ')' as dv325f,\
                  coalesce((select sum(dds.dv325s) from exam dds JOIN sender sds ON dds.sender = sds.code where sds.dept = sd.dept and dds.year = $year and dds.month = $month), 0) || ' (' || coalesce(sum(dd.dv325s), 0) || ')' as dv325s,\
                  coalesce((select sum(dds.pv230f) from exam dds JOIN sender sds ON dds.sender = sds.code where sds.dept = sd.dept and dds.year = $year and dds.month = $month), 0) || ' (' || coalesce(sum(dd.pv230f), 0) || ')' as pv230f,\
                  coalesce((select sum(dds.pv230s) from exam dds JOIN sender sds ON dds.sender = sds.code where sds.dept = sd.dept and dds.year = $year and dds.month = $month), 0) || ' (' || coalesce(sum(dd.pv230s), 0) || ')' as pv230s\
                  from exam dd left join sender sd ON dd.sender = sd.code\
                  where dd.year = $year and dd.month <= $month\
                  group by sd.dept order by sd.dept";
    } else {
      req.query = "select sd.dept as name,\
                  coalesce((select sum(dds.ds035f) from exam dds JOIN sender sds ON dds.sender = sds.code where sds.dept = sd.dept and dds.year = $year and dds.month = $month), 0) || ' (' || coalesce(sum(dd.ds035f), 0) || ')' as ds035f,\
                  coalesce((select sum(dds.ds035s) from exam dds JOIN sender sds ON dds.sender = sds.code where sds.dept = sd.dept and dds.year = $year and dds.month = $month), 0) || ' (' || coalesce(sum(dd.ds035s), 0) || ')' as ds035s,\
                  coalesce((select sum(dds.ds223f) from exam dds JOIN sender sds ON dds.sender = sds.code where sds.dept = sd.dept and dds.year = $year and dds.month = $month), 0) || ' (' || coalesce(sum(dd.ds223f), 0) || ')' as ds223f,\
                  coalesce((select sum(dds.ds223s) from exam dds JOIN sender sds ON dds.sender = sds.code where sds.dept = sd.dept and dds.year = $year and dds.month = $month), 0) || ' (' || coalesce(sum(dd.ds223s), 0) || ')' as ds223s,\
                  coalesce((select sum(dds.pd231f) from exam dds JOIN sender sds ON dds.sender = sds.code where sds.dept = sd.dept and dds.year = $year and dds.month = $month), 0) || ' (' || coalesce(sum(dd.pd231f), 0) || ')' as pd231f,\
                  coalesce((select sum(dds.pd231s) from exam dds JOIN sender sds ON dds.sender = sds.code where sds.dept = sd.dept and dds.year = $year and dds.month = $month), 0) || ' (' || coalesce(sum(dd.pd231s), 0) || ')' as pd231s,\
                  coalesce((select sum(dds.pd232f) from exam dds JOIN sender sds ON dds.sender = sds.code where sds.dept = sd.dept and dds.year = $year and dds.month = $month), 0) || ' (' || coalesce(sum(dd.pd232f), 0) || ')' as pd232f,\
                  coalesce((select sum(dds.pd232s) from exam dds JOIN sender sds ON dds.sender = sds.code where sds.dept = sd.dept and dds.year = $year and dds.month = $month), 0) || ' (' || coalesce(sum(dd.pd232s), 0) || ')' as pd232s,\
                  coalesce((select sum(dds.pd233f) from exam dds JOIN sender sds ON dds.sender = sds.code where sds.dept = sd.dept and dds.year = $year and dds.month = $month), 0) || ' (' || coalesce(sum(dd.pd233f), 0) || ')' as pd233f,\
                  coalesce((select sum(dds.pd233s) from exam dds JOIN sender sds ON dds.sender = sds.code where sds.dept = sd.dept and dds.year = $year and dds.month = $month), 0) || ' (' || coalesce(sum(dd.pd233s), 0) || ')' as pd233s\
                  from exam dd left join sender sd ON dd.sender = sd.code\
                  where dd.year = $year and dd.month <= $month\
                  group by sd.dept order by sd.dept";
    }
  } else {
    params = { $year: req.params.year, $sender: req.params.sender }
    if (req.params.type === 'adult') {
      req.query = "select dp.month as name,\
                  coalesce(sum(dp.dv220f), 0) as dv220f,\
                  coalesce(sum(dp.dv220s), 0) as dv220s,\
                  coalesce(sum(dp.dv325f), 0) as dv325f,\
                  coalesce(sum(dp.dv325s), 0) as dv325s,\
                  coalesce(sum(dp.pv230f), 0) as pv230f,\
                  coalesce(sum(dp.pv230s), 0) as pv230s\
                  from exam dp left join sender sd ON dp.sender = sd.code\
                  where dp.year = $year and sd.dept = $sender\
                  group by dp.month\
                  order by dp.month";
    } else {
      req.query = "select dp.month as name, \
                  coalesce(sum(dp.ds035f), 0) as ds035f,\
                  coalesce(sum(dp.ds035s), 0) as ds035s,\
                  coalesce(sum(dp.ds223f), 0) as ds223f,\
                  coalesce(sum(dp.ds223s), 0) as ds223s,\
                  coalesce(sum(dp.pd231f), 0) as pd231f,\
                  coalesce(sum(dp.pd231s), 0) as pd231s,\
                  coalesce(sum(dp.pd232f), 0) as pd232f,\
                  coalesce(sum(dp.pd232s), 0) as pd232s,\
                  coalesce(sum(dp.pd233f), 0) as pd233f,\
                  coalesce(sum(dp.pd233s), 0) as pd233s \
                  from exam dp left join sender sd ON dp.sender = sd.code\
                  where dp.year = $year and sd.dept = $sender\
                  group by dp.month\
                  order by dp.month";
    }
  }
  conn.fproc.all(req.query, params, async (error, data) => {
    if (error) next(error);
    if (req.params.sender === 'all') {
      var ondate = func.currentDate();
      var depts = await conn.whodb.allSync("select branches.name as text, branches.description as key\
                    from (select id, max(ondate||timestamp) from referencecatalogs where catalog = 'branch' and ondate <= ? group by elementid) current\
                    left join referencecatalogs branches on branches.id = current.id\
                    where branches.action is not 'delete' and branches.description is not null order by branches.name", ondate);
      data.forEach(row => {
        var dept = depts.filter(podr => podr.key === row.name); // проверить типы - где то число, где то текст
        if(dept[0]){
          row.name = dept[0].text;
        }
      });
    } else {
      var months = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль',' Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
      data.forEach(row => row.name = months[row.name - 1]);
    }
    res.data = data; next();
  });
});

module.exports = router;
