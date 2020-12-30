import React from 'react';
import { Icon as IconFabric, IIconStyles } from 'office-ui-fabric-react';
import { theme } from 'components';

interface IIconProps {
  name?: string;
  color?: string;
}

export class Icon extends React.Component<IIconProps> {
  public render() {
    const styleIcon: IIconStyles = {
      imageContainer: {
        height: '16px',
        width: '16px',
        top: '0px',
        color: this.props.color || theme.palette.neutralPrimary + '!important',
        stroke: this.props.color || theme.palette.neutralPrimary + '!important',
        fill: theme.palette.white + '!important',
      }
    }
    return (
      <IconFabric iconName={this.props.name} styles={styleIcon}/>
    );
  }
}
