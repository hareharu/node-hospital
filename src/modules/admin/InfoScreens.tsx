import React, { useState, useEffect } from 'react';
import Module, { Table,  getItems, callAPIPost, uuid, TabsContainer, openEditPanel, openDialog, TabsLinks, renderBooleanCheck } from 'components';

interface IGroup {
  id: string,
  pos: string,
  name: string,
  type: string,
  title: string,
  days: number,
  room: string,
  uch: string,
  spec: string,
}
interface IDoctor {
  id: string,
  pos: string,
  groupid: string,
  code: string,
  uch: string,
  room: string,
  spec: string,
  name: string,
  day0: string,
  day1: string,
  day2: string,
  day3: string,
  day4: string,
  day5: string,
  day6: string,
  day7: string,
}
export default function ModuleInfoScreens({...props}) {
  const [itemsGroups, setItemsGroups] = useState<IGroup[]>([]);
  const [itemsDoctors, setItemsDoctors] = useState<IDoctor[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<IGroup | undefined>(undefined);
  const [selectedDoctor, setSelectedDoctor] = useState<IDoctor| undefined>(undefined);

  const [tabIndexSite, setTabIndexSite] = useState(0);
  const [loadingDoctors, setLoadingDoctors] = useState(false);
  const [loadingGroups, setLoadingGroups] = useState(false);
  const [reloadGroups, forceReloadGroups] = useState(true);
  const [reloadDoctors, forceReloadDoctors] = useState(true);

  const columnsGroups = [
    { key: '4bdf6af7-9856-48d3-8129-27c43c709b09', name: 'Позиция', fieldName: 'pos', minWidth: 50, maxWidth: 50,  isResizable: true },
    { key: '946fe707-9944-4a42-996d-e1e9d47071c1', name: 'Имя', fieldName: 'name', minWidth: 200, maxWidth: 300, isResizable: true },
    { key: '8d0ada87-2047-43ed-83f2-1d6b31b78f1e', name: 'Заголовок', fieldName: 'title', minWidth: 200, maxWidth: 300, isResizable: true },
    { key: 'a4f82a9c-39d2-4528-89d2-e4d035890c62', name: 'Дней', fieldName: 'days', minWidth: 50, maxWidth: 50, isResizable: true },
    { key: 'e97d3081-7280-47a6-bf03-0f9890cf98f6', name: 'Кабинет', fieldName: 'room', onRender: renderBooleanCheck, minWidth: 50, maxWidth: 50, isResizable: true },
    { key: 'c03aff0e-bc24-4fa6-950f-5f02c6c659c7', name: 'Участок', fieldName: 'uch', onRender: renderBooleanCheck, minWidth: 50, maxWidth: 50, isResizable: true },
    { key: 'f5a1953f-008c-4af8-83d7-9a666d50eea8', name: 'Специальность', fieldName: 'spec', onRender: renderBooleanCheck, minWidth: 50, maxWidth: 50, isResizable: true },
  ];
  const columnsDoctors = [
    { key: 'dbf20645-a5e0-4ed6-a2f9-ae62534bc71d', name: 'Позиция', fieldName: 'pos', minWidth: 20, maxWidth: 20,  isResizable: true },
    { key: 'b6a17c10-020b-4464-a7bf-f58746cdc640', name: 'Кабинет', fieldName: 'room', minWidth: 50, maxWidth: 50, isResizable: true },
    { key: '944e0c35-04b8-482a-8316-053ec3c772f5', name: 'Участок', fieldName: 'uch', minWidth: 50, maxWidth: 50, isResizable: true },
    { key: 'bf258918-b46a-4d02-b769-0cc1ce4827a4', name: 'Специальность', fieldName: 'spec', minWidth: 100, maxWidth: 100, isResizable: true },
    { key: '288a6371-b97c-4389-94dc-d9b28d2bd9fd', name: 'Имя', fieldName: 'name', minWidth: 140, maxWidth: 140, isResizable: true },
    { key: '3bdc9b52-c9c1-4d4b-91d6-ad719f5b86f5', name: 'Неделя', fieldName: 'day0', minWidth: 80, maxWidth: 100, isResizable: true },
    { key: '8b0b9f41-2e7c-4ea3-894c-6c86130cd32c', name: 'Пн', fieldName: 'day1', minWidth: 80, maxWidth: 100, isResizable: true },
    { key: 'ed73135c-b403-4baa-8d06-0c9084d6ab78', name: 'Вт', fieldName: 'day2', minWidth: 80, maxWidth: 100, isResizable: true },
    { key: '9e1c9ca7-3dba-41c1-be6c-1939bd9f7926', name: 'Ср', fieldName: 'day3', minWidth: 80, maxWidth: 100, isResizable: true },
    { key: '982d2bd3-6ba7-4940-b28d-b34ab8021256', name: 'Чт', fieldName: 'day4', minWidth: 80, maxWidth: 100, isResizable: true },
    { key: '3b713c81-0346-47d6-806a-ab770ecf6f26', name: 'Пт', fieldName: 'day5', minWidth: 80, maxWidth: 100, isResizable: true },
    { key: '4c18c777-6e58-4866-8d96-b55761c7b281', name: 'Сб', fieldName: 'day6', minWidth: 80, maxWidth: 100, isResizable: true },
    { key: 'fd5edea8-d3f3-44c0-815c-e654ad86ad29', name: 'Вс', fieldName: 'day7', minWidth: 80, maxWidth: 100, isResizable: true },
  ];

  useEffect(() => getItems('api/schedule/groups/screen', setItemsGroups, setLoadingGroups), [reloadGroups]);
  useEffect(() => getItems('api/schedule/doctors/screen', setItemsDoctors, setLoadingDoctors), [reloadDoctors]);

  const onSelectDoctor = (item: IDoctor | undefined) => setSelectedDoctor(item);
  const onSelectGroup = (item: IGroup | undefined) => setSelectedGroup(item);

  const onDeleteGroup = () => openDialog('Удаление', 'Экран "'+selectedGroup?.name+'" будет удален.', () => callAPIPost('api/schedule/groups/screen/delete/'+selectedGroup?.id, { }, undefined, () => forceReloadGroups(!reloadGroups)));
  const onDeleteDoctor = () => openDialog('Удаление', 'Запись "'+selectedDoctor?.name+'" будет удалена из расписания.', () => callAPIPost('api/schedule/doctors/screen/delete/'+selectedDoctor?.id, { }, undefined, () => forceReloadDoctors(!reloadDoctors)));
  
  const onEditGroup = () => openEditPanel(
    (selectedGroup ? 'Изменить': 'Добавить' )+' экран', [
      { key: 'pos', type: 'number', value: selectedGroup?.pos.toString() || '0', label: 'Позиция' },
      { key: 'name', type: 'text', value: selectedGroup?.name, label: 'Имя' },
      { key: 'title', type: 'text', value: selectedGroup?.title || 'врач', label: 'Заголовок столбца с именем врача' },
      { key: 'days', type: 'number', value: selectedGroup?.days.toString() || '5', label: 'Количество отображаемых дней недели' },
      { key: 'room', type: 'check', value: selectedGroup?.room || 'true', label: 'Отображать столбец кабинет' },
      { key: 'uch', type: 'check', value: selectedGroup?.uch || 'true', label: 'Отображать столбец участок' },
      { key: 'spec', type: 'check', value: selectedGroup?.spec || 'true', label: 'Отображать столбец специальность' },
    ], (values: IGroup) => callAPIPost('api/schedule/groups/screen/'+(selectedGroup?'update':'insert')+'/'+(selectedGroup?.id || uuid()), values, undefined, () => forceReloadGroups(!reloadGroups)),
    [ 'name' ]
  );

  const onEditDoctor = () => openEditPanel(
    (selectedDoctor ? 'Изменить': 'Добавить' )+' запись', [
      { key: 'groupid', type: 'selectapi', value: selectedDoctor?.groupid, label: 'Экран', api: 'api/schedule/groupsdrop/screen' },
      { key: 'pos', type: 'number', value: selectedDoctor?.pos.toString() || '0', label: 'Позиция' },
      { key: 'room', type: 'text', value: selectedDoctor?.room, label: 'Кабинет' },
      { key: 'uch', type: 'text', value: selectedDoctor?.uch, label: 'Участок' },
      { key: 'spec', type: 'text', value: selectedDoctor?.spec, label: 'Специальность' },
      { key: 'name', type: 'text', value: selectedDoctor?.name, label: 'Имя' },
      { key: 'day0', type: 'text', value: selectedDoctor?.day0, label: 'Неделя' },
      { key: 'day1', type: 'text', value: selectedDoctor?.day1, label: 'Понедельник' },
      { key: 'day2', type: 'text', value: selectedDoctor?.day2, label: 'Вторник' },
      { key: 'day3', type: 'text', value: selectedDoctor?.day3, label: 'Среда' },
      { key: 'day4', type: 'text', value: selectedDoctor?.day4, label: 'Четверг' },
      { key: 'day5', type: 'text', value: selectedDoctor?.day5, label: 'Пятница' },
      { key: 'day6', type: 'text', value: selectedDoctor?.day6, label: 'Суббота' },
      { key: 'day7', type: 'text', value: selectedDoctor?.day7, label: 'Воскресенье' },
      { key: 'code', type: 'text', value: selectedDoctor?.code, label: 'Цвет строки' },
    ], (values: IDoctor) => callAPIPost('api/schedule/doctors/screen/'+(selectedDoctor?'update':'insert')+'/'+(selectedDoctor?.id || uuid()), values, undefined, () => forceReloadDoctors(!reloadDoctors)),
    [ 'groupid', 'name' ]
  );

  const commandsEditGroup = [
    { disabled: selectedGroup !== undefined, key: 'add', name: 'Добавить', iconProps: { iconName: 'icon-plus' }, onClick: onEditGroup },
    { disabled: !selectedGroup, key: 'edit', name: 'Изменить', iconProps: { iconName: 'icon-edit-2' }, onClick: onEditGroup },
    { disabled: !selectedGroup, key: 'delete', name: 'Удалить', iconProps: { iconName: 'icon-trash' }, onClick: onDeleteGroup },
    { key: 'refresh', name: 'Обновить', iconProps: { iconName: 'icon-refresh-cw' }, onClick: () => forceReloadGroups(!reloadGroups) },
    { disabled: !selectedGroup, key: 'link', name: 'Открыть страницу с расписанием', iconProps: { iconName: 'icon-external-link' }, onClick: () => window.open('api/schedule/infoscreen/' + selectedGroup?.id + '/40', '_blank') },
  ];
  const commandsEditDoctor = [
    { disabled: selectedDoctor !== undefined, key: 'add', name: 'Добавить', iconProps: { iconName: 'icon-plus' }, onClick: onEditDoctor },
    { disabled: !selectedDoctor, key: 'edit', name: 'Изменить', iconProps: { iconName: 'icon-edit-2' }, onClick: onEditDoctor },
    { disabled: !selectedDoctor, key: 'delete', name: 'Удалить', iconProps: { iconName: 'icon-trash' }, onClick: onDeleteDoctor },
    { key: 'refresh', name: 'Обновить', iconProps: { iconName: 'icon-refresh-cw' }, onClick: () => forceReloadDoctors(!reloadDoctors) },
  ];

  return (
    <Module {...props}>
      <TabsLinks links={['Расписание', 'Экраны']} onClick={(value) => setTabIndexSite(value)} tabIndex={tabIndexSite}/>
      <TabsContainer tabIndex={tabIndexSite}>
        <Table commands={commandsEditDoctor} onSelect={onSelectDoctor} items={itemsDoctors} columns={columnsDoctors} loading={loadingDoctors} grouped={true}/>
        <Table commands={commandsEditGroup} onSelect={onSelectGroup} items={itemsGroups} columns={columnsGroups} loading={loadingGroups} sorting={false}/>
      </TabsContainer>
    </Module>
  );
}
