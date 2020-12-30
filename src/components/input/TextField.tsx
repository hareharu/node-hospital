import React, { CSSProperties } from 'react';
import { TextField as TextFieldFabric, IconButton, Callout, getId, DirectionalHint, SearchBox } from 'office-ui-fabric-react';

interface ITextFieldProps {
  onChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  defaultValue?: string;
  value?: string;
  width?: number;
  multiline?: boolean;
  editbutton?: boolean; // больше не используется
  label?: string;
  search?: boolean;
  password?: boolean;
  underlined?: boolean;
}

interface ITextFieldState {
  onChange?: (event?: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, newValue?: string) => void,
  isCalloutVisible: boolean;
}




export class TextField extends React.Component<ITextFieldProps, ITextFieldState> {

  constructor(props: ITextFieldProps) {
    super(props);
   // this.textInput = React.createRef();
    let onChange: any;
    onChange = (event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, newValue: string) => {
      if (this.props.onChange) {
        this.props.onChange(newValue);
      }
    }
    this.state = {
      onChange,
      isCalloutVisible: false,
    };
  }

  //public textInput
  

  public render() {
    let styleTextField: CSSProperties = {}
    if (this.props.width) {
      styleTextField = {
        width: this.props.width,
      }
    }
    if (this.props.value !== undefined) {
      return (
        <TextFieldFabric
          // componentRef={(input) => this.textInput = input }
          // onClick={this.onClick}
          underlined={this.props.underlined}
          label={this.props.label}
          onChange={this.state.onChange}
          placeholder={this.props.placeholder}
          disabled={this.props.disabled}
          value={this.props.value !== null ? this.props.value : ''}
          multiline={this.props.multiline}
          rows={this.props.multiline ? 3 : undefined}
          // resizable={false}
          autoAdjustHeight={this.props.multiline}
          style={styleTextField}
          onRenderSuffix={this.props.editbutton ? this.onRenderSuffix : undefined}
          type={this.props.password ? 'password' : undefined}
          autoComplete={this.props.password ? 'off' : undefined}
        />
      );   
    } else {
      if (this.props.search) {
        return <SearchBox underlined={this.props.underlined} onChange={this.state.onChange} placeholder={this.props.placeholder} styles={this.props.width ? { root: { width: this.props.width } } : undefined } />
      } else {
        return (
          <TextFieldFabric
            underlined={this.props.underlined}
            label={this.props.label}
            onChange={this.state.onChange}
            placeholder={this.props.placeholder}
            disabled={this.props.disabled}
            defaultValue={this.props.defaultValue}
            multiline={this.props.multiline}
            rows={this.props.multiline ? 3 : undefined}
            // resizable={false}
            autoAdjustHeight={this.props.multiline}
            style={styleTextField}
            onRenderSuffix={this.props.editbutton ? this.onRenderSuffix : undefined}
            type={this.props.password ? 'password' : undefined}
            autoComplete={this.props.password ? 'off' : undefined}
          />
        );
      }

    }
  }
  
  private titleId: string = getId('callout-edit');
  private menuButtonElement: HTMLElement | null = null;

  private onRenderSuffix = (): JSX.Element => {
    return (
      <>
        <div ref={menuButton => (this.menuButtonElement = menuButton)}>
          <IconButton iconProps={{ iconName: 'icon-file-text' }} title='Редактировать текст' onClick={this.onDismiss} styles={{ root: { height: '30px'} }}/>
        </div>
        {this.state.isCalloutVisible ? (
          <div>
            <Callout
              role="alertdialog"
              ariaLabelledBy={this.titleId}
              gapSpace={0}
              target={this.menuButtonElement}
              onDismiss={this.onDismiss}
              setInitialFocus={true}
              directionalHint={DirectionalHint.bottomRightEdge}
              calloutWidth={this.props.width}
            >
              <TextFieldFabric
                underlined={this.props.underlined}
                label={this.props.label}
                onChange={this.state.onChange}
                value={this.props.value !== null ? this.props.value : ''}
                multiline={true}
                autoAdjustHeight={true}
                resizable={false}
                borderless={true}
                style={{ padding: '16px' }}
              />
            </Callout>
          </div>
        ) : null}
      </>
    )
  };

  /*
  private onClick = () => {
    //this.textInput.focus();
    console.log(this.textInput.selectionStart, this.textInput.selectionEnd)
    
    //var start = this.textInput.selectionStart;
    //var end = this.textInput.selectionEnd
    //this.textInput.setSelectionRange(start, end);
   
  }
*/

  private onDismiss = () => {
    this.setState({
      isCalloutVisible: !this.state.isCalloutVisible
    });
  };

}
