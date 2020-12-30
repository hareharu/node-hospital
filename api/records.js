var router = require('express').Router();
var func = require('../app/func');
var conn = require('../app/conn');
var timestamp = require('timestamp-zoned');

router.get('/templates', func.access('user'), (req, res, next) => {
  req.query = "select id as key, name as text from templates where deleted is null order by name";  
  conn.whodb.all(req.query, (error, data) => {
    if (error) next(error);
    res.data = data; next();
  });
});

router.get('/gettemplates', func.access('user'), (req, res, next) => {
  req.query = "select id, id as key, name, full, added, edited from templates where deleted is null order by name";  
  conn.whodb.all(req.query, (error, data) => {
    if (error) next(error);
    res.data = data; next();
  });
});

router.get('/template/:id', func.access('user'), (req, res, next) => {
  req.query = "select * from templates where id = ?";
  conn.whodb.get(req.query, req.params.id, (error, data) => {
    if (error) next(error);
    res.data = data; next();
  });
});

router.post('/deletetemplate', func.access('user'), (req, res, next) => {
  req.query = "update templates set deleted = ?, editedby = ?, edited = ? where id = ?";
  conn.whodb.run(req.query, [timestamp.getTimestamp(), req.session.user.id, timestamp.getTimestamp(), req.body.id], (err) => {
  if (err) return next(err);
    res.sendStatus(200);
  });
});

router.post('/edittemplate', func.access('user'), (req, res, next) => {
  if (req.body.id) {
    req.query = "update templates set name = ?, full = ?, text = ?, editedby = ?, edited = ? where id = ?";
  } else {
    req.body.id = req.body.newid;
    req.query = "insert into templates (name, full, text, addedby, added, id) values (?, ?, ?, ?, ?, ?)";
  }
  conn.whodb.run(req.query, [ req.body.name, req.body.full, req.body.text, req.session.user.id, timestamp.getTimestamp(), req.body.id ], function(err) {
    if (err) return next(err);
    if (!req.body.id) {
      res.json({ status: 'ok', id:  this.lastID });
    } else {
      res.json({ status: 'ok', changes:  this.changes });
    }
  });
});

router.get('/list/:kod', func.access('doctor'), (req, res, next) => {
  req.query = "select records.id, records.id as key, records.template, records.name, coalesce(records.edited, records.added) as date, records.day, records.addedby as user, coalesce(userse.name, usersa.name) as user_name, case records.addedby when ? then 1 else 0 end as editable\
              from records\
              left join users userse on userse.id = records.editedby\
              left join users usersa on usersa.id = records.addedby\
              where records.patient = ? and records.deleted is null order by records.day";
  conn.whodb.all(req.query, req.session.user.id, req.params.kod, (error, data) => {
    if (error) next(error);
    res.data = data; next();
  });
});

router.get('/get/:id', func.access('doctor'), (req, res, next) => {
  req.query = "select * from records where id = ?";
  conn.whodb.get(req.query, req.params.id, (error, data) => {
    if (error) next(error);
    res.data = data; next();
  });
});

router.get('/getpdf/:id', func.access('doctor'), (req, res, next) => {
  req.query = "select name||'.pdf' as filename, \
              pdf as epicrisis from records where id = ?";
  conn.whodb.get(req.query, req.params.id, (error, data) => {
    if (error) next(error);
    var epicrisis = data.epicrisis;
    var filename = encodeURIComponent(data.filename);
    var pdf = Buffer.from(epicrisis, 'base64');
    res.setHeader('Content-Description','File Transfer');
    res.setHeader('Content-Disposition', 'inline; filename="' + filename + '"'); // attachment/inline
    res.setHeader('Content-Type', 'application/pdf');
    res.end(pdf);
  });
});

router.post('/edit', func.access('doctor'), async (req, res, next) => {
  var html = '<!DOCTYPE html><html lang="ru"><head><meta charset="utf-8"><title>' + req.body.name + '</title></head><body style="margin:0px;">' + req.body.text + '</body></html>';
  const puppeteer = require('puppeteer');
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(`data:text/html,${html}`) // тут должно быть setContent(html) но она почему-то упорно отказывается отображать контент в utf-8
  const pdf = await page.pdf({format: 'A4', margin: {top: '0.5cm', right: '1cm', bottom: '0.5cm', left: '1cm'}});
  browser.close();
  if (req.body.id) {
    req.query = "update records set text = ?, name = ?, editedby = ?, pdf = ?, patient = ?, edited = ?, day = ? where id = ?";
    req.params = [ req.body.text, req.body.name, req.session.user.id, pdf, req.body.patient, timestamp.getTimestamp(), req.body.date, req.body.id ]
  } else {
    req.body.id = req.body.newid;
    req.query = "insert into records (text, name, template, addedby, pdf, patient, added, day, id) values (?, ?, ?, ?, ?, ?, ?, ?, ?)";
    req.params = [ req.body.text, req.body.name, req.body.template, req.session.user.id, pdf, req.body.patient, timestamp.getTimestamp(),  req.body.date, req.body.id ]
  }
  conn.whodb.run(req.query, req.params, function(err, result) {
    if (err) return next(err);
    if (!req.body.id) {
      res.json({ status: 'ok', id:  this.lastID });
    } else {
      res.json({ status: 'ok', changes:  this.changes });
    }
  });
});

router.post('/delete', func.access('doctor'), (req, res, next) => {
  req.query = "update records set deleted = ?, editedby = ?, edited = ? where id = ?";
  conn.whodb.run(req.query, [timestamp.getTimestamp(), req.session.user.id, timestamp.getTimestamp(), req.body.id], (err) => {
  if (err) return next(err);
    res.sendStatus(200);
  });
});

module.exports = router;
