import React, { useState, useEffect } from 'react';
import Module, { Table, Inline, getItems, TextField, saveFilePost } from 'components';

interface ITemplate {
  key: string,
  id: string,
  name: string,
  date: string,
  path: string,
}

export default function KKBTemplates({...props}) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<ITemplate | undefined>(undefined);
  const [reloadTemplates, forceReloadTemplates] = useState(false);

  const onSelectTemplate = (item: ITemplate | undefined) => setSelectedTemplate(item);
  const onDownloadTemplate = () => saveFilePost('api/kkbparser/file/'+selectedTemplate?.id, { filepath : selectedTemplate?.path }, selectedTemplate?.name);

  const columns = [
    { key: 'a39e37fb-dc76-48af-a1b7-2be427980f58', name: 'Имя файла', fieldName: 'name', minWidth: 500, maxWidth: 600, isResizable: true },
    { key: '8dffb832-9b82-4f6a-95b4-391274be6442', name: 'Дата изменения', fieldName: 'date', minWidth: 150, maxWidth: 200, isResizable: true },
  ];
  const commands = [
    { disabled: !selectedTemplate, key: 'download', name: 'Скачать', iconProps: { iconName: 'icon-save' }, onClick: onDownloadTemplate },
    { key: 'refresh', name: 'Обновить', iconProps: { iconName: 'icon-refresh-cw' }, onClick: () => forceReloadTemplates(!reloadTemplates) },
  ];
  
  useEffect(() => getItems('api/kkbparser/list', setItems, setLoading), [reloadTemplates]);
  return (
    <Module {...props}>
      <Inline>
        <TextField placeholder='Поиск' onChange={setFilter} search={true} width={400}/>
      </Inline>
      <Table commands={commands} onSelect={onSelectTemplate} items={items} columns={columns} loading={loading} grouped={true} hideHeader={true} filter={filter} filterColumn='filter'/>
    </Module>
  );
}
