import { InjectionToken } from '@angular/core';

export interface ArticleEditorStyleOpts {
  model: string;
  view: {
    name: string;
    classes: string;
  };
  title: string;
  class: string;
  converterPriority: string;
}

export interface ArticleEditorConfigToken {
  toolbar: {
    items: Array<string>;
  };
  heading: {
    options: Array<ArticleEditorStyleOpts>;
  };
}

export const DEFAULT_TOOLBAR_ITEMS: Array<string> = [
  'heading',
  'bold',
  'italic',
  'underline',
  'fontcolor',
  'fontsize',
  'bulletedList',
  'numberedList',
  'imageUpload',
  '|',
  'undo',
  'redo',
];

export const DEFAULT_EDITOR_TOOLBAR_TOP_OFFSET = 50;

export const DEFAULT_EDITOR_HEADER_STYLES: Array<ArticleEditorStyleOpts> = [
  {
    model: 'paragraph',
    view: { name: 'p', classes: 'editor_paragraph' },
    title: 'Paragraph',
    class: 'ck-heading_paragraph',
    converterPriority: 'high',
  },
  {
    model: 'heading1',
    view: { name: 'h1', classes: 'editor_heading1' },
    title: 'Heading 1',
    class: 'ck-heading_heading1',
    converterPriority: 'high',
  },
  {
    model: 'heading2',
    view: { name: 'h2', classes: 'editor_heading2' },
    title: 'Heading 2',
    class: 'ck-heading_heading2',
    converterPriority: 'high',
  },
  {
    model: 'heading3',
    view: { name: 'h3', classes: 'editor_heading3' },
    title: 'Heading 3',
    class: 'ck-heading_heading3',
    converterPriority: 'high',
  },
];

export const EDITOR_CONFIG = new InjectionToken<ArticleEditorConfigToken>(
  'EditorBasicConfig'
);

export const EDITOR_CONFIG_PROVIDER = {
  provide: EDITOR_CONFIG,
  useFactory: () => {
    return {
      // plugins: [Image, ImageToolbar, ImageResize, ImageCaption, ImageStyle],
      toolbar: {
        items: DEFAULT_TOOLBAR_ITEMS,
      },
      heading: {
        options: DEFAULT_EDITOR_HEADER_STYLES,
      },
      image: {
        // Configure the available styles.
        styles: [
          'alignLeft', 'alignCenter', 'alignRight'
        ],

        // Configure the available image resize options.
        /*resizeOptions: [
          {
            name: 'resizeImage:original',
            label: 'Original',
            value: null
          },
          {
            name: 'resizeImage:50',
            label: '50%',
            value: '50'
          },
          {
            name: 'resizeImage:75',
            label: '75%',
            value: '75'
          }
        ],*/

        // You need to configure the image toolbar, too, so it shows the new style
        // buttons as well as the resize buttons.
        toolbar: [
          'imageStyle:alignLeft', 'imageStyle:alignCenter', 'imageStyle:alignRight',
          '|',
          'resizeImage',
          '|',
          'imageTextAlternative'
        ]
      }
    };
  },
};
