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
} from '@arco-design/web-react';
import Editor from '@/components/Editor';
import { zhiHuiTuanJianDb } from '@/db/zhiHuiTuanJianDb';

const { Title } = Typography;
const { Row } = Grid;
const FormItem = Form.Item;
const { useForm } = Form;

function Example() {
  const [emailSettingForm] = useForm();
  const [testSendDisabled, setTestSendDisabled] = useState(true);

  zhiHuiTuanJianDb
    .table('settings')
    .toArray()
    .then((array) => {
      const settings = array.map((item) => {
        return {
          [item['settingName']]: item['value'],
        };
      });
      settings.forEach((item) => emailSettingForm.setFieldsValue(item));
    });

  const handleSaveEmailSettings = () => {
    const settingDict = emailSettingForm.getFieldsValue();
    if (
      settingDict.eA == undefined ||
      settingDict.eP == undefined ||
      settingDict.eS == undefined ||
      settingDict.p == undefined
    ) {
      setTestSendDisabled(true);
    } else {
      const batchData = Object.keys(settingDict).map((i) => {
        return { settingName: i, value: settingDict[i] };
      });
      batchData.forEach((item) => zhiHuiTuanJianDb.table('settings').put(item));
      setTestSendDisabled(false);
      Message.success('邮件设置保存成功！');
    }
  };
  const handleSendTestMail = () => {
    alert('请在Electron里面执行');
    // if (isElectron()) {
    //   const emailSettings = emailSettingForm.getFieldsValue();
    //   window.ipcRenderer.on('sendEmail-reply', (event, arg) => {
    //     console.log(event);
    //     console.log(arg);
    //   });
    //   window.ipcRenderer.send(
    //     'sendEmail',
    //     {
    //       host: emailSettings.emailServer,
    //       port: emailSettings.emailServerPort,
    //       secure: true,
    //       auth: {
    //         user: emailSettings.emailAccount,
    //         pass: emailSettings.emailPassword,
    //       },
    //     },
    //     {
    //       from: `"测试发件人姓名" <${emailSettings.emailAccount}>`, // sender address
    //       to: emailSettings.emailAccount,
    //       subject: '测试邮件标题',
    //       text: '文本内容',
    //       html: '<h1>Html内容</h1>',
    //     }
    //   );
    // } else {
    //   alert('请在Electron里面执行');
    // }
  };

  return (
    <>
      <Row>
        <Card style={{ width: 400 }}>
          <Title heading={6}>第一步：发件邮箱设置（必填）</Title>
          填写发件邮箱账号、密码以及对应服务器和端口：
          <Row style={{ marginTop: 16 }}>
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
              </Space>
              <Row justify="end">
                <Button
                  type="primary"
                  style={{ marginRight: 10 }}
                  onClick={handleSaveEmailSettings}
                >
                  应用
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
            width: 'calc(100% - 440px)',
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
          收件人收到的内容：
          <div style={{ marginTop: 16 }}>
            <Editor defaultValue="" />
          </div>
        </Card>
      </Row>
    </>
  );
}

export default Example;
