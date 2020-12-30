import React, { CSSProperties } from 'react';
import { CommandBar, CommandBarButton, IButtonProps, ICommandBarItemProps, ICommandBarStyles, IButtonStyles, IContextualMenuProps } from 'office-ui-fabric-react';
import { theme } from 'components';

interface ITaskbarProps {
  items: ICommandBarItemProps[];
  rightItems: ICommandBarItemProps[];
  onClose: () => void;
  onPin: () => void;
  shrunk: boolean;
}

export class Taskbar extends React.Component<ITaskbarProps, {}> {
  public render() {
    const styleTaskbar: ICommandBarStyles = {
      root: {
        backgroundColor: 'transparent',
        height: '29px',
        fontSize: '12px',
        paddingLeft: !this.props.shrunk ? '48px' : undefined,
      },
    }
    const propsTaskbarOverflowButton: IButtonProps = {
      menuIconProps: {
        iconName:'More',
        style:{
          color: theme.palette.neutralPrimary,
        },
      },
      styles: {
        root: {
          height:'26px',
          top: '4px',
          background: 'transparent',
          border: '1px solid transparent',
        },
      },
    }
    return (
      <CommandBar
        styles={styleTaskbar}
        items={this.props.items}
        farItems={this.props.rightItems}
        overflowButtonProps={propsTaskbarOverflowButton}
        buttonAs={this.moduleTabButton}
      />
    );
  }

  private moduleTabButton = (props: IButtonProps) => {
    const styleButton: IButtonStyles = {
      rootChecked: {
        background: theme.palette.white,
        border: '1px solid ' + theme.palette.neutralLight,
        borderBottom: '1px solid ' + theme.palette.white,
        borderTopLeftRadius: '4px',
        borderTopRightRadius: '4px',
      },
      rootHovered: {
        borderTopLeftRadius: '4px',
        borderTopRightRadius: '4px',
      },
      rootCheckedHovered: {
        background: theme.palette.white,
      },
      label: {
        color: theme.palette.neutralPrimary,
        fontWeight: 600,
      },
      icon: {
        color: theme.palette.neutralPrimary,
      },
      root: {
        fontSize: '12px',
        height: '26px', 
        top: '4px',
        border:'1px solid transparent',
        background: 'transparent',
      },
    }
    const styleDropdownPrimary: CSSProperties = {
      color: theme.palette.neutralPrimary,
    }
    let menuProps: IContextualMenuProps | undefined;
    if (props.checked) { 
      menuProps = {
        items: [
          // { key: 'pinModule', text: 'Закрепить', onClick: this.props.onPin, iconProps: { iconName: 'pin', style: styleDropdownPrimary } },
          { key: 'closeModule', text: 'Закрыть', onClick: this.props.onClose, style: { fontSize: '12px' }, iconProps: { iconName: 'cancel', style: styleDropdownPrimary } },
        ],
        useTargetWidth: true,
      }
    }
    return <CommandBarButton {...props} styles={styleButton} menuProps={menuProps}/>
    // return <span><CommandBarButton {...props} styles={styleButton} menuProps={menuProps}/> <IconButton iconProps={{ iconName: 'cancel' }} title="Закрыть" styles={{ /*root: { position: 'absolute', right: '0px' }*/}}/></span>
  };

}
