import React, { CSSProperties } from 'react';
import { DefaultButton, Label, TextField, CompoundButton, IButtonStyles, ITextFieldStyles, ITextFieldStyleProps, ILabelStyles } from 'office-ui-fabric-react';
import { theme, FakePanel, SidemenuContent, SidemenuLogo } from 'components';

interface ILoginFormProps {
  onLogin: (username: string, password: string) => void;
  message?: string;
  logintip?: string;
  username?: string;
  show: boolean;
  appName: string;
  build: string;
}

interface ILoginFormState {
  onLogin: () => void;
  message: string;
  username?: string;
  password?: string;
  readonly: boolean;
}

export class LoginForm extends React.Component<ILoginFormProps, ILoginFormState> {

  _isMounted = false;

  constructor(props: ILoginFormProps) {
    super(props);
    let readonly = false;
    let username;
    let message;
    if (this.props.message) {
      message = this.props.message;
    }
    if (this.props.username) {
      username = this.props.username;
      readonly = true;
    }
    let onLogin = () => {
      if (this.state.username && this.state.password) {
        this.props.onLogin(this.state.username, this.state.password);
      } else {
        this.setState({ message: 'Введите логин и пароль' })
      }
    }
    this.state = {
      onLogin,
      message,
      username,
      readonly,
    };
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  static getDerivedStateFromProps(props: ILoginFormProps, state: ILoginFormState) {
    if (props.message && props.message !== state.message) {
      return { message: props.message };
    }
    return null
  }

  public render() {  
    const styleButton: IButtonStyles = {
      root: { width: '100%', /*textAlign: 'left'*/ }
      /*
      root: { border: '1px solid ' + theme.palette.themeDark ,
      rootHovered: { border: '1px solid ' + theme.palette.neutralDark },
      rootPressed: { border: '1px solid ' + theme.palette.themePrimary },
      */
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
    function styleTextField(props: ITextFieldStyleProps): Partial<ITextFieldStyles> {
      return {
        root: {
          paddingBottom: '5px',    
        },
      };
    }
    const ua = navigator.userAgent;
    const ie = ua.indexOf('MSIE ') > -1 || ua.indexOf('Trident/') > -1;
    if (ie) {
      return (
        <FakePanel>
          <SidemenuLogo appName={this.props.appName}/>
          <SidemenuContent  build={this.props.build}>
            <div style={styleForm}>
              <Label styles={styleLabel}>Внимание!</Label>
              <Label>Приложение не расчитано на работу в браузере Internet Explorer. Пожалуйста, воспользуйтесь другим браузером.</Label>
            </div>
          </SidemenuContent>
        </FakePanel>
      )
    } else {
      if (this.props.show) {
        return (
          <FakePanel>
            <SidemenuLogo appName={this.props.appName}/>
            <SidemenuContent  build={this.props.build}>
              <form onSubmit={this.onSubmit} style={styleForm}>
                <Label styles={styleLabel}>{this.state.message}</Label>
                <TextField styles={styleTextField} placeholder='Логин' onChange={this.onUsernameChange} value={this.state.username} readOnly={this.state.readonly}/>
                <TextField styles={styleTextField} placeholder='Пароль' onChange={this.onPasswordChange} value={this.state.password} type='password'/>
                {this.props.logintip === '' ?
                  <DefaultButton styles={styleButton} type='submit' primary={true} onClick={this.state.onLogin} text='Войти в систему'/>
                  :
                  <CompoundButton styles={styleButton} type='submit' primary={true} onClick={this.state.onLogin} text='Войти в систему' secondaryText={this.props.logintip}/>
                }
              </form>
            </SidemenuContent>
          </FakePanel>
        );
      } else {
        return <span/>
      }
    }
  }

  private onSubmit = (event: React.FormEvent) => {
    event.preventDefault();
  }

  private onUsernameChange = (event?: React.FormEvent, value?: string): void => {
    this.setState({ username: value });
  }

  private onPasswordChange = (event?: React.FormEvent, value?: string): void => {
    this.setState({ password: value });
  }

}
