var router = require('express').Router();
var func = require('./func');
var fs = require('fs');

router.get('/proxy/unauthorized', (req, res, next) => {
  return res.sendStatus(401);
});

if (fs.existsSync(process.env.FPR_BASE) === false && process.env.FPR_PORT) {
  var proxy = require('express-http-proxy');
  router.use('/fprocessor', proxy((process.env.FPR_HOST || 'localhost') + ':' + process.env.FPR_PORT, {
    proxyReqPathResolver: (req) => 
    {
      if (req.url.startsWith('/archive') || (req.url.startsWith('/download') && !req.url.startsWith('/download/protocol'))) {
        if (!func.testaccess('doctor', req.session.user)) return '/api/proxy/unauthorized';
      }
      return '/api' + req.url;
    },
    proxyReqBodyDecorator: (proxyReq, srcReq) => {
      return { ...proxyReq, apikey: process.env.FPR_APIKEY };
    },
    userResDecorator: async (proxyRes, proxyResData, userReq, userRes) => {
      if (proxyRes.req.path.startsWith('/api/exam')) {
        var response = JSON.parse(proxyResData.toString('utf8'));
        if (proxyRes.req.path.startsWith('/api/exam/all')) {
          var fn = require('./func');
          var conn = require('./conn');
          var ondate = fn.currentDate();
          var depts = await conn.whodb.allSync("select branches.name as text, branches.description as key\
                        from (select id, max(ondate||timestamp) from referencecatalogs where catalog = 'branch' and ondate <= ? group by elementid) current\
                        left join referencecatalogs branches on branches.id = current.id\
                        where branches.action is not 'delete' and branches.description is not null order by branches.name", ondate);
          response.data.forEach(row => {
            var name = depts.filter(dept => dept.key === row.name);
            if (name[0]) row.name = name[0].text;
          });
        } else {
          var months = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль',' Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
          response.data.forEach(row => row.name = months[row.name - 1]);
        }
        return JSON.stringify(response);
      }
      return proxyResData;
    }
  }));
}

module.exports = router;
