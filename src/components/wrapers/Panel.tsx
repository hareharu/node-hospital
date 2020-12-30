import React from 'react';
import { Panel as PanelFabric, PanelType, Stack, KeyCodes, IconButton } from 'office-ui-fabric-react';
import { theme, Loading, openDialog, Button } from 'components';

interface IPanelProps {
  isOpen: boolean;
  text?: string;
  nopadding?: boolean;
  onDismiss: () => void;
  onConfirm?: () => void;
  onCheck?: () => void;
  size?: string;
  close?: boolean;
  loading?: boolean;
  preventEscape?: boolean;
  width?: string;
  confirm?: string;
  dialog?: boolean;
  disabled?: boolean;
  backgroundcolor?: string;
}

export class Panel extends React.Component<IPanelProps> {

  public render() {
    let size: PanelType;
    switch (this.props.size) {
      case 'C': size = PanelType.custom; break;
      case 'F': size = PanelType.smallFluid; break;
      case 'S': size = PanelType.smallFixedFar; break;
      case 'M': size = PanelType.medium; break;
      case 'L': size = PanelType.largeFixed; break;
      case 'XL': size = PanelType.large; break;
      default: size = PanelType.medium;
    }
    let height = 0;
    if (this.props.text) height += 41;
    if (!this.props.nopadding) height += 20;
    if (this.props.dialog) height += 70;
    return (
      <PanelFabric
        styles={{ header: { marginTop: '14px' }, headerText: {
          textOverflow: 'ellipsis',
          overflow: 'hidden',
          whiteSpace: 'nowrap',
          userSelect: 'none',
          width: this.props.width ? 'calc('+this.props.width+' - 64px)' : 'unset',
        }, content: { padding: this.props.nopadding ? 0 : undefined }, commands: { position: 'absolute', right: 0 } }}
        isOpen={this.props.isOpen}
        customWidth={this.props.width}
        // onDismiss={this.onDismiss}
        onRenderNavigationContent={!this.props.dialog? this.renderCloseButton : undefined}
        type={size}
        headerText={this.props.text}
        hasCloseButton={!this.props.dialog}
        onRenderFooterContent={this.props.dialog? this.renderFooter : undefined}
        isFooterAtBottom={this.props.dialog? true : undefined}
        // onRenderHeader={this.renderHeader}
        // hasCloseButton={this.props.close}
        // onOuterClick={() => {}} // костыль для исправления бага приводящего к закрытию панели при клике на элементах вызываемых поверх панели https://github.com/OfficeDev/office-ui-fabric-react/issues/6476
        focusTrapZoneProps={{isClickableOutsideFocusTrap: true, ignoreExternalFocusing: true, forceFocusInsideTrap: true,}}
      >
        <Loading loading={this.props.loading} height={'calc(100vh - '+height+'px)'}>
          <Stack styles={ {root: { height: 'calc(100vh - '+height+'px)' }}}>{this.props.children}</Stack>
        </Loading>
      </PanelFabric>
    );
  }

  private renderFooter = () => {
    return (
      <span style={{ padding: '8px' }}>
        <span style={{ paddingRight: '8px' }}>
          <Button primary={true} text='Сохранить' onClick={this.onSave} disabled={this.props.disabled}/>
        </span>
        <Button text='Отмена' onClick={this.onClose}/>
      </span>
    )
  }

  private onSave = () => {
    if (this.props.onConfirm) {
      this.props.onConfirm();
    }
  }

  private onClose = () => {
    if (this.props.confirm) {
      openDialog('Отмена', this.props.confirm, ()=>this.props.onDismiss());
    } else {
      this.props.onDismiss();
    }
  }

  private renderCloseButton = () => {
    return <IconButton
            iconProps={{ iconName: 'icon-x' }}
            /*title='Закрыть панель'*/
            onClick={this.onClose}
            styles={{ root: { top: '4px', right: '4px', color:theme.palette.neutralSecondary} }}
           />
  }

  private onDismiss = (event) => {
    if (event && event.keyCode === KeyCodes.escape && this.props.preventEscape) {
      event.preventDefault();
      return;
    }
    if (this.props.onDismiss) this.props.onDismiss();
  }

}

//<div style={{height: height, display:'flex'}}>{this.props.children}</div>
