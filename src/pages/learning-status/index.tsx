import React, { useState, useEffect } from 'react';
import {
  Table,
  Card,
  PaginationProps,
  Typography,
  Tag,
  Popover,
} from '@arco-design/web-react';
import useLocale from '@/utils/useLocale';
import SearchForm from './form';
import locale from './locale';
import isElectron from 'is-electron';
import { zhiHuiTuanJianDb } from '@/db/zhiHuiTuanJianDb';
import zhiHuiTuanJianApi from '@/api/zhiHuiTuanJian';
import { useSelector } from 'react-redux';

const { Title } = Typography;
const columns = [
  {
    title: '姓名',
    dataIndex: 'name',
    sorter: (a, b) => (a.name ? a.name.localeCompare(b.name) : false),
    render: (col, recorder) => {
      if (!recorder.name) return '-';
      return recorder.name.length < 8 ? (
        recorder.name
      ) : (
        <Popover
          title="姓名"
          content={
            <span>
              <p style={{ margin: 0 }}>{recorder.name}</p>
            </span>
          }
        >
          {recorder.name.substring(0, 5) + '...'}
        </Popover>
      );
    },
  },
  {
    title: '期数',
    dataIndex: 'dataName',
    sorter: (a, b) =>
      a.dataName ? a.dataName.localeCompare(b.dataName) : false,
  },
  {
    title: '支部',
    dataIndex: 'fullName',
    sorter: (a, b) =>
      a.fullName ? a.fullName.localeCompare(b.fullName) : false,
    render: (col, recorder) => {
      if (!recorder.fullName) return '-';
      const displayText =
        recorder.fullName.length > 15
          ? recorder.fullName.substring(
              recorder.fullName.length - 15,
              recorder.fullName.length - 3
            )
          : recorder.fullname;
      return (
        <Popover
          title="支部完整名"
          content={
            <span>
              <p style={{ margin: 0 }}>{recorder.fullName}</p>
            </span>
          }
        >
          {displayText}
        </Popover>
      );
    },
  },
  {
    title: '政治容貌',
    dataIndex: 'politicalStatus',
    sorter: (a, b) =>
      a.politicalStatus
        ? a.politicalStatus.localeCompare(b.politicalStatus)
        : false,
  },
  {
    title: '完成状态',
    dataIndex: 'ifComplete',
    render: (col, recorder) => {
      if (recorder.ifComplete == true) {
        return <Tag color="blue">已完成</Tag>;
      } else {
        return <Tag color="red">未完成</Tag>;
      }
    },
  },
  {
    title: '完成时间',
    dataIndex: 'createDate',
    sorter: (a, b) =>
      new Date(b.createDate).getTime() - new Date(a.createDate).getTime(),
  },
  {
    title: '邮箱',
    dataIndex: 'email',
    sorter: (a, b) => {
      return a.email ? a.email.localeCompare(b.email) : false;
    },
  },
];

function SearchTable() {
  const t = useLocale(locale);

  const [data, setData] = useState([]);
  const [pagination, setPatination] = useState<PaginationProps>({
    sizeCanChange: true,
    showTotal: true,
    pageSize: 99999,
    current: 1,
    pageSizeChangeResetCurrent: true,
  });
  const [loading, setLoading] = useState(true);
  const [formParams, setFormParams] = useState({});
  const [dataName, setDataName] = useState('');
  const userInfo = useSelector((state: any) => state.userInfo || {});

  useEffect(() => {
    fetchData();
  }, [pagination.current, pagination.pageSize, JSON.stringify(formParams)]);

  const getDBIdentifier = (dbItem) => {
    return [
      dbItem.name,
      dbItem.studentId.substring(1, 3),
      dbItem.studentId.substring(4, 6),
    ].join('-');
  };

  function fetchData() {
    const { current, pageSize } = pagination;
    setLoading(true);
    console.log(formParams);
    zhiHuiTuanJianApi
      .getDaXueXiTable(userInfo.oid, {
        pageNo: current,
        pageSize: pageSize,
        ...formParams,
      })
      .then(async (res) => {
        const members = await zhiHuiTuanJianDb.table('members').toArray();
        const emailMap = {};
        const politicalStatusMap = {};
        const completeList = [];
        // create email map: identifier(name-grade-class) -> email
        members.forEach((item) => {
          emailMap[getDBIdentifier(item)] = item.email;
          politicalStatusMap[getDBIdentifier(item)] = item.politicalStatus;
        });
        let dataList = res.data.data.list.map((item) => {
          // query email map, using identifier
          const length = item.fullName ? item.fullName.length : 0;
          const grade =
            length > 15
              ? item.fullName.substring(length - 11, length - 9)
              : 'unknown';
          const classNum =
            length > 15
              ? item.fullName.substring(length - 8, length - 6)
              : 'unknown';
          const identifier = item.name + '-' + grade + '-' + classNum;
          completeList.push(identifier);
          return {
            ...item,
            ifComplete: true,
            email: emailMap[identifier],
            politicalStatus: politicalStatusMap[identifier],
          };
        });
        // add incomplete members
        members.forEach((item) => {
          const identifier = getDBIdentifier(item);
          if (!completeList.includes(identifier)) {
            dataList.push({
              name: item.name,
              email: item.email,
              politicalStatus: item.politicalStatus,
              ifComplete: false,
            });
          }
        });
        // filter complete status
        dataList = dataList.filter((item) => {
          switch (formParams['ifComplete']) {
            case 'complete':
              return item.ifComplete;
            case 'incomplete':
              return !item.ifComplete;
            default:
              return true;
          }
        });
        setData(dataList);
        setPatination({
          ...pagination,
          current,
          pageSize,
          total: res.data.data.total,
        });
        setLoading(false);
      });
  }

  function onChangeTable(pagination) {
    setPatination(pagination);
  }

  function handleSearch(params) {
    setFormParams(params);
    fetchData();
  }

  function handleSendEmail() {
    if (!isElectron()) {
      alert('请在Electron里面执行');
      return;
    }
    const emailsToSend = data
      .filter((item) => !item.ifComplete)
      .map((item) => {
        return {
          name: item.name,
          address: item.email,
        };
      });
    // zhiHuiTuanJianDb
    //   .table('settings')
    //   .toArray()
    //   .then((array) => {
    //     const emailSettings = {};
    //     array.forEach((item) => {
    //       emailSettings[item['settingName']] = item['value'];
    //     });
    //     window.ipcRenderer.on('sendEmail-reply', (event, arg) => {
    //       if (arg.accepted.length != 0) {
    //         console.log(arg);
    //         Notification.success({
    //           closable: true,
    //           title: '发送成功',
    //           content: `${arg.accepted.length}封邮件发送成功`,
    //         });
    //       }
    //       if (arg.rejected.length != 0) {
    //         Notification.error({
    //           closable: true,
    //           title: '发送失败',
    //           content: `${arg.rejected.length}封邮件发送失败`,
    //         });
    //       }
    //     });
    //     zhiHuiTuanJianDb
    //       .table('settings')
    //       .where('settingName')
    //       .equalsIgnoreCase('template')
    //       .toArray()
    //       .then((array) => {
    //         if (array.length != 0) {
    //           window.ipcRenderer.send(
    //             'sendEmail',
    //             {
    //               host: emailSettings['emailServer'],
    //               port: emailSettings['emailServerPort'],
    //               secure: true,
    //               auth: {
    //                 user: emailSettings['emailAccount'],
    //                 pass: emailSettings['emailPassword'],
    //               },
    //             },
    //             {
    //               from: {
    //                 name: "树德书院",
    //                 address: emailSettings['emailAccount']
    //               },
    //               to: emailsToSend,
    //               subject: dataName + '未学习提醒邮件',
    //               text: '青年大学习提醒',
    //               html: array[0].value,
    //             }
    //           );
    //         } else {
    //           Message.error('请先设置邮件模板');
    //         }
    //       });
    //   });
  }

  function getUnCompleteCount() {
    return data.filter((item) => !item.ifComplete).length;
  }

  function getDataName() {
    return dataName;
  }

  return (
    <Card>
      <Title heading={6}>{t['menu.list.searchTable']}</Title>
      <SearchForm
        getDataName={getDataName}
        setDataName={setDataName}
        getUnCompleteCount={getUnCompleteCount}
        onSendEmail={handleSendEmail}
        onSearch={handleSearch}
      />
      <Table
        rowKey="id"
        loading={loading}
        onChange={onChangeTable}
        pagination={pagination}
        columns={columns}
        data={data}
      />
    </Card>
  );
}

export default SearchTable;
