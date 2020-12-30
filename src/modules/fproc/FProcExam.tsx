import React, { useState, useEffect } from 'react';
import Module, { getCookie, Button, Dropdown, Table, SaveToExcel, TabsLinks, TabsContainer, Inline, getItems, niluuid } from 'components';
export default function ModuleFProcExam({...props}) {
  const [itemsAdult, setItemsAdult] = useState([]);
  const [itemsChild, setItemsChild] = useState([]);
  const [year, setYear] = useState((new Date()).getFullYear().toString());
  const [month, setMonth] = useState(getCookie('dept') === niluuid() ? ((new Date()).getMonth() + 1).toString() : 'all');
  const [sender, setSender] = useState('all');
  const [hidepodr, setHidepodr] = useState(true);
  const [loadingAdult, setLoadingAdult] = useState(false);
  const [loadingChild, setLoadingChild] = useState(false);
  const [tabIndex, setTabIndex] = useState(0);
  const [reload, forceReload] = useState(true);
  let name_text = 'Филиал';
  if (sender !== 'all') name_text = 'Месяц';
  let columnsAdult = [
    {key: '2994622e-1915-424f-9002-9056bb9a3330', name: name_text, fieldName: 'name', minWidth: 120, maxWidth: 220, isResizable: true},
    {key: 'b0914137-7ac3-412f-b86d-3bd2d71cd101', name: 'ДД (1 этап)', fieldName: 'dv220f', minWidth: 90, maxWidth: 110, isResizable: true},
    {key: 'a1eaa7a7-c4bc-4749-bf07-5aca213292bb', name: 'ДД (2 этап)', fieldName: 'dv220s', minWidth: 90, maxWidth: 110, isResizable: true},
    {key: 'ad28b2b2-1dbc-4e09-8086-9ef704f3143d', name: 'ПО', fieldName: 'pv230f', minWidth: 90, maxWidth: 110, isResizable: true},
  ];
  let columnsChild = [
    {key: 'a9ce9d03-fdee-43c1-9f49-c98a8051b020', name: name_text, fieldName: 'name', minWidth: 120, maxWidth: 220, isResizable: true},
    {key: '93222156-7a22-409a-bd18-65fd1f06b056', name: 'ДС стац. (1 этап)', fieldName: 'ds035f', minWidth: 90, maxWidth: 110, isResizable: true},
    {key: '4a0e065b-d873-415e-8588-fdd6a822827f', name: 'ДС стац. (2 этап)', fieldName: 'ds035s', minWidth: 90, maxWidth: 110, isResizable: true},
    {key: '70b262ec-3242-4a42-97ad-dd6c2a2e64bc', name: 'ДС опек. (1 этап)', fieldName: 'ds223f', minWidth: 90, maxWidth: 110, isResizable: true},
    {key: 'b8eeb485-5ece-4c40-a71e-deca308b6a15', name: 'ДС опек. (2 этап)', fieldName: 'ds223s', minWidth: 90, maxWidth: 110, isResizable: true},
    {key: 'c0fbc056-911e-456d-bea0-530eaf199964', name: 'ПО (1 этап)', fieldName: 'pd231f', minWidth: 90, maxWidth: 110, isResizable: true},
    {key: '9ca5cdd1-1194-4828-86ae-6811c598fbe0', name: 'ПО (2 этап)', fieldName: 'pd231s', minWidth: 90, maxWidth: 110, isResizable: true},
  ];
  if (parseInt(year, 10) < 2020) {
    columnsAdult = [
      {key: '59ee27c2-a9da-474c-936f-34e82db15f2e', name: name_text, fieldName: 'name', minWidth: 120, maxWidth: 220, isResizable: true},
      {key: '67c8bdae-71d8-4115-9c89-73895d8496f5', name: 'ДД 1 в 3 (1 этап)', fieldName: 'dv220f', minWidth: 90, maxWidth: 110, isResizable: true},
      {key: 'f2fd3d5b-fae5-48d2-9077-293588a46058', name: 'ДД 1 в 3 (2 этап)', fieldName: 'dv220s', minWidth: 90, maxWidth: 110, isResizable: true},
      {key: 'a7416f1e-b246-4c7c-8280-ae6a5df10479', name: 'ДД 1 в 2 (1 этап)', fieldName: 'dv325f', minWidth: 90, maxWidth: 110, isResizable: true},
      {key: '27a817ab-70ee-4584-b005-15ecd1bc7e11', name: 'ДД 1 в 2 (2 этап)', fieldName: 'dv325s', minWidth: 90, maxWidth: 110, isResizable: true},
      {key: 'ccfb3f3f-c22f-4288-9bf4-e2da67cacae9', name: 'ПО', fieldName: 'pv230f', minWidth: 90, maxWidth: 110, isResizable: true},
    ];
    columnsChild = [
      {key: '9750be6b-f143-458e-81db-91cbeeae629e', name: name_text, fieldName: 'name', minWidth: 120, maxWidth: 220, isResizable: true},
      {key: 'ed63e819-9ddd-4366-8495-3bff55accd8e', name: 'ДС стац. (1 этап)', fieldName: 'ds035f', minWidth: 90, maxWidth: 110, isResizable: true},
      {key: '314ec840-dbed-4066-8b29-91343eb3081b', name: 'ДС стац. (2 этап)', fieldName: 'ds035s', minWidth: 90, maxWidth: 110, isResizable: true},
      {key: 'b7d70a91-38dc-4337-b3b4-7fec44923be7', name: 'ДС опек. (1 этап)', fieldName: 'ds223f', minWidth: 90, maxWidth: 110, isResizable: true},
      {key: '6e0693af-24ee-414d-9cb2-721b76a3ebb4', name: 'ДС опек. (2 этап)', fieldName: 'ds223s', minWidth: 90, maxWidth: 110, isResizable: true},
      {key: '5be43e30-ab05-4860-bf6a-5ebf64b62b20', name: 'ПО (1 этап)', fieldName: 'pd231f', minWidth: 90, maxWidth: 110, isResizable: true},
      {key: 'f1b218d1-4c7a-477c-8511-a14a3f199685', name: 'ПО (2 этап)', fieldName: 'pd231s', minWidth: 90, maxWidth: 110, isResizable: true},
    ];
  }
  if (parseInt(year, 10) < 2018) {
    columnsAdult = [
      {key: 'c90eca8e-8ef6-41f1-bfcf-bd0aa69159e7', name: name_text, fieldName: 'name', minWidth: 120, maxWidth: 220, isResizable: true},
      {key: '08d8a217-b966-4e35-9302-9910e2896f9c', name: 'ДД (1 этап)', fieldName: 'dv220f', minWidth: 90, maxWidth: 110, isResizable: true},
      {key: '76d55d4e-73cf-4653-bd06-0f0d7e33056f', name: 'ДД (2 этап)', fieldName: 'dv220s', minWidth: 90, maxWidth: 110, isResizable: true},
      {key: '6e7dad59-580f-408a-b936-cbbc0ef5c1c1', name: 'ПО', fieldName: 'pv230f', minWidth: 90, maxWidth: 110, isResizable: true},
    ];
    columnsChild = [
      {key: 'df976ff0-1c41-4475-936e-c4a38ac5933a', name: name_text, fieldName: 'name', minWidth: 120, maxWidth: 220, isResizable: true},
      {key: '874f9fc3-6459-4169-bdd6-64d96eb66c47', name: 'ДС стац. (1 этап)', fieldName: 'ds035f', minWidth: 90, maxWidth: 110, isResizable: true},
      {key: 'ca8533ea-1b59-4d00-a0ba-c0e965b59c49', name: 'ДС стац. (2 этап)', fieldName: 'ds035s', minWidth: 90, maxWidth: 110, isResizable: true},
      {key: '8cc0dbf6-5d3e-416a-b894-6adc5072968a', name: 'ДС опек. (1 этап)', fieldName: 'ds223f', minWidth: 90, maxWidth: 110, isResizable: true},
      {key: 'b33d8acc-8132-4685-9975-16328e558630', name: 'ДС опек. (2 этап)', fieldName: 'ds223s', minWidth: 90, maxWidth: 110, isResizable: true},
      {key: 'd84713d4-94b9-40da-b5ec-b3fc794a4a4f', name: 'Проф. (1 этап)', fieldName: 'pd231f', minWidth: 90, maxWidth: 110, isResizable: true},
      {key: '30e5ef9b-86e9-45ef-8795-a579a100ec0b', name: 'Проф. (2 этап)', fieldName: 'pd231s', minWidth: 90, maxWidth: 110, isResizable: true},
      {key: '66d12375-a771-4a6f-a617-96a1c89fea4f', name: 'Пред. (1 этап)', fieldName: 'pd232f', minWidth: 90, maxWidth: 110, isResizable: true},
      {key: 'bca2b34f-bca4-4c74-bbe7-9790e31d4541', name: 'Пред. (2 этап)', fieldName: 'pd232s', minWidth: 90, maxWidth: 110, isResizable: true},
      {key: '29b8b0bf-92c7-42e5-ad92-f864ebd24bbf', name: 'Пери. (1 этап)', fieldName: 'pd233f', minWidth: 90, maxWidth: 110, isResizable: true},
      {key: '57834901-723c-4465-9b1c-b0fcf9cf1c75', name: 'Пери. (2 этап)', fieldName: 'pd233s', minWidth: 90, maxWidth: 110, isResizable: true},
    ];
  }
  useEffect(() => { 
    if (getCookie('dept') === niluuid()) {
      setHidepodr(false);
    } else {
      getItems('api/who/filial/'+getCookie('dept'), setSender);
  }}, []);
  useEffect(() => getItems('api/fprocessor/exam/'+sender+'/adult/'+year+'/'+month, setItemsAdult, setLoadingAdult), [year, month, sender, reload]);
  useEffect(() => getItems('api/fprocessor/exam/'+sender+'/child/'+year+'/'+month, setItemsChild, setLoadingChild), [year, month, sender, reload]);
  return (
    <Module {...props} info='В скобках указана нарастающая сумма с начала года'>
      <Inline>
        <Dropdown
          onChange={setYear}
          defaultValue={year}
          defaultKey='all'
          api='year'
        />
        <Dropdown
          disabled={hidepodr}
          onChange={setMonth}
          defaultValue={month}
          defaultKey='all'
          api='month0'
        />
        <Dropdown
          disabled={hidepodr}
          onChange={setSender}
          value={sender}
          defaultText='Все филиалы'
          defaultKey='all'
          api='api/who/podr/forfproc'
        />
        <Button icon='refresh-cw' text='Обновить' onClick={() => forceReload(!reload)} primary={true}/>
        <SaveToExcel filename={props.name} sheets={[ { name: 'Взрослые', items: itemsAdult, columns: columnsAdult, summary: true }, { name: 'Дети', items: itemsChild, columns: columnsChild, summary: true } ]}/>
      </Inline>
      <TabsLinks links={['Взрослые', 'Дети']} onClick={(value) => setTabIndex(value)} tabIndex={tabIndex}/>
      <TabsContainer tabIndex={tabIndex}>
        <Table items={itemsAdult} columns={columnsAdult} loading={loadingAdult} sorting={false} summary={sender === 'all' ? 'split' : 'sum'}/>
        <Table items={itemsChild} columns={columnsChild} loading={loadingChild} sorting={false} summary={sender === 'all' ? 'split' : 'sum'}/>
      </TabsContainer>    
    </Module>
  );
}
