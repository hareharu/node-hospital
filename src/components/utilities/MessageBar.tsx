import React from 'react';
import { theme } from 'components';
import { Layer, MessageBar as MessageBarFabric, MessageBarType } from 'office-ui-fabric-react';
import { Depths } from '@uifabric/fluent-theme';

interface IMessage {
  key: string;
  text: string;
  type: MessageBarType;
  dismissable: boolean;
  timeout?: any;
  onclose?: any;
}

interface IMessageBarState {
  messages: IMessage[];
}

let showMessageFn: (text: string, type: MessageBarType, callback?: ()=>void) => void;

export function showMessage(text: any, typeString?: string, onClose?: ()=>void) {
  let type = MessageBarType.error;
  // text = new String(text);
  switch (typeString) {
    case 'info': type = MessageBarType.info; break;
    case 'warning': type = MessageBarType.warning; break;
    case 'error': type = MessageBarType.error; break;
    default: type = MessageBarType.error;
  }
  if (!showMessageFn) {
    alert(text.toString());
  } else {
    showMessageFn(text.toString(), type, onClose);
  }
}

export class MessageBar extends React.Component<{}, IMessageBarState> {

  public state: IMessageBarState = {
    messages: [],
  }

  public componentDidMount() {
    showMessageFn = this.addMessage;
  }

  public render() {
    return (
      <Layer styles={{ root: { zIndex: 3000000 }, content: { width: 'calc(50% - 3px)', left: '50%', position: 'absolute' }}}>
          {this.state.messages.map(message => {
            return (
              <div key={message.key} style={{ background: theme.palette.white, boxShadow: Depths.depth16 }}>
                <MessageBarFabric
                  key={message.key}
                  messageBarType={message.type}
                  onDismiss={message.dismissable ? message.onclose : undefined}
                  styles={{ root: { marginTop: '3px' } }}
              >{message.text}</MessageBarFabric></div>
            );
          })}
      </Layer>
    );
  }

  private removeMessage = (id: string, callback?: ()=>void): (() => void) => {
    return (): void => {
      const messages = this.state.messages.filter(module => module.key !== id);
      this.setState({ messages });
      if (callback) callback();
    };
  };

  private addMessage = (text: string, type: MessageBarType, callback?: ()=>void) => {
    const messages = this.state.messages;
    const key = Math.random().toString();
    const timeout = undefined;
    messages.push({ key, text, type, dismissable: true, timeout, onclose: this.removeMessage(key, callback) });
    this.setState({ messages });
  }

}
