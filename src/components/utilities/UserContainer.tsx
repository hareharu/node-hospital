import React from 'react';
import { niluuid } from 'components';

interface IUserContainerProps {
  user?: any;
  module?: string;
}

let getCookieFn: (title: string) => string;
let isLoggedFn: () => boolean;
let getActiveModuleFn: () => string;

export function isLogged(): boolean {
  return isLoggedFn();
}

export function getActiveModule(): string {
  return getActiveModuleFn();
}
export function getCookie(title: string): string {
  return getCookieFn(title);
}

export class UserContainer extends React.Component<IUserContainerProps> {

  constructor(props: IUserContainerProps) {
    super(props);
    this.state = {
      user: true,
    };
  }

  public componentDidMount() {
    getActiveModuleFn = this.onGetActiveModule;
    getCookieFn = this.onGetCookie;
    isLoggedFn = this.onIsLogged;
  }

  public render() {
    return (
      <div/>
    );
  }

  private onGetActiveModule = () => {
    if (this.props.module) {
      return this.props.module;
    } else {
      return 'none';
    }
  }

  private onIsLogged = () => {
    if (this.props.user) {
      return true;
    } else {
      return false;
    }
  
  }

  private onGetCookie = (title: string) => {
    switch (title) {
      case 'id':
        if (this.props.user) {
          if (this.props.user.id) {
            return this.props.user.id.toString();
          } else {
            return niluuid();
          }
        } else {
          return niluuid();
        }
      case 'role':
        if (this.props.user) {
          if (this.props.user.role) {
            return this.props.user.role.toString();
          } else {
            return niluuid();
          }
        } else {
          return niluuid();
        }
      case 'name':
        if (this.props.user) {
          if (this.props.user.name) {
            return this.props.user.name.toString();
          } else {
            return niluuid();
          }
        } else {
          return niluuid();
        }
      case 'access':
        if (this.props.user) {
          if (this.props.user.access) {
            return this.props.user.access.toString();
          } else {
            return 'user';
          }
        } else {
          return 'guest';
        }
      case 'doctor': // уже не используется
        return niluuid();
      case 'snils':
        if (this.props.user) {
          if (this.props.user.doctor) {
            if (this.props.user.dept) return niluuid();
            return this.props.user.doctor.toString();
          } else {
            return niluuid();
          }
        } else {
          return niluuid();
        }
      default: return niluuid();
    }
  }

}
