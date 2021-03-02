import React from 'react';
import { getTimeDiff, padNumber } from 'components';
import { IColumn, Icon, Link, TooltipHost } from 'office-ui-fabric-react';

export function renderTooltip(item?: any, index?: number, column?: IColumn) {
  if (column !== undefined && column.fieldName !== undefined && item[column.fieldName]) {
    if (item[column.fieldName+'tip']) {
      return (<TooltipHost content={item[column.fieldName+'tip']} tooltipProps={{ maxWidth: '600px' }}>{item[column.fieldName]} <Icon iconName='icon-help-circle'/></TooltipHost>);
    } else {
      return item[column.fieldName];
    }
  } else {
    return '-';
  }
}

export function renderLink(item?: any, index?: number, column?: IColumn) {
  if (column !== undefined && column.fieldName !== undefined && item[column.fieldName]) {
    if (item[column.fieldName+'url']) {
      return <Link target='_blank' href={item[column.fieldName+'url']}>{item[column.fieldName]}</Link>;
    } else {
      return item[column.fieldName];
    }
  } else {
    return '-';
  }
}

export function renderNull(item?: any, index?: number, column?: IColumn) {
  if (column !== undefined && column.fieldName !== undefined && item[column.fieldName]) {
    return item[column.fieldName];
  } else {
    return '-';
  }
}

export function renderBoolean(item?: any, index?: number, column?: IColumn) {
  if (column !== undefined && column.fieldName !== undefined && item[column.fieldName]) {
    if ( item[column.fieldName] === 'true') {
      return 'да';
    } else {
      return 'нет';
    }
  } else {
    return '-';
  }
}

export function renderBooleanCheck(item?: any, index?: number, column?: IColumn) {
  if (column !== undefined && column.fieldName !== undefined && item[column.fieldName]) {
    if ( item[column.fieldName] === 'true') {
      return <Icon iconName='icon-check' style={{ verticalAlign: 'middle', width: '16px', height: '16px' }} className='wh-Icon-display-icon'/>;
    } else {
      return '';
    }
  } else {
    return '';
  }
}

export function renderHomeItemSide(item?: any, index?: number, column?: IColumn) {
  if (column !== undefined && column.fieldName !== undefined && item[column.fieldName] !== null) {
    let type: string;
    switch (item[column.fieldName]) {
      case 'top': type = 'Верхняя строка'; break;
      case 'bottom': type = 'Подвал'; break;
      case 'left': type = 'Левый столбец'; break;
      case 'right': type = 'Правый столбец'; break;
      default: type = '-';
    }
    return type;
  } else {
    return '-';
  }
}

export function renderHomeItemType(item?: any, index?: number, column?: IColumn) {
  if (column !== undefined && column.fieldName !== undefined && item[column.fieldName] !== null) {
    let type: string;
    switch (item[column.fieldName]) {
      case 'header': type = 'Заголовок'; break;
      case 'text': type = 'Текст'; break;
      case 'image': type = 'Изображение'; break;
      case 'link': type = 'Ссылка'; break;
      case 'notice': type = 'Объявление'; break;
      case 'search': type = 'Поисковик'; break;
      default: type = '-';
    }
    return type;
  } else {
    return '-';
  }
}

export function renderPanelSize(item?: any, index?: number, column?: IColumn) {
  if (column !== undefined && column.fieldName !== undefined && item[column.fieldName] !== null) {
    let type: string;
    switch (item[column.fieldName]) {
      case 'C': type = 'custom'; break;
      case 'F': type = 'smallFluid'; break;
      case 'S': type = 'Маленькая'; break;
      case 'M': type = 'Средняя'; break;
      case 'L': type = 'Большая'; break;
      case 'XL': type = 'Огромная'; break;
      default: type = '-';
    }
    return type;
  } else {
    return '-';
  }
}

export function renderIcon(item?: any, index?: number, column?: IColumn) {
  if (column !== undefined && column.fieldName !== undefined && item[column.fieldName] !== null && item[column.fieldName].length > 0) {
    return <Icon iconName={item[column.fieldName]} style={{ verticalAlign: 'middle', width: '16px', height: '16px' }} className={'wh-Icon-display-'+item[column.fieldName].substr(0, item[column.fieldName].indexOf('-'))}/>
  } else {
    return '';
  }
}

export function renderCPU(item?: any, index?: number, column?: IColumn) {
  if (column !== undefined && column.fieldName !== undefined && item[column.fieldName] !== null) {
    return Math.round(item[column.fieldName]) + ' %';
  } else {
    return '-';
  }
}

export function renderRAM(item?: any, index?: number, column?: IColumn) {
  if (column !== undefined && column.fieldName !== undefined && item[column.fieldName] !== null) {
    return Math.round(item[column.fieldName]/1024/1024) + ' МБ';
  } else {
    return '-';
  }
}

export function renderExpired(item?: any, index?: number, column?: IColumn) {
  if (column !== undefined && column.fieldName !== undefined && item[column.fieldName] !== null) {
    if (new Date().getTime() < item[column.fieldName]) {
      return getTimeDiff(item[column.fieldName])
    } else {
      return '-';
    }
  } else {
    return '-';
  }
}

export function renderUptime(item?: any, index?: number, column?: IColumn) {
  if (column !== undefined && column.fieldName !== undefined && item[column.fieldName] !== null) {
    if (new Date().getTime() > item[column.fieldName]) {
      return getTimeDiff(item[column.fieldName])
    } else {
      return '-';
    }
  } else {
    return '-';
  }
}

export function renderFloat(item?: any, index?: number, column?: IColumn) {
  if (column !== undefined && column.fieldName !== undefined && item[column.fieldName] !== null) {
    if (item[column.fieldName] > 0) {
      return item[column.fieldName].toFixed(2);
    } else {
      return '-';
    }
  } else {
    return '-';
  }
}

export function renderTime(item?: any, index?: number, column?: IColumn) {
  if (column !== undefined && column.fieldName !== undefined && item[column.fieldName] !== null) {
    if (item[column.fieldName] > 0) {
      const h = Math.floor(item[column.fieldName]/3600);
      const m = item[column.fieldName]/60%60;
      return padNumber(h) + ':' + padNumber(m);
    } else {
      return '-';
    }
  } else {
    return '-';
  }
}

export function renderTimeInterval(item?: any, index?: number, column?: IColumn) {
  if (column !== undefined && column.fieldName !== undefined && item[column.fieldName] !== null) {
    const times = item[column.fieldName].split("-");
    if (!isNaN(times[0]) && !isNaN(times[1])) {
    let time1 = '';
    let time2 = '';
    if (times[0] > 0) {
      const h = Math.floor(times[0]/3600);
      const m = times[0]/60%60;
      time1 = padNumber(h) + ':' + padNumber(m);
    }
    if (times[1] > 0) {
      const h = Math.floor(times[1]/3600);
      const m = times[1]/60%60;
      time2 = padNumber(h) + ':' + padNumber(m);
    }
    return time1 + ' - ' + time2;
    } else {
      switch (item[column.fieldName]) {
        case '_4M11CFNOR': return 'Б/лист';
        case '_5IF0Y1DX5': return 'Б/лист';
        case '_4M11CFNOP': return 'Вызова';
        case '_4M11CFNOO': return 'Дежурство';
        case '_4JL0X5TLP': return 'Отпуск';
        case '_4JL0X5TL2': return 'Диспансерный';
        case '_5IF0Y1DX6': return 'Учеба';
        case '_4V10YMXNS': return 'Отпуск';
        case '_4V10YMXNY': return 'Отпуск';
        case '_4JL0X5TLU': return 'Отпуск';
        case '_4JL0X5TLT': return 'Отпуск';
        case '_4MZ0T47RP': return 'Командировка';
        case '_4MZ0TDDA8': return 'Конференция';
        case '_4M11CFNOQ': return 'МСЭ';
        case '_4V10YMXNQ': return 'Перерыв';
        case '_5IF0Y1DX7': return 'Отпуск';
        case '_4MZ0TM4TR': return 'Отгул';
        case '_5IF0Y1DX8': return 'Отпуск';
        case '_4JL0X5TLV': return 'Отпуск';
        case '_4V10YMXNU': return 'Отпуск';
        case '_4V10YMXNW': return 'Отпуск';
        case '_4JL0X5TLQ': return 'Отпуск';
        case '_4V10YMXNO': return 'Совещание';
        case '_4MZ0T6HGM': return 'Праздничные';
        case '_4MZ0TB23S': return 'Предпраздничные';
        case '_4MZ0TFZ05': return 'Приемпоб/л';
        case '_4MZ0TDWYU': return 'Проф.осмотры';
        case '_4JL0X5TLR': return 'Разное';
        case '_5IG0UQ28V': return 'Учеба';
        case '_4JL0X5TLS': return 'Учеба';        
        default: return 'Приема нет';
      }
    }
  } else {
    return '-';
  }
}

export function renderDate(item?: any, index?: number, column?: IColumn) {
  if (column !== undefined && column.fieldName !== undefined && item[column.fieldName] !== null) {
    if (item[column.fieldName]) {
      if (item[column.fieldName] === 'Итого') return 'Итого';
      const date = new Date(item[column.fieldName]);
      return padNumber(date.getDate()) + '.' + padNumber(date.getMonth() + 1) + '.' + date.getFullYear();
    } else {
      return '-';
    }
  } else {
    return '-';
  }
}

export function renderDateTime(item?: any, index?: number, column?: IColumn) {
  if (column !== undefined && column.fieldName !== undefined && item[column.fieldName] !== null) {
    if (item[column.fieldName]) {
      const date = new Date(item[column.fieldName]);
      return padNumber(date.getDate()) + '.' + padNumber(date.getMonth() + 1) + '.' + date.getFullYear() + ' ' + padNumber(date.getHours()) + ':' + padNumber(date.getMinutes());
    } else {
      return '';
    }
  } else {
    return '-';
  }
}

export function renderFieldType(item?: any, index?: number, column?: IColumn) {
  if (column !== undefined && column.fieldName !== undefined && item[column.fieldName] !== null) {
    let type: string;
    switch (item[column.fieldName]) {
      case 'input': type = 'Текст'; break;
      case 'number': type = 'Число'; break;
      case 'date': type = 'Дата'; break;
      case 'toggle': type = 'Да/Нет'; break;
      case 'select': type = 'Список'; break;
      default: type = '-';
    }
    return type;
  } else {
    return '-';
  }
}
