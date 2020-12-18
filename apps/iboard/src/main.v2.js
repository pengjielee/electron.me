const {
  app,
  BrowserWindow,
  globalShortcut,
  clipboard,
  Menu,
  dialog,
  ipcMain,
  Notification,
} = require('electron');
const path = require('path');
const dayjs = require('dayjs');
const { menubar } = require('menubar');
const utils = require(path.join(__dirname, 'utils/index.js'));

const AppDAO = require(path.join(__dirname, 'db/dao.js'));
const NoteRepository = require(path.join(__dirname, 'db/note_repository.js'));
const dao = new AppDAO(path.join(__dirname, 'my.db'));
const noteRepo = new NoteRepository(dao);

noteRepo.createTable();

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  // eslint-disable-line global-require
  app.quit();
}

ipcMain.on('save-dialog', (event, data) => {
  const options = {
    title: '请选择要保存的文件名',
    buttonLabel: '保存',
    defaultPath: data.filename,
    filters: [{ name: 'Custom File Type', extensions: [data.type] }],
  };
  dialog.showSaveDialog(options).then(filename => {
    event.sender.send('saved-file', filename);
  });
});

// app.dock.setIcon(path.join(__dirname, '../assets/dock.png'));
app.dock.hide();
app.setName('我的粘贴板');

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow, helpWindow, notice;

ipcMain.on('open-help', event => {
  const filePath = path.join('file://', __dirname, 'render/help.html');
  if (!helpWindow) {
    helpWindow = new BrowserWindow({ width: 500, height: 400 });
    if (process.env.NODE_ENV === 'development') {
      helpWindow.webContents.openDevTools();
    }
    helpWindow.on('close', () => {
      helpWindow = null;
    });
    helpWindow.loadURL(filePath);
  }

  helpWindow.show();
});

const createMenu = () => {
  if (process.platform === 'darwin') {
    const template = [
      {
        label: '我的粘贴板',
        submenu: [
          {
            label: '退出',
            accelerator: 'Command+Q',
            click: function () {
              app.quit();
            },
          },
        ],
      },
      {
        label: '编辑',
        submenu: [
          { label: '复制', accelerator: 'CmdOrCtrl+C', selector: 'copy:' },
          { label: '粘贴', accelerator: 'CmdOrCtrl+V', selector: 'paste:' },
        ],
      },
      {
        label: '初始化',
        submenu: [
          {
            label: '清除',
            accelerator: 'CmdOrCtrl+Shift+C',
            click: function () {
              mainWindow.webContents.send('init-db');
            },
          },
        ],
      },
    ];
    Menu.setApplicationMenu(Menu.buildFromTemplate(template));
  } else {
    Menu.setApplicationMenu(null);
  }
};

createMenu();

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('will-quit', function () {
  // Unregister all shortcuts.
  globalShortcut.unregisterAll();
});

const mb = menubar({
  index: path.join('file://', __dirname, '/render/index.html'),
  icon: path.join(__dirname, '../assets/IconTemplate.png'),
  browserWindow: {
    width: 400,
    height: 700,
    minWidth: 200,
    backgroundColor: '#fff',
    webPreferences: {
      nodeIntegration: true,
    },
    frame: false,
    resizable: true,
    transparent: true,
  },
  showDockIcon: false,
  preloadWindow: true,
});

mb.on('ready', () => {
  console.log('app is ready');
  // your app code here

  if (process.env.NODE_ENV === 'development') {
    mb.window.webContents.openDevTools();
  }

  // Register a shortcut listener.
  globalShortcut.register('CommandOrControl+Shift+D', function () {
    if (mb.window.isVisible()) {
      mb.window.hide();
    } else {
      mb.window.show();
    }
  });

  globalShortcut.register('CommandOrControl+Option+S', async function () {
    const now = dayjs();
    const createDate = now.format('YYYY-MM-DD');
    const createTime = now.format('HH:mm:ss');
    const content = utils.encode(clipboard.readText());
    const note = {
      content: content,
      createDate: createDate,
      createTime: createTime,
    };
    console.log('create note:', note);
    const data = await noteRepo.create(note);
    console.log('create note result: ', data);
    mb.window.webContents.send('refresh-notes', data);
    mb.window.webContents.send('new-content', data);
  });

  mb.showWindow();
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
