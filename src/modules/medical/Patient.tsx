import React, { useState } from 'react';
import Module, { Inline, SaveToExcelPatientInfo, PatientPicker, Button, PatientRZN, IResultRZN, Panel, PatientInfo, getItemsPost } from 'components';
export default function ModulePatient({...props}) {
  const [currentPatient, setCurrentPatient] = useState<string|undefined>(undefined);
  const [disabled, setDisabled] = useState(true);
  const [panelRZN, setPanelRZN] = useState(false);
  const [resultRZN, setResultRZN] = useState<IResultRZN|undefined>(undefined);
  const [loadingRZN, setLoadingRZN] = useState(false);
  // const [enp, setEnp] = useState('');
  const [fam, setFam] = useState('');
  const [nam, setNam] = useState('');
  const [oth, setOth] = useState('');
  const [day, setDay] = useState('');
  const onPatientChange = (value?: string) => {
    const disabled = value === undefined;
    setCurrentPatient(value);
    setDisabled(disabled);
  }
  const onSearchRZN = () => {
    setPanelRZN(true);
    getItemsPost('api/rznsoap/all', {
      surname: fam,
      name: nam,
      patronymic: oth,
      birthDate: day,
      // enp
    }, setResultRZN, setLoadingRZN);
  }
  return (
    <Module {...props}>
      <Inline>
        <PatientPicker onChange={onPatientChange}/>  
        <Button icon='search' text='РЗН' disabled={disabled} onClick={onSearchRZN}/>
        <SaveToExcelPatientInfo/>
      </Inline>
      <PatientInfo kod={currentPatient} onChange={(patient) => {
        // setEnp(patient[0]);
        setFam(patient[1]);
        setNam(patient[2]);
        setOth(patient[3]);
        setDay(patient[4]);
      }}/>
      <Panel loading={loadingRZN} isOpen={panelRZN} onDismiss={() => setPanelRZN(false)} text='Информация из РЗН'>
        <PatientRZN result={resultRZN}/>
      </Panel>
    </Module>
  );
}
  