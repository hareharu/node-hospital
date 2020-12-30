import React, { useState } from 'react';
import Module, { Inline, TextField, Button, getItemsPost, GroupedList } from 'components';
export default function ModuleHBookMKB({...props}) {
  const [mkb, setMkb] = useState('');
  const [mkbname, setMkbname] = useState('');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const columns = [
    { key: '719a9a98-5fce-450c-8184-9aec66ee7e49', name: 'Код', fieldName: 'mkb', minWidth: 60, maxWidth: 70,  isResizable: true },
    { key: '4cc453be-cdf0-4730-a80c-0680961e2e43', name: 'Наименование', fieldName: 'mkbname', minWidth: 500, maxWidth: 600,  isResizable: true, isMultiline: true },
    { key: '6153becc-13d2-4bd6-9616-9f5a5270821e', name: 'Примечание', fieldName: 'notes', minWidth: 200, maxWidth: 300,  isResizable: true, isMultiline: true },
  ];
  return (
    <Module {...props}>
      <Inline>
        <TextField placeholder='Код' onChange={setMkb} width={80}/>
        <TextField placeholder='Наименование'  onChange={setMkbname} width={400}/>
        <Button type='submit' icon='search' text='Найти' primary={true} onClick={() => getItemsPost('api/who/mkb', {mkb, mkbname}, setItems, setLoading)}/>
      </Inline>
      <GroupedList items={items} columns={columns} loading={loading} maxLevel={2}/>
    </Module>
  );
}
