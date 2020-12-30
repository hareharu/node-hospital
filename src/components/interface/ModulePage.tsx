import React, { CSSProperties } from 'react';
import { Depths } from '@uifabric/fluent-theme';
import { theme } from 'components';

export interface IModule {
  key: string;
  name: string;
  content: JSX.Element;
}

interface IModulePageProps {
  isActive: boolean;
  isPinned: boolean;
  isShrunk: boolean;
  module: IModule;
}

export class ModulePage extends React.Component<IModulePageProps> {
  public render() {
    const containerBase: CSSProperties = {
      height: 'calc(100vh - 30px)',
      borderTop: '1px solid ' + theme.palette.neutralLight,
      backgroundColor: theme.palette.white,
      boxShadow: Depths.depth64,
    }
    const containerShrunk: CSSProperties = {
      height: 'calc(100vh - 30px)',
      width: '50%',
    }
    const containerPinned: CSSProperties = {
      position: 'absolute',
      top: '30px',
      left: '50%',
      borderLeft: '1px solid ' + theme.palette.neutralLight,
    }
    let style: CSSProperties;
    if (!this.props.isActive && !this.props.isPinned) {
      style = { display: 'none' };
    } else {
      style = containerBase;
      if (this.props.isShrunk) {
        style = { ...style, ...containerShrunk };
      }
      if (this.props.isPinned) {
        style = { ...style, ...containerPinned };
      }
    }
    return (
      <div style={style} key={'module_' + this.props.module.key}>
        {this.props.module.content}
      </div>
    );
  }
}
