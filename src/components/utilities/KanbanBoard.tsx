import React, { useState, useEffect, CSSProperties } from 'react';
import Board, { moveCard, addCard, removeCard } from '@lourenci/react-kanban';
import { Stack, Text, ITextStyles, ActionButton, IconButton } from 'office-ui-fabric-react';
import { Card, ICardTokens, ICardSectionStyles, ICardSectionTokens  } from '@uifabric/react-cards';
import { FontWeights } from '@uifabric/styling';
import { getCookie, dateToString, openEditPanel, openDialog, uuid, getItems, callAPIPost, datetimeToString, Hide } from 'components';
import '@lourenci/react-kanban/dist/styles.css';

interface IKanbanBoardProps {
  board?: any;
  boardid: string;
  borderless?: boolean;
  height?: number;
  width?: string;
  text?: string;
  readonly?: boolean;
  reload?: boolean;
}

interface ICard {
  id: string;
  columnid: string;
  title: string;
  description: string;
  typeid: string;
  typename: string;
  date: string;
  user: string;
  opened: boolean;
  deadline: string;
  comment: string;
}

interface IColumn {
  id: string;
  title: string;
  cards: ICard[];
}

export function KanbanBoard(props: IKanbanBoardProps) {

  const [board, setBoard] = useState<IColumn[]>([]);
  const [username, /**/] = useState(getCookie('name'));

  useEffect(() => getItems('api/kanban/board/'+props.boardid, setBoard, undefined), [ props.boardid, props.reload ]);
  /*
  let style: CSSProperties = {
    //overflowX: 'hidden',
    //overflowY: 'hidden',
  }
  */
  const siteTextStyles: ITextStyles = {
    root: {
      color: '#333333', // '#025F52',
      fontWeight: FontWeights.semibold
    }
  };
  const descriptionTextStyles: ITextStyles = {
    root: {
      color: '#333333',
      fontWeight: FontWeights.regular
    }
  };
  const helpfulTextStyles: ITextStyles = {
    root: {
      color: '#333333',
      fontWeight: FontWeights.regular
    }
  };
  /*
  const iconStyles: IIconStyles = {
    root: {
      color: '#0078D4',
      fontSize: 16,
      fontWeight: FontWeights.regular
    }
  };
  */
  const footerCardSectionStyles: ICardSectionStyles = {
    root: {
      alignSelf: 'stretch',
      borderLeft: '1px solid #F3F2F1',
      margin: '0px',
      padding: '12px 4px',
    }
  };
  const cardSectionStyles: ICardSectionStyles = {
    root: {
      background: 'white',
      marginBottom: '10px',
    }
  };
  const mainSectionStyles: ICardSectionStyles = {
    root: {
      alignSelf: 'stretch',
      width: '300px',
    }
  };
  const columnHeaderStyles: CSSProperties = {
    marginBottom: '10px',
    background: '#f1f1f1',
    padding: '10px',
    marginTop: '-15px',
    marginLeft: '-5px',
    marginRight: '-5px',
    boxShadow: '#f1f1f1 0px 5px 15px 0px',
  }
  // const sectionStackTokens: IStackTokens = { childrenGap: 20 };
  const cardTokens: ICardTokens = { childrenMargin: 12 };
  const footerCardSectionTokens: ICardSectionTokens = { padding: '0px 0px 0px 12px' };

  const onMinimize = ( opened: boolean, id: string, columnid: string) => {
    var column = board.findIndex(x => x.id === columnid);
    var card = board[column].cards.findIndex(x => x.id === id);
    if (opened === undefined) opened = false;
    var newBoard = board;
    newBoard[column].cards[card].opened = !opened;
    const newnewBoard = moveCard({ columns: newBoard }, { fromPosition: card, fromColumnId: columnid }, { toPosition: card, toColumnId: columnid });
    setBoard(newnewBoard.columns);
  }

  const onMoveCard = (id: string, columnid: string, to: number, tocolumn: string) => {
    var column = board.findIndex(x => x.id === columnid);
    var card = board[column].cards.findIndex(x => x.id === id);
    var newBoard = board;
    newBoard[column].cards[card].columnid = tocolumn;
    const newnewBoard = moveCard({ columns: newBoard }, { fromPosition: card, fromColumnId: columnid }, { toPosition: to, toColumnId: tocolumn });
    setBoard(newnewBoard.columns);
    callAPIPost('api/kanban/card/move/'+id, { fromPosition: card, fromColumnId: columnid , toPosition: to, toColumnId: tocolumn}, undefined, () => {
      // setBoard(newnewBoard.columns);
    });
  }

  const onRemoveCard = (id: string, columnid: string) => {
    var column = board.findIndex(x => x.id === columnid);
    var card = board[column].cards.findIndex(x => x.id === id);
    callAPIPost('api/kanban/card/remove/'+id, { fromColumnId: columnid }, undefined, () => {
      const newBoard = removeCard({ columns: board }, board[column], board[column].cards[card]);
      setBoard(newBoard.columns);
    });
  }

  const onAddCard = (id: string, columnid: string, title: string, description: string, typeid: string) => {
    var column = board.findIndex(x => x.id === columnid);
    var card = {
      id: id,
      columnid: columnid,
      title: title,
      description: description,
      typeid: typeid,
      typename: null,
      user: username,
      date: null,
    };
    callAPIPost('api/kanban/card/add/'+id, { toColumnId: columnid, card }, undefined, (responce) => {
      card.typename = responce.typename;
      card.user = responce.user;
      card.date = responce.date;
      const newBoard = addCard({ columns: board }, board[column], card, { on: 'top'});
      setBoard(newBoard.columns);
    });
  }
  
  const onEditCard = (id: string, columnid: string, title: string, description: string, typeid: string, deadline: string, comment: string) => {
    var column = board.findIndex(x => x.id === columnid);
    var card = board[column].cards.findIndex(x => x.id === id);
    callAPIPost('api/kanban/card/edit/'+id, { title, description, typeid, deadline, comment }, undefined, (responce) => {
      var newBoard = board;
      newBoard[column].cards[card].title = title;
      newBoard[column].cards[card].description = description;
      newBoard[column].cards[card].typeid = typeid;
      newBoard[column].cards[card].typename = responce.typename;
      newBoard[column].cards[card].user = responce.user;
      newBoard[column].cards[card].date = responce.date;
      newBoard[column].cards[card].deadline = deadline;
      newBoard[column].cards[card].comment = comment;
      const newnewBoard = moveCard({ columns: newBoard }, { fromPosition: card, fromColumnId: columnid }, { toPosition: card, toColumnId: columnid });
      setBoard(newnewBoard.columns);
    });
  }

  return (
    <Board
      children={{ columns: board }}
      disableColumnDrag={true}
      disableCardDrag={props.readonly}
      renderCard={({ opened, id, columnid, title, description, typeid, typename, deadline, comment, date, user }) => (
        <Card aria-label="Clickable horizontal card " horizontal tokens={cardTokens} styles={cardSectionStyles}>
          <Card.Section styles={mainSectionStyles}>
            <Text variant="small" styles={siteTextStyles}>{(deadline? dateToString(deadline) + ' ' : '') + title + (typename? ' ('+typename+')' : '')}</Text>
            <Hide condition={!opened}>
              <Text styles={descriptionTextStyles}>{description}</Text>
              <Stack.Item grow={1}><span/></Stack.Item>
            </Hide>
            <Text variant="small" styles={helpfulTextStyles}>{datetimeToString(date)}, {user}</Text>
          </Card.Section>
          <Card.Section styles={footerCardSectionStyles} tokens={footerCardSectionTokens}>
            <ActionButton styles={{ root: { height: '23px', margin: '0px' }}} iconProps={{ iconName: !opened ? 'icon-chevron-down' : 'icon-chevron-up' }} onClick={() => onMinimize(opened, id, columnid)}/>
            <Hide condition={!opened}>
              <Stack.Item grow={1}>
                <span />
              </Stack.Item>
              <Hide condition={props.readonly === true}>
                <IconButton iconProps={{ iconName: 'icon-edit-2' }} styles={{ root: { margin: '0px!important' }}} onClick={() => openEditPanel(
                    'Изменить задачу', [
                      { disabled: true, key: 'title', type: 'text', value: title, label: 'Заголовок' },
                      { key: 'typeid', type: 'selectapi', value: typeid, label: 'Категория', api: 'api/kanban/typesdrop', deftest: '-' },
                      { disabled: true, key: 'description', type: 'multiline', value: description, label: 'Описание' },
                      { disabled: true, key: 'user', type: 'text', value: user, label: 'Пользователь' },
                      { key: 'deadline', type: 'date', value: deadline, label: 'Срок исполнения' },
                      { key: 'comment', type: 'multiline', value: comment, label: 'Примечание' },
                    ], (values: ICard) => onEditCard(id, columnid, values.title, values.description, values.typeid, values.deadline, values.comment), [ 'title' ]
                  )}/>
                <IconButton
                  styles={{ root: { margin: '0px!important' }}}
                  iconProps={{ iconName: 'icon-x' }}
                  // title='Закрыть панель'
                  onClick={() => openDialog('Закрыть задачу', 'Задача "'+title+'" будет закрыта.', ()=>onRemoveCard(id, columnid))}
                  // styles={{ root: { top: '4px', right: '4px', color:theme.palette.neutralSecondary} }}
                />
              </Hide>
            </Hide>
          </Card.Section>
        </Card>
      )}
      renderColumnHeader={({ id, title }) => (
        <div style={columnHeaderStyles} >
          <Text variant='large' >
            {title}
          </Text>
          <Hide condition={props.readonly === true || title !== 'Новые задачи'}>
            <ActionButton styles={{ root: { height: '23px', margin: '0px' }}} iconProps={{ iconName: 'icon-plus' }} text='Добавить' onClick={() => openEditPanel(
                'Новая задача', [
                  { key: 'title', type: 'text', value: '', label: 'Заголовок' },
                  { key: 'typeid', type: 'selectapi', value: '', label: 'Категория', api: 'api/kanban/typesdrop', deftest: '-' },
                  { key: 'description', type: 'multiline', value: '', label: 'Описание' },
                  { disabled: true, key: 'user', type: 'text', value: username, label: 'Пользователь' },
                ], (values: ICard) => onAddCard(uuid(), id, values.title, values.description, values.typeid), ['title', 'description', 'user']
              )}
            />
          </Hide>
        </div>
      )}
      onCardDragEnd={(card, source, destination) => onMoveCard(card.id, card.columnid, destination.toPosition, destination.toColumnId)}
    />
  );
}
