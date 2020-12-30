import React from 'react';
import { Stack, IStackStyles } from 'office-ui-fabric-react';

interface IColumnsProps {
  width?: string[];
  height?: string;
}

export class Columns extends React.Component<IColumnsProps> {
  public render() {
    return (
      <div style={{ display: 'flex', height: this.props.height ? this.props.height : undefined }}>
        {React.Children.map(this.props.children, (child, index) => {
          return <div style={{ display: 'flex', width: this.props.width ? this.props.width[index] : undefined }}>{child}</div> 
        })}
      </div>
    );
  }
}

export class Column extends React.Component {
  public render() {
    const style:IStackStyles = {
      root: {
        width: '100%',
      }
    }
    return (
      <Stack styles={style}>{this.props.children}</Stack>
    )
  }
}
