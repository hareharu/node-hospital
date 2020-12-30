var conn = require('./conn');
var path = require('path');
var fs = require('fs');

var run = async () => {
  var currentversion = await conn.whodb.oneSync("select * from pragma_user_version()");
  if (!currentversion) currentversion = 0;
  currentversion = parseInt(currentversion, 10);
  if (currentversion === 0) {
    var createsql = fs.readFileSync(path.join('sql', 'create_db_v1.sql'));
    await conn.whodb.execSync(createsql.toString());
    await conn.whodb.runSync("PRAGMA user_version = 1");
    currentversion = 1;
    await conn.whodb.runSync("insert into roles (id, name, access) values ('f2666279-b183-4978-a363-2477a82ab269', 'Администратор', 'admin')");
    await conn.whodb.runSync("insert into sidemenu (id, roleid, pos, type, key) values ('d3970b05-7d76-48d3-bcc2-91e77d4d6907', 'f2666279-b183-4978-a363-2477a82ab269', 1, 'module', 'userroles')");
    await conn.whodb.runSync("insert into sidemenu (id, roleid, pos, type, key) values ('c417ca0e-cd0f-4deb-95b7-54e519d99ab6', 'f2666279-b183-4978-a363-2477a82ab269', 2, 'module', 'homelinks')");
    await conn.whodb.runSync("insert into sidemenu (id, roleid, pos, type, key) values ('300348cf-beb0-46bc-a49e-29d3af16e12d', 'f2666279-b183-4978-a363-2477a82ab269', 3, 'module', 'settings')");
    await conn.whodb.runSync("insert into users (id, roleid, name, authtype, login, pass) values ('a4afbbc8-3ad3-4e53-beb8-53949d5d7e71', 'f2666279-b183-4978-a363-2477a82ab269', 'Администратор', 'who', 'admin', '21232f297a57a5a743894a0e4a801fc3')");
    console.log('Создана новая база данных.');
  }
  var actualversion = 1;
  var sqlfiles = fs.readdirSync('sql');
  sqlfiles.forEach( sqlfile => {
    if (sqlfile.indexOf('update_db_to_v') === 0) {
      var version = path.parse(sqlfile).name.substring(14);
      version = parseInt(version, 10);
      if (version > actualversion) actualversion = version;
    }
  });
  if (currentversion !== actualversion) {
    for (var i = currentversion + 1; i <= actualversion; i++) {
      var updatesql = fs.readFileSync(path.join('sql', 'update_db_to_v' + i + '.sql'));
      await conn.whodb.execSync(updatesql.toString());
      await conn.whodb.runSync("PRAGMA user_version = ?", i);
    }
    console.log('База данных обновлена до версии ' + actualversion + '.');
  } else {
    console.log('Обновление базы данных не требуется.');
  }
}

run();
