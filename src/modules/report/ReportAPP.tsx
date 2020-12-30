import React, { useState, useEffect } from 'react';
import Module, { Table, Inline, DatePicker, Dropdown, Button, getDateString, getCookie, niluuid } from 'components';
export default function ModuleReportAPP({...props}) {
  const [datefrom, setDatefrom] = useState(getDateString('first'));
  const [dateto, setDateto] = useState(getDateString('last'));
  const [podr, setPodr] = useState(getCookie('dept'));
  const [doc, setDoc] = useState(getCookie('doctor'));
  const [spec, setSpec] = useState(niluuid());
  const [cel, setCel] = useState(niluuid());
  const [pay, setPay] = useState(niluuid());
  const [date, setDate] = useState(niluuid());
  const [finance, setFinance] = useState(niluuid());
  const [hidepodr, setHidepodr] = useState(true);
  const [hidedoc, setHidedoc] = useState(true);
  const [report, setReport] = useState(undefined);
  const itemsRepot = [
    {key: 'f39', name: 'Форма 39 (старая)'},
    {key: 'pos', name: 'Посещения и обращения'},
  ];
  const columnsReport = [
    {key: '57289f81-cbc4-4652-bfcf-53a5889f0185', name: '', fieldName: 'name', minWidth: 100},
  ];
  const onSelectReport = (item: any) => {
    if(item) {
      if(item.key !== report) {
        setReport(item.key);
      }
    }else{
      setReport(undefined);
    }
  }
  useEffect(() => { if (podr === niluuid()) setHidepodr(false); }, [podr]);
  useEffect(() => { if (doc === niluuid()) setHidedoc(false); }, [doc]);
  return (
    <Module {...props}>
      <Table items={itemsRepot} columns={columnsReport} onSelect={onSelectReport} height={300} hideHeader={true} sorting={false}/>
      <Inline>
        <DatePicker defaultValue={datefrom} onChange={setDatefrom} />
        <DatePicker defaultValue={dateto} onChange={setDateto} />
        <Dropdown
          disabled={true}
          onChange={setDate}
          defaultValue={date}
          options={[
            {key:niluuid(), text: 'По дате учета'},
            {key:'2', text: 'по дате посещения'},
            // {key:'1', text: 'по дате окончания'},
          ]}
        />
        <Dropdown
          onChange={setPay}
          defaultValue={pay}
          options={[
            {key:niluuid(), text: 'Все'},
            {key:'1', text: 'Оплаченные'},
          ]}
        />
        <Dropdown
          disabled={hidepodr}
          onChange={setPodr}
          defaultValue={podr}
          defaultText='Все филиалы' 
          api='api/who/podr'
        />
      </Inline>   
      <Inline>   
        <Dropdown onChange={setSpec} defaultText='Все специальности' defaultValue={spec} api={'api/doctor/spec/'+podr}/>
        <Dropdown disabled={hidedoc} onChange={setDoc} defaultText='Все врачи' defaultValue={doc} api={'api/doctor/list/'+podr}/>
        <Dropdown onChange={setCel} defaultText='Все цели' defaultValue={cel} api={'api/doctor/cel'}/>
        <Dropdown onChange={setFinance} defaultText='Все источники финансирования' defaultValue={finance} api={'api/doctor/finance'}/>
      </Inline> 
      <Inline>   
        <Button disabled={!report} icon='file-text' primary={true} text='Сформировать' onClick={() => window.open('/api/report/'+report+'/'+datefrom+'/'+dateto+'/'+podr+'/'+doc+'/'+pay+'/'+date, '_blank')}/>
      </Inline>     
    </Module>
  );
}
