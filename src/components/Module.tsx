import React from 'react';
import { IStackStyles, ILabelStyles, Stack, Label, Icon, IconButton } from 'office-ui-fabric-react';
import { theme } from 'components';

interface IModuleProps {
  title?: string;
  info?: string;
  icon?: string;
  onClose?: () => void;
  onPin?: () => void;
  panel?: boolean;
}

export default class Module extends React.Component<IModuleProps> {

  public render() {
    const styleStackMain: IStackStyles = {
      root: {
        height: 'calc(100vh - 30px)',
      },
    }
    const styleStackPanel: IStackStyles = {
      root: {
        height: 'calc(100vh - 41px)',
      },
    }
    const styleStackTitle: IStackStyles = {
      root: {
        flexShrink: '0!important',
        margin: '8px 15px 10px 15px',
      }
    }
    const stylesLabel: ILabelStyles = {
      root: {
        flexShrink: '0!important',
        userSelect: 'none',
        display: 'inline-block',
        margin: '0px 15px 0px 0px',
        padding: 0,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      },
    }

    return (
      <form onSubmit={this.onSubmit} autoComplete='off'>
        <Stack styles={this.props.panel ? styleStackPanel : styleStackMain}>
          <Stack styles={styleStackTitle} horizontal={true} wrap={true}>
            <Label styles={stylesLabel}>{this.props.title}</Label>
            {this.props.info?
              <Label styles={stylesLabel}>
                <Icon iconName='icon-info' styles={{ root: { position: 'absolute', marginTop: '1px' }}}/>
                <span style={{ marginLeft: '20px' }}>{this.props.info}</span>
              </Label>
            :
              <span/>
            }
          </Stack>
          {this.props.children}
        </Stack>
        <div style={{ position: 'absolute', right: '5px', top: '35px' /* 2 from top & bottom - '32px' 5 from top - '35px'*/ }}> 
          <IconButton
            iconProps={{ iconName: 'icon-help-circle' }}
            title='Справка по модулю'
            // onClick={}
            styles={{ root: { display: 'none', color:theme.palette.neutralSecondary} }}
          />
          <IconButton
            iconProps={{ iconName: 'icon-x' }}
            title='Закрыть модуль'
            onClick={this.props.onClose}
            styles={{ root: { display: 'none', color:theme.palette.neutralSecondary} }}
          />
        </div>
      </form>
    );
  }

  private onSubmit = (event: React.FormEvent) => {
    event.preventDefault();
  }

}
