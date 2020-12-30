var router = require('express').Router();
var func = require('../app/func');
var conn = require('../app/conn');
var timestamp = require('timestamp-zoned');

router.post('/modroles/add', func.access('admin'), (req, res, next) => {
  var users = req.body.users.map((user) => '?').join(',');
  var params = [ req.body.role ];
  req.body.users.forEach((user, index) => {
    params.push(user);
  });
  conn.whodb.run("update users set roleid = ? where id in ("+users+")", params, (err) => {
    if (err) return next(err);
    res.sendStatus(200);
  });
});

router.post('/modroles/remove', func.access('admin'), (req, res, next) => {
  var users = req.body.users.map((user) => '?').join(',');
  conn.whodb.run("update users set roleid = null where id in ("+users+")", req.body.users, (err) => {
    if (err) return next(err);
    res.sendStatus(200);
  });
});

router.post('/modroles/copy', func.access('admin'), (req, res, next) => {
  conn.whodb.run("delete from sidemenu where roleid = ?", req.body.role, (err) => {
    if (err) return next(err);
    conn.whodb.all("select * from sidemenu where roleid = ?", req.body.menu, async (error, data) => {
      if (error) next(error);
      var query = "insert into sidemenu (id, roleid, pos, folder, type, key, icon, name, title, url) values ";
      var params = [];
      for (var element in data) {
        data[element].roleid = req.body.role;
        var oldid = data[element].id;
        var newid = func.uuid();
        data[element].id = newid;
        if (data[element].type === 'folder') {
          for (var element2 in data) {
            if (data[element2].folder === oldid) {
              data[element2].folder = newid;
            }
          }
        }
      }
      for (var index in data) {
        query += "(?, ?, ?, ?, ?, ?, ?, ?, ?, ?), ";
        params = [ ...params, data[index].id, data[index].roleid, data[index].pos, data[index].folder, data[index].type, data[index].key, data[index].icon, data[index].name, data[index].title, data[index].url ];
      }
      query = query.substr(0, query.length - 2);
      conn.whodb.run(query, params, (err) => {
        if (err) return next(err);
        res.sendStatus(200);
      });
    });
  });
});

router.get('/cleanusers/:authtype', func.access('admin'), (req, res, next) => {
  conn.whodb.run("update users set roleid = null, pass = null, deleted = ? where authtype = ? and deleted is null", timestamp.getTimestamp(), req.params.authtype, (err) => {
    if (err) return next(err);
    res.sendStatus(200);
  });
});

router.post('/updateusers/wad', func.access('admin'), (req, res, next) => {
  var ActiveDirectory = require('activedirectory2');
  var config = { url: 'ldap://' + process.env.AD_CONTRL, baseDN: process.env.AD_BASEDN, bindDN: req.body.user + '@' + process.env.AD_DOMAIN, bindCredentials: req.body.pass };
  var ad = new ActiveDirectory(config);
  var groupName = process.env.AD_GROUP || 'node-hospital';
  ad.getUsersForGroup('Врачи ВП', async (err, userswad) => {
    if (err) {
      console.log('ERROR: ' +JSON.stringify(err));
      return res.sendStatus(500);
    }
    if (!userswad) {
      console.log('Группа: ' + groupName + ' не найдена.');
      return res.sendStatus(500);
    } else {
      console.log(userswad)
      const users = await conn.whodb.allSync("select id, login from users where authtype = 'wad'");
      for (const user of users) {
        const userwad = userswad.find((userwad) => userwad.sAMAccountName.indexOf(user.login) > -1);
        if (!userwad) {
          await conn.whodb.runSync("update users set roleid = null, deleted = ? where id = ? and authtype = 'wad'", [ timestamp.getTimestamp(), user.id]);
        }
      }
      for (const userwad of userswad) {
        const user = users.find((user) => user.login.indexOf(userwad.sAMAccountName) > -1);
        if (userwad.displayName === undefined) userwad.displayName = userwad.sAMAccountName;
        if (userwad.description === undefined) userwad.description = null;
        if (user) {
          await conn.whodb.runSync("update users set deleted = null, name = ?, description = ?, login = ? where id = ? and authtype = 'wad'", [ userwad.displayName, userwad.description, userwad.sAMAccountName, user.id]);
        } else {
          await conn.whodb.runSync("insert into users (id, name, description, authtype, login) values (?, ?, ?, ?, ?)", [ func.uuid(), userwad.displayName, userwad.description, 'wad', userwad.sAMAccountName ]);
        }
      } 
      res.sendStatus(200);
    }
  });
});

router.get('/updateusers/guz', func.access('admin'), (req, res, next) => { 
  req.query = "select trim(u.login) as login, trim(u.user_) as name, trim(u.staff) as staff, trim(wm.kod_snils) as doctor, u.status,\
              trim(wm.fam) || ' ' || substr(wm.nam, 1, 1) || '.' || substr(wm.oth, 1, 1) || '.' || ', ' || trim(ss.spec) as doc\
              from user_ u\
              left join s_wrach wr on wr.kod_doc = u.kod_doc\
              left join s_spec ss on ss.kod_spec = wr.kod_spec\
              left join sw_man wm on wm.kod_wman = wr.kod_wman\
              where u.crdate is null and u.islocal = true order by u.login";
  conn.pgsql
  .any(req.query)
  .then(async usersguz => {
    const users = await conn.whodb.allSync("select id, login from users where authtype = 'guz'");
    for (const user of users) {
      const userguz = usersguz.find((userguz) => userguz.login.indexOf(user.login) > -1);
      if (!userguz) {
        await conn.whodb.runSync("update users set roleid = null, deleted = ? where id = ? and authtype = 'guz'", [ timestamp.getTimestamp(), user.id]);
      }
    }
    for (const userguz of usersguz) {
      const user = users.find((user) => user.login.indexOf(userguz.login) > -1);
      if (userguz.name === '') userguz.name = userguz.login;
      if (userguz.staff === '') userguz.staff = null;
      if (user) {
        await conn.whodb.runSync("update users set deleted = null, name = ?, description = ?, doctor = ?, login = ? where id = ? and authtype = 'guz'", [ userguz.name, userguz.staff, userguz.doctor, userguz.login, user.id]);
      } else {
        await conn.whodb.runSync("insert into users (id, name, description, doctor, authtype, login) values (?, ?, ?, ?, ?, ?)", [ func.uuid(), userguz.name, userguz.staff, userguz.doctor, 'guz', userguz.login ]);
      }
    } 
    res.sendStatus(200);
  })
  .catch(next);
});

router.get('/usersdrop', func.access('admin'), (req, res, next) => {
  var query = "select users.id as key, users.name as text from users left join roles on roles.id = users.roleid where roles.access = 'admin' order by users.name";  
  conn.whodb.all(query, (err, rows) => {
    if (err) return res.sendStatus(500);
    res.json({ status: 'ok', data: rows });
  });
});

router.get('/users/:auth', func.access('admin'), (req, res, next) => {
  if (req.params.auth === 'all') {
    req.query = "select (select catalog.name from (select id, max(ondate||timestamp) from referencecatalogs where catalog = 'employee' and ondate <= ? and elementid = users.employeeid group by elementid) current left join referencecatalogs catalog on catalog.id = current.id where catalog.action is not 'delete') as employeename,\
                case when users.authtype = 'guz' then 'blue' end as rowcolor, users.id, users.authtype, users.id as key, users.login, users.name, coalesce(users.description,'') as description, users.doctor, users.employeeid, coalesce(roles.name,'') as role, roles.id as roleid\
                from users left join roles on users.roleid = roles.id where users.authtype in ('who', 'guz') and users.deleted is null order by login";
    conn.whodb.all(req.query, func.currentDate(), (error, data) => {
      if (error) next(error);
      res.data = data; next(); 
    });
  } else {
    req.query = "select users.id, users.authtype, users.id as key, users.login, users.name, coalesce(users.description,'') as description, users.doctor, users.employeeid, coalesce(roles.name,'') as role, roles.id as roleid\
                from users left join roles on users.roleid = roles.id where users.authtype = ? and users.deleted is null order by login";
    conn.whodb.all(req.query, req.params.auth, (error, data) => {
      if (error) next(error);
      res.data = data; next(); 
    });
  }
});

router.post('/users/:action/:id', func.access('admin'), (req, res, next) => { 
  var md5 = require('md5');
  switch (req.params.action) {
    case 'delete':
      req.values = [ timestamp.getTimestamp(), req.params.id];
      req.query = "update users set roleid = null, pass = null, deleted = ? where id = ? and authtype = 'who'";
      break;
    case 'update':
      if (req.body.name === '') req.body.name = req.body.login;
      if (req.body.description === '') req.body.description = null;
      if (req.body.doctor === '') req.body.doctor = null;
      if (req.body.employeeid === '') req.body.employeeid = null;
      if (req.body.pass === '') {
        req.values = [ req.body.name, req.body.description, req.body.doctor, req.body.employeeid, req.body.login, req.params.id];
        req.query = "update users set deleted = null, name = ?, description = ?, doctor = ?, employeeid = ?, login = ? where id = ?";
      } else {
        req.values = [ req.body.name, req.body.description, req.body.doctor, req.body.employeeid, req.body.login, md5(req.body.pass), req.params.id];
        req.query = "update users set deleted = null, name = ?, description = ?, doctor = ?, employeeid = ?, login = ?, pass = ? where id = ?";
      }
      break;
    case 'insert':
      if (req.body.name === '') req.body.name = req.body.login;
      if (req.body.description === '') req.body.description = null;
      if (req.body.doctor === '') req.body.doctor = null;
      if (req.body.employeeid === '') req.body.employeeid = null;
      req.values = [ req.params.id, req.body.name, req.body.description, 'who', req.body.login, md5(req.body.pass) ];
      req.query = "insert into users (id, name, description, authtype, login, pass) values (?, ?, ?, ?, ?, ?)";
      break;
    default:
      return res.sendStatus(404);
  }
  conn.whodb.run(req.query, req.values, function(err) {
    if (err) return next(err);
    res.sendStatus(200);
  });
});

router.get('/roles', func.access('admin'), (req, res, next) => { 
  req.query = "select roles.id as key, roles.name as text, coalesce(roles.access, 'user') as access,\
              case roles.access when 'admin' then 'red' when 'user' then 'green' end as rowcolor,\
              coalesce(departments.name, 'Все филиалы') as dept,\
              coalesce(links.name, 'Собстевнное меню') as links,\
              roles.sidemenuid as linkskey, roles.departmentid as deptkey from roles\
              left join referencecatalogs departments on departments.id = (select id from (select id, max(ondate||timestamp) from referencecatalogs where catalog = 'branch' and ondate <= ? and elementid = roles.departmentid group by elementid))\
              left join roles links on links.id = roles.sidemenuid\
              order by roles.name";
  conn.whodb.all(req.query, func.currentDate(), (error, data) => {
    if (error) next(error);
    res.data = data; next();
  });
});

router.get('/roleswithmenu', func.access('admin'), (req, res, next) => {
  req.query = "select roles.id as key, roles.name as text from roles where roles.sidemenuid is null order by roles.name";
  conn.whodb.all(req.query, (error, data) => {
    if (error) next(error);
    res.data = data; next();
  });
});

router.get('/role/:id', func.access('admin'), (req, res, next) => {
  req.query = "select name from roles where id = ?";  
  conn.whodb.all(req.query, req.params.id, (error, data) => {
    if (error) next(error);
    res.data = data; next();
  });
});

router.post('/role/edit', func.access('admin'), (req, res, next) => {
  if (req.body.dept === func.niluuid()) req.body.dept = null;
  if (req.body.links === func.niluuid()) req.body.links = null;
  if (req.body.id) {
    req.query = "update roles set name = ?, access = ?, departmentid = ?, sidemenuid = ? where id = ?";
  } else {
    req.body.id = req.body.newid;
    req.body.access = 'user';
    req.query = "insert into roles (name, access, departmentid, sidemenuid, id) values (?, ?, ?, ?, ?)";
  }
  conn.whodb.run(req.query, [req.body.name, req.body.access, req.body.dept, req.body.links, req.body.id], (err) => {
    if (err) return next(err);
    res.sendStatus(200);
  });
});

router.post('/role/delete', func.access('admin'), (req, res, next) => {
  req.query = "delete from sidemenu where roleid = ?";
  conn.whodb.run(req.query, req.body.id, (err) => {
    if (err) return next(err);
    req.query = "update users set roleid = null where roleid = ?";
    conn.whodb.run(req.query, req.body.id, (err) => {
    if (err) return next(err);
    req.query = "delete from roles where id = ?";
      conn.whodb.run(req.query, req.body.id, (err) => {
      if (err) return next(err);
        res.sendStatus(200);
      });
    });
  });
});

router.get('/menu/:id', func.access('admin'), (req, res, next) => {
  req.query = "select sidemenu.id, sidemenu.id as key, sidemenu.roleid, sidemenu.type, sidemenu.pos, sidemenu.folder, folders.name as foldername, sidemenu.icon, sidemenu.name, sidemenu.title, sidemenu.url,\
              case sidemenu.type when 'link' then 'Ссылка' when 'folder' then 'Папка' else 'Модуль' end as typename,\
              case sidemenu.type when 'link' then 'ссылка' when 'folder' then 'папка' else sidemenu.key end as module\
              from sidemenu\
              left join sidemenu folders on sidemenu.folder = folders.id\
              where sidemenu.roleid = ? order by coalesce(folders.pos*1000+sidemenu.pos, sidemenu.pos*1000)";  
  conn.whodb.all(req.query, req.params.id, (error, data) => {
    if (error) next(error);
    res.data = data; next();
  });
});

router.get('/menu/folders/:role', func.access('admin'), (req, res, next) => {
  req.query = "select id as key, name as text from sidemenu where type = 'folder' and roleid = ? order by name";  
  conn.whodb.all(req.query, req.params.role, (error, data) => {
    if (error) next(error);
    res.data = data; next();
  });
});

router.post('/menu/edit', func.access('admin'), (req, res, next) => {
  if (req.body.key === '' || req.body.type !== 'module') req.body.key = null;
  if (req.body.icon === '') req.body.icon = null;
  if (req.body.name === '') req.body.name = null;
  if (req.body.title === '') req.body.title = null;
  if (req.body.url === '') req.body.url = null;
  if (req.body.folder === func.niluuid()) req.body.folder = null;
  if (req.body.id) {
    req.query = "update sidemenu set roleid = ?, type = ?, pos = ?, folder = ?, key = ?, icon = ?, name = ?, title = ?, url = ? where id = ?";
  } else {
    req.body.id = req.body.newid;
    req.query = "insert into sidemenu (roleid, type, pos, folder, key, icon, name, title, url, id) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
  }
  conn.whodb.run(req.query, [ req.body.role, req.body.type, req.body.pos, req.body.folder, req.body.key, req.body.icon, req.body.name, req.body.title, req.body.url, req.body.id ], (err) => {
    if (err) return next(err);
    res.sendStatus(200);
  });
});

router.post('/menu/delete', func.access('admin'), (req, res, next) => {
  req.query = "delete from sidemenu where id = ?";
  conn.whodb.run(req.query, req.body.id, (err) => {
    if (err) return next(err);
    req.query = "update sidemenu set folder = null where folder = ?";
    conn.whodb.run(req.query, req.body.id, (err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });
});

module.exports = router;
