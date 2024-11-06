import React from 'react';
import { LayerHost, Layer } from 'office-ui-fabric-react';
import { Text, uuid, Hide, renderDate, niluuid, TextField, getDateString, Dropdown, saveFile, DatePicker, renderTime, renderDateTime, openDialog, Inline, renderNull, dateToString, Table, showMessage, SaveToExcel, TabsLinks, TabsContainer, Button, Panel, TextEditor } from 'components';
import * as FileSaver from 'file-saver';

interface IPatientInfoProps {
  kod?:string;
  onChange?: (enp: string[]) => void;
}


/*
interface IPatient {
 pcode:string,
 snils:string,
 day:string,
 day_death:string,
 pol:string,
 fio:string,
 telephone:string,
 polis:[],
 document:[],
 work:[],
 address:string,
 address2:string,
}
*/

export class SaveToExcelPatientInfo extends React.Component {
  public render() {
    return <LayerHost id='PatientInfoSaveToExcelLayer'/>
  }
}


export class PatientInfo extends React.Component<IPatientInfoProps> {

/*
 setRef = (ref) => {
  this.componentRef = ref;
}
*/

public state = {
  kod:undefined,
  isUpdated:true,
  itemsDDU: [],
  itemsEpicris: [],
  itemsOsobo: [],
  itemsDUchet: [],
  itemsPriem:[],
  groupsPriem:[],
  itemsPatient:[],
  itemsRecords:[],
  itemsPrerecord:[],
  patient:[],
  loadingDDU: true,
  loadingEpicris: true,
  loadingOsobo: true,
  loadingDUchet: true,
  loadingPriem:true,
  loadingPatient:true,
  loadingRecords:true,
  loadingPrerecord:true,
  last:'',
  enp:'',
  tabIndex: 0,
  selected: undefined,
  selectedUrlEpicris: undefined,
  selectedFileName: undefined,
  historyPanelOpened: false,
  text: '',
  editable: undefined,
  selectedEpicris: undefined,
  selectedFileNameEpicris: undefined,
  historyPanelLoading: false,
  docName: undefined,
  docDate: getDateString('today'),
  docTemplate: undefined,
  docTemplateKey: niluuid(),
  groupedPriem: false,
}

public getEpicrisPDF = (id: string, filename: string) => {
  fetch('/api/epicrisis/'+id,{credentials: 'same-origin'})
  .then(response => {
    return response.blob();
  }).then(blob => {
    FileSaver.saveAs(blob, filename);
  })
  .catch(err => showMessage(err));
}

public rznClose = (): void => {
  this.setState({ hideRzn: true });
};

public printTest1 = () => {
  const content = document.getElementById('test');
  const iframe = document.getElementById('ifmcontentstoprint') as HTMLIFrameElement
  if(content && iframe){
    const pri = iframe.contentWindow;
    if(pri){
      pri.document.open();
      const style = pri.document.createElement('style');
      if(pri.document.head){
        pri.document.head.appendChild(style);
        style.innerHTML = `body { color: rgb(10, 10, 10); }`;
      }else{
        alert('no head')
      }
      pri.document.write(content.innerHTML);
      pri.document.close();
      pri.focus();
      pri.print();
    }
  }
}

public onEpicrisClick = (item: any) => {
  if(item.id !== this.state.last) {
    this.setState({last: item.id});
    this.getEpicrisPDF(item.id, item.filename)
  }
}

static getDerivedStateFromProps(props: IPatientInfoProps, state) {
  if (props.kod !== state.kod) {
    return { kod: props.kod, isUpdated:false };
  }
  return null;
}

public componentDidUpdate() {

    if(this.state.kod !== undefined && !this.state.isUpdated ){
      this.setState({ isUpdated: true });
      this.getInfo();
      this.getDDU();
      this.getEpicris();
      //this.getOsobo();
      this.getDUchet();
      this.getPriem();
      this.getRecords();
      this.getPrerec();
    }
  
}

public getInfo = () => {
  this.setState({ loadingPatient :true }); 
  fetch('/api/patient/get/info/'+this.state.kod,{credentials: 'same-origin'})
  .then(response => { if (!response.ok) { throw Error(response.statusText); }
      return response.json();
  })
  .then(json => { if (json.status === 'bad') { throw Error(json.error); }
      this.setState({ itemsPatient : json.data.patient, enp: json.enp }); 
      this.setState({ loadingPatient :false }); 
      if (this.props.onChange !== undefined) {
        this.props.onChange([json.data.enp, json.data.fam, json.data.nam, json.data.oth, json.data.day, json.data.snils]);
      }
  })
  .catch(err => showMessage(err));

  }

public getPriem = () => {
  this.setState({ loadingPriem :true }); 
  fetch('/api/patient/get/priem/'+this.state.kod,{credentials: 'same-origin'})
  .then(response => { if (!response.ok) { throw Error(response.statusText); }
      return response.json();
  })
  .then(json => { if (json.status === 'bad') { throw Error(json.error); }
      this.setState({ itemsPriem : json.data, groupsPriem : json.groups  });
      this.setState({ loadingPriem : false }); 
  })
  .catch(err => showMessage(err));

  }

public getDUchet = () => {
  this.setState({ loadingDUchet : true }); 
  fetch('/api/patient/get/duchet/'+this.state.kod,{credentials: 'same-origin'})
  .then(response => { if (!response.ok) { throw Error(response.statusText); }
      return response.json();
  })
  .then(json => { if (json.status === 'bad') { throw Error(json.error); }
      this.setState({ itemsDUchet : json.data }); 
      this.setState({ loadingDUchet : false }); 
  })
  .catch(err => showMessage(err));

  }

  public getRecords = () => {
    this.setState({ loadingRecords : true }); 
    fetch('/api/records/list/'+this.state.kod,{credentials: 'same-origin'})
    .then(response => { if (!response.ok) { throw Error(response.statusText); }
        return response.json();
    })
    .then(json => { if (json.status === 'bad') { throw Error(json.error); }
        this.setState({ itemsRecords : json.data }); 
        this.setState({ loadingRecords : false }); 
    })
    .catch(err => showMessage(err));
  
    }

  public getPrerec = () => {
    this.setState({ loadingPrerecord : true }); 
    fetch('/api/patient/get/prerec/'+this.state.kod,{credentials: 'same-origin'})
    .then(response => { if (!response.ok) { throw Error(response.statusText); }
        return response.json();
    })
    .then(json => { if (json.status === 'bad') { throw Error(json.error); }
        this.setState({ itemsPrerecord : json.data }); 
        this.setState({ loadingPrerecord : false }); 
    })
    .catch(err => showMessage(err));
  
    }

public getOsobo = () => {
  this.setState({ loadingOsobo : true }); 
  fetch('/api/patient/get/osobo/'+this.state.kod,{credentials: 'same-origin'})
  .then(response => { if (!response.ok) { throw Error(response.statusText); }
      return response.json();
  })
  .then(json => { if (json.status === 'bad') { throw Error(json.error); }
      this.setState({ itemsOsobo : json.data }); 
      this.setState({ loadingOsobo : false }); 
  })
  .catch(err => showMessage(err));

  }

public getEpicris = () => {
  this.setState({ loadingEpicris : true }); 
  fetch('/api/patient/get/epicris/'+this.state.kod,{credentials: 'same-origin'})
  .then(response => { if (!response.ok) { throw Error(response.statusText); }
      return response.json();
  })
  .then(json => { if (json.status === 'bad') { throw Error(json.error); }
      this.setState({ itemsEpicris : json.data }); 
      this.setState({ loadingEpicris : false }); 
  })
  .catch(err => showMessage(err));
  }

public getDDU = () => {
  this.setState({ loadingDDU : true }); 
    fetch('/api/patient/get/ddu/'+this.state.kod,{credentials: 'same-origin'})
    .then(response => { if (!response.ok) { throw Error(response.statusText); }
        return response.json();
    })
    .then(json => { if (json.status === 'bad') { throw Error(json.error); }
        this.setState({ itemsDDU : json.data }); 
        this.setState({ loadingDDU : false }); 
    })
    .catch(err => showMessage(err));

    }
    
  public render() {

    const columnsDDU = [
      {key: 'column1', name: 'Начало', fieldName: 'day_beg', onRender: renderDate, data: 'date', minWidth: 100, maxWidth: 100, isResizable: true},
      {key: 'column2', name: 'Окончание', fieldName: 'day_end', onRender: renderDate, data: 'date', minWidth: 100, maxWidth: 100, isResizable: true, isSorted: true, isSortedDescending: true},
      {key: 'column3', name: 'Врач', fieldName: 'doc', minWidth: 100, maxWidth: 400, isResizable: true},
      {key: 'column4', name: 'Тип', fieldName: 'type', minWidth: 100, isResizable: true},
      {key: 'column5', name: 'МКБ', fieldName: 'mkb', minWidth: 100, maxWidth: 100, isResizable: true},
      {key: 'column6', name: 'Гр. здор.', fieldName: 'gr', minWidth: 100, maxWidth: 100, isResizable: true},
    ];

    const columnsDUchet = [
      {key: 'column1', name: 'Взят', fieldName: 'day', onRender: renderDate, minWidth: 90, maxWidth: 90, isResizable: true, isSorted: true, isSortedDescending: true},
      {key: 'column2', name: 'Снят', fieldName: 'day_end', onRender: renderDate, minWidth: 90, maxWidth: 90, isResizable: true},
      {key: 'column5', name: 'След. явка', fieldName: 'day_next', onRender: renderDate, minWidth: 90, maxWidth: 90, isResizable: true},
      {key: 'column3', name: 'МКБ', fieldName: 'mkb', minWidth: 100, maxWidth: 100, isResizable: true},
      {key: 'column4', name: 'Диагноз', fieldName: 'diagn', minWidth: 100, maxWidth: 400, isResizable: true},
      {key: 'column7', name: 'Д-группа', fieldName: 'dugroup', minWidth: 100, maxWidth: 400, isResizable: true},
      {key: 'column6', name: 'Врач', fieldName: 'doc', minWidth: 100, maxWidth: 400, isResizable: true},
    ];

    var columnsPriem = [
      {key: 'column1', name: 'Дата', fieldName: 'date', onRender: renderDate, data: 'date', minWidth: 100, maxWidth: 100, isResizable: true, isSorted: true, isSortedDescending: true},
      {key: 'column2', name: 'Место', fieldName: 'loc', minWidth: 100, maxWidth: 300, isResizable: true},
      {key: 'column3', name: 'Врач', fieldName: 'doc', minWidth: 100, maxWidth: 300, isResizable: true},
      {key: 'column4', name: 'МКБ', fieldName: 'mkb', minWidth: 100, maxWidth: 300, isResizable: true},
      {key: 'column5', name: 'Диагноз', fieldName: 'mkb_text', minWidth: 150, maxWidth: 400, isResizable: true},
    ];

    const columnsPatient = [
      {key: 'column1', name: '', fieldName: 'field', minWidth: 100, maxWidth: 150},
      {key: 'column2', name: '', fieldName: 'value', minWidth: 500, isRowHeader: true,},
    ];

    const columnsPrerecord = [
      {key: 'column1', name: 'Дата приема', fieldName: 'day', onRender: renderDate, data: 'date', minWidth: 100, maxWidth: 100, isResizable: true, isSorted: true, isSortedDescending: true},
      {key: 'column2', name: 'Время приема', fieldName: 'time', onRender: renderTime, minWidth: 100, maxWidth: 100, isResizable: true},
      {key: 'column3', name: 'Врач', fieldName: 'doc', minWidth: 100, maxWidth: 300, isResizable: true},
      {key: 'column4', name: 'Источник', fieldName: 'source', minWidth: 100, maxWidth: 300, isResizable: true},
      {key: 'column5', name: 'Тип', fieldName: 'type', minWidth: 100, maxWidth: 300, isResizable: true},
      {key: 'column6', name: 'Создана', fieldName: 'create', onRender: renderDate, data: 'date', minWidth: 100, maxWidth: 300, isResizable: true},
    ];

    const columnsEpicris = [
      {key: 'column1', name: 'Начало', fieldName: 'date_in', onRender: renderDateTime, minWidth: 125, maxWidth: 125, isResizable: true},
      {key: 'column2', name: 'Окончание', fieldName: 'dclosem', onRender: renderDateTime, minWidth: 125, maxWidth: 125, isResizable: true, isSorted: true, isSortedDescending: true},
      {key: 'column3', name: 'МКБ', fieldName: 'mkb', minWidth: 100, maxWidth: 100, isResizable: true, onRender: renderNull},
      {key: 'column4', name: 'Условие', fieldName: 'v006', minWidth: 150, maxWidth: 250, isResizable: true, onRender: renderNull},
      {key: 'column5', name: 'Учреждение', fieldName: 'work', minWidth: 250, maxWidth: 550, isResizable: true, onRender: renderNull},
    ];

    const columnsRecords = [
      {key: 'column0', name: 'Дата', fieldName: 'day', onRender: renderDate, data: 'date', minWidth: 100, maxWidth: 100, isResizable: true, isSorted: true, isSortedDescending: true},
      {key: 'column1', name: 'Тип', fieldName: 'template', minWidth: 200, maxWidth: 300, isResizable: true},
      {key: 'column2', name: 'Имя', fieldName: 'name', minWidth: 300, maxWidth: 500, isResizable: true},
      {key: 'column3', name: 'Пользователь', fieldName: 'user_name', minWidth: 150, maxWidth: 170, isResizable: true},
      {key: 'column4', name: 'Изменен', fieldName: 'date', onRender: renderDateTime, minWidth: 125, maxWidth: 125, isResizable: true},
    ];

    const commandsPriem = [
      {
        key: 'group',
        name: this.state.groupedPriem ? 'Разгрупировать' : 'Сгрупировать по талонам',
        iconProps: { iconName: this.state.groupedPriem ? 'icon-folder-minus' : 'icon-folder-plus' },
        onClick: () => this.setState({ groupedPriem: !this.state.groupedPriem })
      },
      {
        key:"info",
        onRender:() => <Hide condition={!this.state.groupedPriem}><Text text='Выеделение цветом: желтый - новые случаи, синий - поданные к оплате, зеленый - принятые, красный - отказанные, серый - не омс'/></Hide>
      },
    ];

    const commandsEpicris = [
      {
        disabled: this.state.selectedEpicris === undefined,
        key: 'print',
        name: 'Распечатать',
        iconProps: { iconName: 'icon-printer' },
        onClick: () =>  window.open(this.state.selectedUrlEpicris, '_blank')

      },
      {
        disabled: this.state.selectedEpicris === undefined,
        key: 'save',
        name: 'Скачать',
        iconProps: { iconName: 'icon-save' },
        onClick: () => {if (this.state.selectedUrlEpicris) saveFile(this.state.selectedUrlEpicris || '', this.state.selectedFileNameEpicris); }
      },
    ];

    const commandsRecords = [
      {
        disabled: this.state.selectedFileName !== undefined,
        key: 'add',
        name: 'Добавить',
        iconProps: { iconName: 'icon-plus' },
        onClick: this.docAdd
      },
      {
        disabled: this.state.selectedFileName === undefined || this.state.editable !== 1,
        key: 'edit',
        name: 'Редактировать',
        iconProps: { iconName: 'icon-edit-2' },
        onClick: this.docEdit
      },
      {
        disabled: this.state.selectedFileName === undefined || this.state.editable !== 1,
        key: 'delete',
        name: 'Удалить',
        iconProps: { iconName: 'icon-trash' },
        onClick: this.docDelete
      },
      {
        disabled: this.state.selectedFileName === undefined,
        key: 'print',
        name: 'Распечатать',
        iconProps: { iconName: 'icon-printer' },
        onClick: () => window.open('/api/records/getpdf/'+this.state.selected, '_blank')
      },
      {
        disabled: this.state.selectedFileName === undefined,
        key: 'save',
        name: 'Скачать',
        iconProps: { iconName: 'icon-save' },
        onClick: () => saveFile('/api/records/getpdf/'+this.state.selected, this.state.selectedFileName)
      },
    ];

    return (
      <>
        <Layer hostId='PatientInfoSaveToExcelLayer'>
          <SaveToExcel disabled={this.state.kod === undefined} filename='Информация о пациенте' sheets={[
            { name: 'Общая информация', items: this.state.itemsPatient, columns: columnsPatient },
            { name: 'Посещения', items: this.state.itemsPriem, columns: columnsPriem },
            { name: 'ДД и ПО', items: this.state.itemsDDU, columns: columnsDDU },
            { name: 'Д учет', items: this.state.itemsDUchet, columns: columnsDUchet },
            { name: 'Запись на прием', items: this.state.itemsPrerecord, columns: columnsPrerecord },
            { name: 'Помощь вне поликлиники', items: this.state.itemsEpicris, columns: columnsEpicris },
          ]}/>
        </Layer>
        <Hide condition={!this.state.kod}>
          <TabsLinks links={['Общая информация','Посещения','ДД и ПО','Д учет','Запись на прием','Помощь вне поликлиники','Документы и выписки']} onClick={this.onTabClick} tabIndex={this.state.tabIndex}/>
          <TabsContainer tabIndex={this.state.tabIndex}>
            <Table items={this.state.itemsPatient} columns={columnsPatient} hideHeader={true} sorting={false} loading={this.state.loadingPatient}/>
            <Table commands={commandsPriem} items={this.state.itemsPriem} columns={columnsPriem} loading={this.state.loadingPriem} sorting={!this.state.groupedPriem} grouped={this.state.groupedPriem} groupeddescending={true}/>
            <Table items={this.state.itemsDDU} columns={columnsDDU} loading={this.state.loadingDDU}/>
            <Table items={this.state.itemsDUchet} columns={columnsDUchet} loading={this.state.loadingDUchet}/>
            <Table items={this.state.itemsPrerecord} columns={columnsPrerecord} loading={this.state.loadingPrerecord}/>
            <Table message='Отображаются только эпикризы полученные из сервиса обмена эпикризами; Если пациент прикреплен к другой МО, то эпикризы на него не будут получены' commands={commandsEpicris} onSelect={this.onSelectEpicris} items={this.state.itemsEpicris} columns={columnsEpicris} loading={this.state.loadingEpicris}/>
            <Table commands={commandsRecords} items={this.state.itemsRecords} columns={columnsRecords} loading={this.state.loadingRecords} onSelect={this.onSelect}/>
          </TabsContainer>
          <Panel loading={this.state.historyPanelLoading} confirm='Изменения не будут сохранены' preventEscape={true} isOpen={this.state.historyPanelOpened} onDismiss={this.toggleHistoryPanel(false)} text={this.state.selectedFileName ? 'Изменить ' + this.state.selectedFileName + ' от ' + dateToString(this.state.docDate) : 'Добавить новый документ'} nopadding={true} size='C' width='21cm'>
            <Inline>
              <DatePicker onChange={this.onDateChange} defaultValue={this.state.docDate}/>
              <Dropdown onChange={this.onTemplateChange} api='api/records/templates' defaultText={this.state.selected && this.state.docTemplate? this.state.docTemplate: 'Без шаблона'} disabled={this.state.selected}/>
              <TextField placeholder='Имя документа' onChange={this.onNameChange} defaultValue={this.state.docName}/>
              <Button primary={true} icon='save' text='Сохранить и закрыть' onClick={this.docSave} disabled={!this.state.docName}/>
            </Inline>
            <TextEditor onChange={this.docChange} value={this.state.text} />
          </Panel>
        </Hide>
      </>
    );
    
  }

  private onDateChange = (value: string) => { this.setState({docDate: value}); }
  private onNameChange = (value: string) => { this.setState({docName: value}); }
  private onTemplateChange = (value: string) => { 
    
    this.setState({docTemplateKey: value}, this.loadTemplate);

  }

  
  private loadTemplate = () => {
    if (this.state.docTemplateKey===niluuid()) {
      this.setState({docName: '', docTemplate: undefined, text: ''})
    } else {
    fetch('/api/records/template/'+this.state.docTemplateKey,{credentials: 'same-origin'})
    .then(response => { if (!response.ok) { throw Error(response.statusText); }
        return response.json();
    })
    .then(json => { if (json.status === 'bad') { throw Error(json.error); }
      this.setState({docName: json.data.full, docTemplate: json.data.name, text: json.data.text})
      // console.log(json)
    })
    .catch(err => showMessage(err));
  }
  }

  private docSave = () => {
    this.setState({ historyPanelLoading: true});
    fetch('/api/records/edit',{body: JSON.stringify({
        id: this.state.selected,
        newid: uuid(),
        user: null,
        template: this.state.docTemplate,
        name: this.state.docName,
        date: this.state.docDate,
        text: this.state.text,
        pdf: null,
        patient: this.state.kod,
      }), method: 'POST', credentials: 'same-origin',headers: {'Content-Type': 'application/json'}})
    .then(response => {
      if (!response.ok) { throw Error(response.statusText);}
      return response.json();
    })
    .then(json => { if (json.status === 'bad') { throw Error(json.error); }

    

    if (!this.state.selected) {
     // this.setState({ selected: json.id })
      this.onSelect(undefined);
    }
    this.setState({ historyPanelOpened: false, historyPanelLoading: false, docTemplateKey: niluuid()});
    this.toggleHistoryPanel(false)

    this.getRecords();

  }).catch(err => { showMessage(err);   this.setState({ historyPanelLoading: false}); });
  }



  

  private docChange = (value) => {
    this.setState({ text: value});
  }

  private docEdit = () => {
    this.setState({ historyPanelLoading: true});
   // this.setState({ loadingRecords : true }); 
    fetch('/api/records/get/'+this.state.selected,{credentials: 'same-origin'})
    .then(response => { if (!response.ok) { throw Error(response.statusText); }
        return response.json();
    })
    .then(json => { if (json.status === 'bad') { throw Error(json.error); }
        this.setState({ historyPanelLoading: false, historyPanelOpened: true, text: json.data.text});
       // console.log(json.data)
        this.toggleHistoryPanel(true);
       // this.setState({ loadingRecords : false }); 
    })
    .catch(err => { showMessage(err);   this.setState({ historyPanelLoading: false}); });
  }
  


   private docDelete = () => {
    openDialog('Удаление', 'Документ "' + this.state.selectedFileName + '" будет удален.', () => {
      fetch('/api/records/delete',{body: JSON.stringify({
        id: this.state.selected,
      }), method: 'POST', credentials: 'same-origin',headers: {'Content-Type': 'application/json'}})
      .then(response => {
        if (!response.ok) {
          throw Error(response.statusText);
        }
        this.getRecords();
      });
    });
  }

  private docAdd = () => {
    this.setState({historyPanelOpened: true,  text: '', selected: undefined});
    this.toggleHistoryPanel(true);
  }

  

  private toggleHistoryPanel = (historyPanelOpened: boolean): (() => void) => {


    return (): void => {
      this.setState({ historyPanelOpened, docTemplateKey: niluuid() });
    };
  };

  private onSelect = (item: any) => {
    if (item) {
      this.setState({ selected: item.id, selectedFileName: item.name, editable: item.editable, docDate: item.day, docName: item.name, docTemplate: item.template });
    }else{
      this.setState({ selected: undefined, selectedFileName: undefined, editable: undefined, docDate: getDateString('today'), docName: undefined, docTemplate: undefined});
    }
  }

  private onSelectEpicris = (item: any) => {
    if (item) {
      if (item.v006 !== 'Скорая медпомощь') {
        this.setState({ selectedEpicris: item.id, selectedUrlEpicris: '/api/epicrisis/' + item.etype + '/' + item.id, selectedFileNameEpicris: item.filename });
      } else {
        this.setState({ selectedEpicris: undefined, selectedUrlEpicris: undefined, selectedFileNameEpicris: undefined });
      }
    }else{
      this.setState({ selectedEpicris: undefined, selectedUrlEpicris: undefined, selectedFileNameEpicris: undefined });
    }
  }

  private onTabClick = (index: number) => { this.setState({ tabIndex: index }); };
  
}
