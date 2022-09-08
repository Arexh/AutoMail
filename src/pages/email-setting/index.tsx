import React, { useState } from 'react';
import {
  Typography,
  Card,
  Grid,
  Form,
  Input,
  Button,
  Space,
  InputNumber,
  Message,
  Slider,
  Popover,
} from '@arco-design/web-react';
import Editor from '@/components/Editor';
import { zhiHuiTuanJianDb } from '@/db/zhiHuiTuanJianDb';
import isElectron from 'is-electron';
import { IconQuestionCircle } from '@arco-design/web-react/icon';

const { Title } = Typography;
const { Row } = Grid;
const FormItem = Form.Item;
const { useForm } = Form;

function Example() {
  const [emailSettingForm] = useForm();
  const [testSendDisabled, setTestSendDisabled] = useState(true);

  console.log(zhiHuiTuanJianDb.table('settings'));
  zhiHuiTuanJianDb
    .table('settings')
    .toArray()
    .then((array) => {
      console.log(array);
      const settings = array.map((item) => {
        return {
          [item['settingName']]: item['value'],
        };
      });
      settings.forEach((item) => emailSettingForm.setFieldsValue(item));
      const settingDict = emailSettingForm.getFieldsValue();
      if (
        !settingDict.eA ||
        !settingDict.eP ||
        !settingDict.eS ||
        !settingDict.p
      ) {
        setTestSendDisabled(true);
      } else {
        setTestSendDisabled(false);
      }
    });

  const handleSaveEmailSettings = () => {
    const settingDict = emailSettingForm.getFieldsValue();
    console.log(settingDict);
    if (!settingDict.batchSize) {
      settingDict.batchSize = 50;
    }
    if (
      !settingDict.eA ||
      !settingDict.eP ||
      !settingDict.eS ||
      !settingDict.p
    ) {
      setTestSendDisabled(true);
      Message.error('邮箱设置不能为空!');
    } else {
      setTestSendDisabled(false);
      Message.success('邮件设置保存成功！请点击"发送测试邮件"按钮测试!');
    }
    const batchData = Object.keys(settingDict).map((i) => {
      return { settingName: i, value: settingDict[i] };
    });
    batchData.forEach((item) => zhiHuiTuanJianDb.table('settings').put(item));
  };
  const handleSendTestMail = () => {
    if (isElectron()) {
      const emailSettings = emailSettingForm.getFieldsValue();
      window.ipcRenderer
        .invoke(
          'sendEmail',
          {
            host: emailSettings.eS,
            port: emailSettings.p,
            secure: true,
            auth: {
              user: emailSettings.eA,
              pass: emailSettings.eP,
            },
          },
          {
            from: `"测试发件人姓名" <${emailSettings.eA}>`, // sender address
            to: emailSettings.eA,
            subject: '测试邮件标题',
            text: '文本内容',
            html: '<h1>Html内容</h1>',
          }
        )
        .then((res) => {
          Message.success('测试邮件发送成功!');
        })
        .catch((error) => {
          Message.error(String(error));
          Message.error('邮箱设置有误, 请检查!');
        });
    } else {
      Message.error('请在Electron里面执行');
    }
  };

  return (
    <>
      <Row>
        <Card style={{ width: 440 }}>
          <Title heading={6}>第一步：发件邮箱设置（必填）</Title>
          填写发件邮箱账号、密码以及对应服务器和端口：
          <Row style={{ marginTop: 20 }}>
            <Form autoComplete="off" form={emailSettingForm}>
              <input
                type="text"
                id="email"
                value=""
                style={{ opacity: 0, position: 'absolute', left: '-100000px' }}
                readOnly={true}
              />
              <input
                type="password"
                id="password"
                value=""
                style={{ opacity: 0, position: 'absolute', left: '-100000px' }}
                readOnly={true}
              />
              <Space direction="vertical">
                <FormItem
                  label="账号"
                  field="eA"
                  rules={[
                    {
                      type: 'email',
                      required: true,
                      message: '邮箱账号不合法',
                    },
                  ]}
                >
                  <Input autoComplete="none" placeholder="请输入你的账号..." />
                </FormItem>
                <FormItem
                  label="密码"
                  field="eP"
                  rules={[
                    {
                      type: 'string',
                      required: true,
                      message: '邮箱密码不能为空',
                    },
                  ]}
                >
                  <Input.Password
                    autoComplete="off"
                    placeholder="请输入你的密码..."
                  />
                </FormItem>
                <FormItem
                  label="服务器"
                  field="eS"
                  rules={[
                    {
                      type: 'string',
                      required: true,
                      message: '服务器域名不能为空',
                    },
                  ]}
                >
                  <Input
                    autoComplete="false"
                    placeholder="请输入邮箱的服务器域名..."
                  />
                </FormItem>
                <FormItem
                  label="端口号"
                  field="p"
                  rules={[
                    {
                      type: 'number',
                      required: true,
                      message: '端口号需为数字',
                    },
                  ]}
                >
                  <InputNumber placeholder="请输入邮箱服务器端口号..." />
                </FormItem>
                <FormItem
                  label={
                    <Popover
                      title="批量大小"
                      content={
                        <span>
                          <p style={{ margin: 0 }}>
                            当群发邮件数量过多时, 邮件将分组发送,
                            每组包含的邮件数量即批量大小.
                          </p>
                          <p style={{ margin: 0 }}>
                            <b>例如</b>: 设置的批量大小为50,
                            当前要群发的邮件有70封,
                            那么邮件将拆分成50+20两组分别发送.
                          </p>
                        </span>
                      }
                    >
                      <span className="hover-text">
                        批量大小
                        <IconQuestionCircle
                          style={{ verticalAlign: 'super', fontSize: 11 }}
                        />
                      </span>
                    </Popover>
                  }
                  field="batchSize"
                >
                  <Slider
                    style={{ width: 250, marginTop: 10 }}
                    defaultValue={50}
                    min={1}
                    max={100}
                    marks={{
                      0: '0',
                      25: '25',
                      50: '50',
                      75: '75',
                      100: '100',
                    }}
                  />
                </FormItem>
              </Space>
              <Row justify="end">
                <Button
                  type="primary"
                  style={{ marginRight: 10 }}
                  onClick={handleSaveEmailSettings}
                >
                  保存
                </Button>
                <Button
                  onClick={handleSendTestMail}
                  disabled={testSendDisabled}
                >
                  发送测试邮件
                </Button>
              </Row>
            </Form>
          </Row>
        </Card>

        <Card
          style={{
            marginLeft: 40,
            width: 'calc(100% - 480px)',
            minWidth: 400,
            height: '100%',
          }}
        >
          <Title heading={6}>{'《邮箱配置指南》'}</Title>
        </Card>
      </Row>

      <Row>
        <Card
          style={{
            marginTop: 40,
            width: '100%',
            minWidth: 840,
            height: '500%',
          }}
        >
          <Title heading={6}>第二步：邮件模板（必填）</Title>
          未完成大学习的成员将收到以下内容：
          <div style={{ marginTop: 16 }}>
            <Editor defaultValue="" />
          </div>
        </Card>
      </Row>
    </>
  );
}

export default Example;
