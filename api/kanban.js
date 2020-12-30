var router = require('express').Router();
var func = require('../app/func');
var conn = require('../app/conn');
var timestamp = require('timestamp-zoned');

router.post('/card/add', func.access('guest'), async (req, res, next) => {
  if (req.body.typeid === '') req.body.typeid = null;
  if (req.body.user === '') req.body.user = null;
  conn.whodb.run("insert into kanbancards (id, title, description, user, typeid, pos, added, addedby) values (?, ?, ?, ?, ?, 1, ?, ?)", [func.uuid(), req.body.title, req.body.description, req.body.user, req.body.typeid, timestamp.getTimestamp(), req.session.user ? req.session.user.id : null], async(err) => {
    if (err) return next(err);
    res.sendStatus(200);
  });
});

router.post('/type/:action/:id', func.access('admin'), (req, res, next) => {
  if (req.body.icon === '') req.body.icon = null;
  if (req.body.color === '') req.body.color = null;
  switch (req.params.action) {
    case 'insert':
      req.query = "insert into kanbantypes (name, icon, color, id) values (?, ?, ?, ?)";
      req.params = [ req.body.name, req.body.icon, req.body.color, req.params.id ];
      break;
    case 'update':
      req.query = "update kanbantypes set name = ?, icon = ?, color = ? where id = ?";
      req.params = [ req.body.name, req.body.icon, req.body.color, req.params.id ];
      break;
    case 'delete':
      req.query = "delete from kanbantypes where id = ?";
      req.params = [ req.params.id ];
      break;
    default: return res.sendStatus(404);
  }
  conn.whodb.run(req.query, req.params, (err) => {
    if (err) return next(err);
    res.sendStatus(200);
  });
});

router.get('/types', func.access('admin'), (req, res, next) => {
  var query = "select * from kanbantypes order by name";  
  conn.whodb.all(query, (err, rows) => {
    if (err) return res.sendStatus(500);
    res.json({ status: 'ok', data: rows });
  });
});

router.get('/typesdrop', func.access('guest'), (req, res, next) => {
  var query = "select id as key, name as text from kanbantypes order by name";  
  conn.whodb.all(query, (err, rows) => {
    if (err) return res.sendStatus(500);
    res.json({ status: 'ok', data: rows });
  });
});

router.get('/boards', func.access('admin'), (req, res, next) => {
  req.query = "select boards.*, users.name as username\
              from kanbanboards boards\
              left join users on users.id = boards.userid\
              where boards.deleted is null";
  conn.whodb.all(req.query, (error, data) => {
    if (error) next(error);
    res.data = data; next();
  });
});

router.get('/boards/:userid', func.access('admin'), (req, res, next) => {
  req.query = "select boards.*, users.name as username\
              from kanbanboards boards\
              left join users on users.id = boards.userid\
              where boards.deleted is null and users.id = ?";
  conn.whodb.all(req.query, req.params.userid, (error, data) => {
    if (error) next(error);
    res.data = data; next();
  });
});

router.post('/board/:action/:id', func.access('admin'), (req, res, next) => {
  if (req.body.userid === func.niluuid()) req.body.userid = null;
  switch (req.params.action) {
    case 'insert':
      req.query = "insert into kanbanboards (pos, name, userid, id) values (?, ?, ?, ?)";
      req.params2 = [ req.body.pos, req.body.name, req.body.userid, req.params.id ];
      break;
    case 'update':
      req.query = "update kanbanboards set pos = ?, name = ?, userid = ? where id = ?";
      req.params2 = [ req.body.pos, req.body.name, req.body.userid, req.params.id ];
      break;
    case 'delete':
      req.query = "update kanbanboards set deleted = ? where id = ?";
      req.params2 = [ timestamp.getTimestamp(), req.params.id ];
      break;
    default: return res.sendStatus(404);
  }
  conn.whodb.run(req.query, req.params2, async(err) => {
    if (err) return next(err);
    switch (req.params.action) {
      case 'insert':
        await conn.whodb.runSync("insert into kanbancolumns (id, boardid, pos, type, title) values (?, ?, ?, ?, ?)", [ func.uuid(), req.params.id, 1, 'new', 'Новые задачи']);
        await conn.whodb.runSync("insert into kanbancolumns (id, boardid, pos, type, title) values (?, ?, ?, ?, ?)", [ func.uuid(), req.params.id, 2, null, 'В работе']);
        await conn.whodb.runSync("insert into kanbancolumns (id, boardid, pos, type, title) values (?, ?, ?, ?, ?)", [ func.uuid(), req.params.id, 9, 'done', 'Завершено']);
        break;
      case 'delete':
        await conn.whodb.runSync("update kanbancolumns set deleted = ? where id = ?", [ timestamp.getTimestamp(), req.params.id ]);
        // await conn.whodb.runSync("update kanbancards set columnid = (select kanbancolumns.id from kanbancolumns left join kanbanboards on kanbanboards.id = kanbancolumns.boardid where kanbanboards.userid = ? and kanbancolumns.type = 'new' and kanbancolumns.deleted is null order by kanbanboards.pos limit 1) where id = ?"
        break;
      default:
    }
    res.sendStatus(200);
  });
});

router.get('/changeboard/:card/:board', func.access('admin'), (req, res, next) => {
  conn.whodb.run("update kanbancards set columnid = (select id from kanbancolumns where boardid = ? and type = 'new' and deleted is null limit 1) where id = ?", [req.params.board,req.params.card], async(err) => {
    if (err) return next(err);
    res.sendStatus(200);
  });
});

router.get('/changeuser/:card/:user', func.access('admin'), (req, res, next) => {
  conn.whodb.run("update kanbancards set columnid = (select kanbancolumns.id from kanbancolumns left join kanbanboards on kanbanboards.id = kanbancolumns.boardid where kanbanboards.userid = ? and kanbancolumns.type = 'new' and kanbancolumns.deleted is null order by kanbanboards.pos limit 1) where id = ?", [req.params.user,req.params.card], async(err) => {
    if (err) return next(err);
    res.sendStatus(200);
  });
});

router.get('/issues/:scope/:userid?', func.access('user'), (req, res, next) => {
  req.query = "select\
              cards.id, cards.id as key, cards.columnid, cards.title, cards.description, cards.added, cards.addedby, cards.edited, cards.editedby, cards.deleted,\
              cards.columnid, boards.name as boardname, types.name as typename,\
              boards.userid, users.name as username, cards.user, cards.deadline, cards.comment,\
              case when cards.deleted is null then columns.title when cards.columnid is null then 'Отменена' else 'Закрыта' end as columnname,\
              case when cards.deleted is not null then 'green'\
              when cards.deadline is null then 'blue'\
              when julianday(cards.deadline) - julianday(?) < 0 then 'red'\
              when julianday(cards.deadline) - julianday(?) = 0 then 'yellow'\
              end as rowcolor\
              from kanbancards cards\
              left join kanbantypes types on types.id = cards.typeid\
              left join kanbancolumns columns on columns.id = cards.columnid\
              left join kanbanboards boards on boards.id = columns.boardid\
              left join users on users.id = boards.userid\
              where cards.id is not null";
  if (req.params.scope === 'actual') req.query += " and cards.deleted is null";
  if (req.params.userid) req.query += " and cards.addedby = ?";
  conn.whodb.all(req.query, func.currentDate(), func.currentDate(), req.params.userid, (error, data) => {
    if (error) next(error);
    res.data = data; next();
  });
});

router.get('/board/:id', func.access('user'), (req, res, next) => {
  req.query = "select id, title from kanbancolumns where boardid = ? and deleted is null order by pos";  
  conn.whodb.all(req.query, req.params.id, async (error, columns) => {
    if (error) next(error);
    var board = [];
    for (const column of columns) {
      var cards = await conn.whodb.allSync("select kanbancards.id, kanbancards.columnid, kanbancards.title, kanbancards.description, kanbancards.typeid, kanbantypes.name as typename,\
                                          coalesce(kanbancards.edited, kanbancards.added) as date, coalesce(userse.name, usersa.name) as user\
                                          from kanbancards\
                                          left join kanbantypes on kanbantypes.id = kanbancards.typeid\
                                          left join users userse on userse.id = kanbancards.editedby\
                                          left join users usersa on usersa.id = kanbancards.addedby\
                                          where kanbancards.columnid = ? and kanbancards.deleted is null order by kanbancards.pos", column.id);
      board.push({ id: column.id, title: column.title, cards: cards });
    }
    res.data = board; next();
  });
});

router.post('/card/cancel/:id', func.access('user'), (req, res, next) => {
  conn.whodb.run("update kanbancards set deleted = ?, edited = ?, editedby = ? where id = ? and columnid is null", [timestamp.getTimestamp(), timestamp.getTimestamp(), req.session.user.id, req.params.id], (err) => {
    if (err) return next(err);
    res.sendStatus(200);
  });
});

router.post('/card/move/:id', func.access('user'), async (req, res, next) => {
  await conn.whodb.runSync("update kanbancards set pos = pos - 1 where columnid = ? and pos > ?", [req.body.fromColumnId, req.body.fromPosition + 1]);
  await conn.whodb.runSync("update kanbancards set pos = pos + 1 where columnid = ? and pos >= ?", [req.body.toColumnId, req.body.toPosition + 1]);
  await conn.whodb.runSync("update kanbancards set columnid = ?, pos = ?, edited = ?, editedby = ? where id = ?", [req.body.toColumnId, req.body.toPosition + 1, timestamp.getTimestamp(), req.session.user.id, req.params.id]);
  // await conn.whodb.runSync("update kanbancards set columnid = ?, pos = ? where id = ?", [req.body.toColumnId, req.body.toPosition + 1, req.params.id]);
  res.data = { date: timestamp.getTimestamp(), user: req.session.user.name }; next();
});

router.post('/card/remove/:id', func.access('user'), async (req, res, next) => {
  await conn.whodb.runSync("update kanbancards set pos = pos - 1 where columnid = ? and pos > (select pos from kanbancards where id = ?)", [req.body.fromColumnId, req.params.id]);
  await conn.whodb.runSync("update kanbancards set deleted = ?, edited = ?, editedby = ? where id = ?", [timestamp.getTimestamp(), timestamp.getTimestamp(), req.session.user.id, req.params.id]);
  res.data = { date: timestamp.getTimestamp(), user: req.session.user.name}; next();
});

router.post('/card/add/:id', func.access('user'), async (req, res, next) => {
  await conn.whodb.runSync("update kanbancards set pos = pos + 1 where columnid = ?", [req.body.toColumnId]);
  await conn.whodb.runSync("insert into kanbancards (id, columnid, title, description, typeid, user, pos, added, addedby) values (?, ?, ?, ?, ?, ?, 1, ?, ?)", [req.params.id, req.body.toColumnId, req.body.card.title, req.body.card.description, req.body.card.typeid, req.body.card.user, timestamp.getTimestamp(), req.session.user.id]);
  conn.whodb.get("select name from kanbantypes where id = ?", req.body.card.typeid, (error, data) => {
    if (error) next(error);
    res.data = { date: timestamp.getTimestamp(), user: req.session.user.name, typename: data ? data.name : undefined}; next();
  });
});

router.post('/card/edit/:id', func.access('user'), async (req, res, next) => {
  if (req.body.deadline === '') req.body.deadline = null;
  if (req.body.comment === '') req.body.comment = null;
  await conn.whodb.runSync("update kanbancards set title = ?, description = ?, typeid = ?, deadline = ?, comment = ?, edited = ?, editedby = ? where id = ?", [req.body.title, req.body.description, req.body.typeid, req.body.deadline, req.body.comment, timestamp.getTimestamp(), req.session.user.id, req.params.id]);
  conn.whodb.get("select name from kanbantypes where id = ?", req.body.typeid, (error, data) => {
    if (error) next(error);
    res.data = { date: timestamp.getTimestamp(), user: req.session.user.name, typename: data ? data.name : undefined}; next();
  });
});

module.exports = router;
