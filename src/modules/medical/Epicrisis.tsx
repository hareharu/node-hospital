import React, { useState } from 'react';
import Module, { Inline, TextField, DatePicker, Table, Button, renderDate, getItemsPost, getDateString, renderDateTime, Dropdown, saveFile, SaveToExcel } from 'components';
export default function ModuleEpicrisis({...props}) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState('');
  const [selectedUrl, setSelectedUrl] = useState('');
  const [datefrom, setDatefrom] = useState(getDateString('first'));
  const [dateto, setDateto] = useState(getDateString('last'));
  const [surname, setSurname] = useState('');
  const [name, setName] = useState('');
  const [type, setType] = useState('2');
  const [date, setDate] = useState('1');
  const [sign, setSign] = useState('2');
  const [patronymic, setPatronymic] = useState('');
  const onSelect = (item: any) => {
    if (item) {
      if (item.gosptype !== 'СМП') {
        setSelectedFileName(item.filename);
        setSelectedUrl('/api/epicrisis/' + item.etype + '/' + item.id);
      } else {
        setSelectedFileName('');
        setSelectedUrl(''); 
      }
    } else {
      setSelectedFileName('');
      setSelectedUrl('');
    }
  }
  const columns = [
    { key: 'ef4caf92-811d-4122-8078-94086d5423f9', name: 'ФИО', fieldName: 'fio', minWidth: 200, maxWidth: 250,  isResizable: true, isSorted: true },
    { key: '0dd51eb1-4af3-4484-90b3-fb876590144f', name: 'Д. рожд.', fieldName: 'birthday', onRender: renderDate, minWidth: 75, maxWidth: 75, isResizable: true },
    { key: '79cad9fe-4119-4088-a994-30f76dbead48', name: 'Адрес', fieldName: 'address', minWidth: 150, maxWidth: 350, isResizable: true},
    { key: '368d97e3-89a8-4855-88e5-e6b57dd12912', name: 'Участок', fieldName: 'uchastok', minWidth: 50, maxWidth: 50, isResizable: true},
    // { key: '44985bdd-2787-4a17-99ae-97a772b5c74d', name: 'bits', fieldName: 'bits', minWidth: 100, maxWidth: 100, isResizable: true},
    { key: '592c8150-a5c7-4679-bad2-d241ce316b3a', name: 'Учреждение', fieldName: 'work', minWidth: 150, maxWidth: 350, isResizable: true},
    { key: '7bd9e3e6-d53c-4e8b-8f2f-e72dc85bfd1c', name: 'Тип', fieldName: 'gosptype', minWidth: 50, maxWidth: 50, isResizable: true},
    { key: 'e5e6bbda-ce25-413a-bd7b-37db5d23359c', name: 'МКБ', fieldName: 'mkb', minWidth: 50, maxWidth: 50, isResizable: true},
    { key: '1a70dd86-3697-442c-9063-811d303b5f32', name: 'Госпитал.', fieldName: 'date_in', onRender: renderDateTime, minWidth: 115, maxWidth: 115, isResizable: true },
    { key: 'e211b8f1-e3bb-4d07-8625-c12e665416dc', name: 'Выписка', fieldName: 'dclosem', onRender: renderDateTime, minWidth: 115, maxWidth: 115, isResizable: true },
  ];
  const commands = [
    {
      disabled: selectedUrl === '',
      key: 'print',
      name: 'Распечатать',
      iconProps: { iconName: 'icon-printer' },
      onClick: () => window.open(selectedUrl, '_blank')
    },
    {
      disabled: selectedUrl === '',
      key: 'save',
      name: 'Скачать',
      iconProps: { iconName: 'icon-save' },
      onClick: () => saveFile(selectedUrl, selectedFileName)
    },
  ];
  return (
    <Module {...props} info='Если нужный эпикриз отсутсвует, возможно пациент прикреплен к другой МО'>
      <Inline>
        <TextField onChange={setSurname} placeholder='Фамилия'/>
        <TextField onChange={setName} placeholder='Имя'/>
        <TextField onChange={setPatronymic} placeholder='Отчество'/>
        <Dropdown
          onChange={setType}
          defaultValue={type}
          options={[
            {key:'1', text: 'Все'},
            {key:'2', text: 'Без СМП'},
            {key:'3', text: 'СМП'},
          ]}
        />
        <Dropdown
          onChange={setSign}
          defaultValue={sign}
          options={[
            {key:'1', text: 'Все'},
            {key:'2', text: 'Подписанные'},
          ]}
        />
        <Dropdown
          onChange={setDate}
          defaultValue={date}
          options={[
            {key:'1', text: 'По дате выписки'},
            {key:'2', text: 'по дате загрузки'},
          ]}
        />
        <DatePicker defaultValue={datefrom} onChange={setDatefrom}/>
        <DatePicker defaultValue={dateto} onChange={setDateto}/>
        <Button icon='search' text='Найти' onClick={() => getItemsPost('api/epicrisis/list', {surname, name, sign, patronymic, datefrom, dateto, type, date}, setItems, setLoading)} primary={true}/>
        <SaveToExcel filename={props.name} sheets={[{ name: 'Эпикризы', items, columns }]}/>
      </Inline>
      <Table onSelect={onSelect} items={items} columns={columns} loading={loading} commands={commands}/>
    </Module>
  );
}
  