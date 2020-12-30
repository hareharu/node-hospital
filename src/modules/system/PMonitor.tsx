import React, { useState, useEffect } from 'react';
import Module, { Hide, Text, Table, Inline, TabsLinks, TabsContainer, TextLog, renderDateTime, renderExpired, renderNull, Button, renderUptime, renderRAM, renderCPU, getItems, getActiveModule, callAPI, isLogged, getText } from 'components';
export default function ModulePMonitor({...props}) {
  const [apps, setApps] = useState({ info: { ver: '', env: '', mem: 0, cpu: 0 }, apps: [] });
  const [itemsUsers, setItemsUsers] = useState([]);
  const [out, setOut] = useState({ out: [], api: []});
  const [loading] = useState(false); // 'Попытка восстановить связь с сервером...'
  const [tabIndex, setTabIndex] = useState(0);
  const [error, setError] = useState(undefined);
  const columnsApps = [
    { key: 'b375b9ec-9d4e-4959-90f9-799412a2007d', name: 'PID', fieldName: 'pid', minWidth: 70, maxWidth: 70,  isResizable: true },
    { key: '6411934e-c207-407b-9341-57541dab3bf4', name: 'Статус', fieldName: 'status', minWidth: 150, maxWidth: 200,  isResizable: true },
    { key: 'bc959984-161d-4fbc-9745-0bc2eebe92ca', name: 'Время работы', fieldName: 'pm_uptime', minWidth: 100, maxWidth: 150,  isResizable: true, onRender: renderUptime },
    { key: '3578a6e2-a046-4dbc-b8b7-8d5c8a7034d5', name: 'Перезапусков', fieldName: 'restart_time', minWidth: 50, maxWidth: 100,  isResizable: true },
    { key: 'b3398591-f4a7-4b1a-8293-e82b1d807229', name: 'Сбоев', fieldName: 'unstable_restarts', minWidth: 50, maxWidth: 100,  isResizable: true },
    { key: '56a0849c-b27b-4759-98ef-758e733c3199', name: 'Память', fieldName: 'memory', minWidth: 100, maxWidth: 150,  isResizable: true, onRender: renderRAM },
    { key: '256e3307-4f71-49fa-9497-78cb0c67b9b0', name: 'ЦП', fieldName: 'cpu', minWidth: 100, maxWidth: 150,  isResizable: true, onRender: renderCPU },
  ];
  const columnsUsers = [
    { key: '310d6f76-14e0-49c8-889a-99f1d4e1d57b', name: 'Клиент', fieldName: 'ip', minWidth: 100, maxWidth: 100,  isResizable: true },
    { key: '1daef3fb-89bc-469f-9c7b-1cf5f3c8f2a4', name: 'Версия', fieldName: 'client', minWidth: 70, maxWidth: 70,  isResizable: true },
    { key: 'f9199e0c-d35f-4c8c-814d-454b4e418367', name: 'Сборка', fieldName: 'build', minWidth: 120, maxWidth: 120,  isResizable: true },
    { key: 'b8ca0287-b81e-4b85-aa1f-0bd63a6ac652', name: 'Пользователь', fieldName: 'user', minWidth: 100, maxWidth: 150,  isResizable: true, isSorted: true },
    { key: '3e368673-0d21-4cc7-945f-3c1e9a9b0ce9', name: 'Роль', fieldName: 'role', minWidth: 100, maxWidth: 150,  isResizable: true, onRender: renderNull },
    { key: '6530d541-7fb6-41c5-b366-800454b09854', name: 'Доступ', fieldName: 'accessname', minWidth: 100, maxWidth: 150,  isResizable: true, onRender: renderNull },
    { key: '24cbf47d-54ff-4440-b7fb-7be991280b62', name: 'Модуль', fieldName: 'module', minWidth: 150, maxWidth: 200,  isResizable: true, onRender: renderNull },
    { key: '70cc0881-09d2-40f2-a87b-0fb53c841c58', name: 'До отключения', fieldName: 'expired', minWidth: 100, maxWidth: 100,  isResizable: true, onRender: renderExpired },
  ];
  const columnsOutputAPI = [
    { key: '0f3cf960-be03-4a2a-be9e-97292437a5e3', name: 'Дата и время', fieldName: 'date_time', minWidth: 120, maxWidth: 130,  isResizable: true, onRender: renderDateTime, isSorted: true, isSortedDescending: true},
    { key: '848e8485-146e-4fe5-a25e-c67e746da45d', name: 'Клиент', fieldName: 'ip', minWidth: 100, maxWidth: 100,  isResizable: true },
    { key: '6f801374-e140-48a0-b5eb-14dc751b37e6', name: 'Пользователь', fieldName: 'user', minWidth: 100, maxWidth: 150,  isResizable: true },
    { key: '4cd27878-29cf-491d-951f-dde66d85ff93', name: 'Метод', fieldName: 'method', minWidth: 70, maxWidth: 70,  isResizable: true },
    { key: 'f6b26580-2a7c-4309-8445-d838cb000273', name: 'URL', fieldName: 'url', minWidth: 300, maxWidth: 600,  isResizable: true },
    { key: '8d9e23fd-9107-41e4-8b2b-024204439cb4', name: 'Статус', fieldName: 'status', minWidth: 70, maxWidth: 70,  isResizable: true, onRender: renderNull },
    { key: '335ed032-004c-4ada-9217-03d58ef62d4e', name: 'Размер, байт', fieldName: 'content_length', minWidth: 100, maxWidth: 100,  isResizable: true, onRender: renderNull },
    { key: '774b1855-1059-4a2d-b812-c7251b6cf7d4', name: 'Время, мс', fieldName: 'response_time', minWidth: 100, maxWidth: 100,  isResizable: true, onRender: renderNull },
  ];
  const columnsOutput = [
    { key: '2367117c-14a6-47b1-a9f4-58079c0b78b3', name: 'Дата и время', fieldName: 'date_time', minWidth: 120, maxWidth: 130,  isResizable: true, onRender: renderDateTime, isSorted: true, isSortedDescending: true },
    { key: 'ef19d879-4e02-4e67-bf3f-f9214452d4e0', name: 'Сообщение', fieldName: 'msg', minWidth: 300, maxWidth: 600,  isResizable: true },
  ];
  const getData = () => {
    getItems('api/pmonitor/users', setItemsUsers);
    getItems('api/pmonitor/apps', setApps);
    getItems('api/pmonitor/output', setOut);
    getText('api/pmonitor/log/error', setError);
  }
  useEffect(() => getData(), []);
  useEffect(() => {
    let timer1 = setInterval(() => {
      if (isLogged() && getActiveModule() === props.moduleKey) getData();
    }, 5000);
    return () => clearTimeout(timer1);
  }, [props.moduleKey]);
  return (
    <Module {...props} info='В данный момент перезагрузапуск не всегда отрабатывает корректно - могут перезапуститься не все экземпляры приложения'>
      <Inline>
        <Button icon='repeat' text='Перезапустить' disabled={apps.apps.length === 0} onClick={() => callAPI('api/pmonitor/pm2reload', 'Серверу успешно отправлен сигнал на перезапуск. Перезапуск будет начат через несколько секунд.')}/>
        <Button icon='trash' text='Удалить истекшие сессии' onClick={() => callAPI('api/pmonitor/clean','Сессии с истекшим сроком действия были удалены.')}/>
        <Text size='XL' text={'Версия сервера: '+apps.info.ver+' '+apps.info.env.substring(0, 3).toUpperCase()}/>
        <Hide condition={apps.apps.length === 0}>
          <Text size='XL' text={'Использование ресурсов: '+Math.round(apps.info.mem/1024/1024)+' МБ / '+Math.round(apps.info.cpu)+' %'}/>
        </Hide>
      </Inline>
      <Hide condition={apps.apps.length === 0}>
        <Table rows={apps.apps.length} items={apps.apps} columns={columnsApps} loading={loading} sorting={false}/>
      </Hide>
      <TabsLinks links={['Сессии', 'Запросы', 'Вывод', 'Ошибки']} onClick={(value) => setTabIndex(value)} tabIndex={tabIndex}/>
      <TabsContainer tabIndex={tabIndex}>
        <Table items={itemsUsers} columns={columnsUsers} loading={loading}/>
        <Table items={out.api} columns={columnsOutputAPI} loading={loading}/>
        <Table items={out.out} columns={columnsOutput} loading={loading}/>
        <TextLog text={error}/>
      </TabsContainer>
    </Module>
  );
}
