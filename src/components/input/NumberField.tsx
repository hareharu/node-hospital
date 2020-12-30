import React, { CSSProperties } from 'react';
import { SpinButton } from 'office-ui-fabric-react';
import { Position } from 'office-ui-fabric-react/lib/utilities/positioning';

interface INumberFieldProps {
  onChange?: (value: string) => void;
  disabled?: boolean;
  defaultValue?: string;
  value?: string; // не используется
  width?: number;
  label?: string;
  min?: number;
  max?: number;
  step?: number;
  suffix?: string;
}

interface INumberFieldState {
  suffix: string;
}

export class NumberField extends React.Component<INumberFieldProps, INumberFieldState> {

  constructor(props: INumberFieldProps) {
    super(props);
    this.state = {
      suffix: this.props.suffix? ' '+this.props.suffix : '',
    };
  }

  public render() {
    let styleNumberField: CSSProperties = {}
    if (this.props.width) {
      styleNumberField = {
        width: this.props.width,
      }
    }
    return (
      <SpinButton
        defaultValue={this.props.defaultValue+this.state.suffix || "0"+this.state.suffix}
        label={this.props.label}
        labelPosition={Position.top}
        disabled={this.props.disabled}
        style={styleNumberField}
        onValidate={this.onValidate}
        onIncrement={this.onIncrement}
        onDecrement={this.onDecrement}
      />
    );
  }

  private onValidate = (value: string): string => {
    // if (this.props.suffix) value = this.removeSuffix(value);
    if (Number(value) > (this.props.max || 100) || Number(value) < (this.props.min || 0) || value.trim().length === 0 || isNaN(+value)) {
      if (this.props.onChange) this.props.onChange('0');
      return '0' + this.state.suffix;
    }
    if (this.props.onChange) this.props.onChange(String(value));
    return String(value) +this.state.suffix;
  }

  private onIncrement = (value: string): string => {
    if (this.props.suffix)  value = this.removeSuffix(value);
    if (Number(value) + (this.props.step || 1) > (this.props.max || 100)) {
      if (this.props.onChange) this.props.onChange(String(value));
      return String(+value) + this.state.suffix;
    } else {
      if (this.props.onChange) this.props.onChange(String(+value + (this.props.step || 1)));
      return String(+value + (this.props.step || 1)) + this.state.suffix;
    }
  }

  private onDecrement = (value: string): string => {
    if (this.props.suffix) value = this.removeSuffix(value);
    if (Number(value) - (this.props.step || 1) < (this.props.min || 0)) {
      if (this.props.onChange) this.props.onChange(String(value));
      return String(+value) + this.state.suffix;
    } else {
      if (this.props.onChange) this.props.onChange(String(+value - (this.props.step || 1)));
      return String(+value - (this.props.step || 1)) + this.state.suffix;
    }
  }

  private removeSuffix = (value: string): string => {
    return value.substr(0, value.length - this.state.suffix.length);
  }
  
}
