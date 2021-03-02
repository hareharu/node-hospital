import React, { useState, useEffect } from 'react';
import Module, { Table, TabsLinks, TabsContainer, Tab, Columns, callAPI, callAPIPost, openDialog, openEditPanel, getItems, getItemsPost, uuid, renderFieldType } from 'components';

interface ISetting {
  name: string,
  type: string,
  value: string,
  description: string,
}

interface IHardwareTag {
  id: string,
  key: string,
  class: string,
  field: string,
  name: string,
  type: string,
  pos: number,
}

interface IHardwareSelect {
  id: string,
  class: string,
  field: string,
  key: string,
  name: string,
}

export default function ModuleSettings({...props}) {
  const [itemsSetting, setItemsSetting] = useState<ISetting[]>([]);
  const [loadingSetting, setLoadingSetting] = useState(false);
  const [selectedSetting, setSelectedSetting] = useState<ISetting | undefined>(undefined);
  const [reloadSetting, forceReloadSetting] = useState(false);
  const [itemsHardwareTag, setItemsHardwareTag] = useState<IHardwareTag[]>([]);
  const [loadingHardwareTag, setLoadingHardwareTag] = useState(false);
  const [selectedHardwareTag, setSelectedHardwareTag] = useState<IHardwareTag | undefined>(undefined);
  const [reloadHardwareTag, forceReloadHardwareTag] = useState(false);
  const [itemsHardwareSelect, setItemsHardwareSelect] = useState<IHardwareSelect[]>([]);
  const [loadingHardwareSelect, setLoadingHardwareSelect] = useState(false);
  const [selectedHardwareSelect, setSelectedHardwareSelect] = useState<IHardwareSelect | undefined>(undefined);
  const [reloadHardwareSelect, forceReloadHardwareSelect] = useState(false);
  const [tabIndex, setTabIndex] = useState(0);
  const onSelectSetting = (item: ISetting | undefined) => setSelectedSetting(item);
  const onResetSetting = () => openDialog('Сброс параметра', 'Параметр будет сброшен к значению по умолчанию.', () => callAPI('api/settings/reset/'+selectedSetting?.name, undefined, () => forceReloadSetting(!reloadSetting)));
  const onEditSetting = () => openDialog('Изменение параметра', 'Укажите новое значение', (value) => callAPIPost('api/settings/value/'+selectedSetting?.name, { value }, undefined, ()=> forceReloadSetting(!reloadSetting)), selectedSetting?.type, selectedSetting?.value);
  const onSelectHardwareTag = (item: IHardwareTag | undefined) => {
    setSelectedHardwareTag(item);
    if (item?.type == 'select') {
      getItemsPost('api/settings/hardware/select', item, setItemsHardwareSelect, setLoadingHardwareSelect);
    } else {
      setItemsHardwareSelect([]);
      setLoadingHardwareSelect(false);
    }
  }
  const onDeleteHardwareTag = () => openDialog('Удаление параметра', 'Параметр "'+selectedHardwareTag?.name+'" будет удален.', () => callAPIPost('api/settings/hardware/tags/delete/'+selectedHardwareTag?.id, undefined, undefined, () => forceReloadHardwareTag(!reloadHardwareTag)));
  const onEditHardwareTag = () => openEditPanel(
    (selectedHardwareTag ? 'Изменить': 'Добавить' )+' параметр', [
      { disabled: selectedHardwareTag !== undefined, key: 'class', type: 'select', value: selectedHardwareTag?.class, label: 'Класс', options: [
        { key: 'computer', text: 'Компьютер'},
        { key: 'monitor', text: 'Монитор'},
        { key: 'printer', text: 'Принтер'},
        { key: 'scaner', text: 'Сканер'},
        { key: 'ups', text: 'ИБП'},
        { key: 'network', text: 'Сетевое'}
      ]},
      // { disabled: selectedHardwareTag !== undefined, key: 'field', type: 'text', value: selectedHardwareTag?.field, label: 'Код' },
      { key: 'name', type: 'text', value: selectedHardwareTag?.name, label: 'Имя' },
      { key: 'type', type: 'select', value: selectedHardwareTag?.type, label: 'Тип', options: [
        {key:'input', text: 'Текст'},
        {key:'date', text: 'Дата'},
        {key:'select', text: 'Список'},
        {key:'toggle', text: 'Да/Нет'}
      ]},
      { key: 'pos', type: 'number', value: selectedHardwareTag?.pos.toString() || '0', label: 'Позиция' }
    ], (values: IHardwareTag) => callAPIPost('api/settings/hardware/tags/'+(selectedHardwareTag?'update':'insert')+'/'+(selectedHardwareTag?.id || uuid()), values, undefined, () => forceReloadHardwareTag(!reloadHardwareTag))
    , ['class', 'name', 'type']);
  const onSelectHardwareSelect = (item: IHardwareSelect | undefined) => setSelectedHardwareSelect(item);
  const onDeleteHardwareSelect = () => openDialog('Удаление варианта', 'Вариант "'+selectedHardwareSelect?.name+'" будет удален.', () => callAPIPost('api/settings/hardware/select/delete/'+selectedHardwareSelect?.id, undefined, undefined, () => forceReloadHardwareSelect(!reloadHardwareSelect)));
  const onEditHardwareSelect = () => openDialog(
    (selectedHardwareSelect ? 'Изменить': 'Добавить' )+' вариант', 'Введите имя варианта.',
    (value) => callAPIPost('api/settings/hardware/select/'+(selectedHardwareSelect?'update':'insert')+'/'+(selectedHardwareSelect?.id || uuid()), { class: selectedHardwareTag?.class, field: selectedHardwareTag?.field, name: value }, undefined, () => forceReloadHardwareSelect(!reloadHardwareSelect)),
    'input', selectedHardwareSelect?.name
  );
  const commandsSetting = [
    { disabled: !selectedSetting, key: 'edit', name: 'Изменить', iconProps: { iconName: 'icon-edit-2' }, onClick: onEditSetting },
    { disabled: !selectedSetting, key: 'reset', name: 'Сбросить', iconProps: { iconName: 'icon-trash' }, onClick: onResetSetting },
    { key: 'refresh', name: 'Обновить', iconProps: { iconName: 'icon-refresh-cw' }, onClick: () => forceReloadSetting(!reloadSetting) },
  ];
  const columnsSetting = [
    { key: 'df541f5f-107f-4660-baef-e49032b79aa1', name: 'Код', fieldName: 'name', minWidth: 100, maxWidth: 150, isResizable: true },
    { key: '29856703-cfe6-40bd-9f5a-4256f9f94653', name: 'Тип', fieldName: 'type', minWidth: 70, maxWidth: 70, isResizable: true, onRender: renderFieldType },
    { key: '0f1f7894-58fe-40f8-a283-c33e698ec41b', name: 'Значение', fieldName: 'value', minWidth: 100, maxWidth: 200, isResizable: true },
    { key: '32414418-d2c7-4f00-8d19-e80d65ee1131', name: 'Описание', fieldName: 'description', minWidth: 150, maxWidth: 200, isResizable: true},
  ];
  const commandsHardwareTag = [
    { disabled: selectedHardwareTag !== undefined, key: 'add', name: 'Добавить', iconProps: { iconName: 'icon-plus' }, onClick: onEditHardwareTag },
    { disabled: !selectedHardwareTag, key: 'edit', name: 'Изменить', iconProps: { iconName: 'icon-edit-2' }, onClick: onEditHardwareTag },
    { disabled: !selectedHardwareTag, key: 'reset', name: 'Удалить', iconProps: { iconName: 'icon-trash' }, onClick: onDeleteHardwareTag },
    { key: 'refresh', name: 'Обновить', iconProps: { iconName: 'icon-refresh-cw' }, onClick: () => forceReloadHardwareTag(!reloadHardwareTag) },
  ];
  const columnsHardwareTag = [
    { key: '1ab452f5-2346-4d88-afb3-d3fe7b8c0b51', name: 'Имя', fieldName: 'name', minWidth: 200, maxWidth: 300, isResizable: true },
    { key: 'd2d71d05-905b-4c52-884a-fb0207653f6b', name: 'Тип', fieldName: 'type', minWidth: 100, maxWidth: 150, isResizable: true, onRender: renderFieldType },
    { key: '5767209f-5427-4c6e-bb6c-9e36517c4bd2', name: 'Позиция', fieldName: 'pos', minWidth: 50, maxWidth: 100, isResizable: true},
  ];
  const commandsHardwareSelect = [
    { disabled: !selectedHardwareTag || selectedHardwareTag?.type !== 'select' || selectedHardwareSelect !== undefined, key: 'add', name: 'Добавить', iconProps: { iconName: 'icon-plus' }, onClick: onEditHardwareSelect },
    { disabled: !selectedHardwareSelect, key: 'edit', name: 'Изменить', iconProps: { iconName: 'icon-edit-2' }, onClick: onEditHardwareSelect },
    { disabled: !selectedHardwareSelect, key: 'reset', name: 'Удалить', iconProps: { iconName: 'icon-trash' }, onClick: onDeleteHardwareSelect },
    { disabled: !selectedHardwareTag || selectedHardwareTag?.type !== 'select', key: 'refresh', name: 'Обновить', iconProps: { iconName: 'icon-refresh-cw' }, onClick: () => forceReloadHardwareSelect(!reloadHardwareSelect) },
  ];
  const columnsHardwareSelect = [
    { key: '2f273347-99a0-4b24-a195-478b51bb044f', name: 'Имя', fieldName: 'name', minWidth: 200, maxWidth: 300, isResizable: true },
  ];
  useEffect(() => getItems('api/settings/list', setItemsSetting, setLoadingSetting), [reloadSetting]);
  useEffect(() => getItems('api/settings/hardware/tags', setItemsHardwareTag, setLoadingHardwareTag), [reloadHardwareTag]);
  useEffect(() => getItemsPost('api/settings/hardware/select', selectedHardwareTag, setItemsHardwareSelect, setLoadingHardwareSelect), [reloadHardwareSelect]);
  return (
    <Module {...props}>
      <TabsLinks links={['Система', 'Оборудование']} onClick={(value) => setTabIndex(value)} tabIndex={tabIndex}/>
      <TabsContainer tabIndex={tabIndex}>
        <Table commands={commandsSetting} onSelect={onSelectSetting} items={itemsSetting} columns={columnsSetting} loading={loadingSetting}/>
        <Tab>
          <Columns width={['60%', '40%']} height='100%'>
            <Table commands={commandsHardwareTag} onSelect={onSelectHardwareTag} items={itemsHardwareTag} columns={columnsHardwareTag} loading={loadingHardwareTag} grouped={true}/>
            <Table commands={commandsHardwareSelect} onSelect={onSelectHardwareSelect} items={itemsHardwareSelect} columns={columnsHardwareSelect} loading={loadingHardwareSelect} hideHeader={true}/>
          </Columns>
        </Tab>
      </TabsContainer>
    </Module>
  );
}
