var router = require('express').Router();
var func = require('../app/func');
var conn = require('../app/conn');

router.get('/list/:date/:filter', func.access('user'), async (req, res, next) => {
  var dates = [];
  var monday = func.getMonday(new Date(req.params.date));
  for (var i = 1; i<=7; i++) {
    dates[i] = func.dateToDate(monday);
    monday.setDate(monday.getDate() +1);
  }
  var where1 = "";
  var where2 = "";
  if (req.params.filter === '1') where1 = "and w.day_end is null";
  if (req.params.filter === '2') where2 = "where not s.day1 is null or not s.day2 is null or not s.day3 is null or not s.day4 is null or not s.day5 is null or not s.day6 is null or not s.day7 is null ";
  req.query = "select id, id as key, name, podr, fio, spec, rowcolor, room, num, plk, day1, day2, day3, day4, day5, day6, day7 from (\
              select w.kod_doc as id, w.tab_numb as num, trim(wm.fam) || ' ' || substr(wm.nam, 1, 1) || '.' || substr(wm.oth, 1, 1) || '.' || ', ' || trim(s.spec) as name, trim(pl.plk) as podr, trim(wm.fam) || ' ' || trim(wm.nam) || ' ' || trim(wm.oth) as fio, trim(s.spec) as spec, case when not w.day_end is null then 'red' end as rowcolor,\
              (select room from timetable where typvisit = 'CLINIC' and kod_doc = w.kod_doc and bgdate <= current_date and crdate >= current_date order by bgdate desc limit 1) as room, (select kod_plk from timetable where typvisit = 'CLINIC' and kod_doc = w.kod_doc and bgdate <= current_date and crdate >= current_date order by bgdate desc limit 1) as plk,\
              (coalesce ((select kod_leave from sw_leave where kod_doc = w.kod_doc and time_beg = 0 and time_end = 0 and day_beg <= $1 and day_end >= $1 order by day_beg desc limit 1), (select to_char(min(beg_day1),'FM99999')||'-'||to_char(max(end_day1),'FM99999') from timetable where typvisit = 'CLINIC' and beg_day1 > 0 and end_day1 > 0 and factor in (0, $8) and kod_doc = w.kod_doc and bgdate <= $1 and crdate >= $1))) as day1,\
              (coalesce ((select kod_leave from sw_leave where kod_doc = w.kod_doc and time_beg = 0 and time_end = 0 and day_beg <= $2 and day_end >= $2 order by day_beg desc limit 1), (select to_char(min(beg_day2),'FM99999')||'-'||to_char(max(end_day2),'FM99999') from timetable where typvisit = 'CLINIC' and beg_day2 > 0 and end_day2 > 0 and factor in (0, $8) and kod_doc = w.kod_doc and bgdate <= $2 and crdate >= $2))) as day2,\
              (coalesce ((select kod_leave from sw_leave where kod_doc = w.kod_doc and time_beg = 0 and time_end = 0 and day_beg <= $3 and day_end >= $3 order by day_beg desc limit 1), (select to_char(min(beg_day3),'FM99999')||'-'||to_char(max(end_day3),'FM99999') from timetable where typvisit = 'CLINIC' and beg_day3 > 0 and end_day3 > 0 and factor in (0, $8) and kod_doc = w.kod_doc and bgdate <= $3 and crdate >= $3))) as day3,\
              (coalesce ((select kod_leave from sw_leave where kod_doc = w.kod_doc and time_beg = 0 and time_end = 0 and day_beg <= $4 and day_end >= $4 order by day_beg desc limit 1), (select to_char(min(beg_day4),'FM99999')||'-'||to_char(max(end_day4),'FM99999') from timetable where typvisit = 'CLINIC' and beg_day4 > 0 and end_day4 > 0 and factor in (0, $8) and kod_doc = w.kod_doc and bgdate <= $4 and crdate >= $4))) as day4,\
              (coalesce ((select kod_leave from sw_leave where kod_doc = w.kod_doc and time_beg = 0 and time_end = 0 and day_beg <= $5 and day_end >= $5 order by day_beg desc limit 1), (select to_char(min(beg_day5),'FM99999')||'-'||to_char(max(end_day5),'FM99999') from timetable where typvisit = 'CLINIC' and beg_day5 > 0 and end_day5 > 0 and factor in (0, $8) and kod_doc = w.kod_doc and bgdate <= $5 and crdate >= $5))) as day5,\
              (coalesce ((select kod_leave from sw_leave where kod_doc = w.kod_doc and time_beg = 0 and time_end = 0 and day_beg <= $6 and day_end >= $6 order by day_beg desc limit 1), (select to_char(min(beg_day6),'FM99999')||'-'||to_char(max(end_day6),'FM99999') from timetable where typvisit = 'CLINIC' and beg_day6 > 0 and end_day6 > 0 and factor in (0, $8) and kod_doc = w.kod_doc and bgdate <= $6 and crdate >= $6))) as day6,\
              (coalesce ((select kod_leave from sw_leave where kod_doc = w.kod_doc and time_beg = 0 and time_end = 0 and day_beg <= $7 and day_end >= $7 order by day_beg desc limit 1), (select to_char(min(beg_day7),'FM99999')||'-'||to_char(max(end_day7),'FM99999') from timetable where typvisit = 'CLINIC' and beg_day7 > 0 and end_day7 > 0 and factor in (0, $8) and kod_doc = w.kod_doc and bgdate <= $7 and crdate >= $7))) as day7\
              FROM s_wrach w\
              LEFT JOIN sw_man wm on wm.kod_wman = w.kod_wman\
              LEFT JOIN s_spec s ON w.kod_spec = s.kod_spec\
              LEFT JOIN s_plk pl on pl.kod_plk = w.kod_plk\
              WHERE w.kod_lpu = $9 "+where1+"\
              ) s "+where2+" order by s.fio";
  conn.pgsql
  .any(req.query, [dates[1], dates[2], dates[3], dates[4], dates[5], dates[6], dates[7], (6 - func.getWeekNumber(new Date(req.params.date)) % 2), await func.getSettings('hospital_kodlpu')])
  .then(data => { res.data = data; next(); })
  .catch(next);
});

router.get('/updatehtml/:date', func.access('admin'), async (req, res, next) => {
  var dates = [];
  var monday = func.getMonday(new Date(req.params.date));
  for (var i = 1; i<=7; i++) {
    dates[i] = func.dateToDate(monday);
    monday.setDate(monday.getDate() +1);
  }
  var where1 = "";
  var where2 = "";

  var renderTimeInterval = (item) => {
    if (item !== null) {
      const times = item.split("-");
      if (!isNaN(times[0]) && !isNaN(times[1])) {
      let time1 = '';
      let time2 = '';
      if (times[0] > 0) {
        const h = Math.floor(times[0]/3600);
        const m = times[0]/60%60;
        time1 = func.padNumber(h) + ':' + func.padNumber(m);
      }
      if (times[1] > 0) {
        const h = Math.floor(times[1]/3600);
        const m = times[1]/60%60;
        time2 = func.padNumber(h) + ':' + func.padNumber(m);
      }
      return time1 + '—' + time2; // ' — '
      } else {
        var type;
        switch (item) {
          case '_4M11CFNOR': type = 'Б/лист'; break;
          case '_5IF0Y1DX5': type = 'Б/лист'; break;
          case '_4M11CFNOP': type = 'Вызова'; break;
          case '_4M11CFNOO': type = 'Дежурство'; break;
          case '_4JL0X5TLP': type = 'Отпуск'; break;
          case '_4JL0X5TL2': type = 'Диспансерный'; break;
          case '_5IF0Y1DX6': type = 'Учеба'; break;
          case '_4V10YMXNS': type = 'Отпуск'; break;
          case '_4V10YMXNY': type = 'Отпуск'; break;
          case '_4JL0X5TLU': type = 'Отпуск'; break;
          case '_4JL0X5TLT': type = 'Отпуск'; break;
          case '_4MZ0T47RP': type = 'Командировка'; break;
          case '_4MZ0TDDA8': type = 'Конференция'; break;
          case '_4M11CFNOQ': type = 'МСЭ'; break;
          case '_4V10YMXNQ': type = 'Перерыв'; break;
          case '_5IF0Y1DX7': type = 'Отпуск'; break;
          case '_4MZ0TM4TR': type = 'Отгул'; break;
          case '_5IF0Y1DX8': type = 'Отпуск'; break;
          case '_4JL0X5TLV': type = 'Отпуск'; break;
          case '_4V10YMXNU': type = 'Отпуск'; break;
          case '_4V10YMXNW': type = 'Отпуск'; break;
          case '_4JL0X5TLQ': type = 'Отпуск'; break;
          case '_4V10YMXNO': type = 'Совещание'; break;
          case '_4MZ0T6HGM': type = 'Праздничные'; break;
          case '_4MZ0TB23S': type = 'Предпраздничные'; break;
          case '_4MZ0TFZ05': type = 'Приемпоб/л'; break;
          case '_4MZ0TDWYU': type = 'Проф.осмотры'; break;
          case '_4JL0X5TLR': type = 'Приема нет'; break; // Разное
          case '_5IG0UQ28V': type = 'Учеба'; break;
          case '_4JL0X5TLS': type = 'Учеба'; break;        
          default: type = 'Приема нет';
        }
        return type;
      }
    } else {
      return 'Приема нет';
    }
  }

  where1 = "and w.day_end is null"; // (select room from timetable where typvisit = 'CLINIC' and kod_doc = w.kod_doc and bgdate <= current_date and crdate >= current_date order by bgdate desc limit 1) as room
  where2 = "where not s.day1 is null or not s.day2 is null or not s.day3 is null or not s.day4 is null or not s.day5 is null or not s.day6 is null or not s.day7 is null ";
  const where3 = " and not trim(lower(leave_note)) = 'карантин' ";
  req.query = "select id, name, podr, fio, spec, rowcolor, room, num, plk, day1, day2, day3, day4, day5, day6, day7 from (\
              select w.kod_doc as id, w.tab_numb as num, trim(wm.fam) || ' ' || substr(wm.nam, 1, 1) || '.' || substr(wm.oth, 1, 1) || '.' || ', ' || trim(s.spec) as name, trim(pl.plk) as podr, trim(wm.fam) || ' ' || trim(wm.nam) || ' ' || trim(wm.oth) as fio, trim(s.spec) as spec, case when not w.day_end is null then 'red' end as rowcolor,\
              w.room, (select kod_plk from timetable where typvisit = 'CLINIC' and kod_doc = w.kod_doc and bgdate <= current_date and crdate >= current_date order by bgdate desc limit 1) as plk,\
              (coalesce ((select kod_leave from sw_leave where kod_doc = w.kod_doc and time_beg = 0 and time_end = 0 and day_beg <= $1 and day_end >= $1 "+where3+" order by day_beg desc limit 1), (select to_char(min(beg_day1),'FM99999')||'-'||to_char(max(end_day1),'FM99999') from timetable where typvisit = 'CLINIC' and beg_day1 > 0 and end_day1 > 0 and factor in (0, $8) and kod_doc = w.kod_doc and bgdate <= $1 and crdate >= $1))) as day1,\
              (coalesce ((select kod_leave from sw_leave where kod_doc = w.kod_doc and time_beg = 0 and time_end = 0 and day_beg <= $2 and day_end >= $2 "+where3+" order by day_beg desc limit 1), (select to_char(min(beg_day2),'FM99999')||'-'||to_char(max(end_day2),'FM99999') from timetable where typvisit = 'CLINIC' and beg_day2 > 0 and end_day2 > 0 and factor in (0, $8) and kod_doc = w.kod_doc and bgdate <= $2 and crdate >= $2))) as day2,\
              (coalesce ((select kod_leave from sw_leave where kod_doc = w.kod_doc and time_beg = 0 and time_end = 0 and day_beg <= $3 and day_end >= $3 "+where3+" order by day_beg desc limit 1), (select to_char(min(beg_day3),'FM99999')||'-'||to_char(max(end_day3),'FM99999') from timetable where typvisit = 'CLINIC' and beg_day3 > 0 and end_day3 > 0 and factor in (0, $8) and kod_doc = w.kod_doc and bgdate <= $3 and crdate >= $3))) as day3,\
              (coalesce ((select kod_leave from sw_leave where kod_doc = w.kod_doc and time_beg = 0 and time_end = 0 and day_beg <= $4 and day_end >= $4 "+where3+" order by day_beg desc limit 1), (select to_char(min(beg_day4),'FM99999')||'-'||to_char(max(end_day4),'FM99999') from timetable where typvisit = 'CLINIC' and beg_day4 > 0 and end_day4 > 0 and factor in (0, $8) and kod_doc = w.kod_doc and bgdate <= $4 and crdate >= $4))) as day4,\
              (coalesce ((select kod_leave from sw_leave where kod_doc = w.kod_doc and time_beg = 0 and time_end = 0 and day_beg <= $5 and day_end >= $5 "+where3+" order by day_beg desc limit 1), (select to_char(min(beg_day5),'FM99999')||'-'||to_char(max(end_day5),'FM99999') from timetable where typvisit = 'CLINIC' and beg_day5 > 0 and end_day5 > 0 and factor in (0, $8) and kod_doc = w.kod_doc and bgdate <= $5 and crdate >= $5))) as day5,\
              (coalesce ((select kod_leave from sw_leave where kod_doc = w.kod_doc and time_beg = 0 and time_end = 0 and day_beg <= $6 and day_end >= $6 "+where3+" order by day_beg desc limit 1), (select to_char(min(beg_day6),'FM99999')||'-'||to_char(max(end_day6),'FM99999') from timetable where typvisit = 'CLINIC' and beg_day6 > 0 and end_day6 > 0 and factor in (0, $8) and kod_doc = w.kod_doc and bgdate <= $6 and crdate >= $6))) as day6,\
              (coalesce ((select kod_leave from sw_leave where kod_doc = w.kod_doc and time_beg = 0 and time_end = 0 and day_beg <= $7 and day_end >= $7 "+where3+" order by day_beg desc limit 1), (select to_char(min(beg_day7),'FM99999')||'-'||to_char(max(end_day7),'FM99999') from timetable where typvisit = 'CLINIC' and beg_day7 > 0 and end_day7 > 0 and factor in (0, $8) and kod_doc = w.kod_doc and bgdate <= $7 and crdate >= $7))) as day7\
              FROM s_wrach w\
              LEFT JOIN sw_man wm on wm.kod_wman = w.kod_wman\
              LEFT JOIN s_spec s ON w.kod_spec = s.kod_spec\
              LEFT JOIN s_plk pl on pl.kod_plk = w.kod_plk\
              WHERE w.kod_lpu = $9 "+where1+"\
              ) s "+where2+" order by s.fio";

  conn.pgsql
  .any(req.query, [dates[1], dates[2], dates[3], dates[4], dates[5], dates[6], dates[7], (6 - func.getWeekNumber(new Date(req.params.date)) % 2), await func.getSettings('hospital_kodlpu')])
  .then(async doctors => {
    await conn.whodb.runSync("update schedule set room = null, spec = null, name = null, day0 = null, day1 = null, day2 = null, day3 = null, day4 = null, day5 = null, day6 = null, day7 = null where not code is null");
    if (doctors) {
      for (const doctor of doctors) {
        await conn.whodb.runSync("update schedule set room = ?, spec = ?, name = ?, day0 = null, day1 = ?, day2 = ?, day3 = ?, day4 = ?, day5 = ?, day6 = ?, day7 = ? where code = ?", [doctor.room, doctor.spec, doctor.fio, doctor.day1, doctor.day2, doctor.day3, doctor.day4, doctor.day5, doctor.day6, doctor.day7, doctor.id]);
      }
    }
    var html = '';
    const lists = await conn.whodb.allSync("select * from schedulegroups order by pos");
    for (const list of lists) {
      html += '<h3>'+list.name+'</h3>';
      html += '<table border="1" width="812"><tbody>';
      html += '<tr><td width="64"><strong>кабинет</strong></td><td width="177"><strong>специальность</strong></td><td width="251"><strong>ФИО</strong></td><td width="64"><strong>пн</strong></td><td width="64"><strong>вт</strong></td><td width="64"><strong>ср</strong></td><td width="64"><strong>чт</strong></td><td width="64"><strong>пт</strong></td></tr>';
      const docs = await conn.whodb.allSync("select * from schedule where groupid = ? order by pos", list.id);
      for (const doc of docs) {
        html += '<tr><td>'+doc.room+'</td>';
        if (doc.spec) {
          if (doc.uch) {
            html += '<td>'+doc.spec.replace('Врач - ', '')+' (уч. '+doc.uch+')</td><td>'+doc.name+'</td>';
          } else {
            html += '<td>'+doc.spec.replace('Врач - ', '')+'</td><td>'+doc.name+'</td>';
          }
        } else {
          html += '<td colspan="2">'+doc.name+'</td>';
        }
        if (doc.day0) {
          html += '<td colspan="5">'+doc.day0+'</td></tr>';
        } else {
          if (doc.spec) {
            html += '<td>'+renderTimeInterval(doc.day1)+'</td><td>'+renderTimeInterval(doc.day2)+'</td><td>'+renderTimeInterval(doc.day3)+'</td><td>'+renderTimeInterval(doc.day4)+'</td><td>'+renderTimeInterval(doc.day5)+'</td></tr>';
          } else {
            html += '<td>'+doc.day1+'</td><td>'+doc.day2+'</td><td>'+doc.day3+'</td><td>'+doc.day4+'</td><td>'+doc.day5+'</td></tr>';
          }
        }
      }
      html += '</tbody></table>';
    }
    res.send(html);
  })
  .catch(next);
});

router.post('/site/groups/:action/:id', func.access('admin'), (req, res, next) => {
  switch (req.params.action) {
    case 'insert':
      req.query = "insert into schedulegroups (pos, name, id) values (?, ?, ?)";
      req.params = [ req.body.pos, req.body.name, req.params.id ];
      break;
    case 'update':
      req.query = "update schedulegroups set pos = ?, name = ? where id = ?";
      req.params = [ req.body.pos, req.body.name, req.params.id ];
      break;
    case 'delete':
      req.query = "delete from schedulegroups where id = ?";
      req.params = [ req.params.id ];
      break;
    default: return res.sendStatus(404);
  }
  conn.whodb.run(req.query, req.params, (err) => {
    if (err) return next(err);
    res.sendStatus(200);
  });
});

router.post('/site/doctors/:action/:id', func.access('admin'), (req, res, next) => {
  if (req.body.code === '' || req.body.code === '00000000-0000-0000-0000-000000000000') req.body.code = null;
  if (req.body.uch === '') req.body.uch = null;
  if (req.body.room === '') req.body.room = null;
  if (req.body.spec === '') req.body.spec = null;
  if (req.body.name === '') req.body.name = null;
  if (req.body.day0 === '') req.body.day0 = null;
  if (req.body.day1 === '') req.body.day1 = null;
  if (req.body.day2 === '') req.body.day2 = null;
  if (req.body.day3 === '') req.body.day3 = null;
  if (req.body.day4 === '') req.body.day4 = null;
  if (req.body.day5 === '') req.body.day5 = null;
  if (req.body.day6 === '') req.body.day6 = null;
  if (req.body.day7 === '') req.body.day7 = null;
  switch (req.params.action) {
    case 'insert':
      req.query = "insert into schedule (pos, groupid, code, uch, room, spec, name, day0, day1, day2, day3, day4, day5, day6, day7, id) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
      req.params = [ req.body.pos, req.body.groupid, req.body.code, req.body.uch, req.body.room, req.body.spec, req.body.name, req.body.day0, req.body.day1, req.body.day2, req.body.day3, req.body.day4, req.body.day5, req.body.day6, req.body.day7, req.params.id ];
      break;
    case 'update':
      req.query = "update schedule set pos = ?, groupid = ?, code = ?, uch = ?, room = ?, spec = ?, name = ?, day0 = ?, day1 = ?, day2 = ?, day3 = ?, day4 = ?, day5 = ?, day6 = ?, day7 = ? where id = ?";
      req.params = [ req.body.pos, req.body.groupid, req.body.code, req.body.uch, req.body.room, req.body.spec, req.body.name, req.body.day0, req.body.day1, req.body.day2, req.body.day3, req.body.day4, req.body.day5, req.body.day6, req.body.day7, req.params.id ];
      break;
    case 'delete':
      req.query = "delete from schedule where id = ?";
      req.params = [ req.params.id ];
      break;
    default: return res.sendStatus(404);
  }
  conn.whodb.run(req.query, req.params, (err) => {
    if (err) return next(err);
    res.sendStatus(200);
  });
});

router.get('/site/groups', func.access('admin'), (req, res, next) => {
  req.query = "select *, id as key from schedulegroups order by pos";  
  conn.whodb.all(req.query, (error, data) => {
    if (error) next(error);
    res.data = data; next();
  });
});

router.get('/site/doctors', func.access('admin'), (req, res, next) => {
  req.query = "select schedule.*, schedule.id as key, coalesce(schedulegroups.name, 'Без группы') as rowgroup,\
              case\
              when schedule.code is null then 'blue'\
              when schedule.name  is null then 'red'\
              else '' end as rowcolor\
              from schedule\
              left join schedulegroups on schedulegroups.id = schedule.groupid\
              order by schedulegroups.pos, schedule.pos";  
  conn.whodb.all(req.query, (error, data) => {
    if (error) next(error);
    res.data = data; next();
  });
});

router.get('/site/groupsdrop', func.access('admin'), (req, res, next) => {
  req.query = "select id as key, name as text from schedulegroups";
  conn.whodb.all(req.query, (error, data) => {
    if (error) next(error);
    res.data = data; next();
  });
});

module.exports = router;
