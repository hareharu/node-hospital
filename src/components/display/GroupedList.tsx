import React, { CSSProperties } from 'react';
import { IColumn, IDetailsRow, DetailsRow, ScrollablePane, Selection, SelectionMode, GroupedList as GroupedListFabric, IRenderFunction, IGroupDividerProps, IDetailsRowStyles, IGroup } from 'office-ui-fabric-react';
import { Loading, theme, getColor } from 'components';
import { Depths } from '@uifabric/fluent-theme';

export interface IGroupedListState {
  columns: IColumn[];
  items: IDetailsRow[];
  groups: IGroup[];
  selection: Selection;
}

interface IGroupedListProps {
  columns: IColumn[];
  items: IDetailsRow[];
  groups?: IGroup[];
  maxLevel?: number;
  loading?: boolean;
  height?: number;
  width?: string;
  borderless?: boolean;
}

export class GroupedList extends React.Component<IGroupedListProps, IGroupedListState> {

  constructor(props: IGroupedListProps) {
    super(props);
    let items: IDetailsRow[] = this.props.items;
    let columns: IColumn[] = this.props.columns;
    let groups: IGroup[] = this.props.groups || [];
    let selection = new Selection();
    if (!this.props.groups) {
      groups = this.generateGroups(props.items, this.props.maxLevel || 0);
    }
    this.state = {
      items,
      columns,
      groups,
      selection,
    };
  }

  public componentDidUpdate(prevProps: IGroupedListProps) {
    // console.log('GroupedList componentDidUpdate')
    if (JSON.stringify(prevProps.items) !== JSON.stringify(this.props.items)) {
      this.setState({ items: this.props.items });
      if (!this.props.groups) {
        this.setState({ groups: this.generateGroups(this.props.items, this.props.maxLevel || 0) });
      }
    }
    if (JSON.stringify(prevProps.groups) !== JSON.stringify(this.props.groups)) {
      if (this.props.groups !== undefined) {
        this.setState({ groups: this.props.groups });
      } else {
        this.setState({ groups: []});
      }
    }
    if (JSON.stringify(prevProps.columns) !== JSON.stringify(this.props.columns)) {
      this.setState({ columns: this.props.columns });
    }
  }

  public render(): JSX.Element {
    let styleF:CSSProperties = {
      flexBasis: this.props.width ? this.props.width : '100%',
      position: 'relative',
      display: 'flex',
      overflow: 'hidden',
    }
    let styleH:CSSProperties = {
      height: this.props.height,
      marginBottom: '14px',
      position: 'relative',
      display: 'block',
    }
    let styleB:CSSProperties = {}
    let styleR:CSSProperties = {}
    if (this.props.borderless !== true) {
      styleB = {
        borderTop: '1px solid '+theme.palette.neutralLight,
        boxShadow: Depths.depth16,
      }
    }

    return (
      <div style={this.props.height ? {...styleH, ...styleB, ...styleR}: {...styleF, ...styleB, ...styleR}}>
        <Loading loading={this.props.loading} height={this.props.height ? (this.props.borderless ? this.props.height : this.props.height - 1) + 'px' : '100%'}>
          <ScrollablePane>
              <GroupedListFabric
                items={this.state.items}
                onRenderCell={this.onRenderCell}
                selection={this.state.selection}
                selectionMode={SelectionMode.none}
                groups={this.state.groups}
                groupProps={{
                  // isAllGroupsCollapsed: true,
                  onRenderHeader: this.onRenderGroupHeader,
                }}
                compact={true}
                onShouldVirtualize={() => { // виртуализация вызывает проблемы с таблицами во вкладках - не всегда отрисовываются все строки
                  if (this.state.items.length > 500) { // для больших таблиц оставляем, иначе скролл сильно тормозит
                    return true;
                  }else{
                    return false;
                  }
                }} 
              />
          </ScrollablePane>
        </Loading>
      </div>
    );
  }

  private onToggleCollapse(props: IGroupDividerProps): () => void {
    return () => {
      props!.onToggleCollapse!(props!.group!);
    };
  }

  private onRenderGroupHeader = (groupDividerProps?: IGroupDividerProps, defaultRender?: IRenderFunction<IGroupDividerProps>) => {
    if (defaultRender && groupDividerProps) {
      groupDividerProps.onGroupHeaderClick = this.onToggleCollapse(groupDividerProps);
      return defaultRender({ ...groupDividerProps });
    } else {
      return null;
    }
  }

  private onRenderCell = (nestingDepth?: number, item?: any, itemIndex?: number) => {
    if (!itemIndex) itemIndex = 0;
    var rowcolor = '';
    // console.log(item);
    if (item && item.rowcolor) rowcolor = item.rowcolor;
    const styleRow: Partial<IDetailsRowStyles> = {
      root: {
        width: '100%',
        fontSize: '14px',
        color: theme.palette.neutralPrimary,
      },
    }
    if (rowcolor !== '') {
      let color = getColor(rowcolor, 25);
      styleRow.checkCell = { background: color };
      styleRow.fields = { background: color };
    }
    return (
      <DetailsRow
        styles={styleRow}
        columns={this.state.columns}
        groupNestingDepth={nestingDepth}
        item={item}
        itemIndex={itemIndex}
        selection={this.state.selection}
        selectionMode={SelectionMode.none}
        compact={true}
      />
    );
  };

  private generateGroups = (items: IDetailsRow[], maxLevel: number, level?: number, start?: number, end?: number) => {
    if (level === undefined) level = 0;
    if (start === undefined) start = 0;
    if (end === undefined) end = items.length - 1;
    var rowname = 'rowgroup'+level;
    var groups:IGroup[] = [];
    var count = 0;
    // var pad = ''.padStart(level*2);
    // console.log(pad+'START level '+level+' from '+start+' to '+end+' ('+(end - start + 1)+')');
    for (var index = start; index <= end; index++) {
      count += 1;
      // console.log(pad+'  '+index + ' ' + items[index][rowname])
      if (index === end || items[index][rowname] !== items[index+1][rowname]) {
        var startIndex = index - count + 1;
        var children:IGroup[] = [];
        if (level < maxLevel) {
          children = this.generateGroups(items, maxLevel, (level + 1), startIndex, index);
        } 
        groups.push({ level, key: 'level'+level+'_items' + startIndex + '-' + index, name: items[index][rowname], startIndex, count, children });
        count = 0;
      }
    }
    // console.log(pad+'END');
    return groups;
  }

}
