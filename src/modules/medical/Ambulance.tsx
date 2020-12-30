import React, { useState } from 'react';
import Module, { Table, Inline, Dropdown, TextField, DatePicker, SaveToExcel, Button, renderDate, getItems, getDateString } from 'components';
export default function ModuleAmbulance({...props}) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('');
  const [datefrom, setDatefrom] = useState(getDateString('first'));
  const [dateto, setDateto] = useState(getDateString('today'));
  const [options, setOptions] = useState([{key:'ALL', text: 'Все адреса'}, {key:'NOT', text: 'Адреса не из справочника'}]);
  const columns = [
    { key: '94f6482e-245a-42c3-aadc-6820addb4d1d', name: 'Поликлиника прикрепления', fieldName: 'mu', minWidth: 200, maxWidth: 250, isResizable: true, isMultiline: true},
    { key: 'a5bd7a4c-b3a2-4a97-a736-8f3a522d28f2', name: 'Дата вызова', fieldName: 'call_time', minWidth: 100, maxWidth: 100, isResizable: true, onRender: renderDate},
    { key: '8e86bda7-c973-4337-8560-f2052c255676', name: 'ФИО', fieldName: 'fio', minWidth: 200, maxWidth: 250, isResizable: true, isMultiline: true, isSorted: true},
    { key: 'af2af3fe-0f66-4c92-96c9-41ab11af4b07', name: 'Дата рождения', fieldName: 'birthday', minWidth: 100, maxWidth: 100, isResizable: true, onRender: renderDate},
    { key: 'a81cec4b-6d32-443e-a98a-3728f20efad6', name: 'Адрес вызова', fieldName: 'disp_addr', minWidth: 250, maxWidth: 300, isResizable: true, isMultiline: true},
    { key: 'ffc003a7-b649-4774-89b3-856582f37341', name: 'Адрес места жительства', fieldName: 'addr', minWidth: 250, maxWidth: 300, isResizable: true, isMultiline: true},
    // { key: '508ceee4-d446-4892-b139-c6bb3e9b763e', name: 'Участок прикрепления', fieldName: 'uchastok', minWidth: 100, maxWidth: 100, isResizable: true},
    { key: 'ceafacf3-88b6-457a-be0a-bb1f5854557e', name: 'Код МКБ', fieldName: 'kodmkb10', minWidth: 70, maxWidth: 80, isResizable: true},
    // { key: 'a1727700-ff37-4f49-bf21-09c0a1c6eca6', name: 'Диагноз', fieldName: 'diagn', minWidth: 100, maxWidth: 100, isResizable: true},
    { key: '69f1697f-358b-4de5-a901-97228bd3e34b', name: 'Результат вызова', fieldName: 'ffoms_v009', minWidth: 150, maxWidth: 200, isResizable: true, isMultiline: true},
    { key: '3c73ea42-a5f2-41f0-bfad-f108613221d0', name: 'Тип травмы', fieldName: 'stt', minWidth: 100, maxWidth: 150, isResizable: true, isMultiline: true},
  ];
  const getData = () => {
    getItems('api/ambulance/streets/'+datefrom+'/'+dateto, setOptions);
    getItems('api/ambulance/list/'+datefrom+'/'+dateto+'/ALL', setItems, setLoading);
  }
  const getDataFilter = (street:string) => {
    if (!loading) {
      getItems('api/ambulance/list/'+datefrom+'/'+dateto+'/' + street, setItems, setLoading);
    }
  }
  return (
    <Module {...props}>
      <Inline>
        <DatePicker defaultValue={datefrom} onChange={setDatefrom} />
        <DatePicker defaultValue={dateto} onChange={setDateto} />
        <Button icon='list' text='Сформировать' onClick={getData} primary={true}/>
        <Dropdown onChange={getDataFilter} defaultValue='ALL' options={options} />
        <TextField placeholder='Поиск по ФИО' onChange={setFilter} search={true} width={200}/>
        <SaveToExcel filename={props.name} sheets={[{ name: 'Вызова СМП', items, columns }]}/>
      </Inline>
      <Table items={items} columns={columns} loading={loading} filter={filter} filterColumn='fio'/> 
    </Module>
  );
}
