import React from 'react';
import { Stack, IStackStyles } from 'office-ui-fabric-react';

interface IInlineProps {
  gap?: string | number;
  wrap?: boolean;
  render?: boolean;
}

interface IInlineState {
  gap?: number | string;
}

export class Inline extends React.Component<IInlineProps, IInlineState> {

  constructor(props: IInlineProps) {
    super(props);
    const gap = this.props.gap;
    this.state = {
      gap,
    };
  }

  public componentDidMount() {
    this.setState({ gap: '10 3' });
  }

  public render() {
    const styleStack: IStackStyles = {
      root: {
        flexShrink: '0!important',
        margin: '8px 15px 10px 15px',
      }
    }
    if (this.props.render === false) {
      return null
    } else {
      return (
        <Stack horizontal={true} wrap={this.props.wrap} tokens={{ childrenGap:this.state.gap }} styles={styleStack}>{this.props.children}</Stack>
      );
    }
  }

}
