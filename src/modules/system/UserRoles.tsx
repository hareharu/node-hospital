import React, { useState, useEffect } from 'react';
import Module, { Inline, Panel, Button, Table, Dropdown, TextField, renderIcon, openDialog, getItems, IconPicker, callAPI, callAPIPost, uuid, openEditPanel, niluuid, TabsLinks, Columns, Column } from 'components';
import { modules } from 'modules';
export default function ModuleUserRoles({...props}) {
  // const [/*authtypes*/, setAuthtypes] = useState<{key:string, text: string}[]>([]);
  const [panel, setPanel] = useState(false);
  const [panelSecond, setPanelSecond] = useState(false);
  const [loadingMenu, setLoadingMenu] = useState(false);
  const [selectedRolePodr, setSelectedRolePodr] = useState(niluuid());
  const [selectedRole, setSelectedRole] = useState(undefined);
  const [itemsMenu, setItemsMenu] = useState([]);
  const [selectedRoleLinks, setSelectedRoleLinks] = useState(niluuid());
  const [selectedRoleName, setSelectedRoleName] = useState('');
  const [selectedRoleAccess, setSelectedRoleAccess] = useState('user');
  // const [selectedUserGuz, setSelectedUserGuz] = useState<string[]|undefined>(undefined);
  // const [selectedUserWad, setSelectedUserWad] = useState<string[]|undefined>(undefined);
  const [selectedUserWho, setSelectedUserWho] = useState<string[]|undefined>(undefined);
  const [selectedUserWhoOne, setSelectedUserWhoOne] = useState<string|undefined>(undefined);
  const [selectedUserWhoName, setSelectedUserWhoName] = useState<string|undefined>(undefined);
  const [selectedUserWhoLogin, setSelectedUserWhoLogin] = useState<string|undefined>(undefined);
  const [selectedUserWhoDescription, setSelectedUserWhoDescription] = useState<string|undefined>(undefined);
  const [selectedUserWhoDoctor, setSelectedUserWhoDoctor] = useState<string|undefined>(undefined);
  const [selectedUserWhoEmployee, setSelectedUserWhoEmployee] = useState<string|undefined>(undefined);
  const [selectedUserWhoType, setSelectedUserWhoType] = useState<string|undefined>(undefined);
  const [itemsRole, setItemsRole] = useState([]);
  const [loadingRole, setLoadingRole] = useState(false);
  const [/*itemsUserGuz*/, setItemsUserGuz] = useState([]);
  const [/*loadingUserGuz*/, setLoadingUserGuz] = useState(false);
  const [itemsUserWho, setItemsUserWho] = useState([]);
  const [loadingUserWho, setLoadingUserWho] = useState(false);
  const [/*itemsUserWad*/, setItemsUserWad] = useState([]);
  const [/*loadingUserWad*/, setLoadingUserWad] = useState(false);
  const [reload, forceReload] = useState(true);

  const [selectedModule, setSelectedModule] = useState(undefined);
  const [moduleType, setModuleType] = useState('');
  const [moduleTypeName, setModuleTypeName] = useState('');
  const [modulePos, setModulePos] = useState(0);
  const [moduleFolder, setModuleFolder] = useState(niluuid());
  const [moduleKey, setModuleKey] = useState('');
  const [moduleIcon, setModuleIcon] = useState('');
  const [moduleName, setModuleName] = useState('');
  const [moduleTitle, setModuleTitle] = useState('');
  const [moduleUrl, setModuleUrl] = useState('');

  const [tabIndex, setTabIndex] = useState(0);

  const onSelectRole = (item: any) => {
    if (item) {
      setSelectedRole(item.key);
      setSelectedRoleLinks(item.linkskey);
      if (item.deptkey) {
        setSelectedRolePodr(item.deptkey);
      } else {
        setSelectedRolePodr(niluuid());
      }
      setSelectedRoleName(item.text);
      setSelectedRoleAccess(item.access);
    }else{
      setSelectedRole(undefined);
      setSelectedRoleLinks(niluuid());
      setSelectedRolePodr(niluuid());
      setSelectedRoleName('');
      setSelectedRoleAccess('user');
    }
  }
  /*
  const onSelectUserGuz = (items: any) => {
    if (items) {
      let selected: string[] = [];
      items.forEach(item => {
        selected.push(item.id);
      });
      setSelectedUserGuz(selected);
    }else{
      setSelectedUserGuz(undefined);
    }
  }
  */
  /*
  const onSelectUserWad = (items: any) => {
    if (items) {
      let selected: string[] = [];
      items.forEach(item => {
        selected.push(item.id);
      });
      setSelectedUserWad(selected);
    }else{
      setSelectedUserWad(undefined);
    }
  }
  */
  const onSelectUserWho = (items: any) => {
    if (items) {
      let selected: string[] = [];
      items.forEach(item => {
        selected.push(item.id);
      });
      setSelectedUserWhoOne(items[0].id);
      setSelectedUserWhoName(items[0].name);
      setSelectedUserWhoLogin(items[0].login);
      setSelectedUserWhoDescription(items[0].description);
      setSelectedUserWhoDoctor(items[0].doctor);
      setSelectedUserWhoEmployee(items[0].employeeid);
      setSelectedUserWhoType(items[0].authtype);
      setSelectedUserWho(selected);
    }else{
      setSelectedUserWhoOne(undefined);
      setSelectedUserWhoLogin(undefined);
      setSelectedUserWhoName(undefined);
      setSelectedUserWhoDescription(undefined);
      setSelectedUserWhoDoctor(undefined);
      setSelectedUserWhoEmployee(undefined);
      setSelectedUserWho(undefined);
      setSelectedUserWhoType(undefined);
    }
  }
  const onSelectMenu = (item: any) => {
    if (item) {
      setSelectedModule(item.id);
      setModuleType(item.type);
      setModuleTypeName(item.typename);
      setModulePos(item.pos);
      setModuleFolder(item.folder);
      setModuleKey(item.module);
      setModuleIcon(item.icon);
      setModuleName(item.name);
      setModuleTitle(item.title);
      setModuleUrl(item.url);
    } else {
      setSelectedModule(undefined);
      setModuleType('');
      setModuleTypeName('');
      setModulePos(0);
      setModuleFolder(niluuid());
      setModuleKey('');
      setModuleIcon('');
      setModuleName('');
      setModuleTitle('');
      setModuleUrl('');
    }
  }
  const selectModule = (value: string) => {
    const module = modules.find((module) => module.key.indexOf(value) > -1);
    if (module) {
      setModuleKey(module.key);
      setModuleIcon(module.icon);
      setModuleName(module.name);
      setModuleTitle(module.title);
    }
  }

  const onModulePosChange = (value: string) => {
    let number = parseInt(value, 10);
    if (isNaN(number)) {
      number = 0;
    }
    setModulePos(number);
  }
  const onClickModuleEdit = () => {
    let folder = moduleFolder;
    /*
    if (!folder) {
      folder = niluuid();
    }
    */
    let icon = moduleIcon;
    let title = moduleTitle;
    let name = moduleName;
    const module = modules.find((module) => module.key === moduleKey);
    
    if (module) {
      if (icon === module.icon) { icon = ''; }
      if (name === module.name) { name = ''; }
      if (title === module.title) { title = ''; }
    }

    fetch('/api/userroles/menu/edit',{body: JSON.stringify({ newid:uuid(), id: selectedModule, role: selectedRole, type: moduleType, pos: modulePos, folder, key: moduleKey, icon, name, title, url: moduleUrl
    }), method: 'POST', credentials: 'same-origin', headers: {'Content-Type': 'application/json'}})
    .then(response => { 
      if (!response.ok) {
        throw Error(response.statusText);
      }
      setPanelSecond(false);
      if (!selectedModule) {
        onSelectMenu(undefined);
      }
      getItems('api/userroles/menu/'+selectedRole, generateMenu, setLoadingMenu);
    }).catch(error => console.log(error));
  }
  const onModuleEdit = () => {
    setPanelSecond(true);
  }
  const onModuleAdd = () => {
    setModuleType('module');
    setModuleTypeName('Модуль');
    setModulePos(0);
    setModuleFolder(niluuid());
    setModuleKey('dummy');
    setModuleIcon('menu-file');
    setModuleName('Пустышка');
    setModuleTitle('Пустой модуль');
    setModuleUrl('');
    setPanelSecond(true);
  }
  const onModuleAddUrl = () => {
    setModuleType('link');
    setModuleTypeName('Ссылка');
    setModulePos(0);
    setModuleFolder(niluuid());
    setModuleKey('');
    setModuleIcon('menu-globe');
    setModuleName('Ссылка');
    setModuleTitle('');
    setModuleUrl('');
    setPanelSecond(true);
  }
  const onModuleAddDir = () => {
    setModuleType('folder');
    setModuleTypeName('Папка');
    setModulePos(0);
    setModuleFolder(niluuid());
    setModuleKey('');
    setModuleIcon('menu-folder');
    setModuleName('Папка');
    setModuleTitle('');
    setModuleUrl('');
    setPanelSecond(true);
  }
  const onModuleDelete = () => {
    openDialog('Удаление', 'Элемент меню "' + moduleName + '" будет удален.', () => {
      fetch('/api/userroles/menu/delete',{body: JSON.stringify({
          id: selectedModule, type: moduleType, key: moduleKey
        }), method: 'POST', credentials: 'same-origin',headers: {'Content-Type': 'application/json'}})
      .then(response => { 
        if (!response.ok) {
          throw Error(response.statusText);
        }
        getItems('api/userroles/menu/'+selectedRole, generateMenu, setLoadingMenu);
      }).catch(error => console.log(error));
    });
  }

  /*
  const onModuleCopy = () => {
    openDialog('Копирование меню', 'Выберите роль меню которой нужно скопировать в роль "' + selectedRoleName + '"',
      (value) => callAPIPost('api/userroles/modroles/copy', { role: selectedRole, menu: value }, undefined, () => getItems('api/userroles/menu/'+selectedRole, generateMenu, setLoadingMenu)),
      'selectapi', undefined, undefined, 'api/userroles/roleswithmenu'
    );
  }
  */
 
  const onModuleCopyFrom = (value) => {
    openDialog('Копирование меню', 'Текущее меню будет скопировано на роль "' + selectedRoleName + '". Если у роли уже есть собственное меню, оно будет перезаписано.',
    () => callAPIPost('api/userroles/modroles/copy', { role: selectedRole, menu: value }, 'Меню скопировано на роль "' + selectedRoleName + '" - переключите меню на "Собственное меню".'),
    );
  }
/*
  const onAddRoleGuz = () => {
    callAPIPost('api/userroles/modroles/add', { role: selectedRole, users: selectedUserGuz }, undefined, () => forceReload(!reload));
  }
  const onDeleteRoleGuz = () => {
    callAPIPost('api/userroles/modroles/remove', { users: selectedUserGuz }, undefined, () => forceReload(!reload));
  }
*/
  const onUpdateRoleGuz = () => {
    callAPI('api/userroles/updateusers/guz','Список пользователей обновлен.', () => forceReload(!reload));
  }
  const onAddRoleWho = () => {
    callAPIPost('api/userroles/modroles/add', { role: selectedRole, users: selectedUserWho }, undefined, () => forceReload(!reload));
  }
  const onDeleteRoleWho = () => {
    callAPIPost('api/userroles/modroles/remove', { users: selectedUserWho }, undefined, () => forceReload(!reload));
  }
  const onUserAdd = () => {
    openEditPanel(
      'Добавить пользователя', [     
        { key: 'login', type: 'text', value: '', label: 'Логин' },
        { key: 'pass', type: 'pass', value: '', label: 'Пароль' },
        { key: 'name', type: 'text', value: '', label: 'Имя' },
        { key: 'description', type: 'text', value: '', label: 'Описание' },
        { key: 'employeeid', type: 'selectapi', value: '', label: 'Сотрудник', api: 'api/references/dropdown/employee', deftest: ' ' },
        { key: 'doctor', type: 'text', value: selectedUserWhoDoctor || '', label: 'Снилс (для врачей)' },
      ], (values) => callAPIPost('api/userroles/users/insert/'+uuid(), values, undefined, forceReload(!reload)),
      [ 'login', 'pass' ]
    );
  }
  const onUserDelete = () => {
    openDialog('Удаление', 'Пользователь "' + selectedUserWhoName + '" будет удален.', () => callAPIPost('api/userroles/users/delete/'+selectedUserWhoOne, { }, undefined, () => forceReload(!reload)));
  }
  const onUserEdit = () => {
    openEditPanel(
      'Изменить пользователя', [     
        { disabled: !selectedUserWhoType || selectedUserWhoType !== 'who', key: 'login', type: 'text', value: selectedUserWhoLogin || '', label: 'Логин' },
        { disabled: !selectedUserWhoType || selectedUserWhoType !== 'who', key: 'pass', type: 'pass', value: '', label: 'Пароль' },
        { disabled: !selectedUserWhoType || selectedUserWhoType !== 'who', key: 'name', type: 'text', value: selectedUserWhoName || '', label: 'Имя' },
        { disabled: !selectedUserWhoType || selectedUserWhoType !== 'who', key: 'description', type: 'text', value: selectedUserWhoDescription || '', label: 'Описание' },
        { key: 'employeeid', type: 'selectapi', value: selectedUserWhoEmployee, label: 'Сотрудник', api: 'api/references/dropdown/employee', deftest: ' ' },
        { disabled: !selectedUserWhoType || selectedUserWhoType !== 'who', key: 'doctor', type: 'text', value: selectedUserWhoDoctor || '', label: 'Снилс (для врачей)' },
      ], (values) => callAPIPost('api/userroles/users/update/'+selectedUserWhoOne, values, undefined, forceReload(!reload)),
      [ 'login' ]
    );
  }
/*
  const onAddRoleWad = () => {
    callAPIPost('api/userroles/modroles/add', { role: selectedRole, users: selectedUserWad }, undefined, () => forceReload(!reload));
  }
  const onDeleteRoleWad = () => {
    callAPIPost('api/userroles/modroles/remove', { users: selectedUserGuz }, undefined, () => forceReload(!reload));
  }
  const onUpdateRoleWad = () => {
    openDialog('Авторизация', 'Введите данные учетной записи для запроса информации из домена', (value) => {
      callAPIPost('api/userroles/updateusers/wad', value, 'Список пользователей обновлен.', () => forceReload(!reload));
    }, 'auth');
  }
*/
  const onCleanRoleGuz = () => {
    openDialog('Удаление', 'Все пользователи МИС Госпиталь будут удалены из системы', () => callAPI('api/userroles/cleanusers/guz','Список пользователей очищен.', () => forceReload(!reload)));
  }
  /*
  const onCleanRoleWad = () => {
    openDialog('Удаление', 'Все пользователи Active Directory будут удалены из системы', () => callAPI('api/userroles/cleanusers/wad','Список пользователей очищен.', () => forceReload(!reload)));
  }
*/
  const onAdd = () => {
    openDialog('Создать роль', 'Введите имя для новой роли.', (value) => callAPIPost('api/userroles/role/edit', { newid: uuid(), name: value }, undefined, () => forceReload(!reload)), 'input', 'Новая роль');
  }
  const onEdit = () => {
    getItems('api/userroles/menu/'+(selectedRoleLinks || selectedRole), generateMenu, setLoadingMenu);
    setPanel(true);
  }
  const generateMenu = (itemsNew: any) => {
    itemsNew.forEach((item: { type: string, module: string, name: string, title: string, icon: string, url: string }) => {
      if (item.type === 'module') {
        const module = modules.find((module) => module.key === item.module);
        if (module) {
          if(!item.icon) item.icon = module.icon;
          if(!item.name) item.name = module.name;
          if(!item.title) item.title = module.title;
        } else {
          item.icon = 'menu-file';
          item.name = 'Удаленный модуль';
          item.title = '';
        }
      } else if (item.type === 'folder') {
        if(!item.icon) item.icon = 'menu-folder';
        if(!item.name) item.name = 'Папка';
      } else if (item.type === 'link') {
        if(!item.icon) item.icon = 'menu-globe';
        if(!item.name) item.name = 'Ссылка';
      }
    });
    setItemsMenu(itemsNew);
  }

  let optionsModules: { key: string, name: string, title: string, icon: string, text: string }[] = [];
  modules.forEach((mod: { module: any, key: string, name: string, title: string, icon: string }) => {
    optionsModules.push({ key: mod.key, name: mod.name, title: mod.title, icon: mod.icon, text: mod.name })
  })

  const onSave = () => {
    callAPIPost('api/userroles/role/edit', { id: selectedRole, name: selectedRoleName, access: selectedRoleAccess, dept: selectedRolePodr, links: selectedRoleLinks }, undefined, () => forceReload(!reload));
    setPanel(false);
  }
  const onDelete = () => {
    openDialog('Удаление', 'Роль "' + selectedRoleName + '" будет удалена.', () => callAPIPost('api/userroles/role/delete', { id: selectedRole }, undefined, () => forceReload(!reload)));
  }
  const columnsRole = [
    { key: 'adee18e2-cd67-48c5-aabe-7e71d896c1fa', name: 'Роль', fieldName: 'text', minWidth: 50, maxWidth: 150, isResizable: true, isSorted: true },
    { key: '91887238-71f8-4d5c-aa61-97ce6a5781f3', name: 'Филиал', fieldName: 'dept', minWidth: 100, maxWidth: 200, isResizable: true },
    { key: '58ef844e-6b65-4ebc-b13f-1657ab31ffd4', name: 'Меню', fieldName: 'links', minWidth: 100, maxWidth: 200, isResizable: true },
  ];
  const commandsRole = [
    { key: 'add1', name: 'Добавить роль', iconProps: { iconName: 'icon-plus' }, onClick: onAdd, disabled: selectedRole },
    { key: 'delete1', name: 'Удалить роль', iconProps: { iconName: 'icon-trash' }, onClick: onDelete, disabled: !selectedRole },
    { key: 'edit', name: 'Свойства и меню', iconProps: { iconName: 'icon-settings' }, onClick: onEdit, disabled: !selectedRole },
    { key: 'refresh', name: 'Обновить', iconProps: { iconName: 'icon-refresh-cw' }, onClick: () => forceReload(!reload) },
  ];
  /*
  const columnsUserGuz = [
    // { key: '1700a773-5a1c-48e2-b9d1-5a0c40da96ea', name: 'id', fieldName: 'id', minWidth: 100, maxWidth: 200, isResizable: true },
    { key: '4f310067-2801-4857-b307-90fde303c6ad', name: 'Логин', fieldName: 'login', minWidth: 100, maxWidth: 200, isResizable: true, isSorted: true },
    { key: 'b5575e93-60cf-4221-9af7-87c8c5cfdb3a', name: 'Имя', fieldName: 'name', minWidth: 100, maxWidth: 200, isResizable: true },
    { key: 'a7df8dc0-afe4-423d-ba2b-1b481c370785', name: 'Описание', fieldName: 'description', minWidth: 100, maxWidth: 200, isResizable: true },
    // { key: '770919d6-b3cc-4240-be9c-9cb4498eaad9', name: 'status', fieldName: 'status', minWidth: 100, maxWidth: 200, isResizable: true },
    // { key: 'a0679bf5-1d7f-4bab-a071-98a0435db1f7', name: 'Сотрудник', fieldName: 'doc', minWidth: 100, maxWidth: 200, isResizable: true },
    { key: '89c32255-3168-4699-900c-118e3ca92a1c', name: 'Роль', fieldName: 'role', minWidth: 100, maxWidth: 200, isResizable: true },
  ];
*/
  const columnsUserWho = [
    // { key: 'fa934837-1f46-410b-ac77-f05377d476fa', name: 'id', fieldName: 'id', minWidth: 100, maxWidth: 200, isResizable: true },
    { key: '4e7384a9-0dc1-41c9-bb0d-1f07698886f6', name: 'Логин', fieldName: 'login', minWidth: 100, maxWidth: 200, isResizable: true, isSorted: true },
    { key: '70926d35-2631-46a7-8aad-6262a4b246ed', name: 'Имя', fieldName: 'name', minWidth: 100, maxWidth: 200, isResizable: true },
    { key: '26523d9c-3353-460e-b062-2edff811f047', name: 'Описание', fieldName: 'description', minWidth: 100, maxWidth: 200, isResizable: true },
    // { key: '72855af5-7017-4b00-aa81-47655b23aeec', name: 'status', fieldName: 'status', minWidth: 100, maxWidth: 200, isResizable: true },
    { key: '718d7b89-5fab-4136-aa62-a7e11921b0bd', name: 'Сотрудник', fieldName: 'employeename', minWidth: 100, maxWidth: 200, isResizable: true },
    { key: 'e4787db3-a290-455d-b447-2a0c7a09df45', name: 'Роль', fieldName: 'role', minWidth: 100, maxWidth: 200, isResizable: true },
  ]; 
/*
  const columnsUserWad = [
    // { key: 'da9ea645-e52c-46a7-9be0-a096c4d1a559', name: 'id', fieldName: 'id', minWidth: 100, maxWidth: 200, isResizable: true },
    { key: '21b1fb39-d3ea-42f8-a93b-311e66ee598b', name: 'Логин', fieldName: 'login', minWidth: 100, maxWidth: 200, isResizable: true, isSorted: true },
    { key: 'dbcc646e-90c4-4233-9b19-ade245cc14b4', name: 'Имя', fieldName: 'name', minWidth: 100, maxWidth: 200, isResizable: true },
    { key: '32261ec5-cc42-44fe-8c27-98ffd9ed2cbf', name: 'Описание', fieldName: 'description', minWidth: 100, maxWidth: 200, isResizable: true },
    // { key: 'd027c98c-f0d9-4c79-9227-48fe7afb6ebf', name: 'status', fieldName: 'status', minWidth: 100, maxWidth: 200, isResizable: true },
    // { key: 'def5debd-81ee-4086-aa62-ed3f8e398517', name: 'Сотрудник', fieldName: 'doc', minWidth: 100, maxWidth: 200, isResizable: true },
    { key: '22766bbf-32c8-47d8-9423-af0006a5c198', name: 'Роль', fieldName: 'role', minWidth: 100, maxWidth: 200, isResizable: true },
  ];
  */
  /*
  const commandsUserGuz = [
    { key: 'add2', name: 'Назначить роль', iconProps: { iconName: 'icon-plus' }, onClick: onAddRoleGuz, disabled: !selectedUserGuz || !selectedRole },
    { key: 'delete2', name: 'Убрать роль', iconProps: { iconName: 'icon-minus' }, onClick: onDeleteRoleGuz, disabled: !selectedUserGuz },
    { key: 'update', name: 'Обновить учетные данные', iconProps: { iconName: 'icon-refresh-cw' }, onClick: onUpdateRoleGuz },
    { key: 'clean', name: 'Убрать доступ всем', iconProps: { iconName: 'icon-trash' }, onClick: onCleanRoleGuz },
  ];
*/
  const commandsUserWho = [
    { key: 'add3', name: 'Назначить роль', iconProps: { iconName: 'icon-plus' }, onClick: onAddRoleWho, disabled: !selectedUserWho || !selectedRole },
    { key: 'delete3', name: 'Убрать роль', iconProps: { iconName: 'icon-minus' }, onClick: onDeleteRoleWho, disabled: !selectedUserWho },
    { key: 'add4', name: 'Добавить польз.', iconProps: { iconName: 'icon-plus' }, onClick: onUserAdd, disabled: selectedUserWho !== undefined },
    { key: 'edit', name: 'Изменить польз.', iconProps: { iconName: 'icon-edit-2' }, onClick: onUserEdit, disabled: selectedUserWho === undefined || (selectedUserWho && selectedUserWho[1]) !== undefined },
    { key: 'delete4', name: 'Удалить польз.', iconProps: { iconName: 'icon-trash' }, onClick: onUserDelete, disabled: selectedUserWhoType !== 'who' || selectedUserWho === undefined || (selectedUserWho && selectedUserWho[1]) !== undefined },
    {
      key: 'add',
      text: 'МИС госпиталь',
      iconProps: { iconName: 'icon-link' },
      subMenuProps: {
        items: [
          { key: 'update', name: 'Обновить учетные данные', iconProps: { iconName: 'icon-refresh-cw' }, onClick: onUpdateRoleGuz },
          { key: 'clean', name: 'Удалить учетные данные', iconProps: { iconName: 'icon-trash' }, onClick: onCleanRoleGuz },
        ]
      }
    },
  ];
  /*
  const commandsUserWad = [
    { key: 'add5', name: 'Назначить роль', iconProps: { iconName: 'icon-plus' }, onClick: onAddRoleWad, disabled: !selectedUserWad || !selectedRole },
    { key: 'delete5', name: 'Убрать роль', iconProps: { iconName: 'icon-minus' }, onClick: onDeleteRoleWad, disabled: !selectedUserWad },
    { key: 'update', name: 'Обновить учетные данные', iconProps: { iconName: 'icon-refresh-cw' }, onClick: onUpdateRoleWad },
    { key: 'clean', name: 'Убрать доступ всем', iconProps: { iconName: 'icon-trash' }, onClick: onCleanRoleWad },
  ];
  */
  const columnsMenu = [
    { key: 'column1', name: 'Позиция', fieldName: 'pos', minWidth: 50, maxWidth: 50, isResizable: true },
    { key: 'column2', name: 'Папка', fieldName: 'foldername', minWidth: 100, maxWidth: 200, isResizable: true },
    { key: 'column3', name: 'Модуль', fieldName: 'module', minWidth: 100, maxWidth: 200, isResizable: true },
    { key: 'column4', name: 'Иконка', fieldName: 'icon', minWidth: 50, maxWidth: 50, isResizable: true, onRender: renderIcon },
    { key: 'column5', name: 'Имя', fieldName: 'name', minWidth: 100, maxWidth: 200, isResizable: true },
    { key: 'column6', name: 'Описание', fieldName: 'title', minWidth: 100, maxWidth: 200, isResizable: true },
    { key: 'column7', name: 'Ссылка', fieldName: 'url', minWidth: 100, maxWidth: 200, isResizable: true },
  ];
  const commandsMenu = [
    {
      key: 'add',
      text: 'Добавить',
      iconProps: { iconName: 'icon-plus' },
      disabled: (selectedRoleLinks !== niluuid() && selectedRoleLinks !== null) || selectedModule,
      subMenuProps: {
        items: [
          { disabled: selectedModule, key: 'addmodule', name: 'Модуль', iconProps: { iconName: 'icon-file' }, onClick: onModuleAdd },
          { disabled: selectedModule, key: 'addlink', name: 'Ссылку', iconProps: { iconName: 'icon-globe' }, onClick: onModuleAddUrl },
          { disabled: selectedModule, key: 'addfolder', name: 'Папку', iconProps: { iconName: 'icon-folder' }, onClick: onModuleAddDir },
        ]
      }
    },
    { key: 'edit', name: 'Изменить', iconProps: { iconName: 'icon-edit-2' }, onClick: onModuleEdit, disabled: (selectedRoleLinks !== niluuid() && selectedRoleLinks !== null) || !selectedModule },
    { key: 'delete6', name: 'Удалить', iconProps: { iconName: 'icon-trash' }, onClick: onModuleDelete, disabled: (selectedRoleLinks !== niluuid() && selectedRoleLinks !== null) || !selectedModule },
    // { key: 'copy', name: 'Скопировать из другой роли', iconProps: { iconName: 'icon-clipboard' }, onClick: onModuleCopy, disabled: (selectedRoleLinks !== niluuid() && selectedRoleLinks !== null) || itemsMenu.length > 0 },
    { key: 'copyfrom', name: 'Скопировать в собственное меню', iconProps: { iconName: 'icon-clipboard' }, onClick: () => onModuleCopyFrom(selectedRoleLinks), disabled: selectedRoleLinks === niluuid() || selectedRoleLinks === null || itemsMenu.length === 0 },
  ];
  useEffect(() => getItems('api/userroles/roles', setItemsRole, setLoadingRole), [reload]);
  // useEffect(() => getItems('api/who/authtypes', setAuthtypes, undefined), [reload]);
  useEffect(() => getItems('api/userroles/users/guz', setItemsUserGuz, setLoadingUserGuz), [reload]);
  useEffect(() => getItems('api/userroles/users/all', setItemsUserWho, setLoadingUserWho), [reload]);
  useEffect(() => getItems('api/userroles/users/wad', setItemsUserWad, setLoadingUserWad), [reload]);
  var filterUsers = ['', 'who', 'guz'];
  return (
    <Module {...props}>
      <Columns width={['40%', '60%']}>
        <Column/>
        <TabsLinks links={['Все пользователи', 'node-hospital', 'МИС Госпиталь']} onClick={(value) => setTabIndex(value)} tabIndex={tabIndex}/>
      </Columns>
      <Columns height={'100%'} width={['40%', '60%']}>
        <Table commands={commandsRole} onSelect={onSelectRole} items={itemsRole} columns={columnsRole} loading={loadingRole}/>
        <Table commands={commandsUserWho} multiselect={true} onSelect={onSelectUserWho} items={itemsUserWho} columns={columnsUserWho} loading={loadingUserWho} filterColumn='authtype' filter={filterUsers[tabIndex]}/>
      </Columns>
      <Panel preventEscape={true} nopadding={true} size='XL' isOpen={panel} onDismiss={() => setPanel(false)} text={'Роль ' + selectedRoleName} loading={false}>
        <Inline>
          <TextField label='Имя' placeholder='Имя' onChange={setSelectedRoleName} defaultValue={selectedRoleName} width={200}/>
          <Dropdown
            label='Доступ'
            onChange={setSelectedRoleAccess}
            defaultValue={selectedRoleAccess}
            options={[
              { key:'user',  text:'Пользователь', },
              { key:'doctor',  text:'Медработник', },
              { key:'admin',  text:'Администратор', },
            ]}
          />
          <Dropdown
            label='Филиал'
            onChange={setSelectedRolePodr}
            defaultValue={selectedRolePodr}
            api='api/who/podr/forroles'
          />
          <Dropdown
            label='Меню'
            onChange={(item) => {
              getItems('api/userroles/menu/'+(item === niluuid() ? selectedRole : item), generateMenu, setLoadingMenu);
              setSelectedRoleLinks(item);
            }}
            defaultValue={selectedRoleLinks}
            defaultText='Собственное меню'
            api='api/userroles/roleswithmenu'
          />
          <Button label='&nbsp;' primary={true} icon='save' text='Сохранить и закрыть' onClick={onSave} disabled={selectedRoleName.length===0}/>
        </Inline>
        <Table commands={commandsMenu} onSelect={onSelectMenu} items={itemsMenu} columns={columnsMenu} loading={loadingMenu}/>
        <Panel confirm={'Изменения не будут сохранены'} disabled={moduleType === 'link' ? moduleName.length===0 || moduleUrl.length===0 : moduleName.length===0} onConfirm={onClickModuleEdit} dialog={true} size='S' isOpen={panelSecond} onDismiss={() => setPanelSecond(false)} text='Элемент меню'>
          <TextField label='Тип' value={moduleTypeName} disabled={true}/>
          <Dropdown
            label='Модуль'
            disabled={moduleType !== 'module'}
            onChange={selectModule}
            defaultValue={moduleKey}
            defaultText='Без модуля'
            options={optionsModules}
          />
          <Dropdown
            label='Папка'
            disabled={moduleType === 'folder'}
            onChange={setModuleFolder}
            defaultValue={moduleFolder}
            defaultText='Без папки'
            api={'api/userroles/menu/folders/'+selectedRole}
          />
          <TextField onChange={onModulePosChange} label='Позиция' value={modulePos.toString()}/>
          <IconPicker onChange={setModuleIcon} label='Иконка' value={moduleIcon} icons='menu' notnull={true} full={true}/>
          <TextField onChange={setModuleName} label='Имя' value={moduleName}/>
          <TextField onChange={setModuleTitle} label='Описание' value={moduleTitle}/>
          <TextField onChange={setModuleUrl} label='URL' value={moduleUrl} disabled={moduleType !== 'link'}/>
        </Panel>
      </Panel>
    </Module>
  );
}
