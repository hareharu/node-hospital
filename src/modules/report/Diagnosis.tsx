import React, { useState, useEffect } from 'react';
import Module, { Table, Inline, DatePicker, Dropdown, SaveToExcel, Button, getDateString, getCookie, getItemsPost, niluuid } from 'components';
export default function ModuleDiagnosis({...props}) {
  const [itemsAll, setItemsAll] = useState([]);
  const [datefrom, setDatefrom] = useState(getDateString('first'));
  const [dateto, setDateto] = useState(getDateString('last'));
  const [pay, setPay] = useState(niluuid());
  const [date, setDate] = useState(niluuid());
  const [podr, setPodr] = useState(getCookie('dept'));
  const [doc, /*setDoc*/] = useState(getCookie('doctor'));
  const [snils, /*setSnils*/] = useState(getCookie('snils'));
  const [loadingAll, setLoadingAll] = useState(false);
  const [spec, /*setSpec*/] = useState(niluuid());
  const [cel, /*setCel*/] = useState(niluuid());
  const [age, setAge] = useState('child');
  const [type, setType] = useState('first');
  const [typep, setTypep] = useState('all');
  const [finance, /*setFinance*/] = useState('_26P0Q50BV');
  const [reload, forceReload] = useState(false);
  const columnsChild = [
    { key: '50427379-a7ac-4414-9c18-0b9d58599e4a', name: 'МКБ',  fieldName: 'name', minWidth: 100, maxWidth: 250,  isResizable: true },
    { key: '424f53a8-b4d8-49cd-b803-4b341e91e357', name: 'Всего', fieldName: 'c_all', minWidth: 70, maxWidth: 70,  isResizable: true },
    { key: 'b35f1b31-85a9-4528-88d2-ec2b39ac44af', name: 'М', fieldName: 'c_m', minWidth: 70, maxWidth: 70,  isResizable: true },
    { key: '880b64b7-ea50-41b7-9a3a-9a4db0067a32', name: 'Ж', fieldName: 'c_w', minWidth: 70, maxWidth: 70,  isResizable: true },
    { key: '08069843-f134-4c97-bacf-f59f6c7133f4', name: 'до мес.', fieldName: 'c_1m', minWidth: 70, maxWidth: 70,  isResizable: true },
    { key: '47c9352a-ee99-4dff-9f4c-15284719a5bf', name: 'до года', fieldName: 'c_0', minWidth: 70, maxWidth: 70,  isResizable: true },
    { key: 'f126c0c1-9a5c-4d1f-aa58-534d938a62e6', name: '1-3', fieldName: 'c_3', minWidth: 70, maxWidth: 70,  isResizable: true },
    { key: '46178da6-f525-4d09-a724-91d04d895c39', name: '0-4', fieldName: 'c_4', minWidth: 70, maxWidth: 70,  isResizable: true },
    { key: 'ef0aea52-945e-4d3c-8f49-53cf27235e39', name: '0-4 (М)', fieldName: 'c_4_m', minWidth: 70, maxWidth: 70,  isResizable: true },
    { key: 'd9ddfcd4-779f-4e41-8753-c5ef1ba909ee', name: '0-4 (Ж)', fieldName: 'c_4_w', minWidth: 70, maxWidth: 70,  isResizable: true },
    { key: '65a1192b-f541-4541-b3fd-00bdfb01ebfc', name: '5-9', fieldName: 'c_9', minWidth: 70, maxWidth: 70,  isResizable: true },
    { key: 'b6588b90-9d5b-4959-8863-f698fd3a220a', name: '5-9 (М)', fieldName: 'c_9_m', minWidth: 70, maxWidth: 70,  isResizable: true },
    { key: '12aa5fc9-1caa-42a5-b8ae-d5bfb763063b', name: '5-9 (Ж)', fieldName: 'c_9_w', minWidth: 70, maxWidth: 70,  isResizable: true },
    { key: '4bb9cdca-fba2-4c5f-941f-d0b6e96719ca', name: '10-14', fieldName: 'c_14', minWidth: 70, maxWidth: 70,  isResizable: true },
    { key: 'a9c100ef-7188-4529-b5f4-51f681cc1d1e', name: '10-14 (М)', fieldName: 'c_14_m', minWidth: 70, maxWidth: 70,  isResizable: true },
    { key: 'bc14c9b9-c594-4f52-8ea5-e41bf900ca35', name: '10-14 (Ж)', fieldName: 'c_14_w', minWidth: 70, maxWidth: 70,  isResizable: true },
    { key: 'a594e7c6-5b25-42eb-aaf1-83ec1a476189', name: '15-17', fieldName: 'c_17', minWidth: 70, maxWidth: 70,  isResizable: true },
    { key: '5ce0c622-1a96-49c0-92ba-4b88e6b40899', name: '15-17 (М)', fieldName: 'c_17_m', minWidth: 70, maxWidth: 70,  isResizable: true },
    { key: '69493447-c74d-4c0a-bd93-276c5b64a067', name: '15-17 (Ж)', fieldName: 'c_17_w', minWidth: 70, maxWidth: 70,  isResizable: true },
  ];
  const columnsAdult = [
    { key: '6787e4f0-e41d-4934-af5a-4659cf35b435', name: 'МКБ',  fieldName: 'name', minWidth: 100, maxWidth: 250,  isResizable: true },
    { key: '8de31bb0-89e5-4767-9546-085fd9c6ae5e', name: 'Всего', fieldName: 'c_all', minWidth: 70, maxWidth: 70,  isResizable: true },
    { key: '3341b462-cde4-4972-bc45-0a42f7dd743a', name: 'М', fieldName: 'c_m', minWidth: 70, maxWidth: 70,  isResizable: true },
    { key: '2499aae5-0ecf-4dcf-aee4-749f75db4f70', name: 'Ж', fieldName: 'c_w', minWidth: 70, maxWidth: 70,  isResizable: true },
    { key: '02c5c890-9701-44f8-b2cb-9de25e313f20', name: 'труд.', fieldName: 'c_worker', minWidth: 70, maxWidth: 70,  isResizable: true },
    { key: '8bb662d8-9145-466a-9b14-e3a93fc22499', name: 'пенс.', fieldName: 'c_retired', minWidth: 70, maxWidth: 70,  isResizable: true },
    { key: '4f4a905a-5cfb-4f74-b3f0-59bb8c4bccc8', name: '18-59 (М)', fieldName: 'c_worker_m', minWidth: 70, maxWidth: 70,  isResizable: true },
    { key: '2d349483-2cca-4c57-abf8-249e7d5b121a', name: '18-54 (Ж)', fieldName: 'c_worker_w', minWidth: 70, maxWidth: 70,  isResizable: true },
    { key: '6d0c62f6-1509-4d15-8884-d272cb8f73d6', name: '60 и ст. (М)', fieldName: 'c_retired_m', minWidth: 70, maxWidth: 70,  isResizable: true },
    { key: '82ef3893-4e0d-4f68-9948-b1a9f8091195', name: '55 и ст. (Ж)', fieldName: 'c_retired_w', minWidth: 70, maxWidth: 70,  isResizable: true },
  ];
  useEffect(() => {
    getItemsPost('api/reestr/diagn/'+age, {datefrom, dateto, date, pay, podr, spec, doc, snils, cel, finance, type, typep}, setItemsAll, setLoadingAll);
  }, [datefrom, dateto, date, pay, podr, spec, doc, snils, cel, finance, type, typep, age, reload]);
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
          onChange={setAge}
          defaultValue={age}
          options={[
            {key:'child', text: 'Дети'},
            {key:'adult', text: 'Взрослые'},
          ]}
        />
        <Dropdown
          onChange={setTypep}
          defaultValue={typep}
          options={[
            {key:'all', text: 'АПП и ДД'},
            {key:'app', text: 'Только АПП'},
            {key:'dd', text: 'Только ДД'},
          ]}
        />
        <Dropdown
          onChange={setPodr}
          defaultValue={podr}
          defaultText='Все филиалы' 
          api='api/who/podr'
        />
        <Dropdown
          onChange={setType}
          defaultValue={type}
          options={[
            {key:'all', text: 'Всего заболеваний'},
            {key:'first', text: 'Выявлено впервые'},
            {key:'du', text: 'Взят на д.учет'},
          ]}
        />
        <Button icon='refresh-cw' text='Обновить' onClick={() => forceReload(!reload)} primary={true}/>
        <SaveToExcel filename={props.name} sheets={[{ name: 'Все случаи', items: itemsAll, columns: age === 'child' ? columnsChild : columnsAdult, summary: true }]}/>
      </Inline>
      <Table columns={age === 'child' ? columnsChild : columnsAdult} items={itemsAll} loading={loadingAll} sorting={false} summary='sum'/>
    </Module>
  );
}
