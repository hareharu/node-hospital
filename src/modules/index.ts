// Администрирование информационных систем и прочие IT дела
import Hardware from './admin/Hardware';
import InfoScreens from './admin/InfoScreens';
import IssueTracker from './admin/IssueTracker';
import MyIssues from './admin/MyIssues';
import Kanban from './admin/Kanban';
import KKBTemplates from './admin/KKBTemplates';
import Passwords from './admin/Passwords';
import PhoneBook from './admin/PhoneBook';
import QueryDB from './admin/QueryDB';
import ServiceLog from './admin/ServiceLog';
import KMIACVideo from './admin/KMIACVideo';

// Модули для работы с обработчиком реестров
import FProcArchive from './fproc/FProcArchive';
import FProcExam from './fproc/FProcExam';
import FProcSend from './fproc/FProcSend';

// Медицинские и прочие данные пациентов
import Ambulance from './medical/Ambulance';
import Cancer from './medical/Cancer';
import EIRQueue from './medical/EIRQueue';
import Epicrisis from './medical/Epicrisis';
import Patient from './medical/Patient';
import Schedule from './medical/Schedule';
import SearchRZN from './medical/SearchRZN';

// Работа с различными справочниками
import HBookMKB from './register/HBookMKB';

// Отчеты (без показа данных пациентов)
import Diagnosis from './report/Diagnosis';
import ReestrAPP from './report/ReestrAPP';
import ReestrExam from './report/ReestrExam';
import ReestrInfo from './report/ReestrInfo';
import ReportAPP from './report/ReportAPP';

// Системные модули для настройки и мониторинга
import HomeLinks from './system/HomeLinks';
import Import from './system/Import';
import NewsBoard from './system/NewsBoard';
import PMonitor from './system/PMonitor';
import References from './system/References';
import Settings from './system/Settings';
import Templates from './system/Templates';
import UserRoles from './system/UserRoles';
import VideoArchive from './admin/VideoArchive';

export const modules = [ // key: код модуля       access: доступ      icon: иконка для меню           name: текст для меню            title: текст для всплывающей подсказки
  { module: VideoArchive,   key: 'videoarchive',  access: 'guest',    icon: 'menu-video-yellow',      name: 'Архив видеороликов',     title: '' },
  { module: KMIACVideo,     key: 'kmiacvideo',    access: 'guest',    icon: 'menu-monitor-yellow',    name: 'Видеоконференции',       title: '' },
  { module: PhoneBook,      key: 'phonebook',     access: 'guest',    icon: 'menu-book-yellow',       name: 'Телефонный справочник',  title: '' },
  { module: HBookMKB,       key: 'hbookmkb',      access: 'guest',    icon: 'menu-archive-yellow',    name: 'Справочник МКБ',         title: 'Поиск по справочнику МКБ10' },
  { module: KKBTemplates,   key: 'kkbtemplates',  access: 'guest',    icon: 'menu-file-red',          name: 'Шаблоны направлений',    title: 'Шаблоны направительной документации для поликлиники дистанционного консультирования ККБ' },
  
  { module: HomeLinks,      key: 'homelinks',     access: 'user',     icon: 'menu-globe-green',       name: 'Домашняя страница',      title: 'Редактирование ссылок выводимых на домашней странице' },
  { module: MyIssues,       key: 'myissues',      access: 'user',     icon: 'menu-list-green',        name: 'Мои задачи',             title: '' },
  { module: NewsBoard,      key: 'newsboard',     access: 'user',     icon: 'menu-calendar-green',    name: 'Новости и объявления',   title: '' },
  { module: Hardware,       key: 'hardware',      access: 'user',     icon: 'menu-monitor-green',     name: 'Оборудование',           title: '' },
  { module: InfoScreens,    key: 'infoscreens',   access: 'user',     icon: 'menu-monitor-green',     name: 'Информационные экраны',  title: 'Редактирование расписания для отображения на информационных экранах' },
  { module: FProcExam,      key: 'fprocexam',     access: 'user',     icon:	'menu-graph-green',       name: 'Реестры ДД и ПО',        title: 'Сводная информация по принятым случаям диспансеризации и профосмотров' },
  { module: FProcSend,      key: 'fprocsend',     access: 'user',     icon: 'menu-floppy-green',      name: 'Информационный обмен',   title: 'Мониторинг файлов отправленных в ЦОР' },
  { module: Schedule,       key: 'schedule',      access: 'user',     icon: 'menu-list-green',        name: 'Расписание приема',      title: 'Редактирование расписания приема врачей' },
  { module: Diagnosis,      key: 'diagnosis',     access: 'user',     icon: 'menu-stethoscope-green', name: 'Диагнозы',	              title: 'Сводная информация по диагнозам' },
  { module: ReestrAPP,      key: 'reestrapp',     access: 'user',     icon: 'menu-graph-green',       name: 'Посещения',	            title: 'Сводная информация по посещениям' },
  { module: ReestrExam,     key: 'reestrexam',    access: 'user',     icon: 'menu-graph-green',       name: 'Профосмотры',	          title: 'Сводная информация по профосмотрам' },
  { module: ReestrInfo,     key: 'reestrinfo',    access: 'user',     icon: 'menu-book-green',        name: 'Информация по реестрам', title: 'Сводная информация по реестрам для ЦОР' },
  { module: ReportAPP,      key: 'reportapp',     access: 'user',     icon: 'menu-table-green',       name: 'Отчеты АПП',	            title: 'Формирование очетов по АПП' },
  { module: Templates,      key: 'templates',     access: 'user',     icon: 'menu-text-green',        name: 'Шаблоны документов',	    title: 'Редактирование шаблонов для модуля Пациенты' },
 
  { module: FProcArchive,   key: 'fprocarchive',  access: 'doctor',   icon: 'menu-archive-red',       name: 'Архив реестров ОМС',     title: '' },
  { module: Ambulance,      key: 'ambulance',     access: 'doctor',   icon: 'menu-siren-red',         name: 'Мониторинг СМП',         title: 'Информация о вызовах СМП из ИС Стационар' },
  { module: Cancer,         key: 'cancer',        access: 'doctor',   icon: 'menu-book-red',          name: 'Реестры по онкологии',   title: '' },
  { module: EIRQueue,       key: 'eirqueue',      access: 'doctor',   icon: 'menu-calendar-red',      name: 'Очередь на ЕИР',         title: 'Направления на ЕИР без связанных с ними госпитализаций' },
  { module: Epicrisis,      key: 'epicrisis',     access: 'doctor',   icon: 'menu-clipboard-red',     name: 'Выписные эпикризы',      title: 'Выписные эпикризы из стационаров' },
  { module: Patient,        key: 'patient',       access: 'doctor',   icon: 'menu-person-red',        name: 'Пациенты',	              title: 'Информация из амбулаторных карт' },
  { module: SearchRZN,      key: 'searchrzn',     access: 'doctor',   icon: 'menu-magnifier-red',     name: 'Поиск в РЗН',            title: 'Сервис поиска данных застрахованных' },
 
  { module: IssueTracker,   key: 'issuetracker',  access: 'admin',    icon: 'menu-list-blue',         name: 'Работа с задачами',      title: '' },
  { module: Settings,       key: 'settings',      access: 'admin',    icon: 'menu-gear-blue',         name: 'Параметры',              title: 'Изменение параметров системы' },
  { module: Kanban,         key: 'kanban',        access: 'admin',    icon: 'menu-note-blue',         name: 'Канбан-доска',           title: '' },
  { module: Passwords,      key: 'passwords',     access: 'admin',    icon: 'menu-safe-blue',         name: 'Хранилище паролей',      title: '' },
  { module: QueryDB,        key: 'querydb',       access: 'admin',    icon: 'menu-table-blue',        name: 'Запросы к БД',	          title: '' },
  { module: ServiceLog,     key: 'servicelog',    access: 'admin',    icon: 'menu-text-blue',         name: 'Журналы сервисов',       title: 'Журналы работы сервисов МИС Госпиталь и ИС Стационар' },
  { module: Import,         key: 'import',        access: 'admin',    icon: 'menu-floppy-blue',       name: 'Импорт данных',	        title: '' },
  { module: PMonitor,       key: 'pmonitor',      access: 'admin',    icon: 'menu-server-blue',       name: 'Мониторинг приложений',	title: 'Мониторинг и управление Node.js приложениями' },
  { module: References,     key: 'references',    access: 'admin',    icon: 'menu-archive-blue',      name: 'Справочники',	          title: 'Редактирование данных в справочниках системы' },
  { module: UserRoles,      key: 'userroles',     access: 'admin',    icon: 'menu-person-blue',       name: 'Роли и пользователи',    title: 'Назначение ролей для пользователей' },
];
