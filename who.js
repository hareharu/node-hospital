var task = process.argv[2] || 'start';
var path = require('path');
var pm2 = require('pm2');

if (task === 'update') {
  require('./app/update');
} else {
  if (require('dotenv').config({ path: path.join(__dirname, '.env') }).error) {
    console.error('Невозможно прочитать файл конфигурации!');
    process.exit(0);
  }
  if (!process.env.PORT || !process.env.SECRET) {
    console.error('В файле конфигурации не задан обязательный параметр PORT и/или SECRET!');
    process.exit(0);
  }
  var appname = process.env.APPNAME ? 'node-hospital (' + process.env.APPNAME + ')' : 'node-hospital'; // имя приложения для вывода; ни на что не влияет
  process.env.APPNAME = process.env.APPNAME || 'node-hospital'; // имя приложения для pm2
  process.env.NODE_ENV = 'production';
  
  switch (task) {
    case 'start':
      console.log('Запуск сервера ' + appname + '...');
      break;
    case 'restart':
      console.log('Перезапуск сервера ' + appname + '...');
      break;
    case 'stop':
      console.log('Остановка сервера ' + appname + '...');
      break;
    default:
      console.log('Недопустимая команда - используйте "start", "restart" или "stop"');
      process.exit(0);
  }
  
  pm2.connect((err) => {
    if (err) {
      console.error(err);
      process.exit(0);
    }
    pm2.list((err, apps) => {
      if (err) {
        console.error(err);
        process.exit(0);
      }
      if (apps.filter(app => app.name === process.env.APPNAME).length === 0) {
        switch (task) {
          case 'start':
            var config = {
              name: process.env.APPNAME,
              script: './app/server.js',
              watch: false,
              cwd: __dirname,
              pid: './who.pid',
              min_uptime: '1m',
              max_restarts: 10,
              max_memory_restart: (process.env.MAXMEMORY || 250) + 'M',
              exec_mode: 'cluster_mode',
              instances: process.env.INSTANCES || 4,
              output: './log/output.log',
              error: './log/error.log',
              log_date_format: 'YYYY-MM-DD HH:mm:ss.SSS',
              combine_logs: true,
            };
            pm2.start(config, (err, apps) => {
              pm2.disconnect();
              if (err) throw err;
              console.log(appname + ' запущен на порту ' + process.env.PORT);
            });
            break;
          default:
            pm2.disconnect();
            console.log(appname + ' не запущен - для запуска используйте команду "start"');
        }
      } else {
        switch (task) {
          case 'start':
            pm2.disconnect();
            console.log(appname + ' уже запущен - для перезапуска используйте команду "restart"');
            break;
          case 'restart':
            pm2.reload(process.env.APPNAME, (err, apps) => { 
              pm2.disconnect();
              if (err) throw err; 
              console.log(appname + ' перезапущен');
            });
            break;
          case 'stop':
            pm2.delete(process.env.APPNAME, (err, apps) => { 
              pm2.disconnect();
              if (err) throw err;
              console.log(appname + ' остановлен');
            });
            break;
          default:
            pm2.disconnect();
        }
      }
    });
  }); 
}
