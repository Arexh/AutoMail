import React, { useState, useEffect } from 'react';
import {
  Table,
  Card,
  PaginationProps,
  Typography,
  Popover,
  Tag,
} from '@arco-design/web-react';
import useLocale from '@/utils/useLocale';
import SearchForm from './form';
import locale from './locale';
import * as XLSX from 'xlsx';
import { zhiHuiTuanJianDb } from '@/db/zhiHuiTuanJianDb';
import { useLiveQuery } from 'dexie-react-hooks';
import Fuse from 'fuse.js';
import { useSelector } from 'react-redux';

const { Title } = Typography;

function SearchTable() {
  const t = useLocale(locale);
  const searchInputRef = React.useRef(null);
  const userInfo = useSelector((state: any) => state.userInfo || {});
  const columns = [
    {
      title: '大学习期数',
      dataIndex: 'dataName',
      sorter: (a, b) => a.dataName.localeCompare(b.dataName),
    },
    {
      title: '姓名',
      dataIndex: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      sorter: (a, b) => a.email.localeCompare(b.email),
    },
    {
      title: '状态',
      dataIndex: 'status',
      sorter: (a, b) => a.status.localeCompare(b.status),
      render: (col, recorder) => {
        if (recorder.status == '发送成功') {
          return <Tag color="green">成功</Tag>;
        } else {
          return <Tag color="red">失败</Tag>;
        }
      },
    },
    {
      title: '时间',
      dataIndex: 'time',
      sorter: (a, b) => a.time.localeCompare(b.time),
    },
    {
      title: '失败原因',
      dataIndex: 'reason',
      sorter: (a, b) => a.reason.localeCompare(b.reason),
      render: (col, recorder) => {
        if (!recorder.reason || recorder.reason == '-') return '-';
        return (
          <Popover
            title="发送失败原因"
            content={
              <span>
                <p style={{ margin: 0 }}>{recorder.reason}</p>
              </span>
            }
          >
            <u>悬浮查看</u>
          </Popover>
        );
      },
    },
  ];

  const [data, setData] = useState([]);
  const [pagination, setPatination] = useState<PaginationProps>({
    showTotal: true,
    pageSize: 100,
    current: 1,
    pageSizeChangeResetCurrent: true,
  });
  const [loading, setLoading] = useState(true);
  const [formParams, setFormParams] = useState({});
  const [displayMember, setDisplayMember] = useState([]);
  const members = useLiveQuery(() => {
    const result = zhiHuiTuanJianDb
      .table('sendLogs')
      .where('oid')
      .equals(userInfo.oid)
      .toArray();
    result.then((res) => {
      console.log(res);
      displayFilteredContent(res.reverse());
    });
    return result;
  });

  useEffect(() => {
    fetchData();
  }, [pagination.current, pagination.pageSize, JSON.stringify(formParams)]);

  function fetchData() {
    setLoading(false);
    setData(members);
  }

  function onChangeTable(pagination) {
    setPatination(pagination);
  }

  function displayFilteredContent(inputMembers) {
    if (
      searchInputRef == null ||
      searchInputRef.current == null ||
      searchInputRef.current.dom.value.length == 0
    ) {
      setDisplayMember(inputMembers);
    } else {
      const value = searchInputRef.current.dom.value;
      const fuse = new Fuse(inputMembers, {
        keys: ['name', 'email'],
        threshold: 0.1,
      });
      setDisplayMember(fuse.search(value).map((i) => i.item));
    }
  }

  function handleSearch() {
    displayFilteredContent(members);
  }

  return (
    <Card>
      <Title heading={6}>邮件发送日志</Title>
      <SearchForm searchInputRef={searchInputRef} onSearch={handleSearch} />
      <Table
        rowKey="id"
        loading={loading}
        onChange={onChangeTable}
        pagination={pagination}
        columns={columns}
        data={displayMember}
      />
    </Card>
  );
}

export default SearchTable;
