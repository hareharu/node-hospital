import React, { useState, useEffect } from 'react';
import Module, { Dropdown, DatePicker, Button, Table, SaveToExcel, getDateString, TextField, TabsLinks, TabsContainer, Inline, getItemsPost, renderDate } from 'components';
export default function ModuleCancer({...props}) {
  const [itemsSuspition, setItemsSuspition] = useState([]);
  const [loadingSuspition, setLoadingSuspition] = useState(false);
  const [itemsDiagnosis, setItemsDiagnosis] = useState([]);
  const [loadingDiagnosis, setLoadingDiagnosis] = useState(false);
  const [datefrom, setDatefrom] = useState(getDateString('first'));
  const [dateto, setDateto] = useState(getDateString('last'));
  const [date, setDate] = useState('2');
  const [tabIndex, setTabIndex] = useState(0);
  const [filter, setFilter] = useState('');
  const [reload, forceReload] = useState(true);
  let columnsSuspition = [
    { key: '562c259c-0dbf-46c3-8a9f-7e26326fcb50', name: 'Дата', fieldName: 'day_priem', onRender: renderDate, minWidth: 75, maxWidth: 75, isResizable: true, isSorted: true, isSortedDescending: true },
    { key: '4be322e8-fc30-4ce7-be5b-66fdc0050f38', name: 'ФИО', fieldName: 'name', minWidth: 200, maxWidth: 250,  isResizable: true },
    { key: 'f5147434-d14b-488d-b3de-d26e87246c83', name: 'Д. рожд.', fieldName: 'day', onRender: renderDate, minWidth: 75, maxWidth: 75, isResizable: true },
    { key: 'e68a3f3f-a695-4e14-9830-20cd26b72620', name: 'Врач', fieldName: 'doc', minWidth: 120, maxWidth: 220, isResizable: true},
    { key: '9122abc7-164a-4cf5-89c7-1425446e99ff', name: 'Направлен', fieldName: 'day_go', onRender: renderDate, minWidth: 75, maxWidth: 75, isResizable: true },
    { key: '33ecf51c-8db2-46bf-a8a4-4ef9784c3d46', name: 'В медицинское учреждение', fieldName: 'mo', minWidth: 120, maxWidth: 220, isResizable: true},
    { key: '98901def-2a49-4be9-9852-4fb4013e704c', name: 'Тип', fieldName: 'ptype', minWidth: 60, maxWidth: 60, isResizable: true},
    { key: '8235e7ce-e608-443c-b89a-96900399334a', name: 'Д. учета', fieldName: 'day_rpr', onRender: renderDate, minWidth: 75, maxWidth: 75, isResizable: true },
    { key: '6fc3b9c4-4f8f-4817-b278-a5cfa0d37bd7', name: 'Комментарий', fieldName: 'errtag', minWidth: 150, maxWidth: 350, isResizable: true},
  ];
  let columnsDiagnosis = [
    { key: 'b2b947c5-b4aa-47b0-9cab-e54e170b6980', name: 'Дата', fieldName: 'day_priem', onRender: renderDate, minWidth: 75, maxWidth: 75, isResizable: true, isSorted: true, isSortedDescending: true },
    { key: 'e30b93e5-8ed6-45d3-aad8-17311ff862c2', name: 'ФИО', fieldName: 'name', minWidth: 200, maxWidth: 250,  isResizable: true },
    { key: 'c0ccb982-827a-4607-b785-16ff301fc61c', name: 'Д. рожд.', fieldName: 'day', onRender: renderDate, minWidth: 75, maxWidth: 75, isResizable: true },
    { key: '989b13f2-c7c5-4a5c-be0d-ac40caa5091f', name: 'Врач', fieldName: 'doc', minWidth: 120, maxWidth: 220, isResizable: true},
    { key: '170388ce-e8d4-42a3-b846-2caf3f25c9ac', name: 'МКБ', fieldName: 'mkb', minWidth: 60, maxWidth: 60, isResizable: true},
    { key: 'a6c4dd4a-1fbb-4109-b0d5-12dc71ec79ed', name: 'S', fieldName: 'stad', minWidth: 60, maxWidth: 60, isResizable: true},
    { key: '0dafdab7-9ea3-476e-aad2-77bd92fa436c', name: 'T', fieldName: 'kod_t', minWidth: 60, maxWidth: 60, isResizable: true},
    { key: '24505c91-168c-4be3-bed2-6a8d7b5f8656', name: 'N', fieldName: 'kod_n', minWidth: 60, maxWidth: 60, isResizable: true},
    { key: 'ad9ea76c-6c78-402e-b586-6992a2fee507', name: 'M', fieldName: 'kod_m', minWidth: 60, maxWidth: 60, isResizable: true},
    { key: 'f0f2eda6-cdee-4df6-a5fa-a042bc7ba1b7', name: 'Повод обращения', fieldName: 'reason', minWidth: 120, maxWidth: 220, isResizable: true},
    { key: '847cc463-0d50-41ac-bcd5-0276e745dd65', name: 'Тип', fieldName: 'ptype', minWidth: 60, maxWidth: 60, isResizable: true},
    { key: '7c4a845a-bbb6-4177-b758-36d93116468d', name: 'Д. учета', fieldName: 'day_rpr', onRender: renderDate, minWidth: 75, maxWidth: 75, isResizable: true },
    { key: '5cfe3e87-9bb2-4610-975f-b3a7fc7f4422', name: 'Комментарий', fieldName: 'errtag', minWidth: 150, maxWidth: 350, isResizable: true},
  ];
  useEffect(() => getItemsPost('api/cancer/suspition', {datefrom, dateto, date}, setItemsSuspition, setLoadingSuspition), [datefrom, dateto, date, reload]);
  useEffect(() => getItemsPost('api/cancer/diagnosis', {datefrom, dateto, date}, setItemsDiagnosis, setLoadingDiagnosis), [datefrom, dateto, date, reload]);
  return (
    <Module {...props} info='Выеделение цветом: желтый - новые случаи, синий - поданные к оплате, зеленый - принятые, красный - отказанные'>
      <Inline>
        <DatePicker defaultValue={datefrom} onChange={setDatefrom}/>
        <DatePicker defaultValue={dateto} onChange={setDateto}/>
        <Dropdown
          onChange={setDate}
          defaultValue={date}
          options={[
            {key:'1', text: 'По дате учета'},
            {key:'2', text: 'по дате посещения'},
          ]}
        />
        <Button icon='refresh-cw' text='Обновить' onClick={() => forceReload(!reload)} primary={true}/>
        <SaveToExcel filename={props.name} sheets={[ { name: 'Подозрение', items: itemsSuspition, columns: columnsSuspition }, { name: 'Онкология', items: itemsDiagnosis, columns: columnsDiagnosis }  ]}/>
        <TextField placeholder='Поиск по ФИО' onChange={setFilter} search={true} width={200}/>
      </Inline>
      <TabsLinks links={['Подозрение на ЗНО', 'Подтвержденные диагнозы']} onClick={(value) => setTabIndex(value)} tabIndex={tabIndex}/>
      <TabsContainer tabIndex={tabIndex}>
        <Table items={itemsSuspition} columns={columnsSuspition} loading={loadingSuspition} filter={filter} filterColumn='name'/>
        <Table items={itemsDiagnosis} columns={columnsDiagnosis} loading={loadingDiagnosis} filter={filter} filterColumn='name'/>
      </TabsContainer>    
    </Module>
  );
}
