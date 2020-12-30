import React from 'react';
import { theme, getStyle, Loading, getColor, uuid } from 'components';

import {
  ConstrainMode,
  CommandBar,
  DetailsList,
  DetailsListLayoutMode,
  DetailsRow,
  IGroupDividerProps,
  IColumn,
  ICommandBarItemProps,
  IDetailsFooterProps,
  IDetailsHeaderProps, 
  IDetailsRow, 
  IDetailsRowProps,
  IDetailsRowStyles,
  GroupHeader,
  IDetailsListStyles,
  IGroup,
  IRenderFunction,
  ScrollablePane,
  SelectionMode,
  Selection,
  Sticky,
  StickyPositionType,
  MessageBarType,
  MessageBar,
} from 'office-ui-fabric-react';

interface ITableProps {
  columns: IColumn[];
  items: IDetailsRow[];
  groups?: IGroup[];
  grouped?: boolean;
  groupeddescending?: boolean;
  summary?: string;
  multiselect?: boolean;
  onSelect?: (item: any) => void,
  onItemClick?: (item: any) => void; 
  onItemChanged?: (item: any) => void; 
  hideHeader?: boolean;
  loading?: boolean;
  sorting?: boolean;
  height?: number;
  rows?: number;
  width?: string;
  borderless?: boolean;
  noborder?: boolean;
  filter?: string;
  filterColumn?: string;
  filterHide?: boolean;
  commands?: ICommandBarItemProps[];
  commandsRight?: ICommandBarItemProps[];
  message?: string;
}

interface ITableState {
  columns: IColumn[];
  columnsSorted: IColumn[];
  items: IDetailsRow[];
  groups?: IGroup[];
  summary?: IDetailsRow[];
  selection: string,
  selectionMode: SelectionMode,
  descending?: boolean;
  sortBy?: string;
  key: string;
}

interface IGroupExtended extends IGroup {
  color: string;
  notes: string;
}
/*
interface IGroupDividerPropsExtended extends IGroupDividerProps {
  group: IGroupExtended | undefined;
}
*/
export function getSummary(items: IDetailsRow[]):IDetailsRow[] {
  const sum:IDetailsRow[] = [];
  let col0: string;
  let col1;
  let col2;
  for (const row in items) {
    if (items.hasOwnProperty(row)) {
      for (const key in items[row]) {
        if (items[row].hasOwnProperty(key)) {
          if (key !== 'sender' && key !== 'name') {
            if(isNaN(items[row][key])) {
              if (items[row][key].endsWith(')')) {
                col0 = items[row][key];
                col1 = col0.replace(')','').replace(' (', ',').split(',', 2);
                if (sum[key] === undefined || sum[key] === null) {
                  col0 = '0 (0)';
                } else {
                  col0 = sum[key];
                }
                col2 = col0.replace(')','').replace(' (', ',').split(',', 2);
                sum[key] = (parseInt(col1[0], 10) + parseInt(col2[0], 10)) + ' (' + (parseInt(col1[1], 10) + parseInt(col2[1], 10)) + ')';
              }
            } else {
              col1 = items[row][key];
              if (sum[key] === undefined || sum[key] === null) {
                col2 = 0;
              } else {
                col2 = sum[key];
              }
              sum[key] = col1 + col2;
            }
          }
        }
      }
    }
  }
  sum['name'] = 'Итого';
  return sum;
}

export class Table extends React.Component<ITableProps, ITableState> {

  private selection: Selection;

  constructor(props: ITableProps) {
    super(props);
    let selectionMode: SelectionMode = SelectionMode.none;
    if(this.props.onSelect) {
      if (this.props.multiselect) {
        selectionMode = SelectionMode.multiple;
      } else {
        selectionMode = SelectionMode.single;
      }
    }
    const columns: IColumn[] = this.props.columns;
    const columnsSorted = columns;
    const items: IDetailsRow[] = this.props.items;
    let groups: IGroup[] | undefined = this.props.groups;

    if(this.props.grouped === true) {
      groups = this.generateGroups(items);
    }

    // const summary: IDetailsRow[] | undefined = this.props.summary;
    let summary: IDetailsRow[] | undefined
    if (this.props.summary) {
      summary = getSummary(props.items);
    }

    if (this.props.sorting === undefined || this.props.sorting === true ) {
      // console.log('setting onColumnClick INIT');
      if (this.props.grouped !== true) {
        for (const column of columnsSorted) {
          // console.log(column.name);
          column.onColumnClick = this.onColumnClick;
        }
      }
    }

    this.selection = new Selection({
      onSelectionChanged: () => {
        this.setState({
          selection: this.getSelectionA()
        });
      }
    });

    this.state = {
      items,
      groups,
      columns,
      columnsSorted,
      summary,
      selection: this.getSelectionA(),
      selectionMode,
      key: uuid(),
    };
  }

  private getSelectionA(): string {
    let key = '';
    if(this.selection.getSelection()[0]){
      key = ((this.selection.getSelection()[0]).key || '').toString();
      if (this.props.onSelect) {
        if (this.props.multiselect) {
          this.props.onSelect(this.selection.getSelection());
        } else {
          this.props.onSelect(this.selection.getSelection()[0]);
        }
      }
    }else{
      if (this.props.onSelect) {    
        this.props.onSelect(undefined);
      }
    }
    return key;
  }

  public componentDidMount() {
    // console.log('Table componentDidMount');
    const column = this.state.columns.find((column) => column.isSorted === true );
    if (column) {
      this.setState({
        sortBy: column.fieldName,
        descending: column.isSortedDescending,
      });
    }

  }

  public componentWillUnmount() {
    // console.log('Table componentWillUnmount');
  }

  public componentDidUpdate(prevProps: ITableProps) {
    // console.log('Table componentDidUpdate');
    if (JSON.stringify(prevProps.items) !== JSON.stringify(this.props.items)) {
      // this.selection.setAllSelected(false); // временное решение - сборс выделения при обновлении содержимого таблицы
      // console.log(this.selection)
      // this.getSelectionA();
     
     
      
      if (this.props.grouped) {
        const newItems = this.sortItems(this.props.items, 'roworder', this.props.groupeddescending || false);
        // console.log('Tablse setState 01');
        this.setState({  items: newItems, groups: this.generateGroups(newItems) }, () =>  this.getSelectionA());
      }
      if (this.state.sortBy) {
        // console.log('Tablse setState 02');
        this.setState({ items: this.sortItems(this.props.items, this.state.sortBy, this.state.descending) }, () =>  this.getSelectionA());
      } else {
        // console.log('Tablse setState 03');
        this.setState({ items: this.props.items, groups: this.props.grouped === true ? this.generateGroups(this.props.items) : undefined}, () =>  this.getSelectionA());
      }
      if (this.props.filterColumn !== undefined && this.props.filter !== undefined) {
        let filterColumn = this.props.filterColumn;
        let filter = this.props.filter;
        let newItems = this.props.items;
        if (this.props.filterHide !== undefined) {
          newItems.forEach(item => {
            if (this.props.filterHide || !item[filterColumn] || item[filterColumn].toLowerCase().includes(filter.toLowerCase())) {
              item['rowcolor'] = null;
            } else {
              item['rowcolor'] = 'red';
            }
          });
        }
        if (this.props.filterHide === undefined || this.props.filterHide === true) {
          newItems = this.props.filter ? this.props.items.filter(item => item[filterColumn].toLowerCase().includes(filter.toLowerCase())) : this.props.items;
        }
        if (this.props.grouped) newItems = this.sortItems(newItems, 'roworder', this.props.groupeddescending || false);   
        // console.log('Tablse setState 04');
        this.setState({
          items: newItems,
          groups: this.props.grouped === true ? this.generateGroups(newItems) : undefined
          // itemsFiltered: props.filter ? props.items.filter(i => i[state.filterColumn].toLowerCase().indexOf(filter) > -1) : props.items,
        }, () =>  this.getSelectionA());
      } else {
        // console.log('Tablse setState 05');
        this.setState({ groups: this.props.grouped === true ? this.generateGroups(this.props.items) : undefined}); 
      }
      if (this.props.summary) {
        // console.log('Tablse setState 06');
        this.setState({ summary: getSummary(this.props.items) });
      }
    }
    if (prevProps.grouped !== this.props.grouped) {
      if (this.props.grouped) {
        const newItems = this.sortItems(this.props.items, 'roworder', this.props.groupeddescending || false);
        // console.log('Tablse setState 07');
        this.setState({  items: newItems, groups: this.generateGroups(newItems) }, () =>  this.getSelectionA());
      } else {
        // console.log('Tablse setState 08');
        this.setState({ groups: undefined });
      }
    }
    if (JSON.stringify(prevProps.groups) !== JSON.stringify(this.props.groups)) {
      // console.log('Tablse setState 09');
      this.setState({ groups: this.props.groups });
    }
    if (prevProps.sorting !== this.props.sorting) {
      if (this.props.sorting === undefined || this.props.sorting === true ) {
        const columnsSorted = this.props.columns;
        for (const column of columnsSorted) {
          // console.log(column.name)
          column.onColumnClick = this.onColumnClick;
        }
        // console.log('Tablse setState 10');
        this.setState({ columnsSorted });
        const column = this.props.columns.find((column) => column.isSorted === true );
        if (column && column.fieldName !== undefined) {
          // console.log('Tablse setState 11');
          this.setState({
            sortBy: column.fieldName,
            descending: column.isSortedDescending,
          });
          // console.log('Tablse setState 12');
          this.setState({ items: this.sortItems(this.props.items, column.fieldName, column.isSortedDescending) }, () =>  this.getSelectionA());
        }
      } else {
        const columnsSorted = this.props.columns;
        for (const column of columnsSorted) {
          // console.log(column.name)
          column.isSorted = false;
          column.isSortedDescending= undefined;
          column.onColumnClick = undefined;
        }
        // console.log('Tablse setState 13');
        this.setState({ columnsSorted });
        // console.log('Tablse setState 14');
        this.setState({ items: this.props.items });
      }
    }
    if (JSON.stringify(prevProps.columns) !== JSON.stringify(this.props.columns)) {
      // console.log('changing columns')
      // console.log(props.columns)
      // console.log(this.props.columns)
      const columnsSorted = this.props.columns;
      if(this.props.sorting === undefined || this.props.sorting === true ) {
        // console.log('setting onColumnClick')
      if (this.props.grouped !== true){
        const column = this.props.columns.find((column) => column.isSorted === true );
        if (column && column.fieldName !== undefined) {
          // console.log('Tablse setState 15');
          this.setState({
            sortBy: column.fieldName,
            descending: column.isSortedDescending,
          });
          // console.log('Tablse setState 16');
          this.setState({ items: this.sortItems(this.props.items, column.fieldName, column.isSortedDescending) }, () =>  this.getSelectionA());
        }
      }
        /*
        for (const column of columnsSorted) {
          // console.log(column.name)
          column.onColumnClick = this.onColumnClick;
        }
        */
      }
      // console.log('Tablse setState 17');
      this.setState({ columns: this.props.columns, columnsSorted });
    }
    if (this.props.filterColumn !== undefined && this.props.filter !== undefined && (prevProps.filter !== this.props.filter || prevProps.filterHide !== this.props.filterHide)) {
      let filterColumn = this.props.filterColumn;
      let filter = this.props.filter;
      let newItems = this.props.items;
      if (this.props.filterHide !== undefined) {
        newItems.forEach(item => {
          if (this.props.filterHide || !item[filterColumn] || item[filterColumn].toLowerCase().includes(filter.toLowerCase())) {
            item['rowcolor'] = null;
          } else {
            item['rowcolor'] = 'red';
          }
        });
      }
      if (this.props.filterHide === undefined || this.props.filterHide === true) {
        newItems = this.props.filter ? this.props.items.filter(item => item[filterColumn].toLowerCase().includes(filter.toLowerCase())) : this.props.items;
      }
      // console.log('Tablse setState 18');
      this.setState({
        items: newItems,
        groups: this.props.grouped === true ? this.generateGroups(newItems) : undefined
        // itemsFiltered: props.filter ? state.items.filter(i => i[state.filterColumn].toLowerCase().indexOf(filter) > -1) : state.items,
      }, () =>  this.getSelectionA());
    }
  }

  public render() {
    let height = 0;
    if (this.props.height) height = this.props.height;
    if (this.props.rows) height = this.props.rows * 33 + 37;
    const columnsFinal = this.state.columnsSorted;
    if (this.props.grouped) {
      for (const column of columnsFinal) {
        column.isSorted = false;
        column.isSortedDescending= undefined;
        column.onColumnClick = undefined;
      }
    }
    const styleTable: IDetailsListStyles = {
      contentWrapper: { },
      focusZone: { },
      headerWrapper: { },
      root: { },
    }
    return (
     <div style={getStyle(height, this.props.width, this.props.borderless)}>
        <Loading loading={this.props.loading} height={height ? (this.props.borderless ? height : height - 1) + 'px' : '100%'}>
          <ScrollablePane>
            <DetailsList
              items={this.state.items}
              groups={this.state.groups}
              columns={columnsFinal}
              setKey={this.state.key}
              compact={true}
              styles={styleTable}
              layoutMode={DetailsListLayoutMode.justified}
              onItemInvoked={this.props.onItemClick}
              onActiveItemChanged={this.props.onItemChanged}
              onRenderMissingItem={this.renderMissingItem}
              selectionMode={this.state.selectionMode}
              selection={this.selection}
              selectionPreservedOnEmptyClick={true}
              constrainMode={ConstrainMode.unconstrained}
              // isHeaderVisible={!this.props.hideHeader}   
              onRenderRow={this.onRenderRow}
              onRenderDetailsFooter={this.onRenderFooter}
              onRenderDetailsHeader={this.onRenderHeader}
              groupProps={{
                onRenderHeader: this.onRenderGroupHeader,
              }}
              onShouldVirtualize={() => { // виртуализация вызывает проблемы с таблицами во вкладках - не всегда отрисовываются все строки
                if (this.state.items.length > 500) { // для больших таблиц оставляем, иначе скролл сильно тормозит
                  return true;
                }else{
                  return false;
                }
              }} 
              // usePageCache={true}
              // useReducedRowRenderer={true}
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

  private onRenderGroupHeader = (groupDividerProps?: any /*IGroupDividerPropsExtended*/, defaultRender?: IRenderFunction<IGroupDividerProps>) => {
    if (defaultRender && groupDividerProps) {
      groupDividerProps.onGroupHeaderClick = this.onToggleCollapse(groupDividerProps);
      // return defaultRender({ ...groupDividerProps });
      const group: IGroupExtended = groupDividerProps.group;
      let color = 'rgba(160, 174, 180, 0.133)';
      if (group.color !== '') color = getColor(group.color, 25);
      return (
        <GroupHeader {...groupDividerProps}
          styles={{
            groupHeaderContainer: {
              height: '32px',
              borderBottom: '1px solid '+theme.palette.neutralLight,
              background: color,
            },
            check: { height: '32px' },
            expand: { height: '32px' },
          }}
        />
      );
    } else {
      return null;
    }
  }

  private renderMissingItem = (): JSX.Element => {
    return (
      <>Ничего не найдено</>
    );
  }

  private onRenderRow = (detailsRowProps?: IDetailsRowProps, defaultRender?: IRenderFunction<IDetailsRowProps>) => {
    if (defaultRender && detailsRowProps) {
      const styleRow: Partial<IDetailsRowStyles> = {
        root: {
          fontSize: '14px', 
          color: theme.palette.neutralPrimary,
          borderBottom: '1px solid '+theme.palette.neutralLight,
          // marginTop: '2px',
          // paddingTop: '-2px',
          // background: 'purple',
        },
        fields: {
          marginTop: '-1px',
          paddingTop: '1px',
          borderBottom: '1px solid '+theme.palette.neutralLight,
          // background: 'purple',
        },
        checkCell: {
          borderBottom: '1px solid '+theme.palette.neutralLight,
          // background: 'purple',
        },
        /*
        cell: {background: 'purple', borderBottom: '1px solid '+theme.palette.neutralLight,},
        cellAnimation: {background: 'purple',borderBottom: '1px solid '+theme.palette.neutralLight,},
        cellMeasurer: {background: 'purple',borderBottom: '1px solid '+theme.palette.neutralLight,},
        cellPadded: {background: 'purple',borderBottom: '1px solid '+theme.palette.neutralLight,},
        cellUnpadded: {background: 'purple',borderBottom: '1px solid '+theme.palette.neutralLight,},
        check: {background: 'purple',borderBottom: '1px solid '+theme.palette.neutralLight,},
        checkCover: {background: 'purple',borderBottom: '1px solid '+theme.palette.neutralLight,},
        isMultiline: {background: 'purple',borderBottom: '1px solid '+theme.palette.neutralLight,},
        isRowHeader: {background: 'purple',borderBottom: '1px solid '+theme.palette.neutralLight,},
        */
      }
      if (this.props.noborder) {
        styleRow.checkCell = {};
        styleRow.fields = {};
      }
      if (detailsRowProps.item.rowcolor !== undefined && detailsRowProps.item.rowcolor !== '') {
        let color = getColor(detailsRowProps.item.rowcolor, 25);
        // styleRow.root = { marginTop: '-1px', paddingTop: '1px', background: color,fontSize: '14px',  color: theme.palette.neutralPrimary,   borderBottom: '1px solid '+theme.palette.neutralLight,};
        if (this.props.noborder) {
          // styleRow.root = { background: color };
          styleRow.checkCell = { background: color, marginTop: '0px', paddingTop: '0px' };
          styleRow.fields = { background: color };
        } else {
          styleRow.checkCell = { background: color, borderBottom: '1px solid '+theme.palette.neutralLight };
          styleRow.fields = { background: color, marginTop: '-1px', paddingTop: '1px', borderBottom: '1px solid '+theme.palette.neutralLight };
        }
      }
      detailsRowProps.styles = styleRow;
      return defaultRender({ ...detailsRowProps });
    } else {
      return null;
    }
  }

  private generateGroups = (items: IDetailsRow[]): IGroupExtended[] => {
    // console.log(items);
    // if (!items) return [];
    let start = 0;
    let end = items.length - 1;
    let groups: IGroupExtended[] = [];
    let count = 0;
    for (let index = start; index <= end; index++) {
      count += 1;
      if (index === end || items[index]['rowgroup'] !== items[index+1]['rowgroup']) {
        let startIndex = index - count + 1;
        groups.push({ key: 'items' + startIndex + '-' + index, name: items[index]['rowgroupname'] || items[index]['rowgroup'], startIndex, count, color: items[index]['rowgroupcolor'], notes: items[index]['rowgroupnotes'] });
        count = 0;
      }
    }
    // console.log(groups);
    return groups;
  }
  /*
    case 'info': type = MessageBarType.info; break;
    case 'warning': type = MessageBarType.warning; break;
    case 'error': type = MessageBarType.error; break;
  */
  private onRenderHeader = (detailsHeaderProps?: IDetailsHeaderProps, defaultRender?: IRenderFunction<IDetailsHeaderProps>) => {
    if (defaultRender && detailsHeaderProps) {
      detailsHeaderProps.styles = {...detailsHeaderProps.styles, ...{
        root: { height: '34px', paddingTop: '0px', },
        cellIsGroupExpander: { height: '34px', paddingTop: '0px' },
        cellIsCheck: { height: '34px', paddingTop: '0px' },
      }};
      return (
        <Sticky stickyPosition={StickyPositionType.Header}>
          {this.props.message && <MessageBar messageBarType={MessageBarType.info}>{this.props.message}</MessageBar> }
          {this.props.commands && <CommandBar items={this.props.commands} farItems={this.props.commandsRight} styles={{ root: { height: '34px' }}}/> }
          {!this.props.hideHeader ? defaultRender({...detailsHeaderProps}) : <div style={{ /*height: '1px', borderBottom: '1px solid '+theme.palette.neutralLight*/ }}/>}
        </Sticky>
      );
    } else {
      return null
    }
  }

  private onRenderFooter = (detailsFooterProps?: IDetailsFooterProps, defaultRender?: IRenderFunction<IDetailsFooterProps>) => {
    if (this.state.summary) {
      const footerStyle: Partial<IDetailsRowStyles> = {
        root: {
          minHeight: '34px',
          fontWeight: 'bold',
          fontSize: '14px',
          color: theme.palette.neutralPrimary,
        },
        cell: {
          minHeight: '34px',
          paddingTop: '7px',
          paddingBottom: '7px',
        },
      }
      return (
        <DetailsRow
          {...detailsFooterProps}
          columns={detailsFooterProps!.columns as IColumn[]}
          item={this.state.summary}
          itemIndex={-1}
          styles={footerStyle}
        />
      );
    } else {
      return null;
    }
  }

  private onColumnClick = (event?: React.MouseEvent<HTMLElement>, column?: IColumn): void => {
    // console.log('onColumnClick')
    if (column) {
      const { columnsSorted, items } = this.state;
      let newItems: IDetailsRow[] = items.slice();
      const newColumns: IColumn[] = columnsSorted.slice();
      const currColumn: IColumn = newColumns.filter((currCol: IColumn, idx: number) => {
        return column.key === currCol.key;
      })[0];
      newColumns.forEach((newCol: IColumn) => {
        if (newCol === currColumn) {
          currColumn.isSortedDescending = !currColumn.isSortedDescending;
          currColumn.isSorted = true;
        } else {
          newCol.isSorted = false;
          newCol.isSortedDescending = true;
        }
      });
      newItems = this.sortItems(newItems, currColumn.fieldName || '', currColumn.isSortedDescending);
      this.setState({
        sortBy: currColumn.fieldName,
        descending: currColumn.isSortedDescending,
        columnsSorted: newColumns,
        items: newItems
      });
    }
  };

  private sortItems = (items: IDetailsRow[], sortBy: string, descending = false): IDetailsRow[] => {
    // console.log('sortItems')
    // if (!items) return [];
    if (descending) {
      return items.sort((a: IDetailsRow, b: IDetailsRow) => {
        if (a[sortBy] < b[sortBy]) {
          return 1;
        }
        if (a[sortBy] > b[sortBy]) {
          return -1;
        }
        return 0;
      });
    } else {
      return items.sort((a: IDetailsRow, b: IDetailsRow) => {
        if (a[sortBy] < b[sortBy]) {
          return -1;
        }
        if (a[sortBy] > b[sortBy]) {
          return 1;
        }
        return 0;
      });
    }
  };
  
}
