import React from 'react';
import { padNumber } from 'components';
import { DatePicker as DatePickerFabric, DayOfWeek, IDatePickerStrings, DateRangeType, ICalendarProps } from 'office-ui-fabric-react';

const DayPickerStrings: IDatePickerStrings = {
  months: ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль',' Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'],
  shortMonths: ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'],
  days: ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'],
  shortDays: ['ВС', 'ПН', 'ВТ', 'СР', 'ЧТ', 'ПТ', 'СБ'],
  prevMonthAriaLabel: 'Предыдущий месяц - ',
  nextMonthAriaLabel: 'Следующий месяц - ',
  prevYearAriaLabel: 'Предыдущий год - ',
  nextYearAriaLabel: 'Следующий год - ',
  goToToday: 'Текущая дата',
};

interface IDatePickerProps {
  defaultValue?: string;
  disabled?: boolean;
  onChange?: (date: string) => void; 
  label?: string;
  selectRange?: string;
  underlined?: boolean;
}

interface IDatePickerState {
  value?: Date;
  valueString: string;
}

export class DatePicker extends React.Component<IDatePickerProps, IDatePickerState> {

  constructor(props: IDatePickerProps) {
    super(props);
    let valueString:string | undefined = this.props.defaultValue;
    let value:Date | undefined;
    if (valueString === '' || valueString === null) {
      value = undefined
      valueString = ''
    } else if (valueString === undefined) {
      value = new Date();
      valueString = value.getFullYear().toString() + '-' + padNumber(value.getMonth() + 1) + '-' + padNumber(value.getDate());
    } else {
      const day = Math.max(1, Math.min(31, parseInt(valueString.substr(8, 2), 10)))
      const month = Math.max(1, Math.min(12, parseInt(valueString.substr(5, 2), 10))) - 1
      const year = parseInt(valueString.substr(0, 4), 10)
      value = new Date(year, month, day);
    }
    this.state = {
      value,
      valueString
    };
  }

  public render() {
    var calendarProps: ICalendarProps = {
      dateRangeType: this.props.selectRange === 'week' ? DateRangeType.Week : DateRangeType.Day,
      strings: DayPickerStrings,
    }
    return (
      <DatePickerFabric
        label={this.props.label}
        style={{width: this.props.selectRange === 'week' ? '190px' : '110px'}} // don't tell me what to do, microsoft
        allowTextInput={true}
        disableAutoFocus={true}
        showMonthPickerAsOverlay={true}
        showGoToToday={false}
        firstDayOfWeek={DayOfWeek.Monday}
        strings={DayPickerStrings}
        placeholder='ДД.ММ.ГГГГ'
        formatDate={this.onFormatDate}
        value={this.state.value}
        onSelectDate={this.onSelectDate}
        parseDateFromString={this.onParseDateFromString}
        disabled={this.props.disabled}
        calendarProps={calendarProps}
        underlined={this.props.underlined}
      />
    );
  }

  private onFormatDate = (date?: Date | undefined): string => {
    if (date){
      if (this.props.selectRange === 'week') {
        var day = date.getDay();
        var diff = date.getDate() - day + (day === 0 ? -6:1);
        var monday = new Date(date.setDate(diff));
        var range = padNumber(monday.getDate())  + '.' + padNumber(monday.getMonth() + 1)  + '.' + monday.getFullYear().toString();
        monday.setDate(monday.getDate() +6);
        range += ' - ' + padNumber(monday.getDate())  + '.' + padNumber(monday.getMonth() + 1)  + '.' + monday.getFullYear().toString();
        return range;
      } else {
        return padNumber(date.getDate())  + '.' + padNumber(date.getMonth() + 1)  + '.' + date.getFullYear().toString();
      }
    } else {
      return '';
    }
  };

  private onParseDateFromString = (value: string): Date => {
    const date = this.state.value || new Date();
    const values = (value || '').trim().split(/[.,/\\]+/);
    const day = values.length > 0 ? Math.max(1, Math.min(31, parseInt(values[0], 10))) : date.getDate();
    const month = values.length > 1 ? Math.max(1, Math.min(12, parseInt(values[1], 10))) - 1 : date.getMonth();
    let year = values.length > 2 ? parseInt(values[2], 10) : date.getFullYear();
    if (year < 100) {
      year += date.getFullYear() - (date.getFullYear() % 100);
    }
    return new Date(year, month, day);
  };

  private onSelectDate = (date: Date | null | undefined): void => {
    let newdate = '';
    if(date !== null && date !== undefined ) {
      newdate = date.getFullYear().toString() + '-' + padNumber(date.getMonth() + 1) + '-' + padNumber(date.getDate());
    }
    if (date === null) {
      date = undefined;
    }
    this.setState({ value: date, valueString: newdate });
    if(this.props.onChange !== undefined) {
      this.props.onChange(newdate);
    }
  };

}
