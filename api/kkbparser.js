var router = require('express').Router();
var func = require('../app/func');
var parser = require('node-html-parser');
var https = require('https');

router.get('/login', func.access('guest'), (req, res, next) => {
  var authorization = JSON.stringify({
    login: process.env.KKB_USER,
    password: process.env.KKB_PASS
  });
  var options = {
    host: 'medics.medgorod.ru',
    path: '/api/organization/user/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': authorization.length
    }
  };
  var request = https.request(options, response => {
    var cookies = response.headers['set-cookie'];
    var cookie = cookies[cookies.length - 1];
    var index = cookie.indexOf("PHPSESSID=") + 10;
    var conn = require('../app/conn');
    conn.whodb.run("update settings set value = ? where name = 'kkbparser_sessionid'", cookie.substring(index, index + 26), (err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });
  request.on('error', err => {
    next(err.message);
  });
  request.write(authorization);
  request.end();
});

router.get('/list', func.access('guest'), async (req, res, next) => {
  var sessionid = await func.getSettings('kkbparser_sessionid');
  var options = {
    host: 'medics.medgorod.ru',
    path: '/index.php?view=clinic&action=docTemplates',
    method: 'GET',
    headers: {
      'Cookie': 'PHPSESSID=' + sessionid,
    }
  };

  var request = https.request(options, response => {
    if (response.statusCode === 302) {
      next();
    } else {
      response.setEncoding('utf8');
      var body = '';
      response.on('data', chunk => {
        body = body + chunk;
      });
      response.on('end', () => {
        var path = require('path');
        var list = [];
        var root = parser.parse(body);
        var data = root.querySelectorAll('.professionFiles');
        data.forEach(group => {
          var header = group.querySelector('h3').rawText;
          if (header.length === 0) {
            header = "Общие документы";
          }
          var files = group.querySelectorAll('.file_edit_form');
          files.forEach(file => {
            var id = "";
            var inputs = file.querySelectorAll('input');
            inputs.forEach(input => {
              if (input.attributes.name === 'id_upload') {
                id = input.attributes.value;
              }
            });
            var info = file.querySelector('.file_info_name');
            var name = info.querySelector('.download_file').rawText;
            var date = info.querySelector('.about').rawText;
            var index = date.indexOf("Создан: ") + 8;
            date = date.substring(index, index + 16);
            var filepath = "temp/" + path.parse(name).name + " (" + date.replace(':', '') + ")" + path.parse(name).ext;
            list.push({key: func.uuid(), id, name, date, rowgroup: header, path : filepath, filter : header + " - " + name});
          });
        });
        res.data = list;
        next();
      });
    }
  });
  request.on('error', err => {
    next(err.message);
  });
  request.end();
});

router.post('/file/:idupload', func.access('guest'), async (req, res, next) => {
  var filename = req.body.filepath;
  var fs = require("fs");
  if (!fs.existsSync(filename)) {
    var sessionid = await func.getSettings('kkbparser_sessionid');
    var options = {
      host: 'medics.medgorod.ru',
      path: '/full_screen.php?view=upload&action=download&id=' + req.params.idupload + '&v=clinic&c=prof',
      method: 'GET',
      headers: {
        'Cookie': 'PHPSESSID=' + sessionid,
      }
    };
    https.get(options, response => {
      var writeStream = fs.createWriteStream(filename);
      response.pipe(writeStream);
      writeStream.on("finish", () => {
        writeStream.close();
        if (fs.statSync(filename)['size'] === 0) {
          fs.unlinkSync(filename);
          next();
        } else {
          fs.readFile(filename, 'binary', (err, file) => {
            if (err) return res.sendStatus(500);
            var stats = fs.statSync(filename);
            res.setHeader('Content-Description','File Transfer');
            res.setHeader('Content-Length', stats['size']);
            res.write(file, 'binary');
            res.end();
          });
        }
      });
    });
  } else {
    fs.readFile(filename, 'binary', (err, file) => {
      if (err) return res.sendStatus(500);
      var stats = fs.statSync(filename);
      res.setHeader('Content-Description','File Transfer');
      res.setHeader('Content-Length', stats['size']);
      res.write(file, 'binary');
      res.end();
    });
  }
});

module.exports = router;
