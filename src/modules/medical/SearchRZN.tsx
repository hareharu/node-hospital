import React, { useState } from 'react';
import Module, { Inline, TextField, Dropdown, Button, DatePicker, PatientRZN, IResultRZN, getItemsPost } from 'components';
export default function ModuleSearchRZN({...props}) {
  const [surname, setSurname] = useState('');
  const [name, setName] = useState('');
  const [patronymic, setPatronymic] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [documentTypeId, setDocumentTypeId] = useState('14');
  const [documentSerial, setDocumentSerial] = useState('');
  const [documentNumber, setDocumentNumber] = useState('');
  const [SNILS, setSNILS] = useState('');
  const [enp, setEnp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resultRZN, setResultRZN] = useState<IResultRZN|undefined>(undefined);
  return (
    <Module {...props} info='Поиск возможен по: Полису, ФИО + ДР, СНИЛСу + ДР, Документу + ДР'>
      <Inline>
        <TextField onChange={setSurname} placeholder='Фамилия'/>
        <TextField onChange={setName} placeholder='Имя'/>
        <TextField onChange={setPatronymic} placeholder='Отчество'/>
        <DatePicker onChange={setBirthDate} defaultValue=''/>
        <TextField onChange={setEnp} placeholder='Полис'/>
        <TextField onChange={setSNILS} placeholder='СНИЛС'/>
      </Inline>
      <Inline>
        <Dropdown
          onChange={setDocumentTypeId}
          defaultValue={documentTypeId}
          options={[
            {key:'14', text: 'Паспорт'},
            {key:'3', text: 'Свидетельство'},
          ]}
        />
        <TextField onChange={setDocumentSerial} placeholder='Серия'/>
        <TextField onChange={setDocumentNumber} placeholder='Номер'/>
        <Button icon='search' text='Найти' primary={true} onClick={() => getItemsPost('api/rznsoap/all', {surname, name, patronymic, birthDate, documentTypeId, documentSerial, documentNumber, SNILS, enp}, setResultRZN, setLoading)}/>
      </Inline>
      <PatientRZN loading={loading} result={resultRZN}/>
    </Module>
  );
}
  