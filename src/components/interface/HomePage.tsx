import React, { CSSProperties } from 'react';
import { Icon, Link, SearchBox, MessageBar, Stack, DefaultButton, MessageBarType, Layer, LayerHost } from 'office-ui-fabric-react';
import { theme } from 'components';

interface IHomePageProps {
  isActive: boolean;
  newTabs: boolean;
}

interface IHomePageState {
  items: IHomePageItem[];
}

interface IHomePageItem {
  key: number;
  type: string;
  text: string;
  url: string;
  icon: string;
  side: string;
}

export class HomePageTop extends React.Component {
  public render() {
    return <LayerHost id='HomePageTopPart'/>
  }
}

export class HomePage extends React.Component<IHomePageProps, IHomePageState> {

  public state: IHomePageState = {
    items: [],
  }

  public componentDidMount() {
    fetch('/api/who/home', { credentials: 'same-origin' })
    .then(response => { if (!response.ok) { throw Error(response.statusText); } return response.json(); })
    .then(json => { this.setState({ items: json }); })
    .catch(error => { console.log(error); });
  }

  public render() {
    const styleGrid: CSSProperties = {
      display: 'table',
      borderSpacing: '20px 0px',
      width: '100%',
    }
    const styleGridCol: CSSProperties = {
      display: 'table-cell',
    }
    const styleBottom: CSSProperties = {
      display: 'flex'
      /*
      padding: '10px 30px 20px 30px',
      width: 'calc(100% - 60px)',
      position: 'absolute',
      bottom: '0px',
      left: '0px',
      display: this.state.items.filter(item => item.side === 'bottom').length === 0 ? 'none' : 'block',
      */
    }
    const styleHome: CSSProperties = {
      // height: 'calc(100vh - 50px)',
      padding: '0px 30px',
    }
    return (
      <div style={this.props.isActive ? undefined : { display: 'none' }}>
        <Layer hostId='HomePageTopPart'>
          <Stack horizontal={true} styles={{ root: { margin: '5px 10px', }}}>
            {this.state.items.filter(item => item.side === 'top').map(item => this.renderHomePageItemTop(item))}
          </Stack>
        </Layer>
        <div style={styleHome}>
          {/*this.state.items.filter(item => item.side === 'top').map(item => <div key={'homepage_' + item.key}>{this.renderHomePageItem(item)}</div>)*/}
          <div style={styleGrid}>
            <div style={styleGridCol}>
              {this.state.items.filter(item => item.side === 'left').map(item => <div key={'homepage_' + item.key}>{this.renderHomePageItem(item)}</div>)}
            </div>
            <div style={styleGridCol}>
              {this.state.items.filter(item => item.side === 'right').map(item => <div key={'homepage_' + item.key}>{this.renderHomePageItem(item)}</div>)}
            </div>
          </div>
          <div style={styleBottom}>{this.state.items.filter(item => item.side === 'bottom').map(item => <div key={'homepage_' + item.key}>{this.renderHomePageItem(item)}</div>)}</div>
        </div>
      </div>
    )
  }

  private renderHomePageItem(item: IHomePageItem): JSX.Element {
    const styleDiv: CSSProperties = {
      marginTop: '14px',
      marginBottom: '14px',
    }
    switch (item.type) {
      case 'header': return <h4>{item.text}</h4>
      case 'text': return <p>{item.text}</p>
      case 'image': return <img src={item.url} alt={item.text}/>
      case 'link': if (item.icon && item.icon.length > 0) { 
          return <p><Link target={this.props.newTabs ? '_blank' : '_self'} href={item.url}><Icon iconName={item.icon} style={{ verticalAlign: 'middle' }}/> {item.text}</Link></p>
        } else {
          return <ul><li><Link target={this.props.newTabs ? '_blank' : '_self'} href={item.url}>{item.text}</Link></li></ul>
        }
      case 'notice': return <div style={styleDiv}><MessageBar messageBarType={MessageBarType.warning} style={{ fontSize: 14 }}>{item.text}</MessageBar></div>
      case 'search': return <div style={styleDiv}><SearchBox onSearch={newValue => this.onSearch(item.url, newValue)} placeholder={item.text}/></div>
      default: return <p>Некорректный тип элемента!</p>
    }
  }

  private renderHomePageItemTop(item: IHomePageItem): JSX.Element {
    switch (item.type) {
      // case 'header': return <h4>{item.text}</h4>
      // case 'text': return <p>{item.text}</p>
      // case 'image': return <img src={item.url} alt={item.text}/>
      case 'link': return <Stack.Item key={item.key} styles={{ root: { padding: '5px'}}}><DefaultButton
      text={item.text}
      iconProps={item.icon && item.icon.length > 0 ? { iconName: item.icon } : undefined}
      href={item.url}
      target={this.props.newTabs ? '_blank' : '_self'}
      styles={{root: { padding: '2px', background: 'transparent', color: theme.palette.themePrimary, borderColor: theme.palette.neutralQuaternary}, rootHovered: {  color: theme.palette.themeDark }}}
      /></Stack.Item>
      // case 'notice': return <div style={styleDiv}><MessageBar messageBarType={MessageBarType.warning} style={{ fontSize: 14 }}>{item.text}</MessageBar></div>
      case 'search': return <Stack.Item key={item.key} styles={{ root: { padding: '5px'}}} grow={1}><SearchBox 
      styles={{root: { background: 'transparent', color: theme.palette.themePrimary, borderColor: theme.palette.neutralQuaternary}}}
      onSearch={newValue => this.onSearch(item.url, newValue)}  placeholder={item.text}/></Stack.Item>
      default: return <p>Некорректный тип элемента!</p>
    }
  }

  private onSearch = (url: string, value: string) => {
    if (value.length > 0) {
      window.open(url + value, this.props.newTabs ? '_blank' : '_self');
    } else {
      let start = url.indexOf('://');
      if (start < 0) {
        start = 0;
      } else {
        start += 3;
      }
      let end = url.indexOf('/', start);
      if (end < 0) {
        end = url.length;
      }
      window.open(url.substring(0, end), this.props.newTabs ? '_blank' : '_self');
    }
  }

}
