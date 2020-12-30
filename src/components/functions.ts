import Cookies from 'universal-cookie';
import * as FileSaver from 'file-saver';
import { showMessage, setProgress, openDialog, closeDialog } from 'components';
// import  uuidv1  from 'uuid/v1';
import { v1 as uuidv1 } from 'uuid';

const cookies = new Cookies();

if (!Object.entries) { // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/entries
  Object.entries = function(obj) {
    var ownProps = Object.keys( obj ), i = ownProps.length, resArray = new Array(i);
    while (i--) resArray[i] = [ownProps[i], obj[ownProps[i]]];
    return resArray;
  };
}

export function uuid() {
  return uuidv1();
}

export function niluuid() {
  return '00000000-0000-0000-0000-000000000000';
}

export function saveFile(api: string, name: string | undefined) {
  fetch(api, {credentials: 'same-origin'})
  .then(response => {
    if (!response.ok) {
      showMessage(response.status === 404 ? 'Файл не найден' : 'Во время получения файла произошла ошибка');
      return null;
    }
    return response.blob();
  }).then(blob => {
    if (blob) FileSaver.saveAs(blob, name || 'filename');
  })
  .catch(err => showMessage(err));
}

export function saveFilePost(api: string, pars: any, name: string | undefined) {
  fetch(api, { credentials: 'same-origin', method: 'POST', body: JSON.stringify(pars), headers: {'Content-Type': 'application/json'} })
  .then(response => {
    if (!response.ok) {
      showMessage(response.status === 404 ? 'Файл не найден' : 'Во время получения файла произошла ошибка');
      return null;
    }
    return response.blob();
  }).then(blob => {
    if (blob) FileSaver.saveAs(blob, name || 'filename');
  })
  .catch(err => showMessage(err));
}

export function doOverTime(onBefore, onStep, onComplete, length, title, text) {
  setProgress(0);
  openDialog(title, text, () => {}, 'progress');
  var step = 100/length;
  let counter = 0;
  let counterDialog = 0;
  const interval = 10;
  const intervalContainer = setInterval(() => {
    counterDialog += interval;
    if ( counterDialog === 100) {
      counterDialog = 0;
      setProgress(counter*step/100);
    }
    if (counter === length) {
      onComplete();
      closeDialog();
      clearInterval(intervalContainer);
    } else {
      onStep();
      counter += 1;
    }
  }, interval);
}

/*
export function changeTags(newtags, oldtags?) {
  for (let [key, value] of Object.entries(newtags)) {
    if (oldtags === undefined || oldtags[key] !== value) {
      console.log(`${key}: ${value}`);
    }
  }
}
*/

export function callAPI(api: string, msg?: string, callback?: any) {
  fetch(api, {credentials: 'same-origin'})
  .then(response => { 
    if (!response.ok) {
      throw Error(response.statusText);
    }
    if (msg) showMessage(msg, 'info');
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.indexOf("application/json") !== -1) {
      return response.json().then(json => {
        if (json.status === 'bad') { throw Error(json.error); }
        if (callback) callback(json.data);
      });
    } else {
      return response.text().then(text => {
        if (callback) callback();
      });
    }
  })
  .catch(error => {
    showMessage(error, 'error');
  });
}

export function callAPIPost(api: string, pars: any, msg?: string, callback?: any) {
  fetch(api, { credentials: 'same-origin', method: 'POST', body: JSON.stringify(pars), headers: {'Content-Type': 'application/json'} })
  .then(response => { 
    if (!response.ok) {
      throw Error(response.statusText);
    }
    if (msg) showMessage(msg, 'info');
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.indexOf("application/json") !== -1) {
      return response.json().then(json => {
        if (json.status === 'bad') { throw Error(json.error); }
        if (callback) callback(json.data);
      });
    } else {
      return response.text().then(text => {
        if (callback) callback();
      });
    }
  })
  .catch(error => {
    showMessage(error, 'error');
  });
}

export function getItems(api: string, itemscallback: (items: any)=>void, loadingcallback?: (loading: boolean)=>void) {
  let canceled = false;
  if (loadingcallback) loadingcallback(true);
  fetch(api, { credentials: 'same-origin' })
  .then(response => { if (!response.ok) { throw Error(response.statusText); }
    return response.json();
  })
  .then(json => { if (json.status === 'bad') { throw Error(json.error); }
    if (!canceled) {
      if (itemscallback) itemscallback(json.data);
      if (loadingcallback) loadingcallback(false);
    }
  })
  .catch(err => {
    showMessage(err);
  });
  return () => {
    canceled = true;
  }
}

export function getItemsPost(api: string, pars: any, itemscallback: (items: any)=>void, loadingcallback?: (loading: boolean)=>void) {
  let canceled = false;
  if (loadingcallback) loadingcallback(true);
  fetch(api, { credentials: 'same-origin', method: 'POST', body: JSON.stringify(pars), headers: {'Content-Type': 'application/json'} })
  .then(response => { if (!response.ok) { throw Error(response.statusText); }
    return response.json();
  })
  .then(json => { if (json.status === 'bad') { throw Error(json.error); }
    if (!canceled) {
      if (itemscallback) itemscallback(json.data);
      if (loadingcallback) loadingcallback(false);
    }
  })
  .catch(err => {
    showMessage(err);
  });
  return () => {
    canceled = true;
  }
}

export function getText(api: string, textcallback: (text: any)=>void, loadingcallback?: (loading: boolean)=>void) {
  let canceled = false;
  if (loadingcallback) loadingcallback(true);
  fetch(api, {credentials: 'same-origin'})
  .then(response => {
    if (!response.ok) { throw Error(response.statusText); }
    return response.text();
  })
  .then(data => {
    if (!canceled) {
      if (textcallback) textcallback(data);
      if (loadingcallback) loadingcallback(false);
    }
  })
  .catch(err => showMessage(err));
  return () => {
    canceled = true;
  }
}

export function getPodr(): string {
  const cookie = cookies.get('who.development.sid');
  if (cookie) {
    // console.log(cookie);
    return cookie.podr.toString() || niluuid();
  } else {
    return niluuid();
  }
}

export function padNumber(value: number): string {
  if (value < 10) {
    return '0' + value.toString();
  } else {
    return value.toString();
  }
}

export function getTimeDiff(time: number): string {
  const date1 = new Date().getTime();
  const date2 = time;
  let ms = 0;
  if (date1 > date2) {
    ms = date1 - date2;
  } else {
    ms = date2 - date1;
  }
  const d = Math.floor(ms / 1000 / 60 / 60 / 24);
  ms -= d * 1000 * 60 * 60 * 24;
  const h = Math.floor(ms / 1000 / 60 / 60);
  ms -= h * 1000 * 60 * 60;
  const m = Math.floor(ms / 1000 / 60);
  let diff = '';
  if (d > 0) {
    diff += d + ' д ';
  }
  if (h > 0) {
    diff += h + ' ч ';
  }
  if (m > 0) {
    diff += m + ' м ';
  }
  return diff;
}

export function getDateString(day: string): string {
  const today = new Date();
  let date: Date;
  switch (day) {
    case 'today':
      date = today;
      break;
    case 'first':
      date = new Date(today.getFullYear(), today.getMonth(), 1);
      break;
    case 'last':
      date = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      break;
    case 'year':
      date = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate());
      break;
    default:
      date = new Date(day);
  }
  return date.getFullYear().toString() + '-' + padNumber(date.getMonth() + 1) + '-' + padNumber(date.getDate());
}

export function dateToString(day: string): string {
  const date = new Date(day);
  return padNumber(date.getDate()) + '.' + padNumber(date.getMonth() + 1) + '.' + date.getFullYear();
}

export function datetimeToString(day: string): string {
  const date = new Date(day);
  return padNumber(date.getDate()) + '.' + padNumber(date.getMonth() + 1) + '.' + date.getFullYear() + ' ' + padNumber(date.getHours()) + ':' + padNumber(date.getMinutes());
}

export function fetchJSON(api: string, result: (err:string | undefined, data: JSON[]) => void) {
  fetch('/api/' + api,{credentials: 'same-origin'})
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
    return result(undefined, json.data);
  })
  .catch(error => {
    return result(error.toString(), []);
  });
}
