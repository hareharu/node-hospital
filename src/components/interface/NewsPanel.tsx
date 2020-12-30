import React from 'react';
import { ActionButton, ScrollablePane } from 'office-ui-fabric-react';
import { TabsLinks, News, INews, theme, showMessage, Panel } from 'components';

let showNewsFn: () => void;

interface INewsPanelState {
  isOpen: boolean;
  opened: string;
  items: INews[];
  itemsFiltered: INews[];
  categoryTabs: string[];
  tabIndex: number;
  filter: string;
  loading: boolean;
}

export function showNews() {
  showNewsFn();
}

export class NewsButton extends React.Component {
  public render() {
    return <ActionButton iconProps={{ iconName: 'icon-bell' }} onClick={showNews} text='Все новости'/>
  }
}

export class NewsPanel extends React.Component<{}, INewsPanelState> {

  constructor(props: {}) {
    super(props);
    this.state = {
      isOpen: false,
      opened: '',
      items: [],
      itemsFiltered: [],
      tabIndex: 0,
      categoryTabs: [],
      filter: '',
      loading: true,
    };
  }

  public componentDidMount() {
    showNewsFn = this.togglePanel(true);
  }

  private getInfo = (): void => {
    fetch('/api/news/list', { credentials: 'same-origin' })
    .then(response => {
      if (!response.ok) { throw Error(response.statusText); }
      return response.json();
    })
    .then(json => { if (json.status === 'bad') { throw Error(json.error); }
    this.setState({
      items: json.data,
      itemsFiltered: json.data,
      loading: false,
    });
    }).catch(err => showMessage(err));

    fetch('/api/news/category', { credentials: 'same-origin' })
    .then(response => {
      if (!response.ok) { throw Error(response.statusText); }
      return response.json();
    })
    .then(json => { if (json.status === 'bad') { throw Error(json.error); }
    const tabs: string[] = [ 'Все новости' ];
    json.data.forEach((tab: { name: string }) => tabs.push(tab.name));
    this.setState({
      categoryTabs: tabs,
    });
    }).catch(err => showMessage(err));

  }

  private togglePanel = (isOpen: boolean): (() => void) => {
    return (): void => {
      this.setState({ isOpen });
      if (isOpen) {
        this.getInfo();
      } 
    };
  };

  private onTabClick = (index: number) => {
    this.setState({ tabIndex: index });
    if (index === 0) {
      this.setState({ filter: '', itemsFiltered:  this.state.items });
    } else {
      this.setState({ filter: this.state.categoryTabs[index], itemsFiltered: this.state.items.filter(item => item.category === this.state.categoryTabs[index]) });
    }
  };

  public render(): JSX.Element {
    return (
      <Panel isOpen={this.state.isOpen} onDismiss={this.togglePanel(false)} text='Новости и объявления' nopadding={true} size='XL'>
        <TabsLinks links={this.state.categoryTabs} onClick={this.onTabClick} tabIndex={this.state.tabIndex}/>
        <ScrollablePane style={{ height: 'calc(100vh - 76px)', top: '75px', borderTop: '1px solid '+ theme.palette.neutralLight  }}>
          <News items={this.state.itemsFiltered}/>
        </ScrollablePane>
      </Panel>
    );
  }
  
}
