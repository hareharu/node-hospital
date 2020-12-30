var router = require('express').Router();
var func = require('../app/func');
var conn = require('../app/conn');

router.get('/:datefrom/:dateto/:podr/:doc/:pay/:date', func.access('user'), async (req, res, next) => { req.datatype = 'pgsql';

var where  = '';

/*
if($_POST['spec']=='all'){
    $spec=' ';
}else{
    $spec=" s.kod_spec = '".$_POST['spec']."' and ";
}
if($_POST['doc']=='all'){
    $doc=' ';
}else{
    $doc=" p.kod_doc = '".$_POST['doc']."' and ";
}
if($_POST['cel']=='all'){
    $cel=' ';
}else{
    $cel=" a.kod_cel = '".$_POST['cel']."' and ";
}
if($_POST['vid']=='all'){
    $vid=' ';
}else{
    $vid=" p.kod_typpr = '".$_POST['vid']."' and ";
}
if(@$_POST['show']=='true'){
    $show=' ';
}else{
    $show=" d.kod_lpu = 'e12390' and ";
}
if(@$_POST['rpr']=='true'){
$day_select = "a.day_rpr";
}else{
$day_select = "p.day";
}
$request=$spec.$doc.$cel.$vid.$show;
*/

  if (req.params.doc !== func.niluuid()) {
    where += " d.kod_doc = '" + req.params.doc + "' and ";
  }

  where += " d.kod_lpu = '" + await func.getSettings('hospital_kodlpu') + "' and ";

  if (req.params.podr !== func.niluuid()) {
    where +=  " d.kod_plk in ( " + await func.getKodPlkString(req.params.podr) + ") and ";
  }
  var whererf = '';
  if (req.params.pay === '1') {
    whererf += " and rf.sum_accept > 0";
  }
  // var day_select = "a.day_rpr";
  
  req.query = "select p.nz_priem, to_char(a.day_rpr,'YYYY-MM-DD') as day_rpr, to_char(p.day,'YYYY-MM-DD') as day_p, rtrim(p.kod_typpr) as kod_typpr, rtrim(f.mnem_book) as kod_finans, rtrim(p.kod_doc) as kod_doc, \
              rtrim(d.kod_spec) as kod_spec, rtrim(a.kod_cel) as kod_cel, to_char(h.day,'YYYY-MM-DD') as day, trim(t2.kod_esvs) as typ_town, rtrim(b.mnem_book) as kod_cel2, \
              sw.fam||' '||substring(sw.nam from 1 for 1)||'.'||substring(sw.oth from 1 for 1)||'. ' as doc_name, rtrim(s.spec) as spec_name, \
              (select max(mkb) from diagn where nz_priem = p.nz_priem) as mkbp, \
              (select max(diagn.mkb) from diagn join priem on priem.nz_priem = diagn.nz_priem where priem.nz_am_tln = p.nz_am_tln) as mkba \
              from ((\
                select nz_priem from priem\
                left join am_talon on am_talon.nz_am_tln = priem.nz_am_tln\
                left join s_book on s_book.kod_book = am_talon.kod_cel\
                left join am_rf rf on rf.nz_amrf = (select nz_amrf from am_rf where am_rf.nz_am_tln = am_talon.nz_am_tln and am_rf.sum_accept > 0 order by am_rf.day limit 1)\
                where s_book.typ_book <> 9 " +whererf+ " and am_talon.day_rpr between  $1 and $2\
              ) union all (\
                select nz_priem from priem\
                left join am_talon on am_talon.nz_am_tln = priem.nz_am_tln\
                left join rddu on rddu.nz_action = priem.nz_priem  \
                left join ddu on rddu.nz_ddu = ddu.nz_ddu \
                left join rf_rec rf on rf.nz_rfrec = (select nz_rfrec from rf_rec where rf_rec.nz_table = ddu.nz_ddu and rf_rec.sum_accept > 0 order by rf_rec.nz_table limit 1)\
                left join s_book on s_book.kod_book = am_talon.kod_cel\
                where s_book.typ_book = 9 " +whererf+ " and ddu.day_rpr between  $1 and $2\
              )) pp \
              left join priem p on p.nz_priem = pp.nz_priem\
              left join paspor h ON h.kod = p.kod \
              left join am_talon a ON a.nz_am_tln = p.nz_am_tln \
              left join s_wrach d ON d.kod_doc = p.kod_doc \
              left join sw_man sw on sw.kod_wman = d.kod_wman \
              left join s_spec s ON s.kod_spec = d.kod_spec \
              left join s_town t ON t.kod_town = h.kod_town \
              left join s_book t2 on t2.kod_book = t.typ_town and t2.book = 'НАС ПУНКТЫ' \
              left join s_book f on f.kod_book = a.kod_finans and f.book = 'ФИНАНС' \
              left join s_book b ON a.kod_cel = b.kod_book and b.book = 'ЦЕЛЬ' \
              where " + where + " rtrim(f.mnem_book) in ('01', '02', '03', '04') \
              order by s.spec, s.kod_spec, sw.fam, d.kod_doc";
             // console.log(req.query)
  conn.pgsql
  .any(req.query, [req.params.datefrom + ' 00:00:00', req.params.dateto + ' 23:59:59'])
  .then(data => {
    // var cel_zab = [30,258,80,313,20,114,310,312,311,115,110,254,256,10,111,113,61,317,318,319,323,322,321,324];
    // var cel_pro = [325,225,35,223,220,226,21,50,234,117,116,42,252,238,118,239,235,233,236,241,232,230,231,40,70,119,210,211,212,257,213,221,224,222,32,36,33,34,62,253,31,251,41,255,60,314,315];
    var typpr_hos = ['_26P0Q50A4','_26P0Q50A5','_2G80Z21GG','_2UO0YQJPY','_2UO0YQJPZ','_2ZH1143M8','_44L0LOQER','_44L0LOQES','_4XY0YR1MC','_26P0Q509V'];
    var typpr_dom = ['_26P0Q509W','_26P0Q50A6','_26P0Q50AC','_26P0Q509Z'];
    var typpr_ds = ['_26P0Q509Y','_26P0Q509X'];
    var typpr_pro = ['_26P0Q50A1','_26P0Q50A8','_26P0Q50A9','_44L0LOQEQ','_26P0Q50A0','_4XY0YR1MD'];

    var split = true;
    var output = '';

    var col = func.fillArray(0, 22);
    var sum = func.fillArray(0, 22);
    var spec = func.fillArray(0, 22);

    for (var row in data) {
      var day_p = data[row].day_p;
      // var kod_cel =data[row].kod_cel;
      // var kod_cel2 =  parseInt(data[row].kod_cel2);
      var kod_finans = data[row].kod_finans;
      var kod_typpr = data[row].kod_typpr;
      var kod_doc = data[row].kod_doc;
      var kod_spec = data[row].kod_spec;
      var day = data[row].day;
      var town = data[row].typ_town;

      var mkb;
      
      if (data[row].mkbp) {
        mkb = data[row].mkbp;
      } else if (data[row].mkba) {
        mkb = data[row].mkba;
      } else {
        mkb = 'NULL';
        console.log(data[row].nz_priem + ' mkb is null!');
      }


      var age = func.calculateAge(day,day_p);

      var c_hos = false;
      var c_dom = false;
      var c_zab = false;
      var c_pro = false;
      var c_1 = false;
      var c_17 = false;
      var c_60 = false;
      var c_der = false;
      var c_oms = false;
      var c_bud = false;
      var c_pla = false;
      var c_dms = false;

      if (mkb.substr(0, 1) === 'Z') {
        c_pro = true;
      } else {
        c_zab = true;
      }

      if (typpr_hos.includes(kod_typpr)) { c_hos = true; }
      if (typpr_ds.includes(kod_typpr)) { c_hos = true; }
      if (typpr_pro.includes(kod_typpr)) { c_hos = true; }
      if (typpr_dom.includes(kod_typpr)) { c_dom = true; }
      // if (cel_zab.includes(kod_cel2)) { c_zab = true; }
      // if (cel_pro.includes(kod_cel2)) { c_pro = true; }
      if (age <= 1) { c_1 = true; }
      if (age <= 17) { c_17 = true; }
      if (age >= 60) { c_60 = true; }
      if (town !== '8') { c_der = true; }
      if (kod_finans === '01') { c_oms = true; }
      if (kod_finans === '02') { c_bud = true; }
      if (kod_finans === '04') { c_pla = true; }
      if (kod_finans === '03') { c_dms = true; }

      col[2] += 1;
      if (c_hos) {
          col[3] += 1;
          if (c_der) { col[4] += 1; }
          if (c_17) { col[5] += 1; }
          if (c_60) { col[6] += 1; }
          if (c_zab){
              col[7] += 1;
              if (c_17) { col[8] += 1; }
              if (c_60) { col[9] += 1; }
          }
          if (c_pro) { col[10] += 1; } // профы в поликлинике
      }
      // if (c_pro) { col[10]+=1; } // профы все
      if (c_dom) {
          col[11] += 1;
          if (c_zab) {
              col[12] += 1;
              if (c_17) { col[13] += 1; }
              if (c_1) { col[14] += 1; }
              if (c_60) { col[15] += 1; }
          }
          if (c_pro) {
              if (c_17) { col[16] += 1; }
              if (c_1) { col[17] += 1; }
          }
      }
      if (c_oms) { col[18] += 1; }
      if (c_bud) { col[19] += 1; }
      if (c_pla) { col[20] += 1; }
      if (c_dms) { col[21] += 1; }

      var current_doc = kod_doc;
      var current_spec = kod_spec;
      var next_row = parseInt(row) + 1
      if (data[next_row]) {
        kod_doc = data[next_row].kod_doc;
        kod_spec = data[next_row].kod_spec;
      } else {
        var end = true
      }

      if (end || current_doc !== kod_doc) {
        if (split) {
          current_doc = data[row].doc_name;
          output += '<tr><td align="left" class="toleft">' + current_doc + '</td>';
          for (var i = 2; i <= 21; i++) {
            output += '<td>' + col[i] + '</td>';
          }
          output += '</tr>';
        }
        for (i = 2; i <= 21; i++) {
          spec[i] += col[i];
        }
        
        if (end || current_spec !== kod_spec) {   
          if (split) {
            output += '<tr style="font-weight:bold;">';
          } else {
            output += '<tr>';
          }
          current_spec = data[row].spec_name;
          output += '<td align="left" class="toleft">' + current_spec + '</td>';
          for (i = 2; i <= 21; i++) {
            output += '<td>' + spec[i] + '</td>';
          }
          output += '</tr>';
          spec = func.fillArray(0, 22);
        }

        for (i = 2; i <= 21; i++) {
          sum[i] += col[i];
        }
        col = func.fillArray(0, 22);
      }
    }

    var table = '<table border="1"> \
                <thead align="center"> \
                  <tr style="font-weight:bold;"> \
                    <td rowspan="3">';
    if (split) { table += 'ФИО / '; }
    table += 'Врачебная должность</td> \
              <td rowspan="3">Всего посещений</td> \
              <td colspan="2">Число посещений в поликлинике</td> \
              <td colspan="2">В т.ч. в возрасте (из гр.3)</td> \
              <td colspan="3">Из общего числа посещений по поводу заболеваний</td> \
              <td rowspan="3">Профилак- тических посещений</td> \
              <td rowspan="3">Число посещений на дому</td> \
              <td colspan="6">Из общего числа посещений на дому</td> \
              <td colspan="4">Число посещений по видам оплаты</td> \
            </tr> \
            <tr style="font-weight:bold;"> \
              <td rowspan="2">всего</td> \
              <td rowspan="2">из них сельских жителей</td> \
              <td rowspan="2">0-17 лет</td> \
              <td rowspan="2">старше 60 лет</td> \
              <td rowspan="2">всего</td> \
              <td colspan="2">в т.ч. в возрасте</td> \
              <td colspan="4">по поводу заболеваний</td> \
              <td colspan="2">из числа профилактических</td> \
              <td rowspan="2">ОМС</td> \
              <td rowspan="2">бюджет</td> \
              <td rowspan="2">платные</td> \
              <td rowspan="2">ДМС</td> \
            </tr> \
            <tr style="font-weight:bold;"> \
              <td>0-17 лет</td> \
              <td>старше 60 лет</td> \
              <td>всего</td> \
              <td>0-17 лет</td> \
              <td>из них 0-1 года</td> \
              <td>старше 60 лет</td> \
              <td>0-17 лет</td> \
              <td>из них 0-1 года</td> \
            </tr> \
            <tr style="font-weight:bold;"> \
              <th>1</th>';
    for (i = 2; i <= 21; i++) {
      table += '<th width="4%">' + i + '</th>';
    }
    table += '</tr> \
              </thead> \
              <tbody align="right">' + output + '</tbody> \
              <tfoot align="right"> \
                <tr style="font-weight:bold;"> \
                  <td align="left">Итого</td>';
    for (i = 2; i <= 21; i++) {
      table += '<td>' + sum[i] + '</td>';
    }
    table += '</tr> \
              </tfoot> \
              </table>';

    res.send(table);
  })
  .catch(next);
});

module.exports = router;
