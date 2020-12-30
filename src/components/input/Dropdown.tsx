import React from 'react';

import { Dropdown as DropdownFabric, IDropdownOption, IDropdownStyles } from 'office-ui-fabric-react';
import { showMessage, niluuid } from 'components';

interface IDropdownProps {
  onChange?: ((value: string) => void) | ((value: string, name: string) => void);
  api?: string;
  defaultValue?: string | number;
  defaultKey?: string | number;
  defaultText?: string;
  disabled?: boolean;
  options?: IDropdownOption[];
  width?: number;
  value?: string | number;
  label?: string;
}

interface IDropdownState {
  api?: string;
  options: IDropdownOption[];
  onChange?: (event: React.FormEvent<HTMLDivElement>, item?: IDropdownOption) => void;
  defaultSelectedKey?: string | number;
  value?: string | number;
  dropdownWidth: number;
}

export class Dropdown extends React.Component<IDropdownProps, IDropdownState> {

  constructor(props: IDropdownProps) {
    super(props);
    let options:IDropdownOption[] = [];
    let defaultSelectedKey: string | number | undefined = this.props.defaultValue || niluuid();
    let defaultKey: string | number | undefined = this.props.defaultKey || niluuid();
    let value = this.props.value;
    let api = this.props.api;
    if (!this.props.defaultValue) {
      defaultSelectedKey = defaultKey;
    }
    let dropdownWidth = this.props.width || 300;
    let onChange: any;
    onChange = (event: React.FormEvent<HTMLDivElement>, item: IDropdownOption) => {
      // если у дропдауна внутри диалога есть проп defaultText, то выбор сбивается на первое значение
      // будет время почитать https://github.com/OfficeDev/office-ui-fabric-react/issues/5473
      //if (event.type !== 'focus') {
        // console.log('Dropdown onChange '+item.key.toString());
        if (this.props.onChange) {
          this.props.onChange(item.key.toString(), item.text);
        }
      //}
    }
    if (this.props.api) {
      switch (this.props.api) {
        case 'year':
          for (var i = 2016; i <= new Date().getFullYear(); i++) {
            options.push({key: i.toString(), text: i.toString()});
          }
          break;
        case 'month':
        case 'month0':
          options = [
            {key:'1', text: 'Январь'},
            {key:'2', text: 'Февраль'},
            {key:'3', text: 'Март'},
            {key:'4', text: 'Апрель'},
            {key:'5', text: 'Май'},
            {key:'6', text: 'Июнь'},
            {key:'7', text: 'Июль'},
            {key:'8', text: 'Август'},
            {key:'9', text: 'Сентябрь'},
            {key:'10', text: 'Октябрь'},
            {key:'11', text: 'Ноябрь'},
            {key:'12', text: 'Декабрь'},
          ];
          if (this.props.api === 'month0') options.unshift({key: this.props.defaultKey || niluuid(), text: 'Весь год'});
          break;
        default:
          if (this.props.defaultText) {
            options = [{ key: defaultKey, text: this.props.defaultText }];
          }
      }
    } else {
      if (this.props.options) {
        options = this.props.options;
      }
      if (!this.props.defaultValue) {
        defaultSelectedKey = undefined;
      }
    }
    this.state = {
      api,
      value,
      options,
      onChange,
      defaultSelectedKey,
      dropdownWidth,
    };
  }

  public async componentDidUpdate(prevProps: IDropdownProps) {
    // console.log('Dropdown componentDidUpdate '+this.props.value);
    // console.log(prevProps);
    if (!this.props.api) {
      if (this.props.options && this.props.options !== prevProps.options) {
        this.setState({options: this.props.options});
      }
      if (this.props.defaultValue && this.props.defaultValue !== this.state.defaultSelectedKey) {
        this.setState({defaultSelectedKey: this.props.defaultValue});
      }
    } else {
      if (this.props.api && this.props.api !== prevProps.api) {
        // console.log('api changed '+this.props.label)
        const getIems = async (api: string) => {
          let response = await fetch(api, { credentials: 'same-origin' });
          if (!response.ok)  throw Error(response.statusText);
          let json = await response.json();
          if (json.status === 'bad')  throw Error(json.error);
          return json.data;
        }
        if (this.props.api !== 'year' && this.props.api !== 'month' && this.props.api !== 'month0') {
          var result = await getIems(this.props.api);
          if (this.props.defaultKey || this.props.defaultText) {
            // console.log('return 1');
            this.setState({ api: this.props.api, options: [ ...[{ key: this.props.defaultKey || niluuid(), text: this.props.defaultText || '-' }], ...result ] });
            if (this.props.onChange) this.props.onChange((this.props.defaultKey || niluuid()).toString(), this.props.defaultText || '-');
          } else {
            if (!this.props.defaultValue ) {
              // console.log('return 2');
              this.setState({ api: this.props.api, options: result, defaultSelectedKey: result[0].key });
            } else {
              // console.log('return 3');
              this.setState({ api: this.props.api, options: result });
            }
          }
         
        } else {
          // console.log('none 1');
          // console.log('null 1 '+this.props.label)
          // return null;
        }
      } else {
        // console.log('none 2');
        // console.log('null 2 '+this.props.label)
        // return null;
      }
    }
  }

  public componentDidMount() {
    // console.log('Dropdown componentDidMount '+this.props.value);
    if (this.props.api) {
      this.setState({ api: this.props.api});
      if (this.props.api !== 'year' && this.props.api !== 'month' && this.props.api !== 'month0') {
        fetch(this.props.api,{credentials: 'same-origin'})
        .then(response => { 
          if (!response.ok) {
            throw Error(response.statusText);
          }
          return response.json();
        })
        .then(json => {
          if (json.status !== 'ok') {
            throw Error(json.message);
          }
          if (this.props.defaultKey || this.props.defaultText) {
            // console.log(json.data);
            this.setState({ options: [ ...[{ key: this.props.defaultKey || niluuid(), text: this.props.defaultText || '-' }], ...json.data ] });
          } else {
            this.setState({ options: json.data });
            if (!this.props.defaultValue) {
              this.setState({ defaultSelectedKey: json.data[0]?.key });
            }
          }
        })
        .catch(err => showMessage(err.toString()));
      }
    }
  }

  public render() {
    var styleDropdown: Partial<IDropdownStyles> = { caretDown: { marginTop: '2px' } }
    if (this.props.value) {
      // console.log(this.props.value)
      return (
        <DropdownFabric
          styles={styleDropdown}
          label={this.props.label}
          dropdownWidth={this.state.dropdownWidth}
          onChange={this.state.onChange}
          selectedKey={this.props.value}
          options={this.state.options}
          disabled={this.props.disabled}
        />
      );
    } else {
      return (
        <DropdownFabric
          styles={styleDropdown}
          label={this.props.label}
          dropdownWidth={this.state.dropdownWidth}
          onChange={this.state.onChange}
          defaultSelectedKey={this.state.defaultSelectedKey}
          options={this.state.options}
          disabled={this.props.disabled}
        />
      );
    }
  }
  
}
