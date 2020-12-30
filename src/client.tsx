import React from 'react';
import preval from 'preval.macro';
import { Fabric, FocusTrapZone, ICommandBarItemProps, INavLink, ScrollablePane, Stack } from 'office-ui-fabric-react';
import { Workdesk, Hide, News, NewsPanel, HomePageTop, showNews, INews, IModule, Taskbar, ModulePage, HomePage, openEditPanel, Sidemenu, callAPIPost, showMessage, MessageBar, DialogBox, UserContainer, datetimeToString, ClientInfo, EditPanel, Panel, LoginForm } from 'components';
import { modules } from 'modules';

interface IUser {
  id: string;
  login: string;
  name: string;
  role: string;
  access: string;
}

interface IClientState {
  activeModule?: string;
  pinnedModule?: string;
  activeModuleName?: string;
  loginMessage?: string;
  loginTip?: string;
  openedModules: IModule[];
  openedPanels: ISidePanel[];
  sidemenuHidden: boolean;
  sidemenuOpened: boolean;
  taskbarModules: ICommandBarItemProps[];
  taskbarPanels: ICommandBarItemProps[];
  user?: IUser;
  username?: string;
  client: string;
  build: string;
  versionWarning: boolean;
  date: string;
  server?: string;
  loaded: boolean;
  maxage: number;
  checkin: number;
  lasttouch: number;
  appName: string;
  news: INews[];
  shownews: boolean;
  showissues: boolean;
}

interface ISidePanel {
  key: string;
  open: boolean;
  name?: string;
  icon: string;
  size: string;
  content?: any;
}

export default class Client extends React.Component<{}, IClientState> {

  public state: IClientState = {
    sidemenuHidden: false,
    sidemenuOpened: false,
    taskbarModules: [],
    taskbarPanels: [],
    loaded: false,
    openedModules: [],
    openedPanels: [],
    client: process.env.REACT_APP_VERSION || '0.0.0',
    build: process.env.REACT_APP_BUILD || 'CUSTOMBUILD',
    versionWarning: false,
    date: datetimeToString((preval`module.exports = new Date();`).toString()),
    maxage: 60000,
    checkin: 60000,
    lasttouch: new Date().getTime(),
    appName: '',
    news: [],
    shownews: false,
    showissues: false,
    loginTip: '',
  }

  public componentDidMount() {
    const ua = navigator.userAgent;
    const ie = ua.indexOf('MSIE ') > -1 || ua.indexOf('Trident/') > -1;
    if (!ie) {
      fetch('/api/who/side', { credentials: 'same-origin' })
      .then(response => { if (!response.ok) { throw Error(response.statusText); } return response.json(); })
      .then(json => { this.createPanels(json) })
      .catch(error => { console.log(error); });
    }
    this.checkInToServer(true);
  }

  public componentDidUpdate(prevProps, prevState) {
    if (this.state.user && this.state.activeModule !== prevState.activeModule) {
      this.checkInToServer();
    }
  }

  public render() {
    var panelNews = { key:'newspanel', text: 'Новости и объявления', iconProps: { iconName: 'icon-bell' }, iconOnly: true, onClick: () => showNews() };
    var panelIssues = { key:'issuespanel', text: 'Добавить задачу', iconProps: { iconName: 'icon-frown' }, iconOnly: true, onClick: () => this.addIssue() };
    return (this.state.loaded &&
      <Fabric>
        <Hide condition={this.state.user !== undefined}><LoginForm build={this.state.build} appName={this.state.appName} show={!this.state.user && this.state.loaded} onLogin={this.userLogin} message={this.state.loginMessage} username={this.state.username} logintip={this.state.loginTip}/></Hide>
        <ClientInfo version={this.state.client} build={this.state.build} date={this.state.date}/>
        <UserContainer user={this.state.user} module={this.state.activeModule}/>
        <MessageBar/>
        <DialogBox/>
        <EditPanel/>
        <NewsPanel/>
        <Sidemenu
          onClickMenu={this.onSidemenuClick}
          onClickToggle={this.sideToggle}
          onClickHome={this.gotoHomepage}
          onClickLock={this.userLock}
          onClickLogout={this.userLogout}
          isOpened={this.state.sidemenuOpened}
          isHidden={this.state.sidemenuHidden}
          username={this.state.user?.name}
          userID={this.state.user?.id}
          activeModule={this.state.activeModule}
          toggleSidemenuT={this.toggleSidemenuT}
          toggleSidemenuF={this.toggleSidemenuF}
          appName={this.state.appName}
          build={this.state.build}
        />
        <Workdesk shrunk={!this.state.user || !this.state.sidemenuHidden || !this.state.activeModule} dimmer={!this.state.user && this.state.username !== undefined}>
          <ScrollablePane style={{ height: '100vh' }}>
            <Stack>
              <FocusTrapZone id='focustrap-taskbar' isClickableOutsideFocusTrap={true} forceFocusInsideTrap={false}>
                <Taskbar shrunk={!this.state.user || !this.state.sidemenuHidden || !this.state.activeModule} items={this.state.taskbarModules} rightItems={
                  this.state.shownews ? this.state.showissues ? [...this.state.taskbarPanels, panelIssues, panelNews] : [...this.state.taskbarPanels, panelNews] : this.state.showissues ? [...this.state.taskbarPanels, panelIssues,] : this.state.taskbarPanels
                } onClose={this.closeModule} onPin={this.pinModule} />
              </FocusTrapZone>
              <Hide condition={this.state.activeModule !== undefined}>
                <HomePageTop/>
                <Hide condition={!this.state.shownews}><News items={this.state.news} onShow={showNews}/></Hide>
                <HomePage isActive={this.state.activeModule === undefined} newTabs={this.state.user !== undefined && this.state.openedModules.length > 0}/>
              </Hide>
              <FocusTrapZone id='focustrap-module' isClickableOutsideFocusTrap={true} forceFocusInsideTrap={false}>
                {this.state.openedModules.map(module => <ModulePage key={module.key} module={module} isActive={module.key === this.state.activeModule} isPinned={module.key === this.state.pinnedModule} isShrunk={this.state.pinnedModule !== undefined}/>)}
                {this.state.openedPanels.map(panel => <Panel key={panel.key} isOpen={panel.open} onDismiss={() => this.togglePanel(panel.key, false)} nopadding={true} size={panel.size} text={panel.name} loading={false}>{panel.content}</Panel> )}
              </FocusTrapZone>
            </Stack>
          </ScrollablePane>
        </Workdesk>
      </Fabric>
    )
  }

  private togglePanel = (key: string, open: boolean) => {
    let panels = this.state.openedPanels;
    let index = panels.findIndex(panel => panel.key === key);
    panels[index].open = open;
    this.setState({ openedPanels: panels });
  };

  private onSidemenuClick = (event?: React.MouseEvent<HTMLElement>, item?: INavLink) => {
    if(item){
      if (!item.links) {
        if (this.state.sidemenuHidden) {
          this.setState({ sidemenuOpened: false });
        }
        if (item.url.length === 0) {
          this.openModule(item.key as string);
        }
      }
    }
  }

  private checkInToServer = (first?: boolean) => {
    fetch('/api/who/check', {
      credentials: 'same-origin',
      method: 'POST',
      body: JSON.stringify({
        client: this.state.client,
        build: this.state.build,
        module: this.state.activeModuleName,
      }),
      headers: { 'Content-Type': 'application/json' }
    })
    .then(response => {
      if (!response.ok) { throw Error(response.statusText); }
      return response.json();
    })
    .then(json => {
      this.setState({ server: json.server, maxage: json.maxage, checkin: json.settings.system_checkintime, appName: json.settings.system_clientname, shownews: json.settings.homepage_shownews, showissues: json.settings.homepage_showissues, loginTip: json.settings.loginform_tip }, ()=> {
        if (!this.state.versionWarning && this.state.server && this.state.server !== this.state.client) {
          this.setState({ versionWarning: true }, () => { // ('+this.state.client+') ('+this.state.server+')
            showMessage('Версия клиента не соответсвует версии сервера - некоторые функции могут работать некорректно. Пожалуйста, обновите страницу.', 'warning', ()=>this.setState({ versionWarning: false }));
          });
        }
        if (first) { 
          const smallwindow = window.innerWidth < 1500;
          this.setState({ loaded: true, sidemenuHidden: smallwindow });
          if (json.user !== undefined) {
            this.setState({ user: json.user, username: json.user.login });
            this.createTimeoutListeners();
          }
        }
      });
    })
    .catch(error => showMessage(error.toString()));
    fetch('/api/news/last', { credentials: 'same-origin' })
    .then(response => { if (!response.ok) { throw Error(response.statusText); } return response.json(); })
    .then(json => { this.setState({ news: json.data }); })
    .catch(error => { console.log(error); });
  }

  private createTimeoutListeners = () => {
    const events = [ 'load', 'click', 'scroll', 'keypress' ];
    for (let event in events) {
      window.addEventListener(events[event], this.resetTimeout);
    }
    this.setTimeout();
  }

  private removeTimeoutListeners = () => {
    const events = [ 'load', 'click', 'scroll', 'keypress' ];
    for (let event in events) {
      window.removeEventListener(events[event], this.resetTimeout);
    }
    this.clearTimeout();
  }

  private timeoutWarning;
  private timeoutLogout;

  private setTimeout = () => {
    const currenttime = new Date().getTime();
    if (currenttime - this.state.lasttouch > this.state.checkin) {
      this.setState({ lasttouch: currenttime });
      this.checkInToServer();
    }
    this.timeoutWarning = setTimeout(() => {}, (this.state.maxage - 60000));
    this.timeoutLogout = setTimeout(this.userLock, this.state.maxage);
  };

  private clearTimeout = () => {
    clearTimeout(this.timeoutWarning);
    clearTimeout(this.timeoutLogout);
  };

  private resetTimeout = () => {
    this.clearTimeout(); 
    this.setTimeout();
  };
  private addIssue = () => openEditPanel(
    'Новая задача', [
      { key: 'title', type: 'text', value: '', label: 'Заголовок' },
      { key: 'typeid', type: 'selectapi', value: '', label: 'Категория', api: 'api/kanban/typesdrop', deftest: '-' },
      { key: 'description', type: 'multiline', value: '', label: 'Описание' },
      { key: 'user', type: 'text', value: this.state.user?.name, label: 'Пользователь' },
    ], (values) => callAPIPost('api/kanban/card/add', values, 'Добавлено'), ['title', 'description', 'user']
  )

  private userLogin = (username: string, password: string): void => {
    fetch('/api/who/login', {
      credentials: 'same-origin',
      method: 'POST',
      body: JSON.stringify({
        username,
        password,
        client: this.state.client,
        build: this.state.build,
        module: this.state.activeModuleName,
      }),
      headers: { 'Content-Type': 'application/json' }
    })
    .then(response => {
      if (!response.ok) {
        let message = 'Ошибка при обращении к серверу';
        if (response.status === 404) { message = 'Неверный логин или пароль'; }
        if (response.status === 403) { message = 'Отсутсвует разрешение на вход'; }
        throw Error(message);
      }
      return response.json();
    })
    .then(json => {
      this.setState({ user: json.user, username: json.user.login, loginMessage: undefined, maxage: 60000, checkin: 60000 }, () => this.checkInToServer(true));
    })
    .catch(error => this.setState({ loginMessage: error.message }));
  };

  private userLogout = (): void => {
    fetch('/api/who/logout', { credentials: 'same-origin' } )
    .then(response => {
      if (!response.ok) { throw Error(response.statusText); }
      this.setState({
        user: undefined, username: undefined,
        activeModule: undefined,
        activeModuleName: undefined,
        openedModules: [],
        sidemenuOpened: false,
        loginMessage: undefined,
        taskbarModules: [],
        server: undefined,
        maxage: 60000,
        checkin: 60000,
      });
      this.removeTimeoutListeners();
    })
    .catch(error => showMessage(error.toString()));
  }

  private userLock = (): void => {
    fetch('/api/who/logout', { credentials: 'same-origin' })
    .then(response => {
      if (!response.ok) { throw Error(response.statusText); }
      this.setState({
        user: undefined,
        loginMessage: 'Введите пароль для разблокировки'
      });
      this.removeTimeoutListeners();
    })
    .catch(error => showMessage(error.toString()));
  };

  private gotoHomepage = () => {
    if (this.state.sidemenuHidden) {
      this.setState({ sidemenuOpened: false });
    }
    this.openModule(undefined);
  }

  private toggleSidemenuT = () => {
    this.setState({ sidemenuOpened: true });
  };

  private toggleSidemenuF = () => {
    this.setState({ sidemenuOpened: false });
  };
  
  private sideToggle = () => {
    if (this.state.sidemenuHidden) {
      this.setState({ sidemenuHidden: false, sidemenuOpened: true });
    } else {
      this.setState({ sidemenuHidden: true, sidemenuOpened: false });
    }
  }

  private createPanels = (panels) => {
    const openedPanels = this.state.openedPanels;
    const taskbarPanels = this.state.taskbarPanels;
    const Modules = modules;
    panels.forEach(panel => {
      const Module = Modules.find((module) => module.key === panel.key);
      if (Module) {
        const NewModule = Module.module;
        if (Module.access === 'guest') {
          const content = <NewModule moduleKey={Module.key} name={Module.name} icon={Module.icon} title={Module.title} panel={true}/>;
          taskbarPanels.push({ key: Module.key, text: panel.name || Module.name, iconProps: { iconName: panel.icon || 'icon-file' }, iconOnly: true, onClick: ()=> this.togglePanel(panel.key, true)});
          openedPanels.push({ key: Module.key, open: false, name: panel.name || Module.name, icon: panel.icon || 'icon-file', size: panel.size, content});
        }
      }
    });
    this.setState({ openedPanels, taskbarPanels });
  }

  private openModule = (targetModule: string | undefined) => {
    if (!targetModule || (this.state.openedModules && this.state.openedModules.find((module) => module.key === targetModule))) {
      const activeModule = targetModule;
      let activeModuleName = activeModule;
      const taskbarModules = this.state.taskbarModules
      if (this.state.activeModule) {
        taskbarModules[taskbarModules.findIndex((button) => button.key === this.state.activeModule)].checked = false;
      }
      if (activeModule) {
        activeModuleName = taskbarModules[taskbarModules.findIndex((button) => button.key === activeModule)].name;
        taskbarModules[taskbarModules.findIndex((button) => button.key === activeModule)].checked = true;
      }
      this.setState({ activeModule, activeModuleName, taskbarModules });
    } else {
      let openedModules = this.state.openedModules;
      const Modules = modules;
      const Module = Modules.find((module) => module.key === targetModule);
      if (Module) {
        const NewModule = Module.module;
        const activeModule = targetModule;
        if (Module.access !== 'guest' && Module.access !== 'user' && this.state.user?.access !== 'admin' && this.state.user?.access !== Module.access) {
          showMessage('Недостаточно прав для доступа к модулю "' + Module.name + '". Пожалуйста, обратитесь к администратору.');
        } else {
          const content = <NewModule moduleKey={activeModule} name={Module.name} icon={Module.icon} title={Module.title} onClose={this.closeModule} onPin={this.pinModule}/>;
          const activeModuleName = Module.name;
          const taskbarModules = this.state.taskbarModules;
          if (this.state.activeModule) { taskbarModules[taskbarModules.findIndex((button) => button.key === this.state.activeModule)].checked = false }
          taskbarModules.push({ name: activeModuleName, key: activeModule, checked: true, onClick: () => this.openModule(activeModule) });
          openedModules.push({ name: activeModuleName, content, key: activeModule });
          this.setState({ openedModules, activeModule, activeModuleName, taskbarModules });
        }
      } else {
        showMessage('Модуль "' + targetModule + '" не найден. Пожалуйста, обратитесь к администратору.');
      }
    }
  }

  private closeModule = () => {
    if (this.state.openedModules) {
      const targetModule = this.state.activeModule;
      let activeModule: string | undefined;
      let activeModuleName: string | undefined;
      let moduleIndex = this.state.openedModules.findIndex(module => module.key === targetModule);
      if (moduleIndex === this.state.openedModules.length - 1) { moduleIndex -= 1; }
      const openedModules = this.state.openedModules.filter(module => module.key !== targetModule);
      const taskbarModules = this.state.taskbarModules.filter(module => module.key !== targetModule);
      if (moduleIndex >= 0) {
        activeModule = openedModules[moduleIndex].key;
        activeModuleName = openedModules[moduleIndex].name;
        taskbarModules[taskbarModules.findIndex((button) => button.key === activeModule)].checked = true;
      }
      this.setState({ activeModule, activeModuleName, openedModules, taskbarModules });
    }
  }

  private pinModule = () => {
    /*
    if (this.state.openedModules) {
      const targetModule = this.state.activeModule;
      this.setState({ pinnedModule: targetModule });
      let activeModule: string | undefined;
      let activeModuleName: string | undefined;
      let moduleIndex = this.state.openedModules.findIndex(module => module.key === targetModule);
      if (moduleIndex === this.state.openedModules.length - 1) { moduleIndex -= 1; }
      const openedModules = this.state.openedModules.filter(module => module.key !== targetModule);
      const taskbarModules = this.state.taskbarModules.filter(module => module.key !== targetModule);
      if (moduleIndex >= 0) {
        activeModule = openedModules[moduleIndex].key;
        activeModuleName = openedModules[moduleIndex].name;
        taskbarModules[taskbarModules.findIndex((button) => button.key === activeModule)].checked = true;
      }
      this.setState({ activeModule, activeModuleName, openedModules, taskbarModules });
    }
    */
  }

}
