import ReactQuill, { Quill } from 'react-quill';
import React from 'react';
import 'react-quill/dist/quill.snow.css';
import ImageResize from 'quill-image-resize-module-react';
import { IconRefresh, IconSave } from '@arco-design/web-react/icon';
import { Button, Message } from '@arco-design/web-react';
import { zhiHuiTuanJianDb } from '@/db/zhiHuiTuanJianDb';
import defaultContent from './defaultContent.txt';

Quill.register('modules/imageResize', ImageResize);
/*
 * Simple editor component that takes placeholder text as a prop
 */
class Editor extends React.Component {
  constructor(props) {
    super(props);
    this.oid = props.oid;
    zhiHuiTuanJianDb
      .table('settings')
      .where({ oid: this.oid, settingName: 'template' })
      .toArray()
      .then((array) => {
        console.log(array);
        if (array.length != 0) {
          this.setState({ editorHtml: array[0].value });
        }
        return true;
      });
    this.state = { editorHtml: props.defaultValue };
    this.handleChange = this.handleChange.bind(this);
    this.handleSaveTemplate = this.handleSaveTemplate.bind(this);
    this.handleRestoreDefaultContent =
      this.handleRestoreDefaultContent.bind(this);
    this.contents = '';
  }

  handleChange(value, delta, source, editor) {
    this.setState({ editorHtml: value });
  }

  handleSaveTemplate() {
    Message.success('邮件模板保存成功！');
    zhiHuiTuanJianDb.table('settings').put({
      oid: this.oid,
      settingName: 'template',
      value: this.state.editorHtml,
    });
  }

  handleRestoreDefaultContent() {
    fetch(defaultContent)
      .then((r) => r.text())
      .then((text) => {
        zhiHuiTuanJianDb.table('settings').put({
          oid: this.oid,
          settingName: 'template',
          value: text,
        });
        this.setState({ editorHtml: text });
        Message.success('恢复默认模板成功!');
      });
  }

  render() {
    return (
      <div>
        <ReactQuill
          onChange={this.handleChange}
          value={this.state.editorHtml}
          modules={Editor.modules}
          formats={Editor.formats}
          bounds={'.template'}
          placeholder={this.props.placeholder}
        />
        <Button
          type="primary"
          icon={<IconSave />}
          style={{ marginTop: '1em' }}
          onClick={this.handleSaveTemplate}
        >
          保存
        </Button>
        <Button
          type="default"
          icon={<IconRefresh />}
          style={{ marginLeft: '1em', marginTop: '1em' }}
          onClick={this.handleRestoreDefaultContent}
        >
          恢复默认模板
        </Button>
      </div>
    );
  }
}

var BaseImageFormat = Quill.import('formats/image');
const ImageFormatAttributesList = ['alt', 'height', 'width', 'style'];

class ImageFormat extends BaseImageFormat {
  static formats(domNode) {
    return ImageFormatAttributesList.reduce(function (formats, attribute) {
      if (domNode.hasAttribute(attribute)) {
        formats[attribute] = domNode.getAttribute(attribute);
      }
      return formats;
    }, {});
  }
  format(name, value) {
    if (ImageFormatAttributesList.indexOf(name) > -1) {
      if (value) {
        this.domNode.setAttribute(name, value);
      } else {
        this.domNode.removeAttribute(name);
      }
    } else {
      super.format(name, value);
    }
  }
}

Quill.register(ImageFormat, true);

/*
 * Quill modules to attach to editor
 * See https://quilljs.com/docs/modules/ for complete options
 */
Editor.modules = {
  toolbar: [
    [{ header: '1' }, { header: '2' }, { font: [] }],
    [{ size: [] }],
    ['bold', 'italic', 'underline', 'strike', 'blockquote'],
    [
      { list: 'ordered' },
      { list: 'bullet' },
      { indent: '-1' },
      { indent: '+1' },
    ],
    [
      { align: '' },
      { align: 'center' },
      { align: 'right' },
      { align: 'justify' },
    ],
    ['link', 'image', 'video'],
    ['clean'],
  ],
  clipboard: {
    // toggle to add extra line breaks when pasting HTML:
    matchVisual: false,
  },
  imageResize: {
    parchment: Quill.import('parchment'),
    modules: ['Resize', 'DisplaySize'],
  },
};
/*
 * Quill editor formats
 * See https://quilljs.com/docs/formats/
 */
Editor.formats = [
  'header',
  'font',
  'size',
  'bold',
  'italic',
  'underline',
  'strike',
  'blockquote',
  'list',
  'bullet',
  'indent',
  'link',
  'image',
  'video',
  'align',
  'width',
];

Editor.defaultProps = {
  defaultValue: '',
};

export default Editor;
