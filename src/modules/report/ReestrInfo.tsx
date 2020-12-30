import React, { useState, useEffect } from 'react';
import Module, { Button, DatePicker, TabsContainer, TabsLinks, Table, Inline, getItems, getDateString, renderDate, showMessage, callAPI, dateToString, openDialog } from 'components';

export default function ReestrInfo({...props}) {
  const [itemsApp, setItemsApp] = useState<any[]>([]);
  const [itemsUsl, setItemsUsl] = useState<any[]>([]);
  const [itemsDd, setItemsDd] = useState<any[]>([]);
  const [datefrom, setDatefrom] = useState(getDateString('first'));
  const [dateto, setDateto] = useState(getDateString('last'));
  const [loading, setLoading] = useState(false);
  const [tabIndex, setTabIndex] = useState(0);
  const [reload, forceReload] = useState(true);
  const [dateUsl, setDateUsl] = useState(getDateString('today'));
  const columnsApp = [
    { key: 'bd80620f-eb51-4de3-aa73-75790230e071', name: 'Дата учета', fieldName: 'name', onRender: renderDate, minWidth: 100, maxWidth: 120, isResizable: true },
    { key: 'fc87d678-cc46-4109-b6c9-2ed0e9705ae4', name: 'Всего', fieldName: 'app_all', minWidth: 100, maxWidth: 150, isResizable: true },
    { key: '2ba7f618-9eb4-4f1d-b0fc-eab0a23247bf', name: 'Новые', fieldName: 'app_new', minWidth: 100, maxWidth: 150, isResizable: true },
    { key: '80c119cf-032b-4398-99e1-41df7d304a2f', name: 'Отправлены', fieldName: 'app_sent', minWidth: 100, maxWidth: 150, isResizable: true },
    { key: '078be60b-dcd1-443d-ba4c-6f31f46aae1d', name: 'Приняты', fieldName: 'app_ok', minWidth: 100, maxWidth: 150, isResizable: true },
    { key: '70cc477c-89d3-4019-b3ea-7eae79f6ce94', name: 'Отказано', fieldName: 'app_err', minWidth: 100, maxWidth: 150, isResizable: true },
  ];
  const columnsUsl = [
    { key: '41a4fcbc-80a2-4e88-89e7-e890ee56925d', name: 'Дата учета', fieldName: 'name', onRender: renderDate, minWidth: 100, maxWidth: 120, isResizable: true },
    { key: 'ad6a212c-2008-4b4e-b942-1dc59ad054ac', name: 'Всего', fieldName: 'usl_all', minWidth: 100, maxWidth: 150, isResizable: true },
    { key: 'af0fa4ac-b37c-491e-a403-13a460149b75', name: 'Новые', fieldName: 'usl_new', minWidth: 100, maxWidth: 150, isResizable: true },
    { key: '08ca2a7b-a4ed-40e2-ac4c-e834f3964dc3', name: 'Отправлены', fieldName: 'usl_sent', minWidth: 100, maxWidth: 150, isResizable: true },
    { key: '09bc13c0-b7d0-42b8-bfa2-bf7a3e899efb', name: 'Приняты', fieldName: 'usl_ok', minWidth: 100, maxWidth: 150, isResizable: true },
    { key: '13ea21d2-4c46-4279-851c-276eaaed79a3', name: 'Отказано', fieldName: 'usl_err', minWidth: 100, maxWidth: 150, isResizable: true },
  ];
  const columnsDd = [
    { key: '2d806118-415b-4ecd-b7cf-dfcfd857e8ee', name: 'Дата учета', fieldName: 'name', onRender: renderDate, minWidth: 100, maxWidth: 120, isResizable: true },
    { key: '1db706e0-0992-46df-a15b-d0f626c19d66', name: 'Всего', fieldName: 'dd_all', minWidth: 100, maxWidth: 150, isResizable: true },
    { key: '38171071-7263-43f4-8946-36d51df304a9', name: 'Новые', fieldName: 'dd_new', minWidth: 100, maxWidth: 150, isResizable: true },
    { key: '121ad23f-fcde-4073-b760-9c7c24fe8409', name: 'Отправлены', fieldName: 'dd_sent', minWidth: 100, maxWidth: 150, isResizable: true },
    { key: '3286d5f9-5ca0-4c39-a5b9-815d11b3e0d6', name: 'Приняты', fieldName: 'dd_ok', minWidth: 100, maxWidth: 150, isResizable: true },
    { key: '375ac4a7-9a28-4f9e-a4f0-745d43f5493f', name: 'Отказано', fieldName: 'dd_err', minWidth: 100, maxWidth: 150, isResizable: true },
  ];
  useEffect(() => getItems('api/reestr/info/'+datefrom+'/'+dateto, (items) => {
    let newItemsApp: any[] = [];
    let newItemsUsl: any[] = [];
    let newItemsDd: any[] = [];
    items.forEach(item => {
      if (item.app_rowcolor) newItemsApp.push({ ...item, ...{ rowcolor: item.app_rowcolor } });
      if (item.usl_rowcolor) newItemsUsl.push({ ...item, ...{ rowcolor: item.usl_rowcolor } });
      if (item.dd_rowcolor) newItemsDd.push({ ...item, ...{ rowcolor: item.dd_rowcolor } });
    });
    setItemsApp(newItemsApp);
    setItemsUsl(newItemsUsl);
    setItemsDd(newItemsDd);
  }, setLoading), [datefrom, dateto, reload]);
  return (
    <Module {...props} info='Выеделение цветом: желтый - есть новые случаи, синий - есть поданные к оплате, красный - есть отказанные, зеленый - только принятые'>
      <Inline>
        <DatePicker defaultValue={datefrom} onChange={setDatefrom}/>
        <DatePicker defaultValue={dateto} onChange={setDateto}/>
        <Button icon='refresh-cw' text='Обновить' onClick={() => forceReload(!reload)} primary={true}/>
        <DatePicker defaultValue={dateUsl} onChange={setDateUsl}/>
        <Button text='Исправить услуги' onClick={() => callAPI('api/reestr/setkodrlpu/'+dateUsl, undefined, (result) => {
          if (result.rowCount) {
            showMessage(result.rowCount+' направлений в талонах услуг с датой учета '+dateToString(dateUsl)+' успешно исправлено.', 'info');
          } else {
            showMessage('Нет направлений в талонах услуг с датой учета '+dateToString(dateUsl)+'.', 'info');
          }
        })}/>
        <Button text='Перенести ошибки' onClick={() => callAPI('api/reestr/checkerrors/'+dateUsl, undefined, (result) => openDialog('Перенос ошибок', 'Перенести ошибочные записи с датой учета "'+dateToString(dateUsl)+'" на последнее воскресенье месяца? Будет перенесено '+(result[0].re_new + result[0].re_err)+' записей ('+result[0].re_new+' новых и '+result[0].re_err+' отказанных)', () => callAPI('api/reestr/moveerrors/'+dateUsl, undefined, (result) => {
          if (result.rowCount) {
            showMessage(result.rowCount+' случаев случаев с датой учета '+dateToString(dateUsl)+' перенесено.', 'info');
          } else {
            showMessage('Нет ошибок с датой учета '+dateToString(dateUsl)+'.', 'info');
          }
        })))}/>
      </Inline>
      <TabsLinks links={['Поликлиника', 'Диагностические услуги', 'Профосмотры']} onClick={(value) => setTabIndex(value)} tabIndex={tabIndex}/>
      <TabsContainer tabIndex={tabIndex}>
        <Table columns={columnsApp} items={itemsApp} loading={loading} sorting={false} summary='sum'/>
        <Table columns={columnsUsl} items={itemsUsl} loading={loading} sorting={false} summary='sum'/>
        <Table columns={columnsDd} items={itemsDd} loading={loading} sorting={false} summary='sum'/>
      </TabsContainer>
    </Module>
  );
}
