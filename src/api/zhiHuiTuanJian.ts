import { axiosClient } from '../utils/axiosClient';

const zhiHuiTuanJianApi: any = {};

function service(params) {
  return axiosClient({})(params);
}

zhiHuiTuanJianApi.login = (username, password) => {
  return service({
    url: `https://tuanapi.12355.net/login/adminLogin`,
    method: 'get',
    params: {
      userName: username,
      password: password,
    },
  });
};

zhiHuiTuanJianApi.loginWithValid = (username, password, loginValidCode) => {
  return service({
    url: `https://tuanapi.12355.net/login/adminLogin`,
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
    url: `https://tuanapi.12355.net/login/exit`,
    method: 'get',
  });
};

zhiHuiTuanJianApi.getLoginValidCode = () => {
  return service({
    url: `https://tuanapi.12355.net/login/loginValidCode`,
    method: 'get',
    responseType: 'blob',
  });
};

zhiHuiTuanJianApi.getAccountInfo = () => {
  return service({
    url: `https://tuanapi.12355.net/login/getSessionAccount`,
    method: 'get',
  });
};

zhiHuiTuanJianApi.getMenuList = () => {
  return service({
    url: `https://tuanapi.12355.net/bg/role/limit`,
    method: 'get',
  });
};

zhiHuiTuanJianApi.getDaXueXiUrl = () => {
  return service({
    url: `https://tuanapi.12355.net/questionnaire/getPcYouthLearningUrl`,
    method: 'get',
  });
};

zhiHuiTuanJianApi.getDaXueXiTable = (oid, date, chapterId, pageSize = 9999) => {
  console.log(chapterId);
  return service({
    url: `https://youthstudy.12355.net/apibackend/admin/young/organize/userList`,
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
    url: `https://youthstudy.12355.net/apibackend/admin/young/organize/userList`,
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
    url: `https://youthstudy.12355.net/apibackend/admin/young/organize/chapter/date`,
    method: 'get',
    headers: {
      'X-Litemall-IdentiFication': 'young', // important!
    },
  });
};

export default zhiHuiTuanJianApi;
