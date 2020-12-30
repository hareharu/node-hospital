import React, { CSSProperties } from 'react';
import { Stack, Text, ITextStyles, ActionButton, IStackStyles, IStackTokens, ScrollablePane } from 'office-ui-fabric-react';
import { Card, ICardTokens, ICardSectionStyles, ICardSectionTokens } from '@uifabric/react-cards';
import { FontWeights } from '@uifabric/styling';
import { theme, getStyle, datetimeToString, Hide } from 'components';

import ReactHtmlParser from 'react-html-parser';
 
interface IHTMLParserProps {
  html: string;
  full: boolean;
}

class NewsCard extends React.Component<{ item: INews, onShow?: () => void; } , { height: number, opened: string }> {
  
  private divElement = React.createRef<HTMLDivElement>();
  
  constructor(props) {
    super(props);
    this.state = {
      height: 0,
      opened: '',
    }
  }

  componentDidMount() {
    if (this.divElement.current) {
      const height = this.divElement.current.clientHeight;
      this.setState({ height });
    }
  }

  render() {
    const headerStyles: ITextStyles = {
      root: {
        color: theme.palette.neutralPrimary,
        fontWeight: FontWeights.semibold,
      },
    };
    const buttonsStyles: ITextStyles = {
      root: {
        margin: '0px 10px',
      },
    };
    const buttonsStylesShadow: ITextStyles = {
      root: {
        margin: '0px 10px',
        boxShadow: 'rgb(255 255 255) 0px -20px 15px 2px',
      },
    };
    const cardTokens: ICardTokens = { childrenMargin: 0, width: '100%', maxWidth: '100%' };
    const dateTokens: ICardSectionTokens = { padding: '0px 0px 0px 12px' };
    const dateStyles: ICardSectionStyles = {
      root: {
        alignSelf: 'stretch',
        margin: '0px 10px',
        padding: '12px 4px',
      }
    };
    const cardStyles: ICardSectionStyles = {
      root: {
        background: 'white',
        marginBottom: '10px',
        cursor: 'default'
      }
    };
    const mainSectionStyles: ICardSectionStyles = {
      root: {
        margin: '8px 15px 10px 15px',
        alignSelf: 'stretch',
        width: '100%',
      }
    };
    var months = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля',' августа', 'сентября', 'октября', 'ноября', 'декабря'];
    return <Card aria-label=" horizontal card " horizontal tokens={cardTokens} styles={cardStyles}>
            <Card.Section styles={{ root:{ width: '100%',}}}>
              <Stack>
                <Stack.Item>
                <Stack horizontal>
                  <Card.Section styles={dateStyles} tokens={dateTokens}>
                    <Text variant="xLargePlus" style={{ textAlign:'center',  color: theme.palette.themePrimary, fontWeight: 'bold'}}>{this.props.item.day.substring(8, 10)}</Text>
                    <Text variant="medium" style={{ textAlign:'center',  color: theme.palette.themePrimary, fontWeight: 'bold'}}>{months[parseInt(this.props.item.day.substring(5, 7), 10) - 1]}</Text>
                    <Text variant="medium" style={{ textAlign:'center',  color: theme.palette.themePrimary, fontWeight: 'bold'}}>{this.props.item.day.substring(0, 4)}</Text>
                   
                    <Stack.Item grow={1}>
                        <span />
                    </Stack.Item>
                    <Hide condition={true}>
                      <ActionButton styles={{ root: { height: '23px', margin: '0px' }}} iconProps={{ iconName: this.props.item.id !== this.state.opened ? 'icon-chevron-down' : 'icon-chevron-up' }} onClick={() => this.setState({ opened: this.props.item.id !== this.state.opened ? this.props.item.id : '' })}/>
                    </Hide>
                  </Card.Section>
                  <Card.Section styles={mainSectionStyles}>
                    <Text variant="large" styles={headerStyles}>{this.props.item.name}</Text>
                    <div  ref={this.divElement}>
                      <HTMLParser html={this.props.item.text} full={this.props.item.id === this.state.opened || this.state.height <= 110}/> 
                    </div>
                  </Card.Section>
                  </Stack>
                </Stack.Item>
                <Stack.Item>
                <Card.Section >
                  <Stack horizontal={true} styles={this.props.item.id === this.state.opened || this.state.height <= 110 ? buttonsStyles : buttonsStylesShadow}>
                    <Hide condition={this.state.height <= 110}><ActionButton onClick={() => this.setState({ opened: this.props.item.id !== this.state.opened ? this.props.item.id : '' })} iconProps={{ iconName: this.props.item.id !== this.state.opened ? 'icon-chevron-down' : 'icon-chevron-up' }} text={this.props.item.id !== this.state.opened ? 'Читать полностью' : 'Свернуть' }/></Hide>
                    <Hide condition={this.props.onShow === undefined}><ActionButton onClick={this.props.onShow} iconProps={{ iconName: 'icon-bell' }} text='Другие новости и объявления'/></Hide>
                    <Stack.Item grow={1}> <span /></Stack.Item>
                    <ActionButton disabled={true} text={'изменено ' + datetimeToString(this.props.item.modified)}/>
                  </Stack>
                </Card.Section>
                </Stack.Item>
              </Stack>
            </Card.Section>
          </Card>
  }
}

class HTMLParser extends React.Component<IHTMLParserProps> {
  
  render() {
    return <div className='htmlparser'  style={{
      maxHeight: this.props.full ? 'unset' : '110px',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
  }}>{ReactHtmlParser(this.props.html)}</div>;
  }
}

interface INewsProps {
  items: INews[];
  borderless?: boolean;
  height?: number;
  width?: string;
  onOpen?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onShow?: () => void;
}

interface INewsState {
  opened: string;
}

export interface INews {
  id: string;
  key: string;
  name: string;
  text: string;
  day: string;
  modified: string;
  category: string;
  categoryid: string;
}

interface INewsPreviewProps {
  borderless?: boolean;
  height?: number;
  width?: string;
  text: string;
  name: string;
}

export class NewsPreview extends React.Component<INewsPreviewProps> {

  
  public render(): JSX.Element {

    let style: CSSProperties = {
      padding: '10px 20px',
      whiteSpace: 'pre-line',
      overflowX: 'hidden',
      overflowY: 'auto',
    }

    return <div style={getStyle(this.props.height, this.props.width, this.props.borderless)}>
            <ScrollablePane>
              <div className='testscroll' style={style}>
                <Text variant="large" styles={{ root : {color: theme.palette.neutralPrimary, fontWeight: FontWeights.semibold,}}}>{this.props.name}</Text>
                <HTMLParser html={this.props.text} full={true}/>
              </div>
            </ScrollablePane>
      </div>
  }

}

export class News extends React.Component<INewsProps, INewsState> {

  constructor(props: INewsProps) {
    super(props);
    this.state = {
      opened: '',
    };
  }


  public render(): JSX.Element {

    const sectionStackTokens: IStackTokens = { childrenGap: 5};
   
    const styleStack: IStackStyles = {
      root: {
        flexShrink: '0!important',
        margin: '8px 15px 10px 15px',
      }
    }
    
    return (
          <Stack styles={styleStack} tokens={sectionStackTokens} >
            {this.props.items.map(item => <NewsCard key={item.id} item={item} onShow={this.props.onShow} /> )} 
          </Stack>
    );
  }
}