import * as React from 'react';
import { Icon, IDropdownOption, Dropdown } from 'office-ui-fabric-react';
import { registeredIcons } from 'components';

interface IIconPickerProps {
  onChange?: ((value: string) => void) | ((value: string, name: string) => void);
  value?: string | number;
  icons?: string;
  disabled?: boolean;
  label?: string;
  notnull?: boolean;
  full?: boolean;
}

interface IDropdownState {
  onChange?: (event: React.FormEvent<HTMLDivElement>, item?: IDropdownOption) => void;
}

interface IIconItem {
  key: string;
  text: string;
  data?: {
    icon: string;
  };
}

export class IconPicker extends React.Component<IIconPickerProps, IDropdownState> {
  constructor(props: IIconPickerProps) {
    super(props);
    let onChange: any;
    onChange = (event: React.FormEvent<HTMLDivElement>, item: IDropdownOption) => {
      if (this.props.onChange) {
        this.props.onChange(item.key.toString(), item.text);
      }
    }
    this.state = {
      onChange,
    };
  }
  public render(): JSX.Element {
    let icons: IIconItem[] = [ { key: '', text: 'Без иконки'}, ];
    if (this.props.notnull) icons = [];
    if (this.props.icons) {
      const filter = this.props.icons + '-';
      registeredIcons.filter(icon => icon.key.startsWith(filter)).forEach(icon => icons.push( { key: icon.key, text: icon.key, data: { icon: icon.key } }));
    } else {
      registeredIcons.forEach(icon => icons.push( { key: icon.key, text: icon.key, data: { icon: icon.key } }));
    }
    return (
      <Dropdown
        style={this.props.full? {} : { width: '55px' }}
        label={this.props.label}
        onRenderOption={this.onRenderOption}
        onRenderTitle={this.onRenderTitle}
        onChange={this.state.onChange}
        selectedKey={this.props.value}
        options={icons}
        disabled={this.props.disabled}
      />
    );
  }

  private onRenderTitle = (options: IDropdownOption | IDropdownOption[] | undefined): JSX.Element => {
    if (options) {
      const option = options[0];
      return (
        <div>
          {option.data && option.data.icon && (
            <Icon iconName={option.data.icon} style={{ verticalAlign: 'middle', height: '28px' }} className={'wh-Icon-display-'+option.data.icon.substr(0, option.data.icon.indexOf('-'))}/>
          )}
        </div>
      );
    } else {
      return <div/>
    }
  };

  private onRenderOption = (option: IDropdownOption | undefined): JSX.Element => {
    if (option) {
      return (
        <div>
          {option.data && option.data.icon && (
            <Icon iconName={option.data.icon} style={{ verticalAlign: 'middle', height: '28px', }} className={'wh-Icon-display-'+option.data.icon.substr(0, option.data.icon.indexOf('-'))}/>
          )}
        </div>
      );
    } else {
      return <div/>
    }
  };

}