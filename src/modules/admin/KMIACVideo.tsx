import React, { useState, useEffect } from 'react';
import Module, { Button, Table, Dropdown, Inline, getItems, callAPI, renderLink, /*renderTooltip,*/ TextField } from 'components';

export default function ModuleKMIACVideo({...props}) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reload, forceReload] = useState(true);
  const [filter, setFilter] = useState('');
  const [all, setAll] = useState('filter');
  const columns = [
    { key: '148f4cc6-5177-4457-bbf5-f2339fbc9463', name: 'Тех. включение', fieldName: 'tech', minWidth: 100, maxWidth: 100, isResizable: true },
    { key: '6e3f68b8-4c30-46d6-a15b-d0039a83f101', name: 'Время', fieldName: 'time', minWidth: 100, maxWidth: 100, isResizable: true },
    { key: '8a42cd6e-387a-4000-8956-7e67edee8bfd', name: 'Тема', fieldName: 'theme', minWidth: 500, maxWidth: 700, isResizable: true },
    { key: 'd5749942-e0f6-40d0-a8c5-4e996b2e09bb', name: 'Организатор', fieldName: 'mo', minWidth: 200, maxWidth: 300, isResizable: true },
    // { key: '5d6b21dd-0f22-4109-9d66-6f988b2e34c7', name: 'Участники', fieldName: 'list', onRender: renderTooltip, minWidth: 100, maxWidth: 100, isResizable: true },
    { key: '3394a5cd-6867-473c-a1b6-3eab5998ee4c', name: 'Подключение', fieldName: 'link', onRender: renderLink, minWidth: 100, maxWidth: 100, isResizable: true, },
  ];
  useEffect(() => callAPI('api/settings/value/kmiacvideo_filter', undefined, setFilter), []);
  useEffect(() => getItems('api/vcparser/list', setItems, setLoading), [reload]);
  return (
    <Module {...props}>
      <Inline>
        <Dropdown
          onChange={setAll}
          defaultValue={all}
          options={[
            {key:'all', text: 'Все'},
            {key:'filter', text: 'Фильтр'},
          ]}
        />
        <TextField onChange={setFilter} placeholder='Фильтр' value={filter}/>
        <Button icon='refresh-cw' text='Обновить' onClick={() => forceReload(!reload)} primary={true}/>
      </Inline>
      <Table items={items} columns={columns} loading={loading} grouped={true} filter={filter} filterColumn='listtip' filterHide={all === 'filter'}/>
    </Module>
  );
}
