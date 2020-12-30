import React, { useState, useEffect } from 'react';
import Module, { datetimeToString, dateToString, Text, Inline, Table, getItems, renderDateTime, renderDate, Panel, SaveToExcel, getCookie, openDialog, openEditPanel, callAPI, callAPIPost, TabsLinks, TabsContainer, KanbanBoard, uuid, niluuid } from 'components';

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

interface IType {
  id: string,
  name: string,
  icon: string,
  color: string,
}

interface IBoard{
  id: string,
  name: string,
  pos: number,
  userid: string,
}

export default function ModuleIssueTracker({...props}) {
  const [itemsIssues, setItemsIssues] = useState<IIssue[]>([]);
  const [selectedIssue, setSelectedIssue] = useState<IIssue|undefined>(undefined);
  const [loadingIssues, setLoadingIssues] = useState(true);
  const [reloadIssues, forceReloadIssues] = useState(false);

  const [itemsTypes, setItemsTypes] = useState<IType[]>([]);
  const [selectedType, setSelectedType] = useState<IType|undefined>(undefined);
  const [loadingTypes, setLoadingTypes] = useState(true);
  const [reloadTypes, forceReloadTypes] = useState(false);

  const [itemsBoards, setItemsBoards] = useState<IBoard[]>([]);
  const [selectedBoard, setSelectedBoard] = useState<IBoard|undefined>(undefined);
  const [loadingBoards, setLoadingBoards] = useState(true);
  const [reloadBoards, forceReloadBoards] = useState(false);

  const [panelIssue, setPanelIssue] = useState(false);
  const [panelBoard, setPanelBoard] = useState(false);
  const [tabIndex, setTabIndex] = useState(0);

  const [deletedIssues, setDeletedIssues] = useState(false);

  // const [userid, /**/] = useState(getCookie('id'));
  const [username, /**/] = useState(getCookie('name'));

  const onDeleteIssue = () => openDialog('Отмена', 'Задача "'+selectedIssue?.title+'" будет отменена.', () => callAPIPost('api/kanban/card/cancel/'+selectedIssue?.id, { }, undefined, () => forceReloadIssues(!reloadIssues)));
  const onEditIssue = () => openEditPanel(
    (selectedIssue ? 'Изменить': 'Добавить' )+' задачу', [
      { key: 'title', type: 'text', value: '', label: 'Заголовок' },
      { key: 'typeid', type: 'selectapi', value: '', label: 'Категория', api: 'api/kanban/typesdrop', deftest: '-' },
      { key: 'description', type: 'multiline', value: '', label: 'Описание' },
      { key: 'user', type: 'text', value: username, label: 'Пользователь' },
    ], (values) => callAPIPost('api/kanban/card/add', values, undefined, () => forceReloadIssues(!reloadIssues)), ['title', 'description', 'user']
  );
  const onAssignIssue = () => openDialog('Назначение ответственного', '', (value) => callAPI('api/kanban/changeuser/'+selectedIssue?.id+'/'+value, undefined, () => forceReloadIssues(!reloadIssues)), 'selectapi', selectedIssue?.userid, undefined,  'api/userroles/usersdrop');

  // const onDeleteBoard = () => openDialog('Удаление', 'Доска "'+selectedBoard?.name+'" будет удалена.', () => callAPIPost('api/kanban/board/delete/'+selectedBoard?.id, { }, undefined, () => forceReloadBoards(!reloadBoards)));
  const onEditBoard = () => openEditPanel(
    (selectedBoard ? 'Изменить': 'Добавить' )+' доску', [
      { key: 'pos', type: 'number', value: selectedBoard?.pos.toString() || '0', label: 'Позиция' },
      { key: 'name', type: 'text', value: selectedBoard?.name, label: 'Имя' },
      { key: 'userid', type: 'selectapi', value: selectedBoard?.userid, label: 'Пользователь', api: 'api/userroles/usersdrop', deftest: '-' },
    ], (values: IBoard) => callAPIPost('api/kanban/board/'+(selectedBoard?'update':'insert')+'/'+(selectedBoard?.id || uuid()), values, undefined, () => forceReloadBoards(!reloadBoards)),
    [ 'name', 'path' ]
  );
 
  const onDeleteType = () => openDialog('Удаление', 'Категория "'+selectedType?.name+'" будет удалена.', () => callAPIPost('api/kanban/type/delete/'+selectedType?.id, { }, undefined, () => forceReloadTypes(!reloadTypes)));
  const onEditType = () => openEditPanel(
    (selectedType ? 'Изменить': 'Добавить' )+' категорию', [
      { key: 'name', type: 'text', value: selectedType?.name, label: 'Имя' },
    ], (values: IType) => callAPIPost('api/kanban/type/'+(selectedType?'update':'insert')+'/'+(selectedType?.id || uuid()), values, undefined, () => forceReloadTypes(!reloadTypes)),
    [ 'name' ]
  );

  const columnsIssues = [
    { key: '04ec9835-d5b5-4ba8-b4bc-b3e4ffc56b2f', name: 'Заголовок', fieldName: 'title', minWidth: 120, maxWidth: 250,  isResizable: true, isSorted: true },
    { key: 'd41e5504-9b34-429f-9874-131266e46f1c', name: 'Тип', fieldName: 'typename', minWidth: 80, maxWidth: 100,  isResizable: true },
    { key: '3b87e95d-38f1-46a2-9d25-3a5d509d6aa8', name: 'Описание', fieldName: 'description', minWidth: 220, maxWidth: 450,  isResizable: true },
    { key: '0dfe2769-4aad-4e8c-84eb-0620eedf6ab1', name: 'Добавлено', fieldName: 'added', onRender: renderDateTime, minWidth: 125, maxWidth: 125, isResizable: true },
    { key: '19416a96-9da6-42ee-8ea8-1c33a4f84760', name: 'Срок', fieldName: 'deadline', onRender: renderDate, minWidth: 125, maxWidth: 125, isResizable: true },
    { key: 'ba0c68aa-bc82-433c-83d0-9de49c6767b0', name: 'Пользователь', fieldName: 'user', minWidth: 80, maxWidth: 110, isResizable: true },
    // { key: 'a2111c16-cb21-40c9-953b-29b1341ced11', name: 'edited', fieldName: 'edited', onRender: renderDateTime, minWidth: 125, maxWidth: 125, isResizable: true },
    { key: '56efda63-3285-42e3-b0bc-188fa3782461', name: 'Ответственный', fieldName: 'username', minWidth: 80, maxWidth: 110, isResizable: true },
    // { key: '541b203c-1722-40f5-b096-6e8cf6458025', name: 'boardname', fieldName: 'boardname', minWidth: 80, maxWidth: 110, isResizable: true },
    { key: 'c8ba1ed1-75b4-48d6-aea4-2e4bd2ae6271', name: 'Этап', fieldName: 'columnname', minWidth: 80, maxWidth: 110, isResizable: true },
  ];
  const commandsIssues = [
    { disabled: selectedIssue !== undefined, key: 'add', name: 'Добавить', iconProps: { iconName: 'icon-plus' }, onClick: onEditIssue },
    // { disabled: !selectedIssue, key: 'edit', name: 'Изменить', iconProps: { iconName: 'icon-edit-2' }, onClick: onEditIssue },
    { disabled: !selectedIssue || selectedIssue.username !== null || selectedIssue.deleted !== null, key: 'delete', name: 'Отменить', iconProps: { iconName: 'icon-trash' }, onClick: onDeleteIssue },
    { key: 'refresh', name: 'Обновить', iconProps: { iconName: 'icon-refresh-cw' }, onClick: () => forceReloadIssues(!reloadIssues) },
    { disabled: !selectedIssue, key: 'assign', name: 'Назначить', iconProps: { iconName: 'icon-user' }, onClick: onAssignIssue },
    { disabled: !selectedIssue, key: 'info', name: 'Просмотреть', iconProps: { iconName: 'icon-clipboard' }, onClick: () => setPanelIssue(true) },
    { key: 'scope', name: (deletedIssues ? 'Скрыть' : 'Показать')+' закрытые', iconProps: { iconName: deletedIssues ? 'icon-eye-off' : 'icon-eye' }, onClick: () => setDeletedIssues(!deletedIssues) },
    { key: 'save', onRender:() => <SaveToExcel filename={props.name} sheets={[ { name: 'Изменения за неделю', items: itemsIssues, columns: columnsIssues } ]} incommandbar={true}/> },
  ];

  const columnsBoards = [
    // { key: '1e70e958-7967-4c34-9844-43adfd5874ab', name: 'id', fieldName: 'id', minWidth: 100, maxWidth: 100,  isResizable: true },
    { key: '092f73f8-ea47-4ee6-a7ad-88d853084433', name: 'Позиция', fieldName: 'pos', minWidth: 100, maxWidth: 100,  isResizable: true },
    { key: '79ceaa5a-fb1c-475e-86ba-2f944b1a413f', name: 'Имя', fieldName: 'name', minWidth: 100, maxWidth: 100,  isResizable: true },
    // { key: '1ea0aa48-9d23-4dc4-a647-981106e283f3', name: 'deleted', fieldName: 'deleted', minWidth: 100, maxWidth: 100,  isResizable: true },
    // { key: 'b82605bf-0c4c-4107-a240-8040dcc27616', name: 'userid', fieldName: 'userid', minWidth: 100, maxWidth: 100,  isResizable: true },
    { key: '46f1078f-66e1-4625-894d-b876712bf1e3', name: 'Пользователь', fieldName: 'username', minWidth: 100, maxWidth: 100,  isResizable: true },
  ];
  const commandsBoards = [
    { disabled: selectedBoard !== undefined, key: 'add', name: 'Добавить', iconProps: { iconName: 'icon-plus' }, onClick: onEditBoard },
    { disabled: !selectedBoard, key: 'edit', name: 'Изменить', iconProps: { iconName: 'icon-edit-2' }, onClick: onEditBoard },
    // { disabled: !selectedBoard, key: 'delete', name: 'Удалить', iconProps: { iconName: 'icon-trash' }, onClick: onDeleteBoard },
    { key: 'refresh', name: 'Обновить', iconProps: { iconName: 'icon-refresh-cw' }, onClick: () => forceReloadBoards(!reloadBoards) },
    {  disabled: !selectedBoard, key: 'info', name: 'Просмотреть', iconProps: { iconName: 'icon-clipboard' }, onClick: () => setPanelBoard(true) },
  ];

  const columnsTypes = [
    // { key: 'b63ffea5-7c18-4977-a457-e38733a64017', name: 'id', fieldName: 'id', minWidth: 100, maxWidth: 100,  isResizable: true },
    { key: 'cb9d610f-bce1-4d71-adb5-a23dee438dce', name: 'Имя', fieldName: 'name', minWidth: 100, maxWidth: 100,  isResizable: true },
    // { key: '68db93fe-0a5b-4c0b-9d74-054f9c890705', name: 'Иконка', fieldName: 'icon', minWidth: 100, maxWidth: 100,  isResizable: true },
    // { key: 'faca9db0-41ad-43d7-b1af-23bc8c06db54', name: 'Цвет', fieldName: 'color', minWidth: 100, maxWidth: 100,  isResizable: true },
  ];
  const commandsTypes = [
    { disabled: selectedType !== undefined, key: 'add', name: 'Добавить', iconProps: { iconName: 'icon-plus' }, onClick: onEditType },
    { disabled: !selectedType, key: 'edit', name: 'Изменить', iconProps: { iconName: 'icon-edit-2' }, onClick: onEditType },
    { disabled: !selectedType, key: 'delete', name: 'Удалить', iconProps: { iconName: 'icon-trash' }, onClick: onDeleteType },
    { key: 'refresh', name: 'Обновить', iconProps: { iconName: 'icon-refresh-cw' }, onClick: () => forceReloadTypes(!reloadTypes) },
  ];

  const onSelectIssue = (item: IIssue | undefined) => setSelectedIssue(item);
  const onSelectBoard = (item: IBoard | undefined) => setSelectedBoard(item);
  const onSelectType = (item: IType| undefined) => setSelectedType(item);

  useEffect(() => getItems('api/kanban/issues/'+(deletedIssues ? 'all' : 'actual'), setItemsIssues, setLoadingIssues), [deletedIssues, reloadIssues]);
  useEffect(() => getItems('api/kanban/boards', setItemsBoards, setLoadingBoards), [reloadBoards]);
  useEffect(() => getItems('api/kanban/types', setItemsTypes, setLoadingTypes), [reloadTypes]);

  return (
    <Module {...props}>
      <TabsLinks links={['Задачи', 'Категории', 'Доски']} onClick={(value) => setTabIndex(value)} tabIndex={tabIndex}/>
      <TabsContainer tabIndex={tabIndex}>
        <Table onSelect={onSelectIssue} commands={commandsIssues} items={itemsIssues} columns={columnsIssues} loading={loadingIssues}/>
        <Table onSelect={onSelectType} commands={commandsTypes} items={itemsTypes} columns={columnsTypes} loading={loadingTypes} />
        <Table onSelect={onSelectBoard} commands={commandsBoards} items={itemsBoards} columns={columnsBoards} loading={loadingBoards}/>
      </TabsContainer>
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
      <Panel isOpen={panelBoard} onDismiss={() => setPanelBoard(false)} text={selectedBoard?.name} size='XL'>
        <KanbanBoard boardid={selectedBoard?.id || niluuid()} readonly={true}/>
      </Panel>
    </Module>
  );

}
/*
<Inline>
          <Text size='L' text={'Имя группы: '+(selectedGroup?.name || 'без имени')}/>
          <Hide condition={selectedGroup && selectedGroup.action === 'delete'? true : false}><IconButton icon='edit-2' text='Изменить' onClick={onChangeGroupName}/></Hide>
          <Hide condition={selectedGroup && selectedGroup.action === 'delete'? true : selectedGroup && selectedGroup.deviceid === null ? true : false}><IconButton icon='copy' text='Скопировать имя компьютера' onClick={onCopyGroupName}/></Hide>
        </Inline>
        <Inline>
          <Text size='L' text={'Сотрудник: '+(selectedGroup?.employeename || 'не указан')}/>
          <Hide condition={selectedGroup && selectedGroup.action === 'delete'? true : false}><IconButton icon='user' text='Изменить' onClick={onChangeGroupEmployee}/></Hide>
          <Hide condition={selectedGroup && selectedGroup.action === 'delete' ? true : (selectedGroup && selectedGroup.employeeid === null) ? true : false}><IconButton icon='x' text='Убрать' onClick={onRemoveEmployee}/></Hide>
        </Inline>
*/
