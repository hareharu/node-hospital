import React, { useState, useEffect } from 'react';
import Module, { Columns, IEditPanelInput, TabsLinks, TabsContainer, Table, Tab, getItems, callAPIPost, openDialog, uuid, openEditPanel, Panel, renderDate, renderDateTime, Hide, renderBooleanCheck, } from 'components';

interface IElement {
  id:string;
  name:string;
  description?:string;
  parentid?:string;
  parentname?:string;
  grandparentid?:string;
  grandparentname?:string;
  ondate: string;
  action: string;
}

interface ICatalog {
  //key: string,
  catalog: string,
  name: string,
  element: string,
  commands: any[],
  columns: any[],
  gender: number,
  suffix?: string,
  tags?: {
    key: string,
    name: string,
    column: string
  }[],
  fields: IField[],
}

interface IField {
  key: string,
  name: string,
  blank?: string,
  havegrandparent?: boolean,
  catalog?: string,
}

export default function ModuleReferences({...props}) {

  const [tabIndex, setTabIndex] = useState(0);

  const [itemsElements, setItemsElements] = useState<IElement[]>([]);
  const [deletedElements, setDeletedElements] = useState<boolean>(false);
  const [loadingElements, setLoadingElements] = useState<boolean>(false);
  const [columnsElements, setColumnsElements] = useState<any[]>([]);
  const [selectedElement, setSelectedElement] = useState<(IElement|undefined)>(undefined);
  
  const [itemsCatalogs, setItemsCatalogs] = useState<ICatalog[]>([]);
  // const [deletedCatalogs, setDeletedCatalogs] = useState<boolean>(false);
  const [loadingCatalogs, setLoadingCatalogs] = useState<boolean>(false);
  const [selectedCatalog, setSelectedCatalog] = useState<(ICatalog|undefined)>(undefined);

  const [reloadElements, forceReloadElements] = useState<boolean>(false);
  const [reloadCatalogs, /*forceReloadCatalogs*/] = useState<boolean>(false);

  const [itemsHistory, setItemsHistory] = useState([]); 
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [panelHistory, setPanelHistory] = useState(false);

  useEffect(() => {
    if (selectedCatalog) {
      // setItemsElements([]);
      const index = itemsCatalogs.findIndex(catalog => catalog.catalog === selectedCatalog.catalog);
      setColumnsElements([{ key: 'elementid', name: 'Элемент', fieldName: 'id', isResizable: true, minWidth: 130, maxWidth: 280}, ...itemsCatalogs[index].columns]);
      getItems('api/references/list/'+selectedCatalog.catalog+'/'+(deletedElements?'all':'actual'), setItemsElements, setLoadingElements);
    } else {
      setItemsElements([]);
      setColumnsElements([ { key: 'column0', isResizable: true, minWidth: 100, maxWidth: 100 }, ]);
    }
  }, [itemsCatalogs, deletedElements, selectedCatalog, reloadElements]);

  useEffect(() => {
    getItems('api/references/catalogs', (catalogs) => {
      catalogs.forEach((catalog, index) => {
        catalog.columns = [];
        catalog.fields.forEach(field => catalog.columns.push({ key: field.key, fieldName: field.key, name: field.name, isResizable: true, minWidth: 90, maxWidth: 110}));
        catalog.tags?.forEach(tag => catalog.columns.push({ key: tag.key, fieldName: tag.key, name: tag.column, isResizable: true, minWidth: 40, maxWidth: 60, onRender: renderBooleanCheck}));
      });
      setItemsCatalogs(catalogs);
    }, setLoadingCatalogs);
  }, [reloadCatalogs]);

  const onDeleteElement = () => {
    const index = itemsCatalogs.findIndex(catalog => catalog.catalog === selectedCatalog?.catalog);
    openDialog('Удалить '+itemsCatalogs[index].element.toLowerCase()+(itemsCatalogs[index].suffix ? itemsCatalogs[index]?.suffix : ''), itemsCatalogs[index].element+' "'+selectedElement?.name+'" будет удален'+(itemsCatalogs[index].gender === 2 ? 'а' : itemsCatalogs[index].gender === 3 ? 'о' : '')+'.', () => callAPIPost('api/references/delete/'+itemsCatalogs[index].catalog+'/'+selectedElement?.id, {}, undefined, () => forceReloadElements(!reloadElements)));
  }

  const onEditElement = () => {
    const index = itemsCatalogs.findIndex(catalog => catalog.catalog === selectedCatalog?.catalog);
    const fields: IEditPanelInput[] = [];
    itemsCatalogs[index].fields.forEach(field => {
      switch (field.key) {
        case 'grandparentname': fields.push({ key: 'grandparentid', type: 'selectapi', value: selectedElement?.grandparentid, label: field.name, api: 'api/references/dropdown/'+field.catalog, deftest: field.blank || 'Не задано' }); break;
        case 'parentname': if (field.havegrandparent) {
          fields.push({ key: 'parentid', type: 'selectapi', value: selectedElement?.parentid, label: field.name, api: 'api/references/dropdownfiltered/'+field.catalog, deftest: field.blank || 'Не задано', parent: 'grandparentid' });
        } else {
          fields.push({ key: 'parentid', type: 'selectapi', value: selectedElement?.parentid, label: field.name, api: 'api/references/dropdown/'+field.catalog, deftest: field.blank || 'Не задано' });
        } break;
        default: fields.push({ key: field.key, type: 'text', value: selectedElement?.[field.key], label: field.name });
      }
    });
    fields.push({ key: 'ondate', type: 'date', value: '', label: 'Дата изменения', disabled: true });
    openEditPanel(
      (selectedElement ? 'Изменить': 'Добавить' )+' '+itemsCatalogs[index].element.toLowerCase()+(itemsCatalogs[index].suffix ? itemsCatalogs[index].suffix : ''), fields, (values: IElement) => callAPIPost('api/references/'+(selectedElement?'update':'insert')+'/'+itemsCatalogs[index].catalog+'/'+(selectedElement?.id || uuid())+'/'+values.ondate, { name: values.name, description: values.description, parentid: values.parentid }, undefined, () => forceReloadElements(!reloadElements))
    );
  }

  const onTagElement = () => {
    const index = itemsCatalogs.findIndex(catalog => catalog.catalog === selectedCatalog?.catalog);
    const tags: {key: string, type: string, value: string, label: string}[] = [];
    itemsCatalogs[index].tags?.forEach(tag => {
      tags.push({ key: tag.key, type: 'check', value: selectedElement?.[tag.key], label: tag.name });
    });
    openEditPanel(
      'Изменить признаки', tags, (values: IElement) => callAPIPost('api/references/tags/'+selectedElement?.id, { old: selectedElement, new: values }, undefined, () => forceReloadElements(!reloadElements))
    );
  }

  const getHistory = (id?: string) => {
    if (!id) return null;
    setPanelHistory(true);
    getItems('api/references/history/'+id, setItemsHistory, setLoadingHistory);
  }

  const columnsHistory = [
    {key: '98674c37-1f34-4556-8ae3-e4c74db8e686', name: 'Дата', fieldName: 'ondate', isResizable: true, minWidth: 100, maxWidth: 100, onRender: renderDate},
    {key: '29476967-7fc5-4175-8144-33f2ced43ff1', name: 'Действие', fieldName: 'actionname', isResizable: true, minWidth: 90, maxWidth: 110, },
    {key: '9682237b-f7a6-4bdb-8011-948cb3010f16', name: 'Имя', fieldName: 'name', isResizable: true, minWidth: 150, maxWidth: 250, },
    {key: '9cedc5ee-2bc2-477a-8c70-5793567f1e9e', name: 'Описание', fieldName: 'description', isResizable: true, minWidth: 150, maxWidth: 250, },
    {key: 'df299b6d-0aef-4218-8c78-11c6e3c5a1ca', name: 'Родитель', fieldName: 'parentname', isResizable: true, minWidth: 150, maxWidth: 250, },
    {key: 'ba97b7fa-28a6-4c92-9f62-4cc1c0ee2f6d', name: 'Дата изменения', fieldName: 'timestamp', isResizable: true, minWidth: 125, maxWidth: 125, onRender: renderDateTime},
    {key: 'ca4bf592-8b25-4130-a55f-bed874699f61', name: 'Пользователь', fieldName: 'username', isResizable: true, minWidth: 90, maxWidth: 110, },
  ];
  
  const commandsElements = [
    { disabled: selectedElement !== undefined, key: 'add', name: 'Добавить', iconProps: { iconName: 'icon-plus' }, onClick: onEditElement },
    { disabled: !selectedElement || selectedElement?.action === 'delete', key: 'edit', name: 'Изменить', iconProps: { iconName: 'icon-edit-2' }, onClick: onEditElement },
    { disabled: !selectedElement || selectedElement?.action === 'delete', key: 'delete', name: 'Удалить', iconProps: { iconName: 'icon-trash' }, onClick: onDeleteElement },
    { disabled: !selectedCatalog?.tags || !selectedElement || selectedElement?.action === 'delete', key: 'tags', name: 'Признаки', iconProps: { iconName: 'icon-check-square' }, onClick: onTagElement },
    { key: 'refresh', name: 'Обновить', iconProps: { iconName: 'icon-refresh-cw' }, onClick: ()=> forceReloadElements(!reloadElements) },
    { key: 'scope', name: (deletedElements ? 'Скрыть' : 'Показать')+' удаленные', iconProps: { iconName: deletedElements? 'icon-eye-off' : 'icon-eye' }, onClick: () => setDeletedElements(!deletedElements) },
    { key: 'history', name: 'Просмотреть историю', iconProps: { iconName: 'icon-clock' }, onClick: () => getHistory(selectedElement?.id), disabled: !selectedElement },
  ];

  const columnsCatalogs = [
    {key: 'catalog', name: 'Код', fieldName: 'catalog', isResizable: true, minWidth: 100, maxWidth: 150 },
    {key: 'name', name: 'Название', fieldName: 'name', isResizable: true, minWidth: 100, maxWidth: 150 },
  ];

  const commandsCatalogs = [];

  return (
    <Module {...props}>
      <Hide condition={true}>
        <TabsLinks links={['Редактирование', 'Импорт']} onClick={(value) => setTabIndex(value)} tabIndex={tabIndex}/>
        <TabsContainer tabIndex={tabIndex}>
        <Tab/>
          <Tab/>
        </TabsContainer>
      </Hide>
      <Columns height={'100%'} width={['30%', '70%']}>
        <Table items={itemsCatalogs} columns={columnsCatalogs} loading={loadingCatalogs} commands={commandsCatalogs} onSelect={setSelectedCatalog}/>
        <Table items={itemsElements} columns={columnsElements} loading={loadingElements} commands={commandsElements} onSelect={setSelectedElement}/>
      </Columns>
      <Panel loading={loadingHistory} isOpen={panelHistory} onDismiss={() => setPanelHistory(false)} text='История изменений элемента справочника' nopadding={true} size='XL'>
        <Table items={itemsHistory} columns={columnsHistory}/>
      </Panel>
    </Module>
  );

}
