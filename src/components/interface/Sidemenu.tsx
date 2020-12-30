import React, { CSSProperties } from 'react';
import { ActionButton, FocusTrapZone, INavLink as INavLinkFabric, INavLinkGroup, ILabelStyles, Label, Nav, Panel, PanelType, Stack, INavStyles } from 'office-ui-fabric-react';
import { Scrollbars } from 'react-custom-scrollbars';
import { modules } from '../../modules';
import { theme, showMessage, BuildLabel } from 'components';
import { Depths } from '@uifabric/fluent-theme';

export interface INavLink extends INavLinkFabric {}

interface ISidemenuProps {
  // loaded: boolean;
  toggleSidemenuT: () => void;
  toggleSidemenuF: () => void;
  onClickMenu: () => void;
  // onClickLogin: (username: string, password: string, method: string) => void;
  onClickLogout: () => void;
  onClickToggle: () => void;
  onClickSettings?: () => void;
  onClickLock: () => void;
  onClickHome: () => void;
  isHidden: boolean;
  isOpened: boolean;
  activeModule?: string;
  username?: string;
  // userlogin?: string;
  userID?: string;
  appName: string;
  // loginMessage?: string;
  build: string;
}

interface ISidemenuState {
  isOpened: boolean;
  menu: INavLinkGroup[] | null;
  userID?: string;
  nomenu: boolean;
}

interface ISidemenuLogoProps {
  appName: string;
}

const styleIcon = {
  color: theme.palette.neutralPrimary,
  iconPressed: { color: theme.palette.neutralPrimary  },
  iconHovered: { color: theme.palette.neutralSecondary },
}

export class FakePanel extends React.Component {
  public render() {
    return (
      <div style={{
        zIndex: 200,
        width: '272px',
        position: 'absolute',
        boxShadow: Depths.depth64
      }}>{this.props.children}</div>
    )
  }
}

export class SidemenuContent extends React.Component<{build:string}, { scrollTop: number }> {

  public state = {
    scrollTop: 0,
  }
  public render() {
    const scrollUpdate = (values) =>{
      this.setState({ scrollTop: values.scrollTop});

    }
    return (
      <div className='wh-Sidemenu-content' style={{
        height: 'calc(100vh - 40px)',
        position: 'relative',
        backgroundColor: theme.palette.white,
        boxShadow: this.state.scrollTop > 0? 'inset rgb(0 0 0 / 12%) 0 4px 20px 4px' : 'unset',
      }}>
         <Scrollbars onUpdate={scrollUpdate} renderThumbVertical={({ style, ...props }) =>  <div {...props} style={{ ...style, cursor: 'initial', backgroundColor: 'rgba(0, 0, 0, 0.2)', borderRadius: 'inherit' }}/>  }>
              <Stack styles={{root:{height: '100%'}}}>
                <Stack.Item>
                {this.props.children}
                </Stack.Item>
                <Stack.Item grow={1}>
                        <span />
                    </Stack.Item>
                    <Stack.Item> <BuildLabel build={this.props.build} show={true}/></Stack.Item>
                </Stack>
           
            </Scrollbars>
        
        
        </div>
    )
  }
}

export class SidemenuLogo extends React.Component<ISidemenuLogoProps> {
  public render() {
    return (
      <div style={{
        backgroundColor: theme.palette.white,
        height: '40px',
        userSelect: 'none',
        fontSize: '20px',
        fontWeight: 700,  
      }}>
        <div style={{ 
          padding: '8px 105px 8px 15px',
          textOverflow: 'ellipsis',
          overflow: 'hidden',
          whiteSpace: 'nowrap',
        }}>{this.props.appName}</div>
      </div>
    )
  }
}

export class Sidemenu extends React.Component<ISidemenuProps, ISidemenuState> {

  public state: ISidemenuState = {
    isOpened: true,
    menu: null,
    nomenu: false,
  }
  
  public componentDidMount() {
    if (this.props.userID) {
      this.setState({ userID: this.props.userID });
      this.getMenu(this.props.userID);
    }
  }

  public componentDidUpdate() {
    if (this.props.isOpened && this.props.isOpened !== this.state.isOpened) {
      this.setState({ isOpened: this.props.isOpened });
    }
    if (this.props.userID && this.props.userID !== this.state.userID) {
      this.setState({ userID: this.props.userID });
      this.getMenu(this.props.userID);
    }
  }
 
  public render() {
    
    return (
      <FocusTrapZone id='focustrap-sidemenu' isClickableOutsideFocusTrap={true} forceFocusInsideTrap={false}>
        {this.props.username && this.props.isHidden && this.props.activeModule ? (
          <div style={{ position: 'absolute' }}>
            <Panel
              onRenderHeader={this.renderHeader}
              onRenderBody={this.renderSidemenu}
              isOpen={this.props.isOpened}
              type={PanelType.smallFixedNear}
              onLightDismissClick={this.props.toggleSidemenuF}
              hasCloseButton={false}
              isHiddenOnDismiss={false}
              isLightDismiss={true}
              isBlocking={true}
              focusTrapZoneProps={{ isClickableOutsideFocusTrap: true, forceFocusInsideTrap: true }}
              styles={{commands: {display: 'none'}}}
            />
            <ActionButton
              iconProps={{ iconName: 'side-bars', style: styleIcon }}
              allowDisabledFocus={true}
              onClick={this.props.toggleSidemenuT}
              title='Показать/скрыть боковое меню'
              style={{
                position: 'absolute',
                left: '8px',
                top: '-5px',
                zIndex: 1000,
              }}
            />
          </div>
        ) : (
          this.props.username &&
          <FakePanel>
            {this.renderHeader()}
            {this.renderSidemenu()}
          </FakePanel>
        )}
      </FocusTrapZone>
    );
  }

  private renderHeader = (): JSX.Element => {
    const styleDropdownPrimary = {
      color: theme.palette.neutralPrimary,
    }
    const styleDropdownDanger = {
      color: theme.palette.redDark,
    }
    return (
      <div>
        <SidemenuLogo appName={this.props.appName}/>
        {this.props.username &&
          <>
            <ActionButton
              disabled={!this.props.username}
              iconProps={{ iconName: 'side-user', style: styleIcon }}
              menuIconProps={{ iconName: undefined, style: {display: 'none'} }}
              title='Меню пользователя'
              style={{
                position: 'absolute',
                left: '165px',
                top: '0px',
              }}
              menuProps={{
                isBeakVisible: true,
                title: this.props.username,
                items: [
                  // { key: 'userSettings', name: 'Настройки', onClick: this.props.onSettings, iconProps: { iconName: 'user-settings', style: styleDropdownPrimary } },
                  { key: 'userLock', name: 'Блокировка', onClick: this.props.onClickLock, iconProps: { iconName: 'user-lock', style: styleDropdownPrimary } },
                  { key: 'userLogout', name: 'Выход', onClick: this.props.onClickLogout, iconProps: { iconName: 'user-logout', style: styleDropdownDanger }, style: styleDropdownDanger }
                ],
                styles: { container: { boxShadow: Depths.depth16, }, root: { userSelect: 'none' }, title: { backgroundColor: 'white', paddingBottom: '20px', userSelect: 'none' } }
              }}
            />
            <ActionButton
              iconProps={{ iconName: 'side-toggle', style: styleIcon }}
              onClick={this.props.onClickToggle}
              title='Закрепить/открепить боковое меню'
              style={{
                position: 'absolute',
                left: '199px',
                top: '0px',
              }}
            />
            <ActionButton
              iconProps={{ iconName: 'side-home', style: styleIcon }}
              onClick={this.props.onClickHome}
              title='Вернуться к домашней странице'
              style={{
                position: 'absolute',
                left: '233px',
                top: '0px',
              }}
            />
          </>
        }
      </div>
    )
  }

  private renderSidemenu = (): JSX.Element => {
    
    const styleNav: INavStyles = {
      navItem: {},
      navItems: {
        margin: '0px',
      },
      chevronButton: {
        right: '5px',
        left: 'unset',
        height: '36px', // не было
        top: '2px', // было 3px
        color: theme.palette.neutralPrimary,
      },
      chevronIcon: {
        height: '40px',
        top: '-2px',
        left: '5px',
      },
      compositeLink: {},
      root: {},
      link: { 
        fontSize: '17px',
        height: '40px',
        fontWeight: 400,
        paddingLeft: '11px',
        margin: '0px',
      },
      group: {},
      groupContent: {},
      linkText: {},
    }
    const styleForm: CSSProperties = {
      padding: '0px 15px',
    }
    const styleLabel: ILabelStyles = {
      root: {
        height: '27px',
        color: theme.palette.redDark,   
      },
    }
    // renderThumbVertical={({ style, ...props }) =>  <div {...props} style={{ ...style, cursor: 'initial', backgroundColor: 'rgba(0, 0, 0, 0.2)' }}/>  }
    return (
      <SidemenuContent  build={this.props.build} >
        {this.props.username ?
          this.state.nomenu ?
            <div style={styleForm}>
              <Label styles={styleLabel}>Внимание!</Label>
              <Label>Для вашей роли не настроено меню. Пожалуйста, обратитесь к администратору.</Label>
            </div>
          :
              <Nav
                styles={styleNav}
                groups={this.state.menu}
                onLinkClick={this.props.onClickMenu}
                selectedKey={this.props.activeModule === undefined ? 'none' : this.props.activeModule}
              />
          :
            <> {//this.props.loaded &&
              <div/>
              //<LoginForm onLogin={this.props.onClickLogin} message={this.props.loginMessage} username={this.props.userlogin}/>
          }</>
        }
      </SidemenuContent>
    )
  }

  private getMenu = (user: string): void => {
    fetch('/api/who/menu', { credentials: 'same-origin' })
    .then(response => {
      if (!response.ok) { throw Error(response.statusText); }
      return response.json();
    })
    .then(json => {
      if (json.status !== 'ok') {
        throw Error(json.message);
      }
      if (json.data.length === 0) {
        this.setState({ nomenu: true });
      } else {
        this.setState({ menu: this.generateMenu(json.data) });
      }
    })
    .catch(error => showMessage(error.toString()));
  }

  private generateMenuItem = (link: INavLink): INavLink => {
    const module = modules.find((module) => module.key === link.key);
    if (module) {
      if (link.icon == null) link.icon = module.icon;
      if (link.name == null) link.name = module.name;
      if (link.title == null) link.title = module.title;
      link.url = '';
    } else {
      if (link.icon == null) link.icon = 'menu-file'; // else link.icon = link.icon
      if (link.name == null) link.name = 'Ссылка';
      if (link.url == null) link.url = '';
      if (link.title == null) link.title = link.url;
      link.target = '_blank';
    }
    return link;
  }

  private generateMenu = (linksRaw: INavLink[]): INavLinkGroup[] => {
    const links: INavLink[] = [];
    linksRaw.forEach(link => {
      if (link.folder == null) {
        let folder: INavLink[] | undefined = linksRaw.filter(linkDir => linkDir.folder === link.key);
        if (folder.length > 0) {
          if (link.icon == null) link.icon = 'menu-folder'; // else link.icon = link.icon
          if (link.name == null) link.name = 'Папка';
          if (link.title == null) link.title = undefined;
          link.url = '';
          folder.forEach(linkDir => linkDir = this.generateMenuItem(linkDir));
        } else {
          link = this.generateMenuItem(link);
          folder = undefined;
        }
        links.push({ key: link.key, icon: link.icon, name: link.name, title: link.title, url: link.url, target: link.target, links: folder });
      }
    });
    return [{ links }];
  }

}
