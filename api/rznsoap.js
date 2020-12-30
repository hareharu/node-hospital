var router = require('express').Router();
var func = require('../app/func');
var conn = require('../app/conn');

router.post('/:method', func.access('doctor'), (req, res, next) => {
  var url = 'http://' + process.env.RZN_HOST + ':' + process.env.RZN_PORT + '/ws/v2/' + (req.params.method === 'actual' ? 'Actual' : '') + 'ReestrOfInsuredPopulation?WSDL';
  var soap = require('soap');
  var birthdate, documenttype;
  if (req.body.birthDate && req.body.birthDate.length === 10) {
    birthdate = req.body.birthDate;
  }
  if (req.body.documentNumber && req.body.documentNumber.length > 0) {
    documenttype = req.body.documentTypeId;
  }
  var args = {
    person: {
      virtualId: 1,
      surname: req.body.surname,
      name: req.body.name,
      patronymic: req.body.patronymic,
      birthDate: birthdate,
      documentTypeId: documenttype,
      documentSerial: req.body.documentSerial,
      documentNumber: req.body.documentNumber,
      SNILS: req.body.SNILS,
      enp: req.body.enp,
    },
  };
  soap.createClient(url, (err, client) => {
    // console.log(client)
    try {
      var header = '<soap:Security><UsernameToken><Username>' + process.env.RZN_USER + '</Username><Password>' + process.env.RZN_PASS + '</Password></UsernameToken></soap:Security>';
      if (!client) {
        res.data = { errorType: 'Неполадки с сервисом РЗН', errorText: 'Не удалось подключиться к серверу'} ;
        return res.json({ status: 'ok', data: res.data });
      }
      client.addSoapHeader(header);
      client.find(args, async (err, response) => {
        // console.log(response);
        var result = {};
        result.patients = [];
        if (response) {
          // console.log(response)
          if (response['personResult'] && response['personResult'][0]) {
            for (var index in response['personResult']) {
              var patient = {};
              patient = response['personResult'][index];
              var tempstring;
              if (patient.documentList) {
                for (var document in  patient.documentList.document) {
                  switch (patient.documentList.document[document].type) { // select docum from docum where doctype = $1
                    case 14: tempstring = 'Паспорт гражданина РФ'; break
                    case 3: tempstring = 'Свидетельство о рождении'; break
                    default: tempstring = 'Иной дукумент';
                  }
                  patient.documentList.document[document].type = tempstring;
                }
              }
              if (patient.insuranceList) {
                for (var insurance in  patient.insuranceList.insurance) {
                  switch (patient.insuranceList.insurance[insurance].validationDocumentType) {
                    case 1: tempstring = 'Полис старого образца'; break
                    case 2: tempstring = 'Временное свидетельство'; break
                    case 3: tempstring = 'Полис единого образца'; break
                    default: tempstring = 'Полис';
                  }
                  patient.insuranceList.insurance[insurance].validationDocumentType = tempstring;
                  var test = await conn.whodb.oneSync("select name from sqlite_master where type='table' and lower(name)='smo'");
                  if (test) {
                    var query = "select coalesce(smo_new.smosh||' (ранее '||smo.smosh||')', smo.smosh) as smoname\
                                from smo\
                                left join smo_history on smo_history.idparent = smo.idsmo\
                                left join smo smo_new on smo_new.idsmo = smo_history.idchild\
                                where smo.smocod = ? limit 1";
                    /*
                    var query = "select coalesce(smo_new.name||' (ранее '||smo.name||')', smo.name) as smoname\
                                from smo\
                                left join smo_history on smo_history.name = smo.elementid and smo_history.catalog = 'tfoms_smo_history'\
                                left join smo smo_new on smo_new.elementid = smo_history.description and smo_new.catalog = 'tfoms_smo' \
                                where smo.description = ? and smo.catalog = 'tfoms_smo' limit 1";
                    */
                    var smo = await conn.whodb.getSync(query, patient.insuranceList.insurance[insurance].insuranceOrganization);
                    if (smo) patient.insuranceList.insurance[insurance].insuranceOrganization = smo.smoname;
                  }
                }
              }
              if (patient.attachmentList) {
                for (var attachment in  patient.attachmentList.attachment) {
                  switch (patient.attachmentList.attachment[attachment].type) {
                    case 'У': tempstring = 'Прикреплен условно'; break
                    case 'З': tempstring = 'Прикреплен по заявлению'; break
                    case 'Т': tempstring = 'Прикреплен территориально'; break
                    default: tempstring = '?';
                  }
                  patient.attachmentList.attachment[attachment].type = tempstring;
                }
              }
              if (patient.addressRegList) {
                for (var addressR in  patient.addressRegList.address) {
                  if (patient.addressRegList.address[addressR].houseNumber) { tempstring = 'Д.' + patient.addressRegList.address[addressR].houseNumber; } else { tempstring = ''; }
                  patient.addressRegList.address[addressR].houseNumber = tempstring;
                  if (patient.addressRegList.address[addressR].apartmentNumber) { tempstring = 'К.' + patient.addressRegList.address[addressR].apartmentNumber; } else { tempstring = ''; }
                  patient.addressRegList.address[addressR].apartmentNumber = tempstring;
                }
              }
              if (patient.addressFactList) {
                for (var addressF in  patient.addressFactList.address) {
                  if (patient.addressFactList.address[addressF].houseNumber) { tempstring = 'Д.' + patient.addressFactList.address[addressF].houseNumber; } else { tempstring = ''; }
                  patient.addressFactList.address[addressF].houseNumber = tempstring;
                  if (patient.addressFactList.address[addressF].apartmentNumber) { tempstring = 'К.' + patient.addressFactList.address[addressF].apartmentNumber; } else { tempstring = ''; }
                  patient.addressFactList.address[addressF].apartmentNumber = tempstring;
                }
              }
              result.patients[index] = patient;
            }
          } else {
            // ответ без пациента
            try {
              // console.log(response.toJSON());
              var resp = response.toJSON().body.toString();
              var start = resp.indexOf('<faultstring>');
              var end = resp.indexOf('</faultstring>');
              result.errorText = resp.substring(start+13, end);
              if (result.errorText === 'У записи с виртуальным идентификатором 1 заполненно недостаточно полей для осуществления поиска хотя бы по одной поисковой группе;') {
                result.errorType = 'Недостаточно информации для поиска';
                result.errorText = 'Укажите полис ОМС или дату рождения и ФИО, СНИЛС, или серию и номер документа удостоверяющего личность';
              } else {
                result.errorType = 'Неполадки с сервисом РЗН';
                result.errorText = resp;
              }
            } catch {
              result.errorType = 'Неполадки с сервисом РЗН';
              result.errorText = 'Некорректный ответ от сервера';
            }
          }
        } else {
          // нет ответа
          // console.log(err);
          if (err && (err.errno === 'ETIMEDOUT' || err.code === 'ETIMEDOUT')) {
            result.errorType = 'Неполадки с сервисом РЗН';
            result.errorText = 'Превышено время ожидания ответа';
          } else {
            result.errorType = 'Не удалось найти пациента';
            result.errorText = 'По вашему запросу ничего не найдено';
          }
        }
        res.data = result;
        next();
      });
    } catch(error) {
      // next(error);
      console.log(error)
      res.data = { errorType: 'Неполадки с сервисом РЗН', errorText: 'Произошла ошибка при выполнении запроса'} ;
      return res.json({ status: 'ok', data: res.data });
    }
  });
});

module.exports = router;
