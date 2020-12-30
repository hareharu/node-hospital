var router = require('express').Router();
var func = require('../app/func');
var pm2 = require('pm2');
var conn = require('../app/conn');
var fs = require('fs');
var path = require('path');

router.get('/apps', func.access('admin'), (req, res, next) => {
  pm2.connect((err) => {
    if (err) return next(err);
    pm2.list((err, apps) => {
      pm2.disconnect();
      if (err) return next(err);
      var data = [];
      var mem = 0;
      var cpu = 0;
      var status = '';
      var rowcolor = '';
      apps.forEach(app => {
        if (app.name === process.env.APPNAME) {
          mem += app.monit.memory;
          cpu += app.monit.cpu;
          switch (app.pm2_env.status) {
            case 'online': status = 'Работает'; break;
            case 'stopping': status = 'Останавливается'; break;
            case 'stopped': status = 'Остановлено'; rowcolor = 'yellow'; break;
            case 'launching': status = 'Запускается'; break;
            case 'errored': status = 'Сбой'; rowcolor = 'red'; break;
            case 'one-launch-status': status = ''; break;
            default: status = app.pm2_env.status;
          }
          data.push({
            pid: app.pid,
            name: app.name,
            version: app.pm2_env.version,
            status,
            pm_uptime: app.pm2_env.pm_uptime,
            restart_time: app.pm2_env.restart_time,
            unstable_restarts: app.pm2_env.unstable_restarts,
            memory: app.monit.memory,
            cpu: app.monit.cpu,
            rowcolor,
          });
        }
      });
      res.data = { apps: data, info: { ver: process.env.SERVER_VERSION, env: process.env.NODE_ENV, mem, cpu } };
      res.json({ status: 'ok', data: res.data });
    });
  });
});

router.get('/users', func.access('admin'), (req, res, next) => {
  conn.whodb.all('select expired, sess from sessions', (err, data) => {
    if (err) return next(err);
    var sessions = [];
    if (data) {
      data.forEach(session => {
        var row = { expired: session.expired };
        if (session.sess) {
          var sess = JSON.parse(session.sess);
          if(sess.app) {
            row.ip = sess.app.ip;
            row.client = sess.app.client;
            row.build = sess.app.build;
            row.module = sess.app.module;
            row.rowcolor = sess.app.client !== process.env.SERVER_VERSION ? 'yellow' : undefined;
          } else {
            row.rowcolor = 'red';
          }
          if (sess.user) {
            row.user = sess.user.name;
            row.role = sess.user.role;
            row.access = sess.user.access;
            switch (sess.user.access) {
              case 'admin': row.accessname = 'Администратор'; break;
              case 'doctor': row.accessname = 'Медработник'; break;
              default: row.accessname = 'Пользователь';
            }
          }
        }
        sessions.push(row);
      });
    }
    res.json({ status: 'ok', data: sessions });
  });
});

router.get('/output', func.access('admin'), (req, res, next) => {
  var out = [];
  var api = [];
  res.data = { api, out };
  if (fs.existsSync(path.join('log', 'output.log'))) {
    var readline = require('readline');
    var instream = fs.createReadStream(path.join('log', 'output.log'));
    var outstream = new (require('stream'))();
    var reader = readline.createInterface(instream, outstream);
    reader.on('line', function (line) {
      var date = line.slice(0, 23);
      line = line.slice(25, line.length);
      var lineA = line.split(';');
      if (lineA[0] === 'API call') {
        var status = func.normalizeNumber(lineA[5]) || 0;
        var time = parseInt(lineA[7]);
        var rowcolor = undefined;
        if (status === 0 || status >= 400) {
          rowcolor = 'red';
        } else if (time >= 1000) {
          if (time >= 5000) {
            rowcolor = 'red';
          } else {
            rowcolor = 'yellow';
          }
        }
        api.push({
          date_time: date,
          ip: lineA[1],
          user: lineA[2],
          method: lineA[3],
          url: lineA[4],
          status,
          content_length: func.normalizeNumber(lineA[6]) || 0,
          response_time: isNaN(time) ? 0 : time,
          rowcolor,
        });
      } else {
        out.push({
          date_time: date,
          msg: lineA[0],
        });
      }
    });
    reader.on('close', function (line) {
      res.data.api = api;
      res.data.out = out;
      res.json({ status: 'ok', data: res.data });
    });
  } else {
    res.json({ status: 'ok', data: res.data });
  }
});

router.get('/log/:log', func.access('admin'), (req, res, next) => {
  if (fs.existsSync(path.join('log', req.params.log + '.log'))) {
    fs.readFile(path.join('log', (req.params.log + '.log')), 'utf8', (error, data) => {
      if (error) { 
        res.send('Не удалось прочитать журнал ' + path.join('log', (req.params.log + '.log')));
      } else {
        res.send(data);
      }
    });
  } else {
    res.send('');
  }
});

router.get('/clean', func.access('admin'), (req, res, next) => {
  var now = new Date().getTime();
  conn.whodb.run('delete from sessions where expired < ?', now, (err) => {
    if (err) return next(err);
    console.log('Сессии с истекшим сроком действия были удалены.');
    res.sendStatus(200);
  });
});

router.get('/pm2reload', func.access('admin'), (req, res, next) => {
  pm2.connect((err) => {
    if (err) return next(err);
    pm2.list((err, apps) =>  {
      if (err) {
        pm2.disconnect();
        return next(err);
      }
      if (apps.filter(app => app.name === process.env.APPNAME).length > 0) {
        pm2.reload(process.env.APPNAME, (err, apps) => {
          pm2.disconnect();
          return next(err);
        });
      } else {
        pm2.disconnect();
      }
    });
  });
  console.log('Серверу успешно отправлен сигнал на перезапуск. Перезапуск будет начат через несколько секунд.');
  res.sendStatus(200);
});

module.exports = router;
