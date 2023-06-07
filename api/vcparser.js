var router = require('express').Router();
var func = require('../app/func');
var request = require('request');
var parser = require('node-html-parser');

var getVideo = (tr, vcs, all, filter) => {
  if (tr.tagName && tr.tagName === 'tr') {
    if (tr.classNames && tr.classNames[0] === 'current') {
      tr.childNodes.forEach(td => {
        if (td.tagName && td.tagName === 'td') {
          if (td.classNames) {
            try {
              switch (td.classNames[0]) {
                case 'tech': vcs.tech = td.childNodes[0].rawText; break;
                case 'time': vcs.time = td.childNodes[0].rawText; break;
                case 'theme': vcs.theme = td.childNodes[0].rawText; break;
                case 'table-link':
                  vcs.link = td.childNodes[1].rawText;
                  var link = td.childNodes.find((childNode) => childNode.tagName === 'a');
                  if (link) vcs.linkurl = link.rawAttrs.replace('href="', '').replace('"', '');
                  break;
                default: vcs.mo = td.childNodes[0].rawText;
              }
            } catch { }
          }
        }
      });
    } else {
      vcs.list = 0;
      vcs.listtip = "";
      vcs.include = false;
      if (all === 'all') vcs.rowcolor = 'red';
      tr.childNodes.forEach(td => {
        if (td.tagName && td.tagName === 'td') {
          td.childNodes.forEach(tddata => {
            if (tddata.nodeType === 3) {
              if (tddata.rawText.length > 5) {
                vcs.list += tddata.rawText.split(',').length;
                vcs.listtip += tddata.rawText;
                if (tddata.rawText.toLowerCase().indexOf(filter.toLowerCase()) !== -1) { 
                  if (all === 'all') vcs.rowcolor = 'green';
                  vcs.include = true;
                }
              }
            }
          });
        }
      });
    }
  }
  return vcs;
}

router.get('/list', func.access('guest'), (req, res, next) => {
  var url='https://www.kmiac.ru/video/';
  request.get({ url }, (err, resp, body) => {
    var root = parser.parse(body);
    root = root.querySelector('html');
    var list = [];
    var group = '';
    try {
      if (!root.childNodes) return res.json({ status: 'ok', data: list });
    } catch {
      return res.json({ status: 'ok', data: list });
    }
    root.childNodes.forEach(conf => {
      if (conf.tagName && conf.tagName === 'tbody') {
        var vcs = { rowgroup: group };
        conf.childNodes.forEach(tr => vcs = getVideo(tr, vcs, 'filter', ''));
        list.push(vcs);
      }
      if (conf.classNames && conf.classNames[0] === 'video-conf__day') {
        conf.childNodes.forEach(element => {
          if (element.classNames) {
            if (element.classNames[0] === 'video-conf__day-title') {
              group = element.childNodes[0].rawText;
            }
            if (element.classNames[0] === 'video-conf__day-table-wrap') {
              element.childNodes.forEach(node => {
                if (node.classNames && node.classNames[0] === 'video-conf__day-table') {
                  node.childNodes.forEach(table => {
                    if (table.tagName && table.tagName === 'tbody') {
                      var vcs = { rowgroup: group };
                      table.childNodes.forEach(tr => vcs = getVideo(tr, vcs, 'filter', ''));
                      list.push(vcs);
                    }
                  });
                }
              });
            }
          }
        });
      }
    });
    res.json({ status: 'ok', data: list });
  });
});

router.post('/video/:all?', func.access('guest'), (req, res, next) => {
  var url='https://www.kmiac.ru/video/';
  request.get({ url }, (err, resp, body) => {
    var root = parser.parse(body);
    root = root.querySelector('html');
    var list = [];
    var group = '';
    if (!root.childNodes) return res.json({ status: 'ok', data: list });
    root.childNodes.forEach(conf => {
      if (conf.tagName && conf.tagName === 'tbody') {
        var vcs = { rowgroup: group };
        conf.childNodes.forEach(tr => vcs = getVideo(tr, vcs, req.params.all, req.body.filter));
        if (vcs.include || req.params.all === 'all') list.push(vcs);
      }
      if (conf.classNames && conf.classNames[0] === 'video-conf__day') {
        conf.childNodes.forEach(element => {
          if (element.classNames) {
            if (element.classNames[0] === 'video-conf__day-title') {
              group = element.childNodes[0].rawText;
            }
            if (element.classNames[0] === 'video-conf__day-table-wrap') {
              element.childNodes.forEach(node => {
                if (node.classNames && node.classNames[0] === 'video-conf__day-table') {
                  node.childNodes.forEach(table => {
                    if (table.tagName && table.tagName === 'tbody') {
                      var vcs = { rowgroup: group };
                      table.childNodes.forEach(tr => vcs = getVideo(tr, vcs, req.params.all, req.body.filter));
                      if (vcs.include || req.params.all === 'all') list.push(vcs);
                    }
                  });
                }
              });
            }
          }
        });
      }
    });
    res.json({ status: 'ok', data: list });
  });
});

module.exports = router;
