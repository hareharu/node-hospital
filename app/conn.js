var pgp = require('pg-promise')();
var fbird = require('node-firebird');
var sqlite = require('sqlite3');
var fs = require('fs');

var whodb = new sqlite.Database('database.db');
whodb.configure('busyTimeout', 30000);

whodb.runSync = (sql, params) => {
  var promise = new Promise((resolve, reject) => {
    whodb.run(sql, params, (err) => {
      if (err) {
        console.log(err);
        reject(err);
      }
      resolve();
    });
  });
  return promise;
}

whodb.oneSync = (sql, params) => {
  return new Promise((resolve, reject) => {
    whodb.get(sql, params, (err, row) => {
      if (err) {
        console.error(err);
        reject(err);
      }
      resolve(row ? row[Object.keys(row)[0]] : null);
    });
  });
}

whodb.execSync = (sql) => {
  return new Promise((resolve, reject) => {
    whodb.exec(sql, (err) => {
      if (err) {
        console.error(err);
        reject(err);
      }
      resolve();
    });
  });
}

whodb.getSync = (sql, params) => {
  var promise = new Promise((resolve, reject) => {
    whodb.get(sql, params, (err, row) => {
      if (err) {
        console.log(err);
        reject(err);
      }
      resolve(row);
    });
  });
  return promise;
}

whodb.allSync = (sql, params) => {
  var promise = new Promise((resolve, reject) => {
    whodb.all(sql, params, (err, rows) => {
      if (err) {
        console.log(err);
        reject(err);
      }
      resolve(rows);
    });
  });
  return promise;
}

if (fs.existsSync(process.env.FPR_BASE) === true) {
  var fproc = new sqlite.Database(process.env.FPR_BASE);
  fproc.configure('busyTimeout', 30000);
}

pgp.pg.types.setTypeParser(20, (value) => { return parseInt(value); });
pgp.pg.types.setTypeParser(1082, (value) => { return value.substr(6, 4) + '-' + value.substr(3, 2)  + '-' + value.substr(0, 2); });
pgp.pg.types.setTypeParser(1114, (value) => { return value.substr(6, 4) + '-' + value.substr(3, 2)  + '-' + value.substr(0, 2) + 'T' + value.substr(11, 8); });

var pgsql = pgp({
  host: process.env.PGH_HOST || 'localhost',
  port: process.env.PGH_PORT || 5430,
  database: process.env.PGH_BASE || 'vguz',
  user: process.env.PGH_USER,
  password: process.env.PGH_PASS,
  application_name: 'node-Hospital ' + process.env.SERVER_VERSION,
});

var options = {
  host: process.env.RST_HOST || 'localhost',
  port: process.env.RS_PORT,
  database: process.env.RST_BASE,
  user: process.env.RST_USER,
  password: process.env.RST_PASS,
  lowercase_keys: true,
};

module.exports = { whodb, pgsql, fproc, fbird, options };
