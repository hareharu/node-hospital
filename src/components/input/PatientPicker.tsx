import React from 'react';
import { NormalPeoplePicker, IBasePickerSuggestionsProps, IInputProps, IPersonaProps } from 'office-ui-fabric-react';
import { showMessage } from 'components';

interface IPatientPickerProps {
  onChange?: (kod?: string) => void; 
}

interface IPatient extends IPersonaProps {
  key?: string;
}

export class PatientPicker extends React.Component<IPatientPickerProps> {
  public render() {
    const propsInput: IInputProps = {
      placeholder: 'Введите ФИО или код пациента',
    }
    const propsSuggestions: IBasePickerSuggestionsProps = {
      className: 'wh-Patient-picker',
      loadingText: 'Обработка запроса',
      noResultsFoundText: 'По вашему запросу пациентов не найдено',
    }
    return (
      <NormalPeoplePicker
        styles={{ root: { width: '256px' }, text: { height: '32px' } }}
        onResolveSuggestions={this.onPatientSearch}
        onChange={this.onPatientSelect}
        resolveDelay={300}
        itemLimit={1}
        inputProps={propsInput}
        pickerSuggestionsProps={propsSuggestions}
      />
    );
  }

  private onPatientSelect = (items?: IPatient[]): void => {
    if (this.props.onChange !== undefined) {
      if (items && items[0]) {
        this.props.onChange(items[0].key);
      } else{
        this.props.onChange(undefined);
      }
    }
  };

  private onPatientSearch = (filterText: string): IPatient[] | Promise<IPatient[]> => {
    if (filterText) {
      return this.getPatientList(filterText);
    } else {
      return [];
    }
  };

  private getPatientList = (searchstring: any):Promise<IPatient[]> => {
    searchstring = searchstring.split(' ', 3);
    let pcode; let fam; let nam; let oth;
    if (/\d/.test(searchstring[0])) { // предположим, что если в строке есть цифры, то это код пациента
      pcode = searchstring[0];
    } else {
      fam = searchstring[0];
      nam = searchstring[1];
      oth = searchstring[2];
    }
    return fetch('/api/patient/picker', {
      credentials: 'same-origin',
      method: 'POST',
      body: JSON.stringify({ pcode, fam, nam, oth }),
      headers: {'Content-Type': 'application/json'}
    }).then(response => { if (!response.ok) { throw Error(response.statusText); }
      return response.json();
    }).then(json => { if (json.status === 'bad') { throw Error(json.error); }
      return json.data       
    }).catch(err => showMessage(err));
  }

}
