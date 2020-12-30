import React from 'react';
import { Icon, TooltipHost } from 'office-ui-fabric-react';
import { theme, Loading, dateToString, TabsLinks, Hide, Text } from 'components';

export interface IResultRZN {
  errorType?: string;
  errorText?: string;
  patients: IPatient[];
}

interface IPatient {
  virtualId: string;
  enp: string;
  personalDataList: {
    personalData: [
      {
        surname: string;
        name: string;
        patronymic: string;
        birthDate: string;
        sex: string;
        SNILS: string;
        birthPlaceName: string;
        dateBegin: string;
        dateEnd?: string;
        deathDate?: string;
      }
    ];
  };
  documentList: {
    document: [
      {
        type: string;
        serial: string;
        number: string;
        docDate: string;
        issueOrganizationName: string;
        dateBegin: string;
        dateEnd?: string;
      }
    ];
  };
  insuranceList: {
    insurance: [
      {
        validationDocumentType: string;
        insuranceOrganization: string;
        policyNumber: string;
        OKATO: string;
        insuranceDate: string;
        policyDate: string;
        policyDateEnd?: string;
      }
    ];
  };
  attachmentList: {
    attachment: [
      {
        type: string;
        idMu: number;
        muName: string;
        idSector: number;
        sectorName: string;
        dateBegin: string;
        dateEnd?: string;
      }
    ];
  };
  addressRegList: {
    address: [
      {
        registrationDate: string,
        codeOKATO: string;
        postCode: number;
        codeAddress: number;
        cityName: string;
        streetName: string;
        houseNumber: string;
        apartmentNumber: string;
        dateBegin: string;
        dateEnd?: string;
      }
    ];
  };
  addressFactList: {
    address: [
      {
        registrationDate: string;
        codeOKATO: string;
        postCode: number;
        codeAddress: number;
        cityName: string;
        streetName: string;
        houseNumber: string;
        apartmentNumber: string;
        dateBegin: string;
        dateEnd?: string;
      }
    ];
  };
  regionalBenefitList: {
    benefit: [
      {
        benefitCategory: {
          id: number;
          benefitcategoryname: string;
        };
        benefitdocname: string;
        serialAndNumber: string;
        dateBegin: string;
        dateEnd?: string;
      }
    ];
  };
  federalBenefitList: {
    benefit: [
      {
        benefitCategory: {
          id: number;
          benefitcategoryname: string;
        };
        benefitdocname: string;
        serialAndNumber: string;
        dateBegin: string;
        dateEnd?: string;
      }
    ];
  };
}

interface IPatientRZNProps {
  loading?: boolean;
  result?: IResultRZN;
}

interface IPatientRZNState {
  loading?: boolean;
  result?: IResultRZN;
  index: number;
}

export class PatientRZN extends React.Component<IPatientRZNProps, IPatientRZNState> {

  constructor(props: IPatientRZNProps) {
    super(props);
    const result= this.props.result;
    this.state = {
      loading: false,
      result,
      index: 0,
    };
  }

  static getDerivedStateFromProps(props: IPatientRZNProps, state: IPatientRZNState) { // getDerivedStateFromProps с несколькими проверками
    let update: IPatientRZNState = { index: state.index };
    if (props.result !== state.result) {
      update.result = props.result;
      update.index = 0;
    }
    if (props.loading !== undefined && props.loading !== state.loading) {
      update.loading = props.loading;
    }
    return Object.keys(update).length ? update : null;
  }

  private onRenderTooltip = (list:string[]) => {
    return <><p>Предыдущие значения:</p><ul>{list.map(item => { return <li key={Math.random().toString()}>{item}</li> })}</ul></>
  }

  public render() {

    let personalDataN0:string[] = [];
    let personalDataN1;

    let personalDataB0:string[] = [];
    let personalDataB1;

    let personalDataS0:string[] = [];
    let personalDataS1;

    let document0:string[] = [];
    let document1;
    let document2;

    let insurance0:string[] = [];
    let insurance1;
    let insurance2;

    let attachment0:string[] = [];
    let attachment1;
    let attachment2;

    let addressR0:string[] = [];
    let addressR1;
    let addressR2;

    let addressF0:string[] = [];
    let addressF1;

    let benefitR0:string[] = [];
    let benefitR1;
    let benefitR2;

    let benefitF0:string[] = [];
    let benefitF1;
    let benefitF2;

    let status: string = '';
    let dateend: string | undefined = undefined;
    let datesend: string[] = [];

    let links: string[] = [];

    

    if (this.state.result && this.state.result.patients && this.state.result.patients[this.state.index]) {

      this.state.result.patients.forEach((patient, index) => { links.push('Пациент '+(index+1)) })

      if (this.state.result.patients[this.state.index].personalDataList) {

        this.state.result.patients[this.state.index].personalDataList.personalData.forEach(personalData => {
          if (personalData.dateEnd) {
            datesend.push(personalData.dateEnd);
          }
          if (personalData.deathDate) {
            dateend = personalData.deathDate;
            status = 'в связи со смертью пациента';
          }
        });

        if (this.state.result.patients[this.state.index].personalDataList.personalData.length === datesend.length) {//==
          if (status.length === 0) {//==
            datesend.sort((a,b) => (a > b) ? 1 : 0); 
            dateend = datesend[0];
          }
        }

        this.state.result.patients[this.state.index].personalDataList.personalData.forEach(personalData => {
          if (personalData.dateEnd && personalData.dateEnd !== dateend) {
            personalDataN0.push(dateToString(personalData.dateBegin) + '-' +dateToString(personalData.dateEnd) + ' ' + personalData.surname + ' ' + personalData.name + ' ' + personalData.patronymic);
            personalDataB0.push(dateToString(personalData.dateBegin) + '-' +dateToString(personalData.dateEnd) + ' ' + dateToString(personalData.birthDate) + ' '+ personalData.birthPlaceName);
            personalDataS0.push(dateToString(personalData.dateBegin) + '-' +dateToString(personalData.dateEnd) + ' ' + personalData.SNILS);
          } else {
            personalDataN1 = personalData.surname + ' ' + personalData.name + ' ' + personalData.patronymic;
            personalDataB1 = dateToString(personalData.birthDate) + ' '+ personalData.birthPlaceName;
            personalDataS1 = personalData.SNILS;
          }
        });

        for(var i = 0; i < personalDataN0.length; i++) {
          if (personalDataN0[i].substr(22) === personalDataN1) {
            personalDataN0.splice(i, 1);
            i--;
          }
        }

        for(i = 0; i < personalDataB0.length; i++) {
          if (personalDataB0[i].substr(22) === personalDataB1) {
            personalDataB0.splice(i, 1);
            i--;
          }
        }

        for(i = 0; i < personalDataS0.length; i++) {
          if (personalDataS0[i].substr(22) === personalDataS1) {
            personalDataS0.splice(i, 1);
            i--;
          }
        }
      
      }

      if (this.state.result.patients[this.state.index].documentList) {
        this.state.result.patients[this.state.index].documentList.document.forEach(document => {
          if (document.dateEnd && document.dateEnd !== dateend) {
            document0.push(dateToString(document.dateBegin) + '-' +dateToString(document.dateEnd) + ' ' + document.serial + ' ' + document.number + ' ' + document.type + ' ' + document.issueOrganizationName);
          } else {
            document1 = document.serial + ' ' + document.number + ' ' + document.type;
            document2 = dateToString(document.docDate) + ' ' + document.issueOrganizationName;
          }
        });
      }

      if (this.state.result.patients[this.state.index].insuranceList) {
        this.state.result.patients[this.state.index].insuranceList.insurance.forEach(insurance => {
          if (insurance.policyDateEnd && insurance.policyDateEnd !== dateend) {
            insurance0.push(dateToString(insurance.policyDate) + '-' +dateToString(insurance.policyDateEnd) + ' ' + insurance.policyNumber + ' ' + insurance.validationDocumentType + ' '+ insurance.insuranceOrganization);
          } else {
            insurance1 = insurance.policyNumber + ' ' + insurance.validationDocumentType;
            insurance2 = dateToString(insurance.policyDate) + ' '+ insurance.insuranceOrganization;
          }
        });
      }

      if (this.state.result.patients[this.state.index].attachmentList) {
        this.state.result.patients[this.state.index].attachmentList.attachment.forEach(attachment => {
          if (attachment.dateEnd && attachment.dateEnd !== dateend) {
            attachment0.push(dateToString(attachment.dateBegin) + '-' +dateToString(attachment.dateEnd) + ' ' + attachment.muName + ' (' + attachment.type + ') ' + attachment.sectorName);
          } else {
            attachment1 = attachment.muName + ' (' + attachment.type + ')';
            attachment2 = dateToString(attachment.dateBegin) + ' '+ attachment.sectorName;
          }
        });
      }

      if (this.state.result.patients[this.state.index].addressRegList) {
        this.state.result.patients[this.state.index].addressRegList.address.forEach(address => {
          if (address.dateEnd && address.dateEnd !== dateend) {
            addressR0.push(dateToString(address.dateBegin) + '-' +dateToString(address.dateEnd) + ' ' + address.postCode + ' ' + address.cityName + ' ' + address.streetName + ' ' + address.houseNumber + ' ' + address.apartmentNumber);
          } else {
            addressR1 = address.postCode + ' ' + address.cityName + ' ' + address.streetName + ' ' + address.houseNumber + ' ' + address.apartmentNumber;
            addressR2 = 'Дата регистрации ' + dateToString(address.registrationDate);
          }
        });
      }

      if (this.state.result.patients[this.state.index].addressFactList) {
        this.state.result.patients[this.state.index].addressFactList.address.forEach(address => {
          if (address.dateEnd && address.dateEnd !== dateend) {
            addressF0.push(dateToString(address.dateBegin) + '-' +dateToString(address.dateEnd) + ' ' + address.postCode + ' ' + address.cityName + ' ' + address.streetName + ' ' + address.houseNumber + ' ' + address.apartmentNumber);
          } else {
            addressF1 = address.postCode + ' ' + address.cityName + ' ' + address.streetName + ' ' + address.houseNumber + ' ' + address.apartmentNumber;
          }
        });
      }

      if (this.state.result.patients[this.state.index].regionalBenefitList) {
        this.state.result.patients[this.state.index].regionalBenefitList.benefit.forEach(benefit => {
          if (benefit.benefitCategory) {
            if (benefit.dateEnd && benefit.dateEnd !== dateend) {
              benefitR0.push(dateToString(benefit.dateBegin) + '-' +dateToString(benefit.dateEnd) + ' ' + benefit.benefitCategory.benefitcategoryname + ' ' + benefit.serialAndNumber + ' ' + benefit.benefitdocname);
            } else {
              benefitR1 = benefit.benefitCategory.benefitcategoryname;
              benefitR2 = dateToString(benefit.dateBegin) + ' ' + benefit.serialAndNumber + ' ' + benefit.benefitdocname;
            }
          }
        });
      }

      if (this.state.result.patients[this.state.index].federalBenefitList) {
        this.state.result.patients[this.state.index].federalBenefitList.benefit.forEach(benefit => {
          if (benefit.benefitCategory) {
            if (benefit.dateEnd && benefit.dateEnd !== dateend) {
              benefitF0.push(dateToString(benefit.dateBegin) + '-' +dateToString(benefit.dateEnd) + ' ' + benefit.benefitCategory.benefitcategoryname + ' ' + benefit.serialAndNumber + ' ' + benefit.benefitdocname);
            } else {
              benefitF1 = benefit.benefitCategory.benefitcategoryname;
              benefitF2 = dateToString(benefit.dateBegin) + ' ' + benefit.serialAndNumber + ' ' + benefit.benefitdocname;
            }
          }
        });
      }

    }
//== status.length == 0
    return (
      <Loading loading={this.state.loading}>
        <Hide condition={!this.state.result || (this.state.result && !this.state.result.patients) || (this.state.result && this.state.result.patients.length < 2) ? true : false }>
          <Text color={theme.palette.redDark} text='По вашему запросу найдено несколько записей в РЗН'/>
          <TabsLinks links={links} onClick={(value) => this.setState({ index: value })} tabIndex={this.state.index}/>
        </Hide>
        {this.state.result !== undefined && this.state.result.errorType !== undefined && this.state.result.errorText !== undefined && <table style={{ borderSpacing: '10px' }}><tbody>
          <tr><td/><td/><td style={{ fontSize: 18, color: theme.palette.redDark }}>{this.state.result.errorType}</td></tr>
          <tr><td/><td/><td style={{ color: theme.palette.redDark }}>{this.state.result.errorText}</td></tr>
          </tbody></table>
        }
        {this.state.result !== undefined && this.state.result.patients && this.state.result.patients[this.state.index] && this.state.result.patients[this.state.index].personalDataList !== undefined &&  <table style={{ borderSpacing: '10px' }}>
          <tbody>
            {dateend && <tr><td/><td/><td style={{ fontSize: 18, color: theme.palette.redDark }}>Запись в РЗН закрыта {dateToString(dateend) + ' ' + status}</td></tr>}
            {dateend && status.length === 0 && <tr><td/><td/><td style={{ color: theme.palette.redDark }}>у пациента нет действующего полиса либо он выбыл в другой регион</td></tr>}
            <tr>
              <td style={{ width:'15%', textAlign: 'right'}}>ФИО:</td>
              <td style={{ width:'20px' }}>{personalDataN0.length > 0 && <TooltipHost tooltipProps={{ maxWidth: '600px', onRenderContent: () => this.onRenderTooltip(personalDataN0) }}><Icon iconName='icon-help-circle'/></TooltipHost>}</td>
              <td>{personalDataN1}</td>
            </tr>
            <tr>
              <td style={{ width:'15%', textAlign: 'right' }}>ДР:</td>
              <td style={{ width:'20px' }}>{personalDataB0.length > 0 && <TooltipHost tooltipProps={{ maxWidth: '600px', onRenderContent: () => this.onRenderTooltip(personalDataB0) }}><Icon iconName='icon-help-circle'/></TooltipHost>}</td>
              <td>{personalDataB1}</td>
            </tr>
            <tr>
              <td style={{ width:'15%', textAlign: 'right' }}>СНИЛС:</td>
              <td style={{ width:'20px' }}>{personalDataS0.length > 0 && <TooltipHost tooltipProps={{ maxWidth: '600px', onRenderContent: () => this.onRenderTooltip(personalDataS0) }}><Icon iconName='icon-help-circle'/></TooltipHost>}</td>
              <td>{personalDataS1}</td>
            </tr>
            <tr>
              <td style={{ width:'15%', textAlign: 'right' }}>Документ:</td>
              <td style={{ width:'20px' }}>{document0.length > 0 && <TooltipHost tooltipProps={{ maxWidth: '600px', onRenderContent: () => this.onRenderTooltip(document0) }}><Icon iconName='icon-help-circle'/></TooltipHost>}</td>
              <td>{document1}</td>
            </tr><tr><td/><td/><td>{document2}</td></tr>
            <tr>
              <td style={{ width:'15%', textAlign: 'right' }}>Полис:</td>
              <td style={{ width:'20px' }}>{insurance0.length > 0 && <TooltipHost tooltipProps={{ maxWidth: '600px', onRenderContent: () => this.onRenderTooltip(insurance0) }}><Icon iconName='icon-help-circle'/></TooltipHost>}</td>
              <td>{insurance1}</td>
            </tr><tr><td/><td/><td>{insurance2}</td></tr>
            <tr>
              <td style={{ width:'15%', textAlign: 'right' }}>Прикрепление:</td>
              <td style={{ width:'20px' }}>{attachment0.length > 0 && <TooltipHost tooltipProps={{ maxWidth: '600px', onRenderContent: () => this.onRenderTooltip(attachment0) }}><Icon iconName='icon-help-circle'/></TooltipHost>}</td>
              <td>{attachment1}</td>
            </tr><tr><td/><td/><td>{attachment2}</td></tr>
            <tr>
              <td style={{ width:'15%', textAlign: 'right' }}>Адрес&nbsp;прописки:</td>
              <td style={{ width:'20px' }}>{addressR0.length > 0 && <TooltipHost tooltipProps={{ maxWidth: '600px', onRenderContent: () => this.onRenderTooltip(addressR0) }}><Icon iconName='icon-help-circle'/></TooltipHost>}</td>
              <td>{addressR1}</td>
            </tr><tr><td/><td/><td>{addressR2}</td></tr>
            <tr style={{ display: addressF1 ? 'table-row' : 'none' }}>
              <td style={{ width:'15%', textAlign: 'right' }}>Адрес&nbsp;проживания:</td>
              <td style={{ width:'20px' }}>{addressF0.length > 0 && <TooltipHost tooltipProps={{ maxWidth: '600px', onRenderContent: () => this.onRenderTooltip(addressF0) }}><Icon iconName='icon-help-circle'/></TooltipHost>}</td>
              <td>{addressF1}</td>
            </tr>     
            <tr style={{ display:'none' }}>
              <td style={{ width:'15%', textAlign: 'right' }}>Регион.&nbsp;льготы:</td>
              <td style={{ width:'20px' }}>{benefitR0.length > 0 && <TooltipHost tooltipProps={{ maxWidth: '600px', onRenderContent: () => this.onRenderTooltip(benefitR0) }}><Icon iconName='icon-help-circle'/></TooltipHost>}</td>
              <td>{benefitR1}</td>
            </tr>
            <tr style={{ display:'none' }}><td/><td/><td>{benefitR2}</td></tr>
            <tr style={{ display:'none' }}>
              <td style={{ width:'15%', textAlign: 'right' }}>Федерал.&nbsp;льготы:</td>
              <td style={{ width:'20px' }}>{benefitF0.length > 0 && <TooltipHost tooltipProps={{ maxWidth: '600px', onRenderContent: () => this.onRenderTooltip(benefitF0) }}><Icon iconName='icon-help-circle'/></TooltipHost>}</td>
              <td>{benefitF1}</td>
            </tr>
            <tr style={{ display:'none' }}><td/><td/><td>{benefitF2}</td></tr>
          </tbody>
        </table>}
      </Loading>
    );
  }
}
