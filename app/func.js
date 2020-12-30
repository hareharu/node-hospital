String.prototype.replaceArray = function(substrA, newSubStrA) {
  var newString = this;
  for (var i = 0; i < substrA.length; i++) {
    newString = newString.replace(substrA[i], newSubStrA[i]);
  }
  return newString;
};

String.prototype.replaceAll = function(substr, newSubStr) {
  return this.split(substr).join(newSubStr);
}

var padNumber = (number) => {
  if (number < 10) {
    return '0' + number.toString();
  } else {
    return number.toString();
  }
}

var getWeekNumber = (date) => {
  date = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  date.setUTCDate(date.getUTCDate() + 4 - (date.getUTCDay() || 7));
  var yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  var weekNum = Math.ceil((((date - yearStart) / 86400000) + 1) / 7);
  return weekNum;
}

var getMonday = (date) => {
  date = new Date(date);
  var day = date.getDay();
  var diff = date.getDate() - day + (day === 0 ? -6:1); // adjust when day is sunday
  return new Date(date.setDate(diff));
}

var getLastSunday = (year, month) => {
  var date = new Date(year,month,1,12);
  var weekday = date.getDay();
  var dayDiff = weekday === 0 ? 7 : weekday;
  date.setDate(date.getDate() - dayDiff);
  return dateToDate(date);
}

var currentDate = () => {
  var currentdate = new Date()
  return currentdate.getFullYear().toString() + '-' + padNumber(currentdate.getMonth() + 1) + '-' + padNumber(currentdate.getDate());
}

var dateToDate = (date) => {
  return date.getFullYear().toString() + '-' + padNumber(date.getMonth() + 1) + '-' + padNumber(date.getDate());
}

var dateToString = (string) => {
  var date = new Date(string)
  return padNumber(date.getDate()) + '.' + padNumber(date.getMonth() + 1) + '.' + date.getFullYear().toString();
}

var stringToDate = (string) => {
  if (string === null) return null;
  if (string && string.length === 10) {
    return string.substring(6, 10) + '-' + string.substring(3, 5) + '-' + string.substring(0, 2);
  } else {
    return undefined;
  }
}

var normalizeNumber = (value) => {
  var number = parseInt(value, 10);
  if (isNaN(number)) {
    return false;
  }
  if (number >= 1) {
    return number;
  }
  return false;
}

var normalizeURL = (string) => {
  if (typeof string !== 'string') return false;
  var pattern = new RegExp('^(https?://)?((([a-zd]([a-zd-]*[a-zd])*).)+[a-z]{2,}|((\d{1,3}.){3}\d{1,3}))(:\d+)?','i'); // eslint-disable-line no-useless-escape
  if (!pattern.test(string)) {
    return false;
  } else {
    return string;
  }
}

var normalizeIP = (ip) => {
  if (!ip) return '-';
  if (ip.substr(0, 7) === '::ffff:') {
    return ip.substr(7);
  } else if ( ip === '::1' ) {
    return 'localhost';
  } else {
    return ip;
  }
}

var calculateAge = (birthday, ondate) => {
  birthday = new Date(birthday);
  if (ondate) {
    ondate = new Date(ondate);
  } else {
    ondate = new Date();
  }
  var dif = ondate.getTime() - birthday.getTime();
  var difdate = new Date(dif);
  return Math.abs(difdate.getUTCFullYear() - 1970);
}

var fillArray = (value, length) => {
  var array = [];
  for (var i = 0; i < length; i ++) {
    array.push(value);
  }
  return array;
}

var conn = require('./conn');

var getPodr = async (id) => {
  var ondate = currentDate();
  var data = conn.whodb.allSync("select departments.description as plk\
              from (select id, max(ondate||timestamp) from referencecatalogs where catalog = 'department' and parentid = ? and ondate <= ? group by elementid) current\
              left join referencecatalogs departments on departments.id = current.id\
              where departments.action is not 'delete'", [id, ondate]);
  return await data;
}

var getSettings = async (key) => {
  var data = await conn.whodb.getSync("select value from settings where name = ?", key);
  return data.value;
}

var getKodPlkString = async (id) => {
  var plk = '';
  var data = await getPodr(id);
  if (data) {
    data.forEach(dept => plk += "'" + dept.plk + "',");
    return plk.slice(0, plk.length-1);
  } else {
    return '';
  }
};

var getKodPlkArray = async (id) => {
  if (!id || id === niluuid()) return [];
  var plk = [];
  var data = await getPodr(id);
  if (data) {
    data.forEach(dept => plk.push(dept.plk));
    return plk;
  } else {
    return [];
  }
};

var uuid = () => {
  // const uuidv1 = require('uuid/v1');
  const { v1: uuidv1 } = require('uuid');
  return uuidv1(); // .replace('-', '').replace('-', '').replace('-', '').replace('-', '').toUpperCase();
}

var logaction = (table, action, description, user) => {
  var query = "insert into activity (id, tablename, action, userid, timestamp, description) values (?, ?, ?, ?, ?, ?)";
  var timestamp = require('timestamp-zoned');
  conn.whodb.run(query, [ uuid(), table, action, user, timestamp.getTimestamp(), description ]);
}

var niluuid = () => {
  return '00000000-0000-0000-0000-000000000000';
}

var access = (access) => {
  return (req, res, next) => {
    if (!testaccess(access, req.session.user)) return res.sendStatus(401);
    else next();
  }
}

var testaccess = (route, user) => {
  if (!route) route = 'guest';
  if (!user || !user.access) user = 'guest'; else user = user.access;
  // console.log(route, user, accesslevel(route), accesslevel(user));
  if (accesslevel(route) > accesslevel(user)) return false;
  return true;
}

var accesslevel = (access) => {
  switch (access) {
    case 'user': return 1;
    case 'doctor': return 2;
    case 'admin': return 3;
    default: return 0;
  }
}

module.exports = {
  access,
  testaccess,
  padNumber,
  dateToString,
  stringToDate,
  normalizeNumber,
  normalizeURL,
  normalizeIP,
  calculateAge,
  fillArray,
  getKodPlkString,
  getKodPlkArray,
  getWeekNumber,
  getMonday,
  getLastSunday,
  dateToDate,
  uuid,
  niluuid,
  logaction,
  currentDate,
  getSettings,
};
