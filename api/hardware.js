var router = require('express').Router();
var func = require('../app/func');
var conn = require('../app/conn');
var timestamp = require('timestamp-zoned');

router.get('/weekhistory/:date', func.access('user'), (req, res, next) => {
  var dates = [];
  var monday = func.getMonday(new Date(req.params.date));
  for (var i = 1; i<=7; i++) {
    dates[i] = func.dateToDate(monday);
    monday.setDate(monday.getDate() +1);
  }
  req.query = "select uni.ondate, uni.action, uni.username, uni.name, uni.historytype, uni.timestamp, uni.statustext from\
              (select 'Группа' as historytype, hardware.name, hardware.action, hardware.ondate, hardware.timestamp, users.name as username,\
              case\
              when hardware.action = 'import' then 'Импортирована'\
              when hardware.action = 'add' then 'Сформирована'\
              when hardware.action = 'employee' and hardware.employeeid is not null then 'Сотрудник изменнен на '||employees.name\
              when hardware.action = 'employee' then 'Убран сотрудник'\
              when hardware.action = 'name' then 'Имя изменено на '||hardware.name\
              when hardware.action = 'location' and hardware.locationid then 'Перемещено в '||coalesce(buildings.name, roomsparent.name)||coalesce(', '||rooms.name, '')\
              when hardware.action = 'delete' then 'Удалена'\
              else '' end as statustext\
              from hardwaregroups hardware\
              left join users on users.id = hardware.userid\
              left join referencecatalogs employees on employees.id = (select id from (select id, max(ondate||timestamp) from referencecatalogs where catalog = 'employee' and elementid = hardware.employeeid group by elementid))\
              left join referencecatalogs buildings on buildings.id = (select id from (select id, max(ondate||timestamp) from referencecatalogs where catalog = 'building' and elementid = hardware.locationid group by elementid))\
              left join referencecatalogs rooms on rooms.id = (select id from (select id, max(ondate||timestamp) from referencecatalogs where catalog = 'room' and elementid = hardware.locationid group by elementid))\
              left join referencecatalogs roomsparent on roomsparent.id = (select id from (select id, max(ondate||timestamp) from referencecatalogs where catalog = 'building' and elementid = rooms.parentid group by elementid))\
              union all\
              select 'Устройство' as historytype, coalesce(modelstypes.name,'')||' '||coalesce(models.name,'')||' '||coalesce(devices.name,'б/н') as name, hardware.action, hardware.ondate, hardware.timestamp, users.name as username,\
              case\
              when hardware.action = 'import' then 'Импортировано'\
              when hardware.action = 'add' and hardware.locationid is not null then 'Поступило на хранение'\
              when hardware.action = 'add' then 'Поступило на склад'\
              when hardware.action = 'inventory' and hardware.inventory is not null then 'Инвентарный номер изменнен на '||hardware.inventory\
              when hardware.action = 'inventory' then 'Убран инвентарный номер'\
              when hardware.action = 'owner' and hardware.ownerid is not null then 'Ответственный изменнен на '||owners.name\
              when hardware.action = 'owner' then 'Убран ответственный'\
              when hardware.action = 'group' and hardware.groupid is not null then 'Прикреплено к компьютеру  '||hardwaregroup.name\
              when hardware.action = 'group' then 'Откреплено от компьютера'\
              when hardware.action = 'repair' then 'Отправлено в ремонт'\
              when hardware.action = 'status' and hardware.status = 'broken' then 'Помечено как неисправное'\
              when hardware.action = 'status' then 'Снята отметка о неисправности'\
              when hardware.action = 'location' and hardware.locationid is not null then 'Перемещено в '||coalesce(buildings.name, roomsparent.name)||coalesce(', '||rooms.name, '')\
              when hardware.action = 'decommission' then 'Списано'\
              when hardware.action = 'returned' then 'Возвращено'\
              else '' end as statustext\
              from hardwareaccounting hardware\
              left join hardwaregroups hardwaregroup on hardwaregroup.id = (select id from (select hw.id, max(hw.ondate||hw.timestamp) from hardwaregroups hw where hw.groupid = hardware.groupid group by hw.groupid))\
              left join users on users.id = hardware.userid\
              left join referencecatalogs owners on owners.id = (select id from (select id, max(ondate||timestamp) from referencecatalogs where catalog = 'employee' and elementid = hardware.ownerid group by elementid))\
              left join referencecatalogs buildings on buildings.id = (select id from (select id, max(ondate||timestamp) from referencecatalogs where catalog = 'building' and elementid = hardware.locationid group by elementid))\
              left join referencecatalogs rooms on rooms.id = (select id from (select id, max(ondate||timestamp) from referencecatalogs where catalog = 'room' and elementid = hardware.locationid group by elementid))\
              left join referencecatalogs roomsparent on roomsparent.id = (select id from (select id, max(ondate||timestamp) from referencecatalogs where catalog = 'building' and elementid = rooms.parentid group by elementid))\
              left join referencecatalogs devices on devices.id = (select id from (select id, max(ondate||timestamp) from referencecatalogs where catalog = 'device' and ondate <= hardware.ondate and elementid = hardware.deviceid group by elementid))\
              left join referencecatalogs models on models.id = (select id from (select id, max(ondate||timestamp) from referencecatalogs where catalog = 'model' and ondate <= hardware.ondate and elementid = devices.parentid group by elementid))\
              left join referencecatalogs modelstypes on modelstypes.id = (select id from (select id, max(ondate||timestamp) from referencecatalogs where catalog = 'type' and ondate <= hardware.ondate and elementid = models.parentid group by elementid))\
              ) uni\
              where timestamp >= ? and timestamp <= ?\
              order by uni.timestamp";
  conn.whodb.all(req.query, [dates[1], dates[7]], (error, data) => {
    if (error) next(error);
    res.data = data; next();
  });
});

router.get('/infohistory/:device', func.access('user'), (req, res, next) => {
  req.query = "select case\
              when hardwareinfo.value is null then 'Не задано' \
              when hardwaretags.type = 'date' then substr(hardwareinfo.value,9,2)||'.'||substr(hardwareinfo.value,6,2)||'.'||substr(hardwareinfo.value,1,4)\
              when hardwaretags.type = 'select' then (select name from hardwareselect where class = hardwaretags.class and field = hardwaretags.field and key = hardwareinfo.value)\
              else hardwareinfo.value end as valuestring,\
              hardwareinfo.ondate, coalesce(hardwaretags.name,hardwareinfo.field) as name, hardwareinfo.value, hardwareinfo.timestamp, users.name as username\
              from hardwareinfo\
              left join hardwaretags on hardwaretags.field = hardwareinfo.field\
              left join users on users.id = hardwareinfo.userid\
              where hardwareinfo.deviceid = ?\
              order by hardwareinfo.ondate, hardwareinfo.timestamp";
  conn.whodb.all(req.query, req.params.device, (error, data) => {
    if (error) next(error);
    res.data = data; next();
  });
});

router.get('/grouphistory/:group', func.access('user'), (req, res, next) => {
  req.query = "select hardware.action, coalesce(buildings.name, roomsparent.name)||coalesce(', '||rooms.name, '') as locationname, employees.name as employeename, hardware.ondate, hardware.timestamp, users.name as username,\
              case\
              when hardware.action = 'import' then 'Импортирована'\
              when hardware.action = 'add' then 'Сформирована'\
              when hardware.action = 'employee' and hardware.employeeid is not null then 'Сотрудник изменнен на '||employees.name\
              when hardware.action = 'employee' then 'Убран сотрудник'\
              when hardware.action = 'name' then 'Имя изменено на '||hardware.name\
              when hardware.action = 'location' and hardware.locationid is not null then 'Перемещено в '||coalesce(buildings.name, roomsparent.name)||coalesce(', '||rooms.name, '')\
              when hardware.action = 'delete' then 'Удалена'\
              else '-' end as statustext\
              from hardwaregroups hardware\
              left join users on users.id = hardware.userid\
              left join referencecatalogs employees on employees.id = (select id from (select id, max(ondate||timestamp) from referencecatalogs where catalog = 'employee' and elementid = hardware.employeeid group by elementid))\
              left join referencecatalogs buildings on buildings.id = (select id from (select id, max(ondate||timestamp) from referencecatalogs where catalog = 'building' and elementid = hardware.locationid group by elementid))\
              left join referencecatalogs rooms on rooms.id = (select id from (select id, max(ondate||timestamp) from referencecatalogs where catalog = 'room' and elementid = hardware.locationid group by elementid))\
              left join referencecatalogs roomsparent on roomsparent.id = (select id from (select id, max(ondate||timestamp) from referencecatalogs where catalog = 'building' and elementid = rooms.parentid group by elementid))\
              where hardware.groupid = ?";
  conn.whodb.all(req.query, req.params.group, (error, data) => {
    if (error) next(error);
    res.data = data; next();
  });
});

router.get('/history/:device', func.access('user'), (req, res, next) => {
  req.query = "select hardware.action, hardware.inventory, coalesce(buildings.name, roomsparent.name)||coalesce(', '||rooms.name, '') as locationname, owners.name as ownername, hardware.ondate, hardware.timestamp, users.name as username,\
              case\
              when hardware.action = 'import' then 'Импортировано'\
              when hardware.action = 'add' and hardware.locationid is not null then 'Поступило на хранение'\
              when hardware.action = 'add' then 'Поступило на склад'\
              when hardware.action = 'inventory' and hardware.inventory is not null then 'Инвентарный номер изменнен на '||hardware.inventory\
              when hardware.action = 'inventory' then 'Убран инвентарный номер'\
              when hardware.action = 'owner' and hardware.ownerid is not null then 'Ответственный изменнен на '||owners.name\
              when hardware.action = 'owner' then 'Убран ответственный'\
              when hardware.action = 'group' and hardware.groupid is not null then 'Прикреплено к компьютеру  '||hardwaregroup.name\
              when hardware.action = 'group' then 'Откреплено от компьютера'\
              when hardware.action = 'repair' then 'Отправлено в ремонт'\
              when hardware.action = 'return' then 'Возвращено поставщику'\
              when hardware.action = 'status' and hardware.status = 'broken' then 'Помечено как неисправное'\
              when hardware.action = 'status' then 'Снята отметка о неисправности'\
              when hardware.action = 'location' and hardware.locationid is not null then 'Перемещено в '||coalesce(buildings.name, roomsparent.name)||coalesce(', '||rooms.name, '')\
              when hardware.action = 'decommission' then 'Списано'\
              when hardware.action = 'returned' then 'Возвращено'\
              else '' end as statustext\
              from hardwareaccounting hardware\
              left join hardwaregroups hardwaregroup on hardwaregroup.id = (select id from (select hw.id, max(hw.ondate||hw.timestamp) from hardwaregroups hw where hw.groupid = hardware.groupid group by hw.groupid))\
              left join users on users.id = hardware.userid\
              left join referencecatalogs owners on owners.id = (select id from (select id, max(ondate||timestamp) from referencecatalogs where catalog = 'employee' and elementid = hardware.ownerid group by elementid))\
              left join referencecatalogs buildings on buildings.id = (select id from (select id, max(ondate||timestamp) from referencecatalogs where catalog = 'building' and elementid = hardware.locationid group by elementid))\
              left join referencecatalogs rooms on rooms.id = (select id from (select id, max(ondate||timestamp) from referencecatalogs where catalog = 'room' and elementid = hardware.locationid group by elementid))\
              left join referencecatalogs roomsparent on roomsparent.id = (select id from (select id, max(ondate||timestamp) from referencecatalogs where catalog = 'building' and elementid = rooms.parentid group by elementid))\
              where hardware.deviceid = ?";
  conn.whodb.all(req.query, req.params.device, (error, data) => {
    if (error) next(error);
    res.data = data; next();
  });
});

router.post('/change/:action/:id/:ondate?', func.access('user'), (req, res, next) => {

  if (!req.params.ondate) req.params.ondate = func.currentDate();

  if (req.body.hardware.status === '') req.body.hardware.status = null;
  if (req.body.hardware.inventory === '') req.body.hardware.inventory = null;
  // if (req.body.hardware.name === '') req.body.hardware.name = null;
  // if (req.body.hardware.ip === '') req.body.hardware.ip = null;
  if (req.body.hardware.ownerid === '' || req.body.hardware.ownerid === func.niluuid()) req.body.hardware.ownerid = null;
  // if (req.body.hardware.employeeid === '' || req.body.hardware.employeeid === func.niluuid()) req.body.hardware.employeeid = null;
  if (req.body.hardware.locationid === '' || req.body.hardware.locationid === func.niluuid()) req.body.hardware.locationid = null;
  if (req.body.hardware.groupid === '' || req.body.hardware.groupid === func.niluuid()) req.body.hardware.groupid = null;

/*
  if (!req.body.new.inventory) req.body.new.inventory = req.body.hardware.inventory;
  if (!req.body.new.name) req.body.new.name = req.body.hardware.name;
  if (!req.body.new.ip) req.body.new.ip = req.body.hardware.ip;
  if (!req.body.new.ownerid) req.body.new.ownerid = req.body.hardware.ownerid;
  if (!req.body.new.employeeid) req.body.new.employeeid = req.body.hardware.employeeid;
  if (!req.body.new.locationid) req.body.new.locationid = req.body.hardware.locationid;
  if (!req.body.new.parentid) req.body.new.parentid = req.body.hardware.parentid;
*/
  switch (req.params.action) {
    case 'owner': req.body.hardware.ownerid = req.body.value; break;
    // case 'name': req.body.hardware.name = req.body.value; break;
    // case 'employee': req.body.hardware.employeeid = req.body.value; break;
    case 'group': if (req.body.value === '') { req.body.hardware.groupid = null; } else { req.body.hardware.groupid = req.body.value; }  break;
    // case 'ip': req.body.hardware.ip = req.body.value; break;
    case 'inventory': req.body.hardware.inventory = req.body.value; break;
    case 'status': req.body.hardware.status = req.body.value; break;
    case 'location': if (req.body.hardware.locationid === null) { req.body.hardware.status = null; } req.body.hardware.locationid = req.body.value; if (!req.body.group) { req.body.hardware.groupid = null; }break;
    case 'decommission': req.body.hardware.status = 'decommissioned'; break;
    case 'repair': req.body.hardware.status = 'broken';  req.body.hardware.locationid = null;  req.body.hardware.groupid = null; break;
    case 'return': req.body.hardware.status = 'returned'; break;
    default:
  }

  // if (req.body.hardware.groupid === null) await conn.whodb.runSync("update hardwaregroups set deviceid = null where deviceid = ?", req.params.id);
    
  if (req.params.action === 'repair' || req.params.action === 'decommission' || req.params.action === 'return') {
    // req.body.hardware.name = null;
    // req.body.hardware.ip = null;
    // eq.body.hardware.employeeid = null;
    req.body.hardware.locationid = null;
    req.body.hardware.groupid = null;
  }

  req.query = "insert into hardwareaccounting (id, deviceid, ondate, timestamp, userid, action, status, inventory, ownerid, locationid, groupid) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
  req.paramsq = [func.uuid(), req.params.id, req.params.ondate, timestamp.getTimestamp(), req.session.user.id, req.params.action, req.body.hardware.status, req.body.hardware.inventory, req.body.hardware.ownerid, req.body.hardware.locationid, req.body.hardware.groupid];
  conn.whodb.run(req.query, req.paramsq, function(err) {
    if (err) return next(err);
    if (req.body.info) {
      var info = req.body.info.split(',');
      info.forEach(tag => {
        var split = tag.split('=');
        if (split[1] !== '') {
          var query = "insert into hardwareinfo (id, deviceid, ondate, timestamp, userid, action, field, value) values (?, ?, ?, ?, ?, ?, ?, ?)";
          var params = [func.uuid(), req.params.id, req.params.ondate, timestamp.getTimestamp(), req.session.user.id, req.params.action, split[0], split[1]];
          conn.whodb.runSync(query, params);
        }
      });
    }
    res.sendStatus(200);
  });
});

router.post('/groups/:action/:id/:ondate?', func.access('user'), (req, res, next) => {

  if (!req.params.ondate) req.params.ondate = func.currentDate();

  // if (req.body.hardware.deviceid === '') req.body.hardware.deviceid = null;
  if (req.body.hardware.name === '') req.body.hardware.name = null;
  // if (req.body.hardware.ip === '') req.body.hardware.ip = null;
  if (req.body.hardware.employeeid === '' || req.body.hardware.employeeid === func.niluuid()) req.body.hardware.employeeid = null;
  // if (req.body.hardware.parentid === '' || req.body.hardware.parentid === func.niluuid()) req.body.hardware.parentid = null;
  if (req.body.hardware.locationid === '' || req.body.hardware.locationid === func.niluuid()) req.body.hardware.locationid = null;


/*
  if (!req.body.new.inventory) req.body.new.inventory = req.body.hardware.inventory;
  if (!req.body.new.name) req.body.new.name = req.body.hardware.name;
  if (!req.body.new.ip) req.body.new.ip = req.body.hardware.ip;
  if (!req.body.new.ownerid) req.body.new.ownerid = req.body.hardware.ownerid;
  if (!req.body.new.employeeid) req.body.new.employeeid = req.body.hardware.employeeid;
  if (!req.body.new.locationid) req.body.new.locationid = req.body.hardware.locationid;
  if (!req.body.new.parentid) req.body.new.parentid = req.body.hardware.parentid;
*/
  switch (req.params.action) {
    case 'name': req.body.hardware.name = req.body.value; break;
    case 'employee': if (req.body.value === '') { req.body.hardware.employeeid = null; } else { req.body.hardware.employeeid = req.body.value; }  break;
    case 'location': if (req.body.hardware.locationid === null) { req.body.hardware.status = null; } req.body.hardware.locationid = req.body.value; break;
    case 'delete': req.body.hardware.employeeid = null; req.body.hardware.locationid = null; break;
    default:
  }

  req.query = "insert into hardwaregroups (id, groupid, ondate, timestamp, userid, action, employeeid, name, locationid) values (?, ?, ?, ?, ?, ?, ?, ?, ?)";
  req.paramsq = [func.uuid(), req.params.id, req.params.ondate, timestamp.getTimestamp(), req.session.user.id, req.params.action, req.body.hardware.employeeid, req.body.hardware.name, req.body.hardware.locationid];
  conn.whodb.run(req.query, req.paramsq, function(err) {
    if (err) return next(err);
    res.sendStatus(200);
  });
});

router.post('/info/:action/:id/:ondate?', func.access('user'), (req, res, next) => {
  if (!req.params.ondate) req.params.ondate = func.currentDate();
  if (req.body.value === '' || req.body.value === func.niluuid()) req.body.value = null;
  req.query = "insert into hardwareinfo (id, deviceid, ondate, timestamp, userid, action, field, value) values (?, ?, ?, ?, ?, ?, ?, ?)";
  req.paramsq = [func.uuid(), req.params.id, req.params.ondate, timestamp.getTimestamp(), req.session.user.id, req.params.action, req.body.field, req.body.value];
  conn.whodb.run(req.query, req.paramsq, function(err) {
    if (err) return next(err);
    res.sendStatus(200);
  });
});

router.post('/notes/:action/:id', func.access('user'), (req, res, next) => {
  if (req.body.comment === '') return res.sendStatus(200);
  if (!req.params.ondate) req.params.ondate = func.currentDate();
  req.query = "insert into hardwarenotes (id, elementid, timestamp, userid, comment, action, ondate) values (?, ?, ?, ?, ?, ?, ?)";
  req.paramsq = [func.uuid(), req.params.id, timestamp.getTimestamp(), req.session.user.id, req.body.comment, req.params.action, req.params.ondate ];
  /*
  switch (req.params.action) {
    case 'insert':
      req.query = "insert into hardwarenotes (id, elementid, timestamp, userid, comment) values (?, ?, ?, ?, ?)";
      req.paramsq = [func.uuid(), req.params.id, timestamp.getTimestamp(), req.session.user.id, req.body.comment ];
      break;
    case 'update':
      req.query = "update hardwarenotes set timestamp = ?, userid = ?, comment = ? where elementid = ?";
      req.paramsq = [timestamp.getTimestamp(), req.session.user.id, req.body.comment, req.params.id];
      break;
    case 'delete':
      req.query = "delete from hardwarenotes where elementid = ?";
      req.paramsq = [req.params.id];
      break;
    default: return res.sendStatus(404);
  }
  */
  conn.whodb.run(req.query, req.paramsq, function(err, result) {
    if (err) return next(err);
    res.json({ status: 'ok', id:  this.lastID });
  });
});

router.get('/notes/:id', func.access('user'), (req, res, next) => {
  req.query = "select hardwarenotes.id, hardwarenotes.id as key, hardwarenotes.comment,hardwarenotes.timestamp, users.name as username from hardwarenotes left join users on users.id = hardwarenotes.userid where hardwarenotes.elementid = ? order by hardwarenotes.timestamp";
  conn.whodb.all(req.query, req.params.id, (error, data) => {
    if (error) next(error);
    res.data = data; next();
  });
});

router.get('/pc/:scope/:type/:ondate?', func.access('user'), (req, res, next) => {
  if (!req.params.ondate) req.params.ondate = func.currentDate();
  req.query = "select modelspc.elementid as deviceparentid, modelstypespc.name as typename, hardwaregroups.groupid as id, hardwaregroups.action, hardwaregroups.timestamp, users.name as username, coalesce(employees.name,'') as employeename, hardwaregroups.employeeid,\
              (select count(childrens.id) from (select id, max(ondate||timestamp) as ondate from hardwareaccounting group by deviceid) current left join hardwareaccounting childrens on childrens.id = current.id where childrens.groupid = hardwaregroups.groupid) as childrens,\
              case\
              when hardwaregroups.action = 'delete' then 'red'\
              when (select count(childrens.id) from (select id, max(ondate||timestamp) as ondate from hardwareaccounting group by deviceid) current left join hardwareaccounting childrens on childrens.id = current.id where childrens.groupid = hardwaregroups.groupid) = 0 then 'yellow'\
              when device.deviceid is null then 'notblue'\
              else '' end as rowcolor,\
              case\
              when device.deviceid is not null then coalesce(computerip.value, 'DHCP')\
              else '' end as ip,\
              case\
              when device.deviceid is not null then coalesce(computername.value, 'Без имени')\
              else '' end as namepc,\
              hardwaregroups.name, hardwaregroups.groupid, device.deviceid, \
              (select group_concat(tag) from referencetags where elementid = modelstypespc.elementid) as tags,\
              hardwaregroups.groupid as key, coalesce(hardwarenotes.comment,'') as comment,\
              coalesce(buildings.name, roomsparent.name, '-') as rowgroup,\
              coalesce(coalesce(buildings.name, roomsparent.name)||coalesce(', '||rooms.name, ''),'') as locationname, hardwaregroups.locationid, coalesce(buildings.elementid, roomsparent.elementid) as buildingid, rooms.elementid as roomid,\
              coalesce(buildings.name, roomsparent.name) as buildingname, rooms.name as roomname,\
              coalesce(modelstypespc.name, '')||' '||coalesce(modelspc.name, '')||' '||coalesce(devicespc.name, '')||' '||coalesce(device.inventory, '')||' '||coalesce(rooms.name, '')||' '||coalesce(coalesce(buildings.name, roomsparent.name), '')||' '||coalesce(employees.name, '')||' '||coalesce(hardwaregroups.name, '')||' '||coalesce(computername.value, '')||' '||coalesce(computerip.value, '') as rowfilter\
              from (select id, max(ondate||timestamp) as ondate from hardwaregroups where name is not null group by groupid) current\
              left join hardwaregroups on hardwaregroups.id = current.id\
              left join hardwareaccounting device on device.id = \
              (select hardwarepc.id from (select id, max(ondate||timestamp) as ondate from hardwareaccounting group by deviceid) currentpc\
              left join hardwareaccounting hardwarepc on hardwarepc.id = currentpc.id\
              left join referencecatalogs devicespc on devicespc.id = (select id from (select id, max(ondate||timestamp) from referencecatalogs where catalog = 'device' and ondate <= ? and elementid = hardwarepc.deviceid group by elementid))\
              left join referencecatalogs modelspc on modelspc.id = (select id from (select id, max(ondate||timestamp) from referencecatalogs where catalog = 'model' and ondate <= ? and elementid = devicespc.parentid group by elementid))\
              left join referencecatalogs modelstypespc on modelstypespc.id = (select id from (select id, max(ondate||timestamp) from referencecatalogs where catalog = 'type' and ondate <= ? and elementid = modelspc.parentid group by elementid))\
              left join referencetags modelstagspc on modelstagspc.tag = 'computer' and modelstagspc.elementid = modelstypespc.elementid\
              where hardwarepc.status is not 'decommissioned' and modelstagspc.tag = 'computer' and hardwarepc.groupid = hardwaregroups.groupid limit 1)\
              left join hardwareinfo computername on computername.id = (select id from (select id, max(ondate||timestamp) from hardwareinfo where field = 'name' and ondate <= ? and deviceid = device.deviceid group by deviceid))\
              left join hardwareinfo computerip on computerip.id = (select id from (select id, max(ondate||timestamp) from hardwareinfo where field = 'ip' and ondate <= ? and deviceid = device.deviceid group by deviceid))\
              left join referencecatalogs devicespc on devicespc.id = (select id from (select id, max(ondate||timestamp) from referencecatalogs where catalog = 'device' and ondate <= ? and elementid = device.deviceid group by elementid))\
              left join referencecatalogs modelspc on modelspc.id = (select id from (select id, max(ondate||timestamp) from referencecatalogs where catalog = 'model' and ondate <= ? and elementid = devicespc.parentid group by elementid))\
              left join referencecatalogs modelstypespc on modelstypespc.id = (select id from (select id, max(ondate||timestamp) from referencecatalogs where catalog = 'type' and ondate <= ? and elementid = modelspc.parentid group by elementid))\
              left join users on users.id = hardwaregroups.userid\
              left join hardwarenotes on hardwarenotes.id = (select id from (select id, max(timestamp) from hardwarenotes where elementid = hardwaregroups.groupid group by elementid))\
              left join referencecatalogs employees on employees.id = (select id from (select id, max(ondate||timestamp) from referencecatalogs where catalog = 'employee' and ondate <= ? and elementid = hardwaregroups.employeeid group by elementid))\
              left join referencecatalogs buildings on buildings.id = (select id from (select id, max(ondate||timestamp) from referencecatalogs where catalog = 'building' and ondate <= ? and elementid = hardwaregroups.locationid group by elementid))\
              left join referencecatalogs rooms on rooms.id = (select id from (select id, max(ondate||timestamp) from referencecatalogs where catalog = 'room' and ondate <= ? and elementid = hardwaregroups.locationid group by elementid))\
              left join referencecatalogs roomsparent on roomsparent.id = (select id from (select id, max(ondate||timestamp) from referencecatalogs where catalog = 'building' and ondate <= ? and elementid = rooms.parentid group by elementid))\
              where hardwaregroups.name is not null";
    if (req.params.scope === 'actual') req.query += " and hardwaregroups.action is not 'delete'";
    if (req.params.type === 'pc') req.query += " and device.deviceid is not null";
    req.query += " order by rowgroup, namepc";
    conn.whodb.all(req.query, req.params.ondate, req.params.ondate, req.params.ondate, req.params.ondate, req.params.ondate, req.params.ondate, req.params.ondate, req.params.ondate, req.params.ondate, req.params.ondate, req.params.ondate, req.params.ondate, (error, data) => {
    if (error) next(error);
    res.data = data; next();
  });
});

router.get('/dropdown/:class/:field', func.access('user'), (req, res, next) => {
  req.query = "select hardwareselect.key, hardwareselect.name as text\
              from hardwareselect\
              where hardwareselect.class = ? and hardwareselect.field = ?\
              order by hardwareselect.name";
  conn.whodb.all(req.query, req.params.class, req.params.field, (error, data) => {
    if (error) next(error);
    res.data = data; next();
  });
});

router.get('/info/:tags/:id/:parentid?', func.access('user'), (req, res, next) => {
  if (!req.params.ondate || req.params.ondate === 'today') req.params.ondate = func.currentDate();

  /*
  req.query = "select hardwareinfo.field as key, hardwareinfo.deviceid, hardwareinfo.field, hardwareinfo.value, hardwareinfo.timestamp, users.name as username\
              from (select id, max(ondate||timestamp) as ondate from hardwareinfo where deviceid = ? group by field) current\
              left join hardwareinfo on hardwareinfo.id = current.id\
              left join users on users.id = hardwareinfo.userid";
  */
  const tags = req.params.tags.split(',');
  var where = '';
  var paramsq = [ req.params.ondate, req.params.id ];
  tags.forEach(tag => {
    where += ' or hardwaretags.class = ?';
    paramsq.push(tag);
  });
  req.query = "select case\
              when hardwareinfo.value is null then 'Не задано' \
              when hardwaretags.type = 'date' then substr(hardwareinfo.value,9,2)||'.'||substr(hardwareinfo.value,6,2)||'.'||substr(hardwareinfo.value,1,4)\
              when hardwaretags.type = 'select' then (select name from hardwareselect where class = hardwaretags.class and field = hardwaretags.field and key = hardwareinfo.value)\
              else hardwareinfo.value end as valuestring,\
              hardwaretags.name, hardwaretags.type, hardwaretags.class, hardwaretags.field as key, hardwareinfo.deviceid, hardwaretags.field, hardwareinfo.value, hardwareinfo.timestamp, users.name as username\
              from hardwaretags\
              left join hardwareinfo on hardwareinfo.id = (select id from (select id, max(ondate||timestamp) from hardwareinfo where field = hardwaretags.field and ondate <= ? and deviceid = ? group by field))\
              left join users on users.id = hardwareinfo.userid\
              where "+where.substring(3)+"\
              order by hardwaretags.class, hardwaretags.pos";
  conn.whodb.all(req.query, paramsq, (error, data) => {
    if (error) next(error);
    res.data = data;
    if (req.params.parentid) {
      where = '';
      paramsq = [ req.params.ondate, req.params.parentid ];
      tags.forEach(tag => {
        where += ' or hardwaretags.class = ?';
        paramsq.push(tag);
      });
      req.query = "select case\
      when hardwareinfo.value is null then 'Не задано' \
      when hardwaretags.type = 'date' then substr(hardwareinfo.value,9,2)||'.'||substr(hardwareinfo.value,6,2)||'.'||substr(hardwareinfo.value,1,4)\
      when hardwaretags.type = 'select' then (select name from hardwareselect where class = hardwaretags.class and field = hardwaretags.field and key = hardwareinfo.value)\
      else hardwareinfo.value end as valuestring,\
      hardwaretags.name, hardwaretags.type, hardwaretags.class, hardwaretags.field as key, hardwareinfo.deviceid, hardwaretags.field, hardwareinfo.value, hardwareinfo.timestamp, users.name as username\
      from hardwaretags\
      left join hardwareinfo on hardwareinfo.id = (select id from (select id, max(ondate||timestamp) from hardwareinfo where field = hardwaretags.field and ondate <= ? and deviceid = ? group by field))\
      left join users on users.id = hardwareinfo.userid\
      where "+where.substring(3)+"\
      order by hardwaretags.pos";
      conn.whodb.all(req.query, paramsq, (error, data2) => {
        if (error) next(error);
        res.data.forEach((element, index) => {
          if (element.value === null && data2[index].value !== null) {
            element.value = data2[index].value;
            element.valuestring = data2[index].valuestring;
            element.deviceid = null;
            element.timestamp = null;
            element.username = 'По умолчанию';
          }
        });
        next();
      });
    } else {
      next();
    }
  });
});

router.get('/device/:scope/:ondate?/:id?', func.access('user'), (req, res, next) => {
  if (!req.params.ondate || req.params.ondate === 'today') req.params.ondate = func.currentDate();
  req.query = "select coalesce(computerip.value, '') as ip, coalesce(computername.value, 'Без имени') as name, coalesce(hardwarenotes.comment,'') as comment,\
              hardware.timestamp, users.name as username, hardware.deviceid as key, coalesce(modelstypes.name, '')||' '||coalesce(models.name, '')||' '||coalesce(devices.name, '')||' '||coalesce(hardware.inventory, '')||' '||coalesce(rooms.name, '')||' '||coalesce(coalesce(buildings.name, roomsparent.name), '')||' '||coalesce(owners.name, '')||' '||coalesce(employees.name, '')||' '||coalesce(hardwaregroup.name, '')||' '||coalesce(computername.value, '')||' '||coalesce(computerip.value, '') as rowfilter,\
              coalesce(hardwaregroup.name,'') as parentname, (select count(childrens.id) from (select id, max(ondate||timestamp) as ondate from hardwareaccounting group by deviceid) current left join hardwareaccounting childrens on childrens.id = current.id where childrens.groupid = hardware.deviceid) as childrens,\
              case\
              when hardware.status = 'decommissioned' then '_GROUP1'\
              when hardware.locationid is null and hardware.status = 'broken' then '_GROUP3'\
              when hardware.locationid is null then '_GROUP2'\
              when hardwaregroup.name is null then '_GROUP4'\
              else hardwaregroup.id end as rowgroup,\
              case\
              when hardware.status = 'decommissioned' || hardware.status = 'returned' then '    Списанные'\
              when hardware.locationid is null and hardware.status = 'broken' then '   В ремонте'\
              when hardware.locationid is null then '  На складе'\
              when hardwaregroup.name is null then ' На хранении'\
              else coalesce(hardwaregroup.name, 'Без имени') end as rowgroupname,\
              (select group_concat(tag) from referencetags where elementid = modelstypes.elementid) as tags,\
              case\
              when hardware.status = 'decommissioned' or hardware.status = 'returned' then 'red'\
              when hardware.status = 'broken' then 'yellow'\
              when hardware.locationid is null or hardwaregroup.name is null then 'blue'\
              else '' end as rowcolor,\
              case\
              when hardware.status = 'broken' then 'Неисправен'\
              when hardware.status = 'decommissioned' then 'Списан'\
              when hardware.status = 'returned' then 'Возвращен'\
              when hardware.locationid is null then 'На складе'\
              when hardwaregroup.name is null then 'На хранении'\
              else '' end as statusname,\
              hardware.deviceid as id, hardware.status, hardware.groupid,\
              case\
              when hardware.status = 'decommissioned' or hardware.status = 'returned' then ''\
              when hardware.locationid is null and hardware.status = 'broken' then 'В ремонте'\
              when hardware.locationid is null then 'На складе'\
              else coalesce(buildings.name, roomsparent.name)||coalesce(', '||rooms.name, '') end as locationname,\
              hardware.locationid, coalesce(buildings.elementid, roomsparent.elementid) as buildingid, rooms.elementid as roomid, models.elementid as modelid, models.parentid as typeid, hardware.ownerid as ownerid, coalesce(owners.name,'') as ownername, hardwaregroup.employeeid, devices.elementid as id,\
              coalesce(buildings.name, roomsparent.name) as buildingname, rooms.name as roomname, coalesce(models.name,'') as modelname, coalesce(modelstypes.name,'') as typename, coalesce(employees.name,'') as employeename, coalesce(devices.name,'') as serial, coalesce(hardware.inventory,'') as inventory\
              from (select id, max(ondate||timestamp) as ondate from hardwareaccounting group by deviceid) current\
              left join hardwareaccounting hardware on hardware.id = current.id\
              left join hardwareinfo computername on computername.id = (select id from (select id, max(ondate||timestamp) from hardwareinfo where field = 'name' and ondate <= ? and deviceid = hardware.deviceid group by deviceid))\
              left join hardwareinfo computerip on computerip.id = (select id from (select id, max(ondate||timestamp) from hardwareinfo where field = 'ip' and ondate <= ? and deviceid = hardware.deviceid group by deviceid))\
              left join hardwaregroups hardwaregroup on hardwaregroup.id = (select id from (select hw.id, max(hw.ondate||hw.timestamp) from hardwaregroups hw where hw.ondate <= ? and hw.groupid = hardware.groupid group by hw.name))\
              left join users on users.id = hardware.userid\
              left join hardwarenotes on hardwarenotes.id = (select id from (select id, max(timestamp) from hardwarenotes where elementid = hardware.deviceid group by elementid))\
              left join referencecatalogs devices on devices.id = (select id from (select id, max(ondate||timestamp) from referencecatalogs where catalog = 'device' and ondate <= ? and elementid = hardware.deviceid group by elementid))\
              left join referencecatalogs models on models.id = (select id from (select id, max(ondate||timestamp) from referencecatalogs where catalog = 'model' and ondate <= ? and elementid = devices.parentid group by elementid))\
              left join referencecatalogs modelstypes on modelstypes.id = (select id from (select id, max(ondate||timestamp) from referencecatalogs where catalog = 'type' and ondate <= ? and elementid = models.parentid group by elementid))\
              left join referencecatalogs buildings on buildings.id = (select id from (select id, max(ondate||timestamp) from referencecatalogs where catalog = 'building' and ondate <= ? and elementid = hardware.locationid group by elementid))\
              left join referencecatalogs rooms on rooms.id = (select id from (select id, max(ondate||timestamp) from referencecatalogs where catalog = 'room' and ondate <= ? and elementid = hardware.locationid group by elementid))\
              left join referencecatalogs roomsparent on roomsparent.id = (select id from (select id, max(ondate||timestamp) from referencecatalogs where catalog = 'building' and ondate <= ? and elementid = rooms.parentid group by elementid))\
              left join referencecatalogs employees on employees.id = (select id from (select id, max(ondate||timestamp) from referencecatalogs where catalog = 'employee' and ondate <= ? and elementid = hardwaregroup.employeeid group by elementid))\
              left join referencecatalogs owners on owners.id = (select id from (select id, max(ondate||timestamp) from referencecatalogs where catalog = 'employee' and ondate <= ? and elementid = hardware.ownerid group by elementid))";
  var paramsq = [ req.params.ondate, req.params.ondate, req.params.ondate, req.params.ondate, req.params.ondate, req.params.ondate, req.params.ondate, req.params.ondate, req.params.ondate, req.params.ondate, req.params.ondate ];
  if (req.params.id) {
    req.query += " where hardware.deviceid = ?";
    paramsq.push(req.params.id);
  } else {
    if (req.params.scope === 'actual') req.query += " where hardware.status is null or hardware.status not in ('decommissioned', 'returned')";
  }
  req.query += " order by rowgroupname, modelstypes.description, models.name";
  conn.whodb.all(req.query, paramsq, (error, data) => {
    if (error) next(error);
    data.forEach(row => {
      if (row.tags) {
        const tags = row.tags.split(',');
        tags.forEach(tag => row[tag] = 'true');
        if (row.ups) row.icon = 'icon-battery-charging';
        if (row.printer) row.icon = 'icon-printer';
        if (row.network) row.icon = 'icon-hard-drive';
        if (row.monitor) row.icon = 'icon-monitor';
        if (row.computer) row.icon = 'icon-tablet';
      } else {
        row.icon = '';
      }
    });
    res.data = data; next();
  });
});

module.exports = router;
