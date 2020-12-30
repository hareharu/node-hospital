import React, { CSSProperties } from 'react';
import { Text as TextFabric } from 'office-ui-fabric-react';

interface ITextProps {
  size?: string;
  text?: string;
  color?: string;
}

export class Text extends React.Component<ITextProps> {
  public render() {
    const style: CSSProperties = {
      marginLeft: '20px',
      userSelect: 'none',
      height: '32px',
      display: 'flex',
      alignItems: 'center',
      color: this.props.color,
    }
    let variant: 'xSmall' | 'small' | 'medium' | 'large' | 'xLarge' | undefined = undefined;
    switch (this.props.size) {
      case 'XS': variant = 'xSmall'; break;
      case 'S': variant = 'small'; break;
      case 'M': variant = 'medium'; break;
      case 'L': variant = 'large'; break;
      case 'XL': variant = 'xLarge'; break;
      default: variant = 'medium';
    }
    return (
      <span style={style}><TextFabric variant={variant}>{this.props.text}</TextFabric></span>
    );
  }
}
