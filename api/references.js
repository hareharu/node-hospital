var router = require('express').Router();
var func = require('../app/func');
var conn = require('../app/conn');
var timestamp = require('timestamp-zoned');

router.get('/catalogs', func.access('admin'), (req, res, next) => {
  const catalogs = [
    { catalog: 'branch', name: 'Филиалы', element: 'Филиал', gender: 1, fields: [
      { key: 'name', name: 'Название' },
      { key: 'description', name: 'Код' },
    ]},
    { catalog: 'department', name: 'Подразделения', element: 'Подразделение', gender: 3, fields: [
      { key: 'parentname', name: 'Филиал', catalog: 'branch', blank: 'Без филиала' },
      { key: 'name', name: 'Код ЕСВС'},
      { key: 'description', name: 'Код Госпиталь' },
    ]},
    { catalog: 'building', name: 'Здания', element: 'Здание', gender: 3, fields: [
      { key: 'name', name: 'Название' },
      { key: 'description', name: 'Адрес' },
    ]},
    { catalog: 'room', name: 'Помещения', element: 'Помещение', gender: 3, fields: [
      { key: 'parentname', name: 'Здание', catalog: 'building', blank: 'Без здания'},
      { key: 'name', name: 'Название'},
      { key: 'description', name: 'Телефон'},
    ]},
    { catalog: 'employee', name: 'Сотрудники', element: 'Сотрудник', gender: 1, suffix: 'а', fields: [
      { key: 'name', name: 'ФИО'},
      { key: 'description', name: 'Должность'},
      { key: 'parentname', name: 'Филиал', catalog: 'branch', blank: 'Без филиала'}
    ], tags: [
      { key: 'owner', name: 'Материально ответственный', column: 'Мат. ответственный'},
      { key: 'tracker', name: 'Ответственный для задач', column: 'Ответств. для задач'},
    ]},
    { catalog: 'type', name: 'Типы', element: 'Тип', gender: 1, fields: [
      { key: 'name', name: 'Название' },
    ], tags: [
      { key: 'computer', name: 'Компьютер', column: 'Компьютер'},
      { key: 'monitor', name: 'Монитор', column: 'Монитор'},
      { key: 'printer', name: 'Принтер', column: 'Принтер'},
      { key: 'scaner', name: 'Сканер', column: 'Сканер'},
      { key: 'ups', name: 'ИБП', column: 'ИБП'},
      { key: 'network', name: 'Сетевое', column: 'Сетевое'},
    ]},
    { catalog: 'model', name: 'Модели', element: 'Модель', gender: 2, fields: [
      { key: 'parentname', name: 'Тип', catalog: 'type', blank: 'Без типа'},
      { key: 'name', name: 'Название'},
    ]},
    { catalog: 'device', name: 'Устройства', element: 'Устройсто', gender: 3, fields: [
      { key: 'grandparentname', name: 'Тип', catalog: 'type', blank: 'Без типа'},
      { key: 'parentname', name: 'Модели', catalog: 'model', blank: 'Без модели',  havegrandparent: true },
      { key: 'name', name: 'Серийный номер'},
    ]},
/*
    { catalog: 'tfoms_smo', name: 'Справочник СМО', element: 'Элемент', gender: 2, fields: [
      { key: 'name', name: 'SMOSH'},
      { key: 'description', name: 'SNOCOD' },
    ]},
    { catalog: 'tfoms_smo_history', name: 'История СМО', element: 'Элемент', gender: 2, fields: [
      { key: 'name', name: 'IDPARENT'},
      { key: 'description', name: 'IDCHILD' },
    ]},
*/
  ];
  res.data = catalogs; next();
});

router.post('/tags/:id', func.access('admin'), async (req, res, next) => {
  for (let [key, value] of Object.entries(req.body.new)) {
    if (req.body.old === undefined || req.body.old[key] !== value) {
      if (value === 'true') {
        await conn.whodb.runSync("insert into referencetags (id, elementid, tag) values (?, ?, ?)", [func.uuid(), req.params.id, key]);
      } else {
        await conn.whodb.runSync("delete from referencetags where elementid = ? and tag = ?", [req.params.id, key]);
      }
    }
  }
  res.sendStatus(200);
});

router.get('/tags/:action/:tag/:id', func.access('admin'), (req, res, next) => {
  switch (req.params.action) {
    case 'remove':
      req.values = [ req.params.id, req.params.tag];
      req.query = "delete from referencetags where elementid = ? and tag = ?";
      break;
    case 'add':
      req.values = [ func.uuid(), req.params.id, req.params.tag ];
      req.query = "insert into referencetags (id, elementid, tag) values (?, ?, ?)";
      break;
    default:
      return res.sendStatus(404);
  }
  conn.whodb.run(req.query, req.values, function(err) {
    if (err) return next(err);
    res.sendStatus(200);
  });
});

router.post('/check/:catalog', func.access('admin'), async (req, res, next) => {
  const current = await conn.whodb.allSync("select catalog.parentid, catalog.name, catalog.description from (select id, max(ondate||timestamp) from referencecatalogs where elementid = ? group by elementid) current left join referencecatalogs catalog on catalog.id = current.id", req.body.elementid);
  if (current[0]) {
    req.body.parentid = current[0].parentid;
    req.body.name = current[0].name;
    req.body.description = current[0].description;
    // console.log({ elementid: req.body.elementid, parentid: current[0].parentid, name: current[0].name, description: current[0].description });
    res.data = ({ elementid: req.body.elementid, parentid: current[0].parentid, name: current[0].name, description: current[0].description });
    return next();
  }
  const id = func.uuid();
  req.query = "insert into referencecatalogs (id, elementid, parentid, catalog, action, name, description, userid, timestamp, ondate) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
  req.values = [func.uuid(), id, req.body.parentid, req.params.catalog, 'insert', req.body.elementid.trim(), '', req.session.user.id, timestamp.getTimestamp(), func.currentDate()];
  conn.whodb.run(req.query, req.values, function(err) {
    if (err) return next(err);
    // console.log({ elementid: id, parentid: req.body.parentid, name: req.body.elementid, description: null });
    res.data = ({ elementid: id, parentid: req.body.parentid, name: req.body.elementid.trim(), description: null });
    next();
  });
});

router.post('/:action/:catalog/:id/:ondate?', func.access('admin'), async (req, res, next) => {
  if (!req.params.ondate) req.params.ondate = func.currentDate();
  if (!req.body.name || req.body.name === '') req.body.name = req.params.id;
  if (req.body.description === '') req.body.description = null;
  if (req.body.parentid === '' || req.body.parentid === func.niluuid()) req.body.parentid = null;
  if (req.params.action === 'delete') {
    const current = await conn.whodb.allSync("select catalog.parentid, catalog.name, catalog.description from (select id, max(ondate||timestamp) from referencecatalogs where elementid = ? group by elementid) current left join referencecatalogs catalog on catalog.id = current.id", req.params.id);
    if (current[0]) {
      req.body.parentid = current[0].parentid;
      req.body.name = current[0].name;
      req.body.description = current[0].description;
    }
  }
  req.query = "insert into referencecatalogs (id, elementid, parentid, catalog, action, name, description, userid, timestamp, ondate) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
  req.values = [func.uuid(), req.params.id, req.body.parentid, req.params.catalog, req.params.action, req.body.name, req.body.description, req.session.user.id, timestamp.getTimestamp(), req.params.ondate];
  conn.whodb.run(req.query, req.values, function(err) {
    if (err) return next(err);
    if (req.params.action === 'import' && req.body.tag) {
      req.values = [ func.uuid(), req.params.id, req.body.tag ];
      req.query = "insert into referencetags (id, elementid, tag) values (?, ?, ?)";
      conn.whodb.runSync(req.query, req.values);
    }
    res.sendStatus(200);
  });
});

router.get('/history/:elementid', func.access('admin'), (req, res, next) => {
  req.query = "select catalog.id, catalog.name, catalog.description, parentcatalog.name as parentname, catalog.action, users.name as username, catalog.timestamp, catalog.ondate,\
              case\
              when catalog.action = 'import' then 'Импортирован'\
              when catalog.action = 'insert' then 'Добавлен'\
              when catalog.action = 'update' then 'Изменен'\
              when catalog.action = 'delete' then 'Удален'\
              else '-' end as actionname\
              from referencecatalogs catalog\
              left join referencecatalogs parentcatalog on parentcatalog.id = (select id from (select id, max(ondate||timestamp) from referencecatalogs where ondate <= catalog.ondate and elementid = catalog.parentid group by elementid))\
              left join users on users.id = catalog.userid\
              where catalog.elementid = ?\
              order by catalog.timestamp";
  conn.whodb.all(req.query, req.params.elementid, (error, data) => {
    if (error) next(error);
    res.data = data; next();
  });
});

router.get('/list/:catalog/:scope/:ondate?', func.access('admin'), (req, res, next) => {
  if (!req.params.ondate) req.params.ondate = func.currentDate();
  req.values = [req.params.catalog, req.params.ondate, req.params.ondate, req.params.ondate];
  req.query = "select case when elementcatalog.action is 'delete' then 'red' when parentcatalog.action is 'delete' then 'yellow' when grandparentcatalog.action is 'delete' then 'yellow' end as rowcolor,\
              elementcatalog.action,\
              (select group_concat(tag) from referencetags where elementid = elementcatalog.elementid) as tags,\
              (select group_concat(tag) from referencetags where elementid = elementcatalog.parentid) as parenttags,\
              elementcatalog.elementid as id, elementcatalog.elementid as key, elementcatalog.name, elementcatalog.description, elementcatalog.parentid, parentcatalog.name as parentname, parentcatalog.parentid as grandparentid, grandparentcatalog.name as grandparentname\
              from (select id, max(ondate||timestamp) from referencecatalogs where catalog = ? and ondate <= ? group by elementid) current\
              left join referencecatalogs elementcatalog on elementcatalog.id = current.id\
              left join referencecatalogs parentcatalog on parentcatalog.id = (select id from (select id, max(ondate||timestamp) from referencecatalogs where ondate <= ? and elementid = elementcatalog.parentid group by elementid))\
              left join referencecatalogs grandparentcatalog on grandparentcatalog.id = (select id from (select id, max(ondate||timestamp) from referencecatalogs where ondate <= ? and elementid = parentcatalog.parentid group by elementid))";
  if (req.params.scope === 'actual') req.query += " where elementcatalog.action is not 'delete'";
  conn.whodb.all(req.query, req.values, (error, data) => {
    if (error) next(error);
    data.forEach(row => {
      if (row.tags) {
        const tags = row.tags.split(',');
        tags.forEach(tag => row[tag] = 'true');
      }
    });
    res.data = data; next();
  });
});

router.get('/dropdown/:catalog/:ondate?', func.access('user'), (req, res, next) => {
  if (!req.params.ondate) req.params.ondate = func.currentDate();
  req.query = "select catalog.elementid as key, catalog.name as text\
              from (select id, max(ondate||timestamp) from referencecatalogs where catalog = ? and ondate <= ?  group by elementid) current\
              left join referencecatalogs catalog on catalog.id = current.id\
              where catalog.action is not 'delete'\
              order by catalog.name";
  conn.whodb.all(req.query, req.params.catalog, req.params.ondate, (error, data) => {
    if (error) next(error);
    res.data = data; next();
  });
});

router.get('/dropdownwithtag/:catalog/:tag/:ondate?', func.access('user'), (req, res, next) => {
  if (!req.params.ondate) req.params.ondate = func.currentDate();
  req.query = "select catalog.elementid as key, catalog.name as text\
              from (select id, max(ondate||timestamp) from referencecatalogs where catalog = ? and ondate <= ?  group by elementid) current\
              left join referencecatalogs catalog on catalog.id = current.id\
              left join referencetags tags on tags.elementid = catalog.elementid and tags.tag = ?\
              where catalog.action is not 'delete' and tags.tag is not null\
              order by catalog.name";
  conn.whodb.all(req.query, req.params.catalog, req.params.ondate, req.params.tag, (error, data) => {
    if (error) next(error);
    res.data = data; next();
  });
});

router.get('/dropdownfiltered/:catalog/:parentid/:ondate?', func.access('user'), (req, res, next) => {
  if (!req.params.ondate) req.params.ondate = func.currentDate();
  req.query = "select catalog.elementid as key, catalog.name as text\
              from (select id, max(ondate||timestamp) from referencecatalogs where catalog = ? and parentid = ? and ondate <= ? group by elementid) current\
              left join referencecatalogs catalog on catalog.id = current.id\
              where catalog.action is not 'delete'\
              order by catalog.name";
  conn.whodb.all(req.query, req.params.catalog, req.params.parentid, req.params.ondate, (error, data) => {
    if (error) next(error);
    res.data = data; next();
  });
});

router.get('/dropdowndevice/:class/:ondate?', func.access('user'), (req, res, next) => {
  if (!req.params.ondate) req.params.ondate = func.currentDate();
  req.query = "select models.elementid as key, models.name as text\
              from (select id, max(ondate||timestamp) from referencecatalogs where catalog = 'model' and ondate <= ? group by elementid) current\
              left join referencecatalogs models on models.id = current.id\
              left join referencecatalogs types on types.id = (select id from (select id, max(ondate||timestamp) from referencecatalogs where catalog = 'type' and ondate <= ? and elementid = models.parentid group by elementid))\
              left join referencetags tags on tags.elementid = types.elementid\
              where tags.tag = ? and models.action is not 'delete'\
              order by models.name";
  conn.whodb.all(req.query, req.params.ondate, req.params.ondate, req.params.class, (error, data) => {
    if (error) next(error);
    res.data = data; next();
  });
});

module.exports = router;
