import React, { useState, useEffect } from 'react';
import Module, { SaveToExcel, TextField, TextLog, Hide, TabsLinks, TabsContainer, Table, getDateString, DatePicker, Tab, getItems, callAPIPost, renderDateTime, renderDate, renderIcon, Columns, openDialog, uuid, openEditPanel, /*callAPI,*/ Text, Panel, Inline, IconButton, niluuid, Button } from 'components';

interface IDevice {
  id: string;
  ip: string;
  modelid: string;
  serial: string;
  comment: string;
  modelname: string;
  // modelclass?: string;
  buildingname?: string;
  buildingid: string;
  roomid: string;
  roomname?: string;
  inventory: string;
  employeeid: string;
  employeename?: string;
  name: string;
  groupid: string;
  parentname: string;
  // class?: string;
  tags?: string;
  computer?: boolean;
  monitor?: boolean;
  printer?: boolean;
  scaner?: boolean;
  ups?: boolean;
  network?: boolean;
  typeid: string;
  typename: string;
  ownerid: string;
  ownername?: string;
  status: string;
  locationid: string;
  locationname?: string;
  childrens: number;
}

interface IGroup {
  childrens: number;
  id: string;
  ip: string;
  employeeid: string;
  employeename: string;
  name: string;
  namepc: string;
  deviceid: string;
  deviceparentid: string;
  tags?: string;
  locationid: string;
  locationname: string;
  roomid: string
  buildingid: string;
  comment: string
  action: string;
  typename: string;
}

interface IInfo {
  deviceid: string;
  key: string;
  field: string;
  value: string;
  username: string;
  timestamp: string;
  class: string;
  name: string;
  type: string;
}

interface IModel {
  id: string;
  parenttags?: string;
  name: string;
}

export default function ModuleHardware({...props}) {

  const [datefrom, setDatefrom] = useState(getDateString('today'));

  const [tabIndexHardware, setTabIndexHardware] = useState(0);
  const [tabIndexDevice, setTabIndexDevice] = useState(0);
  const [tabIndexPc, setTabIndexPc] = useState(0);

  const [filterDevices, setFilterDevices] = useState('');
  const [filterPc, setFilterPc] = useState('');
  const [filterModels, setFilterModels] = useState('');

  const [groupedPc, setGroupedPc] = useState(false);

  const [groupedDevice, setGroupedDevice] = useState(false);
  const [editDevicePanel, setEditDevicePanel] = useState(false);
  const [editComputerPanel, setEditComputerPanel] = useState(false);
  const [addChildrensPanel, setAddChildrensPanel] = useState(false);

  const [loadingChildrenDevices, setLoadingChildrenDevices] = useState(false);

  const [itemsModels, setItemsModels] = useState<IModel[]>([]);
  const [loadingModels, setLoadingModels] = useState(false);
  const [selectedModel, setSelectedModel] = useState<IModel|undefined>(undefined);
  const [reloadModels, forceReloadModels] = useState(false);

  const [itemsModelInfo, setItemsModelInfo] = useState<IInfo[]>([]);
  const [loadingModelInfo, setLoadingModelInfo] = useState(false);
  const [selectedModelInfo, setSelectedModelInfo] = useState<IInfo|undefined>(undefined);

  const [itemsPc, setItemsPc] = useState<IGroup[]>([]);
  const [itemsPcDevice, setItemsPcDevice] = useState<IDevice[]>([]);
  const [itemsChildrensDevice, setItemsChildrensDevice] = useState<IDevice[]>([]);
  const [itemsDevice, setItemsDevice] = useState<IDevice[]>([]);
  const [deletedDevices, setDeletedDevices] = useState(false);

  const [deletedGroups, /*setDeletedGroups*/] = useState(false);
  const [allGroups, setAllGroups] = useState(false);
  
  const [loadingPc, setLoadingPc] = useState(false);
  const [loadingDevices, setLoadingDevices] = useState(false);

  const [panelInfoHistory, setPanelInfoHistory] = useState(false);
  const [itemsInfoHistory, setItemsInfoHistory] = useState([]);
  const [loadingInfoHistory, setLoadingInfoHistory] = useState(false);

  const [itemsWeekHistory, setItemsWeekHistory] = useState([]);
  const [loadingWeekHistory, setLoadingWeekHistory] = useState(false);
  const [reloadWeekHistory, forceReloadWeekHistory] = useState(true);

  const [itemsHistory, setItemsHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const [itemsInfo, setItemsInfo] = useState<IInfo[]>([]);
  const [itemsInfoPC, setItemsInfoPC] = useState<IInfo[]>([]);
  const [/*loadingInfo*/, setLoadingInfo] = useState(false);
  const [/*loadingInfoPC*/, setLoadingInfoPC] = useState(false);

  const [itemsNotes, setItemsNotes] = useState([]);
  const [/*loadingNotes*/, setLoadingNotes] = useState(false);

  const [itemsGroupHistory, setItemsGroupHistory] = useState([]);
  const [/*loadingGroupHistory*/, setLoadingGroupHistory] = useState(false);

  const [itemsGroupNotes, setItemsGroupNotes] = useState([]);
  const [/*loadingGroupNotes*/, setLoadingGroupNotes] = useState(false);

  const [selectedPc, setSelectedPc] = useState(undefined);
  const [selectedGroup, setSelectedGroup] = useState<IGroup|undefined>(undefined);
  const [selectedDevices, setSelectedDevices] = useState<IDevice[]|undefined>(undefined);
  const [selectedDevicesPc, setSelectedDevicesPc] = useState<IDevice[]|undefined>(undefined);
  const [selectedChildrensDevices, setSelectedChildrensDevices] = useState<IDevice[]|undefined>(undefined);

  const [selectedInfo, setSelectedInfo] = useState<IInfo|undefined>(undefined);
  const [selectedInfoPC, setSelectedInfoPC] = useState<IInfo|undefined>(undefined);

  const [reloadPc, forceReloadPc] = useState(true);
  const [reloadDevices, forceReloadDevices] = useState(true);
  /*
  const [reloadBuildings, forceReloadBuildings] = useState(true);
  const [reloadRooms, forceReloadRooms] = useState(true);
  const [reloadModels, forceReloadModels] = useState(true);
  const [reloadTypes, forceReloadTypes] = useState(true);
  const [reloadEmployees, forceReloadEmployees] = useState(true);
*/
  useEffect(() => getItems('api/hardware/pc/'+(deletedGroups?'all':'actual')+'/'+(allGroups?'all':'pc'), setItemsPc, setLoadingPc), [deletedGroups, allGroups, reloadPc]);
  useEffect(() => getItems('api/hardware/device/'+(deletedDevices?'all':'actual'), setItemsDevice, setLoadingDevices), [deletedDevices, reloadDevices]);
  useEffect(() => getItems('api/references/list/model/actual', setItemsModels, setLoadingModels), [reloadModels]);

  useEffect(() => getItems('api/hardware/weekhistory/'+datefrom, setItemsWeekHistory, setLoadingWeekHistory), [datefrom, reloadWeekHistory]);

  useEffect(() => {
    var lastSlection = itemsPc.filter(device => device.childrens === 0 && device.action !== 'delete');
    if (lastSlection[0]) {
      for (const ind in lastSlection) {
        callAPIPost('api/hardware/groups/delete/'+(lastSlection[ind] && lastSlection[ind].id)+'/', { hardware: lastSlection[ind] }, undefined);
      }
      setItemsPc(itemsPc.filter(device => device.childrens !== 0));
    }
  }, [itemsPc]);

  useEffect(() => {
    if (selectedGroup) {
      var items = itemsDevice.filter(device => device.groupid === selectedGroup.id);
      var itemsChildrens = itemsDevice.filter(device => !device.groupid && device.buildingid === selectedGroup.buildingid );
      setItemsPcDevice(items);
      setItemsChildrensDevice(itemsChildrens);
    } else {
      setItemsPcDevice([]);
      setItemsChildrensDevice([]);
    }
    setLoadingChildrenDevices(false);
  }, [itemsDevice, selectedGroup]);

  useEffect(() => {
    if (selectedDevices === undefined) closeEditDevicePanel();
  }, [selectedDevices]);

  useEffect(() => {
    if (selectedDevicesPc === undefined) closeEditDevicePanel();
  }, [selectedDevicesPc]);

  useEffect(() => {
    if (selectedGroup === undefined) closeEditPcPanel();
  }, [selectedGroup]);

  const closeEditDevicePanel = () => {
    setEditDevicePanel(false);
    setItemsHistory([]);
    setItemsInfo([]);
    setItemsNotes([]);
  }

  const closeEditPcPanel = () => {
    setEditComputerPanel(false);
    setItemsGroupHistory([]);
    setItemsGroupNotes([]);
    setItemsInfo([]);
  }

  const onSelectModel = (item: IModel | undefined) => {
    setSelectedModel(item);
    if (item) {
      getItems('api/hardware/info/'+(item.parenttags)+'/'+(item.id), setItemsModelInfo, setLoadingModelInfo);
    } else {
      setItemsModelInfo([]);
    }
  }
  const onSelectModelInfo = (item: IInfo | undefined) => setSelectedModelInfo(item);

  const onSelectInfo = (items: IInfo | undefined) => {
    if (items) {
      setSelectedInfo(items);
    } else {
      setSelectedInfo(undefined);
    }
  }

  const onSelectInfoPC = (items: IInfo | undefined) => {
    if (items) {
      setSelectedInfoPC(items);
    } else {
      setSelectedInfoPC(undefined);
    }
  }

  const onSelectDeviceChildrens = (items: IDevice[] | undefined) => {
    if (items) {
      setSelectedChildrensDevices(items);
    } else {
      setSelectedChildrensDevices(undefined);
    }
  }

  const onSelectDevice = (items: IDevice[] | undefined) => {
    // console.log(items);
    if (items) {
      /*
      items.forEach(item => {
        selected.push(item.id);
        selectedLogin.push(item.login);
        selectedName.push(item.name);
      });
      */
      setSelectedDevices(items);
      if (editDevicePanel) getItems('api/hardware/history/'+(selectedDevices && selectedDevices[0] && selectedDevices[0].id), setItemsHistory, setLoadingHistory);
      if (editDevicePanel) getItems('api/hardware/info/'+(selectedDevices && selectedDevices[0] && selectedDevices[0].tags)+'/'+(selectedDevices && selectedDevices[0] && selectedDevices[0].id)+'/'+(selectedDevices && selectedDevices[0] && selectedDevices[0].modelid), setItemsInfo, setLoadingInfo);
      if (editDevicePanel) getItems('api/hardware/notes/'+(selectedDevices && selectedDevices[0] && selectedDevices[0].id), setItemsNotes, setLoadingNotes);
    } else {
      // closeEditDevicePanel();
      setSelectedDevices(undefined);
    }
  }

  const onSelectDevicePc = (items: IDevice[] | undefined) => {
    // console.log(items);
    if (items) {
      /*
      items.forEach(item => {
        selected.push(item.id);
        selectedLogin.push(item.login);
        selectedName.push(item.name);
      });
      */
      setSelectedDevicesPc(items);
      if (editDevicePanel) getItems('api/hardware/history/'+(selectedDevicesPc && selectedDevicesPc[0] && selectedDevicesPc[0].id), setItemsHistory, setLoadingHistory);
      if (editDevicePanel) getItems('api/hardware/info/'+(selectedDevicesPc && selectedDevicesPc[0] && selectedDevicesPc[0].tags)+'/'+(selectedDevicesPc && selectedDevicesPc[0] && selectedDevicesPc[0].id)+'/'+(selectedDevicesPc && selectedDevicesPc[0] && selectedDevicesPc[0].modelid), setItemsInfo, setLoadingInfo);
      if (editDevicePanel) getItems('api/hardware/notes/'+(selectedDevicesPc && selectedDevicesPc[0] && selectedDevicesPc[0].id), setItemsNotes, setLoadingNotes);
    }else{
      // closeEditDevicePanel();
      setSelectedDevicesPc(undefined);
    }
  }

  const onEditDevice = () => {
    openEditPanel(
    'Добавить устройство', [
      { key: 'typeid', type: 'selectapi', value: '', label: 'Тип', api: 'api/references/dropdown/type', deftest: '-' },
      //{ key: 'modelid', parent: 'typeid', type: 'selectapi', value: '', label: 'Модель', api: 'api/references/dropdownfiltered/model', deftest: '-' },
      { key: 'modelid', parent: 'typeid', type: 'selecttag', value: '', label: 'Модель', api: 'api/references/dropdownfiltered/model', deftest: '-' },
      { key: 'serial', type: 'text', value: '', label: 'Серийный номер' },
      { key: 'inventory', type: 'text', value: '', label: 'Инвентарный номер' },
      { key: 'ownerid', type: 'selectapi', value: '', label: 'Материально ответственный', api: 'api/references/dropdownwithtag/employee/owner', deftest: '-' },
      { key: 'buildingid', type: 'selectapi', value: '', label: 'Здание', api: 'api/references/dropdown/building', deftest: 'Поступление на склад' },
      { key: 'roomid', parent: 'buildingid', type: 'selectapi', value: '', label: 'Помещение', api: 'api/references/dropdownfiltered/room', deftest: '-' },
      { key: 'comment', type: 'multiline', value: '', label: 'Примечание' },
    ], (values: IDevice) => {
      const deviceid = uuid();
      callAPIPost('api/references/check/model', { parentid: values.typeid, elementid: values.modelid}, undefined, 
        (result) => callAPIPost('api/references/insert/device/'+deviceid, { parentid: result.elementid, name: values.serial}, undefined, 
          callAPIPost('api/hardware/notes/insert/'+deviceid, { comment: values.comment }, undefined, 
            callAPIPost('api/hardware/change/add/'+deviceid, { hardware: {
                status: 'new',
                ip: values.ip,
                employeeid: values.employeeid,
                groupid: values.groupid,
                name: values.name,
                locationid: values.roomid !== niluuid() ? values.roomid : values.buildingid,
                ownerid: values.ownerid,
                inventory: values.inventory}
              }, undefined, 
              onReloadDevices
            )
          )
        )
      );
    },[ 'typeid', 'modelid' ]
  ); 
  }
  const onLinkDevice = () => {
    setAddChildrensPanel(true);
  }


  const onLinkDeviceConfirm = () => {
    openDialog('Прикрепление к компьютеру', 'Закрепить устройства?', async () => {
      setLoadingChildrenDevices(true);
      var lastSlection =  Object.assign({}, selectedChildrensDevices);
      setLoadingDevices(true);
      setLoadingPc(true);
      for (const ind in lastSlection) {
        if (lastSlection[ind].locationid !== (selectedGroup && selectedGroup.locationid)) {
          await fetch('api/hardware/change/location/'+(lastSlection[ind] && lastSlection[ind].id)+'/', { credentials: 'same-origin', method: 'POST', body: JSON.stringify({ hardware: lastSlection[ind], value: selectedGroup && selectedGroup.locationid, group: selectedGroup && selectedGroup.id }), headers: {'Content-Type': 'application/json'} });
          lastSlection[ind].locationid = (selectedGroup && selectedGroup.locationid) || '';
        }
        await fetch('api/hardware/change/group/'+(lastSlection[ind] && lastSlection[ind].id)+'/', { credentials: 'same-origin', method: 'POST', body: JSON.stringify({ hardware: lastSlection[ind], value: selectedGroup && selectedGroup.id, group: selectedGroup && selectedGroup.id }), headers: {'Content-Type': 'application/json'} });
      }
      setLoadingChildrenDevices(false);
      onReloadDevices();
    });
  }

  const onAddPc = () => {
    var name = 'Новая группа';
    var buildingid = '';
    var roomid = '';
    if (selectedDevices !==undefined) {
      var itempc = selectedDevices.filter(device => device.computer);
      if (itempc[0] && !itempc[1]) {
        name = itempc[0].typename + ' ' + itempc[0].name;
        buildingid = itempc[0].buildingid;
        roomid = itempc[0].roomid;
      } else {
        buildingid = selectedDevices[0].buildingid;
        roomid = selectedDevices[0].roomid;
      }
      var message = '';
      var test = selectedDevices.filter(device => device.buildingid !== buildingid);
      if (test[0]) message = 'Не все устройства находятся на хранении в одном здании.';
      test = selectedDevices.filter(device => device.buildingid === null || device.groupid !== null);
      if (test[0]) message = 'Не все устройства находятся на хранении'; 
      if (message.length === 0) {
        openEditPanel(
          'Добавить Компьютер/группу', [     
            { disabled: itempc[0] && !itempc[1], key: 'name', type: 'text', value: name, label: 'Имя группы' },
            // { key: 'ip', type: 'text', value: '', label: 'IP-адрес' },
            { disabled: true, key: 'buildingid', type: 'selectapi', value: buildingid, label: 'Здание', api: 'api/references/dropdown/building', deftest: '' },
            { key: 'roomid', parent: 'buildingid', type: 'selectapi', value: roomid, label: 'Помещение', api: 'api/references/dropdownfiltered/room', deftest: ' ' },
            { key: 'employeeid', type: 'selectapi', value: '', label: 'Сотрудник', api: 'api/references/dropdown/employee', deftest: ' ' },
            { key: 'comment', type: 'multiline', value: '', label: 'Примечание' },
          ], (values: IDevice) => {
            const groupid = uuid();
            const locationid = (values.roomid !== null && values.roomid !== niluuid()) ? values.roomid : values.buildingid
              callAPIPost('api/hardware/notes/insert/'+groupid, { comment: values.comment }, undefined, 
                callAPIPost('api/hardware/groups/add/'+groupid, { hardware: {
                    employeeid: values.employeeid,
                    name: values.name,
                    locationid: locationid,
                    ip: values.ip,
                    }
                  }, undefined, 
                  async ()=>{
                    var lastSlection = Object.assign({}, selectedDevices);
                    setLoadingDevices(true);
                    setLoadingPc(true);
                    for (const ind in lastSlection) {
                      if (lastSlection[ind].locationid !== locationid) {
                        await fetch('api/hardware/change/location/'+lastSlection[ind]?.id+'/', { credentials: 'same-origin', method: 'POST', body: JSON.stringify({ hardware: lastSlection[ind], value: locationid, group: groupid }), headers: {'Content-Type': 'application/json'} });
                        lastSlection[ind].locationid = locationid;
                      }
                      await fetch('api/hardware/change/group/'+lastSlection[ind]?.id+'/', { credentials: 'same-origin', method: 'POST', body: JSON.stringify({ hardware: lastSlection[ind], value: groupid, group: groupid }), headers: {'Content-Type': 'application/json'} });
                    }
                    onReloadDevices();
                  }
                )
            );
          },
          [ 'name', 'buildingid' ]
        );
      } else {
        openDialog('Невозможно объединить устройства', message, undefined, 'alert');
      }
    }
  }

  const onShowHistoryInfo = () => {
    const currentDevices = getCurrentDevices();
    setPanelInfoHistory(true);
    getItems('api/hardware/infohistory/'+currentDevices[0]?.id, setItemsInfoHistory, setLoadingInfoHistory);
  }

  const onShowHistoryInfoPC = () => {
    setPanelInfoHistory(true);
    getItems('api/hardware/infohistory/'+selectedGroup?.deviceid, setItemsInfoHistory, setLoadingInfoHistory);
  }

  const onChangeDevice = (action: string) => {
    const currentDevices = getCurrentDevices();
    var title = '';
    var params: (string|undefined)[] = [];
    switch (action) {
      case 'owner': title = 'Материально ответственный'; params = [ 'selectapi', currentDevices[0] && currentDevices[0].ownerid, undefined, 'api/references/dropdownwithtag/employee/owner' ]; break;
      // case 'name': title = 'Имя компьютера/устройства'; params = [ 'input', currentDevices[0] && (currentDevices[0].name !== null ? currentDevices[0].name : '') ]; break;
      // case 'employee': title = 'Сотрудник'; params = [ 'selectapi', currentDevices[0] && currentDevices[0].employeeid, '-', 'api/references/dropdown/employee' ]; break;
      // case 'group': title = 'Компьютер'; params = [ 'selectapi', (currentDevices[0] && currentDevices[0].groupid), '-', 'api/hardware/dropdown/pc' ]; break;
      // case 'ip': title = 'IP-адрес'; params = [ 'input', currentDevices[0] && (currentDevices[0].ip !== null ? currentDevices[0].ip : '') ]; break;
      case 'inventory': title = 'Инвентарный номер'; params = [ 'input', currentDevices[0] && (currentDevices[0].inventory !== null ? currentDevices[0].inventory : '') ]; break;
      case 'location': title = 'Переместить на хранение'; params = [ 'selectapiparent', currentDevices[0] && currentDevices[0].roomid, ' ', 'api/references/dropdownfiltered/room', currentDevices[0] && currentDevices[0].buildingid, undefined, 'api/references/dropdown/building' ]; break;
      default:
    }
    openDialog(title, currentDevices[1] !== undefined ? 'Внимание! Изменения затронут несколько устройств.' : '',
      (value) => {
        for (const ind in currentDevices) {
          callAPIPost('api/hardware/change/'+action+'/'+(currentDevices[ind] && currentDevices[ind].id)+'/', { hardware: currentDevices[ind], value }, undefined, onReloadDevices);
        }
      },
      ...params
    );
  }

  // const onAddInfo = () => {}

  const onDeleteInfo = () => {
    const currentDevices = getCurrentDevices();
    openDialog((selectedInfo && selectedInfo.name) || '', 'Параметр будет очищен.', () => callAPIPost('api/hardware/info/delete/'+(currentDevices[0] && currentDevices[0].id)+'/', { field: selectedInfo && selectedInfo.field }, undefined, ()=> {
      getItems('api/hardware/info/'+(currentDevices[0] && currentDevices[0].tags)+'/'+(currentDevices[0] && currentDevices[0].id)+'/'+(currentDevices[0] && currentDevices[0].modelid), setItemsInfo, setLoadingInfo);
      if (currentDevices[0] && currentDevices[0].computer && selectedInfo && (selectedInfo.field === 'ip' || selectedInfo.field === 'name')) {
        onReloadDevices();
      }
      if (editComputerPanel && selectedGroup?.deviceid === currentDevices[0].id) getItems('api/hardware/info/'+(selectedGroup?.tags)+'/'+(selectedGroup?.deviceid)+'/'+(selectedGroup?.deviceparentid), setItemsInfoPC, setLoadingInfoPC);
    }));
  }

  const onCopyGroupName = () => {
    openDialog('Имя группы', 'Переименовать группу "'+(selectedGroup && selectedGroup.name)+'" в "'+(selectedGroup && (selectedGroup.typename+' '+selectedGroup.namepc))+'"?', () => callAPIPost('api/hardware/groups/name/'+(selectedGroup && selectedGroup.id)+'/', { hardware: selectedGroup, value: selectedGroup && (selectedGroup.typename+' '+selectedGroup.namepc) }, undefined, onReloadDevices));
  }

  const onEditInfoPC = () => {
    var title = (selectedInfoPC && selectedInfoPC.name) || '';
    var params = [ selectedInfoPC && selectedInfoPC.type, selectedInfoPC && (selectedInfoPC.value !== null ? selectedInfoPC && selectedInfoPC.value : '') ];
    if (selectedInfoPC && selectedInfoPC.type === 'select') params = [ 'selectapi', selectedInfoPC && (selectedInfoPC.value !== null ? selectedInfoPC && selectedInfoPC.value : ''), undefined, 'api/hardware/dropdown/'+(selectedInfoPC && selectedInfoPC.class)+'/'+(selectedInfoPC && selectedInfoPC.field)];
    openDialog(title, '',
      (value) => {
        callAPIPost('api/hardware/info/update/'+(selectedGroup?.deviceid)+'/', { field: selectedInfoPC && selectedInfoPC.field, value }, undefined, ()=> {
          getItems('api/hardware/info/'+(selectedGroup?.tags)+'/'+(selectedGroup?.deviceid)+'/'+(selectedGroup?.deviceparentid), setItemsInfoPC, setLoadingInfoPC);
          if (selectedInfoPC && (selectedInfoPC.field === 'ip' || selectedInfoPC.field === 'name')) {
            onReloadDevices();
          }
        });
      },
      ...params
    );
  }
  const onDeleteInfoPC = () => {
    openDialog((selectedInfoPC && selectedInfoPC.name) || '', 'Параметр будет очищен.', () => callAPIPost('api/hardware/info/delete/'+(selectedGroup?.deviceid)+'/', { field: selectedInfoPC && selectedInfoPC.field }, undefined, ()=> {
      getItems('api/hardware/info/'+(selectedGroup?.tags)+'/'+(selectedGroup?.deviceid)+'/'+(selectedGroup?.deviceparentid), setItemsInfoPC, setLoadingInfoPC);
      if (selectedInfoPC && (selectedInfoPC.field === 'ip' || selectedInfoPC.field === 'name')) {
        onReloadDevices();
      }
    }));
  }

  const onEditInfo = () => {
    const currentDevices = getCurrentDevices();
    var title = selectedInfo?.name || '';
    var params = [ selectedInfo?.type, selectedInfo && (selectedInfo.value !== null ? selectedInfo?.value : '') ];
    if (selectedInfo && selectedInfo.type === 'select') params = [ 'selectapi', selectedInfo && (selectedInfo.value !== null ? selectedInfo && selectedInfo.value : ''), undefined, 'api/hardware/dropdown/'+(selectedInfo && selectedInfo.class)+'/'+(selectedInfo && selectedInfo.field)];
    openDialog(title, '',
      (value) => {
        callAPIPost('api/hardware/info/update/'+currentDevices[0].id+'/', { field: selectedInfo && selectedInfo.field, value }, undefined, ()=> {
          getItems('api/hardware/info/'+currentDevices[0].tags+'/'+currentDevices[0].id+'/'+currentDevices[0].modelid, setItemsInfo, setLoadingInfo);
          if (currentDevices[0] && currentDevices[0].computer && selectedInfo && (selectedInfo.field === 'ip' || selectedInfo.field === 'name')) {
            onReloadDevices();
          }
          if (editComputerPanel && selectedGroup?.deviceid === currentDevices[0].id) getItems('api/hardware/info/'+(selectedGroup?.tags)+'/'+(selectedGroup?.deviceid)+'/'+(selectedGroup?.deviceparentid), setItemsInfoPC, setLoadingInfoPC);
        });
      },
      ...params
    );
  }

  const onChangeGroup = (action: string) => {
    var title = '';
    var params: (string|undefined)[] = [];
    switch (action) {
      case 'name': title = 'Имя компьютера/устройства'; params = [ 'input', selectedGroup && (selectedGroup.name !== null ? selectedGroup.name : '') ]; break;
      case 'employee': title = 'Сотрудник'; params = [ 'selectapi', selectedGroup && selectedGroup.employeeid, '', 'api/references/dropdown/employee' ]; break;
      case 'location': title = 'Место нахождения'; params = [ 'selectapiparent', selectedGroup && selectedGroup.roomid, ' ', 'api/references/dropdownfiltered/room', selectedGroup && selectedGroup.buildingid, undefined, 'api/references/dropdown/building' ]; break;
      default:
    }
    openDialog(title, '',
      (value) => {
        callAPIPost('api/hardware/groups/'+action+'/'+(selectedGroup && selectedGroup.id)+'/', { hardware: selectedGroup, value }, undefined, onReloadDevices);
        if (action === 'location') {
          var lastSlection = Object.assign({}, itemsPcDevice);
          for (const ind in lastSlection) {
            callAPIPost('api/hardware/change/location/'+(lastSlection[ind] && lastSlection[ind].id)+'/', { hardware: lastSlection[ind], value, group: selectedGroup && selectedGroup.id }, undefined, onReloadDevices);
          }
        }
      },
      ...params
    );
  }

  const onDeleteGroup = () => {
    openDialog('Удаление', 'Группа "'+selectedGroup?.name+'" будет удалена.', () => {
      callAPIPost('api/hardware/groups/delete/'+selectedGroup?.id+'/', { hardware: selectedGroup }, undefined, onReloadDevices);
      var lastSlection = Object.assign({}, itemsPcDevice);
      for (const ind in lastSlection) {
        callAPIPost('api/hardware/change/group/'+lastSlection[ind]?.id+'/', { hardware: lastSlection[ind] }, undefined, onReloadDevices);
      }
    });
  }

  const onEditDeviceNotes = () => {
    const currentDevices = getCurrentDevices();
    openDialog('Добавить примечание', currentDevices[1] !== undefined ? 'Внимание! Изменения затронут несколько устройств.' : '',
      (value) => {
        for (const ind in currentDevices) {
          callAPIPost('api/hardware/notes/insert/'+currentDevices[ind]?.id+'/', { comment: value }, undefined, onReloadDevices);
        }
      },
      'text', ''
    );
  }

  const onEditGroupNotes = () => {
    openDialog('Добавить примечание', '',
      (value) => {
        callAPIPost('api/hardware/notes/insert/'+selectedGroup?.id+'/', { comment: value }, undefined, onReloadDevices);
      },
      'text', ''
    );
  }

  // req.body.employeeid, req.body.inventory, req.body.groupid, req.body.roomid, req.body.buildingid, req.body.message
  const onDecommissionDevice = () => {
    const currentDevices = getCurrentDevices();
    openDialog('Списание', 'Устройство "'+currentDevices[0].modelname+' ('+currentDevices[0].serial+')" будет списано.', () => callAPIPost('api/hardware/change/decommission/'+currentDevices[0].id+'/', { hardware: currentDevices[0] }, undefined, onReloadDevices));
  }

  const onReturnDevice = () => {
    const currentDevices = getCurrentDevices();
    openDialog('Возврат', 'Устройство "'+currentDevices[0].modelname+' ('+currentDevices[0].serial+')" будет возвращено поставщику.', () => callAPIPost('api/hardware/change/return/'+currentDevices[0].id+'/', { hardware: currentDevices[0] }, undefined, onReloadDevices));
  }

  const onRepairDevice = () => {
    const currentDevices = getCurrentDevices();
    openDialog('Ремонт', 'Устройство "'+currentDevices[0].modelname+' ('+currentDevices[0].serial+')" будет отправленно в ремонт.', () => callAPIPost('api/hardware/change/repair/'+currentDevices[0].id+'/', { hardware: currentDevices[0] }, undefined, onReloadDevices));
  }

  const onBrokenDevice = () => {
    const currentDevices = getCurrentDevices();
    openDialog('Неисправность', 'Устройство "'+currentDevices[0].modelname+' ('+currentDevices[0].serial+')" будет помечено как неисправное.', () => callAPIPost('api/hardware/change/status/'+currentDevices[0].id+'/', { hardware: currentDevices[0], value: currentDevices[0].status === 'broken' ? '' : 'broken' }, undefined, onReloadDevices));
  }

  const onRemoveEmployee = () => {
    openDialog('Сотрудник', 'Убрать сотрудника для группы "'+(selectedGroup && selectedGroup.name+'')+'"?', () => callAPIPost('api/hardware/groups/employee/'+(selectedGroup && selectedGroup.id)+'/', { hardware: selectedGroup, value: '' }, undefined, onReloadDevices));
  }

  const onChangeInventory = () => onChangeDevice('inventory');
  const onChangeGroupName = () => onChangeGroup('name');
  const onChangeOwner = () => onChangeDevice('owner');
  const onChangeGroupLocation = () => onChangeGroup('location');
  const onChangeGroupEmployee = () => onChangeGroup('employee');
  const onChangeLocation = () => onChangeDevice('location');

  const getCurrentDevices = () => {
    if (editComputerPanel) {
      return Object.assign({}, selectedDevicesPc); // [0];
    } else {
      return Object.assign({}, selectedDevices); // [0];
    }
  }

  const onSelectComputer = (item) => {
    if (item) {
      setSelectedPc(item.groupid);
      setSelectedGroup(item);
      // var items = itemsDevice.filter(device => device.pc === item.deviceid);
      // setItemsPcDevice(items);
      if (editComputerPanel) getItems('api/hardware/grouphistory/'+(selectedGroup?.id), setItemsGroupHistory, setLoadingGroupHistory);
      if (editComputerPanel) getItems('api/hardware/notes/'+(selectedGroup?.id), setItemsGroupNotes, setLoadingGroupNotes);
    } else {
      setSelectedGroup(undefined);
      setSelectedPc(undefined);
      // setItemsPcDevice([]);
    }
  }

  const onReloadDevices = () => {
    forceReloadDevices(!reloadDevices);
    forceReloadPc(!reloadPc);
    if (getCurrentDevices() === undefined) closeEditDevicePanel();
  }

  const onEditModelInfo = () => {
    var title = selectedModelInfo?.name || '';
    var params = [ selectedModelInfo?.type, selectedModelInfo && (selectedModelInfo.value !== null ? selectedModelInfo?.value : '') ];
    if (selectedModelInfo && selectedModelInfo.type === 'select') params = [ 'selectapi', selectedModelInfo && (selectedModelInfo.value !== null ? selectedModelInfo && selectedModelInfo.value : ''), undefined, 'api/hardware/dropdown/'+(selectedModelInfo && selectedModelInfo.class)+'/'+(selectedModelInfo && selectedModelInfo.field)];
    openDialog(title, '',
      (value) => {
        callAPIPost('api/hardware/info/update/'+selectedModel?.id+'/', { field: selectedModelInfo && selectedModelInfo.field, value }, undefined, ()=> {
          getItems('api/hardware/info/'+selectedModel?.parenttags+'/'+selectedModel?.id, setItemsModelInfo, setLoadingModelInfo);
        });
      },
      ...params
    );
  }

  const onDeleteModelInfo = () => {
    openDialog((selectedModel && selectedModel.name) || '', 'Параметр будет очищен.', () => callAPIPost('api/hardware/info/delete/'+(selectedModel && selectedModel.id)+'/', { field: selectedModelInfo && selectedModelInfo.field }, undefined, ()=> {
      getItems('api/hardware/info/'+(selectedModel && selectedModel.parenttags)+'/'+(selectedModel && selectedModel.id), setItemsModelInfo, setLoadingModelInfo);
    }));
  }

  const onShowHistoryModelInfo = () => {
    setPanelInfoHistory(true);
    getItems('api/hardware/infohistory/'+selectedModel?.id, setItemsInfoHistory, setLoadingInfoHistory);
  }

  const onChangeSerial = () => {
    const currentDevices = getCurrentDevices();
    openDialog('Замена серийного номера', '',
      (value) => {
        callAPIPost('api/references/update/device/'+(currentDevices[0] && currentDevices[0].id)+'/', { parentid: currentDevices[0].modelid, name: value }, undefined, onReloadDevices);
      }, 'input', currentDevices[0] && (currentDevices[0].serial !== null ? currentDevices[0].serial : '')
    );
  }

  const onChangeModel = () => {
    const currentDevices = getCurrentDevices();
    openEditPanel(
      'Замена модели', [
        { key: 'typeid', type: 'selectapi', value: currentDevices[0].typeid, label: 'Тип', api: 'api/references/dropdown/type', deftest: '-' },
        { key: 'modelid', parent: 'typeid', type: 'selecttag', value: currentDevices[0].modelname, label: 'Модель', api: 'api/references/dropdownfiltered/model', deftest: '-' },
        { disabled: true, key: 'serial', type: 'text', value: currentDevices[0].serial, label: 'Серийный номер' }
      ], (values: IDevice) => {
        callAPIPost('api/references/check/model', { parentid: values.typeid, elementid: values.modelid}, undefined, 
          (result) => callAPIPost('api/references/update/device/'+currentDevices[0].id, { parentid: result.elementid, name: values.serial}, undefined, onReloadDevices)
        );
      },[ 'typeid', 'modelid' ]
    );
  }

  const columnsPc = [
    {key: 'a0d0d508-d32f-4add-a77f-0e29eb64143e', name: 'Название', fieldName: 'name', isResizable: true, minWidth: 90, maxWidth: 110, },
    {key: '164be1cc-0e22-49ea-b32e-992ceea1baef', name: 'Имя компьютера', fieldName: 'namepc', isResizable: true, minWidth: 90, maxWidth: 110, },
    {key: '8b98afbc-9dfa-467c-a165-370e8f90b807', name: 'IP', fieldName: 'ip', isResizable: true, minWidth: 90, maxWidth: 110, },
    {key: '4db392e4-0469-4405-9399-29f3dbb968bb', name: 'Устройства', fieldName: 'childrens', isResizable: true, minWidth: 90, maxWidth: 90, },
    {key: '0ce9fbc1-e5bb-4ca2-8d8e-ff03efe014d8', name: groupedPc ? 'Помещение' : 'Место нахождения', fieldName: groupedPc ? 'roomname' : 'locationname', isResizable: true, minWidth: 90, maxWidth: 110, },
    {key: '7bb5f64a-222c-4777-ad10-b254235d49af', name: 'Сотрудник', fieldName: 'employeename', isResizable: true, minWidth: 90, maxWidth: 110, },
    {key: '49f5d5d0-4d4c-4473-b4c3-a74854ad4402', name: 'Последнее примечание', fieldName: 'comment', isResizable: true, minWidth: 150, maxWidth: 300, },
    {key: '76b5aa01-4672-4700-aa08-26bd26987f73', name: 'Дата изменения', fieldName: 'timestamp', isResizable: true, minWidth: 125, maxWidth: 125, onRender: renderDateTime },
    // {key: '9e8182a9-725f-4588-bf42-dcf09309ed4d', name: 'Пользователь', fieldName: 'username', isResizable: true, minWidth: 90, maxWidth: 110, },
  ];

  const columnsChildrensDevice = [
    // {key: 'e215953d-3fec-4de3-a2e3-835f25037bfa', name: 'Статус', fieldName: 'statusname', isResizable: true, minWidth: 90, maxWidth: 100},
    {key: '685eda1a-0d89-48ed-bf60-a6a71ba1d4ec', name: '', fieldName: 'icon', isResizable: true, minWidth: 25, maxWidth: 25, onRender: renderIcon},
    {key: 'ef15450e-289b-4d9b-88f9-5999bc79815a', name: 'Тип', fieldName: 'typename', isResizable: true, minWidth: 90, maxWidth: 110, },
    {key: '0be8260d-14af-412b-8570-2d6bcfbe5e9c', name: 'Модель', fieldName: 'modelname', isResizable: true, minWidth: 90, maxWidth: 110, },
    {key: 'cb96038d-b288-4604-a076-76991407c140', name: 'Серийный номер', fieldName: 'serial', isResizable: true, minWidth: 90, maxWidth: 110, },
    {key: 'fc224f6f-b135-46ee-b7ae-c7ee5e1cf37b', name: 'Инвентарный номер', fieldName: 'inventory', isResizable: true, minWidth: 90, maxWidth: 110, },
    // {key: 'caac1212-aa11-42ea-9dd5-7d350bc38c79', name: 'Компьютер/группа', fieldName: 'parentname', isResizable: true, minWidth: 90, maxWidth: 110, },
    // {key: 'f37634cc-6dc8-46e7-aad5-279f2214e480', name: 'Место нахождения', fieldName: 'locationname', isResizable: true, minWidth: 90, maxWidth: 110, },
    // {key: 'a9ee0210-cadb-4b93-8fc0-a0f5652a8153', name: 'Ответственный', fieldName: 'ownername', isResizable: true, minWidth: 90, maxWidth: 110, },
    {key: '631c0c53-126a-47df-a17c-5b530b336994', name: 'Последнее примечание', fieldName: 'comment', isResizable: true, minWidth: 150, maxWidth: 300, },
    // {key: '369758ec-4936-45e7-937b-0d15320f3939', name: 'Дата изменения', fieldName: 'timestamp', isResizable: true, minWidth: 125, maxWidth: 125, onRender: renderDateTime },
    // {key: '9fb862b9-70b6-4bfe-a82c-fe9f7cdbf40a', name: 'Пользователь', fieldName: 'username', isResizable: true, minWidth: 90, maxWidth: 110, },
  ];

  const columnsPcDevice = [
    // {key: 'de176ee8-f246-4c88-a4a0-596771856bc7', name: 'Статус', fieldName: 'statusname', isResizable: true, minWidth: 90, maxWidth: 100},
    {key: 'ec06cb36-60d3-4855-a98c-eca2ffed3699', name: '', fieldName: 'icon', isResizable: true, minWidth: 25, maxWidth: 25, onRender: renderIcon},
    {key: 'e3df0917-f17f-4063-a38b-847c1ba3b3c4', name: 'Тип', fieldName: 'typename', isResizable: true, minWidth: 90, maxWidth: 110, },
    {key: '353b370e-9e7b-4b3d-bea4-6b72fb8b66ff', name: 'Модель', fieldName: 'modelname', isResizable: true, minWidth: 90, maxWidth: 110, },
    {key: 'f6e960ce-ea8f-410c-ac13-39628fe9cedd', name: 'Серийный номер', fieldName: 'serial', isResizable: true, minWidth: 90, maxWidth: 110, },
    {key: '6bd1d277-415b-45be-ad69-eadff78e52f2', name: 'Инвентарный номер', fieldName: 'inventory', isResizable: true, minWidth: 90, maxWidth: 110, },
    // {key: 'b9a6b060-226a-4ce9-aa6c-e46117543aef', name: 'Компьютер/группа', fieldName: 'parentname', isResizable: true, minWidth: 90, maxWidth: 110, },
    // {key: 'b3f14419-5287-4184-b445-468432c675df', name: 'Место нахождения', fieldName: 'locationname', isResizable: true, minWidth: 90, maxWidth: 110, },
    // {key: '88950ea6-65f8-404a-bfe4-7507aadd838c', name: 'Ответственный', fieldName: 'ownername', isResizable: true, minWidth: 90, maxWidth: 110, },
    {key: '71f5cc2c-bfbb-47cc-8894-84df19cfbc30', name: 'Последнее примечание', fieldName: 'comment', isResizable: true, minWidth: 150, maxWidth: 300, },
    {key: 'b2733296-bec9-4d5b-b668-05c6bacb1dbb', name: 'Дата изменения', fieldName: 'timestamp', isResizable: true, minWidth: 125, maxWidth: 125, onRender: renderDateTime },
    // {key: '9ef34864-61f3-4d71-832c-088ee636f247', name: 'Пользователь', fieldName: 'username', isResizable: true, minWidth: 90, maxWidth: 110, },
  ];

  const columnsDevice = [
    {key: 'c8c984e9-4e3a-4551-a9bd-35bbba9dde91', name: 'Статус', fieldName: 'statusname', isResizable: true, minWidth: 90, maxWidth: 100},
    {key: '4f8d2320-5f1f-459c-9183-c8cc35dabbf2', name: '', fieldName: 'icon', isResizable: true, minWidth: 25, maxWidth: 25, onRender: renderIcon},
    {key: '6446b239-d0f1-47fc-adfb-748bde450ec8', name: 'Тип', fieldName: 'typename', isResizable: true, minWidth: 90, maxWidth: 110, },
    {key: 'abc22ffd-4996-43d5-9960-c9e2554b99af', name: 'Модель', fieldName: 'modelname', isResizable: true, minWidth: 90, maxWidth: 110, },
    {key: '30ec9385-640d-48e4-8b8f-80a1b9bf89a5', name: 'Серийный номер', fieldName: 'serial', isResizable: true, minWidth: 90, maxWidth: 110, },
    {key: '92b227ef-82bd-4557-96d9-b303ae706315', name: 'Инвентарный номер', fieldName: 'inventory', isResizable: true, minWidth: 90, maxWidth: 110, },
    {key: '62f3a713-e1b6-4497-a455-fea86081d4c2', name: 'Компьютер/группа', fieldName: 'parentname', isResizable: true, minWidth: 90, maxWidth: 110, },
    {key: 'caf87ae4-22a6-46c3-875e-b0ac6baf2df9', name: 'Место нахождения', fieldName: 'locationname', isResizable: true, minWidth: 90, maxWidth: 110, },
    {key: 'de7b22bc-3e43-4ea2-b814-723b1451cf16', name: 'Ответственный', fieldName: 'ownername', isResizable: true, minWidth: 90, maxWidth: 110, },
    {key: '253c0115-35da-45cb-810a-5fe7b11e7ac8', name: 'Последнее примечание', fieldName: 'comment', isResizable: true, minWidth: 150, maxWidth: 300, },
    {key: '0b1d2e65-0955-4cf4-b540-e814a5f41e62', name: 'Дата изменения', fieldName: 'timestamp', isResizable: true, minWidth: 125, maxWidth: 125, onRender: renderDateTime },
    // {key: '5d6b2076-6a23-43c2-ab74-96ec82ed31c1', name: 'Пользователь', fieldName: 'username', isResizable: true, minWidth: 90, maxWidth: 110, },
  ];

  const columnsInfo = [
    {key: '63c2c603-0429-4222-95ce-cd11ebe0d699', name: 'Параметр', fieldName: 'name', isResizable: true, minWidth: 100, maxWidth: 200, isMultiline: true },
    {key: 'ae4dc12d-e05e-4466-ab01-7998a084864e', name: 'Значение', fieldName: 'valuestring', isResizable: true, minWidth: 100, maxWidth: 200, isMultiline: true },
    {key: '9ba49f9d-4d8c-4acd-ae86-cdd1c301ef54', name: 'Дата изменения', fieldName: 'timestamp', isResizable: true, minWidth: 125, maxWidth: 125, onRender: renderDateTime },
    {key: '86b0dd60-60e8-4b50-92ac-17f32ae574cf', name: 'Пользователь', fieldName: 'username', isResizable: true, minWidth: 90, maxWidth: 110, },
  ];

  const columnsNotes = [
    {key: 'e43d29a3-02a4-4cbf-994a-5954478866e1', name: 'Комментарий', fieldName: 'comment', isResizable: true, minWidth: 400, maxWidth: 500, isMultiline: true },
    {key: '99ff9afe-0ea0-48d9-a886-a8867bedb1d6', name: 'Дата изменения', fieldName: 'timestamp', isResizable: true, minWidth: 125, maxWidth: 125, onRender: renderDateTime },
    {key: 'acdd590e-9472-4e1d-b6a9-5dd81543bf79', name: 'Пользователь', fieldName: 'username', isResizable: true, minWidth: 90, maxWidth: 110, },
  ];

  const columnsInfoHistory = [
    // {key: '0ef8edfa-30f6-4964-b1ca-0c58aca369f1', name: 'Дата', fieldName: 'ondate', isResizable: true, minWidth: 100, maxWidth: 100, onRender: renderDate},
    {key: '999943c1-de85-4998-bb8e-8e62ef7d98d9', name: 'Параметр', fieldName: 'name', isResizable: true, minWidth: 150, maxWidth: 250, },
    {key: '5945dc9b-2c7f-4bd5-accd-16e39d73f8c7', name: 'Значение', fieldName: 'valuestring', isResizable: true, minWidth: 150, maxWidth: 250, },
    {key: '1d298aa3-efd6-433c-b81d-8e626a159c66', name: 'Дата изменения', fieldName: 'timestamp', isResizable: true, minWidth: 125, maxWidth: 125, onRender: renderDateTime},
    {key: '83ed56da-a3b5-4c7b-9e23-1b6d49f40a7d', name: 'Пользователь', fieldName: 'username', isResizable: true, minWidth: 90, maxWidth: 110, },
  ];

  const columnsHistory = [
    {key: 'b7bb786b-77a4-405e-a367-da12bb1698be', name: 'Дата', fieldName: 'ondate', isResizable: true, minWidth: 100, maxWidth: 100, onRender: renderDate},
    // {key: 'f7e80bfd-948a-4e33-b25e-43e0c934bdc6', name: 'Действие', fieldName: 'statusname', isResizable: true, minWidth: 90, maxWidth: 110, },
    // {key: '8e3caf0e-3853-4244-8678-efe2569f7b73', name: 'Инвентарный номер', fieldName: 'inventory', isResizable: true, minWidth: 150, maxWidth: 250, },
    // {key: 'a90ec344-ae3c-4900-aa07-4d35a2a80264', name: 'Место нахождения', fieldName: 'locationname', isResizable: true, minWidth: 150, maxWidth: 250, },
    // {key: '7313b1f4-4dc2-40c2-90bf-8c95a0b4232b', name: 'Ответственный', fieldName: 'ownername', isResizable: true, minWidth: 150, maxWidth: 250, },
    // {key: 'd5685808-5749-4ba2-8e8c-dffac4972a94', name: 'Сообщение', fieldName: 'message', isResizable: true, minWidth: 150, maxWidth: 250, },
    {key: '06f325e9-d4b0-4051-962c-34e44877fb88', name: 'Действие', fieldName: 'statustext', isResizable: true, minWidth: 250, maxWidth: 450, },
    {key: '2146277a-e539-4b6e-ad3c-ee92f2d8989f', name: 'Дата изменения', fieldName: 'timestamp', isResizable: true, minWidth: 125, maxWidth: 125, onRender: renderDateTime},
    {key: '74c60c1b-e73c-4018-a376-b4423de2df05', name: 'Пользователь', fieldName: 'username', isResizable: true, minWidth: 90, maxWidth: 110, },
  ];

  const columnsWeekHistory = [
    {key: '5053404f-3579-4540-ae9c-fc58c857e4c4', name: 'Дата', fieldName: 'ondate', isResizable: true, minWidth: 100, maxWidth: 100, onRender: renderDate},
    {key: '5aeeb91e-b0b7-4365-b4e6-4e543e5624bb', name: 'Тип', fieldName: 'historytype', isResizable: true, minWidth: 90, maxWidth: 110, },
    {key: 'a2e76604-228b-4d47-92df-c28ebbff5589', name: 'Объект', fieldName: 'name', isResizable: true, minWidth: 150, maxWidth: 250, },
    {key: '478fef0e-6880-4ae4-8dc9-c1bb3bf62c34', name: 'Действие', fieldName: 'statustext', isResizable: true, minWidth: 250, maxWidth: 450, },
    {key: 'ea562038-ba1c-42e9-a509-99c5c5c70aa6', name: 'Дата изменения', fieldName: 'timestamp', isResizable: true, minWidth: 125, maxWidth: 125, onRender: renderDateTime},
    {key: '9f4ee949-4e9d-4658-86e0-7d789cda2388', name: 'Пользователь', fieldName: 'username', isResizable: true, minWidth: 90, maxWidth: 110, },
  ];

  const columnsModels = [
    {key: '0b1e9e84-ee84-450c-a07b-64edaf950fce', name: 'Тип', fieldName: 'parentname', isResizable: true, minWidth: 150, maxWidth: 250, },
    {key: '6ab57ff2-096e-4c12-9eef-d2ad1ef83a5b', name: 'Наименование', fieldName: 'name', isResizable: true, minWidth: 150, maxWidth: 250, },
  ];

  const commandsWeekHistory = [
    { key: 'refresh', name: 'Обновить', iconProps: { iconName: 'icon-refresh-cw' }, onClick: () => forceReloadWeekHistory(!reloadWeekHistory)},
    { key: 'save', onRender:() => <SaveToExcel filename={'Изменения за неделю'} sheets={[ { name: 'Изменения за неделю', items: itemsWeekHistory, columns: columnsWeekHistory } ]} incommandbar={true}/> },
  ];

  const commandsModels = [
    { key: 'refresh', name: 'Обновить', iconProps: { iconName: 'icon-refresh-cw' }, onClick: () => forceReloadModels(!reloadModels)},
  ];


  const commandsPc = [
    {
      // disabled: true,
      key: 'group',
      name: groupedPc ? 'Разгрупировать' : 'Сгрупировать',
      iconProps: { iconName: groupedPc ? 'icon-folder-minus' : 'icon-folder-plus' },
      onClick: () => setGroupedPc(!groupedPc)
    },
    // { disabled: selectedGroup !== undefined, key: 'add', name: 'Добавить', iconProps: { iconName: 'icon-plus' },  onClick: onAddPc },
    { disabled: !selectedPc, key: 'edit', name: 'Информация', iconProps: { iconName: 'icon-clipboard' }, onClick: () => {
      if (selectedGroup?.deviceid) {
        if (selectedGroup?.tags && selectedGroup.tags.includes('computer')) {
          getItems('api/hardware/info/'+(selectedGroup?.tags)+'/'+(selectedGroup?.deviceid)+'/'+(selectedGroup?.deviceparentid), setItemsInfoPC, setLoadingInfoPC);
        } else {
          setItemsInfoPC([]);
        }
      }
      getItems('api/hardware/grouphistory/'+(selectedGroup && selectedGroup.id), setItemsGroupHistory, setLoadingGroupHistory);
      getItems('api/hardware/notes/'+(selectedGroup && selectedGroup.id), setItemsGroupNotes, setLoadingGroupNotes);
      setEditComputerPanel(true);
    } },
    { disabled: !selectedPc, key: 'notes', name: 'Добавить примечание', iconProps: { iconName: 'icon-message-square' }, onClick: onEditGroupNotes },
    { disabled: !selectedGroup || selectedGroup.action === 'delete', key: 'delete', name: 'Расформировать', iconProps: { iconName: 'icon-trash' }, onClick: onDeleteGroup },
    { key: 'refresh', name: 'Обновить', iconProps: { iconName: 'icon-refresh-cw' }, onClick: () => forceReloadPc(!reloadPc)},
    { key: 'scope', name: (allGroups ? 'Скрыть' : 'Показать')+' группы без компьютеров', iconProps: { iconName: allGroups ? 'icon-eye-off' : 'icon-eye' }, onClick: () => setAllGroups(!allGroups) },
    { key: 'save', onRender:() => <SaveToExcel filename={'Компьютеры и группы'} sheets={[ { name: 'Компьютеры и группы', items: itemsPc, columns: columnsPc } ]} incommandbar={true}/> },
  ];

  const commandsPcDevice = [
    { disabled: selectedDevicesPc !== undefined || (selectedGroup && selectedGroup.action === 'delete'), key: 'add', name: 'Добавить', iconProps: { iconName: 'icon-plus' }, onClick: onLinkDevice },
    {
      key: 'actions',
      text: 'Действия',
      iconProps: { iconName: 'icon-list' },
      disabled: !selectedDevicesPc,
      subMenuProps: {
        items: [
          { disabled: !selectedDevicesPc, key: 'notes', name: 'Добавить примечание', iconProps: { iconName: 'icon-message-square' }, onClick: onEditDeviceNotes },
          { disabled: !selectedDevicesPc || selectedDevicesPc[0].status === 'decommissioned' || selectedDevicesPc[0].status === 'returned' || selectedDevicesPc[1] !== undefined, key: 'inventory', name: 'Инвентарный номер', iconProps: { iconName: 'icon-hash' }, onClick: onChangeInventory },
          // { disabled: !selectedDevicesPc || selectedDevicesPc[0].status === 'decommissioned' || selectedDevicesPc[0].status === 'returned' || selectedDevicesPc[1] !== undefined, key: 'ip', name: 'IP адрес', iconProps: { iconName: 'icon-hash' }, onClick: onChangeIp },
          // { disabled: !selectedDevicesPc || selectedDevicesPc[0].status === 'decommissioned' || selectedDevicesPc[0].status === 'returned' || selectedDevicesPc[1] !== undefined, key: 'name', name: 'Имя компьютера/устройства', iconProps: { iconName: 'icon-edit-2' }, onClick: onChangeName },
          // { disabled: !selectedDevicesPc || selectedDevicesPc[0].status === 'decommissioned' || selectedDevicesPc[0].status === 'returned' || selectedDevicesPc[0].parentid !== null, key: 'parent', name: 'Привязка к компьютеру', iconProps: { iconName: 'icon-link' }, onClick: onChangeParent },
          { disabled: !selectedDevicesPc || selectedDevicesPc[0].status === 'decommissioned' || selectedDevicesPc[0].status === 'returned', key: 'owner', name: 'Материально ответственный', iconProps: { iconName: 'icon-user' }, onClick: onChangeOwner },
          // { disabled: !selectedDevicesPc || selectedDevicesPc[0].status === 'decommissioned' || selectedDevicesPc[0].status === 'returned', key: 'employee', name: 'Привязка к сотруднику', iconProps: { iconName: 'icon-user' }, onClick: onChangeEmployee },
          { disabled: !selectedDevicesPc || selectedDevicesPc[0].status === 'decommissioned' || selectedDevicesPc[0].status === 'returned', key: 'location', name: 'Переместить на хранение', iconProps: { iconName: 'icon-truck' }, onClick: onChangeLocation },
          { disabled: !selectedDevicesPc || selectedDevicesPc[0].status === 'decommissioned' || selectedDevicesPc[0].status === 'returned' || selectedDevicesPc[1] !== undefined || selectedDevicesPc[0].locationid === null, key: 'repair1', name: selectedDevicesPc && selectedDevicesPc[0] && selectedDevicesPc[0].status === 'broken' ? 'Снять отметку о неисправности' : 'Пометить как неисправное', iconProps: { iconName: 'icon-tool' }, onClick: onBrokenDevice },
          { disabled: !selectedDevicesPc || selectedDevicesPc[0].status === 'decommissioned' || selectedDevicesPc[0].status === 'returned' || selectedDevicesPc[1] !== undefined || selectedDevicesPc[0].locationid === null, key: 'repair', name: 'Отправить в ремонт', iconProps: { iconName: 'icon-tool' }, onClick: onRepairDevice },
          // { disabled: !selectedDevicesPc || selectedDevicesPc[0].status === 'decommissioned' || selectedDevicesPc[0].status === 'returned' || selectedDevicesPc[0].groupid !== null || selectedDevicesPc[1] !== undefined || (selectedDevicesPc[0].locationid === null && selectedDevicesPc[0].status !== 'broken'), key: 'decommission', name: 'Списать устройство', iconProps: { iconName: 'icon-trash' }, onClick: onDecommissionDevice },
        ]
      }
    },
    // { disabled: !selectedDevices, key: 'edit', name: 'Изменить', iconProps: { iconName: 'icon-edit-2' }, onClick: onEditDevice },
    { disabled: !selectedDevicesPc || selectedDevicesPc[1] !== undefined, key: 'info', name: 'Информация', iconProps: { iconName: 'icon-clipboard' }, onClick: () => {
      getItems('api/hardware/history/'+(selectedDevicesPc && selectedDevicesPc[0] && selectedDevicesPc[0].id), setItemsHistory, setLoadingHistory);
      getItems('api/hardware/info/'+(selectedDevicesPc && selectedDevicesPc[0] && selectedDevicesPc[0].tags)+'/'+(selectedDevicesPc && selectedDevicesPc[0] && selectedDevicesPc[0].id)+'/'+(selectedDevicesPc && selectedDevicesPc[0] && selectedDevicesPc[0].modelid), setItemsInfo, setLoadingInfo);
      getItems('api/hardware/notes/'+(selectedDevicesPc && selectedDevicesPc[0] && selectedDevicesPc[0].id), setItemsNotes, setLoadingNotes);
      setEditDevicePanel(true);
    } },
    { disabled: (selectedGroup && selectedGroup.action === 'delete'), key: 'refresh', name: 'Обновить', iconProps: { iconName: 'icon-refresh-cw' }, onClick: () => forceReloadDevices(!reloadDevices)},
  ];
  
  const commandsRightPc = [
    {
      key:"search",
      onRender:() => <TextField underlined={true} placeholder='Поиск' onChange={setFilterPc} search={true} width={200}/>
    },
  ];

  const commandsRightDevice = [
    {
      key:"search",
      onRender:() => <TextField underlined={true} placeholder='Поиск' onChange={setFilterDevices} search={true} width={200}/>
    },
  ];

  const commandsRightModels = [
    {
      key:"search",
      onRender:() => <TextField underlined={true} placeholder='Поиск' onChange={setFilterModels} search={true} width={200}/>
    },
  ];

  const commandsRightWeekHistory = [
    {
      key:"date",
      onRender:() => <DatePicker defaultValue={datefrom} selectRange={'week'} onChange={setDatefrom} underlined={true}/>
    },
  ];

  const commandsDeviceNotes = [ { key: 'notes', name: 'Добавить примечание', iconProps: { iconName: 'icon-message-square' }, onClick: onEditDeviceNotes } ];
  const commandsGroupNotes = [ { key: 'notes', name: 'Добавить примечание', iconProps: { iconName: 'icon-message-square' }, onClick: onEditGroupNotes } ];

  const commandsChildrensDevice = [ { disabled: !selectedChildrensDevices, key: 'add', name: 'Закрепить за группой', iconProps: { iconName: 'icon-check' }, onClick: onLinkDeviceConfirm } ];

  const commandsInfo = [
    // { disabled: selectedInfo !== undefined, key: 'add', name: 'Добавить', iconProps: { iconName: 'icon-plus' }, onClick: onAddInfo },
    { disabled: !selectedInfo, key: 'edit', name: 'Изменить', iconProps: { iconName: 'icon-edit-2' }, onClick: onEditInfo },
    { disabled: !selectedInfo, key: 'delete', name: 'Очистить', iconProps: { iconName: 'icon-x' }, onClick: onDeleteInfo },
    { key: 'history', name: 'Просмотреть историю', iconProps: { iconName: 'icon-clock' }, onClick: onShowHistoryInfo },
  ];
  
  const commandsModelInfo = [
    // { disabled: selectedInfo !== undefined, key: 'add', name: 'Добавить', iconProps: { iconName: 'icon-plus' }, onClick: onAddInfo },
    { disabled: !selectedModelInfo, key: 'edit', name: 'Изменить', iconProps: { iconName: 'icon-edit-2' }, onClick: onEditModelInfo },
    { disabled: !selectedModelInfo, key: 'delete', name: 'Очистить', iconProps: { iconName: 'icon-x' }, onClick: onDeleteModelInfo },
    { key: 'history', name: 'Просмотреть историю', iconProps: { iconName: 'icon-clock' }, onClick: onShowHistoryModelInfo },
  ];

  const commandsInfoPC = [
    // { disabled: selectedInfo !== undefined, key: 'add', name: 'Добавить', iconProps: { iconName: 'icon-plus' }, onClick: onAddInfo },
    { disabled: !selectedInfoPC, key: 'edit', name: 'Изменить', iconProps: { iconName: 'icon-edit-2' }, onClick: onEditInfoPC },
    { disabled: !selectedInfoPC, key: 'delete', name: 'Очистить', iconProps: { iconName: 'icon-x' }, onClick: onDeleteInfoPC },
    { disabled: !selectedGroup?.deviceid, key: 'history', name: 'Просмотреть историю', iconProps: { iconName: 'icon-clock' }, onClick: onShowHistoryInfoPC },
  ];

  const commandsDevice = [
    {
      // disabled: true,
      key: 'group',
      name: groupedDevice ? 'Разгрупировать' : 'Сгрупировать',
      iconProps: { iconName: groupedDevice ? 'icon-folder-minus' : 'icon-folder-plus' },
      onClick: () => setGroupedDevice(!groupedDevice)
    },
    { disabled: selectedDevices !== undefined, key: 'add', name: 'Добавить', iconProps: { iconName: 'icon-plus' }, onClick: onEditDevice },
    {
      key: 'actions',
      text: 'Изменить',
      iconProps: { iconName: 'icon-list' },
      disabled: !selectedDevices,
      subMenuProps: {
        items: [
          { disabled: !selectedDevices, key: 'notes', name: 'Добавить примечание', iconProps: { iconName: 'icon-message-square' }, onClick: onEditDeviceNotes },
          { disabled: !selectedDevices || selectedDevices[0].status === 'decommissioned' || selectedDevices[0].status === 'returned' || selectedDevices[1] !== undefined, key: 'inventory', name: 'Инвентарный номер', iconProps: { iconName: 'icon-hash' }, onClick: onChangeInventory },
          // { disabled: !selectedDevices || selectedDevices[0].status === 'decommissioned' || selectedDevices[0].status === 'returned' || selectedDevices[1] !== undefined || selectedDevices[0].parentid !== null, key: 'ip', name: 'IP адрес', iconProps: { iconName: 'icon-hash' }, onClick: onChangeIp },
          // { disabled: !selectedDevices || selectedDevices[0].status === 'decommissioned' || selectedDevices[0].status === 'returned' || selectedDevices[1] !== undefined, key: 'name', name: 'Имя компьютера/устройства', iconProps: { iconName: 'icon-edit-2' }, onClick: onChangeName },
          // { disabled: !selectedDevices || selectedDevices[0].status === 'decommissioned' || selectedDevices[0].status === 'returned' || selectedDevices[0].childrens !== 0, key: 'parent', name: 'Привязка к компьютеру', iconProps: { iconName: 'icon-link' }, onClick: onChangeParent },
          { disabled: !selectedDevices || selectedDevices[0].status === 'decommissioned' || selectedDevices[0].status === 'returned', key: 'owner', name: 'Материально ответственный', iconProps: { iconName: 'icon-user' }, onClick: onChangeOwner },
          // { disabled: !selectedDevices || selectedDevices[0].status === 'decommissioned' || selectedDevices[0].status === 'returned', key: 'employee', name: 'Привязка к сотруднику', iconProps: { iconName: 'icon-user' }, onClick: onChangeEmployee },
          { disabled: !selectedDevices || selectedDevices[0].status === 'decommissioned' || selectedDevices[0].status === 'returned', key: 'location', name: 'Переместить на хранение', iconProps: { iconName: 'icon-truck' }, onClick: onChangeLocation },
          { disabled: !selectedDevices || selectedDevices[0].status === 'decommissioned' || selectedDevices[0].status === 'returned' || selectedDevices[1] !== undefined || selectedDevices[0].locationid === null, key: 'repair1', name: selectedDevices && selectedDevices[0] && selectedDevices[0].status === 'broken' ? 'Снять отметку о неисправности' : 'Пометить как неисправное', iconProps: { iconName: 'icon-tool' }, onClick: onBrokenDevice },
          { disabled: !selectedDevices || selectedDevices[0].status === 'decommissioned' || selectedDevices[0].status === 'returned' || selectedDevices[1] !== undefined || selectedDevices[0].locationid === null, key: 'repair', name: 'Отправить в ремонт', iconProps: { iconName: 'icon-tool' }, onClick: onRepairDevice },
          { disabled: !selectedDevices || selectedDevices[0].status === 'decommissioned' || selectedDevices[0].status === 'returned' || selectedDevices[0].groupid !== null || selectedDevices[1] !== undefined || (selectedDevices[0].locationid === null && selectedDevices[0].status !== 'broken'), key: 'decommission', name: 'Списать устройство', iconProps: { iconName: 'icon-trash' }, onClick: onDecommissionDevice },
          { disabled: !selectedDevices || selectedDevices[0].status === 'decommissioned' || selectedDevices[0].status === 'returned' || selectedDevices[0].groupid !== null || selectedDevices[1] !== undefined || (selectedDevices[0].locationid === null && selectedDevices[0].status !== 'broken'), key: 'return', name: 'Вернуть устройство', iconProps: { iconName: 'icon-trash' }, onClick: onReturnDevice },
        ]
      }
    },
    
    // { disabled: !selectedDevices, key: 'edit', name: 'Изменить', iconProps: { iconName: 'icon-edit-2' }, onClick: onEditDevice },
    { disabled: !selectedDevices || selectedDevices[1] !== undefined, key: 'info', name: 'Информация', iconProps: { iconName: 'icon-clipboard' }, onClick: () => {
      getItems('api/hardware/history/'+(selectedDevices && selectedDevices[0] && selectedDevices[0].id), setItemsHistory, setLoadingHistory);
      getItems('api/hardware/info/'+(selectedDevices && selectedDevices[0] && selectedDevices[0].tags)+'/'+(selectedDevices && selectedDevices[0] && selectedDevices[0].id)+'/'+(selectedDevices && selectedDevices[0] && selectedDevices[0].modelid), setItemsInfo, setLoadingInfo);
      getItems('api/hardware/notes/'+(selectedDevices && selectedDevices[0] && selectedDevices[0].id), setItemsNotes, setLoadingNotes);
      setEditDevicePanel(true);
    } },
    { disabled: !selectedDevices, key: 'link', name: 'Создать группу', iconProps: { iconName: 'icon-link' }, onClick: onAddPc },
    { key: 'refresh', name: 'Обновить', iconProps: { iconName: 'icon-refresh-cw' }, onClick: () => forceReloadDevices(!reloadDevices) },
    { key: 'scope', name: (deletedDevices ? 'Скрыть' : 'Показать')+' cписанные', iconProps: { iconName: deletedDevices ? 'icon-eye-off' : 'icon-eye' }, onClick: () => setDeletedDevices(!deletedDevices) },
    { key: 'save', onRender:() => <SaveToExcel filename={'Устройства'} sheets={[ { name: 'Устройства', items: itemsDevice, columns: columnsDevice } ]} incommandbar={true}/> },
  ];

  const currentDevices = getCurrentDevices();
  const device = "id: "+(currentDevices[0]?.id)+"\n"+
                "ip: "+(currentDevices[0]?.ip)+"\n"+
                "modelid: "+(currentDevices[0]?.modelid)+"\n"+
                "serial: "+(currentDevices[0]?.serial)+"\n"+
                "comment: "+(currentDevices[0]?.comment)+"\n"+
                "modelname: "+(currentDevices[0]?.modelname)+"\n"+
                "buildingname: "+(currentDevices[0]?.buildingname)+"\n"+
                "buildingid: "+(currentDevices[0]?.buildingid)+"\n"+
                "roomid: "+(currentDevices[0]?.roomid)+"\n"+
                "roomname: "+(currentDevices[0]?.roomname)+"\n"+
                "inventory: "+(currentDevices[0]?.inventory)+"\n"+
                "employeeid: "+(currentDevices[0]?.employeeid)+"\n"+
                "employeename: "+(currentDevices[0]?.employeename)+"\n"+
                "name: "+(currentDevices[0]?.name)+"\n"+
                "groupid: "+(currentDevices[0]?.groupid)+"\n"+
                "parentname: "+(currentDevices[0]?.parentname)+"\n"+
                "tags: "+(currentDevices[0]?.tags)+"\n"+
                "computer: "+(currentDevices[0]?.computer)+"\n"+
                "monitor: "+(currentDevices[0]?.monitor)+"\n"+
                "printer: "+(currentDevices[0]?.printer)+"\n"+
                "scaner: "+(currentDevices[0]?.scaner)+"\n"+
                "ups: "+(currentDevices[0]?.ups)+"\n"+
                "network: "+(currentDevices[0]?.network)+"\n"+
                "typeid: "+(currentDevices[0]?.typeid)+"\n"+
                "typename: "+(currentDevices[0]?.typename)+"\n"+
                "ownerid: "+(currentDevices[0]?.ownerid)+"\n"+
                "ownername: "+(currentDevices[0]?.ownername)+"\n"+
                "status: "+(currentDevices[0]?.status)+"\n"+
                "locationid: "+(currentDevices[0]?.locationid)+"\n"+
                "locationname: "+(currentDevices[0]?.locationname)+"\n"+
                "childrens: "+(currentDevices[0]?.childrens)+"\n";

  return (
    <Module {...props}>
      <TabsLinks links={['Компьютеры и группы', 'Устройства', 'Модели', 'Изменения за неделю', 'Отчеты']} onClick={(value) => setTabIndexHardware(value)} tabIndex={tabIndexHardware}/>
      <TabsContainer tabIndex={tabIndexHardware}>
        <Table items={itemsPc} grouped={groupedPc} columns={columnsPc} loading={loadingPc} commands={commandsPc} commandsRight={commandsRightPc} onSelect={onSelectComputer} filter={filterPc} filterColumn='rowfilter'/>
        <Table multiselect={true} grouped={groupedDevice} filter={filterDevices} filterColumn='rowfilter' items={itemsDevice} columns={columnsDevice} loading={loadingDevices} commands={commandsDevice} commandsRight={commandsRightDevice} onSelect={onSelectDevice}/>
        <Tab>
          <Columns width={['40%', '60%']} height='100%'>
            <Table items={itemsModels} columns={columnsModels} loading={loadingModels} onSelect={onSelectModel} commands={commandsModels} commandsRight={commandsRightModels} filter={filterModels} filterColumn='name'/>
            <Table items={itemsModelInfo} columns={columnsInfo} loading={loadingModelInfo} commands={commandsModelInfo} onSelect={onSelectModelInfo}/>
          </Columns>
        </Tab>
        <Table items={itemsWeekHistory} columns={columnsWeekHistory} loading={loadingWeekHistory} commands={commandsWeekHistory} commandsRight={commandsRightWeekHistory}/>
        <Tab/>
      </TabsContainer>
      <Panel loading={loadingDevices} nopadding={true} size='XL' isOpen={editComputerPanel} onDismiss={()=> {setEditComputerPanel(false); setItemsInfoPC([]);}} text={selectedGroup?.name}>
        <Inline>
          <Text size='L' text={'Имя группы: '+(selectedGroup?.name || 'без имени')}/>
          <Hide condition={selectedGroup && selectedGroup.action === 'delete'? true : false}><IconButton icon='edit-2' text='Изменить' onClick={onChangeGroupName}/></Hide>
          <Hide condition={selectedGroup && selectedGroup.action === 'delete'? true : selectedGroup && selectedGroup.deviceid === null ? true : false}><IconButton icon='copy' text='Скопировать имя компьютера' onClick={onCopyGroupName}/></Hide>
        </Inline>
        <Inline>
          <Text size='L' text={'Место нахождения: '+(selectedGroup?.locationname || 'расформирована')}/>
          <Hide condition={selectedGroup && selectedGroup.action === 'delete'? true : false}><IconButton icon='truck' text='Переместить группу' onClick={onChangeGroupLocation}/></Hide>
        </Inline>
        <Inline>
          <Text size='L' text={'Сотрудник: '+(selectedGroup?.employeename || 'не указан')}/>
          <Hide condition={selectedGroup && selectedGroup.action === 'delete'? true : false}><IconButton icon='user' text='Изменить' onClick={onChangeGroupEmployee}/></Hide>
          <Hide condition={selectedGroup && selectedGroup.action === 'delete' ? true : (selectedGroup && selectedGroup.employeeid === null) ? true : false}><IconButton icon='x' text='Убрать' onClick={onRemoveEmployee}/></Hide>
        </Inline>
        <TabsLinks links={['Описание компьютера', 'Привязанные устройства', 'Примечания', 'История изменений']} onClick={(value) => setTabIndexPc(value)} tabIndex={tabIndexPc}/>
        <TabsContainer tabIndex={tabIndexPc}>
          <Table items={itemsInfoPC} columns={columnsInfo} commands={commandsInfoPC} onSelect={onSelectInfoPC}/>
          <Table multiselect={true} items={itemsPcDevice} columns={columnsPcDevice} commands={commandsPcDevice} onSelect={onSelectDevicePc}/>
          <Table items={itemsGroupNotes} columns={columnsNotes} commands={commandsGroupNotes}/>
          <Table message='В данный момент тут не отображается история изменений привязанных устройств' items={itemsGroupHistory} columns={columnsHistory}/>
        </TabsContainer>
      </Panel>
      <Panel loading={loadingChildrenDevices} nopadding={true} size='L' isOpen={addChildrensPanel} onDismiss={()=>setAddChildrensPanel(false)} text='Добавить устройства'>
        <Table multiselect={true} items={itemsChildrensDevice} columns={columnsChildrensDevice} commands={commandsChildrensDevice} onSelect={onSelectDeviceChildrens}/>
      </Panel>
      <Panel loading={loadingInfoHistory} nopadding={true} size='M' isOpen={panelInfoHistory} onDismiss={()=> {setPanelInfoHistory(false); setItemsInfoHistory([])}} text='История изменений в описании'>
        <Table items={itemsInfoHistory} columns={columnsInfoHistory}/>
      </Panel>
      <Panel loading={loadingHistory} nopadding={true} size='L' isOpen={editDevicePanel} onDismiss={()=> {closeEditDevicePanel(); setItemsInfo([]);}} text={currentDevices[0] && currentDevices[0].typename+' '+currentDevices[0].modelname+' '+(currentDevices[0].serial !== ''? currentDevices[0].serial : 'б/н')}>
        <Inline>
          <Text size='L' text={'Инвентарный номер: '+(currentDevices[0] && currentDevices[0].inventory !== '' ? currentDevices[0].inventory : 'без номера')}/>
          <Hide condition={currentDevices[0] ? (currentDevices[0].status === 'decommissioned' || currentDevices[0].status === 'returned') : true}><IconButton icon='edit-2' text='Изменить' onClick={onChangeInventory}/></Hide>
        </Inline>
        <Inline>
          <Text size='L' text={'Место нахождения: '+(currentDevices[0] && currentDevices[0].locationid !== null ? currentDevices[0].locationname : currentDevices[0] && currentDevices[0].status === 'broken'? 'в ремонте': currentDevices[0] && currentDevices[0].status === 'decommissioned'? 'списано' : currentDevices[0] && currentDevices[0].status === 'returned'? 'возвращено' : 'на складе')}/>
          <Hide condition={currentDevices[0] ? (currentDevices[0].status === 'decommissioned' || currentDevices[0].status === 'returned') : true}><IconButton icon='truck' text='Переместить на хранение' onClick={onChangeLocation}/></Hide>
        </Inline>
        <Inline>
          <Text size='L' text={'Материально ответственный: '+(currentDevices[0] && currentDevices[0].ownerid !== null ? currentDevices[0].ownername : 'не указан')}/>
          <Hide condition={currentDevices[0] ? (currentDevices[0].status === 'decommissioned' || currentDevices[0].status === 'returned') : true}><IconButton icon='user' text='Изменить' onClick={onChangeOwner}/></Hide>
        </Inline>
        <TabsLinks links={['Описание устройства', 'Примечания', 'История изменений', 'Отладка']} onClick={(value) => setTabIndexDevice(value)} tabIndex={tabIndexDevice}/>
        <TabsContainer tabIndex={tabIndexDevice}>
          <Table items={itemsInfo} columns={columnsInfo} commands={commandsInfo} onSelect={currentDevices[0] && (currentDevices[0].status === 'decommissioned' || currentDevices[0].status === 'returned') ? undefined : onSelectInfo}/>
          <Table items={itemsNotes} columns={columnsNotes} commands={commandsDeviceNotes}/>
          <Table items={itemsHistory} columns={columnsHistory}/>
          <Tab>
            <Inline>
              <Button text='Изменить модель устройства' onClick={()=>onChangeModel()}/>
              <Button text='Изменить серийный номер' onClick={()=>onChangeSerial()}/>
            </Inline>
            <TextLog text={device}/>
          </Tab>
        </TabsContainer>
      </Panel>
    </Module>
  );

}
