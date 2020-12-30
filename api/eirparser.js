var router = require('express').Router();
var func = require('../app/func');
var request = require('request');
var parser = require('node-html-parser');

router.get('/queue', func.access('doctor'), (req, res, next) => {
  var url='http://' + process.env.EIR_HOST + ':' + process.env.EIR_PORT + '/csp/healthshare/tfoms/TFOMS.PortalDashboardViewer.cls?DASHBOARD=TFOMS/AdmissionWaitingListDetailDash.dashboard';
  var auth = 'Basic ' + Buffer.from(process.env.EIR_USER + ':' + process.env.EIR_PASS).toString('base64');
  request.get({ url, headers: { 'Authorization': auth } }, (err, resp, body) => {
    var root = parser.parse(body);

    root = root.querySelectorAll('.dsListingTable'); // .dsListingTable .lpt-container
    // console.log(root);
    /*
    var fs = require('fs');
    var jsonContent = root;
    fs.writeFile("json/AdmissionWaitingListDetailDash.json", jsonContent, 'utf8', function (err) {
      if (err) {
        console.log("An error occured while writing JSON Object to File.");
        return console.log(err);
      }
    });
    */
    var list = [];
    var row = [];
    if (!root[1]) return [];
    root[1].childNodes.forEach(tr => {
      if (tr.nodeType === 1) {
        row = [];
        tr.childNodes.forEach(td => {
          if (td.nodeType === 1) {
            row.push(td.childNodes[0].childNodes[0].rawText);
          }
        });
        list.push(row);
      }
    });
    var json = [];
    var color = '';
    list.forEach(row => {
      if (row[16] <= 10) {
        color ='';
      } else if (row[16] <= 20) {
        color ='yellow';
      } else {
        color ='red';
      }
      /*
      00 #
      01 Номер направления
      02 Фамилия
      03 Имя
      04 Отчество
      05 Дата рождения
      06 Пол
      07 Вид госпитализации
      08 Полис ОМС
      09 Телефон
      10 Посмотреть связи
      11 Эл почта
      12 Дата направления
      13 Статус направлени
      14 Дата госпитализации (планируемая)
      15 Дата госпитализации (фактическая)
      16 Ожидание (календарные дни)
      - 17 Ожидание (рабочии дни)
      17 Код МКБ
      18 Профиль
      19 Код СМО
      20 СМО
      21 Субъект РФ застрахованного
      22 Направившее МО
      23 Стационар МО
      24 Идентификатор направления
      25 Условия МП
      26 Код выписавшего медработника
      27 Врачебная специальность
      28 ФИО ЗавОтделением
      - 30 daysWaitingWithoutHoliday
      */
      json.push({
        key: row[10],
        fio: row[2] + ' ' + row[3] + ' ' + row[4],
        birthday: row[5],
        sex: row[6],
        type: row[7],
        date: row[12],
        days: row[16] === '-1' ? 0 : row[16],
        type2: row[25],
        prof: row[18],
        podr: row[22].replaceAll('&quot;', '"'),
        rowcolor: color,
      });
    });
    res.data = json;
    next();
  });
});

router.get('/queue/:patient', func.access('doctor'), (req, res, next) => {
  var url='http://' + process.env.EIR_HOST + ':' + process.env.EIR_PORT + '/csp/healthshare/tfoms/TFOMS.AdmHospConnection.cls?t=a&id=' + req.params.patient;
  var auth = 'Basic ' + Buffer.from(process.env.EIR_USER + ':' + process.env.EIR_PASS).toString('base64');
  request.get({ url, headers: { 'Authorization': auth } }, (err, resp, body) => {
    var root = parser.parse(body);
    root = root.querySelectorAll('.dynamic');
    /*
    var fs = require('fs');
    var jsonContent = root;
    fs.writeFile("json/AdmHospConnection.json", jsonContent, 'utf8', function (err) {
      if (err) {
        console.log("An error occured while writing JSON Object to File.");
        return console.log(err);
      }
    });
    */
    var list = [];
    var row = [];
    /*
    00 Дата_События
    01 H_ИД
    02 Н_Дата
    03 Пл_Дата
    04 Направившее МО
    05 Н_Стационар МО
    06 Н_Условия_МП
    07 Статус
    08 Н_Номер
    09 Н_Серия
    10 Н_Фамилия
    11 Н_Имя
    12 Н_Отчество
    13 Н_ДР
    14 Г_ИД
    15 Г_Дата
    16 Вид помощи
    17 Г_Стационар МО
    18 Г_Условия_МП
    19 Г_Номер
    20 Г_Серия
    21 Г_Фамилия
    22 Г_Имя
    23 Г_Отчество
    24 Г_ДР
    25 Причина отказа
    26 Финансирование
    */
    if (!root[0]) return [];
    root[0].childNodes[3].childNodes.forEach(tr => {
      if (tr.nodeType === 1) {
        row = [];
        tr.childNodes.forEach(td => {
          if (td.nodeType === 1) {
            row.push(td.childNodes[0].rawText.replace('\r\n', ''));
          }
        });
        list.push(row)
      }
    });
    var json = [];
    var rowcolor = '';
    var status = '';
    var row_n = [];
    var row_g = [];
    var date = '';
    list.forEach(row => {
      date = row[0];
      rowcolor = '';
      if (row.length === 27) {
        if (row[1]){
          row_n = {
            n_date: func.stringToDate(row[2]),
            n_plan: func.stringToDate(row[3]),
            n_from: row[4],
            n_mo: row[5],
            n_usl: row[6].toLowerCase(),
            n_status: row[7],        
          };
          status = 'Госпитализирован';
        } else {
          row_n = [];
          status ='Госпитализирован без направления';
        }
        if (row[15]){
          row_g = {
            g_date: func.stringToDate(row[15]),
            g_type: row[16],
            g_mo: row[17],
            g_usl: row[18].toLowerCase(),
            g_ref: row[25],
          };
          if (status ==='Госпитализирован без направления' && row_g.g_type === 'плановый') {
            rowcolor = 'yellow';
          } else {
            status = 'Госпитализирован';
          }
        } else {
          row_g = [];
        }
        if (row_n.n_date && !row_g.g_mo) {
          status = 'Ожидает госпитализации';
          rowcolor = 'red';
        }
      } else {
        if (row.length === 2) {
          status ='Направлен в другое МО';
        } else {
          status ='Госпитализирован в другое МО';
        }
        rowcolor = 'blue';
        row_n = [];
        row_g = [];
      }
      if (row[25] && row[25].trim().length > 0) {
        status ='Отказ';
        rowcolor = '';
        row_g = {
          g_type: row[16],
          g_mo: row[17],
          g_ref: row[25],
        };
      }
      json.push({ ...row_n, ...row_g, status, date, rowcolor });
    });
    res.data = json;
    next();
  });
});

router.get('/log', func.access('admin'), (req, res, next) => {
  const date1 = new Date('12/31/1840');
  const date2 = new Date();
  const diffTime = Math.abs(date2.getTime() - date1.getTime());
  const cachedate = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
  var url='http://' + process.env.EIR_HOST + ':' + process.env.EIR_PORT + '/csp/healthshare/tfoms/TFOMS.PortalDashboardViewer.cls?DASHBOARD=TFOMS/%D0%9C%D0%BE%D0%BD%D0%B8%D1%82%D0%BE%D1%80%D0%B8%D0%BD%D0%B3/TransformationLogLine.dashboard&SETTINGS=FILTER:[DateStart1].[H1].[Date].&['+cachedate+']';
  console.log(url)
  var auth = 'Basic ' + Buffer.from(process.env.EIR_USER + ':' + process.env.EIR_PASS).toString('base64');
  request.get({ url, headers: { 'Authorization': auth } }, (err, resp, body) => {
    var root = parser.parse(body);
    root = root.querySelectorAll('.dsListingTable');
    var list = [];
    var row = [];
    if (!root[1]) return [];
    root[1].childNodes.forEach(tr => {
      if (tr.nodeType === 1) {
        row = [];
        tr.childNodes.forEach(td => {
          if (td.nodeType === 1) {
            row.push(td.childNodes[0].childNodes[0].rawText);
          }
        });
        list.push(row);
      }
    });
    var json = [];
    // var color = '';
    list.forEach(row => {
      json.push({
        row0: row[0],
        row1: row[1],
        row2: row[2],
        row3: row[3],
        row4: row[4],
        row5: row[5],
        row6: row[6],
        row7: row[7],
        row8: row[8],
        row9: row[9],
        row10: row[10],
        row11: row[11],
        row12: row[12],
        row13: row[13],
        row14: row[14],
        row15: row[15],
        row16: row[16],
        row17: row[17],
        row18: row[18],
        row19: row[19],
        row20: row[20],
        row21: row[21],
        row22: row[22],
        row23: row[23],
      });
    });
    res.data = json;
    next();
  });
});

module.exports = router;
