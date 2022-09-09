import React, { useState, useEffect, ReactNode, useCallback } from 'react';
import {
  Grid,
  Card,
  Typography,
  Divider,
  Skeleton,
  Link,
  Select,
  Form,
} from '@arco-design/web-react';
import { useSelector } from 'react-redux';
import { IconCaretUp } from '@arco-design/web-react/icon';
import OverviewAreaLine from '@/components/Chart/overview-area-line';
import axios from 'axios';
import locale from './locale';
import useLocale from '@/utils/useLocale';
import styles from './style/overview.module.less';
import IconCalendar from './assets/calendar.svg';
import IconComments from './assets/comments.svg';
import IconContent from './assets/content.svg';
import IconIncrease from './assets/increase.svg';
import zhiHuiTuanJianApi from '@/api/zhiHuiTuanJian';
import dayjs from 'dayjs';

const { Row, Col } = Grid;
const { useForm } = Form;

type StatisticItemType = {
  icon?: ReactNode;
  title?: ReactNode;
  count?: ReactNode;
  loading?: boolean;
  unit?: ReactNode;
};

function StatisticItem(props: StatisticItemType) {
  const { icon, title, count, loading, unit } = props;
  return (
    <div className={styles.item}>
      <div className={styles.icon}>{icon}</div>
      <div>
        <Skeleton loading={loading} text={{ rows: 2, width: 60 }} animation>
          <div className={styles.title}>{title}</div>
          <div className={styles.count}>
            {count}
            <span className={styles.unit}>{unit}</span>
          </div>
        </Skeleton>
      </div>
    </div>
  );
}

type DataType = {
  allContents?: string;
  liveContents?: string;
  increaseComments?: string;
  growthRate?: string;
  chartData?: { count?: number; date?: string }[];
  down?: boolean;
};

type ChartDataType = {
  count?: number;
  date?: string;
}[];

function Overview() {
  const [data, setData] = useState<DataType>({});
  const [chartData, setChartData] = useState<ChartDataType>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const t = useLocale(locale);

  const userInfo = useSelector((state: any) => state.userInfo || {});
  const [options, setOptions] = useState([]);
  const [form] = useForm();

  const fetchChapterIds = () => {
    zhiHuiTuanJianApi.getDaXueXiChapter().then((res) => {
      setOptions(
        res.data.data.list.map((item) => ({
          label: item.name,
          value: item.id,
        }))
      );
      form.setFieldValue('chapterId', options[0]['value']);
    });
  };

  const fetchTable = () => {
    setLoading(true);
    const formParams = {
      chapterId: form.getFieldValue('chapterId'),
      pageSize: 99999,
    };
    zhiHuiTuanJianApi
      .getDaXueXiTable(userInfo.oid, {
        ...formParams,
      })
      .then((res) => {
        const chartData = {};
        res.data.data.list.forEach((item) => {
          const date = dayjs(item.createDate).format('YYYY-MM-DD');
          if (!(date in chartData)) {
            chartData[date] = 1;
          } else {
            chartData[date]++;
          }
        });
        const dataArray = [];
        let count = 0;
        for (const date in chartData) {
          if (chartData.hasOwnProperty(date)) {
            dataArray.push({ date: date, count: chartData[date] });
            count += chartData[date];
          }
        }
        console.log(dataArray);
        setChartData(dataArray);
        setTotalCount(count);
        setLoading(false);
      });
  };

  useEffect(() => {
    console.log(form.getFields());
    if (options.length != 0) {
      if (form.getFieldValue('chapterId') == null) {
        form.setFieldValue('chapterId', options[0]['value']);
      }
      return;
    }
    fetchChapterIds();
    fetchTable();
  }, [options]);

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

  const handleSubmit = (e) => {
    fetchTable();
  };

  return (
    <Card>
      <div>
        <Typography.Title
          heading={5}
          style={{ display: 'inline', float: 'left' }}
        >
          {t['workplace.welcomeBack']}
          {userInfo.username}
        </Typography.Title>
      </div>
      <Divider />
      <div className={styles.ctw}>
        <Typography.Paragraph
          className={styles['chart-title']}
          style={{ marginBottom: 0, marginTop: 0 }}
        >
          学习数统计
        </Typography.Paragraph>
        <Form
          style={{ float: 'right', width: 300, marginRight: 0 }}
          form={form}
        >
          <Form.Item style={{ width: 300 }} field="chapterId">
            <Select
              style={{ width: 300 }}
              allowClear={false}
              placeholder={'选择大学习期数'}
              onFocus={fetchChapter}
              onChange={handleSubmit}
              options={options}
            />
          </Form.Item>
        </Form>
      </div>
      <OverviewAreaLine data={chartData} loading={loading} />
      <div style={{ marginBottom: 0, textAlign: 'center' }}>
        <p>
          本期总学习数<b>{` ${totalCount}`}</b>
        </p>
      </div>
    </Card>
  );
}

export default Overview;
