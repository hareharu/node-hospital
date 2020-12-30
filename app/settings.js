var conn = require('./conn');

var settings = {
  hospital_kodlpu: { type: 'input', description: 'Код МО в МИС Госпиталь', default: ''},
  videoarchive_folder: { type: 'input', description: 'Папка с видеороликами для модуля "Архив видеороликов"', default: ''},
  system_clientname: { type: 'input', description: 'Текст отображаемый в заголовке боковой панели', default: 'node-hospital'},
  homepage_shownews: { type: 'toggle', description: 'Отображать новости и объявления на домашней странице', default: 'Нет'},
  homepage_showissues: { type: 'toggle', description: 'Отображать добавление инцидентов на домашней странице', default: 'Нет'},
  system_checkintime: { type: 'number', description: 'Интервал контрольных запросов к серверу', default: '5'},
  system_sessiontime: { type: 'number', description: 'Время жизни сессии в минутах', default: '60'},
  kmiacvideo_filter: { type: 'input', description: 'Фильтр для модуля "Видеоконференции"', default: ''},
  loginform_tip: { type: 'input', description: 'Сообщение на кнопке авторизации', default: ''},
};

var init = async () => {
  var rows = await conn.whodb.allSync("select * from settings");
  for (var key in settings) {
    var row = rows[rows.findIndex(row => row.name === key)]; // eslint-disable-line no-loop-func
    if (!row) await conn.whodb.runSync("insert into settings (name, type, value, description, defaultvalue) values (?, ?, ?, ?, ?)", [key, settings[key].type, settings[key].default, settings[key].description, settings[key].default]);
  }
  rows.forEach(async (row) => {
    if (!settings[row.name]) await conn.whodb.runSync("delete from settings where name = ?", [row.name]);
  });
}

init();
