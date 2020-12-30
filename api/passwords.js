var router = require('express').Router();
var func = require('../app/func');
var conn = require('../app/conn');

//const encryptedString = cryptr.encrypt('bacon');
//const decryptedString = cryptr.decrypt(encryptedString);

router.get('/groups', func.access('admin'), (req, res, next) => {
  req.query = "select id as key, name as text from passwordsgroups order by name";  
  conn.whodb.all(req.query, (error, data) => {
    if (error) next(error);
    res.data = data; next();
  });
});

router.get('/passwords/:kod', func.access('admin'), (req, res, next) => {
  var where = ''; 
  var ondate = func.currentDate();
  if (req.params.kod !== func.niluuid()) where = "where passwords.groupid = ?";
  // req.query = "select pw_passwords.id, pw_passwords.groupid, pw_passwords.login, pw_passwords.pass, pw_passwords.memory, pw_users.name, pw_users.job from pw_passwords left join pw_users on pw_users.id = pw_passwords.user "+where+" order by pw_users.name";
  req.query = "select passwords.id, passwords.id as key, passwords.groupid, passwords.login, passwords.pass, passwords.memory, passwordsgroups.name as groupname,\
              employees.name as name, employees.description as job\
              from passwords\
              left join passwordsgroups on passwordsgroups.id = passwords.groupid\
              left join referencecatalogs employees on employees.id = (select id from (select id, max(ondate||timestamp) from referencecatalogs where catalog = 'employee' and ondate <= ? and elementid = passwords.employeeid group by elementid))\
              "+where+" order by passwordsgroups.name, employees.name";
  if (req.params.kod !== func.niluuid()) {
    conn.whodb.all(req.query, ondate, req.params.kod, (error, data) => {
      if (error) next(error);
      res.data = data; next();
    });
  } else {
    conn.whodb.all(req.query, ondate, (error, data) => {
      if (error) next(error);
      res.data = data; next();
    });
  }
});

router.post('/encrypt', func.access('admin'), (req, res, next) => {
  req.query = "update passwords set login = ?, pass = ?, memory = ? where id = ?";
  conn.whodb.run(req.query, [req.body.login, req.body.pass, req.body.memory, req.body.id], (err) => {
  if (err) return next(err);
    res.sendStatus(200);
  });
});

module.exports = router;
