import React, { useState, useEffect } from 'react';
import Module, { uuid, Table, openEditPanel, callAPIPost, renderHomeItemSide, renderHomeItemType, renderIcon, renderPanelSize, openDialog, getItems, TabsContainer, TabsLinks } from 'components';
import { modules } from 'modules';

interface ILink {
  id: string,
  pos: number,
  side: string,
  type: string,
  text: string,
  url: string,
  icon: string,
}

interface IPanel {
  id: string,
  pos: number,
  key: string,
  name: string,
  size: string,
  icon: string,
}

export default function ModuleHomeLinks({...props}) {
  const [tabIndex, setTabIndex] = useState(0);
  const [itemsLinks, setItemsLinks] = useState<ILink[]>([]);
  const [loadingLinks, setLoadingLinks] = useState(false);
  const [selectedLink, setSelectedLink] = useState<ILink | undefined>(undefined);
  const [reloadLinks, forceReloadLinks] = useState(false);
  const [itemsPanels, setItemsPanels] = useState<IPanel[]>([]);
  const [loadingPanels, setLoadingPanels] = useState(false);
  const [selectedPanel, setSelectedPanel] = useState<IPanel | undefined>(undefined);
  const [reloadPanels, forceReloadPanels] = useState(false);
  let optionsModules: { key: string, name: string, title: string, icon: string, text: string }[] = [];
  modules.forEach((mod: { module: any, key: string, name: string, title: string, icon: string, access: string }) => {
    if (mod.access === 'guest') optionsModules.push({ key: mod.key, name: mod.name, title: mod.title, icon: mod.icon, text: mod.name });
  })
  const onSelectLink = (item: ILink | undefined) => setSelectedLink(item);
  const onDeleteLink = () => openDialog('Удаление', 'Элемент меню "'+selectedLink?.text+'" будет удален.', () => callAPIPost('api/homelinks/homepage/delete/'+selectedLink?.id, { }, undefined, () => forceReloadLinks(!reloadLinks)));
  const onEditLink = (type: string) => openEditPanel(
    (selectedLink ? 'Изменить': 'Добавить' )+' элемент меню', [
      { disabled: true, key: 'type', type: 'select', value: type, label: 'Тип', options: [
        {key:'header', text: 'Заголовок'},
        {key:'text', text: 'Текст'},
        {key:'link', text: 'Ссылка'},
        {key:'notice', text: 'Объявление'},
        {key:'search', text: 'Поисковик'},
        {key:'image', text: 'Изображение'}
      ]},
      { key: 'side', type: 'select', value: selectedLink?.side || 'top', label: 'Положение', options: [
        {key:'top', text: 'Верхняя строка'},
        {key:'bottom', text: 'Подвал'},
        {key:'left', text: 'Левый столбец'},
        {key:'right', text: 'Правый столбец'}
      ]},
      { key: 'pos', type: 'number', value: selectedLink?.pos.toString() || '0', label: 'Позиция' },
      { disabled: type !== 'link', key: 'icon', type: 'icon', value: selectedLink?.icon, label: 'Иконка' },
      { key: 'text', type: 'text', value: selectedLink?.text, label: 'Текст' },
      { disabled: (type === 'text' || type === 'header' || type === 'notice'), key: 'url', type: 'text', value: selectedLink?.url, label: 'URL' },
    ], (values: ILink) => callAPIPost('api/homelinks/homepage/'+(selectedLink?'update':'insert')+'/'+(selectedLink?.id || uuid()), values, undefined, () => forceReloadLinks(!reloadLinks))
  );
  const onSelectPanel = (item: IPanel | undefined) => setSelectedPanel(item);
  const onDeletePanel = () => openDialog('Удаление', 'Модуль "'+selectedPanel?.name+'" будет удален.', () => callAPIPost('api/homelinks/panels/delete/'+selectedPanel?.id, { }, undefined, () => forceReloadPanels(!reloadPanels)));
  const onEditPanel = () => openEditPanel(
    (selectedPanel ? 'Изменить': 'Добавить' )+' панель', [
      { key: 'pos', type: 'number', value: selectedPanel?.pos.toString() || '0', label: 'Позиция' },
      { key: 'key', type: 'select', value: selectedPanel?.key, label: 'Модуль', options: optionsModules },
      { key: 'name', type: 'text', value: selectedPanel?.name, label: 'Имя (если нужно отличное от имени модуля)' },
      { key: 'icon', type: 'icon', value: selectedPanel?.icon, label: 'Иконка' },
      { key: 'size', type: 'select', value: selectedPanel?.size, label: 'Размер', options: [
        {key: 'S', text: 'Маленькая'},
        {key: 'M', text: 'Средняя'},
        {key: 'L', text: 'Большая'},
        {key: 'XL', text: 'Огромная'},
      ] },
    ], (values: IPanel) => callAPIPost('api/homelinks/panels/'+(selectedPanel?'update':'insert')+'/'+(selectedPanel?.id || uuid()), values, undefined, () => forceReloadPanels(!reloadPanels))
  );
  const commandsLinks = [
    {
      key: 'add',
      text: 'Добавить',
      iconProps: { iconName: 'icon-plus' },
      disabled: selectedLink !== undefined,
      subMenuProps: {
        items: [
          { disabled: selectedLink !== undefined, key: 'addheader', name: 'Заголовок', iconProps: { iconName: 'icon-type' }, onClick: () => onEditLink('header') },
          { disabled: selectedLink !== undefined, key: 'addtext', name: 'Текст', iconProps: { iconName: 'icon-file-text' }, onClick: () => onEditLink('text') },
          { disabled: selectedLink !== undefined, key: 'addlink', name: 'Ссылку', iconProps: { iconName: 'icon-link' }, onClick: () => onEditLink('link') },
          { disabled: selectedLink !== undefined, key: 'addnotice', name: 'Объявление', iconProps: { iconName: 'icon-alert-circle' }, onClick: () => onEditLink('notice') },
          { disabled: selectedLink !== undefined, key: 'addsearch', name: 'Поисковик', iconProps: { iconName: 'icon-search' }, onClick: () => onEditLink('search') },
          { disabled: selectedLink !== undefined, key: 'addimage', name: 'Изображение', iconProps: { iconName: 'icon-image' }, onClick: () => onEditLink('image') },
        ]
      }
    },
    { disabled: !selectedLink, key: 'edit', name: 'Изменить', iconProps: { iconName: 'icon-edit-2' }, onClick: () => onEditLink(selectedLink?.type || '') },
    { disabled: !selectedLink, key: 'delete', name: 'Удалить', iconProps: { iconName: 'icon-trash' }, onClick: onDeleteLink },
    { key: 'refresh', name: 'Обновить', iconProps: { iconName: 'icon-refresh-cw' }, onClick: () => forceReloadLinks(!reloadLinks) },
  ];
  const commandsPanels = [
    { disabled: selectedPanel !== undefined, key: 'add', name: 'Добавить', iconProps: { iconName: 'icon-plus' }, onClick: () => onEditPanel() },
    { disabled: !selectedPanel, key: 'edit', name: 'Изменить', iconProps: { iconName: 'icon-edit-2' }, onClick: () => onEditPanel() },
    { disabled: !selectedPanel, key: 'delete', name: 'Удалить', iconProps: { iconName: 'icon-trash' }, onClick: onDeletePanel },
    { key: 'refresh', name: 'Обновить', iconProps: { iconName: 'icon-refresh-cw' }, onClick: () => forceReloadPanels(!reloadPanels) },
  ];
  const columnsLinks = [
    { key: '13a81510-e70e-430d-8d10-d2d940e86db9', name: 'Положение', fieldName: 'side', minWidth: 100, maxWidth: 100, isResizable: true, onRender: renderHomeItemSide },
    { key: '240e49bb-4dfb-45f3-bb23-42e633fd60a1', name: 'Позиция', fieldName: 'pos', minWidth: 70, maxWidth: 70, isResizable: true },
    { key: 'f938e755-3fa8-42f4-9803-c5268ce7139f', name: 'Тип', fieldName: 'type', minWidth: 100, maxWidth: 100, isResizable: true, onRender: renderHomeItemType },
    { key: '4aa0acd9-a3a1-4a58-9b09-6c43808af3cc', name: 'Иконка', fieldName: 'icon', minWidth: 50, maxWidth: 50, isResizable: true, onRender: renderIcon },
    { key: 'f27b2385-95e2-4aaa-bc9d-6b7234245c6e', name: 'Текст', fieldName: 'text', minWidth: 200, maxWidth: 400, isResizable: true },
    { key: '1c6a944d-1136-44cb-b324-992bb8bbde71', name: 'URL', fieldName: 'url', minWidth: 200, maxWidth: 400, isResizable: true },
  ];
  const columnsPanels = [
    { key: '27f3709e-f1d4-4e81-974d-45d891bca549', name: 'Позиция', fieldName: 'pos', minWidth: 70, maxWidth: 70, isResizable: true },
    { key: 'a235fa29-6e00-40d1-afdb-c0cfd9e1d2fe', name: 'Модуль', fieldName: 'key', minWidth: 100, maxWidth: 150, isResizable: true,},
    { key: 'cdc9657e-1b0b-41cf-a6b3-27e61ed81715', name: 'Имя', fieldName: 'name', minWidth: 200, maxWidth: 400, isResizable: true },
    { key: '68e3c310-6d88-4ed5-a337-51d58fef02c4', name: 'Иконка', fieldName: 'icon', minWidth: 50, maxWidth: 50, isResizable: true, onRender: renderIcon },
    { key: '5ff70fb9-935d-4a25-b029-ce61e28121bb', name: 'Размер панели', fieldName: 'size', minWidth: 100, maxWidth: 100, isResizable: true, onRender: renderPanelSize },
  ];
  useEffect(() => getItems('api/homelinks/homepage/list', setItemsLinks, setLoadingLinks), [reloadLinks]);
  useEffect(() => getItems('api/homelinks/panels/list', setItemsPanels, setLoadingPanels), [reloadPanels]);
  return (
    <Module {...props}>
      <TabsLinks links={['Ссылки и объявления', 'Модули в панелях']} onClick={(value) => setTabIndex(value)} tabIndex={tabIndex}/>
      <TabsContainer tabIndex={tabIndex}>
        <Table commands={commandsLinks} onSelect={onSelectLink} items={itemsLinks} columns={columnsLinks} loading={loadingLinks}/>
        <Table commands={commandsPanels} onSelect={onSelectPanel} items={itemsPanels} columns={columnsPanels} loading={loadingPanels}/>
      </TabsContainer>
    </Module>
  );
}
