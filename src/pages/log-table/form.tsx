import React from 'react';
import { Form, Input, Space } from '@arco-design/web-react';
import styles from './style/index.module.less';

const { useForm } = Form;

function SearchForm(props: {
  onSearch: (event: any) => void;
  searchInputRef: any;
}) {
  const [form] = useForm();

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
              placeholder="搜索姓名或邮箱"
              onChange={props.onSearch}
              onClear={() => {
                props.searchInputRef.current.dom.value = '';
                props.onSearch('');
              }}
            />
          </Form.Item>
        </Form>
      </Space>
    </div>
  );
}

export default SearchForm;
