import React, { useContext, useState, useCallback, useEffect } from 'react';
import dayjs from 'dayjs';
import {
  Form,
  Select,
  DatePicker,
  Button,
  Grid,
  Popconfirm,
} from '@arco-design/web-react';
import { GlobalContext } from '@/context';
import locale from './locale';
import useLocale from '@/utils/useLocale';
import { IconEmail, IconDownload } from '@arco-design/web-react/icon';
import zhiHuiTuanJianApi from '@/api/zhiHuiTuanJian';
import styles from './style/index.module.less';

const { Row, Col } = Grid;
const { useForm } = Form;

function SearchForm(props: {
  mailBtnLoading: boolean;
  mailBtnText: string;
  onSearch: (values: Record<string, any>) => void;
  onSendEmail: () => void;
  getUnCompleteCount: () => any;
  setDataName: (string) => void;
  getDataName: () => string;
  handleExportUnlearnedList: () => void;
  handleExportCompleteList: () => void;
}) {
  const { lang } = useContext(GlobalContext);

  const t = useLocale(locale);
  const [form] = useForm();
  const [showMailBtn, setShowMailBtn] = useState(false);

  const handleSubmit = (e) => {
    const values = form.getFieldsValue();
    const date = values['date'];
    delete values['date'];
    console.log(options);
    const matchOption = options.find(
      ({ value }) => value == values['chapterId']
    );
    if (options.length > 0 && options[0]['value'] == values['chapterId']) {
      props.setDataName(options[0]['label']);
      setShowMailBtn(true);
    } else {
      props.setDataName(matchOption['label']);
      setShowMailBtn(false);
    }
    props.onSearch({
      beginTime: date ? date['begin'] : undefined,
      endTime: date ? date['end'] : undefined,
      ...values,
    });
  };

  const handleReset = () => {
    form.resetFields();
    props.onSearch({});
  };

  const handleSendEmail = () => {
    props.onSendEmail();
  };

  const colSpan = lang === 'zh-CN' ? 8 : 12;
  const [options, setOptions] = useState([]);

  const fetchChapter = useCallback(() => {
    zhiHuiTuanJianApi.getDaXueXiChapter().then((res) => {
      setOptions(
        res.data.data.list.map((item) => ({
          label: item.name,
          value: item.id,
        }))
      );
    });
  }, [options]);

  const ifCompleteOptions = [
    {
      label: '全部',
      value: 'all',
    },
    {
      label: '已完成',
      value: 'complete',
    },
    {
      label: '未完成',
      value: 'incomplete',
    },
  ];

  useEffect(() => {
    if (options.length != 0) {
      if (form.getFieldValue('chapterId') == null) {
        form.setFieldValue('chapterId', options[0]['value']);
        props.setDataName(options[0]['label']);
        setShowMailBtn(true);
      }
      return;
    }
    zhiHuiTuanJianApi.getDaXueXiChapter().then((res) => {
      setOptions(
        res.data.data.list.map((item) => ({
          label: item.name,
          value: item.id,
        }))
      );
      form.setFieldValue('chapterId', options[0]['value']);
      props.setDataName(res.data.data.list[0].name);
    });
  }, [options]);

  return (
    <>
      <div className={styles['search-form-wrapper']}>
        <Form
          form={form}
          className={styles['search-form']}
          labelAlign="left"
          labelCol={{ span: 7 }}
          wrapperCol={{ span: 16 }}
        >
          <Row gutter={24}>
            <Col span={colSpan}>
              <Form.Item label={'大学习期数'} field="chapterId">
                <Select
                  placeholder={'选择大学习期数'}
                  onFocus={fetchChapter}
                  onChange={handleSubmit}
                  options={options}
                />
              </Form.Item>
            </Col>
            <Col span={10}>
              <Form.Item
                label={'完成时间'}
                field="date"
                normalize={(value) => {
                  return { begin: value && value[0], end: value && value[1] };
                }}
                formatter={(value) => {
                  return value && value.begin ? [value.begin, value.end] : [];
                }}
              >
                <DatePicker.RangePicker
                  allowClear
                  onChange={handleSubmit}
                  style={{ width: '100%' }}
                  disabledDate={(date) => dayjs(date).isAfter(dayjs())}
                />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item label={'是否完成'} field="ifComplete">
                <Select
                  placeholder={'过滤完成状态'}
                  onChange={handleSubmit}
                  options={ifCompleteOptions}
                  allowClear
                />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </div>
      <div className={styles['search-form-btn-wrapper']}>
        <Popconfirm
          title={`是否确定向未学习的${props.getUnCompleteCount()}个成员发送邮件?`}
          onOk={handleSendEmail}
        >
          {showMailBtn && (
            <Button
              loading={props.mailBtnLoading}
              style={{ marginRight: 40 }}
              type="primary"
              icon={<IconEmail />}
            >
              {props.mailBtnText}
            </Button>
          )}
        </Popconfirm>
        <Button
          style={{ marginRight: 40 }}
          type="secondary"
          onClick={props.handleExportUnlearnedList}
          icon={<IconDownload />}
        >
          导出未学习名单
        </Button>
        <Button
          style={{ marginRight: 40 }}
          type="secondary"
          onClick={props.handleExportCompleteList}
          icon={<IconDownload />}
        >
          导出完整名单
        </Button>
      </div>
    </>
  );
}

export default SearchForm;
