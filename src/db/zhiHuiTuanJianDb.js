import Dexie from 'dexie';
export const zhiHuiTuanJianDb = new Dexie('zhiHuiTuanJianDb');
zhiHuiTuanJianDb.version(1).stores({
  members: '++id, oid, studentId, name, &email, politicalStatus',
  settings: '[oid+settingName], value',
  sendLogs: '++id, oid, dataName, name, email, status, time, reason',
});
