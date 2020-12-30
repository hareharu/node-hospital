import React from 'react';
import { Checkbox as CheckboxFabric } from 'office-ui-fabric-react';

interface ICheckboxProps {
  onChange?: (value: string) => void;
  disabled?: boolean;
  defaultValue?: string;
  label?: string;
}

interface ICheckboxState {
  onChange?: (ev?: React.FormEvent<HTMLElement | HTMLInputElement> | undefined, isChecked?: boolean | undefined) => void,
}

export class Checkbox extends React.Component<ICheckboxProps, ICheckboxState> {

  constructor(props: ICheckboxProps) {
    super(props);
    let onChange: any;
    onChange = (ev?: React.FormEvent<HTMLElement | HTMLInputElement> | undefined, isChecked?: boolean | undefined) => {
      if (this.props.onChange) {
        this.props.onChange(isChecked ? 'true' : 'false');
      }
    }
    this.state = {
      onChange,
    };
  }

  public render() {
    return (
      <CheckboxFabric
        label={this.props.label}
        disabled={this.props.disabled}
        defaultChecked={this.props.defaultValue === 'true'}
        onChange={this.state.onChange}
        styles={{ root:{ marginTop: '6px', marginBottom: '6px', marginRight: '3px' }}}
      />
    );   
    
  }

}
