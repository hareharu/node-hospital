import React, { useState, useEffect } from 'react';
import Module, { getItems, getCookie, KanbanBoard, TabsContainer, TabsLinks } from 'components';

interface IBoard{
  id: string,
  name: string,
}

export default function Kanban({...props}) {
  const [boards, setBoards] = useState<IBoard[]>([]);
  const [tabs, setTabs] = useState<string[]>([]);
  const [user] = useState(getCookie('id'));
  const [tabIndex, setTabIndex] = useState(0);

  useEffect(() => getItems('api/kanban/boards/'+user, (data:IBoard[])=>{
    setBoards(data);
    var newtabs: string[] = [];
    data.forEach(element => newtabs.push(element.name));
    setTabs(newtabs);
  }), [user]);

  return (
    <Module {...props}>
      <TabsLinks links={tabs} onClick={(value) => setTabIndex(value)} tabIndex={tabIndex}/>
      <TabsContainer tabIndex={tabIndex}>
        {boards.map(board => <KanbanBoard key={board.id} boardid={board.id} />)}
      </TabsContainer>
    </Module>
  );
}
