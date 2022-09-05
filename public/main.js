// ./public/electron.js
const path = require('path');
const nodemailer = require('nodemailer');

const { app, BrowserWindow, ipcMain } = require('electron');
const isDev = process.env.NODE_ENV !== 'development';

// https://github.com/blazer233/Today-wallpapers/blob/master/public/electron.js
function createWindow() {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    webPreferences: {
      nodeIntegration: true,
      preload: __dirname + '/preload.js',
      webSecurity: false,
    },
  });

  mainWindow.maximize();
  // and load the index.html of the app.
  // win.loadFile("index.html");
  // mainWindow.loadURL(`file://${__dirname}\\index.html`);
  isDev
    ? mainWindow.loadURL(
        `file://${path.join(__dirname, '../build/index.html')}`
      )
    : mainWindow.loadURL(`http://localhost:3000`);
  // Open the DevTools.
  mainWindow.webContents.openDevTools({
    mode: 'right',
  });
}

ipcMain.on('test', (e, _) => {
  e.sender.send('test-reply', {
    hello: 'hello',
    aaa: _,
  });
});

ipcMain.on('sendEmail', async (e, settings, contents) => {
  // create reusable transporter object using the default SMTP transport
  let transporter = nodemailer.createTransport(settings);
  // send mail with defined transport object
  transporter.sendMail(contents, (error, info) =>
    e.sender.send('sendEmail-reply', info)
  );
});

const isDevelopment = !app.isPackaged;
if (isDevelopment) {
  require('electron-reload')(__dirname);
}
// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(createWindow);

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
