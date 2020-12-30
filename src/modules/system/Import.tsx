import React, { useState } from 'react';
import Module, { TabsLinks, TabsContainer, Table, ImportFromCSVSelectedFile, ImportFromCSV, uuid, Button, setProgress, openDialog, closeDialog, Inline, Dropdown, Hide } from 'components';

interface IBuilding {
  id:string;
  name:string;
  address:string;
}

interface IRoom {
  id:string;
  parentid:string;
  buildingid:string;
  name:string;
  phone:string;
  buildingname?: string;
}

interface IModel {
  id:string;
  parentid:string;
  typeid:string;
  name:string;
  type: string;
}


interface IBranch {
  id:string;
  name:string;
}

interface IDepartment {
  id:string;
  parentid:string;
  branchid:string;
  code_esvs:string;
  code_vguz:string;
  name:string;
  branchname?: string;
}

interface IDevice {
  id: string;
  modelid: string;
  serial: string;
  notes: string;
  modelname?: string;
  modelclass?: string;
  buildingname?: string;
  roomname?: string;
  inventory: string;
  typename?: string;
  employeename?: string;
  employeeposition?: string
  pcname?: string;
  ip?: string;
}

interface IHardware {
  id: string;
  ip?: string;
  deviceid: string;
  inventory: string;
  groupid: string;
  roomid: string;
  buildingid: string;
  ownerid: string;
  employeeid: string;
  fromdate: string;
  status: string;
  message: string;
  added: string;
  addedby: string;
  edited: string;
  editedby: string;
  locationid: string;
  name: string;
  info?: string;
}

interface IEmployee {
  id: string;
  name: string;
  position: string;
  // buildingid: string;
  // roomid: string;
  // buildingname?: string;
  // roomname?: string;
  branchid: string;
  branchname?: string;
}

interface INote {
  id: string;
  targetid: string;
  // table: string;
  comment: string;
  pcname: string;
  parent: string;
  employeeid: string;
}

interface IType {
  id: string;
  class: string;
  classname?: string;
  name: string;
}

interface IHardwaregroup {
  id: string;
  name: string;
  employeeid: string;
  ip?: string;
  locationid: string;
}

interface IHardwareinfo {
  id: string;
  value: string;
  // type: string;
  field: string;
  targetid: string;
}

export default function ModuleHardware({...props}) {

  const [readyToImport, setReadyToImport] = useState(false);
  const [tabIndex, setTabIndex] = useState(0);
  const [template, setTemplate] = useState('hardware');
  const [loading, setLoading] = useState(false);

  // const [importedItems, setImportedItems] = useState([]);
  
  const [itemsBuildings, setItemsBuildings] = useState<IBuilding[]>([]);
  const [itemsRooms, setItemsRooms] = useState<IRoom[]>([]);
  const [itemsModels, setItemsModels] = useState<IModel[]>([]);
  const [itemsTypes, setItemsTypes] = useState<IType[]>([]);
  const [itemsDevices, setItemsDevices] = useState<IDevice[]>([]);
  const [itemsBranches, setItemsBranches] = useState<IBranch[]>([]);
  const [itemsDepartments, setItemsDepartments] = useState<IDepartment[]>([]);
  const [itemsEmployees, setItemsEmployees] = useState<IEmployee[]>([]);
  const [itemsNotes, setItemsNotes] = useState<INote[]>([]);
  const [itemsHardware, setItemsHardware] = useState<IHardware[]>([]);
  const [itemsHardwaregroups, setItemsHardwaregroups] = useState<IHardwaregroup[]>([]);
  const [itemsHardwareinfo, setItemsHardwareinfo] = useState<IHardwareinfo[]>([]);

  /*
  const [selectedBuilding, setSelectedBuilding] = useState(undefined);
  const [selectedRoom, setSelectedRoom] = useState(undefined);
  const [selectedModel, setSelectedModel] = useState(undefined);
  const [selectedDevice, setSelectedDevice] = useState(undefined);
  const [selectedEmployee, setSelectedEmployee] = useState(undefined);
  */
  /*
  const referenceAdd = () => {
  }

  const referenceEdit = () => {
  }

  const referenceDelete = () => {
  }
  */

  const columnsDevice = [
    {key: 'b32177cc-e47c-48ea-ab88-c9027eb74323', name: 'Группа', fieldName: 'pcname', isResizable: true, minWidth: 90, maxWidth: 110, },
    // {key: '0db7d177-2bac-4ac4-b92e-ff060d6f2575', name: 'IP', fieldName: 'ip', isResizable: true, minWidth: 90, maxWidth: 110, },
    {key: '19f39bfd-46cd-4f37-8e49-f839cc713236', name: 'Тип', fieldName: 'typename', isResizable: true, minWidth: 90, maxWidth: 110, },
    {key: '51d9b2ed-921b-4d64-8140-c069a9827f21', name: 'Модель', fieldName: 'modelname', isResizable: true, minWidth: 90, maxWidth: 110, },
    {key: '40282960-58d5-4f71-8b83-21b61e71d96c', name: 'Серийный номер', fieldName: 'serial', isResizable: true, minWidth: 90, maxWidth: 110, },
    {key: 'bcd7be37-808f-40c1-ae04-88fa6b2e9ea1', name: 'Инвентарный номер', fieldName: 'inventory', isResizable: true, minWidth: 90, maxWidth: 110, },
    {key: '8a892ba0-3b70-4ad4-aa52-d2492c0402b1', name: 'Здание', fieldName: 'buildingname', isResizable: true, minWidth: 90, maxWidth: 110, },
    {key: 'b7a0ae7b-3aac-4b72-8087-3d8c6307a600', name: 'Помещение', fieldName: 'roomname', isResizable: true, minWidth: 90, maxWidth: 110, },
    {key: 'dd44d1cc-f05b-4d1e-8e92-070a94b3e0ce', name: 'Сотрудник', fieldName: 'employeename', isResizable: true, minWidth: 90, maxWidth: 110, },
    {key: 'b8903143-b667-426e-aa34-c2106a2ce582', name: 'Должность', fieldName: 'employeeposition', isResizable: true, minWidth: 90, maxWidth: 110, },
    {key: 'd01e09c0-4f53-49e6-ad1c-6b369d4ab4b8', name: 'Примечание', fieldName: 'notes', isResizable: true, minWidth: 90, maxWidth: 110, },
  ];
  const columnsBuilding = [
    {key: '69498451-cfb2-40c8-a73e-8711a0416d90', name: 'Название', fieldName: 'name', isResizable: true, minWidth: 90, maxWidth: 110, },
    {key: 'da3a5593-266e-44d7-be70-4009d3ef6a50', name: 'Адрес', fieldName: 'address', isResizable: true, minWidth: 90, maxWidth: 110, },
  ];
  const columnsRoom = [
    {key: '79c19c9b-f18f-44fb-9731-2022eb1037a8', name: 'Название', fieldName: 'name', isResizable: true, minWidth: 90, maxWidth: 110, },
    {key: 'ce4b5e05-4f2e-4b1b-9ec0-927b6d59df11', name: 'Здание', fieldName: 'buildingname', isResizable: true, minWidth: 90, maxWidth: 110, },
    {key: '501b3d05-f849-444c-bc39-af321d4ce264', name: 'Телефон', fieldName: 'phone', isResizable: true, minWidth: 90, maxWidth: 110, },
  ];
  const columnsBranches = [
    {key: '6a67d82a-6ee8-478b-9213-8280a3ee47fa', name: 'Название', fieldName: 'name', isResizable: true, minWidth: 90, maxWidth: 110, },
  ];
  const columnsDepartments = [
    {key: 'e1c0f2df-d8b3-45a6-b9c6-809fc4487f3c', name: 'Филиал', fieldName: 'branchname', isResizable: true, minWidth: 90, maxWidth: 110, },
    {key: 'ad6fb202-4ec4-4b3c-835b-00046746edab', name: 'Код ЕСВС', fieldName: 'code_esvs', isResizable: true, minWidth: 90, maxWidth: 110, },
    {key: 'f96740ac-94eb-4189-8e8e-c7cf04bdf2b6', name: 'Код Госпиталь', fieldName: 'code_vguz', isResizable: true, minWidth: 90, maxWidth: 110, },
  ];
  const columnsTypes = [
    {key: 'a642e834-3e75-42e1-888b-f9a878f8954f', name: 'Название', fieldName: 'name', isResizable: true, minWidth: 90, maxWidth: 110, },
    {key: '8311944d-5e05-4f26-9393-76810f3a4abe', name: 'Класс', fieldName: 'classname', isResizable: true, minWidth: 90, maxWidth: 110, },
  ];
  const columnsModel = [
    {key: '9f27ae9d-c318-452f-99bf-fec2d6ce990e', name: 'Название', fieldName: 'name', isResizable: true, minWidth: 90, maxWidth: 110, },
    {key: 'd207edbb-18c1-4301-9d74-85ec595edad9', name: 'Тип', fieldName: 'type', isResizable: true, minWidth: 90, maxWidth: 110, },
  ];
  const columnsEmployees = [
    {key: '63742f8e-20fc-4602-b376-8b78eade48b5', name: 'ФИО', fieldName: 'name', isResizable: true, minWidth: 90, maxWidth: 110, },
    {key: '9407413a-c4f9-4e60-8f48-07f18c5686ab', name: 'Должность', fieldName: 'position', isResizable: true, minWidth: 90, maxWidth: 110, },
    {key: '95680b4e-a577-4f4e-86da-5a80697ac1ba', name: 'Филиал', fieldName: 'branchname', isResizable: true, minWidth: 90, maxWidth: 110, },
  ];

  /*
  const commandsBuilding = [
    { disabled: selectedBuilding, key: 'add', name: 'Добавить', iconProps: { iconName: 'icon-plus' }, onClick: () => referenceAdd() },
    { disabled: !selectedBuilding, key: 'edit', name: 'Редактировать', iconProps: { iconName: 'icon-edit-2' }, onClick: () => referenceEdit() },
    { disabled: !selectedBuilding, key: 'delete', name: 'Удалить', iconProps: { iconName: 'icon-trash' }, onClick: () => referenceDelete() },
  ];
  const commandsRoom = [
    { disabled: selectedRoom, key: 'add', name: 'Добавить', iconProps: { iconName: 'icon-plus' }, onClick: () => referenceAdd() },
    { disabled: !selectedRoom, key: 'edit', name: 'Редактировать', iconProps: { iconName: 'icon-edit-2' }, onClick: () => referenceEdit() },
    { disabled: !selectedRoom, key: 'delete', name: 'Удалить', iconProps: { iconName: 'icon-trash' }, onClick: () => referenceDelete() },
  ];
  const commandsModel = [
    { disabled: selectedModel, key: 'add', name: 'Добавить', iconProps: { iconName: 'icon-plus' }, onClick: () => referenceAdd() },
    { disabled: !selectedModel, key: 'edit', name: 'Редактировать', iconProps: { iconName: 'icon-edit-2' }, onClick: () => referenceEdit() },
    { disabled: !selectedModel, key: 'delete', name: 'Удалить', iconProps: { iconName: 'icon-trash' }, onClick: () => referenceDelete() },
  ];
  */
  /*
  const selector = (item) => {
    if (!item) return undefined; 
    return item.id;
  }
  */

  const templates = {
    'buildings': {
      'name': 'Здания и помещения',
      'keys': [
        'building_name', 'building_address', 'room_name', 'room_phone',
      ],
    },
    'branches': {
      'name': 'Филиалы и подразделения',
      'keys': [
        'branch_name', 'code_esvs', 'code_vguz',
      ],
    },
    'employees': {
      'name': 'Сотрудники',
      'keys': [
        'branch_name', 'employee_position', 'employee_name',
      ],
    },
    'hardware': {
      'name': 'Оборудование',
      'keys': [
        'building_name', 'room_name', 'employee_position', 'employee_name', 'group_name', // 'group_ip',
        'device0_type', 'device0_model', 'device0_serial', 'device0_inventory', 'device0_notes', 'device0_info',
        'device1_type', 'device1_model', 'device1_serial', 'device1_inventory', 'device1_notes', 'device1_info',
        'device2_type', 'device2_model', 'device2_serial', 'device2_inventory', 'device2_notes', 'device2_info',
        'device3_type', 'device3_model', 'device3_serial', 'device3_inventory', 'device3_notes', 'device3_info',
        'device4_type', 'device4_model', 'device4_serial', 'device4_inventory', 'device4_notes', 'device4_info',
        'device5_type', 'device5_model', 'device5_serial', 'device5_inventory', 'device5_notes', 'device5_info',
        'device6_type', 'device6_model', 'device6_serial', 'device6_inventory', 'device6_notes', 'device6_info',
        'device7_type', 'device7_model', 'device7_serial', 'device7_inventory', 'device7_notes', 'device7_info',
        'device8_type', 'device8_model', 'device8_serial', 'device8_inventory', 'device8_notes', 'device8_info',
        'device9_type', 'device9_model', 'device9_serial', 'device9_inventory', 'device9_notes', 'device9_info',
      ],
    },
  }

  const options = [
    {
      key:'buildings',
      text:'Здания и помещения',
    },
    {
      key:'branches',
      text:'Филиалы и подразделения',
    },
    {
      key:'employees',
      text:'Сотрудники',
    },
    {
      key:'hardware',
      text:'Оборудование',
    },
  ]

  //console.log(options['employees'].keys)

  const getIems = async (api: string) => {
    let response = await fetch(api, { credentials: 'same-origin' });
    if (!response.ok)  throw Error(response.statusText);
    let json = await response.json();
    if (json.status === 'bad')  throw Error(json.error);
    return json.data;
  }
  
  const downloadTemplate = (template: string) => {
    let csv = '\uFEFF'; // Добавляем BOM, иначе Excel будет открывать шаблон в кодировке 1251
    templates[template].keys.forEach(key => csv += key + ';');
    const element = document.createElement('a');
    const file = new Blob([csv], {type:'text/plain;charset=UTF-8'});
    element.href = URL.createObjectURL(file);
    element.download = 'template_' + template + '.csv';
    element.click();
  }

  const filterItems = (items, filter: string, filterParent?: string) => {
    if (filterParent !== undefined) {
      return items.filter(item => item.name.toLowerCase() === filter.toLowerCase() && item.parentid === filterParent);
    } else {
      return items.filter(item => item.name.toLowerCase() === filter.toLowerCase());
    }
  }

  const onImport = async (imported, template?: string) => {
    setReadyToImport(false);
    if (imported.length > 0) {
      setLoading(true);
      var currentBuildings: IBuilding[] = await getIems('api/references/list/building/actual/');
      var currentRooms: IRoom[] = await getIems('api/references/list/room/actual/');
      var currentModels: IModel[] = await getIems('api/references/list/model/actual/');
      var currentBranches: IBranch[] = await getIems('api/references/list/branch/actual/');
      var currentDepartments: IDepartment[] = await getIems('api/references/list/department/actual/');
      var currentEmployees: IEmployee[] = await getIems('api/references/list/employee/actual/');
      var currentTypes: IType[] = await getIems('api/references/list/type/actual/');
      var currentDevices: IDevice[] = await getIems('api/references/list/device/actual/');
      var newBuildings: IBuilding[] = [];
      var newRooms: IRoom[] = [];
      var newModels: IModel[] = [];
      var newDevices: IDevice[] = [];
      var newhardware: IHardware[] = [];
      var newBranches: IBranch[] = [];
      var newDepartments: IDepartment[] = [];
      var newEmployees: IEmployee[] = [];
      var newTypes: IType[] = [];
      var newNotes: INote[] = [];
      var newHardwaregroups: IHardwaregroup[] = [];
      var newHardwareinfo: IHardwareinfo[] = [];
      var newguid = '';
      // imported.forEach(async element => {
      //for (var i = 0; i < 10; i++) {
        //var element = imported[i]
      for (var index in imported) {
        var element = imported[index];
        if (template === 'buildings' || template === 'hardware') {
          if (element.building_name) {
            var building: IBuilding[] = filterItems(currentBuildings, element.building_name);
            if (building.length === 0) {
              newguid = uuid();
              currentBuildings.push({ id: newguid, name: element.building_name, address: element.building_address});
              newBuildings.push({ id: newguid, name: element.building_name, address: element.building_address});
              element.buildingid = newguid;
            } else {
              element.buildingid = building[0].id;
            }
          }
          if (element.room_name) {
            var room: IRoom[] = filterItems(currentRooms, element.room_name, element.buildingid);
            if (room.length === 0) {
              newguid = uuid();
              currentRooms.push({ id: newguid, parentid: element.buildingid, buildingid: element.buildingid, buildingname: element.building_name, name: element.room_name, phone: element.room_phone});
              newRooms.push({ id: newguid, parentid: element.buildingid, buildingid: element.buildingid, buildingname: element.building_name, name: element.room_name, phone: element.room_phone});
              element.roomid = newguid;
            } else {
              element.roomid = room[0].id;
            }
          }
        }
        if (template === 'branches' || template === 'employees') {
          if (element.branch_name) {
            var branch: IBranch[] = filterItems(currentBranches, element.branch_name);
            if (branch.length === 0) {
              newguid = uuid();
              currentBranches.push({ id: newguid, name: element.branch_name });
              newBranches.push({ id: newguid, name: element.branch_name });
              element.branchid = newguid;
            } else {
              element.branchid = branch[0].id;
            }
          }
        }
        if (template === 'branches') {
          if (element.code_esvs) {
            var department: IDepartment[] = filterItems(currentDepartments, element.code_esvs, element.branchid);
            if (department.length === 0) {
              newguid = uuid();
              currentDepartments.push({ id: newguid, parentid: element.branchid, branchid: element.branchid, branchname: element.branch_name, name: element.code_esvs, code_esvs: element.code_esvs, code_vguz: element.code_vguz});
              newDepartments.push({ id: newguid, parentid: element.branchid, branchid: element.branchid, branchname: element.branch_name, name: element.code_esvs, code_esvs: element.code_esvs, code_vguz: element.code_vguz});
              element.departmentid = newguid;
            } else {
              element.departmentid = department[0].id;
            }
          }
        }
        if (template === 'employees' || template === 'hardware') {
          if (element.employee_name) {
            var employee: IEmployee[] = filterItems(currentEmployees, element.employee_name);
            if (employee.length === 0) {
              newguid = uuid();
              currentEmployees.push({ id: newguid, name: element.employee_name, position: element.employee_position, branchid: element.branchid, branchname: element.branch_name });
              newEmployees.push({ id: newguid, name: element.employee_name, position: element.employee_position, branchid: element.branchid, branchname: element.branch_name });
              element.employeeid = newguid;
            } else {
              element.employeeid = employee[0].id;
            }
          }
        }
        if (template === 'hardware') {
          if (element.group_name && (element.roomid || element.buildingid)) {
            newguid = uuid();
            if (element['device0_type'] === 'Системный блок' || element['device0_type'] === 'Моноблок' || element['device0_type'] === 'Неттоп' || element['device0_type'] === 'Ноутбук') element.group_name = element['device0_type'] + ' ' + element.group_name;
            newHardwaregroups.push({ locationid: element.roomid || element.buildingid, id: newguid, name: element.group_name /*name: element.device0_class === 'computer' ? element.device0_type+' '+element.group_name : element.group_name*/ /*, ip: element.group_ip*/, employeeid: element.employeeid});
            element.groupid = newguid;
          }
          for (var i = 0; i < 10; i++) {
            var device = 'device'+i;
            if (element[device+'_type']) {
              // console.log(element[device+'_type']);
              var type: IType[] = filterItems(currentTypes, element[device+'_type']);
              if (type.length > 0) {
                element[device+'_typeid'] = type[0].id;
                element[device+'_class'] = type[0].class;
                element[device+'_classname'] = type[0].classname;
              } else {
                newguid = uuid();
                switch (element[device+'_type']) {
                  case 'Системный блок':
                  case 'Моноблок':
                  case 'Неттоп':
                  case 'Ноутбук': element[device+'_class'] = 'computer'; element[device+'_classname'] = 'Компьютер'; break;
                  case 'Монитор': element[device+'_class'] = 'monitor'; element[device+'_classname'] = 'Монитор'; break;
                  case 'Принтер':
                  case 'МФУ': element[device+'_class'] = 'printer'; element[device+'_classname'] = 'Принтер'; break;
                  case 'Сканер': element[device+'_class'] = 'scaner'; element[device+'_classname'] = 'Сканер'; break;
                  case 'ИБП': element[device+'_class'] = 'ups'; element[device+'_classname'] = 'ИБП'; break;
                  case 'Свитч':
                  case 'Коммутатор': element[device+'_class'] = 'network'; element[device+'_classname'] = 'Сетевое'; break;
                  default: element[device+'_classname'] = 'Прочее';
                }
                currentTypes.push({ id: newguid, name: element[device+'_type'], class: element[device+'_class'], classname: element[device+'_classname']});
                newTypes.push({ id: newguid, name: element[device+'_type'], class: element[device+'_class'], classname: element[device+'_classname']});
                element[device+'_typeid'] = newguid;
              }
              var model: IModel[] = filterItems(currentModels, element[device+'_model'], element[device+'_typeid']);
              if (model.length === 0 || model[0].name === 'б/м') {
                newguid = uuid();
                currentModels.push({ id: newguid, parentid: element[device+'_typeid'], name: element[device+'_model'], typeid: element[device+'_typeid'], type: element[device+'_type']});
                newModels.push({ id: newguid, parentid: element[device+'_typeid'], name: element[device+'_model'], typeid: element[device+'_typeid'], type: element[device+'_type']});
                element[device+'_modelid'] = newguid;
              } else {
                element[device+'_modelid'] = model[0].id;
              }
              newguid = uuid();
              element[device+'_id'] = newguid;
              var deviceTest: IDevice[] = filterItems(currentDevices, element[device+'_serial'], element.modelid);
              if (deviceTest.length === 0 || deviceTest[0].serial === 'б/н') {
                if (element[device+'_notes']) {
                  if (element[device+'_notes'].substring(0, 1) !== '#') {
                    newNotes.push({ id: uuid(), employeeid: element.employeeid, targetid: newguid, parent: i > 0 ? element.device0_id: '', pcname: i === 0 ? element.group_name : '', comment: element[device+'_notes'] ? element[device+'_notes'] : ''});
                  } else {
                    if (element[device+'_class'] === 'computer') {
                      var params = element[device+'_notes'].split('#');
                      if (params[1]) newHardwareinfo.push({ id: uuid(), targetid: newguid, field: 'name', value: params[1] });
                      if (params[2]) { newHardwareinfo.push({ id: uuid(), targetid: newguid, field: 'ip', value: params[2] }); element.ip = params[2]; }
                    }
                    element[device+'_notes'] = '';
                  }
                }
                newDevices.push({ /*ip: element.ip,*/ id: newguid, pcname: element.group_name, modelid: element[device+'_modelid'], modelname: element[device+'_model'], buildingname: element.building_name, roomname: element.room_name, serial: element[device+'_serial'], inventory: element[device+'_inventory'], notes: element[device+'_notes'], typename: element[device+'_type'], employeename: element.employee_name, employeeposition: element.employee_position});
                newhardware.push({ /*ip: element.group_ip,*/ info: element[device+'_info'], employeeid: element.employeeid, name: i === 0 ? element.group_name : '', locationid: element.roomid || element.buildingid, id: uuid(), ownerid: '',deviceid: newguid, inventory: element[device+'_inventory'], groupid: element.groupid, roomid: element.roomid, buildingid: element.buildingid, fromdate: '' ,status: 'imported', message: 'Устройство импортировано', added: '', edited: '', addedby: '', editedby: '' });
              }
            }
          }
        }
      //});
      }
      setItemsBuildings(newBuildings);
      setItemsRooms(newRooms);
      setItemsModels(newModels);
      setItemsDevices(newDevices);
      setItemsHardware(newhardware);
      setItemsBranches(newBranches);
      setItemsDepartments(newDepartments);
      setItemsEmployees(newEmployees);
      setItemsNotes(newNotes);
      setItemsHardwaregroups(newHardwaregroups);
      setItemsHardwareinfo(newHardwareinfo);
      setItemsTypes(newTypes);
      setReadyToImport(true);
      setLoading(false);
    } else {
      setItemsBuildings([]);
      setItemsRooms([]);
      setItemsModels([]);
      setItemsDevices([]);
      setItemsHardware([]);
      setItemsBranches([]);
      setItemsDepartments([]);
      setItemsEmployees([]);
      setItemsNotes([]);
      setItemsTypes([]);
      setItemsHardwaregroups([]);
      setItemsHardwareinfo([]);
    }
  }

  const cancelImport = () => {
    setItemsBuildings([]);
    setItemsRooms([]);
    setItemsModels([]);
    setItemsDevices([]);
    setItemsHardware([]);
    setItemsBranches([]);
    setItemsDepartments([]);
    setItemsEmployees([]);
    setItemsNotes([]);
    setItemsTypes([]);
    setItemsHardwaregroups([]);
    setItemsHardwareinfo([]);
    setReadyToImport(false);
    setLoading(false);
  }

  const commitImport = () => {
    var length = itemsHardwareinfo.length + itemsBuildings.length + itemsRooms.length + itemsModels.length + itemsDevices.length + itemsHardwaregroups.length + itemsHardware.length + itemsBranches.length + itemsDepartments.length + itemsEmployees.length + itemsTypes.length + itemsNotes.length;
    setProgress(0);
    openDialog('Импорт даных', 'Подождите, это займет некоторое время', () => {}, 'progress');
    var table = 0;
    var busy = false;
    var step = 100/length;
    var arrl = itemsBuildings.length;
    let counter = 0;
    let counter1 = 0;
    let counter2 = 0;
    const interval = 100;
    const iid = setInterval(() => {
      counter2 += interval;
      if (counter2 === 1000) {
        counter2 = 0;
        setProgress(counter*step/100);
      }
      if (counter1 === arrl) {
        if (table === 11) {
          closeDialog();
          onImport([]);
          clearInterval(iid);
        } else {
          table += 1;
          switch (table) {
            case 1: arrl = itemsRooms.length; break;
            case 2: arrl = itemsBranches.length; break;
            case 3: arrl = itemsDepartments.length; break;
            case 4: arrl = itemsEmployees.length; break;
            case 5: arrl = itemsTypes.length; break;
            case 6: arrl = itemsModels.length; break;
            case 7: arrl = itemsDevices.length; break;
            case 8: arrl = itemsHardware.length; break;
            case 9: arrl = itemsHardwaregroups.length; break;
            case 10: arrl = itemsHardwareinfo.length; break;
            case 11: arrl = itemsNotes.length; break;
          }
          counter1 = 0;
        }
      } else {
        if(!busy) {
          busy = true
          var api = '';
          var atr = {};
          switch (table) {
            case 0: api = 'api/references/import/building/'+itemsBuildings[counter1].id; atr = { name: itemsBuildings[counter1].name, description: itemsBuildings[counter1].address }; break;
            case 1: api = 'api/references/import/room/'+itemsRooms[counter1].id; atr = { parentid: itemsRooms[counter1].buildingid, name: itemsRooms[counter1].name, description: itemsRooms[counter1].phone }; break;
            case 2: api = 'api/references/import/branch/'+itemsBranches[counter1].id; atr = { name: itemsBranches[counter1].name }; break;
            case 3: api = 'api/references/import/department/'+itemsDepartments[counter1].id; atr = { parentid: itemsDepartments[counter1].branchid, name: itemsDepartments[counter1].code_esvs, description: itemsDepartments[counter1].code_vguz }; break;
            case 4: api = 'api/references/import/employee/'+itemsEmployees[counter1].id; atr = { name: itemsEmployees[counter1].name, description: itemsEmployees[counter1].position, parentid: itemsEmployees[counter1].branchid }; break;
            case 5: api = 'api/references/import/type/'+itemsTypes[counter1].id; atr = { tag: itemsTypes[counter1].class, name: itemsTypes[counter1].name }; break;
            case 6: api = 'api/references/import/model/'+itemsModels[counter1].id; atr = { parentid: itemsModels[counter1].typeid, name: itemsModels[counter1].name.length === 0 ? 'б/м' : itemsModels[counter1].name}; break;
            case 7: api = 'api/references/import/device/'+itemsDevices[counter1].id; atr = { parentid: itemsDevices[counter1].modelid, name: itemsDevices[counter1].serial.length === 0 ? 'б/н' : itemsDevices[counter1].serial}; break;
            case 8: api = 'api/hardware/change/import/'+itemsHardware[counter1].deviceid; atr = { info: itemsHardware[counter1].info, hardware: { status: '', ip: itemsHardware[counter1].ip, employeeid: itemsHardware[counter1].employeeid, groupid: itemsHardware[counter1].groupid, name: itemsHardware[counter1].name, locationid: itemsHardware[counter1].locationid, ownerid: itemsHardware[counter1].ownerid, inventory: itemsHardware[counter1].inventory }}; break;
            case 9: api = 'api/hardware/groups/import/'+itemsHardwaregroups[counter1].id; atr = { hardware: { locationid: itemsHardwaregroups[counter1].locationid, ip: itemsHardwaregroups[counter1].ip, employeeid: itemsHardwaregroups[counter1].employeeid, name: itemsHardwaregroups[counter1].name }}; break;
            case 10: api = 'api/hardware/info/import/'+itemsHardwareinfo[counter1].targetid; atr = { field: itemsHardwareinfo[counter1].field, value: itemsHardwareinfo[counter1].value }; break;
            case 11: api = 'api/hardware/notes/import/'+itemsNotes[counter1].targetid; atr = { comment: itemsNotes[counter1].comment }; break;
          }
          fetch(api, { credentials: 'same-origin', method: 'POST', body: JSON.stringify(atr), headers: {'Content-Type': 'application/json'} }).then(() => {
            busy = false
            counter += 1;
            counter1 += 1;
          })
        }
      }
    }, interval);
  }

  return (
    <Module {...props}>
      <Inline>
        <Dropdown
          onChange={setTemplate}
          defaultValue={template}
          options={options}
          disabled={readyToImport}
        />
        <Button icon='download' text='Скачать шаблон' onClick={() => downloadTemplate(template)} />
        <ImportFromCSV disabled={readyToImport} keys={templates[template].keys} onLoad={(data) => onImport(data, template) }/>
        <Button primary={true} icon='upload' text='Импортировать' onClick={commitImport} disabled={!readyToImport}/>
        <Button icon='x' text='Отменить' onClick={cancelImport} disabled={!readyToImport}/>
        <Hide condition={!readyToImport}><ImportFromCSVSelectedFile/></Hide>
      </Inline>
      <TabsLinks links={['Здания', 'Помещения', 'Филиалы', 'Подразделения', 'Сотрудники', 'Типы', 'Модели', 'Устройства']} onClick={(value) => setTabIndex(value)} tabIndex={tabIndex}/>
      <TabsContainer tabIndex={tabIndex}>
        <Table loading={loading} items={itemsBuildings} columns={columnsBuilding}/>
        <Table loading={loading} items={itemsRooms} columns={columnsRoom}/>
        <Table loading={loading} items={itemsBranches} columns={columnsBranches}/>
        <Table loading={loading} items={itemsDepartments} columns={columnsDepartments}/>
        <Table loading={loading} items={itemsEmployees} columns={columnsEmployees}/>
        <Table loading={loading} items={itemsTypes} columns={columnsTypes}/>
        <Table loading={loading} items={itemsModels} columns={columnsModel}/>
        <Table loading={loading} items={itemsDevices} columns={columnsDevice}/>
      </TabsContainer>
    </Module>
  );

}
