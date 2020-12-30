var { createProxyMiddleware } = require('http-proxy-middleware');
var fn = require('../app/func');
var target = fn.normalizeURL(process.env.DEV_PROXY) || 'http://localhost:' + (fn.normalizeNumber(process.env.DEV_PORT) || 9000);

module.exports = (app) => {
  if (process.env.DEV_API) {
    var express = require('express');
    app.use(express.json());
    if (process.env.DEV_API) {
      var fs = require('fs');
      var devapi = [];
      var apifiles = fs.readdirSync('json');
      apifiles.forEach( apifile => {
        var split = apifile.split('_');
        if (['GET', 'POST', ''].includes(split[0].toUpperCase())) {
          var method = split[0];
          split.shift();
          var api = '/api/'+split.join('/').replace('/xx', '/**');
          devapi.push({ api: split[0], type: method, url: api, file: './json/' + apifile },);
        }
      });
      devapi.forEach(api => {
        if (process.env.DEV_API === 'all' || process.env.DEV_API === api.api ) {
          if (api.type === 'get') {
            app.get(api.url, (req, res, next) => { 
              fs.readFile(api.file, 'utf8', (err, data) => {
                if (err) return res.sendStatus(500);
                res.data = JSON.parse(data);
                next();
              });
            });
          } else if (api.type === 'post') {
            app.post(api.url, (req, res, next) => { 
              fs.readFile(api.file, 'utf8', (err, data) => {
                if (err) return res.sendStatus(500);
                res.data = JSON.parse(data);
                next();
              });
            });
          }
        }
      });
      app.use((req, res, next) => {
        if (res.data) return res.json({ status: 'ok', data: res.data });
        next();
      });
    }
  }
  app.use('/api', createProxyMiddleware({ target, changeOrigin: true }));
  app.use('/file', createProxyMiddleware({ target, changeOrigin: true }));
};
