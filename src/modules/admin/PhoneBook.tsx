import React, { useState, useEffect } from 'react';
import Module, { Table, Inline, getItems, TextField, getCookie, openEditPanel, openDialog, callAPIPost, uuid } from 'components';

interface IBook {
  id: string,
  dept: string,
  name: string,
  phone: string,
  job: string,
  email: string,
  room: string,
}

export default function PhoneBook({...props}) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [selectedBook, setSelectedBook] = useState<IBook | undefined>(undefined);
  const [reloadBook, forceReloadBook] = useState(false);
  const access = getCookie('access');

  const onSelectBook = (item: IBook | undefined) => setSelectedBook(item);
  const onDeleteBook = () => openDialog('Удаление', 'Контакт "'+selectedBook?.name+'" будет удален.', () => callAPIPost('api/phonebook/delete/'+selectedBook?.id, { }, undefined, () => forceReloadBook(!reloadBook)));
  const onEditBook = () => openEditPanel(
    (selectedBook ? 'Изменить': 'Добавить' )+' контакт', [
      { key: 'dept', type: 'text', value: selectedBook?.dept, label: 'Отдел' },
      { key: 'room', type: 'text', value: selectedBook?.room, label: 'Кабинет' },
      { key: 'job', type: 'text', value: selectedBook?.job, label: 'Должность' },
      { key: 'name', type: 'text', value: selectedBook?.name, label: 'ФИО' },
      { key: 'phone', type: 'text', value: selectedBook?.phone, label: 'Телефон' },
      { key: 'email', type: 'text', value: selectedBook?.email, label: 'e-mail' },
    ], (values: IBook) => callAPIPost('api/phonebook/'+(selectedBook?'update':'insert')+'/'+(selectedBook?.id || uuid()), values, undefined, () => forceReloadBook(!reloadBook))
  );

  const columns = [
    { key: '10aac3e9-831f-4b64-b0e8-0cc2e0991663', name: 'Кабинет и должность', fieldName: 'title', minWidth: 200, maxWidth: 300, isResizable: true },
    { key: 'c0131fc8-d04e-4372-8f5a-ae7f1ceba083', name: 'ФИО', fieldName: 'name', minWidth: 250, maxWidth: 300, isResizable: true },
    { key: '892434ad-9523-48c5-87ea-7873f4f2d4b9', name: 'Телефон', fieldName: 'phone', minWidth: 150, maxWidth: 150, isResizable: true },
    { key: '670211b8-5a7a-43ab-ab95-253e2c59884e', name: 'e-mail', fieldName: 'email', minWidth: 150, maxWidth: 200, isResizable: true },
  ];
  const commands = [
    { disabled: selectedBook !== undefined, key: 'add', name: 'Добавить', iconProps: { iconName: 'icon-plus' }, onClick: onEditBook },
    { disabled: !selectedBook, key: 'edit', name: 'Изменить', iconProps: { iconName: 'icon-edit-2' }, onClick: onEditBook },
    { disabled: !selectedBook, key: 'delete', name: 'Удалить', iconProps: { iconName: 'icon-trash' }, onClick: onDeleteBook },
    { key: 'refresh', name: 'Обновить', iconProps: { iconName: 'icon-refresh-cw' }, onClick: () => forceReloadBook(!reloadBook) },
  ];
  
  useEffect(() => getItems('api/phonebook/list', setItems, setLoading), [reloadBook]);
  return (
    <Module {...props}>
      <Inline>
        <TextField placeholder='Поиск' onChange={setFilter} search={true} width={400}/>
      </Inline>
      <Table commands={access==='admin' ? commands : undefined} onSelect={access==='admin' ? onSelectBook : undefined} items={items} columns={columns} loading={loading} grouped={true} hideHeader={true} filter={filter} filterColumn='filter'/>
    </Module>
  );
}
