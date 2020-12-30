var router = require('express').Router();
var func = require('../app/func');
var conn = require('../app/conn');
var path = require('path');
var fs = require('fs');

router.get('/list', func.access('guest'), (req, res, next) => {
  var query = "select *, 'icon-'||type as icon, coalesce(category, 'Без категории') as rowgroup, coalesce(category, ' -') as roworder, \
              name||' '||coalesce(category, 'Без категории') as rowfilter, id as key from videoplayer order by name";  
  conn.whodb.all(query, (err, rows) => {
    if (err) return res.sendStatus(500);
    res.json({ status: 'ok', data: rows });
  });
});

router.post('/list/:action/:id', func.access('admin'), (req, res, next) => {
  if (req.body.description === '') req.body.description = null;
  if (req.body.category === '') req.body.category = null;
  switch (req.params.action) {
    case 'insert':
      req.query = "insert into videoplayer (type, name, path, description, category, id) values ('file', ?, ?, ?, ?, ?)";
      req.params = [ req.body.name, req.body.path, req.body.description, req.body.category, req.params.id ];
      break;
    case 'update':
      req.query = "update videoplayer set type = 'file', name = ?, path = ?, description = ?, category = ? where id = ?";
      req.params = [ req.body.name, req.body.path, req.body.description, req.body.category, req.params.id ];
      break;
    case 'delete':
      req.query = "delete from videoplayer where id = ?";
      req.params = [ req.params.id ];
      break;
    default: return res.sendStatus(404);
  }
  conn.whodb.run(req.query, req.params, (err) => {
    if (err) return next(err);
    res.sendStatus(200);
  });
});

router.get('/folder', func.access('admin'), async (req, res, next) => {
  var extensions = ['.mkv', '.mov', '.mp4'];
  var folder = await conn.whodb.getSync("select * from settings where name = 'videoarchive_folder'");
  if (folder === undefined) return res.sendStatus(404);
  if (!fs.existsSync(folder.value)) return res.sendStatus(404);
  if (!fs.lstatSync(folder.value).isDirectory()) return res.sendStatus(404);
  await conn.whodb.runSync("delete from videoplayer where type = 'folder'");
  var files = fs.readdirSync(folder.value);
  for (var file in files) {
    if (fs.lstatSync(path.join(folder.value, files[file])).isDirectory()) {
      var filessub = fs.readdirSync(path.join(folder.value, files[file]));
      for (var filesub in filessub) {
        if (!fs.lstatSync(path.join(folder.value, files[file], filessub[filesub])).isDirectory()) {
          if (extensions.includes(path.parse(filessub[filesub]).ext.toLowerCase())) {
            await conn.whodb.runSync("insert into videoplayer (type, name, path, category, id) values ('folder', ?, ?, ?, ?)", [path.parse(filessub[filesub]).name, path.join(folder.value, files[file], filessub[filesub]), files[file], func.uuid()]);
          }
        }
      }
    } else {
      if (extensions.includes(path.parse(files[file]).ext.toLowerCase())) {
        await conn.whodb.runSync("insert into videoplayer (type, name, path, id) values ('folder', ?, ?, ?)", [path.parse(files[file]).name, path.join(folder.value, files[file]), func.uuid()]);
      }
    }
  }
  res.sendStatus(200);
});

router.get('/category', func.access('guest'), (req, res, next) => {
  var query = "select category as key, category as text from videoplayer where category is not null group by category order by category";  
  conn.whodb.all(query, (err, rows) => {
    if (err) return res.sendStatus(500);
    res.json({ status: 'ok', data: rows });
  });
});

router.get('/info/:id', func.access('guest'), (req, res, next) => {
  req.query = "select * from videoplayer where id = ?";
  conn.whodb.get(req.query, req.params.id, (error, data) => {
    if (error) next(error);
    if (data === undefined) return res.sendStatus(404);
    res.data = data; next();
  });
});

router.get('/stream/:id', func.access('guest'), (req, res, next) => {
  req.query = "select * from videoplayer where id = ?";
  conn.whodb.get(req.query, req.params.id, (error, data) => {
    if (error) next(error);
    if (data === undefined) return res.sendStatus(404);
    if (!fs.existsSync(data.path)) return res.sendStatus(404);
    // const path = `assets/${videoplayer[req.params.id].file}`;
    const path = data.path;
    const stat = fs.statSync(path);
    const fileSize = stat.size;
    const range = req.headers.range;
    if (range) {
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize-1;
      const chunksize = (end-start) + 1;
      const file = fs.createReadStream(path, {start, end});
      const head = {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunksize,
        'Content-Type': 'video/mp4',
      };
      res.writeHead(206, head);
      file.pipe(res);
    } else {
      const head = {
        'Content-Length': fileSize,
        'Content-Type': 'video/mp4',
      };
      res.writeHead(200, head);
      fs.createReadStream(path).pipe(res);
    }
  });
});

module.exports = router;
