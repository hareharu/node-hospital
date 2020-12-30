import React, { useState, useEffect } from 'react';
import Module, { TextEditor, Panel, Button, Table, Inline, TextField, renderDateTime, openDialog, showMessage, getItems, uuid } from 'components';
export default function ModuleTemplates({...props}) {
  const [panel, setPanel] = useState(false);
  const [name, setName] = useState('');
  const [full, setFull] = useState('');
  const [text, setText] = useState('');
  const [id, setId] = useState(undefined);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingEditor, setLoadingEditor] = useState(false);
  const [modified, setModified] = useState(false);
  const [reload, forceReload] = useState(true);
  const onSelect = (item: any) => {
    setText('');
    if (item) {
      setId(item.id);
      setName(item.name);
      setFull(item.full);
    }else{
      setId(undefined);
      setName('');
      setFull('');
    }
  }
  const onAdd = () => {
    onSelect(undefined);
    setPanel(true);
    setModified(false);
  }
  const onEdit = () => {
    setModified(false);
    setLoadingEditor(true);
    fetch('/api/records/template/'+id,{credentials: 'same-origin'})
    .then(response => { if (!response.ok) { throw Error(response.statusText); }
      return response.json();
    })
    .then(json => { if (json.status === 'bad') { throw Error(json.error); }
      setName(json.data.name);
      setFull(json.data.full);
      setText(json.data.text);
      setLoadingEditor(false);
      setPanel(true);
    })
    .catch(err => { showMessage(err); setLoadingEditor(false); });
  }
  const onDelete = () => {
    openDialog('Удаление', 'Шаблон "' + name + '" будет удален.', () => {
      fetch('/api/records/deletetemplate',{body: JSON.stringify({
        id: id,
      }), method: 'POST', credentials: 'same-origin',headers: {'Content-Type': 'application/json'}})
      .then(response => {
        if (!response.ok) {
          throw Error(response.statusText);
        }
        forceReload(!reload);
      });
    });
  }
  const onSave = () => {
    setLoadingEditor(true);
    fetch('/api/records/edittemplate',{body: JSON.stringify({
      id: id,
      newid: uuid(),
      name: name,
      full: full,
      text: text,
    }), method: 'POST', credentials: 'same-origin',headers: {'Content-Type': 'application/json'}})
    .then(response => {
      if (!response.ok) { throw Error(response.statusText);}
      return response.json();
    })
    .then(json => { if (json.status === 'bad') { throw Error(json.error); }
      if (!id) onSelect(undefined);
      setModified(false);
      setPanel(false);
      setLoadingEditor(false);
      forceReload(!reload);
    }).catch(err => { showMessage(err); setLoadingEditor(false); });
  }
  const columns = [
    { key: '695c98dd-8b7c-492d-ac8f-f4db91d8d3a3', name: 'Сокращенное имя', fieldName: 'name', minWidth: 200, maxWidth: 250,  isResizable: true, isSorted: true },
    { key: '40641919-2ef9-4ebf-9695-53dcffc196b3', name: 'Полное имя', fieldName: 'full', minWidth: 300, maxWidth: 400, isResizable: true },
    { key: 'fcb511bb-8aea-47fd-8f83-ae973d1a2271', name: 'Создан', fieldName: 'added', onRender: renderDateTime, minWidth: 125, maxWidth: 125, isResizable: true },
    { key: 'c2ed9644-47a4-4f77-9a3f-e87ac6689865', name: 'Изменен', fieldName: 'edited', onRender: renderDateTime, minWidth: 125, maxWidth: 125, isResizable: true },
  ];
  const commands = [
    { key: 'add', name: 'Добавить', iconProps: { iconName: 'icon-plus' }, onClick: onAdd, disabled: id },
    { key: 'edit', name: 'Редактировать', iconProps: { iconName: 'icon-edit-2' }, onClick: onEdit, disabled: !id },
    { key: 'delete', name: 'Удалить', iconProps: { iconName: 'icon-trash' }, onClick: onDelete, disabled: !id },
  ];
  useEffect(() => getItems('api/records/gettemplates', setItems, setLoading), [reload]);
  return (
    <Module {...props}>
      <Table commands={commands} onSelect={onSelect} items={items} columns={columns} loading={loading}/>
      <Panel loading={loadingEditor} confirm='Изменения не будут сохранены' preventEscape={true} nopadding={true} size='C' width='21cm' isOpen={panel} onDismiss={() => setPanel(false)} text={id ? 'Изменить ' + name : 'Добавить новый шаблон'}>
        <Inline>
          <TextField placeholder='Имя сокращенно' onChange={setName} defaultValue={name} width={200}/>
          <TextField placeholder='Имя полностью' onChange={setFull} defaultValue={full} width={350}/>
          <Button primary={true} icon='save' text='Сохранить и закрыть' onClick={onSave} disabled={name.length===0 || !modified}/>
        </Inline>
        <TextEditor full={true} onChange={(value) => { setText(value); setModified(true); }} value={text} />
      </Panel>
    </Module>
  );
}
