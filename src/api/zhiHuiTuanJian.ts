import { axiosClient } from '../utils/axiosClient';
import isElectron from 'is-electron';

const zhiHuiTuanJianApi: any = {};
const urlMapping = {
  '/api/zhihuituanjian': 'https://tuanapi.12355.net',
  '/api/qingniandaxuexi': 'https://youthstudy.12355.net',
};

function service(params) {
  if (!isElectron()) {
    console.log('web axios!');
    return axiosClient({})(params);
  } else {
    console.log('electon proxy request!');
    for (const [key, value] of Object.entries(urlMapping)) {
      if (params.url.includes(key)) {
        params.url = params.url.replace(key, value);
        break;
      }
    }
    console.log(params.url);
    return window.ipcRenderer.invoke('request', params);
  }
}

zhiHuiTuanJianApi.login = (username, password) => {
  return service({
    url: `/api/zhihuituanjian/login/adminLogin`,
    method: 'get',
    params: {
      userName: username,
      password: password,
    },
  });
};

zhiHuiTuanJianApi.loginWithValid = (username, password, loginValidCode) => {
  return service({
    url: `/api/zhihuituanjian/login/adminLogin`,
    method: 'get',
    params: {
      userName: username,
      password: password,
      loginValidCode: loginValidCode,
    },
  });
};

zhiHuiTuanJianApi.logout = () => {
  return service({
    url: `/api/zhihuituanjian/login/exit`,
    method: 'get',
  });
};

zhiHuiTuanJianApi.getLoginValidCode = () => {
  return service({
    url: `/api/zhihuituanjian/login/loginValidCode`,
    method: 'get',
    responseType: 'blob',
  });
};

zhiHuiTuanJianApi.getAccountInfo = () => {
  return service({
    url: `/api/zhihuituanjian/login/getSessionAccount`,
    method: 'get',
  });
};

zhiHuiTuanJianApi.getMenuList = () => {
  return service({
    url: `/api/zhihuituanjian/bg/role/limit`,
    method: 'get',
  });
};

zhiHuiTuanJianApi.getDaXueXiUrl = () => {
  return service({
    url: `/api/zhihuituanjian/questionnaire/getPcYouthLearningUrl`,
    method: 'get',
  });
};

zhiHuiTuanJianApi.getDaXueXiTable = (oid, date, chapterId, pageSize = 9999) => {
  console.log(chapterId);
  return service({
    url: `/api/qingniandaxuexi/apibackend/admin/young/organize/userList`,
    method: 'get',
    params: {
      organizedId: oid,
      pageNo: 1,
      pageSize: pageSize,
      beginTime: date ? date.begin : undefined,
      endTime: date ? date.end : undefined,
      chapterId: chapterId,
    },
    headers: {
      'X-Litemall-IdentiFication': 'young', // important!
    },
  });
};

zhiHuiTuanJianApi.getDaXueXiTable = (oid, params) => {
  return service({
    url: `/api/qingniandaxuexi/apibackend/admin/young/organize/userList`,
    method: 'get',
    params: {
      organizedId: oid,
      ...params,
    },
    headers: {
      'X-Litemall-IdentiFication': 'young', // important!
    },
  });
};

zhiHuiTuanJianApi.getDaXueXiChapter = () => {
  return service({
    url: `/api/qingniandaxuexi/apibackend/admin/young/organize/chapter/date`,
    method: 'get',
    headers: {
      'X-Litemall-IdentiFication': 'young', // important!
    },
  });
};

export default zhiHuiTuanJianApi;
