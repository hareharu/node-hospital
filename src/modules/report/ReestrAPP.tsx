import React, { useState, useEffect } from 'react';
import Module, { Table, Inline, DatePicker, Dropdown, SaveToExcel, TabsContainer, TabsLinks, Button, getDateString, getCookie, niluuid, renderDate, renderNull, renderFloat, getItemsPost } from 'components';
export default function ModuleReestrAPP({...props}) {
  const [itemsAll, setItemsAll] = useState([]);
  const [itemsAdult, setItemsAdult] = useState([]);
  const [itemsChild, setItemsChild] = useState([]);
  const [datefrom, setDatefrom] = useState(getDateString('first'));
  const [dateto, setDateto] = useState(getDateString('last'));
  const [pay, setPay] = useState(niluuid());
  const [date, setDate] = useState(niluuid());
  const [podr, setPodr] = useState(getCookie('dept'));
  const [doc, setDoc] = useState(getCookie('doctor'));
  const [snils, /*setSnils*/] = useState(getCookie('snils'));
  const [hidepodr, setHidepodr] = useState(true);
  const [hidedoc, setHidedoc] = useState(true);
  const [showfilter, setShowfilter] = useState(false);
  const [loadingAll, setLoadingAll] = useState(false);
  const [loadingAdult, setLoadingAdult] = useState(false);
  const [loadingChild, setLoadingChild] = useState(false);
  const [tabIndex, setTabIndex] = useState(0);
  const [spec, setSpec] = useState(niluuid());
  const [cel, setCel] = useState(niluuid());
  const [group, setGroup] = useState('doc');
  const [finance, setFinance] = useState('_26P0Q50BV');
  const [reload, forceReload] = useState(false);
  let name = 'Дата';
  let onRender = renderDate;
  switch (group) {
    case 'doc': name = 'Врач'; onRender = renderNull; break;
    case 'spec': name = 'Специальность'; onRender = renderNull; break;
    case 'cel': name = 'Цель'; onRender = renderNull; break;
    case 'plk': name = 'Подразделение'; onRender = renderNull; break;
    case 'month': name = 'Месяц'; onRender = renderNull; break;
    default: name = '-'; onRender = renderNull;
  }
  const columns = [
    { key: 'b81f213f-8046-4e82-a347-8c8b3c712961', name: name, onRender: onRender, fieldName: 'name', minWidth: 150, maxWidth: 250,  isResizable: true },
    { key: 'f1cb73e6-2c03-4baf-b559-cc1f842e98d8', name: 'Обр.', fieldName: 'obr', minWidth: 70, maxWidth: 70,  isResizable: true },
    { key: 'f66ab639-e393-461f-a52c-e795259111d4', name: 'Обр. забо.', fieldName: 'obr_z', minWidth: 70, maxWidth: 70,  isResizable: true },
    { key: '1c90346b-f1d0-4ff7-960e-e889eed90dfd', name: 'Пос.', fieldName: 'pos', minWidth: 70, maxWidth: 70,  isResizable: true },
    { key: '5561605e-3777-4974-913b-ceebc3042429', name: 'Пос. неот.', fieldName: 'pos_n', minWidth: 70, maxWidth: 70,  isResizable: true },
  ];
  if (new Date(datefrom) >= new Date('2020-01-01')) {
    columns.push( { key: '1c1c2495-8acc-4862-a739-8dc962401276', name: 'Пос. проф.', fieldName: 'pos_p', minWidth: 70, maxWidth: 70,  isResizable: true },
                  { key: '8b4b6087-de90-456c-9754-34bf5706c30a', name: 'Пос. иные', fieldName: 'pos_i', minWidth: 70, maxWidth: 70,  isResizable: true },);
  } else {
    columns.push( { key: '28ca95f9-227b-4dd7-8203-764a7e945084', name: 'Пос. проф./иные', fieldName: 'pos_p', minWidth: 70, maxWidth: 70,  isResizable: true });
  }
  columns.push( { key: '24f0a66b-6904-4e7a-aa3b-e28b6f1e92f4', name: 'Пос. забо.', fieldName: 'pos_z', minWidth: 70, maxWidth: 70,  isResizable: true },
                { key: 'd521617e-8920-4dcb-b4bc-a9ad99c608b2', name: 'УЕТ', fieldName: 'uet', minWidth: 70, maxWidth: 70,  isResizable: true, onRender: renderFloat });
  useEffect(() => { if (podr === niluuid()) setHidepodr(false); }, [podr]);
  useEffect(() => { if (doc === niluuid()) setHidedoc(false); }, [doc]);
  useEffect(() => {
    getItemsPost('api/reestr/priem/all', {datefrom, dateto, date, pay, podr, spec, doc, snils, cel, finance, group}, setItemsAll, setLoadingAll);
    getItemsPost('api/reestr/priem/adult', {datefrom, dateto, date, pay, podr, spec, doc, snils, cel, finance, group}, setItemsAdult, setLoadingAdult);
    getItemsPost('api/reestr/priem/child', {datefrom, dateto, date, pay, podr, spec, doc, snils, cel, finance, group}, setItemsChild, setLoadingChild);
  }, [datefrom, dateto, date, pay, podr, spec, doc, snils, cel, finance, group, reload]);
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
            {key:'2', text: 'по дате посещения'},
            // {key:'1', text: 'по дате окончания'},
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
        <SaveToExcel filename={props.name} sheets={[
          { name: 'Все случаи', items: itemsAll, columns: columns, summary: true },
          { name: 'Взрослые', items: itemsAdult, columns: columns, summary: true },
          { name: 'Дети', items: itemsChild, columns: columns, summary: true },
        ]}/>
        <Button icon={showfilter?'arrow-up-circle':'arrow-down-circle'}text='Дополнительно' onClick={() => setShowfilter(!showfilter)}/>
      </Inline>
      <Inline render={showfilter}>
        <Dropdown onChange={setSpec} defaultText='Все специальности' defaultValue={spec} api={'api/doctor/spec/'+podr}/>
        <Dropdown disabled={hidedoc} onChange={setDoc} defaultText='Все врачи' defaultValue={doc} api={'api/doctor/list/'+podr}/>
        <Dropdown onChange={setCel} defaultText='Все цели' defaultValue={cel} api={'api/doctor/cel'}/>
        <Dropdown onChange={setFinance} defaultText='Все источники финансирования' defaultValue={finance} api={'api/doctor/finance'}/>
        <Dropdown
          onChange={setGroup}
          defaultValue={group}
          options={[
            {key:'doc', text: 'Группировать по врачам'},
            {key:'spec', text: 'Группировать по специальностям'},
            {key:'cel', text: 'Группировать по целям'},
            {key:'plk', text: 'Группировать по подразделениям'},
            {key:'rpr', text: 'Группировать по дате учета'},
            {key:'day', text: 'Группировать по дате посещения'},
            {key:'end', text: 'Группировать по дате окончания'},
            // {key:'month', text: 'Группировать по месяцу учета'},
          ]}
        />
      </Inline>
      <TabsLinks links={['Все случаи', 'Взрослые', 'Дети']} onClick={(value) => setTabIndex(value)} tabIndex={tabIndex}/>
      <TabsContainer tabIndex={tabIndex}>
        <Table columns={columns} items={itemsAll} loading={loadingAll} sorting={false} summary='sum'/>
        <Table columns={columns} items={itemsAdult} loading={loadingAdult} sorting={false} summary='sum'/>
        <Table columns={columns} items={itemsChild} loading={loadingChild} sorting={false} summary='sum'/>
      </TabsContainer>
    </Module>
  );
}
