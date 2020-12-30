var schedule = require('node-schedule');
var conn = require('./conn');
var func = require('./func');
var pm2 = require('pm2');
var fs = require('fs');

console.log('Инициализация расписания...');

schedule.scheduleJob('0 * * * *', () => {
  console.log('Задача по расписанию: удаление сессий с истекшим сроком действия');
  var now = new Date().getTime();
  conn.whodb.run("delete from sessions where expired < ?", now, (err) => {
    if (err) throw err;
  });
});


schedule.scheduleJob('59 0 * * *', () => {
  console.log('Задача по расписанию: закрытие задач помеченных как выполненые');
  conn.whodb.run("update kanbancards set deleted = edited where id in (\
    select kanbancards.id from kanbancards left join kanbancolumns on kanbancolumns.id = kanbancards.columnid\
    where kanbancards.deleted is null and kanbancolumns.type = 'done' and (julianday(kanbancards.edited) - julianday(?) <= 0))", func.currentDate(), (err) => {
    if (err) throw err;
  });
});

schedule.scheduleJob('59 23 * * *', () => {
  console.log('Задача по расписанию: архивирование журналов');
  var date = new Date().toISOString().replace(':','-').replace(':','-');
  fs.rename('./log/error.log', './log/error_' + date + '.log', (err) => {
    fs.rename('./log/output.log', './log/output_' + date + '.log', (err) => {
      pm2.connect((err) => {
        if (err) throw err;
        pm2.reloadLogs((err) => {
          pm2.disconnect();
          if (err) throw err;
        });
      });
    });
  });
});
