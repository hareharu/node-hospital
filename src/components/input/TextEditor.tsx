import React from 'react';

import { Link } from 'office-ui-fabric-react';
import { Editor } from '@tinymce/tinymce-react';

import { Loading } from 'components';


// import ReactSVG from 'react-svg';
import SVG from 'react-inlinesvg';
import feather from 'feather-icons';

import tinymce from 'tinymce';

import 'tinymce/themes/silver';
import 'tinymce/icons/default';

import 'tinymce/plugins/image';
import 'tinymce/plugins/print';
import 'tinymce/plugins/code';
import 'tinymce/plugins/noneditable';
import 'tinymce/plugins/table';
import 'tinymce/plugins/template';
import 'tinymce/plugins/save';
import 'tinymce/plugins/pagebreak';
import 'tinymce/plugins/charmap';

tinymce.addI18n('russian', {
  'Redo': 'Вернуть',
  'Undo': 'Отменить',
  'Ok': 'OK',
  'Cancel': 'Отменить',
  'Save': 'Сохранить',
  'Bold': 'Полужирный',
  'Italic': 'Курсив',
  'Underline': 'Подчеркнутый',
  'Close': 'Закрыть',
  'Print': 'Распечатать',
  'Source code': 'Исходный код',
  'Align left': 'Выравнивание по левому краю',
  'Align center': 'Выравнивание по правому краю',
  'Align right': 'Выравнивание по центру',
  'Justify': 'Выравнивание по ширине',
  'Insert template': 'Вставить шаблон',
  'Templates': 'Шаблоны',
  'Preview': 'Предварительный просмотр',
  'File': 'Файл',
  'New document': 'Новый документ',
  'Print...': 'Распечатать',
  'Edit': 'Правка',
  'Cut': 'Вырезать',
  'Copy': 'Копировать',
  'Paste': 'Вставить',
  'Select all': 'Выделить все',
  'Insert': 'Вставка',
  'Image...': 'Изображение',
  'Insert template...': 'Шаблон',
  'Table': 'Таблица',
  'Format': 'Формат',
  'Strikethrough': 'Зачеркнутый',
  'Superscript': 'Надстрочный',
  'Subscript': 'Подстрочный',
  'Code': 'Код',
  'Formats': 'Форматирование',
  'Blocks': 'Элементы',
  'Fonts': 'Шрифт',
  'Font sizes': 'Размер шрифта',
  'Align': 'Выравнивание',
  'Clear formatting': 'Очистить формат',
  'Tools': 'Инструменты',
  'View': 'Вид',
  'Row': 'Строка',
  'Column': 'Столбец',
  'Cell': 'Ячейка',
  'Delete table': 'Удалить таблицу',
  'Table properties': 'Свойства таблицы',
  'Visual aids': 'Визуальные подсказки',
  'Headings': 'Заголовки',
  'Inline': 'Текст',
  'Left': 'Выравнивание по левому краю',
  'Center': 'Выравнивание по правому краю',
  'Right': 'Выравнивание по центру',
  'Page break': 'Разрыв страницы',
  'Special character...': 'Вставка символа',
  'Insert/Edit Image': 'Вставка/редактирование изображения',
  'General': 'Параметры',
  'Upload': 'Загрузка',
  'Source': 'Ссылка',
  'Alternative description': 'Описание',
  'Width': 'Ширина',
  'Height': 'Высота',
  'Constrain proportions': 'Сохранять пропорции',
  'Drop an image here': 'Перетащите изображение сюда',
  'Browse For An image': 'Выбрать файл',
});

tinymce.IconManager.add('custom', {
  icons: {
    //'create': feather.icons.file.toSvg(),
    //'copy': feather.icons.copy.toSvg(),
    //'paste': feather.icons.clipboard.toSvg(),
    //'cut': feather.icons.scissors.toSvg(),
    'save': feather.icons.save.toSvg(),
    //'print': feather.icons['printer'].toSvg(),
    'undo': feather.icons['corner-up-left'].toSvg(),
    'redo': feather.icons['corner-up-right'].toSvg(),
    'bold': feather.icons.bold.toSvg(),
    'underline': feather.icons.underline.toSvg(),
    'italic': feather.icons.italic.toSvg(),
    'align-left': feather.icons['align-left'].toSvg(),
    'align-center': feather.icons['align-center'].toSvg(),
    'align-right': feather.icons['align-right'].toSvg(),
    'align-justify': feather.icons['align-justify'].toSvg(),
    'sourcecode': feather.icons.code.toSvg(),
    'template': feather.icons.book.toSvg(),
  }
});

const tinylogo = <SVG src='./tinymce/logo.svg' style={{ pointerEvents: 'none', height: '20px', width: '60px' }}/> // <ReactSVG src='./tinymce/logo.svg' svgStyle={{ pointerEvents: 'none', height: '20px', width: '60px' }}/>
// const tinylogo = <ReactSVG src='./tinymce/logo.svg' beforeInjection={svg => { svg.setAttribute('style', 'pointer-events: none; height: 20px; width: 60px;') }}/>

interface ITextEditorProps {
  full?: boolean;
  defaultValue?: string;
  onChange?: (value: string) => void;
  onSave?: () => void;
  value?: string;
  loading?: boolean;
}

interface ITextEditorState {
  // templates: { title: string, description: string, content: string }[];
  content: string;
}

export class TextEditor extends React.Component<ITextEditorProps, ITextEditorState> {

  constructor(props: ITextEditorProps) {
    super(props);
    this.state = {
      content: '',
      // templates: [],
    };
    this.handleEditorChange = this.handleEditorChange.bind(this);
  }
  /*
  public componentDidMount() {
    fetch('/api/who/templates',{credentials: 'same-origin'})
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
      this.setState({ templates: json.data });
    })
    .catch(err =>  console.log(err.toString()));
  }
  */
  /*
  handleEditorChange = (e) => {
    if (this.props.onChange) this.props.onChange(e.target.getContent());
  }
  */
  handleEditorChange(content) {
    //this.setState({ content });
    if (this.props.onChange) this.props.onChange(content);
  }

  onSaveCallback = () => {
    if (this.props.onSave) this.props.onSave();
  }
  // Link WebkitUserDrag: 'none',
  render() {

    let plugins: string | undefined = undefined;
    let toolbar = 'undo redo | bold italic underline | alignleft aligncenter alignright alignjustify';
    let menubar = false;
    if (this.props.full) {
      plugins = 'image print code table charmap pagebreak';
      toolbar = 'undo redo | fontsizeselect align bold italic underline | tableprops tablerowprops tablecellprops | tableinsertrowbefore tableinsertrowafter tabledeleterow | tableinsertcolbefore tableinsertcolafter tabledeletecol | tablesplitcells tablemergecells';
      menubar = true;
    }
    return (
      <Loading loading={this.props.loading}> {/* бьет разметку */}
        <Link styles={{ root: { position: 'absolute', right: '20px', marginTop: '9px', zIndex: 100 }}} target='_blank' href='https://www.tiny.cloud'>{tinylogo}</Link>
        <Editor
          initialValue={this.props.defaultValue}
          //onChange={this.handleEditorChange}
          onEditorChange={this.handleEditorChange}
          value={this.props.value}
          init={{
            images_upload_url:'api/who/uploadimage',
            template_replace_values: {
              name : "Иванов Иван Иванович",
            },
            icons: 'custom',
            fontsize_formats: '8pt 9pt 10pt 11pt 12pt 13pt 14pt 15pt 16pt 17pt 18pt 19pt 20pt',
            plugins,
            toolbar,
            table_toolbar: '',
            skin: 'fabric',
            height: '100%',
            width: '100%',
            resize: false,
            language: 'russian',
            menubar,
            statusbar: false,
            templates: 'api/who/templates',
            save_onsavecallback: this.onSaveCallback,
            content_css : './tinymce/page.css',
            skin_url: './tinymce', 
          }}
        />
      </Loading>
    
    )
  }

}