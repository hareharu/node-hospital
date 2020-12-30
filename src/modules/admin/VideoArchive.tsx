import React, { useState, useEffect } from 'react';
import Module, { uuid, getItems, TextField, getCookie, openDialog, openEditPanel, callAPI, callAPIPost, Columns, Column, Table, renderIcon, IconButton, Panel, VideoPlayerControlls, CustomVideoPlayer } from 'components';

interface IVideo {
  id: string,
  poster: string,
  name: string,
  duration: string,
  description: string,
  category: string,
  type: string,
  path: string,
}

export default function ModuleVideoArchive({...props}) {

  const [items, setItems] = useState<IVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [hide, setHide] = useState(false);
  const [panel, setPanel] = useState(false);
  const [folder, setFolder] = useState('');
  const [filter, setFilter] = useState('');
  const [selectedVideo, setSelectedVideo] = useState<IVideo | undefined>(undefined);
  const [selectedVideoView, setSelectedVideooView] = useState<IVideo | undefined>(undefined);
  const [reloadList, forceReloadList] = useState(false);
  const access = getCookie('access');

  const onSelectVideo = (item: IVideo | undefined) => setSelectedVideo(item);
  const onSelectVideoView = (item: IVideo | undefined) => setSelectedVideooView(item);
  const onDeleteVideo = () => openDialog('Удаление', 'Видео "'+selectedVideo?.name+'" будет удалено из списка.', () => callAPIPost('api/video/list/delete/'+selectedVideo?.id, { }, undefined, () => forceReloadList(!reloadList)));
  const onEditVideo = () => openEditPanel(
    (selectedVideo ? 'Изменить': 'Добавить' )+' видео', [
      { key: 'name', type: 'text', value: selectedVideo?.name, label: 'Наименование' },
      { key: 'category', type: 'text', value: selectedVideo?.category, label: 'Категория' },
      // { key: 'test', type: 'selecttag', value: selectedVideo?.category, label: 'Тест', api: 'api/video/category'},
      { key: 'path', type: 'text', value: selectedVideo?.path, label: 'Путь до файла на сервере или ссылка' },
      { key: 'description', type: 'multiline', value: selectedVideo?.description, label: 'Описание' },
    ], (values: IVideo) => callAPIPost('api/video/list/'+(selectedVideo?'update':'insert')+'/'+(selectedVideo?.id || uuid()), values, undefined, () => forceReloadList(!reloadList)),
    [ 'name', 'path' ]
  );

  const columns = [
    { key: 'f4f871e0-bbff-44eb-a9cc-ca6073e46ecd', name: 'Наименование', fieldName: 'name', minWidth: 200, maxWidth: 300, isResizable: true },
  ];
  const columnsEdit = [
    { key: 'd4740c49-47ac-416e-8207-168c32e26f2c', name: 'Тип', fieldName: 'icon', isResizable: true, minWidth: 25, maxWidth: 25, onRender: renderIcon},
    { key: '9bec2a6a-157e-4ca0-b7ef-fd6a2d8d0e1c', name: 'Наименование', fieldName: 'name', minWidth: 200, maxWidth: 300, isResizable: true },
    { key: 'cf479892-2e17-43ee-9e4e-26a8fa29ab03', name: 'Категория', fieldName: 'category', minWidth: 100, maxWidth: 200, isResizable: true },
    { key: 'bc1ba4a3-591f-48c8-984a-20afec41316f', name: 'Путь до файла на сервере или ссылка', fieldName: 'path', minWidth: 200, maxWidth: 300, isResizable: true },
  ];
  const commands = [
    {
      key:"search",
      onRender:() => <TextField underlined={true} placeholder='Поиск' onChange={setFilter} search={true} width={200}/>
    },
  ];
  const commandsFar = [ // access==='admin' ? commands : undefined
    { disabled: access !=='admin', key: 'edit', name: 'Редактировать', iconProps: { iconName: 'icon-edit' }, onClick: () => setPanel(true) },
    // { key: 'hide', name: 'Свернуть', iconProps: { iconName: 'icon-arrow-left-circle' }, onClick: () => setHide(true) },
  ];
  const commandsEdit = [
    { disabled: selectedVideo !== undefined, key: 'add', name: 'Добавить', iconProps: { iconName: 'icon-plus' }, onClick: onEditVideo },
    { disabled: !selectedVideo || selectedVideo.type === 'folder', key: 'edit', name: 'Изменить', iconProps: { iconName: 'icon-edit-2' }, onClick: onEditVideo },
    { disabled: !selectedVideo || selectedVideo.type === 'folder', key: 'delete', name: 'Удалить', iconProps: { iconName: 'icon-trash' }, onClick: onDeleteVideo },
    { key: 'refresh', name: 'Обновить', iconProps: { iconName: 'icon-refresh-cw' }, onClick: () => forceReloadList(!reloadList) },
    { disabled: true, key: 'clean', name: 'Убрать удаленные', iconProps: { iconName: 'icon-trash' }},
    { key: 'load', name: 'Загрузить из папки', iconProps: { iconName: 'icon-folder' }, onClick: () => callAPI('api/video/folder', 'Список файлов обновлен', forceReloadList(!reloadList)) },
    { key: 'folder', name: 'Сменить папку', iconProps: { iconName: 'icon-settings' }, onClick: () =>  openDialog('Папка', 'Укажите папку с видео на сервере', (value) => callAPIPost('api/settings/value/videoarchive_folder', { value }, undefined, ()=> setFolder(value)), 'input', folder) },
  ];
  
  useEffect(() => callAPI('api/settings/value/videoarchive_folder', undefined, setFolder), []);
  useEffect(() => getItems('api/video/list', setItems, setLoading), [reloadList]);

  return (
    <Module {...props}>
      <VideoPlayerControlls/>
      <Columns height={'100%'} width={hide ? ['0%', '100%'] : ['40%', '60%']}>
        <Table filter={filter} filterColumn='rowfilter' commands={commands} commandsRight={access==='admin' ? commandsFar : undefined} onSelect={onSelectVideoView} items={items} columns={columns} grouped={true} loading={loading} hideHeader={true}/>
        <Column>
          <div style={{position: "absolute", paddingTop: '5px', display: hide ? 'block' : 'none'}}><IconButton icon='arrow-right-circle' text='Развернуть' onClick={() => setHide(false)}/></div>
          <CustomVideoPlayer path={selectedVideoView ? (selectedVideoView.path.startsWith('http') ? selectedVideoView.path : 'api/video/stream/'+selectedVideoView.id) : undefined}/>
        </Column>
      </Columns>
      <Panel isOpen={panel} onDismiss={() => setPanel(false)} text='Редактирование списка видеороликов' nopadding={true} size='XL'>
        <Table commands={commandsEdit} onSelect={onSelectVideo} items={items} columns={columnsEdit} loading={loading} />
      </Panel>
    </Module>
  );
  
}
