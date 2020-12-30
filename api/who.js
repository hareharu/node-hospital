var router = require('express').Router();
var func = require('../app/func');
var conn = require('../app/conn');
var fs = require('fs');

router.post('/check', (req, res, next) => {
  conn.whodb.all('select name, value, type from settings', (err, rows) => {
    if (err) { console.log('#####NO_SETTINGS!#####'); return res.sendStatus(500);}
    var settings = {};
    rows.forEach(row => {
      switch (row.type) {
        case 'toggle': settings[row.name] = row.value.toLowerCase() === 'да'; break;
        case 'number': settings[row.name] = func.normalizeNumber(row.value); break;
        default: settings[row.name] = row.value;
      }
    });
    if (!req.session.user) return res.json({ settings });
    req.session.save((err) => {
      if (err) { console.log('#####SQLITE_BUSY?#####'); return res.sendStatus(500);}
      if (req.body.client === '1.0.0') return res.sendStatus(418);
      req.session.app = {
        ip: func.normalizeIP(req.ip),
        agent: req.get('User-Agent'),
        client: req.body.client,
        build: req.body.build,
        server: process.env.SERVER_VERSION,
        module: req.body.module,
      };
      req.session.cookie.maxAge = 60000 * (settings.system_sessiontime || 60) + 60000;
      res.json({
        user: req.session.user,
        menu: req.session.menu,
        server: req.session.app.server,
        maxage: req.session.cookie.originalMaxAge,
        checkin: 60000 * (settings.system_checkintime || 5),
        settings,
      });
    });
  });
});

router.post('/login', (req, res, next) => {
  require('../app/auth')(req.body.username, req.body.password, (data) => {
    if (data === undefined) return res.sendStatus(500);
    if (data === null) return res.sendStatus(404);
    if (!data.user.role) return res.sendStatus(403);
    req.session.save((err) => {
      if (err) return res.sendStatus(500);
      req.session.user = data.user;
      // req.session.menu = data.menu;
      res.json({ user: data.user, menu: undefined });
    });
  });
});

router.get('/logout', (req, res, next) => {
  req.session.destroy((err) => {
    if (err) return res.sendStatus(500);
    req.session = null;
    res.sendStatus(200);
  });
});

router.get('/home', (req, res, next) => {
  conn.whodb.all('select id as key, side, type, text, url, icon from homepage order by pos', (err, rows) => {
    if (err) return res.sendStatus(500);
    res.json(rows);
  });
});

router.get('/side', (req, res, next) => {
  conn.whodb.all('select * from panels order by pos', (err, rows) => {
    if (err) return res.sendStatus(500);
    res.json(rows);
  });
});

router.get('/info', (req, res, next) => {
  var buildinfo, changelog, license;
  fs.readFile('./buildinfo.md', 'utf8', (err, data) => {
    if (!err) buildinfo = data;
    fs.readFile('./changelog.md', 'utf8', (err, data) => {
      if (!err) changelog = data;
      fs.readFile('./LICENSE', 'utf8', (err, data) => {
        if (!err) license = data;
        return res.json({ status: 'ok', buildinfo, changelog, license });
      });
    });
  });
});

router.get('/menu', (req, res, next) => {
  conn.whodb.get("select coalesce(roles.sidemenuid, roles.id) as links from users left join roles on users.roleid = roles.id where users.id = ?", req.session.user.id, (err, data) => {
    if (err) return next(err);
    if (data) {
      conn.whodb.all("select case sidemenu.type when 'module' then sidemenu.key else sidemenu.type || sidemenu.id end as key,\
                    case sidemenu.folder when null then null else 'folder' || sidemenu.folder end as folder,\
                    sidemenu.name, sidemenu.title, sidemenu.icon, sidemenu.url from sidemenu where roleid = ? order by sidemenu.pos", data.links, (err, rows) => {
        if (err) return next(err);
        res.json({ status: 'ok', data: rows });
      });
    } else {
      res.json({ status: 'ok', data: [] });
    }
  });
});

router.get('/filial/:podr', func.access('user'), (req, res, next) => {
  var ondate = func.currentDate();
  conn.whodb.get("select branches.description as key\
    from (select id, max(ondate||timestamp) from referencecatalogs where catalog = 'branch' and ondate <= ? group by elementid) current\
    left join referencecatalogs branches on branches.id = current.id\
    where branches.action is not 'delete' and branches.elementid = ?", ondate, req.params.podr, (error, data) => {
    if (data) {
      res.data = data.key;
      next();
    } else {
      res.data = null;
      next();
    }
  });
});

router.get('/podr/:tag?/:filter?', func.access('user'), (req, res, next) => {
  var selectedid = 'elementid';
  var params = [ func.currentDate() ];
  var where = '';
  if (req.params.tag === 'forfproc') {
    selectedid = 'description';
    where += ' and branches.description is not null';
  }
  if (req.params.filter && req.params.filter !== func.niluuid()) {
    where += ' and branches.elementid = ?';
    params.push(req.params.filter);
  }
  conn.whodb.all("select branches.name as text, branches."+selectedid+" as key\
                from (select id, max(ondate||timestamp) from referencecatalogs where catalog = 'branch' and ondate <= ? group by elementid) current\
                left join referencecatalogs branches on branches.id = current.id\
                where branches.action is not 'delete' "+where+" order by branches.name", params, (error, data) => {
    if (data) {
      if (req.params.tag === 'forroles') data.unshift({ key: func.niluuid(), text: 'Все филиалы' });
      res.data = data;
      next();
    }
  });
});

router.post('/mkb', func.access('guest'), (req, res, next) => { req.datatype = 'sqlite';
  var where = '';
  req.body.mkb = req.body.mkb.toUpperCase();
	var char1 = ['Ф','И','С','В','У','А','П','Р','Ш','О','Л','Д','Ь','Т','Щ','З','Й','К','Ы','Е','Г','М','Ц','Ч','Н','Я'];
	var char2 = ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z'];
  req.body.mkb = req.body.mkb.replaceArray(char1, char2);
  req.body.mkbname = req.body.mkbname.toLowerCase();
  var whereA = [req.body.mkb+'%'];
  var mkbnameA = req.body.mkbname.split(' ');
  mkbnameA.forEach((word, index) => {
    where += " and mkbnamelow like '%"+word+"%'";
    whereA.push('%'+word+'%');
  });
  req.query = "select * from mkb10 where mkb like '"+req.body.mkb+"%' " + where;
  conn.whodb.all(req.query, (error, data) => {
    if (error) next(error);
    res.data = data; next();
  });
});

router.get('/convertuchastok', func.access('admin'), (req, res, next) => {
  conn.whodb.all("select * from adr_uch", (error, data) => {
    if (data) {
      data.forEach(async row => {
        await conn.whodb.runSync("update adr_uch set n_domov = ? where IDADR_UCH = ?", [convertUchastok(row.N_DOMOV), row.IDADR_UCH]);
      });
    }
  });
  res.json({ status: 'ok', data: [] });
});

var convertUchastok = (input) => {
  if (!input) return input;
  const h0 = input.split(',');
  const houses = [];
  h0.forEach(h => {
    if (h.includes('-')) {
      const type = h.substring(0, 1).toUpperCase();
      if (type === 'Ч' || type === 'Н') h = h.substring(2, h.length-1);
      const range = h.split('-');
      for (let i = parseInt(range[0], 10); i <= parseInt(range[1], 10); i++) {
        if (i % 2 === 0) {
          if (type !== 'Н') houses.push(i.toString());
        } else {
          if (type !== 'Ч') houses.push(i.toString());
        }
      }
    } else {
      houses.push(h);
    }
  });
  return houses.join(',');
}

router.post('/uploadimage', func.access('user'), async (req, res, next) => {
  try {
    if (!req.files) {
      res.send({  status: 'bad', message: 'No file uploaded' });
    } else {
      var fs = require('fs');
      var path = require('path');
      var folder = 'files';
      var file = req.files.file;
      var translit = require('transliteration');
      var filename = translit.slugify(file.name, { separator: '_' });
      var newfilename = filename;
      var count = 1;
      while (fs.existsSync(path.join(folder, newfilename))) {
        newfilename = path.parse(filename).name + "_" + count + path.parse(filename).ext;
        count += 1;
      }
      if (!fs.existsSync(folder)) fs.mkdirSync(folder);
      file.mv(path.join(folder, newfilename));
      res.send({ 'location': path.join('file', newfilename)});
    }
  } catch (err) {
    next(err);
  }
});

module.exports = router;
