import React, { useState } from 'react';
import Module, { Inline, TextField, DatePicker, Table, Button, getItemsPost, getDateString, renderDateTime, SaveToExcel, Dropdown, Hide } from 'components';
export default function ModuleFProcArchive({...props}) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [datefrom, setDatefrom] = useState(getDateString('first'));
  const [dateto, setDateto] = useState(getDateString('last'));
  const [surname, setSurname] = useState('');
  const [name, setName] = useState('');
  const [type, setType] = useState('all');
  const [patronymic, setPatronymic] = useState('');
  const columns = [
    { key: '6054be66-a985-46a4-b13b-d3ea01edb83f', fieldName: 'date_1', name: 'Начало', onRender: renderDateTime, minWidth: 115, maxWidth: 115,  isResizable: true, isSorted: true },
    { key: '92da3ae7-dbde-46ad-8fc9-e4480338ca0b', fieldName: 'date_2', name: 'Окончание', onRender: renderDateTime, minWidth: 115, maxWidth: 115, isResizable: true },
    { key: 'eb5031d0-2d19-4904-8260-23820dcc62e4', fieldName: 'podr', name: 'Подразделение', minWidth: 150, maxWidth: 200, isResizable: true},
    { key: '8145682d-2a66-4b10-8f8d-5b2fb6ea7bc9', fieldName: 'doctor', name: 'Врач', minWidth: 150, maxWidth: 200, isResizable: true},
    { key: '3ebe8305-850a-4f5d-8175-79241fe1b04f', fieldName: 'prof', name: 'Профиль', minWidth: 150, maxWidth: 350, isResizable: true},
    { key: '3d4d8d54-b81b-4358-8655-3f37fb8876ff', fieldName: 'ds1', name: 'МКБ', minWidth: 50, maxWidth: 80, isResizable: true},
    { key: 'ba22ba51-3528-436f-b374-9b83fb7ec096', fieldName: 'sump', name: 'Сумма', minWidth: 50, maxWidth: 80, isResizable: true},
    { key: '30844903-291a-4166-96be-b3e13721e72b', fieldName: 'sank', name: 'Санкции', minWidth: 50, maxWidth: 80, isResizable: true},
    { key: 'e6a3a8dd-e69d-4b28-876b-c23928512ca6', fieldName: 'comment', name: 'Комментирий', minWidth: 150, maxWidth: 350, isResizable: true },
  ];
  return (
    <Module {...props} info='Информация по оплате случаев ОМС с 2016 года (случаи профосмотров и диспансеризации с мая 2016)'>
      <Inline>
        <TextField onChange={setSurname} placeholder='Фамилия'/>
        <TextField onChange={setName} placeholder='Имя'/>
        <TextField onChange={setPatronymic} placeholder='Отчество'/>
        <Dropdown
          onChange={setType}
          defaultValue={type}
          options={[
            {key:'all', text: 'Все'},
            {key:'app', text: 'Только АПП'},
            {key:'po', text: 'Только ДД и ПО'},
            {key:'st', text: 'Только Стационар'},
            {key:'smp', text: 'Только СМП'},
          ]}
        />
        <Hide condition={true}>
          <DatePicker defaultValue={datefrom} onChange={setDatefrom}/>
          <DatePicker defaultValue={dateto} onChange={setDateto}/>
        </Hide>
        <Button icon='search' text='Найти' onClick={() => getItemsPost('api/fprocessor/archive/'+type, {surname, name, patronymic}, setItems, setLoading)} primary={true}/>
        <SaveToExcel filename={props.name} sheets={[ { name: 'Случаи', items, columns } ]}/>
      </Inline>
      <Table grouped={true} items={items} columns={columns} loading={loading}/>
    </Module>
  );
}
  