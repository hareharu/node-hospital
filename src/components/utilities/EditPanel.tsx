import React from 'react';
import {TextField, IconPicker, DatePicker, Panel, Dropdown, TagPicker, Checkbox, NumberField, Text,  theme, niluuid } from 'components';

interface IDialogBoxState {
  title?: string;
  text?: string;
  value?: string | boolean;
  isHiden: boolean;
  noText?: string;
  yesText?: string;
  type?: string;
  result?: any;
  fields?: string[];
  //inputs:IInputWithKey[];
  inputs:IEditPanelInput[];
  progress?: number;
  panelOpened: boolean;
  disabled?: boolean;
  onSave?: (state: any) => void;
}

export interface IEditPanelInput {
  key: string;
  type: string;
  value?: string;
  label?: string;
  options?: { key: string, text: string }[];
  api?: string;
  deftest?: string;
  disabled?: boolean;
  parent?: string;
}

/*
interface ISharedProps {
  disabled?: boolean;
  label?: string;
  // value?: string;
  // defaultValue?: string;
  onChange?: (value: string) => void;
}

*/

/*
interface IInputWithKey {
  key: string;
  type: string;
  value: string;
}
*/

let openEditPanelFn: (title: string, inputs:IEditPanelInput[], result?:any, fields?:string[]) => void;


export function openEditPanel(title: string, inputs:IEditPanelInput[], result?:any, fields?:string[]) {
  openEditPanelFn(title, inputs, result, fields);
}


/*
let closeDialogFn: () => void;

export function closeDialog2() {
  closeDialogFn();
}

let setProgressFn: (value: number) => void;

export function setProgress2(value: number) {
  setProgressFn(value);
}
*/
interface IInputsRendererState {
  [key: string]: string;
}

interface IInputsRendererProps {
  //inputs:IInputWithKey[];
  inputs:IEditPanelInput[];
  fields?:string[];
  onCheck: (value: boolean) => void;
}

interface IRawParams {
  [key: string]: string
}

let getInputsValuesFn: () => IInputsRendererState;

export function getInputsValues(): IInputsRendererState {
  return getInputsValuesFn();
}

export class InputsRenderer extends React.Component<IInputsRendererProps, IInputsRendererState> {

  constructor(props: IInputsRendererProps) {
  
  super(props);
    var initState:IRawParams[] = [];
    props.inputs.map((item) => initState[item.key] = item.value );
    //this.state = initState;
  }
 
  public componentDidMount() {
    getInputsValuesFn = this.onGetInputsValues;
    this.props.inputs.map((item) => this.setState({ [item.key]: item.value || '' }, this.onCheck));
  
  }

  public render() {
    return (
      this.props.inputs.map((item, index) => {
          return <div key={'editpanel_'+index}>{this.renderItem(item)}</div>
        })
    );
  }

  private onGetInputsValues = () => {
    return this.state;
  }

  private onCheck = () => {
    if (this.props.fields) {
      var isDisabled = false;
      for (var field in this.props.fields) {
        // console.log(this.props.fields[field]+' '+this.state[this.props.fields[field]]);
        if (this.state[this.props.fields[field]] === '' || this.state[this.props.fields[field]] === niluuid()) isDisabled = true;
      }
      this.props.onCheck(isDisabled);
    }
  }

  private renderItem(item: IEditPanelInput): JSX.Element {
    /*
    const sharedProps: ISharedProps = {
      disabled: item.disabled,
      label: item.label,
      onChange: (value) => this.setState({ [item.key]: value }, this.onCheck),
    };
    */
    if (this.state !== null) {
      switch (item.type) {
        case 'text': return <TextField disabled={item.disabled} label={item.label} value={this.state[item.key]} onChange={(value) => this.setState({ [item.key]: value }, this.onCheck)} />
        case 'pass': return <TextField disabled={item.disabled} label={item.label} value={this.state[item.key]} onChange={(value) => this.setState({ [item.key]: value }, this.onCheck)} password={true} />
        case 'multiline': return <TextField disabled={item.disabled} label={item.label} value={this.state[item.key]} onChange={(value) => this.setState({ [item.key]: value }, this.onCheck)} multiline={true} />
        case 'number': return <NumberField disabled={item.disabled} label={item.label} defaultValue={this.state[item.key]} onChange={(value) => this.setState({ [item.key]: value }, this.onCheck)} />
        case 'icon': return <IconPicker disabled={item.disabled} label={item.label} value={this.state[item.key]} onChange={(value) => this.setState({ [item.key]: value }, this.onCheck)} icons='icon' full={true}/>
        case 'date': return <DatePicker disabled={item.disabled} label={item.label} defaultValue={this.state[item.key]} onChange={(value) => this.setState({ [item.key]: value }, this.onCheck)} />
        case 'check': return <Checkbox disabled={item.disabled} label={item.label} defaultValue={this.state[item.key]} onChange={(value) => this.setState({ [item.key]: value }, this.onCheck)} />
        case 'select': return <Dropdown disabled={item.disabled} label={item.label} value={this.state[item.key]} onChange={(value) => this.setState({ [item.key]: value }, this.onCheck)} defaultText={item.deftest} options={item.options} />
        case 'selectapi': return <Dropdown disabled={item.disabled} label={item.label} value={this.state[item.key]} onChange={(value) => this.setState({ [item.key]: value }, this.onCheck)} defaultText={item.deftest} api={item.parent ? item.api + '/' + (this.state[item.parent] || niluuid()) : item.api} />
        case 'selecttag': return <TagPicker  disabled={item.disabled} label={item.label} value={this.state[item.key]} onChange={(value) => this.setState({ [item.key]: value }, this.onCheck)} defaultText={item.deftest} api={item.parent ? item.api + '/' + (this.state[item.parent] || niluuid()) : item.api} />
        default: return <Text color={theme.palette.redDark} text={item.type+' - некорректный тип элемента!'}/>
      }
    } else {
      return <span/>
    }
  }
}

export class EditPanel extends React.Component<{}, IDialogBoxState> {

  constructor(props: {}) {
    super(props);
    this.state = {
      isHiden: true,
      panelOpened: false,
      inputs: [],
      disabled: false,
    };
  }

  public componentDidMount() {
    openEditPanelFn = this.onOpen;
    // closeDialogFn = this.onClose;
    // setProgressFn = this.onPercent;
  }

  private onChangeValue = (value: string) => {
    this.setState({value: value});
  }

 

  public render() {
    return (
      <Panel disabled={this.state.disabled} confirm={'Изменения не будут сохранены'} onConfirm={this.onConfirm} dialog={true} preventEscape={true} size='S' isOpen={this.state.panelOpened} onDismiss={this.togglePanel(false)} text={this.state.title}>
        <InputsRenderer inputs={this.state.inputs} fields={this.state.fields} onCheck={(value) => this.setState({ disabled: value})}/>
      </Panel>
    );
  }

  private togglePanel = (panelOpened: boolean): (() => void) => {
    return (): void => {
      this.setState({ panelOpened });
    };
  };

  private onConfirm = () => {
    // this.state.result(this.state.value);
    
    // this.onCancel();
    this.setState({
      panelOpened: false,
    });
    if (this.state.onSave) this.state.onSave(getInputsValues());
  };

  private onCancel = () => {
    this.setState({
      isHiden: true,
    });
  };

  private onOpen = (title: string, inputs:IEditPanelInput[], result?:any, fields?:string[]) => {
    //const newInputs:IInputWithKey[] = [];
    //inputs.map((item) =>  newInputs.push({ key: uuid(), type: item.type, value: item.value }));
    this.setState({
      panelOpened: true,
      title,
      inputs,
      onSave: result,
      fields,
      disabled: fields ? true : false,
      //inputs: newInputs,
    });
  }

  /*
  private onClose = () => {  
    this.onCancel();
  }

  private onPercent = (value: number) => {
    this.setState({ progress: value });
    if (value >= 1) {
      this.onCancel();
    }
  }
  */
}
