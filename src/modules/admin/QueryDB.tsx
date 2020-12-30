import React, { useState, useEffect } from 'react';
import Module, { SaveToExcel, Columns, Column, Tab, TextField, Dropdown, showMessage, TabsLinks, TabsContainer, Table, getItems, CodeEditor, getItemsPost, openDialog, callAPI, callAPIPost, uuid } from 'components';

interface IQuery {
  id: string;
  name: string;
}

export default function ModuleQueryDB({...props}) {
  const [codeLive, setCodeLive] = useState('');

  const [dbLive, setDbLive] = useState('who');

  const [query, setQuery] = useState<string|undefined>(undefined);
 
  const [itemsQueries, setItemsQueries] = useState<IQuery[]>([]);
  const [selectedQuery, setSelectedQuery] = useState<IQuery|undefined>(undefined);
  const [reloadQueries, forceReloadQueries] = useState(false);
  const [loadingQueries, setLoadinQueries] = useState(false);

  const [itemsResult, setItemsResult] = useState([]);
  const [columnsResult, setColumnsResult] = useState([]);
  const [loadingResult, setLoadinResult] = useState(false);
  const [messageResult, setMessageResult] = useState('');

  const [filterQueries, setFilterQueries] = useState('');
  const [queryName, setQueryName] = useState('');
  
  const [tabIndex, setTabIndex] = useState(0);

  useEffect(() => getItems('api/query/queries/'+dbLive, setItemsQueries, setLoadinQueries), [dbLive, reloadQueries]);

  const onSelectQuery = (item: IQuery | undefined) => setSelectedQuery(item);
  // const onSaveQuery = () => callAPIPost('api/query/save/'+(selectedQuery && selectedQuery.id), {query: codeLive, name: queryName}, undefined, () => forceReloadQueries(!reloadQueries));
  const onDeleteQuery = () => openDialog('Удаление', 'Запрос "'+(selectedQuery && selectedQuery.name)+'" будет удален.', () => callAPI('api/query/delete/'+(selectedQuery && selectedQuery.id), undefined, () => forceReloadQueries(!reloadQueries)));
  
  // const runQuery = () => callAPIPost('api/query/run', {query: codeLive, params: []}, undefined, () => {});

  const newQuery = () => {
    if (codeLive.length > 0) {
      openDialog('Новый запрос', 'Несохраненные данные будут потеряны.', onNewQuery);
    } else {
      onNewQuery();
    }
  }

  const onRenameQuery = () => {
    openDialog('Имя запроса', 'Переименовать запрос "'+(selectedQuery && selectedQuery.name), (value) => callAPIPost('api/query/rename/'+(selectedQuery && selectedQuery.id), { name: value }, undefined, () => {
      forceReloadQueries(!reloadQueries);
      if (selectedQuery && selectedQuery.id === query) setQueryName(value);
    }), 'input', selectedQuery && selectedQuery.name);
  }
  
  const onNewQuery = () => {
    setQuery(undefined);
    setQueryName('');
    setCodeLive('');
  }

  const saveQuery = () => {
    if (!query) {
      
      openDialog('Имя запроса', 'Введите имя для нового запроса', (value) => {
        var newuuid = uuid();
        callAPIPost('api/query/new/'+newuuid, {query: codeLive, name: value, db: dbLive}, undefined, () => {
          forceReloadQueries(!reloadQueries);
          setQuery(newuuid);
          setQueryName(value);
          
        });
      
      }, 'input', 'Новый запрос');
 

     ;
    } else {
      callAPIPost('api/query/save/'+query, {query: codeLive, name: queryName, db: dbLive}, undefined, () => forceReloadQueries(!reloadQueries));
    }
  }

  const runQuery = () => getItemsPost('api/query/run/'+dbLive, {query: codeLive, params: []}, (data) => {
    if (data.result > 0) {
      setItemsResult(data.items);
      setColumnsResult(data.columns);
      setMessageResult('');
    } else {
      setItemsResult([]);
      setColumnsResult([]);
      setMessageResult(data.result === 0 ? 'По запросу ничего не найдено' : data.message);
    }
  }, setLoadinResult);

  const onLoadQuery = (value: string) => {
    fetch('/api/query/query/'+value,{credentials: 'same-origin'})
    .then(response => { 
      if (!response.ok) {
        throw Error(response.statusText);
      }
      return response.json();
    })
    .then(json => {
      if (json.status !== 'ok') {
        throw Error(json.message);
      }
      setCodeLive(json.data);
      setQuery(selectedQuery ? selectedQuery.id : '');
      setQueryName(selectedQuery ? selectedQuery.name : '');
    })
    .catch(error => {
      setCodeLive('');
      setQueryName('');
      setQuery(undefined);
      showMessage(error.toString());
    });
  };

  const commandsResult = [
    {
      key:"save",
      onRender:() => <SaveToExcel disabled={itemsResult.length === 0} filename={queryName} sheets={[ { name: queryName, items: itemsResult, columns: columnsResult } ]} text='Сохранить в Excel' incommandbar={true}/>
    },
    { disabled: itemsResult.length === 0, key: 'refresh', name: 'Обновить', iconProps: { iconName: 'icon-refresh-cw' }, onClick: ()=>{} },
    { disabled: itemsResult.length === 0, key: 'delete', name: 'Закрыть', iconProps: { iconName: 'icon-x' }, onClick: ()=>{} },
  ];

  const commandsQuery = [
    {
      key:"db",
      onRender:() => <Dropdown
                        onChange={setDbLive}
                        defaultValue={dbLive}
                        options={[
                          {key:'who', text: 'веб-Госпиталь'},
                          {key:'pgh', text: 'МИС Госпиталь'},
                          {key:'rst', text: 'ИС Стационар'},
                          {key:'fpr', text: 'Обработчик реестров'},
                        ]}
                      />
    },
    { disabled: codeLive.length === 0, key: 'run', name: 'Выполнить', iconProps: { iconName: 'icon-zap' }, onClick: runQuery },
    { disabled: codeLive.length === 0, key: 'save', name: 'Сохранить', iconProps: { iconName: 'icon-save' }, onClick: saveQuery },
    { key: 'new', name: 'Новый запрос', iconProps: { iconName: 'icon-file' }, onClick: newQuery },
  ];

  const commandsQueries = [
    { disabled: !selectedQuery, key: 'load', name: 'Загрузить', iconProps: { iconName: 'icon-corner-up-left' }, onClick: ()=>onLoadQuery(selectedQuery ? selectedQuery.id : '') },
    // { disabled: !selectedQuery, key: 'save', name: 'Сохранить', iconProps: { iconName: 'icon-save' }, onClick: onSaveQuery },
    { disabled: !selectedQuery, key: 'rename', name: 'Переименовать', iconProps: { iconName: 'icon-edit-2' }, onClick: onRenameQuery },
    { disabled: !selectedQuery, key: 'delete', name: 'Удалить', iconProps: { iconName: 'icon-trash' }, onClick: onDeleteQuery },
    { key: 'refresh', name: 'Обновить', iconProps: { iconName: 'icon-refresh-cw' }, onClick: () => forceReloadQueries(!reloadQueries) },
  ];
  const commandsRightQueries = [
    {
      key:"search",
      onRender:() => <TextField underlined={true} placeholder='Поиск' onChange={setFilterQueries} search={true} width={200}/>
    },
  ];
  const columnsQueries = [
    { key: '91da2546-e5d4-4c96-9933-4baf8954e608', name: 'Имя', fieldName: 'name', minWidth: 100, maxWidth: 1000 },
  ];

  return (
    <Module {...props}>
      <Columns width={['50%','50%']}>
        <Column/>
        <TabsLinks links={['Запросы', 'Переменные', 'Параметры']} onClick={setTabIndex} tabIndex={tabIndex}/>
      </Columns>
      <Columns width={['50%','50%']} >
        <Column>
          <CodeEditor code={codeLive} commands={commandsQuery} onChange={setCodeLive}/>
        </Column>
        <Column>
          <TabsContainer tabIndex={tabIndex}>
            <Table hideHeader={true} items={itemsQueries} columns={columnsQueries} loading={loadingQueries} commands={commandsQueries} commandsRight={commandsRightQueries} filter={filterQueries} filterColumn='name' onSelect={onSelectQuery}/>
            <Tab/>
            <Tab/>
          </TabsContainer>
        </Column>
      </Columns>
      <Table items={itemsResult} columns={columnsResult} loading={loadingResult} commands={commandsResult} message={messageResult}/>
    </Module>
  );
}
