import React from 'react';
import { IconButton as IconButtonFabric } from 'office-ui-fabric-react';

interface IButtonProps {
  onClick?: () => void;
  text?: string;
  primary?: boolean;
  disabled?: boolean;
  href?: string;
  icon?: string;
}

export class IconButton extends React.Component<IButtonProps> {

  public render() {
    return (
      <IconButtonFabric
        title={this.props.text}
        iconProps={this.props.icon ? { iconName: 'icon-' + this.props.icon } : undefined}
        onClick={this.props.onClick}
        disabled={this.props.disabled}
        href={this.props.href}
        target='_blank'
        type={this.props.primary ? 'submit' : undefined}
     />
    );
  }

}
