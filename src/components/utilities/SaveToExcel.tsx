import React from 'react';
import ReactExport from 'react-data-export';
import { IColumn, IDetailsRow, CommandBarButton } from 'office-ui-fabric-react';
import { Button, getSummary } from 'components';

const ExcelFile = ReactExport.ExcelFile;
const ExcelSheet = ReactExport.ExcelFile.ExcelSheet;

interface ISaveToExcelProps {
  sheets: ISheet[];
  filename?: string;
  disabled?: boolean;
  text?: string;
  icon?: string;
  incommandbar?: boolean;
}

interface ISaveToExcelState {
  dataset: IDataSet[]; 
}

interface IExcelColumn {
  title: string;
  width: any;
}

interface IExcelStyle {
  fill?: any;
  font?: any;
  numFmt?: any;
  alignment?: any;
  border?: any;
}

interface IExcelData {
  value: string;
  style?: IExcelStyle;
}

interface IExcelDataSet {
  columns: IExcelColumn[];
  data: IExcelData[][];
}

interface IDataSet {
  name: string;
  dataset:IExcelDataSet[];
}

interface ISheet {
  columns: IColumn[];
  items: IDetailsRow[];
  name?: string;
  summary?: boolean;
}

export class SaveToExcel extends React.Component<ISaveToExcelProps, ISaveToExcelState> {

  constructor(props: ISaveToExcelProps) {
    super(props);
    var set:IDataSet[] = [];
    this.state = {
      dataset: set,
    };
  }

  static getDerivedStateFromProps(props, state) {
    var columns:IExcelColumn[];
    var data:IExcelData[][];
    var row:IExcelData[];
    var set:IDataSet[] = [];
    var style = {  border: {
      top: { style: 'thin', color: { auto: 1} },
      bottom: { style: 'thin', color: { auto: 1} },
      left: { style: 'thin', color: { auto: 1} },
      right: { style: 'thin', color: { auto: 1} },
    }};
    props.sheets.forEach(sheet => {
      if (sheet.items.length > 0) {
        columns = [];
        data = [];
        sheet.columns.forEach(column => {
          columns.push({ title: column.name,  width: {wpx: column.maxWidth || column.minWidth} });
        });
        sheet.items.forEach(item => {
          row = [];
          sheet.columns.forEach(column => {
            if (column.fieldName) {
              if (column.onRender) {
                cell = column.onRender(item, undefined, column);
                if (column.data === 'date' || column.data === 'datetime') {
                  // cell = item[column.fieldName];
                  // cell = column.onRender(item, undefined, column);
                  // cell = new Date(item[column.fieldName]);
                  cell = (new Date(item[column.fieldName]).getTime())/86400/1000+(25567+2);
                  // cell = column.onRender(item, undefined, column);
                } else {
                  cell = column.onRender(item, undefined, column);
                }
              } else {
                if (item[column.fieldName] !== null) {
                  cell = item[column.fieldName];
                } else {
                  cell = '';
                }
              }
            } else {
              cell = '';
            }
            let celltype;
            switch (column.data) {
              case 'integer': celltype = 1; break;
              case 'float': celltype = 2; break;
              case 'date': celltype = 14; break;
              case 'time': celltype = 20;break;
              case 'timefull': celltype = 21; break;
              case 'datetime': celltype = 22; break;
              default: celltype = 0;
            }
            row.push({ value: cell, style: { numFmt: celltype, ...style } });
          });
          data.push(row);
        });
        if (sheet.summary) {
          const item = getSummary(sheet.items);
          var cell:any;
          row = [];
          sheet.columns.forEach(column => {
            if (column.fieldName) {
              if (column.onRender) {
                cell = column.onRender(item, undefined, column);
              } else {
                if (item[column.fieldName] !== null) {
                  cell = item[column.fieldName];
                } else {
                  cell = '';
                }
              }
            } else {
              cell = '';
            }
            row.push({ value: cell, style: {...style, font: { bold: true } } });
          });
          data.push(row);
        }
        set.push({ name: sheet.name || 'Экспорт', dataset:[{columns, data}]});
      }
    });
    // console.log(set)
    return { dataset: set }
  }

  public render() { 
    return (
      this.props.incommandbar ?
      <ExcelFile element={<CommandBarButton styles={{root: { height: '100%'}}} disabled={this.props.disabled} text={this.props.text || 'Сохранить'} iconProps={{iconName: this.props.icon || 'icon-save'}}/>} filename={this.props.filename || 'Экспорт'}>
      {this.state.dataset.map(set => <ExcelSheet key={set.name} dataSet={set.dataset} name={set.name}/> )}
    </ExcelFile>
      :
      <ExcelFile element={<Button disabled={this.props.disabled} text={this.props.text || 'Сохранить'} icon={this.props.icon || 'save'}/>} filename={this.props.filename || 'Экспорт'}>
        {this.state.dataset.map(set => <ExcelSheet key={set.name} dataSet={set.dataset} name={set.name}/> )}
      </ExcelFile>
    );
  }

}
