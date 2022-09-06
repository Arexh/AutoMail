import {
  Form,
  Input,
  Checkbox,
  Link,
  Button,
  Space,
} from '@arco-design/web-react';
import { FormInstance } from '@arco-design/web-react/es/Form';
import { IconLock, IconUser } from '@arco-design/web-react/icon';
import React, { useEffect, useRef, useState } from 'react';
import useStorage from '@/utils/useStorage';
import useLocale from '@/utils/useLocale';
import locale from './locale';
import styles from './style/index.module.less';
import zhiHuiTuanJianApi from '@/api/zhiHuiTuanJian';
import { useHistory } from 'react-router-dom';

export default function LoginForm() {
  const formRef = useRef<FormInstance>();
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [loginParams, setLoginParams, removeLoginParams] =
    useStorage('loginParams');
  const [loginValidCodeImg, setLoginValidCodeImg] = useState(null);
  const history = useHistory();

  const t = useLocale(locale);

  const [rememberPassword, setRememberPassword] = useState(!!loginParams);

  const handleGetLoginValidCode = () => {
    formRef.current.setFieldValue('loginValidCode', undefined);
    zhiHuiTuanJianApi.getLoginValidCode().then((res) => {
      const binaryData = [];
      binaryData.push(res.data);
      const image = (window.URL ? URL : webkitURL).createObjectURL(
        new Blob(binaryData)
      );
      setLoginValidCodeImg(image);
    });
  };

  function afterLoginSuccess(params) {
    // 记住密码
    if (rememberPassword) {
      setLoginParams(JSON.stringify(params));
    } else {
      removeLoginParams();
    }
    // 记录登录状态
    localStorage.setItem('userStatus', 'login');
    // 跳转首页
    history.push('/');
    window.location.reload();
  }

  function login(params) {
    setErrorMessage('');
    setLoading(true);
    const username = params.userName;
    const password = params.password;
    const loginValidCode = params.loginValidCode;
    formRef.current.setFieldValue('loginValidCode', undefined);
    console.log(params);
    if (!loginValidCode) {
      zhiHuiTuanJianApi
        .login(username, password)
        .then((res) => {
          console.log('login');
          console.log(res);
          const { status, msg } = res.data;
          if (status == 'OK') {
            afterLoginSuccess(params);
          } else {
            setErrorMessage(msg || t['login.form.login.errMsg']);
            handleGetLoginValidCode();
          }
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      zhiHuiTuanJianApi
        .loginWithValid(username, password, loginValidCode)
        .then((res) => {
          console.log('loginWithValid');
          console.log(res);
          const { status, msg } = res.data;
          if (status == 'OK') {
            afterLoginSuccess(params);
          } else {
            setErrorMessage(msg || t['login.form.login.errMsg']);
            handleGetLoginValidCode();
          }
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }

  function onSubmitClick() {
    formRef.current.validate().then((values) => {
      login(values);
    });
  }

  // 读取 localStorage，设置初始值
  useEffect(() => {
    const rememberPassword = !!loginParams;
    setRememberPassword(rememberPassword);
    if (formRef.current && rememberPassword) {
      const parseParams = JSON.parse(loginParams);
      formRef.current.setFieldsValue(parseParams);
    }
  }, [loginParams]);

  return (
    <div className={styles['login-form-wrapper']}>
      <div className={styles['login-form-title']}>智慧团建登录</div>
      <div className={styles['login-form-error-msg']}>{errorMessage}</div>
      <Form className={styles['login-form']} layout="vertical" ref={formRef}>
        <Form.Item
          field="userName"
          rules={[{ required: true, message: t['login.form.userName.errMsg'] }]}
        >
          <Input
            prefix={<IconUser />}
            placeholder={'输入智慧团建账号'}
            onPressEnter={onSubmitClick}
          />
        </Form.Item>
        <Form.Item
          field="password"
          rules={[{ required: true, message: t['login.form.password.errMsg'] }]}
        >
          <Input.Password
            prefix={<IconLock />}
            placeholder={'输入智慧团建密码'}
            onPressEnter={onSubmitClick}
          />
        </Form.Item>
        <Form.Item
          className={loginValidCodeImg ? undefined : styles['hide']}
          field="loginValidCode"
          style={{
            width: '320px',
          }}
        >
          <Input placeholder="请输入验证码..." />
        </Form.Item>
        {loginValidCodeImg && (
          <img
            style={{
              width: '100px',
            }}
            src={loginValidCodeImg}
          />
        )}
        <Space size={16} direction="vertical">
          <div className={styles['login-form-password-actions']}>
            <Checkbox checked={rememberPassword} onChange={setRememberPassword}>
              {t['login.form.rememberPassword']}
            </Checkbox>
            <Link href="https://tuan.12355.net/bg/index.html" target="_blank">
              {t['login.form.forgetPassword']}
            </Link>
          </div>
          <Button type="primary" long onClick={onSubmitClick} loading={loading}>
            {t['login.form.login']}
          </Button>
        </Space>
      </Form>
    </div>
  );
}
