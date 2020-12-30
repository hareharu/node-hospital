import React, { useState, useEffect } from 'react';
import Module, { Hide, TextField, Inline, Button, Dropdown, Table, getItems, openDialog, setProgress, closeDialog, niluuid } from 'components';
import AES from 'crypto-js/aes';
import Utf8 from 'crypto-js/enc-utf8';

interface IItems {
  id: number;
  groupid: number;
  groupname: string;
  name: string;
  job: string;
  login: string;
  pass: string;
  memory: string;
}

export default function ModulePasswords({...props}) {
  const [cryptoKey, setCryptoKey] = useState<string | undefined>(undefined);
  const [encrypted, setEncrypted] = useState(true);
  const [filter, setFilter] = useState('');
  const [items, setItems] = useState<IItems[]>([]);
  const [group, setGroup] = useState(niluuid());
  const [reload, forceReload] = useState(true);
  const [selected, setSelected] = useState(undefined);
  const [selectedGroupname, setSelectedGroupname] = useState('');
  const [selectedName, setSelectedName] = useState('');
  const [selectedJob, setSelectedJob] = useState('');
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedLogin, setSelectedLogin] = useState('');
  const [selectedPass, setSelectedPass] = useState('');
  const [selectedMemory, setSelectedMemory] = useState('');
  const columns = [
    { key: 'f03d46b5-85e1-4198-8c8c-c7ba231db692', name: 'group', fieldName: 'groupname', minWidth: 100, maxWidth: 200, isResizable: true },
    { key: 'f63b7e37-8d4f-4780-9833-3f494e3a75de', name: 'name', fieldName: 'name', minWidth: 100, maxWidth: 200, isResizable: true },
    { key: '294627f4-2a32-4eab-a2f1-743382cabc00', name: 'job', fieldName: 'job', minWidth: 100, maxWidth: 200, isResizable: true },
    { key: '91620930-b331-46d0-9b7e-83bacbf551da', name: 'dept', fieldName: 'dept', minWidth: 100, maxWidth: 200, isResizable: true },
    { key: 'ee4615f0-e2a5-44c0-9017-e9bf72dd6aeb', name: 'login', fieldName: 'login', minWidth: 100, maxWidth: 200, isResizable: true },
    { key: '9043f51d-a48e-4d1c-92dd-fdca1504d8d0', name: 'pass', fieldName: 'pass', minWidth: 100, maxWidth: 200, isResizable: true },
    { key: '42b3a509-1845-4fbb-8b83-647504031cba', name: 'memory', fieldName: 'memory', minWidth: 100, maxWidth: 200, isResizable: true },
  ];

  const decryptItems = (items, key) => {
    setProgress(0);
    openDialog('Расшифровка', 'Подождите, это займет несколько секунд', () => {}, 'progress');
    // var simpleCrypto = new SimpleCrypto(key);
    var step = 100/items.length;
    const arrl = items.length;
    let counter = 0;
    let counter2 = 0;
    const interval = 10;
    var encrypted = false;
    const iid = setInterval(() => {
      counter2 += interval;
      if( counter2 === 100) {
        counter2 = 0;
        setProgress(counter*step/100);
      }
      if (counter === arrl) {
        setItems(items);
        setEncrypted(encrypted);
        closeDialog();
        clearInterval(iid);
      }else {
        try {
          if (items[counter].login) items[counter].login = AES.decrypt(items[counter].login, key).toString(Utf8) || 'ENCRYPTED';
          if (items[counter].pass) items[counter].pass = AES.decrypt(items[counter].pass, key).toString(Utf8) || 'ENCRYPTED';
          if (items[counter].memory) items[counter].memory = AES.decrypt(items[counter].memory, key).toString(Utf8) || 'ENCRYPTED';
        } catch {
          items[counter].login = 'ERROR';
          items[counter].pass =  'ERROR';
          items[counter].memory = 'ERROR';
        }
        if ( items[counter].login === 'ERROR' ||  items[counter].login === 'ENCRYPTED') { encrypted= true;}
        if ( items[counter].pass === 'ERROR' ||  items[counter].pass === 'ENCRYPTED') encrypted = true;
        if ( items[counter].memory === 'ERROR' ||  items[counter].memory === 'ENCRYPTED') encrypted = true;
        counter += 1;
      }
    }, interval);
  }

  const encryptItems = (items, key) => {
    setProgress(0);
    openDialog('Смена ключа', 'Подождите, это займет несколько минут', () => {}, 'progress');
    var busy = false;
    // var simpleCrypto = new SimpleCrypto(key);
    var step = 100/items.length;
    const arrl = items.length;
    let counter = 0;
    let counter2 = 0;
    const interval = 100;
    const iid = setInterval(async () => {
      openDialog('Смена ключа', 'Подождите, это займет несколько минут', () => {}, 'progress');
      counter2 += interval;
      if( counter2 === 1000) {
        counter2 = 0;
        setProgress(counter*step/100);
      }
      if (counter === arrl) {
        setCryptoKey(key);
        closeDialog();
        clearInterval(iid);
        return true;
      } else {
        if(!busy) {
          busy = true
          fetch('api/passwords/encrypt', { credentials: 'same-origin', method: 'POST', body: JSON.stringify({
            id: items[counter].id,
            login: items[counter].login ? AES.encrypt(items[counter].login, key).toString() : null,
            pass: items[counter].pass ? AES.encrypt(items[counter].pass, key).toString() : null,
            memory: items[counter].memory ? AES.encrypt(items[counter].memory, key).toString() : null
          }), headers: {'Content-Type': 'application/json'} }).then(() => {
            busy = false
            counter += 1;
          })
        }
      }
    }, interval);
  }

  const changeKey = () => {
    openDialog('Введите новый ключ', '', (value) => {
      encryptItems(items, value);
/*
      var simpleCrypto = new SimpleCrypto(value);
      console.log('encrypting');
      for (const item of items) {
        await fetch('api/passwords/encrypt', { credentials: 'same-origin', method: 'POST', body: JSON.stringify({
          id: item.id,
          login: item.login ? simpleCrypto.encrypt(item.login) : null,
          pass: item.pass ? simpleCrypto.encrypt(item.pass) : null,
          memory: item.memory ? simpleCrypto.encrypt(item.memory) : null
        }), headers: {'Content-Type': 'application/json'} })
      }
      console.log('done');
      setCryptoKey(value);
*/
    }, 'pass');
  }

  useEffect(() => {
    getItems('api/passwords/passwords/'+group, (items) => {
      setEncrypted(true);
      setItems([]);
      if (cryptoKey !== undefined) {
        if (cryptoKey !== 'SHOWRAWDATA') {
          decryptItems(items, cryptoKey);

        }else{
          setItems(items);
          setEncrypted(false);
        }
      }
    })
  }, [cryptoKey, group, reload]);

  const onSelect = (item) => {
    if (item) {
      var key = 'qw';
      var temp;
      try {
        if (item.login) temp = AES.decrypt(item.login, key).toString(Utf8) || 'ENCRYPTED';
      } catch {
        temp = 'ERROR';
      } finally {
        setSelectedLogin(temp);
      }
      try {
        if (item.pass) temp = AES.decrypt(item.pass, key).toString(Utf8) || 'ENCRYPTED';
      } catch {
        temp = 'ERROR';
      } finally {
        setSelectedPass(temp);
      }
      try {
        if (item.memory) temp = AES.decrypt(item.memory, key).toString(Utf8) || 'ENCRYPTED';
      } catch {
        temp = 'ERROR';
      } finally {
        setSelectedMemory(temp);
      }
      setSelectedGroupname(item.groupname);
      setSelectedName(item.name);
      setSelectedJob(item.job);
      setSelectedDept(item.dept);
    } else {
      setSelected(undefined);
      setSelectedGroupname('');
      setSelectedName('');
      setSelectedJob('');
      setSelectedDept('');
      setSelectedLogin('');
      setSelectedPass('');
      setSelectedMemory('');
    }
  }
  const onClickEdit = () => {}
  const onClickDelete = () => {}
  return (
    <Module {...props}>
      <Inline>
        <Dropdown onChange={setGroup} defaultText='Все пароли' api='api/passwords/groups'/>
        <TextField placeholder='Поиск' onChange={setFilter} search={true} width={200}/>
        <Button icon='refresh-cw' text='Обновить' onClick={() => forceReload(!reload)} primary={true}/>
        <Button icon='unlock' text='Расшифровать' disabled={!encrypted} onClick={() => { openDialog('Введите ключ', '', (value) =>setCryptoKey(value), 'pass') }}/>
        <Button icon='lock' text='Зашифровать' disabled={encrypted} onClick={() => {setCryptoKey(undefined); onSelect(undefined); } }/>
        <Button icon='key' text='Сменить ключ' disabled={encrypted || group !== niluuid()} onClick={() => changeKey() } />
      </Inline>
      <Hide condition={true}>
        <Inline>
          <TextField onChange={setSelectedGroupname} placeholder='groupname' value={selectedGroupname} width={200}/>
          <TextField onChange={setSelectedName} placeholder='name' value={selectedName} width={200}/>
          <TextField onChange={setSelectedJob} placeholder='job' value={selectedJob} width={200}/>
          <TextField onChange={setSelectedDept} placeholder='dept' value={selectedDept} width={200}/>
          <TextField onChange={setSelectedLogin} placeholder='login' value={selectedLogin} width={200}/>
          <TextField onChange={setSelectedPass} placeholder='pass' value={selectedPass} width={200}/>
          <TextField onChange={setSelectedMemory} placeholder='memory' value={selectedMemory} width={200}/>
          <Button icon={selected ? 'edit-2' : 'plus'} text={selected ? 'Изменить' : 'Добавить'} onClick={onClickEdit} primary={true}/>
          <Button icon='trash' text='Удалить' onClick={onClickDelete} disabled={!selected}/>
        </Inline>
      </Hide>
      <Hide condition={encrypted}>
        <Table items={items} columns={columns} filter={filter} filterColumn='name' onSelect={onSelect}/>
      </Hide>
    </Module>
  );
}
