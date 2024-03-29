// ./public/electron.js
const path = require('path');
const nodemailer = require('nodemailer');
const axios = require('axios');
const { wrapper } = require('axios-cookiejar-support');
const { CookieJar } = require('tough-cookie');
const { HttpsCookieAgent } = require('http-cookie-agent/http');

const { app, BrowserWindow, ipcMain, globalShortcut } = require('electron');
const isDev = process.env.NODE_ENV == 'development';

let mainWindow;

// https://github.com/blazer233/Today-wallpapers/blob/master/public/electron.js
function createWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    webPreferences: {
      nodeIntegration: true,
      preload: __dirname + '/preload.js',
      webSecurity: true,
    },
    menu: null,
    titleBarStyle: 'hiddenInset',
    minWidth: 1400,
    minHeight: 800,
    width: 1500,
    height: 900,
  });
  mainWindow.setMenuBarVisibility(false);

  // and load the index.html of the app.
  // win.loadFile("index.html");
  // mainWindow.loadURL(`file://${__dirname}\\index.html`);
  isDev
    ? mainWindow.loadURL(`http://localhost:3000`)
    : mainWindow.loadFile(`${path.join(__dirname, '../build/index.html')}`);
  // Open the DevTools.
  if (isDev) {
    mainWindow.webContents.openDevTools({
      mode: 'right',
    });
  }
}

ipcMain.on('test', (e, _) => {
  e.sender.send('test-reply', {
    hello: 'hello',
    aaa: _,
  });
});

// axios setting
const jar = new CookieJar();
axios.defaults.withCredentials = true;
axios.defaults.timeout = 3000;
axios.defaults.httpsAgent = new HttpsCookieAgent({
  cookies: { jar },
});
axios.defaults.headers.common = {
  'User-Agent': 'PostmanRuntime/7.29.0',
  Accept: '*/*',
  'Accept-Encoding': 'gzip, deflate, br',
  Connection: 'keep-alive',
}; // request proxy
console.log('init axios');
const client = wrapper(axios.create({}));
ipcMain.handle('request', async (_, axiosParams) => {
  console.log('receive a request');
  console.log(axiosParams);
  const url = axiosParams.url;
  const method = axiosParams.method;
  delete axiosParams.url;
  delete axiosParams.method;
  const result =
    method == 'get'
      ? await client.get(url, axiosParams)
      : await client.post(url, axiosParams);
  console.log('request done');
  if (axiosParams['responseType'] == 'arraybuffer') {
    console.log(result);
    console.log(Buffer.from(result.data).toString('base64'));
    return {
      status: result.status,
      data: Buffer.from(result.data).toString('base64'),
    };
  }
  return {
    status: result.status,
    data: result.data,
  };
});

// mail server
ipcMain.handle('sendEmail', async (e, settings, contents) => {
  console.log('sendEmail');
  console.log(settings);
  console.log(contents);
  // create reusable transporter object using the default SMTP transport
  const transporter = nodemailer.createTransport(settings);
  // send mail with defined transport object
  try {
    const response = await transporter.sendMail(contents);
    console.log('NORMAL');
    console.log(response);
    return response;
  } catch (err) {
    console.log('ERROR');
    console.log(err);
    return err;
  }
});

// open url
ipcMain.handle('openUrl', async (e, url) => {
  require('electron').shell.openExternal(url);
});

const isDevelopment = !app.isPackaged;
if (isDevelopment) {
  require('electron-reload')(__dirname);
}
// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  globalShortcut.register('Command+Shift+I', function () {
    mainWindow.webContents.openDevTools({ mode: 'right' });
    mainWindow.webContents.dev;
  });
  createWindow();
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bars to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

app.commandLine.appendSwitch('disable-features', 'OutOfBlinkCors');
