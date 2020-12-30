
import React from 'react';

import { TagPicker as TagPickerFabric, IBasePicker, ITag, Label } from 'office-ui-fabric-react';
import { showMessage, niluuid } from 'components';

interface ITagPickerProps {
  onChange?: ((value: string) => void) | ((value, name) => void);
  api?: string;
  defaultValue?: string | number;
  defaultKey?: string | number;
  defaultText?: string;
  disabled?: boolean;
  width?: number;
  value?: string | number;
  label?: string;
  limit?: number;
}

interface ITagPickerState {
  api?: string;
  tags: ITag[];
  //options: IDropdownOption[];
  //onChange?: (event: React.FormEvent<HTMLDivElement>, item?: IDropdownOption) => void;
  defaultSelectedKey?: string | number;
  value?: string | number;
  dropdownWidth: number;
}

export class TagPicker extends React.Component<ITagPickerProps, ITagPickerState> {

  constructor(props: ITagPickerProps) {
    super(props);
    //let options:IDropdownOption[] = [];
    let defaultSelectedKey: string | number | undefined = this.props.defaultValue || niluuid();
    let defaultKey: string | number | undefined = this.props.defaultKey || niluuid();
    let value = this.props.value;
    let api = this.props.api;
    if (!this.props.defaultValue) {
      defaultSelectedKey = defaultKey;
    }
    var tags = []
    let dropdownWidth = this.props.width || 300;
    /*
    let onChange: any;
    onChange = (event: React.FormEvent<HTMLDivElement>, item: IDropdownOption) => {
      if (this.props.onChange) {
        //console.log(item)
        this.props.onChange(item.key.toString(), item.text);
      }
    }
    */
    this.state = {
      api,
      tags,
      value,
      //options,
      //onChange,
      defaultSelectedKey,
      dropdownWidth,
    };
  }

  private onItemSelected = (item: ITag): ITag | null => {
    // console.log('onItemSelected')
    if (this.picker.current && this.listContainsDocument(item, this.picker.current.items)) {
      // console.log('null')
      return null;

    }
    // console.log(item)
    return item;
  };

  private getTextFromItem(item: ITag): string {
    // console.log('getTextFromItem');
    // console.log(item.name);
    return item.name;
  }

  private listContainsDocument(tag: ITag, tagList?: ITag[]) {
    if (!tagList || !tagList.length || tagList.length === 0) {
      return false;
    }
    return tagList.filter(compareTag => compareTag.key === tag.key).length > 0;
  }

  private onSetFocusButtonClicked = (): void => {
    if (this.picker.current) {
      this.picker.current.focusInput();
    }
  };

  private onFilterChanged = (filterText: string, tagList?: ITag[]): ITag[] => {
    //console.log('onFilterChanged');
    if (this.props.onChange) {
      this.props.onChange(filterText, filterText);
    }
    //console.log(filterText);
    return filterText
      ? this.state.tags
          .filter(tag => tag.name.toLowerCase().indexOf(filterText.toLowerCase()) > -1)
          .filter(tag => !this.listContainsDocument(tag, tagList))
      : [];
  };

  public async componentDidUpdate(prevProps: ITagPickerProps) {
    // console.log('Dropdown componentDidUpdate '+this.props.value);
    // console.log(prevProps);
 
      if (this.props.api && this.props.api !== prevProps.api) {


    
          this.setState({ api: this.props.api});
          fetch(this.props.api,{credentials: 'same-origin'})
          .then(response => { 
            if (!response.ok) {
              throw Error(response.statusText);
            }
            return response.json();
          })
          .then(json => {
            if (json.status !== 'ok') {
              throw Error(json.message);
            }
            const newTags: ITag[] = json.data.map(item => ({ key: item.key, name: item.text }));
            this.setState({ tags: newTags });
            // sнужно сбросить фильтр
            if (this.props.onChange) {
              this.props.onChange('', '');
            }
          })
          .catch(err => showMessage(err.toString()));
        

       
      }
   
  }

/*
  public async componentDidUpdate(prevProps: IDropdownProps) {
    if (!this.props.api) {
      if (this.props.options && this.props.options !== prevProps.options) {
        this.setState({options: this.props.options});
      }
      if (this.props.defaultValue && this.props.defaultValue !== this.state.defaultSelectedKey) {
        this.setState({defaultSelectedKey: this.props.defaultValue});
      }
    } else {
      if (this.props.api && this.props.api !== prevProps.api) {
        // console.log('api changed '+this.props.label)
        const getIems = async (api: string) => {
          let response = await fetch(api, { credentials: 'same-origin' });
          if (!response.ok)  throw Error(response.statusText);
          let json = await response.json();
          if (json.status === 'bad')  throw Error(json.error);
          return json.data;
        }
        if (this.props.api !== 'year' && this.props.api !== 'month' && this.props.api !== 'month0') {
          var result = await getIems('/api/' + this.props.api);
          if (this.props.defaultKey || this.props.defaultText) {
            // console.log('return 1');
            this.setState({ api: this.props.api, options: [ ...[{ key: this.props.defaultKey || niluuid(), text: this.props.defaultText || '-' }], ...result ] });
            if (this.props.onChange) this.props.onChange((this.props.defaultKey || niluuid()).toString(), this.props.defaultText || '-');
          } else {
            if (!this.props.defaultValue) {
              // console.log('return 2');
              this.setState({ api: this.props.api, options: result, defaultSelectedKey: result[0].key });
            } else {
              // console.log('return 3');
              this.setState({ api: this.props.api, options: result });
            }
          }
         
        } else {
          // console.log('null 1 '+this.props.label)
          // return null;
        }
      } else {
        // console.log('null 2 '+this.props.label)
        // return null;
      }
    }
  }
*/

  public componentDidMount() {
    if (this.props.api) {
      this.setState({ api: this.props.api});
      fetch(this.props.api,{credentials: 'same-origin'})
      .then(response => { 
        if (!response.ok) {
          throw Error(response.statusText);
        }
        return response.json();
      })
      .then(json => {
        if (json.status !== 'ok') {
          throw Error(json.message);
        }
        const newTags: ITag[] = json.data.map(item => ({ key: item.key, name: item.text }));
        this.setState({ tags: newTags });
      })
      .catch(err => showMessage(err.toString()));
    }
  }
  private picker = React.createRef<IBasePicker<ITag>>();

  public render() {
    return (
      this.props.label ?
        <div>
          <Label>{this.props.label}</Label>
          {this.renderPicker()}
        </div>
      :
        this.renderPicker()
    );
  }

  private renderPicker = () => {
      return (
        <TagPickerFabric
          // onItemSelected={this.onItemSelected}
          componentRef={this.picker}
          onResolveSuggestions={this.onFilterChanged}
          getTextFromItem={this.getTextFromItem}
          pickerSuggestionsProps={{
  
            noResultsFoundText: 'Будет добавлен новый элемент',
          }}
          
          inputProps={{
            // onBlur: (ev: React.FocusEvent<HTMLInputElement>) => console.log('onBlur called'),
            onFocus: (ev: React.FocusEvent<HTMLInputElement>) => {
              
              // console.log('onFocus called');

              if (this.picker.current) {
                this.picker.current.focusInput();
              }


          },
          }}
          itemLimit={this.props.limit||1}
          disabled={this.props.disabled}
          onChange={(items)=> {
            // console.log('onChange');
            if (items && items[0]) {
              // console.log(items[0].key);
              if (this.props.onChange) {
                this.props.onChange(items[0].key.toString(), items[0].name);
              }
            } else {
              // console.log('none');
              if (this.props.onChange) {
                this.props.onChange('', '');
              }
            }
           

          }}
        />
      );
  }
  
}
