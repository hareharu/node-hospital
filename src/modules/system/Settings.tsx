import React, { useState, useEffect } from 'react';
import Module, { Table, callAPI, callAPIPost, openDialog, getItems } from 'components';

interface ISetting {
  name: string,
  type: string,
  value: string,
  description: string,
}

export default function ModuleSettings({...props}) {
  const [items, setItems] = useState<ISetting[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<ISetting | undefined>(undefined);
  const [reload, forceReload] = useState(false);
 
  const onSelect = (item: ISetting | undefined) => setSelected(item);
  const onReset = () => openDialog('Сброс параметра', 'Параметр будет сброшен к значению по умолчанию.', () => callAPI('api/settings/reset/'+selected?.name, undefined, () => forceReload(!reload)));
  const onEdit = () => openDialog('Изменение параметра', 'Укажите новое значение', (value) => callAPIPost('api/settings/value/'+selected?.name, { value }, undefined, ()=> forceReload(!reload)), selected?.type, selected?.value);
  const commands = [
    { disabled: !selected, key: 'edit', name: 'Изменить', iconProps: { iconName: 'icon-edit-2' }, onClick: onEdit },
    { disabled: !selected, key: 'reset', name: 'Сбросить', iconProps: { iconName: 'icon-trash' }, onClick: onReset },
    { key: 'refresh', name: 'Обновить', iconProps: { iconName: 'icon-refresh-cw' }, onClick: () => forceReload(!reload) },
  ];
  const columns = [
    { key: 'df541f5f-107f-4660-baef-e49032b79aa1', name: 'Код', fieldName: 'name', minWidth: 100, maxWidth: 150, isResizable: true },
    { key: '29856703-cfe6-40bd-9f5a-4256f9f94653', name: 'Тип', fieldName: 'type', minWidth: 70, maxWidth: 70, isResizable: true },
    { key: '0f1f7894-58fe-40f8-a283-c33e698ec41b', name: 'Значение', fieldName: 'value', minWidth: 100, maxWidth: 200, isResizable: true },
    { key: '32414418-d2c7-4f00-8d19-e80d65ee1131', name: 'Описание', fieldName: 'description', minWidth: 150, maxWidth: 200, isResizable: true},
  ];
  useEffect(() => getItems('api/settings/list', setItems, setLoading), [reload]);
  return (
    <Module {...props}>
      <Table commands={commands} onSelect={onSelect} items={items} columns={columns} loading={loading}/>
    </Module>
  );
}
