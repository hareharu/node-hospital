import React, { useState, useEffect } from 'react';
import Module, { Columns, Dropdown, TextEditor, TabsLinks, TabsContainer, callAPIPost, openEditPanel, NewsPreview, INews, Panel, Button, Table, Inline, TextField, DatePicker, renderDate, getDateString, openDialog, showMessage, getItems, uuid, niluuid } from 'components';

interface INewsCategory {
  id: string;
  name: string;
}

export default function ModuleNewsBoard({...props}) {
  const [panel, setPanel] = useState(false);
  const [name, setName] = useState('');
  const [date, setDate] = useState(getDateString('today'));
  const [dateHide, setDateHide] = useState('');
  const [text, setText] = useState('');
  const [category, setCategory] = useState(niluuid());
  const [id, setId] = useState(undefined);
  const [items, setItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState<INews | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [itemsCategory, setItemsCategory] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState<INewsCategory | undefined>(undefined);
  const [loadingCategory, setLoadingCategory] = useState(false);
  const [loadingEditor, setLoadingEditor] = useState(false);
  const [modified, setModified] = useState(false);
  const [reload, forceReload] = useState(true);
  const [reloadCategory, forceReloadCategory] = useState(true);
  const [tabIndex, setTabIndex] = useState(0);
  const onSelect = (item: any) => {
    setSelectedItem(item)
    setText('');
    if (item) {
      setId(item.id);
      setName(item.name);
      setDate(item.day);
      setDateHide(item.hide);
      setCategory(item.categoryid);
    }else{
      setId(undefined);
      setName('');
      setCategory(niluuid());
      setDate(getDateString('today'));
      setDateHide('');
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
    fetch('/api/news/list/'+id,{credentials: 'same-origin'})
    .then(response => { if (!response.ok) { throw Error(response.statusText); }
      return response.json();
    })
    .then(json => { if (json.status === 'bad') { throw Error(json.error); }
      setName(json.data.name);
      setDate(json.data.day);
      setDateHide(json.data.hide);
      setText(json.data.text);
      setCategory(json.data.categoryid);
      setLoadingEditor(false);
      setPanel(true);
    })
    .catch(err => { showMessage(err); setLoadingEditor(false); });
  }
  const onDelete = () => {
    openDialog('Удаление', 'Запись "' + name + '" будет удалена.', () => {
      fetch('/api/news/delete',{body: JSON.stringify({
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
    fetch('/api/news/edit',{body: JSON.stringify({
      id: id,
      newid: uuid(),
      name: name,
      text: text,
      day: date,
      hide: dateHide,
      categoryid: category,
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
  const onSelectCategory = (item: INewsCategory| undefined) => setSelectedCategory(item);
  const onDeleteCategory = () => openDialog('Удаление', 'Категория "'+selectedCategory?.name+'" будет удалена.', () => callAPIPost('api/news/category/delete/'+selectedCategory?.id, { }, undefined, () => forceReloadCategory(!reloadCategory)));
  const onEditCategory = () => openEditPanel(
    (selectedCategory ? 'Изменить': 'Добавить' )+' категорию', [
      { key: 'name', type: 'text', value: selectedCategory?.name, label: 'наименование' },
    ], (values: INewsCategory) => callAPIPost('api/news/category/'+(selectedCategory?'update':'insert')+'/'+(selectedCategory?.id || uuid()), values, undefined, () => forceReloadCategory(!reloadCategory))
  , [ 'name']);
  const columns = [
    { key: 'd4a51ac0-130e-4aed-9ad6-37b088fdc44d', name: 'Дата', fieldName: 'day', onRender: renderDate, minWidth: 90, maxWidth: 90, isResizable: true },
    { key: 'c3222963-0b3c-4978-b4bc-8d5a1f434ad2', name: 'Категория', fieldName: 'category', minWidth: 80, maxWidth: 110, isResizable: true },
    { key: 'f2f1a1cd-3f1f-4861-a387-f15a644e68aa', name: 'Заголовок', fieldName: 'name', minWidth: 120, maxWidth: 250,  isResizable: true, isSorted: true },
    // { key: '6737c96d-949b-4569-9ebe-d84db405e77c', name: 'Создан', fieldName: 'added', onRender: renderDateTime, minWidth: 125, maxWidth: 125, isResizable: true },
    // { key: 'dd6dbc90-1b63-429a-af0b-e0d5306a10c2', name: 'Изменен', fieldName: 'edited', onRender: renderDateTime, minWidth: 125, maxWidth: 125, isResizable: true },
  ];
  const commands = [
    { key: 'add', name: 'Добавить', iconProps: { iconName: 'icon-plus' }, onClick: onAdd, disabled: id },
    { key: 'edit', name: 'Редактировать', iconProps: { iconName: 'icon-edit-2' }, onClick: onEdit, disabled: !id },
    { key: 'delete', name: 'Удалить', iconProps: { iconName: 'icon-trash' }, onClick: onDelete, disabled: !id },
    { key: 'refresh', name: 'Обновить', iconProps: { iconName: 'icon-refresh-cw' }, onClick: () => forceReload(!reload) },
  ];
  const columnsCategory = [
    { key: 'df3268d6-2cdf-45bd-a53a-27eb4c686b1d', name: 'Наименование', fieldName: 'name', minWidth: 200, maxWidth: 250, isResizable: true },
  ];
  const commandsCategory = [
    { key: 'add', name: 'Добавить', iconProps: { iconName: 'icon-plus' }, onClick: onEditCategory, disabled: selectedCategory !== undefined },
    { key: 'edit', name: 'Редактировать', iconProps: { iconName: 'icon-edit-2' }, onClick: onEditCategory, disabled: selectedCategory === undefined },
    { key: 'delete', name: 'Удалить', iconProps: { iconName: 'icon-trash' }, onClick: onDeleteCategory, disabled: selectedCategory === undefined },
    { key: 'refresh', name: 'Обновить', iconProps: { iconName: 'icon-refresh-cw' }, onClick: () => forceReloadCategory(!reloadCategory) },
  ];
  useEffect(() => getItems('api/news/list', setItems, setLoading), [reload]);
  useEffect(() => getItems('api/news/category', setItemsCategory, setLoadingCategory), [reloadCategory]);

  return (
    <Module {...props}>
      <Columns width={['40%', '60%']}>
        <TabsLinks links={['Новости', 'Категории']} onClick={(value) => setTabIndex(value)} tabIndex={tabIndex}/>
      </Columns>
      <Columns height={'100%'} width={['40%', '60%']}>
        <TabsContainer tabIndex={tabIndex}>
          <Table commands={commands} onSelect={onSelect} items={items} columns={columns} loading={loading}/>
          <Table commands={commandsCategory} onSelect={onSelectCategory} items={itemsCategory} columns={columnsCategory} loading={loadingCategory}/>
        </TabsContainer>
        <NewsPreview text={selectedItem ? selectedItem.text : ''} name={selectedItem ? selectedItem.name : ''} />
      </Columns>
      <Panel loading={loadingEditor} confirm='Изменения не будут сохранены' preventEscape={true} nopadding={true} size='C' width='21cm' isOpen={panel} onDismiss={() => setPanel(false)} text={id ? 'Изменить ' + name : 'Добавить новую запись'}>
        <Inline>
          <DatePicker onChange={setDate} defaultValue={date} label='Дата'/>
          <Dropdown onChange={setCategory} defaultValue={category} defaultText='Без категории' api='api/news/categorydropdown' width={250} label='Категория'/>
          <DatePicker onChange={setDateHide} defaultValue={dateHide} label='Актуально до'/>
          <TextField placeholder='Заголовок' onChange={setName} defaultValue={name} width={200} label='Заголовок'/>
          <Button primary={true} icon='save' text='Сохранить' onClick={onSave} disabled={name.length===0 || !modified} label='&nbsp;'/>
        </Inline>
        <TextEditor full={true} onChange={(value) => { setText(value); setModified(true); }} value={text} />
      </Panel>
    </Module>
  );
}
