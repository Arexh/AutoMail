import React from 'react';
import {
  Typography,
  Card,
  Grid,
  Button,
  Popconfirm,
  Message,
} from '@arco-design/web-react';
import Dexie from 'dexie';

const { Title } = Typography;
const { Row } = Grid;

function Example() {
  return (
    <>
      <Card style={{ width: 440 }}>
        <Title heading={6}>调试入口</Title>
        仅开发人员调试用, 非必要无需使用：
        <Row style={{ marginTop: 20 }}>
          <Popconfirm
            title="确定清空数据库?"
            onOk={() => {
              Dexie.delete('zhiHuiTuanJianDb');
              Message.success('数据库清除完毕!');
              setTimeout(() => {
                location.reload();
              }, 1000);
            }}
          >
            <Button>清空数据库</Button>
          </Popconfirm>
        </Row>
      </Card>
    </>
  );
}

export default Example;
