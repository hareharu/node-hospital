import React, { useState, useEffect } from 'react';
import Module, { Inline, SaveToExcel, Panel, Table, Button, renderDate, getItems, dateToString } from 'components';
export default function ModuleEIRQueue({...props}) {
  const [itemsQueue, setItemsQueue] = useState([]);
  const [loadingQueue, setLoadingQueue] = useState(false);
  const [selectedQueue, setSelectedQueue] = useState(undefined);
  const [selectedQueueName, setSelectedQueueName] = useState('');
  const [itemsHistory, setItemsHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [panelHistory, setPanelHistory] = useState(false);
  const [reload, forceReload] = useState(true);
  const columnsQueue = [
    { key: '51d2dc9d-3c19-4251-b911-077c52720978', name: 'ФИО', fieldName: 'fio', minWidth: 200, maxWidth: 300,  isResizable: true },
    { key: '61cadf56-16d1-4ac1-8e5b-9b84abbec126', name: 'Д. рожд.', fieldName: 'birthday', onRender: renderDate, minWidth: 80, maxWidth: 80, isResizable: true },
    { key: 'e7091675-6b03-41a4-b1c3-fb5448870f83', name: 'Пол', fieldName: 'sex', minWidth: 40, maxWidth: 40, isResizable: true },
    { key: 'ce1f79c6-aa64-4b98-b513-720430c8b424', name: 'Вид', fieldName: 'type', minWidth: 80, maxWidth: 100,  isResizable: true },
    { key: 'a165563b-a560-47fc-9c44-ea24c5e8a93b', name: 'Дата', fieldName: 'date', onRender: renderDate, minWidth: 80, maxWidth: 80, isResizable: true },
    { key: 'a865319d-729b-48cb-913d-7bbeab9ded4f', name: 'Ожидание', fieldName: 'days', minWidth: 50, maxWidth: 60, isResizable: true },
    { key: 'a973ed98-99af-4458-a29e-197c81976865', name: 'Условие', fieldName: 'type2', minWidth: 100, maxWidth: 200,  isResizable: true },
    { key: '7e91544e-fa2d-40f4-9a2d-7649b6bf3bcd', name: 'Профиль', fieldName: 'prof', minWidth: 80, maxWidth: 150,  isResizable: true },
    { key: 'b24ec1e4-614d-4353-9193-e4b57492f8ac', name: 'Подразделение', fieldName: 'podr', minWidth: 100, maxWidth: 200,  isResizable: true },
  ];
  const columnsHistory = [
    { key: '616fb0a0-ef1c-491c-b5c9-ebeed5370b97', name: 'Дата', fieldName: 'date', minWidth: 80, maxWidth: 80, isResizable: true },
    { key: 'a89391e3-d33c-44b5-9e6d-085306f55b6a', name: 'Статус', fieldName: 'status', minWidth: 120, maxWidth: 220,  isResizable: true },
    { key: 'a23190ae-c9d0-4796-ab9a-a8831f946b7a', name: 'Дата напр.', fieldName: 'n_date', onRender: renderDate, minWidth: 80, maxWidth: 80, isResizable: true },
    { key: '2ea31da6-dc1c-4619-a28e-f2d800c35dd1', name: 'Дата план.', fieldName: 'n_plan', onRender: renderDate, minWidth: 80, maxWidth: 80, isResizable: true },
    { key: 'f24fa21c-e513-4135-ba55-6c3196f8b660', name: 'Дата госп.', fieldName: 'g_date', onRender: renderDate, minWidth: 80, maxWidth: 80, isResizable: true },
    { key: '377e6d1f-5c95-4c2a-8e27-cf7e12e7e8a7', name: 'Условие напр.', fieldName: 'n_usl', minWidth: 100, maxWidth: 200,  isResizable: true },
    { key: 'fa1f301d-6ea8-493a-9aba-8639a4dc6703', name: 'Условие госп.', fieldName: 'g_usl', minWidth: 100, maxWidth: 200,  isResizable: true },
    { key: '0e54ab64-e6b2-441e-a7bb-16d14521434e', name: 'Вид помощи', fieldName: 'g_type', minWidth: 80, maxWidth: 100,  isResizable: true },
    { key: '564e52fb-bdf9-4557-9ce3-682b5f97f7d5', name: 'Причина отказа', fieldName: 'g_ref', minWidth: 100, maxWidth: 200,  isResizable: true },
  ];
  const getHistory = () => {
    setPanelHistory(true);
    getItems('api/eirparser/queue/'+selectedQueue, setItemsHistory, setLoadingHistory);
  }
  const onSelect = (item: any) => {
    setItemsHistory([]);
    if (item) {
      setSelectedQueue(item.key);
      setSelectedQueueName(item.fio + ' ' + dateToString(item.birthday));
    } else {
      setSelectedQueue(undefined);
      setSelectedQueueName('');
    }
  }
  const commands = [
    { key: 'show', name: 'Просмотреть историю', iconProps: { iconName: 'icon-clock' }, onClick: getHistory, disabled: !selectedQueue },
  ];
  useEffect(() => getItems('api/eirparser/queue', setItemsQueue, setLoadingQueue), [reload]);
  return (
    <Module {...props}>
      <Inline>
        <Button icon='refresh-cw' text='Обновить' onClick={() => forceReload(!reload)} primary={true}/>
        <SaveToExcel filename={props.name} sheets={[{ name: 'Направления', items: itemsQueue, columns: columnsQueue }]}/>
      </Inline>
      <Table onSelect={onSelect} items={itemsQueue} commands={commands} columns={columnsQueue} loading={loadingQueue}/>
      <Panel loading={loadingHistory} isOpen={panelHistory} onDismiss={() => setPanelHistory(false)} text={'История направлений и госпитализаций пациента '+selectedQueueName} nopadding={true} size='XL' >
        <Table items={itemsHistory} columns={columnsHistory}/>
      </Panel>
    </Module>
  );
}
  