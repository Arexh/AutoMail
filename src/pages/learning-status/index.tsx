import React, { useState, useEffect } from 'react';
import {
  Table,
  Card,
  PaginationProps,
  Typography,
  Tag,
  Popover,
  Message,
  Notification,
} from '@arco-design/web-react';
import useLocale from '@/utils/useLocale';
import SearchForm from './form';
import locale from './locale';
import isElectron from 'is-electron';
import { zhiHuiTuanJianDb } from '@/db/zhiHuiTuanJianDb';
import zhiHuiTuanJianApi from '@/api/zhiHuiTuanJian';
import { useSelector } from 'react-redux';
import * as XLSX from 'xlsx';
import dayjs from 'dayjs';

const MAIL_BTN_TEXT = '第四步: 向未学习成员发送邮件';
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
  const [mailBtnLoading, setMailBtnLoading] = useState(false);
  const [mailBtnText, setMailBtnText] = useState(MAIL_BTN_TEXT);
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
        const members = await zhiHuiTuanJianDb
          .table('members')
          .where('oid')
          .equals(userInfo.oid)
          .toArray();
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

  async function handleSendEmail() {
    if (!isElectron()) {
      alert('请在Electron里面执行');
      return;
    }
    const settingArray = await zhiHuiTuanJianDb
      .table('settings')
      .where('oid')
      .equals(userInfo.oid)
      .toArray();
    const emailSettings = {};
    settingArray.forEach((item) => {
      emailSettings[item['settingName']] = item['value'];
    });
    if (
      !emailSettings['eA'] ||
      !emailSettings['eP'] ||
      !emailSettings['eS'] ||
      !emailSettings['p'] ||
      !emailSettings['sender']
    ) {
      Message.error('邮箱设置不能为空! 请配置发件邮箱!');
      return;
    }
    const existMatch = data.find((item) => item.email);
    if (!existMatch) {
      Message.error('成员列表尚未配置! 请先上传成员名单!');
      return;
    }
    console.log(existMatch);
    const emailsToSend = data
      .filter((item) => !item.ifComplete)
      .map((item) => {
        return {
          name: item.name,
          address: item.email,
        };
      });
    setMailBtnLoading(true);
    const mailParams = {
      host: emailSettings['eS'],
      port: emailSettings['p'],
      secure: true,
      auth: {
        user: emailSettings['eA'],
        pass: emailSettings['eP'],
      },
    };
    const mailTemplate = emailSettings['template'];
    const mailBatchSize = emailSettings['batchSize'];
    const mailContent = {
      from: {
        name: emailSettings['sender'],
        address: emailSettings['eA'],
      },
      subject: dataName + '-未学习提醒邮件',
      text: dataName + '学习提醒',
      html: mailTemplate,
    };
    const tasks = [];
    for (let i = 0; i < emailsToSend.length; i += mailBatchSize) {
      const batchEmails = emailsToSend.slice(
        i,
        Math.min(i + mailBatchSize, emailsToSend.length)
      );
      const batchMailContent = { ...mailContent };
      batchMailContent['to'] = batchEmails;
      tasks.push(
        window.ipcRenderer.invoke('sendEmail', mailParams, batchMailContent)
      );
    }
    // run series task
    const expectedCount =
      mailBatchSize < emailsToSend.length
        ? Math.ceil(emailsToSend.length / mailBatchSize)
        : 1;
    setMailBtnText(`正在发送邮件, 共 ${expectedCount} 个批次...`);
    const result = await Promise.all(tasks);
    setMailBtnLoading(false);
    setMailBtnText(MAIL_BTN_TEXT);

    let successMails = [];
    let failMails = [];
    let rejectedReasons = [];
    let count = 0;
    result.forEach((item) => {
      console.log(item);
      console.log(item['accepted']);
      if (item.accepted) {
        successMails = successMails.concat(item.accepted);
      }
      if (item.rejected) {
        failMails = failMails.concat(item.rejected);
        rejectedReasons = rejectedReasons.concat(item.rejectedErrors);
      }
      if (!item.accepted && !item.rejected) {
        const leftBound = count * mailBatchSize;
        const batchFailedMails = emailsToSend.slice(
          leftBound,
          Math.min(emailsToSend.length, leftBound + mailBatchSize)
        );
        failMails = failMails.concat(
          batchFailedMails.map((item) => item.address)
        );
        batchFailedMails.forEach((_) => rejectedReasons.push(item));
      }
      count++;
    });
    console.log(successMails);
    console.log(failMails);
    console.log(rejectedReasons);
    const summary = [];
    successMails.forEach((item) => {
      const searchResult = emailsToSend.find(
        (element) => element.address == item
      );
      summary.push({
        大学习期数: dataName,
        姓名: searchResult ? searchResult.name : '-',
        邮箱: item,
        状态: '发送成功',
        时间: dayjs().format('YYYY-MM-DD HH:mm:ss'),
        失败原因: '-',
      });
    });
    for (let i = 0; i < failMails.length; i++) {
      const searchResult = emailsToSend.find(
        (element) => element.address == failMails[i]
      );
      summary.push({
        大学习期数: dataName,
        姓名: searchResult ? searchResult.name : '-',
        邮箱: failMails[i],
        状态: '发送失败',
        时间: dayjs().format('YYYY-MM-DD HH:mm:ss'),
        失败原因: rejectedReasons[i].message
          ? rejectedReasons[i].message
          : rejectedReasons[i],
      });
    }
    const batchData = summary.map((item) => {
      return {
        oid: userInfo.oid,
        dataName: item['大学习期数'],
        name: item['姓名'],
        email: item['邮箱'],
        status: item['状态'],
        time: item['时间'],
        reason: item['失败原因'],
      };
    });
    zhiHuiTuanJianDb.table('sendLogs').bulkPut(batchData);
    Notification.info({
      closable: true,
      title: '邮件发送情况',
      content: `共 ${emailsToSend.length} 个收件人, ${successMails.length} 个邮箱发送成功, ${failMails.length} 个邮箱发送失败.`,
    });
  }

  function exportData(exportedData, exportTableFileName, widths) {
    const worksheet = XLSX.utils.json_to_sheet(exportedData);
    const workbook = XLSX.utils.book_new();
    worksheet['!cols'] = widths.map((item) => {
      return { width: item };
    });
    console.log(worksheet['!cols']);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Member');
    XLSX.writeFile(workbook, exportTableFileName);
  }

  function handleExportUnlearnedList() {
    exportData(
      data
        .filter((item) => item.fullName == undefined)
        .map((item) => {
          return {
            姓名: item.name,
            大学习期数: dataName,
            是否学习: '否',
            邮箱: item.email,
          };
        }),
      `${userInfo.username}-${dataName}-未学习名单.xlsx`,
      [10, 30, 10, 30]
    );
    Message.success(`导出《${dataName}》未学习名单成功！`);
  }

  function handleExportCompleteList() {
    exportData(
      data.map((item) => {
        return {
          姓名: item.name,
          大学习期数: dataName,
          部门: item.fullName,
          是否学习: item.fullName == undefined ? '否' : '是',
          邮箱: item.email,
        };
      }),
      `${userInfo.username}-${dataName}-完整名单.xlsx`,
      [10, 30, 57, 10, 30]
    );
    Message.success(`导出《${dataName}》完整名单成功！`);
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
        formData={data}
        mailBtnLoading={mailBtnLoading}
        mailBtnText={mailBtnText}
        getDataName={getDataName}
        setDataName={setDataName}
        getUnCompleteCount={getUnCompleteCount}
        onSendEmail={handleSendEmail}
        onSearch={handleSearch}
        handleExportUnlearnedList={handleExportUnlearnedList}
        handleExportCompleteList={handleExportCompleteList}
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
