import React from 'react';
import { Button, showMessage, Text } from 'components';
import { LayerHost, Layer } from 'office-ui-fabric-react';
import CsvParse from '@vtex/react-csv-parse'

interface IImportFromCSVProps {
  disabled?: boolean;
  keys: string[];
  onLoad: (items: any) => void;
}

interface IImportFromCSVState {
  filename: string;
}

const uploadRef = React.createRef<HTMLInputElement>();

export class ImportFromCSVSelectedFile extends React.Component {
  public render() {
    return <LayerHost id='ImportFromCSVSelectedFileLayer'/>
  }
}

export class ImportFromCSV extends React.Component<IImportFromCSVProps, IImportFromCSVState> {

  constructor(props: IImportFromCSVProps) {
    super(props);
    this.state = {
      filename: 'Файл не выбран',
    };
  }

  public render() { 
    return (
      <span>
        <Button icon='file' text='Выбрать файл' onClick={this.onClickUpload} disabled={this.props.disabled}/>
        <Layer hostId='ImportFromCSVSelectedFileLayer'><Text size='XL' text={this.state.filename}/></Layer>
        <CsvParse
          keys={this.props.keys}
          onDataUploaded={(data) => this.props.onLoad(data)}
          onError={(err) => showMessage(err.err)}
          render={(onSelect) => <input type='file' accept='.csv' onChange={(event)=>{
            if (event.target.files) {
              if(event.target.files[0] !== undefined) {
                this.setState({ filename: event.target.files[0].name });
                return onSelect(event);
              } else {
                this.setState({ filename: 'Файл не выбран' });
              }
            }
            return this.props.onLoad([]);
          }
        } ref={uploadRef} style={{ display: 'none' }}/>}
        />
      </span>
    );
  }

  private onClickUpload() {
    if (uploadRef.current) {
      uploadRef.current.click();
    }
  }

}
