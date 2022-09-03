import { axiosClient } from '../utils/axiosClient';

const zhiHuiTuanJianApi: any = {};

function service(params) {
  return axiosClient({})(params);
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

zhiHuiTuanJianApi.getDaXueXiTable = (date, chapterId, pageSize = 9999) => {
  console.log(chapterId);
  return service({
    url: `/api/qingniandaxuexi/apibackend/admin/young/organize/userList`,
    method: 'get',
    params: {
      organizedId: 15279912,
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

zhiHuiTuanJianApi.getDaXueXiTable = (params) => {
  return service({
    url: `/api/qingniandaxuexi/apibackend/admin/young/organize/userList`,
    method: 'get',
    params: {
      organizedId: 15279912,
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
