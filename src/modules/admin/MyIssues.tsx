import React, { useState, useEffect } from 'react';
import Module, {  datetimeToString, dateToString, Text, Inline, Table, getCookie, getItems, renderDate, renderDateTime, Panel, openEditPanel, callAPIPost } from 'components';

interface IIssue {
  id: string,
  userid: string,
  title: string,
  description: string,
  comment: string,
  added: string,
  edited: string,
  deleted: string,
  deadline: string,
  user: string,
  username: string,
}

export default function ModuleMyIssues({...props}) {
  const [itemsIssues, setItemsIssues] = useState<IIssue[]>([]);
  const [selectedIssue, setSelectedIssue] = useState<IIssue|undefined>(undefined);
  const [loadingIssues, setLoadingIssues] = useState(true);
  const [reloadIssues, forceReloadIssues] = useState(false);

  const [panelIssue, setPanelIssue] = useState(false);

  const [userid, /**/] = useState(getCookie('id'));
  const [username, /**/] = useState(getCookie('name'));

  const [deletedIssues, setDeletedIssues] = useState(false);

  // const onDeleteIssue = () => {}
  const onEditIssue = () => openEditPanel(
    (selectedIssue ? 'Изменить': 'Добавить' )+' задачу', [
      { key: 'title', type: 'text', value: '', label: 'Заголовок' },
      { key: 'typeid', type: 'selectapi', value: '', label: 'Категория', api: 'api/kanban/typesdrop', deftest: '-' },
      { key: 'description', type: 'multiline', value: '', label: 'Описание' },
      { key: 'user', type: 'text', value: username, label: 'Пользователь' },
    ], (values) => callAPIPost('api/kanban/card/add', values, undefined, () => forceReloadIssues(!reloadIssues)), ['title', 'description', 'user']
  );

  const columnsIssues = [
    { key: '356c21da-7c96-4704-8923-dbcb15bf6ea9', name: 'Заголовок', fieldName: 'title', minWidth: 120, maxWidth: 250,  isResizable: true, isSorted: true },
    { key: '6d791b34-69e1-48dd-9d10-ecf3eb9a1fe7', name: 'Тип', fieldName: 'typename', minWidth: 120, maxWidth: 250,  isResizable: true, isSorted: true },
    { key: 'e72dc0a5-273b-43de-b54b-f7917a6c3c5e', name: 'Описание', fieldName: 'description', minWidth: 120, maxWidth: 250,  isResizable: true, isSorted: true },
    { key: '943bc2ae-7cf7-491f-a762-9bff50a9e96b', name: 'Добавлено', fieldName: 'added', onRender: renderDateTime, minWidth: 125, maxWidth: 125, isResizable: true },
    // { key: '334052d6-5b77-4aee-bdbf-2bd3f07a96dc', name: 'Изменено', fieldName: 'edited', onRender: renderDateTime, minWidth: 125, maxWidth: 125, isResizable: true },
    { key: 'bc6e4d8e-8e78-4f83-829b-c44758522ad5', name: 'Срок', fieldName: 'deadline', onRender: renderDate, minWidth: 125, maxWidth: 125, isResizable: true },
    { key: '335f6ff3-6c00-42cc-8c56-0622cf255d26', name: 'Ответственный', fieldName: 'username', minWidth: 80, maxWidth: 110, isResizable: true },
    // { key: '1d3fc8dc-1ae9-4fae-824d-d1d3aaf71f33', name: 'boardname', fieldName: 'boardname', minWidth: 80, maxWidth: 110, isResizable: true },
    // { key: '61165019-5f50-46e8-9d0b-e0a7fa9d4e61', name: 'columnname', fieldName: 'columnname', minWidth: 80, maxWidth: 110, isResizable: true },
  ];
  const commandsIssues = [
    { disabled: selectedIssue !== undefined, key: 'add', name: 'Добавить', iconProps: { iconName: 'icon-plus' }, onClick: onEditIssue },
    //{ disabled: !selectedIssue, key: 'edit', name: 'Изменить', iconProps: { iconName: 'icon-edit-2' }, onClick: onEditIssue },
    //{ disabled: !selectedIssue, key: 'delete', name: 'Удалить', iconProps: { iconName: 'icon-trash' }, onClick: onDeleteIssue },
    { key: 'refresh', name: 'Обновить', iconProps: { iconName: 'icon-refresh-cw' }, onClick: () => forceReloadIssues(!reloadIssues) },
    //{ disabled: !selectedIssue, key: 'assign', name: 'Назначить', iconProps: { iconName: 'icon-user' }, onClick: onAssignIssue },
    { key: 'scope', name: (deletedIssues ? 'Скрыть' : 'Показать')+' закрытые', iconProps: { iconName: deletedIssues ? 'icon-eye-off' : 'icon-eye' }, onClick: () => setDeletedIssues(!deletedIssues) },
    { disabled: !selectedIssue, key: 'info', name: 'Просмотреть', iconProps: { iconName: 'icon-clipboard' }, onClick: () => setPanelIssue(true) },
  ];


  const onSelectIssue = (item: IIssue | undefined) => setSelectedIssue(item);

  useEffect(() => getItems('api/kanban/issues/'+(deletedIssues ? 'all' : 'actual')+'/'+userid, setItemsIssues, setLoadingIssues), [reloadIssues, deletedIssues, userid]);

  return (
    <Module {...props}>
      <Table onSelect={onSelectIssue} commands={commandsIssues} items={itemsIssues} columns={columnsIssues} loading={loadingIssues}/>
      <Panel isOpen={panelIssue} onDismiss={() => setPanelIssue(false)} text='Задача' size='M'>
      <Inline><Text size='M' text={'Пользователь: '+(selectedIssue?.user ? selectedIssue?.user : 'не задан')}/></Inline>
        <Inline>
          <Text size='M' text={selectedIssue?.added && 'Добавлена: '+datetimeToString(selectedIssue?.added)+'; '}/>
          <Text size='M' text={selectedIssue?.deleted && 'Закрыта: '+datetimeToString(selectedIssue?.deleted)+'; '}/>
        </Inline>
        <Inline><Text size='M' text={'Срок исполнения: '+(selectedIssue?.deadline ? dateToString(selectedIssue?.deadline) : 'не задан')+'; Исполнитель: '+(selectedIssue?.username ? selectedIssue?.username : 'не задан')}/></Inline>
        <Inline><Text size='L' text={selectedIssue?.title}/></Inline>
        <Inline><Text size='S' text={'Описание:'}/></Inline>
        {selectedIssue?.description}
        <Inline><Text size='S' text={'Примечание:'}/></Inline>
        {selectedIssue?.comment}
      </Panel>
    </Module>
  );

}
