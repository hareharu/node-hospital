import React from 'react';
import {theme } from 'components';
import { Controlled as CodeMirror } from 'react-codemirror2';
import 'codemirror/lib/codemirror.css';
import 'codemirror/mode/sql/sql';
import 'codemirror/addon/merge/merge.js';
import 'codemirror/addon/merge/merge.css';
import 'codemirror/theme/elegant.css';
import { CommandBar, ICommandBarItemProps, Stack, IStackStyles } from 'office-ui-fabric-react';
import { Depths } from '@uifabric/fluent-theme';

interface ICodeEditorProps {
  onChange: (value: string) => void;
  code: string;
  height?: string;
  commands?: ICommandBarItemProps[];
  commandsRight?: ICommandBarItemProps[];
}

interface ICodeEditorState {
  onBeforeChange: (editor, data, value) => void;
}

export class CodeEditor extends React.Component<ICodeEditorProps, ICodeEditorState> {

  constructor(props: ICodeEditorProps) {
    super(props);
    const onBeforeChange = (editor, data, value) => {
      this.props.onChange(value);
    }
    this.state = {
      onBeforeChange,
    };
  }

  public render() {
    const containerStackStyle:IStackStyles = {
      root: {
        flexShrink: '0!important',
        // width: '100%',
        borderTop: '1px solid ' + theme.palette.neutralLight,
        borderRight: '1px solid ' + theme.palette.neutralLight,
        height: 'calc('+(this.props.height||'100%')+' - 1px)',
        boxShadow: Depths.depth16,
      }
    }
    const editorStackStyle:IStackStyles = {
      root: {
        flexShrink: '0!important',
        height: 'calc('+(this.props.height||'100%')+' - 37px)',
      }
    }
    const commandsStackStyle:IStackStyles = {
      root: {
        flexShrink: '0!important',
        height: '36px',
      }
    }
    return (
      <Stack styles={containerStackStyle}>
        {this.props.commands && <Stack styles={commandsStackStyle}><CommandBar items={this.props.commands} farItems={this.props.commandsRight} styles={{ root: { height: '35px', borderBottom: '1px solid ' + theme.palette.neutralLight, }}}/></Stack> }
        <Stack styles={editorStackStyle}>
          <CodeMirror
            className='wh-CodeMirror'
            value={this.props.code}
            options={{
              mode: 'text/x-mysql',
              theme: 'elegant',
              indentWithTabs: true,
              smartIndent: true,
              lineNumbers: true,
              matchBrackets : true,
              autofocus: true,
              lineWrapping: true
            }}
            onBeforeChange={this.state.onBeforeChange}
          />
        </Stack>
      </Stack>
    );
  }

}
