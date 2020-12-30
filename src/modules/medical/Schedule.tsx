import React, { useState, useEffect } from 'react';
import Module, { Hide, getCookie, Table, renderTimeInterval, getItems, Inline, getDateString, DatePicker, Dropdown, TextField, SaveToExcel, Panel, callAPIPost, uuid, TabsContainer, openEditPanel, openDialog, TabsLinks, Button, niluuid } from 'components';

interface IGroup {
  id: string,
  pos: string,
  name: string,
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
export default function ModuleSchedule({...props}) {
  const [itemsGroups, setItemsGroups] = useState<IGroup[]>([]);
  const [itemsDoctors, setItemsDoctors] = useState<IDoctor[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<IGroup | undefined>(undefined);
  const [selectedDoctor, setSelectedDoctor] = useState<IDoctor| undefined>(undefined);

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [datefrom, setDatefrom] = useState(getDateString('today'));
  const [filter, setFilter] = useState('');
  const [doct, setDoct] = useState('2');
  const [tabIndexSite, setTabIndexSite] = useState(0);
  const [panelSite, setPanelSite] = useState(false);
  const [loadingDoctors, setLoadingDoctors] = useState(false);
  const [loadingGroups, setLoadingGroups] = useState(false);
  const [reload, /*forceReload*/] = useState(true);
  const [reloadGroups, forceReloadGroups] = useState(true);
  const [reloadDoctors, forceReloadDoctors] = useState(true);
  const access = getCookie('access');
  const columns = [
    { key: '12b390cc-cdd5-434f-9236-ed31126178a5', name: 'Врач', fieldName: 'name', minWidth: 200, maxWidth: 300,  isResizable: true },
    { key: '2bcfe580-41e7-4bf9-89dc-222ebdec55fe', name: 'Подразделение', fieldName: 'podr', minWidth: 200, maxWidth: 300, isResizable: true },
    { key: '87fdd919-14e8-4c2c-a23e-4a61d8fa1110', name: 'num', fieldName: 'num', minWidth: 80, maxWidth: 100, isResizable: true },
    { key: '9fa28242-ad07-4bc3-a11e-6b35550eaa4f', name: 'plk', fieldName: 'plk', minWidth: 80, maxWidth: 100, isResizable: true },
    { key: '86322686-24ef-442e-867f-4aad4db73947', name: 'room', fieldName: 'room', minWidth: 80, maxWidth: 100, isResizable: true },
    { key: '67838eed-c59a-4d9d-a531-a957be52cf3a', name: 'пн', fieldName: 'day1', onRender: renderTimeInterval, minWidth: 80, maxWidth: 100, isResizable: true },
    { key: 'f2364217-7a79-4aa3-9b37-655b6613a9fd', name: 'вт', fieldName: 'day2', onRender: renderTimeInterval, minWidth: 80, maxWidth: 100, isResizable: true },
    { key: '83c7e299-6bfe-4a28-8e5c-955e1da89a56', name: 'ср', fieldName: 'day3', onRender: renderTimeInterval, minWidth: 80, maxWidth: 100, isResizable: true },
    { key: 'a59773f9-39dd-4760-83ea-962f7df86e90', name: 'чт', fieldName: 'day4', onRender: renderTimeInterval, minWidth: 80, maxWidth: 100, isResizable: true },
    { key: '79093729-c0d6-4247-aeec-b4ae9b85be70', name: 'пт', fieldName: 'day5', onRender: renderTimeInterval, minWidth: 80, maxWidth: 100, isResizable: true },
    { key: 'bc9feaa5-5fd0-4c03-a0f3-9eb3e2679ca9', name: 'сб', fieldName: 'day6', onRender: renderTimeInterval, minWidth: 80, maxWidth: 100, isResizable: true },
    { key: '5d96ab9f-7a29-440b-8bf4-6d0a63ad9d02', name: 'вс', fieldName: 'day7', onRender: renderTimeInterval, minWidth: 80, maxWidth: 100, isResizable: true },
  ];

  const columnsGroups = [
    { key: '3a2b3a5d-1a0e-4668-9509-434614a386b5', name: 'Позиция', fieldName: 'pos', minWidth: 50, maxWidth: 50,  isResizable: true },
    { key: 'a290d6d5-b7da-48f6-9c39-d23824b6af59', name: 'Имя', fieldName: 'name', minWidth: 200, maxWidth: 300, isResizable: true },
  ];
  const columnsDoctors = [
    { key: '3bbab292-403d-44e7-b3d7-4c0baf9f118a', name: 'Позиция', fieldName: 'pos', minWidth: 50, maxWidth: 50,  isResizable: true },
    { key: '9896af75-f8b3-412e-a14d-9149281295ec', name: 'Код врача', fieldName: 'code', minWidth: 100, maxWidth: 100, isResizable: true },
    { key: '75d9808a-4256-4aff-a0c6-1496e11a4f56', name: 'Участок', fieldName: 'uch', minWidth: 100, maxWidth: 100, isResizable: true },
    { key: '8c4cc8a8-2819-4c09-aaf5-76f95e3a8fb3', name: 'Кабинет', fieldName: 'room', minWidth: 100, maxWidth: 100, isResizable: true },
    { key: 'faa77314-6b1c-4659-ba46-799722f268de', name: 'Должность', fieldName: 'spec', minWidth: 100, maxWidth: 100, isResizable: true },
    { key: '39ec4b62-66bd-4676-ad03-e829cd06651e', name: 'Имя', fieldName: 'name', minWidth: 100, maxWidth: 100, isResizable: true },
    { key: '0c9d9e83-1a09-4ee8-abe1-30100cd536af', name: 'Неделя', fieldName: 'day0', onRender: renderTimeInterval, minWidth: 80, maxWidth: 100, isResizable: true },
    { key: 'c30023b0-4038-4065-a21e-08b04ce0f0ad', name: 'Пн', fieldName: 'day1', onRender: renderTimeInterval, minWidth: 80, maxWidth: 100, isResizable: true },
    { key: 'c9517045-aefd-49e5-a7a6-047f36ece52e', name: 'Вт', fieldName: 'day2', onRender: renderTimeInterval, minWidth: 80, maxWidth: 100, isResizable: true },
    { key: '62206bd2-a2cd-4010-b3bf-c152bba6b613', name: 'Ср', fieldName: 'day3', onRender: renderTimeInterval, minWidth: 80, maxWidth: 100, isResizable: true },
    { key: '8fcea4b0-8d64-44aa-8239-1bc5384de1a3', name: 'Чт', fieldName: 'day4', onRender: renderTimeInterval, minWidth: 80, maxWidth: 100, isResizable: true },
    { key: '45761b17-eb48-477e-a083-b6020472605c', name: 'Пт', fieldName: 'day5', onRender: renderTimeInterval, minWidth: 80, maxWidth: 100, isResizable: true },
    { key: 'ba1f7e86-effa-4f7b-aa76-5162b1b18148', name: 'Сб', fieldName: 'day6', onRender: renderTimeInterval, minWidth: 80, maxWidth: 100, isResizable: true },
    { key: 'aafe5a2e-3bc3-4262-9503-f296cf069e2f', name: 'Вс', fieldName: 'day7', onRender: renderTimeInterval, minWidth: 80, maxWidth: 100, isResizable: true },
  ];

  useEffect(() => getItems('api/schedule/site/groups', setItemsGroups, setLoadingGroups), [reloadGroups]);
  useEffect(() => getItems('api/schedule/site/doctors', setItemsDoctors, setLoadingDoctors), [reloadDoctors]);

  const onSelectDoctor = (item: IDoctor | undefined) => setSelectedDoctor(item);
  const onSelectGroup = (item: IGroup | undefined) => setSelectedGroup(item);

  const onDeleteGroup = () => openDialog('Удаление', 'Группа "'+selectedGroup?.name+'" будет удалена из списка.', () => callAPIPost('api/schedule/site/groups/delete/'+selectedGroup?.id, { }, undefined, () => forceReloadGroups(!reloadGroups)));
  const onDeleteDoctor = () => openDialog('Удаление', 'Запись "'+selectedDoctor?.name+'" будет удалена из списка.', () => callAPIPost('api/schedule/site/doctors/delete/'+selectedDoctor?.id, { }, undefined, () => forceReloadDoctors(!reloadDoctors)));
  
  const onEditGroup = () => openEditPanel(
    (selectedGroup ? 'Изменить': 'Добавить' )+' группу', [
      { key: 'pos', type: 'number', value: selectedGroup?.pos.toString() || '0', label: 'Позиция' },
      { key: 'name', type: 'text', value: selectedGroup?.name, label: 'Имя' },
    ], (values: IGroup) => callAPIPost('api/schedule/site/groups/'+(selectedGroup?'update':'insert')+'/'+(selectedGroup?.id || uuid()), values, undefined, () => forceReloadGroups(!reloadGroups)),
    [ 'name' ]
  );

  const onEditDoctor = () => openEditPanel(
    (selectedDoctor ? 'Изменить': 'Добавить' )+' запись', [
      { key: 'groupid', type: 'selectapi', value: selectedDoctor?.groupid, label: 'Группа', api: 'api/schedule/site/groupsdrop' },
      { key: 'pos', type: 'number', value: selectedDoctor?.pos.toString() || '0', label: 'Позиция' },
      { key: 'code', type: 'selectapi', value: selectedDoctor?.code, label: 'Врач', api: 'api/doctor/list', deftest: '-' },
      { key: 'uch', type: 'text', value: selectedDoctor?.uch, label: 'Участок (заполнить для участковых)' },
      { key: 'name', type: 'text', value: selectedDoctor?.name, label: 'Имя (если не выбран врач)' },
      // { key: 'spec', type: 'text', value: selectedDoctor?.spec, label: 'Должность' },
      { key: 'room', type: 'text', value: selectedDoctor?.room, label: 'Кабинет (если не выбран врач)' },
      { key: 'day0', type: 'text', value: selectedDoctor?.day0, label: 'Неделя (если не выбран врач)' },
      { key: 'day1', type: 'text', value: selectedDoctor?.day1, label: 'Понедельник (если не выбран врач)' },
      { key: 'day2', type: 'text', value: selectedDoctor?.day2, label: 'Вторник (если не выбран врач)' },
      { key: 'day3', type: 'text', value: selectedDoctor?.day3, label: 'Среда (если не выбран врач)' },
      { key: 'day4', type: 'text', value: selectedDoctor?.day4, label: 'Четверг (если не выбран врач)' },
      { key: 'day5', type: 'text', value: selectedDoctor?.day5, label: 'Пятница (если не выбран врач)' },
      { key: 'day6', type: 'text', value: selectedDoctor?.day6, label: 'Суббота (если не выбран врач)' },
      { key: 'day7', type: 'text', value: selectedDoctor?.day7, label: 'Воскресенье (если не выбран врач)' },
    ], (values: IDoctor) => callAPIPost('api/schedule/site/doctors/'+(selectedDoctor?'update':'insert')+'/'+(selectedDoctor?.id || uuid()), values, undefined, () => forceReloadDoctors(!reloadDoctors)),
    [ 'groupid' ]
  );

  const commandsEditGroup = [
    { disabled: selectedGroup !== undefined, key: 'add', name: 'Добавить', iconProps: { iconName: 'icon-plus' }, onClick: onEditGroup },
    { disabled: !selectedGroup, key: 'edit', name: 'Изменить', iconProps: { iconName: 'icon-edit-2' }, onClick: onEditGroup },
    { disabled: !selectedGroup, key: 'delete', name: 'Удалить', iconProps: { iconName: 'icon-trash' }, onClick: onDeleteGroup },
    { key: 'refresh', name: 'Обновить', iconProps: { iconName: 'icon-refresh-cw' }, onClick: () => forceReloadGroups(!reloadGroups) },
  ];
  const commandsEditDoctor = [
    { disabled: selectedDoctor !== undefined, key: 'add', name: 'Добавить', iconProps: { iconName: 'icon-plus' }, onClick: onEditDoctor },
    { disabled: !selectedDoctor, key: 'edit', name: 'Изменить', iconProps: { iconName: 'icon-edit-2' }, onClick: onEditDoctor },
    { disabled: !selectedDoctor, key: 'delete', name: 'Удалить', iconProps: { iconName: 'icon-trash' }, onClick: onDeleteDoctor },
    { key: 'refresh', name: 'Обновить', iconProps: { iconName: 'icon-refresh-cw' }, onClick: () => forceReloadDoctors(!reloadDoctors) },
    { key: 'export', name: 'Экспорт в HTML', iconProps: { iconName: 'icon-code' }, onClick: () => window.open('/api/schedule/updatehtml/'+datefrom, '_blank') },
  ];

  useEffect(() => getItems('api/schedule/list/'+datefrom+'/'+doct, setItems, setLoading), [ datefrom, doct, reload ]);
  return (
    <Module {...props}>
      <Inline>
        <DatePicker defaultValue={datefrom} selectRange={'week'} onChange={setDatefrom}/>
        <Dropdown
          onChange={setDoct}
          defaultValue={doct}
          options={[
            {key:niluuid(), text: 'Все врачи'},
            {key:'1', text: 'Работающие'},
            {key:'2', text: 'С расписанием'},
          ]}
        />
        <TextField placeholder='Поиск по ФИО' onChange={setFilter} search={true} width={200}/>
        <SaveToExcel filename={props.name} sheets={[{ name: 'Расписание', items, columns }]}/>
        <Hide condition={access !== 'admin'}><Button icon='globe' text='Расписание для сайта' onClick={() => setPanelSite(true)}/></Hide>
      </Inline>
      <Table items={items} columns={columns} loading={loading} filter={filter} filterColumn='fio'/>
      <Panel isOpen={panelSite} onDismiss={() => setPanelSite(false)} text='Редактирование расписания для сайта' nopadding={true} size='XL'>
        <TabsLinks links={['Записи', 'Группы']} onClick={(value) => setTabIndexSite(value)} tabIndex={tabIndexSite}/>
        <TabsContainer tabIndex={tabIndexSite}>
          <Table message='В данный момент чтобы увидеть изменения нужно нажать на "Экспорт в HTML" и после формирования таблицы нажать на "Обновить". Для записей без врачей (выделены синим) некоректно отображается время приема.' commands={commandsEditDoctor} onSelect={onSelectDoctor} items={itemsDoctors} columns={columnsDoctors} loading={loadingDoctors} grouped={true}/>
          <Table commands={commandsEditGroup} onSelect={onSelectGroup} items={itemsGroups} columns={columnsGroups} loading={loadingGroups} sorting={false}/>
        </TabsContainer>
      </Panel>
    </Module>
  );
}
