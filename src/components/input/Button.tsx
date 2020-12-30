import React from 'react';
import { DefaultButton, Label } from 'office-ui-fabric-react';

interface IButtonProps {
  onClick?: () => void;
  text?: string;
  primary?: boolean;
  disabled?: boolean;
  href?: string;
  target?: string;
  icon?: string;
  type?: string;
  label?: string;
}

export class Button extends React.Component<IButtonProps> {

  public render() {
    return (
      this.props.label ?
        <div>
          <Label>{this.props.label}</Label>
          {this.renderButton()}
        </div>
      :
        this.renderButton()
    );
  }

  private renderButton = () => {
    return (
      <DefaultButton
        text={this.props.text}
        iconProps={this.props.icon ? { iconName: 'icon-' + this.props.icon } : undefined}
        onClick={this.props.onClick}
        primary={this.props.primary}
        disabled={this.props.disabled}
        href={this.props.href}
        target={this.props.target || '_blank'}
        type={this.props.primary ? 'submit' : undefined}
     />
    )
  }

}
