import React, { CSSProperties } from 'react';
import { getTheme, IFontStyles, loadTheme, registerIcons, /*isElementVisible*/ } from 'office-ui-fabric-react';
import { Depths, SharedColors } from '@uifabric/fluent-theme';
import feather from 'feather-icons';
import SVG from 'react-inlinesvg';
import 'pt-sans-cyrillic';
import './styles.css';
import './tox.css';

const fonts: IFontStyles = {                                                // Fabric 6
  tiny:         {fontFamily: 'PT Sans', fontSize: '10px', fontWeight: 400}, // 10px 600
  xSmall:       {fontFamily: 'PT Sans', fontSize: '10px', fontWeight: 400}, // 11px 400
  small:        {fontFamily: 'PT Sans', fontSize: '12px', fontWeight: 400}, // 12px 400
  smallPlus:    {fontFamily: 'PT Sans', fontSize: '12px', fontWeight: 400}, // 13px 400
  medium:       {fontFamily: 'PT Sans', fontSize: '14px', fontWeight: 400}, // 14px 400
  mediumPlus:   {fontFamily: 'PT Sans', fontSize: '16px', fontWeight: 400}, // 15px 400
  large:        {fontFamily: 'PT Sans', fontSize: '18px', fontWeight: 400}, // 17px 300
  xLarge:       {fontFamily: 'PT Sans', fontSize: '20px', fontWeight: 600}, // 21px 100
  xLargePlus:   {fontFamily: 'PT Sans', fontSize: '24px', fontWeight: 600}, // 21px 100
  xxLarge:      {fontFamily: 'PT Sans', fontSize: '28px', fontWeight: 600}, // 28px 100
  xxLargePlus:  {fontFamily: 'PT Sans', fontSize: '32px', fontWeight: 600}, // 28px 100
  superLarge:   {fontFamily: 'PT Sans', fontSize: '42px', fontWeight: 600}, // 42px 100
  mega:         {fontFamily: 'PT Sans', fontSize: '68px', fontWeight: 600}, // 72px 100
};

const palette = {
  themePrimary: '#d9330e',
  themeLighterAlt: '#fdf6f4',
  themeLighter: '#f9dbd4',
  themeLight: '#f4bcaf',
  themeTertiary: '#e87e66',
  themeSecondary: '#de4927',
  themeDarkAlt: '#c42e0c',
  themeDark: '#a5270a',
  themeDarker: '#7a1d08',
  neutralLighterAlt: '#f8f8f8',
  neutralLighter: '#f4f4f4',
  neutralLight: '#eaeaea',
  neutralQuaternaryAlt: '#dadada',
  neutralQuaternary: '#d0d0d0',
  neutralTertiaryAlt: '#c8c8c8',
  neutralTertiary: '#b0afae',
  neutralSecondary: '#979695',
  neutralPrimaryAlt: '#7d7c7b',
  neutralPrimary: '#171717',
  neutralDark: '#4a4949',
  black: '#31302f',
  white: '#ffffff',
};

const iconsPalette = {
  white: palette.white,
  black: SharedColors.gray40,
  red: SharedColors.redOrange10,
  green: SharedColors.yellowGreen10,
  blue: SharedColors.cyan10,
  yellow: SharedColors.yellow10,
};

let icons: { [key: string]: JSX.Element } = {
  // fabric ui замена иконок основных элементов
  'calendar': <span style={{display:'flex'}}><SVG src={feather.icons['calendar'].toSvg({ 'height': 16, 'width': 16 })}/></span>,
  'cancel': <span style={{display:'flex'}}><SVG src={feather.icons['x'].toSvg({ 'height': 14, 'width': 14 })}/></span>,
  'checkmark': <span style={{display:'flex'}}><SVG src={feather.icons['check'].toSvg({ 'height': 16, 'width': 16 })}/></span>,
  'chevrondown': <span style={{verticalAlign:'sub'}}><SVG src={feather.icons['chevron-down'].toSvg({ 'height': 18, 'width': 18 })}/></span>,
  'chevrondownsmall': <span style={{verticalAlign:'sub'}}><SVG src={feather.icons['chevron-down'].toSvg({ 'height': 16, 'width': 16 })}/></span>,
  'chevronrightmed': <span style={{display:'flex'}}><SVG src={feather.icons['chevron-right'].toSvg({ 'height': 16, 'width': 16 })}/></span>,
  'chevronupsmall': <span style={{verticalAlign:'sub'}}><SVG src={feather.icons['chevron-up'].toSvg({ 'height': 16, 'width': 16 })}/></span>,
  'circlering': <span><SVG src={feather.icons['circle'].toSvg({ 'height': 18, 'width': 18 })}/></span>,
  'clear': <span style={{display:'flex'}}><SVG src={feather.icons['x'].toSvg({ 'height': 16, 'width': 16 })}/></span>,
  'down': <span style={{display:'flex'}}><SVG src={feather.icons['arrow-down'].toSvg({ 'height': 14, 'width': 14 })}/></span>,
  'more': <span><SVG src={feather.icons['more-horizontal'].toSvg({ 'height': 18, 'width': 18 })}/></span>,
  'search': <span style={{display:'flex'}}><SVG src={feather.icons['search'].toSvg({ 'height': 18, 'width': 18 })}/></span>,
  'sortdown': <span><SVG src={feather.icons['arrow-down'].toSvg({ 'height': 14, 'width': 14 })}/></span>,
  'sortup': <span><SVG src={feather.icons['arrow-up'].toSvg({ 'height': 14, 'width': 14 })}/></span>,
  'statuscirclecheckmark': <span><SVG src={feather.icons['check'].toSvg({ 'height': 18, 'width': 18 })}/></span>,
  'tag': <span style={{display:'flex'}}><SVG src={feather.icons['tag'].toSvg({ 'height': 16, 'width': 16 })}/></span>,
  'up': <span style={{display:'flex'}}><SVG src={feather.icons['arrow-up'].toSvg({ 'height': 14, 'width': 14 })}/></span>,
  // fabric ui замена иконок тостера
  'blocked': <span style={{display:'flex'}}><SVG src={feather.icons['minus-circle'].toSvg({ 'height': 18, 'width': 18 })}/></span>,
  'blocked2': <span style={{display:'flex'}}><SVG src={feather.icons['minus-circle'].toSvg({ 'height': 18, 'width': 18 })}/></span>,
  'completed': <span style={{display:'flex'}}><SVG src={feather.icons['check-circle'].toSvg({ 'height': 18, 'width': 18 })}/></span>,
  'errorbadge': <span style={{display:'flex'}}><SVG src={feather.icons['x-circle'].toSvg({ 'height': 18, 'width': 18 })}/></span>,
  'info': <span style={{display:'flex'}}><SVG src={feather.icons['info'].toSvg({ 'height': 18, 'width': 18 })}/></span>,
  'warning': <span style={{display:'flex'}}><SVG src={feather.icons['alert-circle'].toSvg({ 'height': 18, 'width': 18 })}/></span>,
  // верхнее меню в сайдбаре
  'side-bars': <SVG src={feather.icons['menu'].toSvg({ 'height': 20, 'width': 20, 'color': palette.neutralPrimary })}/>,
  'side-home': <SVG src={feather.icons['home'].toSvg({ 'height': 18, 'width': 18, 'color': palette.neutralSecondary })}/>,
  'side-toggle': <SVG src={feather.icons['sidebar'].toSvg({ 'height': 18, 'width': 18, 'color': palette.neutralSecondary })}/>,
  'side-user': <SVG src={feather.icons['user'].toSvg({ 'height': 18, 'width': 18, 'color': palette.neutralSecondary })}/>,
  // меню пользователя
  'user-lock': <span style={{display:'flex'}}><SVG src={feather.icons['lock'].toSvg({ 'height': 14, 'width': 14 })}/></span>,
  'user-logout': <span style={{display:'flex'}}><SVG src={feather.icons['log-out'].toSvg({ 'height': 14, 'width': 14 })}/></span>,
  'user-settings': <span style={{display:'flex'}}><SVG src={feather.icons['settings'].toSvg({ 'height': 14, 'width': 14 })}/></span>,  
  // иконки модулей
  'menu-archive': <SVG src='./icons/archive.svg' style={{ color: iconsPalette.black, stroke: iconsPalette.white, fill: iconsPalette.yellow }}/>,
  'menu-book': <SVG src='./icons/book.svg' style={{ color: iconsPalette.black, stroke: iconsPalette.white, fill: iconsPalette.red }}/>,
  'menu-calendar': <SVG src='./icons/calendar.svg' style={{ color: iconsPalette.black, stroke: iconsPalette.white, fill: iconsPalette.green }}/>,
  'menu-clipboard': <SVG src='./icons/clipboard.svg' style={{ color: iconsPalette.black, stroke: iconsPalette.white, fill: iconsPalette.red }}/>,
  'menu-envelope': <SVG src='./icons/envelope.svg' style={{ color: iconsPalette.black, stroke: iconsPalette.white, fill: iconsPalette.yellow }}/>,
  'menu-file': <SVG src='./icons/file.svg' style={{ color: iconsPalette.black, stroke: iconsPalette.white, fill: iconsPalette.yellow }}/>,
  'menu-floppy': <SVG src='./icons/floppy.svg' style={{ color: iconsPalette.black, stroke: iconsPalette.white, fill: iconsPalette.green }}/>,
  'menu-folder': <SVG src='./icons/folder.svg' style={{ color: iconsPalette.black, stroke: iconsPalette.white, fill: iconsPalette.yellow }}/>,
  'menu-globe': <SVG src='./icons/globe.svg' style={{ color: iconsPalette.black, stroke: iconsPalette.white, fill: iconsPalette.blue }}/>,
  'menu-graph': <SVG src='./icons/graph.svg' style={{ color: iconsPalette.black, stroke: iconsPalette.red, fill: iconsPalette.green }}/>,
  'menu-list': <SVG src='./icons/list.svg' style={{ color: iconsPalette.black, stroke: iconsPalette.white, fill: iconsPalette.white }}/>,
  'menu-magnifier': <SVG src='./icons/magnifier.svg' style={{ color: iconsPalette.black, stroke: iconsPalette.blue, fill: iconsPalette.red }}/>,
  'menu-medkit': <SVG src='./icons/medkit.svg' style={{ color: iconsPalette.black, stroke: iconsPalette.white, fill: iconsPalette.red }}/>,
  'menu-message': <SVG src='./icons/message.svg' style={{ color: iconsPalette.black, stroke: iconsPalette.white, fill: iconsPalette.white }}/>,
  'menu-monitor': <SVG src='./icons/monitor.svg' style={{ color: iconsPalette.black, stroke: iconsPalette.white, fill: iconsPalette.blue }}/>,
  'menu-person': <SVG src='./icons/person.svg' style={{ color: iconsPalette.black, stroke: iconsPalette.blue, fill: iconsPalette.red }}/>,
  'menu-safe': <SVG src='./icons/safe.svg' style={{ color: iconsPalette.black, stroke: iconsPalette.white, fill: iconsPalette.blue }}/>,
  'menu-server': <SVG src='./icons/server.svg' style={{ color: iconsPalette.black, stroke: iconsPalette.red, fill: iconsPalette.blue }}/>,
  'menu-siren': <SVG src='./icons/siren.svg' style={{ color: iconsPalette.black, stroke: iconsPalette.red, fill: iconsPalette.red }}/>,
  'menu-stethoscope': <SVG src='./icons/stethoscope.svg' style={{ color: iconsPalette.black, stroke: iconsPalette.white, fill: iconsPalette.red }}/>,
  'menu-table': <SVG src='./icons/table.svg' style={{ color: iconsPalette.black, stroke: iconsPalette.white, fill: iconsPalette.green }}/>,
  'menu-text': <SVG src='./icons/text.svg' style={{ color: iconsPalette.black, stroke: iconsPalette.white, fill: iconsPalette.blue }}/>,
  'menu-gear': <SVG src='./icons/gear.svg' style={{ color: iconsPalette.black, stroke: iconsPalette.blue, fill: iconsPalette.yellow }}/>,
  'menu-note': <SVG src='./icons/note.svg' style={{ color: iconsPalette.black, stroke: iconsPalette.blue, fill: iconsPalette.yellow }}/>,
  'menu-video': <SVG src='./icons/video.svg' style={{ color: iconsPalette.black, stroke: iconsPalette.yellow, fill: iconsPalette.green }}/>,

}

// добавление иконок feather
for (var icon in feather.icons) icons['icon-'+icon] = <SVG src={feather.icons[icon].toSvg({ 'height': 16, 'width': 16 })}/>;

const generateIconsList = (icons: { [key: string]: JSX.Element }) => {
  const list: { key: string }[] = [];
  for (let [key] of Object.entries(icons)) {
    if (key.startsWith('icon-') || key.startsWith('menu-')) {
      list.push({ key });
    }
  }
  return list;
}

var iconsets = ['yellow', 'green', 'red', 'blue'];
for (var set in iconsets) {
  let color = iconsPalette.black;
  var stroke = iconsPalette.black;
  var fill = iconsPalette.white;
  switch (iconsets[set]) {
    case 'yellow': fill = iconsPalette.yellow; stroke = iconsPalette.green; break;
    case 'green': fill = iconsPalette.green; stroke = iconsPalette.red; break;
    case 'red': fill = iconsPalette.red; stroke = iconsPalette.blue; break;
    case 'blue': fill = iconsPalette.blue; stroke = iconsPalette.yellow; break;
  }
  let iconsTemp: { [key: string]: JSX.Element } = {
    'menu-archive': <SVG src='./icons/archive.svg' style={{ color, stroke, fill }}/>,
    'menu-book': <SVG src='./icons/book.svg' style={{ color, stroke, fill }}/>,
    'menu-calendar': <SVG src='./icons/calendar.svg' style={{ color, stroke, fill }}/>,
    'menu-clipboard': <SVG src='./icons/clipboard.svg' style={{ color, stroke, fill }}/>,
    'menu-envelope': <SVG src='./icons/envelope.svg' style={{ color, stroke, fill }}/>,
    'menu-file': <SVG src='./icons/file.svg' style={{ color, stroke, fill }}/>,
    'menu-floppy': <SVG src='./icons/floppy.svg' style={{ color, stroke, fill }}/>,
    'menu-folder': <SVG src='./icons/folder.svg' style={{ color, stroke, fill }}/>,
    'menu-globe': <SVG src='./icons/globe.svg' style={{ color, stroke, fill }}/>,
    'menu-graph': <SVG src='./icons/graph.svg' style={{ color, stroke, fill }}/>,
    'menu-list': <SVG src='./icons/list.svg' style={{ color, stroke, fill }}/>,
    'menu-magnifier': <SVG src='./icons/magnifier.svg' style={{ color, stroke, fill }}/>,
    'menu-medkit': <SVG src='./icons/medkit.svg' style={{ color, stroke, fill }}/>,
    'menu-message': <SVG src='./icons/message.svg' style={{ color, stroke, fill }}/>,
    'menu-monitor': <SVG src='./icons/monitor.svg' style={{ color, stroke, fill }}/>,
    'menu-person': <SVG src='./icons/person.svg' style={{ color, stroke, fill }}/>,
    'menu-safe': <SVG src='./icons/safe.svg' style={{ color, stroke, fill }}/>,
    'menu-server': <SVG src='./icons/server.svg' style={{ color, stroke, fill }}/>,
    'menu-siren': <SVG src='./icons/siren.svg' style={{ color, stroke, fill }}/>,
    'menu-stethoscope': <SVG src='./icons/stethoscope.svg' style={{ color, stroke, fill }}/>,
    'menu-table': <SVG src='./icons/table.svg' style={{ color, stroke, fill }}/>,
    'menu-text': <SVG src='./icons/text.svg' style={{ color, stroke, fill }}/>,
    'menu-gear': <SVG src='./icons/gear.svg' style={{ color, stroke, fill }}/>,
    'menu-note': <SVG src='./icons/note.svg' style={{ color, stroke, fill }}/>,
    'menu-video': <SVG src='./icons/video.svg' style={{ color, stroke, fill }}/>,
  }
  for (var icont in iconsTemp) icons[icont+'-'+iconsets[set]] = iconsTemp[icont];
}

loadTheme({ fonts, palette });
registerIcons({ icons });

export const theme = getTheme();
export const registeredIcons = generateIconsList(icons);

export function getStyle(height?: number, width?: string, borderless?: boolean): CSSProperties {
  if (!height) height = 0;
  let styleF:CSSProperties = {
    flexBasis: width ? width : '100%',
    position: 'relative',
    display: 'flex',
    overflow: 'hidden',
  }
  let styleH:CSSProperties = {
    height: height,
    width: width ? width : '100%',
    marginBottom: '14px',
    position: 'relative',
    display: 'block',
  }
  let styleB:CSSProperties = {}
  let styleR:CSSProperties = {}
  let styleW:CSSProperties = { background: theme.palette.white }
  if (borderless !== true) {
    styleB = {
      borderTop: '1px solid '+theme.palette.neutralLight,
      boxShadow: Depths.depth16,
    }
  }
  if (width) styleR = { borderRight: '1px solid '+theme.palette.neutralLight };
  return height !== 0 ? {...styleH, ...styleB, ...styleR, ...styleW} : {...styleF, ...styleB, ...styleR, ...styleW};
}

export function getColor(color: string, alpha?: number): string {
  switch (color) {
    case 'red': color = SharedColors.redOrange10; break;
    case 'green': color = SharedColors.yellowGreen10; break;
    case 'blue': color = SharedColors.cyan10; break;
    case 'yellow': color = SharedColors.yellow10; break;
    case 'darkblue': color = SharedColors.cyanBlue10; break;
    case 'darkgreen': color = SharedColors.green10; break;
    case 'pink': color = SharedColors.red10; break;
    case 'darkpink': color = SharedColors.pinkRed10; break;
    case 'gray': color = SharedColors.gray10; break;
    default: break;
  }
  if (alpha) {
    if (window.navigator.userAgent.includes('Chrome/49')) { // XPшный хром не понимает цвета с прозрачностью в хексах
      var hex: any  = '0x'+color.substring(1);
      color = 'rgba('+[(hex>>16)&255, (hex>>8)&255, hex&255, (alpha/100)].join(',')+')';
    } else {
      color += (Math.round(255/100*alpha)).toString(16).padStart(2, '0');
    }
  }
  return color;
}
