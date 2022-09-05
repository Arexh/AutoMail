const { contextBridge, ipcRenderer } = require('electron');
console.log(ipcRenderer);

contextBridge.exposeInMainWorld('ipcRenderer', {
  on: function (eventName, event) {
    ipcRenderer.on(eventName, event);
  },
  send: function (eventName, ...args) {
    ipcRenderer.send(eventName, ...args);
  },
  invoke: function (eventName, ...args) {
    return ipcRenderer.invoke(eventName, ...args);
  },
});
