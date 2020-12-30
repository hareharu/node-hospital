var conn = require('./conn');
var fs = require('fs');

var jsondir = './json';
if (!fs.existsSync(jsondir)) {
    fs.mkdirSync(jsondir);
}

conn.pgsql
.any('select trim(user_) as text, iduser as key from user_ where crdate is null order by user')
.then(data => {
  if (data) {
    var userAll = data;
    fs.writeFile("json/users_guz.json", JSON.stringify(userAll), 'utf8', function (err) {
      if (err) {
        console.log("An error occured while writing JSON Object to File.");
        return console.log(err);
      }
    });
  }
}).catch(error => console.error(error));

conn.whodb
.all('select login as text, id as key from users', (error, data) => {
  if (data) {
    var userAll = data;
    fs.writeFile("json/users.json", JSON.stringify(userAll), 'utf8', function (err) {
      if (err) {
        console.log("An error occured while writing JSON Object to File.");
        return console.log(err);
      }
    });
  }
});

var fn = require('./func');
var ondate = fn.currentDate();
conn.whodb.all("select branches.name, branches.elementid as id, branches.description as key\
              from (select id, max(ondate||timestamp) from referencecatalogs where catalog = 'branch' and ondate <= ? group by elementid) current\
              left join referencecatalogs branches on branches.id = current.id\
              where branches.action is not 'delete' order by branches.name", ondate, (error, data) => {
  if (data) {
    var deptAll = [];
    data.forEach(dept => {
      var esvs = [];
      var plk = [];
      conn.whodb.all("select departments.name as esvs, departments.description as plk\
                    from (select id, max(ondate||timestamp) from referencecatalogs where catalog = 'department' and parentid = ? and ondate <= ? group by elementid) current\
                    left join referencecatalogs departments on departments.id = current.id\
                    where departments.action is not 'delete'", dept.id, ondate, (error, data2) => {
        if (data2) {
          data2.forEach(dept2 => {
            esvs.push(dept2.esvs);
            plk.push(dept2.plk);
          });
          deptAll.push({ id: dept.id, key: dept.key, text: dept.name, esvs, plk});
          var jsonContent = JSON.stringify(deptAll);
          fs.writeFile("json/department.json", jsonContent, 'utf8', function (err) {
            if (err) {
              console.log("An error occured while writing JSON Object to File.");
              return console.log(err);
            }
          });
        }
      });
    });
  }
});
