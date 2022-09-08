import Dexie from 'dexie';
export const zhiHuiTuanJianDb = new Dexie('zhiHuiTuanJianDb');
zhiHuiTuanJianDb.version(1).stores({
  members: '++id, studentId, name, &email, politicalStatus',
  settings: '&settingName, value',
  sendLogs: '++id, dataName, name, email, status, time, reason',
});
