import React, { CSSProperties } from 'react';
import { ScrollablePane } from 'office-ui-fabric-react';
import { getStyle } from 'components';

interface ITextLogProps {
  borderless?: boolean;
  height?: number;
  width?: string;
  text?: string;
  // loading?: boolean;
}

export class TextLog extends React.Component<ITextLogProps> {
  public render() {
    let style: CSSProperties = {
      padding: '10px 20px',
      whiteSpace: 'pre-line',
      overflowX: 'hidden',
      overflowY: 'auto',
    }
    return (
      <div style={getStyle(this.props.height, this.props.width, this.props.borderless)}><ScrollablePane><div style={style}>{this.props.text}</div></ScrollablePane></div>
    );
  }
}
