import React, { useState, useEffect } from 'react';
import {
  Table,
  Card,
  PaginationProps,
  Typography,
  Message,
  Button,
  Notification,
  Popconfirm,
} from '@arco-design/web-react';
import useLocale from '@/utils/useLocale';
import SearchForm from './form';
import locale from './locale';
import * as XLSX from 'xlsx';
import { zhiHuiTuanJianDb } from '@/db/zhiHuiTuanJianDb';
import { useLiveQuery } from 'dexie-react-hooks';
import Fuse from 'fuse.js';
import { IconDelete, IconEdit } from '@arco-design/web-react/icon';

const { Title } = Typography;
const exportTableFileName = '团支部-成员名单.xlsx';
const emailRegex = new RegExp(/^\d{8}@mail.sustech.edu.cn$/);

function SearchTable() {
  const t = useLocale(locale);
  const searchInputRef = React.useRef(null);
  const columns = [
    {
      title: '学号',
      dataIndex: 'studentId',
      sorter: (a, b) => a.studentId.localeCompare(b.studentId),
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
      title: '年级',
      dataIndex: 'grade',
      render: (col, recorder) => {
        if (emailRegex.test(recorder.email)) {
          return recorder.email.substring(1, 3);
        } else {
          return '-';
        }
      },
    },
    {
      title: '班级',
      dataIndex: 'class',
      render: (col, recorder) => {
        if (emailRegex.test(recorder.email)) {
          return recorder.email.substring(4, 6);
        } else {
          return '-';
        }
      },
    },
    {
      title: '政治容貌',
      dataIndex: 'politicalStatus',
      sorter: (a, b) => a.politicalStatus.localeCompare(b.politicalStatus),
    },
    {
      title: '删除记录',
      dataIndex: 'op',
      render: (_, record) => (
        <Popconfirm
          title="确认删除该记录？"
          onOk={() => {
            zhiHuiTuanJianDb
              .table('members')
              .where('studentId')
              .equals(record.studentId)
              .delete();
            Notification.success({
              closable: false,
              title: '删除成功',
              content: `删除记录：${record.studentId}-${record.name}-\n${record.email}-${record.politicalStatus}.`,
            });
          }}
        >
          <Button status="danger" icon={<IconDelete />}></Button>
        </Popconfirm>
      ),
    },
  ];

  const [data, setData] = useState([]);
  const [pagination, setPatination] = useState<PaginationProps>({
    showTotal: true,
    pageSize: 99999,
    current: 1,
    pageSizeChangeResetCurrent: true,
  });
  const [loading, setLoading] = useState(true);
  const [formParams, setFormParams] = useState({});
  const [displayMember, setDisplayMember] = useState([]);
  const members = useLiveQuery(() => {
    const result = zhiHuiTuanJianDb.table('members').toArray();
    result.then((res) => {
      displayFilteredContent(res);
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
      searchInputRef.current.dom.value.length == 0
    ) {
      setDisplayMember(inputMembers);
    } else {
      const value = searchInputRef.current.dom.value;
      const fuse = new Fuse(inputMembers, {
        keys: ['studentId', 'name'],
        threshold: 0.1,
      });
      setDisplayMember(fuse.search(value).map((i) => i.item));
    }
  }

  function handleSearch() {
    displayFilteredContent(members);
  }

  function setTableData(data) {
    const batchData = data.map((value) => {
      return {
        studentId: value.studentId,
        name: value.name,
        email: value.email,
        politicalStatus: value.politicalStatus,
      };
    });
    zhiHuiTuanJianDb
      .table('members')
      .bulkPut(batchData)
      .then(() => setData(members));
  }

  function onDeleteTable() {
    zhiHuiTuanJianDb.table('members').clear();
  }

  function onExportTable() {
    let exportData = [];
    if (Array.isArray(members) && members.length == 0) {
      exportData = [
        {
          Name: '学生姓名',
          Email: 'example@mail.com',
          PoliticalStatus: '政治容貌(团员、预备党员或正式党员)',
        },
      ];
    } else {
      exportData = members.map((i) => {
        return {
          姓名: i.name,
          邮箱: i.email,
          政治面貌: i.politicalStatus,
        };
      });
    }
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    worksheet['!cols'] = [{ width: 16 }, { width: 28 }, { width: 14 }];
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Member');
    XLSX.writeFile(workbook, exportTableFileName);
    Message.success('导出学生名单成功！');
  }

  return (
    <Card>
      <Title heading={6}>第三步：导入、查看成员列表</Title>
      <div style={{ marginBottom: 20 }}>
        导入关联学生姓名和学生邮箱的Excel (格式为姓名 - 邮箱 - 政治面貌),
        不支持重名学生 (需手动发邮件):
        <span style={{ float: 'right', fontSize: 16 }}>
          目前共有 <b>{members ? members.length : '-'}</b> 条数据
        </span>
      </div>
      <SearchForm
        searchInputRef={searchInputRef}
        onDeleteTable={onDeleteTable}
        onExportTable={onExportTable}
        setTableData={setTableData}
        onSearch={handleSearch}
      />
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
