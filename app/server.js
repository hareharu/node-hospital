var port = process.env.PORT;
if (process.env.NODE_ENV !== 'production') {
  process.env.NODE_ENV = 'development';
  const chalk = require('chalk');
  if (require('dotenv').config().error) {
    console.error(chalk.red('Unable to process ".env" file'));
    process.exit(0);
  }
  console.log(chalk.cyan('Starting node-hospital'+(process.env.APPNAME ? (' ('+process.env.APPNAME+')') : '')+' '+process.env.NODE_ENV+' server...'));
  process.env.APPNAME = process.env.APPNAME || 'node-hospital';
  port = process.env.DEV_PORT;
  require('./settings');
} else {
  if (process.env && process.env.NODE_APP_INSTANCE) {
    if (process.env.NODE_APP_INSTANCE === '0') {
      require('./settings');
      require('./sched');
    }
  }
}

var app = require('./express');
var func = require('./func');
var http = require('http');
var server = http.createServer(app);

port = func.normalizeNumber(port) || 9000;

server.listen(port);
server.on('error', onError);
server.on('listening', onListening);

function onListening() {
  if (process.env.NODE_ENV !== 'production') {
    const chalk = require('chalk');
    console.log(chalk.green('Listening on port ' + port + '\n'));
  }
}

function onError(err) {
  if (err.syscall !== 'listen') {
    throw err;
  }
  switch (err.code) {
    case 'EACCES':
      console.error('Port ' + port + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error('Port ' + port + ' is already in use');
      process.exit(1);
      break;
    default:
      throw err;
  }
}
