import React, { useState, useEffect } from 'react';
import Module, { Table, Inline, DatePicker, Dropdown, SaveToExcel, TabsContainer, TabsLinks, Button, getDateString, getCookie, niluuid, renderDate, renderNull, getItemsPost } from 'components';
export default function ModuleReestrExam({...props}) {
  const [itemsAdult, setItemsAdult] = useState([]);
  const [itemsChild, setItemsChild] = useState([]);
  const [datefrom, setDatefrom] = useState(getDateString('first'));
  const [dateto, setDateto] = useState(getDateString('last'));
  const [pay, setPay] = useState('1');
  const [date, setDate] = useState(niluuid());
  const [podr, setPodr] = useState(getCookie('dept'));
  const [doc, setDoc] = useState(getCookie('doctor'));
  const [snils, /*setSnils*/] = useState(getCookie('snils'));
  const [sex, setSex] = useState(niluuid());
  const [hidepodr, setHidepodr] = useState(true);
  const [hidedoc, setHidedoc] = useState(true);
  const [showfilter, setShowfilter] = useState(false);
  const [loadingAdult, setLoadingAdult] = useState(false);
  const [loadingChild, setLoadingChild] = useState(false);
  const [tabIndex, setTabIndex] = useState(0);
  const [spec, setSpec] = useState(niluuid());
  const [group, setGroup] = useState('doc');
  const [reload, forceReload] = useState(false);
  let name = 'Дата';
  let onRender = renderDate;
  switch (group) {
    case 'doc': name = 'Врач'; onRender = renderNull; break;
    case 'spec': name = 'Специальность'; onRender = renderNull; break;
    case 'health': name = 'Группа здоровья'; onRender = renderNull; break;
    case 'plk': name = 'Подразделение'; onRender = renderNull; break;
    case 'age': name = 'Возраст'; onRender = renderNull; break;
    default: name = '-'; onRender = renderNull;
  }
  const columnsAdult = [
    {key: '1dd5d0c6-5d93-4b06-86e2-d844f7338950', name, fieldName: 'name', onRender, minWidth: 120, maxWidth: 220, isResizable: true},
    {key: 'c44b4c75-b4dd-4b72-9946-ef064def5bac', name: 'Осмотров', fieldName: 'vall', minWidth: 90, maxWidth: 110, isResizable: true},
  ];
  if (new Date(dateto) >= new Date('2006-04-28') && new Date(datefrom) <= new Date('2013-02-28')) {
    columnsAdult.push({key: '40929347-3681-4102-b59b-6ea65a82d081', name: 'ДД бюдж.', fieldName: 'vddo1', minWidth: 90, maxWidth: 110, isResizable: true});
  }
  if (new Date(dateto) >= new Date('2006-11-15') && new Date(datefrom) <= new Date('2013-02-28')) {
    columnsAdult.push({key: '2df02649-34a0-4aa5-9751-04e57f378296', name: 'ДД рабо.', fieldName: 'vddo2', minWidth: 90, maxWidth: 110, isResizable: true});
  }
  if (new Date(dateto) >= new Date('2006-11-15') && new Date(datefrom) <= new Date('2014-03-31')) {
    columnsAdult.push({key: 'b720267c-3dd8-4480-9472-d64d42c93742', name: 'ДД вред.', fieldName: 'vddo3', minWidth: 90, maxWidth: 110, isResizable: true});
  }
  if (new Date(dateto) >= new Date('2013-01-01') && new Date(datefrom) <= new Date('2019-06-30')) {
    columnsAdult.push({key: '62778ed9-56a9-4482-bbfa-8f9c370382f6', name: 'ДД 1 в 3 (1 этап)', fieldName: 'v220f', minWidth: 90, maxWidth: 110, isResizable: true});
    columnsAdult.push({key: 'ca023afa-1fe6-4b67-9140-3c3fceb792d2', name: 'ДД 1 в 3 (2 этап)', fieldName: 'v220s', minWidth: 90, maxWidth: 110, isResizable: true});
  }
  if (new Date(dateto) >= new Date('2018-04-01') && new Date(datefrom) <= new Date('2019-06-30')) {
    columnsAdult.push({key: '3e89e606-2fce-4a85-a387-593b2dce0ff8', name: 'ДД 1 в 2 (1 этап)', fieldName: 'v325f', minWidth: 90, maxWidth: 110, isResizable: true});
    columnsAdult.push({key: 'f78aec6d-f71a-49d7-9583-be0a7fbd7c2e', name: 'ДД 1 в 2 (2 этап)', fieldName: 'v325s', minWidth: 90, maxWidth: 110, isResizable: true});
  }
  if (new Date(dateto) >= new Date('2019-06-01')) {
    columnsAdult.push({key: 'b70d8b4d-6a67-4dbd-a210-d2814e6dd0cc', name: 'Дисп. (1 этап)', fieldName: 'v220f', minWidth: 90, maxWidth: 110, isResizable: true});
    columnsAdult.push({key: '56036c7f-ee12-44e4-9346-698f010c66bb', name: 'Дисп. (2 этап)', fieldName: 'v220s', minWidth: 90, maxWidth: 110, isResizable: true});
  }
  if (new Date(dateto) >= new Date('2021-07-01')) {
    columnsAdult.push({key: '2e9d524c-f222-4e3b-bc66-792679da02fd', name: 'COVID (1 этап)', fieldName: 'v219f', minWidth: 90, maxWidth: 110, isResizable: true});
    columnsAdult.push({key: '750923e1-a261-4049-8d8a-3e2ff29c85e8', name: 'COVID (2 этап)', fieldName: 'v219s', minWidth: 90, maxWidth: 110, isResizable: true});
  }
  if (new Date(dateto) >= new Date('2024-01-01')) {
    columnsAdult.push({key: 'fd60bc66-bd2b-4e7f-b287-b8ab3617719e', name: 'Репрод. (1 этап)', fieldName: 'v336f', minWidth: 90, maxWidth: 110, isResizable: true});
    columnsAdult.push({key: '3af63ab8-9ace-4946-896c-b4198c42ebd3', name: 'Репрод. (2 этап)', fieldName: 'v336s', minWidth: 90, maxWidth: 110, isResizable: true});
  }
  if (new Date(dateto) >= new Date('2016-01-01')) {
    columnsAdult.push({key: '0c56ea7d-b54b-4f98-a2a2-8bef10d18177', name: 'ПО', fieldName: 'v230', minWidth: 90, maxWidth: 110, isResizable: true});
  }
  const columnsChild = [
    {key: '806445c1-91c2-4ac4-9fca-cc11ba14eaa6', name, fieldName: 'name', minWidth: 120, maxWidth: 220, isResizable: true},
    {key: '5bb1bf4a-2477-4aa8-8689-ae61e820f06e', name: 'Осмотров', fieldName: 'vall', minWidth: 90, maxWidth: 110, isResizable: true},
  ];
  if (new Date(dateto) >= new Date('2011-09-12') && new Date(datefrom) <= new Date('2014-01-01')) {
    columnsChild.push({key: 'f7de676a-00e9-478f-8774-d624fd8c9bd9', name: 'Д 14 лет', fieldName: 'v36', minWidth: 90, maxWidth: 110, isResizable: true});
  }
  if (new Date(dateto) >= new Date('2010-01-01')) {
    columnsChild.push({key: '774e418e-86f9-496f-a924-5765a23e3121', name: 'ДС стац. (1 этап)', fieldName: 'v35f', minWidth: 90, maxWidth: 110, isResizable: true});
    columnsChild.push({key: '42dfa8ce-1248-4c88-88e5-bc8d9c997a02', name: 'ДС стац. (2 этап)', fieldName: 'v35s', minWidth: 90, maxWidth: 110, isResizable: true});
  }
  if (new Date(dateto) >= new Date('2013-01-01')) {
    columnsChild.push({key: '99dd670d-619e-440f-b58a-7c2a6b3fc0fd', name: 'ДС опек. (1 этап)', fieldName: 'v223f', minWidth: 90, maxWidth: 110, isResizable: true});
    columnsChild.push({key: '5dabd692-00a2-46a9-b8ae-936ee79efba9', name: 'ДС опек. (2 этап)', fieldName: 'v223s', minWidth: 90, maxWidth: 110, isResizable: true});
    columnsChild.push({key: 'c70815b1-2e6f-4f19-bdb7-bbc92d0e11fe', name: 'ПО (1 этап)', fieldName: 'v231f', minWidth: 90, maxWidth: 110, isResizable: true});
    columnsChild.push({key: '3d1c1e9c-9412-449e-aff8-65a545f8d9cd', name: 'ПО (2 этап)', fieldName: 'v231s', minWidth: 90, maxWidth: 110, isResizable: true});
  }
  if (new Date(dateto) >= new Date('2013-01-01') && new Date(datefrom) <= new Date('2017-12-31')) {
    columnsChild.push({key: 'dd14c1d7-87e8-4841-ae00-e1c32c88e8a0', name: 'Пред. (1 этап)', fieldName: 'v232f', minWidth: 90, maxWidth: 110, isResizable: true});
    columnsChild.push({key: 'b1cb5a0c-d553-4f8d-9b90-cfdb3f8729c2', name: 'Пред. (2 этап)', fieldName: 'v232s', minWidth: 90, maxWidth: 110, isResizable: true});
    columnsChild.push({key: 'a3be058e-d757-4dcd-a8b8-52ec0033a2ee', name: 'Пер.', fieldName: 'v233', minWidth: 90, maxWidth: 110, isResizable: true});
  }
  useEffect(() => { if (podr === niluuid()) setHidepodr(false); }, [podr]);
  useEffect(() => { if (doc === niluuid()) setHidedoc(false); }, [doc]);
  useEffect(() => {
    getItemsPost('api/reestr/ddu/adult', {datefrom, dateto, date, pay, podr, spec, doc, snils, sex, group}, setItemsAdult, setLoadingAdult);
    getItemsPost('api/reestr/ddu/child', {datefrom, dateto, date, pay, podr, spec, doc, snils, sex, group}, setItemsChild, setLoadingChild);
  }, [datefrom, dateto, date, pay, podr, spec, doc, snils, sex, group, reload]);
  return (
    <Module {...props} info='Случаи попадут в оплаченные только после загрузки протокола из ЦОР'>
      <Inline>
        <DatePicker defaultValue={datefrom} onChange={setDatefrom}/>
        <DatePicker defaultValue={dateto} onChange={setDateto}/>
        <Dropdown
          onChange={setDate}
          defaultValue={date}
          options={[
            {key:niluuid(), text: 'По дате учета'},
            {key:'1', text: 'По дате окончания'},
          ]}
        />
        <Dropdown
          onChange={setPay}
          defaultValue={pay}
          options={[
            {key:niluuid(), text: 'Все'},
            {key:'1', text: 'Оплаченные'},
          ]}
        />
        <Dropdown
          disabled={hidepodr}
          onChange={setPodr}
          defaultValue={podr}
          defaultText='Все филиалы' 
          api='api/who/podr'
        />
        <Button icon='refresh-cw' text='Обновить' onClick={() => forceReload(!reload)} primary={true}/>
        <SaveToExcel filename={props.name} sheets={[ { name: 'Взрослые', items: itemsAdult, columns: columnsAdult, summary: true }, { name: 'Дети', items: itemsChild, columns: columnsChild, summary: true } ]}/>
        <Button icon={showfilter?'arrow-up-circle':'arrow-down-circle'}text='Дополнительно' onClick={() => setShowfilter(!showfilter)}/>
      </Inline>
      <Inline render={showfilter}>
        <Dropdown onChange={setSpec} defaultText='Все специальности' defaultValue={spec} api={'api/doctor/spec/'+podr}/>
        <Dropdown disabled={hidedoc} onChange={setDoc} defaultText='Все врачи' defaultValue={doc} api={'api/doctor/list/'+podr}/>
        <Dropdown
          onChange={setSex}
          defaultValue={sex}
          options={[
            {key:niluuid(), text: 'Все пациенты'},
            {key:'М', text: 'Мужчины'},
            {key:'Ж', text: 'Женщины'},
          ]}
        />
        <Dropdown
          onChange={setGroup}
          defaultValue={group}
          options={[
            {key:'doc', text: 'Группировать по врачам'},
            {key:'spec', text: 'Группировать по специальностям'},
            {key:'health', text: 'Группировать по группам здоровья'},
            {key:'plk', text: 'Группировать по подразделениям'},
            {key:'rpr', text: 'Группировать по дате учета'},
            {key:'end', text: 'Группировать по дате окончания'},
            {key:'age', text: 'Группировать по возрасту (для 131)'},
          ]}
        />
      </Inline>
      <TabsLinks links={['Взрослые', 'Дети']} onClick={setTabIndex} tabIndex={tabIndex}/>
      <TabsContainer tabIndex={tabIndex}>
        <Table items={itemsAdult} columns={columnsAdult} loading={loadingAdult} sorting={false} summary='sum'/>
        <Table items={itemsChild} columns={columnsChild} loading={loadingChild} sorting={false} summary='sum'/>
      </TabsContainer>
    </Module>
  );
}
