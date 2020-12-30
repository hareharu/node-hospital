import React from 'react';
import { Label } from 'office-ui-fabric-react';
import { TextLog, Panel, showMessage, TabsContainer, TabsLinks } from 'components';

let showClientInfoFn: () => void;

interface IBuildLabelProps {
  show: boolean;
  build: string;
}

interface IClientInfoProps {
  version?: string;
  build?: string;
  date?: string;
}

interface IClientInfoState {
  buildinfo?: string;
  changelog?: string;
  license?: string;
  isOpen: boolean;
  tabIndex: number;
}

function showClientInfo() {
  showClientInfoFn();
}

export class BuildLabel extends React.Component<IBuildLabelProps> {
  public render() {
    if (this.props.show) {
      return <Label onClick={showClientInfo} style={{ userSelect: 'none', margin: '0px 15px'}} disabled={true}>{'Сборка ' + this.props.build}</Label>
    } else {
      return <span/>
    }
  }
}

export class ClientInfo extends React.Component<IClientInfoProps, IClientInfoState> {
  public state: IClientInfoState = {
    isOpen: false,
    tabIndex: 0,
  }
  public componentDidMount() {
    showClientInfoFn = this.togglePanel(true);
  }
  public render() {
    return (
      <Panel isOpen={this.state.isOpen} onDismiss={this.togglePanel(false)} nopadding={true} size='C' width='700px' text={'Клиент для node-hospital версии ' + this.props.version + ' от ' + this.props.date}>
        <TabsLinks links={['Информация о сборке', 'История изменений', 'Лицензия']} onClick={(value) => this.setState({ tabIndex: value })} tabIndex={this.state.tabIndex}/>
        <TabsContainer tabIndex={this.state.tabIndex}>
          <TextLog text={this.state.buildinfo}/>
          <TextLog text={this.state.changelog}/>
          <TextLog text={this.state.license}/>
        </TabsContainer>   
      </Panel>
    );
  }

  private togglePanel = (isOpen: boolean): (() => void) => {
    return (): void => {
      this.setState({ isOpen });
      if (isOpen) {
        this.getInfo();
      } 
    };
  };

  private getInfo = (): void => {
    fetch('/api/who/info', { credentials: 'same-origin' })
    .then(response => {
      if (!response.ok) { throw Error(response.statusText); }
      return response.json();
    })
    .then(json => { if (json.status === 'bad') { throw Error(json.error); }
    this.setState({
      buildinfo: json.buildinfo,
      changelog: json.changelog,
      license: json.license,
    });
    }).catch(err => showMessage(err));
  }

}
