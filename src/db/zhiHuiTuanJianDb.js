import Dexie from 'dexie';
export const zhiHuiTuanJianDb = new Dexie('zhiHuiTuanJianDb');
zhiHuiTuanJianDb.version(1).stores({
  members: '&studentId, name, &email, politicalStatus',
  settings: '&settingName, value',
});
