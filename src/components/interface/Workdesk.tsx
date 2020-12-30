import React, { CSSProperties } from 'react';

interface IWorkdeskProps {
  shrunk: boolean;
  dimmer: boolean;
}

export class Workdesk extends React.Component<IWorkdeskProps, {}> {
  public render() {
    const styleDimmer: CSSProperties = {
      width: '100%',
      height: '100%',
      position: 'absolute',
      top:'0px',
      zIndex: 10000,
    };
    let styleWorkdesk: CSSProperties = {};
    if (this.props.shrunk) styleWorkdesk = { ...styleWorkdesk, ...{ position: 'absolute', left: '272px', width: 'calc(100% - 272px)' } };
    if (this.props.dimmer) styleWorkdesk = { ...styleWorkdesk, ...{ filter: 'grayscale(100%) blur(3px)', WebkitFilter: 'grayscale(100%) blur(3px)', userSelect: 'none' } };
    return (
      <div style={styleWorkdesk}>
        {this.props.dimmer && <div style={styleDimmer}/>}
        {this.props.children}
      </div>
    );
  }
}
