import React, { CSSProperties } from 'react';
import { Pivot, PivotItem, PivotLinkFormat, Stack, IStackStyles } from 'office-ui-fabric-react';
import { Depths } from '@uifabric/fluent-theme';
import { niluuid } from 'components';

interface ITabsLinksProps {
  onClick?: (index: number) => void;
  tabIndex?: number;
  links: string[];
}

interface ITabsContainerProps {
  tabIndex?: number;
  unmount?: boolean;
}

interface ITabsLinksState {
  onClick: (item?: PivotItem | undefined, ev?: any | undefined) => void;
}

export class TabsLinks extends React.Component<ITabsLinksProps, ITabsLinksState> {
  constructor(props: ITabsLinksProps) {
    super(props);
    const onClick = (item?: PivotItem | undefined, ev?: any | undefined) => {
      if (this.props.onClick) {
        this.props.onClick(parseInt(item ? item.props.itemKey || niluuid() : niluuid()));
      }
    }
    this.state = {
      onClick,
    }
  }
  public render() {
    return (
      <Pivot
        linkFormat={PivotLinkFormat.links}
        selectedKey={this.props.tabIndex ? this.props.tabIndex.toString() : undefined}
        onLinkClick={this.state.onClick}
        headersOnly={true}
        styles={{ link: { height: '34px' }, linkIsSelected: { height: '34px' }}}
      >
        {this.props.links.map((link, index) => <PivotItem itemKey={index.toString()} key={index.toString()} headerText={link}/>)}
      </Pivot>
    );
  }
}

export class TabsContainer extends React.Component<ITabsContainerProps> {
  public render() {
    let style: CSSProperties = {
      display: 'flex', 
      flexBasis: '100%',
      width: '100%',
      height: '100%',
    };
    // "Временное" решение для совместимости с хп-шным хромом
    // с указанием 100% высоты в хп-шном хроме не отображаются Table, без указания в свежем хроме неправильно задается высота TextLog
    // const isChrome49 = window.navigator.userAgent.includes('Chrome/49');
    // if (!isChrome49) style = { ...style, ...{ height: '100%' } };
    const ua = navigator.userAgent;
    const ie = ua.indexOf('MSIE ') > -1 || ua.indexOf('Trident/') > -1;
    return (
      <div style={{ display: ie ? 'block':'flex', flexDirection: 'column', flexBasis: '100%', height: '100%' }}>
        {React.Children.map(this.props.children, (child, index) => {
          if (index === (this.props.tabIndex || 0)) {
            return <div key={index} style={style}>{child}</div>
          } else {
            if (this.props.unmount === true) {
              return
            } else {
              return <div key={index} style={{ display:'none' }}>{child}</div>
              // нужно решить проблему с отображением таблиц в файерфоксе
            }
          }
        })}
      </div>
    );
  }
}

export class Tab extends React.Component {
  public render() {
    const style:IStackStyles = {
      root: {
        width: '100%',
        height: '100%',
        borderTop: '1px solid rgb(234, 234, 234)',
        //boxShadow: 'rgba(0, 0, 0, 0.2) 0px -20px 30px -30px',
        boxShadow: Depths.depth16
      }
    }
    return (
      <Stack styles={style}>{this.props.children}</Stack>
    )
  }
}

// <div style={style}>{this.props.children}</div>
