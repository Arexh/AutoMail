import './style/global.less';
import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';
import { createStore } from 'redux';
import { Provider } from 'react-redux';
import { ConfigProvider, Message } from '@arco-design/web-react';
import zhCN from '@arco-design/web-react/es/locale/zh-CN';
import enUS from '@arco-design/web-react/es/locale/en-US';
import { BrowserRouter, Switch, Route } from 'react-router-dom';
import rootReducer from './store';
import PageLayout from './layout';
import { GlobalContext } from './context';
import Login from './pages/login';
import checkLogin from './utils/checkLogin';
import changeTheme from './utils/changeTheme';
import useStorage from './utils/useStorage';
import zhiHuiTuanJianApi from './api/zhiHuiTuanJian';
// import './mock';

const store = createStore(rootReducer);

function Index() {
  const [lang, setLang] = useStorage('arco-lang', 'zh-CN');
  const [theme, setTheme] = useStorage('arco-theme', 'light');
  const [_, setUserStatus] = useStorage('userStatus');

  function getArcoLocale() {
    switch (lang) {
      case 'zh-CN':
        return zhCN;
      case 'en-US':
        return enUS;
      default:
        return zhCN;
    }
  }

  function fetchUserInfo() {
    zhiHuiTuanJianApi.getAccountInfo().then((res) => {
      console.log(res);
      if (res.data.status == 'ERROR') {
        Message.error(res.data.msg);
        window.location.href = '/login';
        setUserStatus('logout');
      }
      const data = res.data.account;
      store.dispatch({
        type: 'update-userInfo',
        payload: {
          userInfo: {
            name: data.username,
            avatar:
              'https://lf1-xgcdn-tos.pstatp.com/obj/vcloud/vadmin/start.8e0e4855ee346a46ccff8ff3e24db27b.png',
            email: data.email,
            job: 'frontend',
            jobName: '前端开发工程师',
            organization: data.detailName,
            organizationName: '前端',
            location: 'beijing',
            locationName: '北京',
            introduction: '王力群并非是一个真实存在的人。',
            personalWebsite: 'https://www.arco.design',
            verified: true,
            phoneNumber: data.mobile,
            accountId: data.oid,
            registrationTime: data.createTime,
            permissions: 'admin',
          },
          userLoading: false,
        },
      });
      console.log(res.data);
    });
  }

  useEffect(() => {
    store.dispatch({
      type: 'update-userInfo',
      payload: { userLoading: true },
    });
    if (checkLogin()) {
      fetchUserInfo();
    } else if (window.location.pathname.replace(/\//g, '') !== 'login') {
      Message.error('您的登录已失效，请重新登录');
      setTimeout(() => {
        window.location.pathname = '/login';
      }, 2000);
    }
  }, []);

  useEffect(() => {
    changeTheme(theme);
  }, [theme]);

  const contextValue = {
    lang,
    setLang,
    theme,
    setTheme,
  };

  return (
    <BrowserRouter>
      <ConfigProvider
        locale={getArcoLocale()}
        componentConfig={{
          Card: {
            bordered: false,
          },
          List: {
            bordered: false,
          },
          Table: {
            border: false,
          },
        }}
      >
        <Provider store={store}>
          <GlobalContext.Provider value={contextValue}>
            <Switch>
              <Route path="/login" component={Login} />
              <Route path="/" component={PageLayout} />
            </Switch>
          </GlobalContext.Provider>
        </Provider>
      </ConfigProvider>
    </BrowserRouter>
  );
}

ReactDOM.render(<Index />, document.getElementById('root'));
