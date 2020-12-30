import React, { useState, useEffect } from 'react';
import Module, { Table, TabsLinks, TabsContainer, TextLog, renderDateTime, renderDate, getItems, getText } from 'components';
export default function ModuleServiceLog({...props}) {
  const [rmr, setRmr] = useState(undefined);
  const [esvs, setEsvs] = useState(undefined);
  const [iemk, setIemk] = useState(undefined);
  const [epic, setEpic] = useState(undefined);
  const [itemsEpic, setItemsEpic] = useState([]);
  const [loadingEpic, setLoadingEpic] = useState(false);
  const [itemsSP, setItemsSP] = useState([]);
  const [loadingSP, setLoadingSP] = useState(false);
  const [tabIndex, setTabIndex] = useState(0);
  const columnsEpic = [
    {key: '446b4772-de89-4322-abeb-acaa6123d471', name: 'Дата загрузки', fieldName: 'load', minWidth: 90, maxWidth: 110, isResizable: true, onRender: renderDateTime, isSorted: true, isSortedDescending: true},
    {key: 'ebd7a065-fec0-4394-b80d-ec88e6d92ffe', name: 'Период', fieldName: 'date', minWidth: 90, maxWidth: 110, isResizable: true, onRender: renderDate},
    {key: '8954a5f6-c95e-42c3-9476-41517cb44ff4', name: 'Пачка', fieldName: 'page', minWidth: 90, maxWidth: 110, isResizable: true},
    {key: 'cd88f2b7-0523-4b5f-9bc8-d1a3706afffa', name: 'Загружено', fieldName: 'result', minWidth: 90, maxWidth: 110, isResizable: true},
    {key: '7d21ad98-baed-40b2-a3ba-681de655b071', name: 'Распознано', fieldName: 'found', minWidth: 90, maxWidth: 110, isResizable: true},
    {key: '6a13ba77-e3e6-4daa-b108-252deb295494', name: 'Ошибка', fieldName: 'error', minWidth: 120, maxWidth: 200, isResizable: true},
  ];
  const columnsSP = [
    {key: 'aac7ed59-9497-44c4-aa5a-5230724d10ee', name: 'Справочник', fieldName: 'sp', minWidth: 200, maxWidth: 300, isResizable: true},
    {key: '57686a5a-a68c-49ac-8725-bc48de193d04', name: 'Начало', fieldName: 'bgdate', minWidth: 90, maxWidth: 110, isResizable: true, onRender: renderDateTime, isSorted: true, isSortedDescending: true},
    {key: 'ad683b8a-b468-4f41-bdbe-de3d63a1f732', name: 'Завершение', fieldName: 'crdate', minWidth: 90, maxWidth: 110, isResizable: true, onRender: renderDateTime},
    {key: 'b79bb059-f428-4d14-badc-88e763a8f59f', name: 'Инсталляционный пакет', fieldName: 'cfile', minWidth: 150, maxWidth: 220, isResizable: true},
    {key: '4f31272f-9646-40f6-a769-2ac9a18b84ae', name: 'Дата сборки', fieldName: 'n_version', minWidth: 90, maxWidth: 110, isResizable: true},
  ];
  const getData = () => {
    getItems('api/service/epicload', setItemsEpic, setLoadingEpic);
    getItems('api/service/hspload', setItemsSP, setLoadingSP);
    getText('api/service/webstlog/rmr', setRmr);
    getText('api/service/webstlog/esvs', setEsvs);
    getText('api/service/webstlog/iemk', setIemk);
    getText('api/service/webstlog/epic', setEpic);
  }
  useEffect(() => getData(), []);
  return (
    <Module {...props}>
      <TabsLinks links={['Загрузка из РМР', 'Загрузка из ЕСВС', 'Отправка ИЭМК', 'Отправка эпикризов', 'Загрузка эпикризов', 'Обновление МИС Госпиталь']} onClick={(value) => setTabIndex(value)} tabIndex={tabIndex}/>
      <TabsContainer tabIndex={tabIndex}>
        <TextLog text={rmr}/>
        <TextLog text={esvs}/>
        <TextLog text={iemk}/>
        <TextLog text={epic}/>
        <Table items={itemsEpic} columns={columnsEpic} loading={loadingEpic}/>
        <Table items={itemsSP} columns={columnsSP} loading={loadingSP}/>
      </TabsContainer>   
    </Module>
  );
}
