import './style/global.less';
import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';
import { createStore } from 'redux';
import { Provider } from 'react-redux';
import { ConfigProvider, Message } from '@arco-design/web-react';
import zhCN from '@arco-design/web-react/es/locale/zh-CN';
import enUS from '@arco-design/web-react/es/locale/en-US';
import { HashRouter, Switch, Route } from 'react-router-dom';
import rootReducer from './store';
import PageLayout from './layout';
import { GlobalContext } from './context';
import Login from './pages/login';
import checkLogin from './utils/checkLogin';
import changeTheme from './utils/changeTheme';
import useStorage from './utils/useStorage';
import zhiHuiTuanJianApi from './api/zhiHuiTuanJian';
import { GlobalState } from './store';
import { generate, getRgbStr } from '@arco-design/color';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
// import './mock';

const store = createStore(rootReducer);

function Index() {
  const [lang, setLang] = useStorage('arco-lang', 'zh-CN');
  const [theme, setTheme] = useStorage('arco-theme', 'light');
  const [_, setUserStatus] = useStorage('userStatus');

  const newList = generate('#6a3596', {
    list: true,
    dark: theme === 'dark',
  });
  newList.forEach((l, index) => {
    const rgbStr = getRgbStr(l);
    document.body.style.setProperty(`--arcoblue-${index + 1}`, rgbStr);
  });
  const history = useHistory();

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
    console.log('fetch user info');
    zhiHuiTuanJianApi
      .getAccountInfo()
      .then((res) => {
        console.log('fetch user info get');
        console.log(res);
        if (res.data.status == 'ERROR') {
          Message.error(res.data.msg);
          history.push('login');
          setUserStatus('logout');
        } else {
          const data = res.data.account;
          store.dispatch({
            type: 'update-userInfo',
            payload: {
              userInfo: res.data.account,
              userLoading: false,
            },
          });
        }
      })
      .catch((res) => {
        console.log('fetch user info error');
        console.log(res);
        if (res.data.status == 'ERROR') {
          Message.error(res.data.msg);
          history.push('login');
          setUserStatus('logout');
        }
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
        history.push('login');
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
  );
}

ReactDOM.render(
  <HashRouter>
    <Index />
  </HashRouter>,
  document.getElementById('root')
);
