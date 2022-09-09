import React, { useContext } from 'react';
import {
  Form,
  Input,
  Button,
  Grid,
  Upload,
  Notification,
  Popconfirm,
  Message,
  Space,
} from '@arco-design/web-react';
import { GlobalContext } from '@/context';
import locale from './locale';
import useLocale from '@/utils/useLocale';
import { IconDelete, IconDownload } from '@arco-design/web-react/icon';
import { IconUpload } from '@arco-design/web-react/icon';
import styles from './style/index.module.less';
import * as XLSX from 'xlsx';

const { Row, Col } = Grid;
const { useForm } = Form;
const emailRegex = new RegExp(/^\d{8}@mail.sustech.edu.cn$/);

function SearchForm(props: {
  onSearch: (event: any) => void;
  setTableData: (tableData: any) => void;
  onExportTable: (tableData: any) => void;
  onDeleteTable: () => void;
  searchInputRef: any;
}) {
  const { lang } = useContext(GlobalContext);
  const t = useLocale(locale);
  const [form] = useForm();

  const beforeUpload = (file: File, filesList: File[]) => {
    const fileReader = new FileReader();
    fileReader.onloadend = function (evt) {
      /* Parse data */
      const bstr = evt.target.result;
      const wb = XLSX.read(bstr, { type: 'binary' });
      /* Get first worksheet */
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      /* Convert array of arrays */
      const data = XLSX.utils.sheet_to_json(ws, {
        header: 1,
        defval: '-empty-',
        blankrows: false,
      });
      /* Update state */
      // skip header
      data.shift();
      // map to json
      const illegalItems = [];
      let lineCount = 0;
      const jsonData = data.map((i: Array<string>) => {
        lineCount++;
        if (i.includes('') || !emailRegex.test(i[1])) {
          illegalItems.push([`Line: ${lineCount}`].concat(i));
          return {
            name: i[0],
            email: i[1],
            studentId: '暂无',
            grade: '1',
            class: '2',
            politicalStatus: i[2],
          };
        }
        console.log(i);
        return {
          name: i[0],
          email: i[1],
          studentId: i[1].substring(0, 8),
          grade: i[1].substring(1, 3),
          class: i[1].substring(4, 6),
          politicalStatus: i[2],
        };
      });
      if (jsonData.length > 0) {
        Notification.success({
          closable: false,
          title: '导入成功',
          content: `总共${data.length}条数据, 成功导入${jsonData.length}条成员数据`,
        });
      } else {
        Notification.error({
          closable: false,
          title: '导入失败',
          content: `导入0条数据`,
        });
      }
      if (illegalItems.length > 0) {
        Notification.warning({
          closable: false,
          title: '警告',
          content: `有${illegalItems.length}条非法数据:\n${JSON.stringify(
            illegalItems
          )}`,
        });
      }
      props.setTableData(jsonData);
    };
    fileReader.readAsArrayBuffer(file);
    return false;
  };

  const colSpan = lang === 'zh-CN' ? 7 : 12;

  return (
    <div className={styles['search-form-wrapper']}>
      <Space size="large">
        <Form form={form}>
          <Form.Item
            label="搜索"
            style={{ width: 350, height: 30, marginBottom: 0 }}
            field="searchContent"
          >
            <Input
              ref={props.searchInputRef}
              allowClear
              placeholder="搜索学号或姓名"
              onChange={props.onSearch}
              onClear={() => {
                props.searchInputRef.current.dom.value = '';
                props.onSearch('');
              }}
            />
          </Form.Item>
        </Form>
        <Button
          style={{
            display: 'inline-block',
            width: 140,
            height: 30,
            float: 'right',
          }}
          icon={<IconDownload />}
          onClick={props.onExportTable}
        >
          导出成员名单
        </Button>
        <Upload
          style={{ display: 'inline-block', width: 140 }}
          accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          limit={1}
          beforeUpload={beforeUpload}
        >
          <Button
            style={{ display: 'inline-block', width: 140, height: 30 }}
            type="primary"
            icon={<IconUpload />}
          >
            上传成员名单
          </Button>
        </Upload>
        <Popconfirm
          title="确认清空成员列表？"
          onOk={() => {
            Message.success({
              content: '清除完毕',
            });
            props.onDeleteTable();
          }}
        >
          <Button
            style={{ display: 'inline-block', width: 115, height: 30 }}
            type="primary"
            status="danger"
            icon={<IconDelete />}
          >
            清空名单
          </Button>
        </Popconfirm>
      </Space>
    </div>
  );
}

export default SearchForm;
