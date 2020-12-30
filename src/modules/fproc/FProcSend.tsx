import React, { useState, useEffect } from 'react';
import Module, { Button, DatePicker, Dropdown, Table, SaveToExcel, Inline, getItems, getItemsPost, getDateString, renderDate, renderDateTime, Panel, Text, saveFilePost, getCookie } from 'components';

interface ISended {
  id_out: number,
  id_in?: number,
  name_in?: string,
  name_arc_in?: string,
  name_arc: string,
  soft_name: string,
  soft_ver: string,
  xml_ver: string,
  date_out: string,
  type: string,
  sender: string,
  name_old: string,
  date_old: string,
  name_out: string,
  date_send: string,
  status: string,
}

interface IRecieved {
  id_in: number,
  name_in: string,
  name_pro: string,
  name_arc: string,
  date_in: string,
  protocol: string,
  type: string,
}

export default function ModuleFProcSend({...props}) {
  const [itemsSended, setItemsSended] = useState<ISended[]>([]);
  const [itemsRecieved, setItemsRecieved] = useState<IRecieved[]>([]);
  const [selectedSended, setSelectedSended] = useState<ISended | undefined>(undefined);
  const [selectedRecieved, setSelectedRecieved] = useState<IRecieved | undefined>(undefined);
  const [datefrom, setDatefrom] = useState(getDateString('today'));
  const [dateto, setDateto] = useState(getDateString('today'));
  const [sender, setSender] = useState('all');
  const [type, setType] = useState('all');
  const [loadingSended, setLoadingSended] = useState(true);
  const [loadingRecieved, setLoadingRecieved] = useState(false);
  const [panelInfo, setPanelInfo] = useState(false);
  const [itemsFile, setItemsFile] = useState([]);
  const [loadingFile, setLoadingFile] = useState(false);
  const [panelFile, setPanelFile] = useState(false);
  const [reload, forceReload] = useState(true);
  const onSelectSended = (item: ISended | undefined) => setSelectedSended(item);
  const onSelectRecieved = (item: IRecieved | undefined) => setSelectedRecieved(item);
  const access = getCookie('access');
  const onOpenInfo = () => {
    setPanelInfo(true);
    getItems('api/fprocessor/recieved/'+selectedSended?.id_out, setItemsRecieved, setLoadingRecieved);
  }
  const onCloseInfo = () => {
    setPanelInfo(false);
    setItemsRecieved([]);
  }
  const onOpenFile = () => {
    let name = selectedSended?.name_in;
    if (name) name = name.toUpperCase().replace('DB', '').replace('DE', '').replace('.ZIP', '');
    setPanelFile(true);
    getItemsPost('api/fprocessor/file/'+name, {}, setItemsFile, setLoadingFile);
  }
  const onCloseFile = () => {
    setPanelFile(false);
    setItemsFile([]);
  }
  const columnsSended = [
    { key: '8d988299-8103-4fb2-b649-0acd9e62ca68', name: 'Тип', fieldName: 'type', minWidth: 100, maxWidth: 200, isResizable: true },
    { key: '6dc6caec-3d4f-482d-a9a8-c8b5952f38f0', name: 'Отправитель', fieldName: 'sender', minWidth: 100, maxWidth: 200, isResizable: true },
    { key: 'b8346c13-aeab-4f1c-97c7-d387e1a29371', name: 'Имя файла', fieldName: 'name_old', minWidth: 100, maxWidth: 200, isResizable: true },
    { key: '5864d43e-c9c5-4197-9c2c-caf013eabe01', name: 'Дата формирования', fieldName: 'date_old', onRender: renderDateTime, minWidth: 100, maxWidth: 150, isResizable: true },
    { key: 'b54b9d6f-742b-4334-b97d-dd64a731b8da', name: 'Имя исходящего файла', fieldName: 'name_out', minWidth: 100, maxWidth: 200, isResizable: true, },
    { key: '350a5ddc-4954-43d1-8150-09205623d94b', name: 'Дата отправки', fieldName: 'date_send', onRender: renderDateTime, isResizable: true, minWidth: 100, maxWidth: 150 },      
    { key: 'b36464c1-4558-4c8b-936c-f5054827f5cf', name: 'Статус', fieldName: 'status', minWidth: 100, maxWidth: 200, isResizable: true },
  ];
  const columnsRecieved = [
    { key: 'e7af8429-a2af-405b-b35a-71655d2a15a3', name: 'Дата получения', fieldName: 'date_in', onRender: renderDateTime, minWidth: 100, maxWidth: 120, isResizable: true },
    { key: 'ec4e07eb-55d8-4262-ba8f-61eff22f3104', name: 'Имя файла', fieldName: 'name_in', minWidth: 100, maxWidth: 220, isResizable: true },
    { key: '555c5f32-fe49-4f6e-8ec7-ca89dfc3cf58', name: 'Тип', fieldName: 'protocol', minWidth: 100, maxWidth: 200, isResizable: true },
  ];
  const columnsFile = [
    { key: 'a6c84d2c-aff0-4ca9-b4ab-f3ad712191f4', name: 'fam', fieldName: 'fam', minWidth: 100, maxWidth: 100, isResizable: true },
    { key: 'a99cdc48-9e6c-4c1e-affd-bda6c55ee358', name: 'im', fieldName: 'im', minWidth: 100, maxWidth: 100, isResizable: true },
    { key: '739025dd-6252-4b3a-ac47-a64dc1308f86', name: 'ot', fieldName: 'ot', minWidth: 100, maxWidth: 100, isResizable: true },
    { key: '1672001e-3e08-4ffb-baa9-c7ea34ad62d1', name: 'dr', fieldName: 'dr', onRender: renderDate, minWidth: 100, maxWidth: 120, isResizable: true },
    { key: 'ac7589cc-4c79-4cbe-981a-d40447b9d828', name: 'date_1', fieldName: 'date_1', onRender: renderDateTime, minWidth: 100, maxWidth: 120, isResizable: true },
    { key: '6c917658-0b5a-4667-ab90-8f74efae8b9a', name: 'date_2', fieldName: 'date_2', onRender: renderDateTime, minWidth: 100, maxWidth: 120, isResizable: true },
    { key: '061e7abd-5525-4f59-9416-7733f91ddeff', name: 'code_md', fieldName: 'code_md', minWidth: 100, maxWidth: 100, isResizable: true },
    { key: 'ef3c4aec-de02-438b-a06b-d0860ca24d23', name: 'sump', fieldName: 'sump', minWidth: 100, maxWidth: 100, isResizable: true },
    { key: '685ebd3c-f0fb-42ba-a891-6f366c99dab0', name: 'comment_z', fieldName: 'comment_z', minWidth: 300, maxWidth: 400, isResizable: true },
  ];
  const commandsSended = [
    { disabled: !selectedSended, key: 'info', name: 'Информация по реестру', iconProps: { iconName: 'icon-info' }, onClick: onOpenInfo },
    { disabled: !selectedSended?.name_arc_in, key: 'download', name: 'Скачать последний протокол', iconProps: { iconName: 'icon-save' }, onClick: () => saveFilePost('api/fprocessor/download/protocol/'+selectedSended?.id_in, {}, selectedSended?.name_in?.replace('.zip','.doc')) },
    { disabled: access !== 'admin' || !selectedSended?.name_in, key: 'file', name: 'Случаи лечения', iconProps: { iconName: 'icon-list' }, onClick: onOpenFile },
  ];
  const commandsRecieved = [
    { disabled: !selectedRecieved?.name_arc, key: 'download', name: 'Скачать ответный реестр', iconProps: { iconName: 'icon-save' }, onClick: () => saveFilePost('api/fprocessor/download/recieved/'+selectedRecieved?.id_in, {}, selectedRecieved?.name_in) },
    { disabled: !selectedRecieved?.name_arc || selectedRecieved?.type === 'H', key: 'download', name: 'Скачать ответный реестр для Промед', iconProps: { iconName: 'icon-save' }, onClick: () => saveFilePost('api/fprocessor/download/promed/'+selectedRecieved?.id_in, {}, selectedRecieved?.name_pro) },
  ];
  useEffect(() => getItems('api/fprocessor/sended/'+datefrom+'/'+dateto+'/'+type+'/'+sender, setItemsSended, setLoadingSended), [datefrom, dateto, type, sender, reload]);
  return (
    <Module {...props}>
      <Inline>
        <DatePicker defaultValue={datefrom} onChange={setDatefrom}/>
        <DatePicker defaultValue={dateto} onChange={setDateto}/>
        <Dropdown onChange={setType} defaultText='Все типы файлов' defaultKey='all' api='api/fprocessor/types'/>
        <Dropdown onChange={setSender} defaultText='Все отправители' defaultKey='all' api='api/fprocessor/senders'/>
        <Button icon='refresh-cw' text='Обновить' onClick={() => forceReload(!reload)} primary={true}/>
        <SaveToExcel filename={props.name} sheets={[ { name: 'Файлы', items: itemsSended, columns: columnsSended } ]}/>
      </Inline>
      <Table items={itemsSended} columns={columnsSended} commands={commandsSended} onSelect={onSelectSended} loading={loadingSended}/>
      <Panel nopadding={true} size='M' isOpen={panelInfo} onDismiss={onCloseInfo} text={'Реестр '+selectedSended?.name_out}>
        <Text size='M' text={'Тип: '+selectedSended?.type}/>
        <Text size='M' text={'Отправитель: '+selectedSended?.sender}/>
        <Text size='M' text={'Имя файла: '+selectedSended?.name_old}/>
        <Text size='M' text={'Версия МИС: '+selectedSended?.soft_name+' '+selectedSended?.soft_ver}/>
        <Text size='M' text={'Дата формирования: '+selectedSended?.date_old}/>
        <Text size='M' text={'Дата обработки: '+selectedSended?.date_out}/>
        <Text size='M' text={'Дата отправки: '+selectedSended?.date_send}/>
        <Table items={itemsRecieved} loading={loadingRecieved} columns={columnsRecieved} commands={commandsRecieved} onSelect={onSelectRecieved} />
      </Panel>
      <Panel nopadding={true} size='XL' isOpen={panelFile} onDismiss={onCloseFile} text={'ТЕСТ информация может быть неверной'}>
        <Table items={itemsFile} loading={loadingFile} columns={columnsFile}/>
      </Panel>
    </Module>
  );
}
