var conn = require('./conn');
var md5 = require('md5');

module.exports = (name, pass, result) => {
  conn.whodb.get("select authtype from users where login = ? and deleted is null", name, (error, auth) => {
    if (error) return result();
    if (auth === undefined) return result(null);
    switch (auth.authtype) {
      case 'who':
        // if (process.env.AUTHTYPES && !process.env.AUTHTYPES.includes('who')) return result();
        conn.whodb.get("select users.id, users.name, users.login, roles.name as role, roles.access, users.doctor, roles.departmentid as dept, users.authtype as auth from users left join roles on users.roleid = roles.id where users.login = ? and users.pass = ? and users.authtype = 'who'", [name, md5(pass)], (error, user) => {
          if (error) return result();
          if (!user) return result(null);
          return result({ user, menu: undefined }); 
        });
        break;
      case 'wad':
        // if (process.env.AUTHTYPES && !process.env.AUTHTYPES.includes('wad')) return result();
        var ActiveDirectory = require('activedirectory2');
        var config = { url: 'ldap://' + process.env.AD_CONTRL, baseDN: process.env.AD_BASEDN };
        var ad = new ActiveDirectory(config);
        ad.authenticate(name + '@' + process.env.AD_DOMAIN, pass, function(err, auth) {
          if (err) {
            console.log('ERROR: ' + JSON.stringify(err));
            return result(null);
          }
          if (auth) {
            conn.whodb.get("select users.id, users.name, users.login, roles.name as role, roles.access, users.doctor, roles.departmentid as dept, users.authtype as auth from users left join roles on users.roleid = roles.id where users.login = ? and users.authtype = 'wad'", name, (error, user) => {
              if (error) return result();
              return result({ user, menu: undefined });
            });
          } else {
            console.log('Authentication failed!');
            return result(null);
          }
        });
        break;
      case 'guz':
        // if (process.env.AUTHTYPES && !process.env.AUTHTYPES.includes('guz')) return result();
        conn.pgsql
        .one('select count(*) from pg_authid where rolname = $1 and rolpassword = $2', [name, 'md5' + md5(pass + name)])
        .then(data => {
          if (data.count === 0) return result(null);
          conn.pgsql.one('select trim(login) as login, coalesce(trim(user_), trim(login)) as name from user_ where login = $1', name)
          .then(guzuser => {
            conn.whodb.get("select users.id, roles.name as role, roles.access, users.doctor, roles.departmentid as dept, users.authtype as auth from users left join roles on users.roleid = roles.id where users.login = ? and users.authtype = 'guz'", name, (error, user) => {
              if (error) return result();
              if (!user) return result(null);
              user.login = guzuser.login;
              user.name =  guzuser.name;
              return result({ user, menu: undefined }); 
            });
          })
          .catch(error => { console.error(error); return result(); });
        }).catch(error => { console.error(error); return result(); });
        break;
      default: return result();
    }
  });
}
