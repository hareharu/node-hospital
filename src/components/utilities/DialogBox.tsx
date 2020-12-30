import React from 'react';
import { Dialog, DialogFooter, DialogType, ProgressIndicator } from 'office-ui-fabric-react';
import { Button, TextField, DatePicker, Dropdown, NumberField, niluuid } from 'components';

interface IDialogBoxState {
  title?: string;
  text?: string;
  value?: string;
  valueparent?: string;
  isHiden: boolean;
  noText?: string;
  yesText?: string;
  api?: string;
  apiparent?: string;
  type?: string;
  result?: any;
  progress?: number;
  defaulttext?: string;
  defaulttextparent?: string;
}

let openDialogFn: (title: string, text: string, result: any, type?: string, value?: string, defaulttext?: string, api?: string, valueparent?: string, defaulttextparent?: string, apiparent?: string) => void;

export function openDialog(title: string, text: string, result: any, type?: string, value?: string, defaulttext?: string, api?: string, valueparent?: string, defaulttextparent?: string, apiparent?: string) {
  openDialogFn(title, text, result, type, value, defaulttext, api, valueparent, defaulttextparent, apiparent);
}

let closeDialogFn: () => void;

export function closeDialog() {
  closeDialogFn();
}

let setProgressFn: (value: number) => void;

export function setProgress(value: number) {
  setProgressFn(value);
}

export class DialogBox extends React.Component<{}, IDialogBoxState> {

  constructor(props: {}) {
    super(props);
    this.state = {
      isHiden: true,
    };
  }

  public componentDidMount() {
    openDialogFn = this.onOpen;
    closeDialogFn = this.onClose;
    setProgressFn = this.onPercent;
  }

  private onChangeValue = (value: string) => {
    this.setState({value: value});
  }

  private onChangeValueParent = (value: string) => {
    this.setState({valueparent: value});
  }

  public componentDidUpdate = () => {
    // console.log('DialogBox componentDidUpdate '+this.state.value)
  }
  public render() {
  // console.log('DialogBox rernder '+this.state.value)
    return (
      <Dialog
        hidden={this.state.isHiden}
        onDismiss={this.state.type === 'progress' ? undefined : this.onCancel}
        dialogContentProps={{
          type: this.state.title === 'Удаление' ? DialogType.largeHeader : DialogType.normal,
          title: this.state.type === 'progress' ? undefined : this.state.title,
          subText: this.state.type === 'progress' ? undefined : this.state.text,
          showCloseButton: false,
        }}
        modalProps={{
          isBlocking: true,
        }}
      >
        {!this.state.isHiden && this.renderItem()}
        {this.state.type !== 'progress' && (
          <DialogFooter>
            {this.state.type !== 'alert' && <Button onClick={this.onConfirm} text={this.state.yesText || 'Ок'} primary={true} disabled={((this.state.type === 'input' || this.state.type === 'text' || this.state.type === 'pass' || this.state.type === 'date' || this.state.type === 'selectapi') && (this.state.value === null || this.state.value === undefined || this.state.value.length === 0)) || ((this.state.type === 'selectapiparent') && (this.state.valueparent === null || this.state.valueparent === undefined || this.state.valueparent.length === 0))}/> }
            <Button onClick={this.onCancel} text={this.state.noText || this.state.type !== 'alert' ? 'Отмена' : 'Ок'}/>
          </DialogFooter>
        )}
      </Dialog>
    );
  }

  private renderItem(): JSX.Element {
    switch (this.state.type) {
      case 'progress': return <ProgressIndicator label={this.state.title} description={this.state.text} percentComplete={this.state.progress} />
      case 'input': return <TextField onChange={this.onChangeValue} defaultValue={this.state.value} />
      case 'number': return <NumberField onChange={this.onChangeValue} defaultValue={this.state.value} />
      case 'date': return <DatePicker onChange={this.onChangeValue} defaultValue={this.state.value} />
      case 'pass': return <TextField onChange={this.onChangeValue} password={true} />
      case 'text': return <TextField onChange={this.onChangeValue} defaultValue={this.state.value} multiline={true}/>
      case 'toggle': return <Dropdown defaultText={this.state.defaulttext} onChange={this.onChangeValue} value={this.state.value} options={[{key:'Да', text: 'Да'},{key:'Нет', text: 'Нет'}]} />
      case 'selectapi': return <Dropdown defaultText={this.state.defaulttext} onChange={this.onChangeValue} value={this.state.value} api={this.state.api} />
      case 'selectapiparent': return (
        <div>
          <Dropdown defaultText={this.state.defaulttextparent} onChange={this.onChangeValueParent} value={this.state.valueparent} api={this.state.apiparent} />
          <Dropdown defaultText={this.state.defaulttext} onChange={this.onChangeValue} value={this.state.value} api={this.state.api+'/'+this.state.valueparent} />
        </div>
      )
      case 'auth': return (
        <div>
          <div style={{paddingBottom: '5px'}}>
            <TextField placeholder='Имя пользователя (без домена)' onChange={this.onChangeValue} defaultValue={this.state.value} />
          </div>
          <TextField placeholder='Пароль' onChange={this.onChangeValueParent} password={true} />
        </div>
      )
      default: return <div/>
    }
  }

  private onConfirm = () => {
    if (this.state.type === 'selectapiparent') {
      if (this.state.value && this.state.value !== niluuid()) {
        this.state.result(this.state.value);
      } else {
        this.state.result(this.state.valueparent);
      }
    } else if (this.state.type === 'auth') {
      this.state.result({ user: this.state.value, pass: this.state.valueparent });
    } else {
      this.state.result(this.state.value);
    }
    this.onCancel();
  };

  private onCancel = () => {
    this.setState({
      isHiden: true,
    });
  };

  private onOpen = (title: string, text: string, result: any, type?: string, value?: string, defaulttext?: string, api?: string, valueparent?: string, defaulttextparent?: string, apiparent?: string) => {
    // console.log(this.state.value);
    // console.log(value);
    this.setState({
      title,
      text,
      value,
      type,
      result,
      api,
      valueparent,
      apiparent,
      defaulttext,
      defaulttextparent,
    }, ()=> {
      this.setState({ isHiden: false });
    });
  }

  private onClose = () => {
    this.onCancel();
  }

  private onPercent = (value: number) => {
    this.setState({ progress: value });
    if (value >= 1) {
      this.onCancel();
    }
  }

}
