const { app, BrowserWindow, globalShortcut, clipboard, Menu, dialog, ipcMain, Tray } = require('electron');
const path = require('path');
const fs = require('fs');
const dayjs = require('dayjs');
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
    dialog.showSaveDialog(options).then(result => {
        event.sender.send('saved-file', result);
    });
});

app.dock.setIcon(path.join(__dirname, '../assets/IconTemplate@2x.png'));
app.setName('我的粘贴板');

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow, helpWindow, trayIcon;

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

const exportData = type => {
    const options = {
        title: '请选择要保存的文件名',
        buttonLabel: '保存',
        defaultPath: Date.now() + '',
        filters: [{ name: 'Custom File Type', extensions: [type] }],
    };
    dialog.showSaveDialog(options).then(result => {
        if (!result.canceled) {
            noteRepo.getAll().then(notes => {
                let content = utils.getContent(type, notes);
                console.log(result);
                fs.writeFileSync(result.filePath, content);
            });
        }
    });
};

const createWindow = () => {
    // Create the browser window.
    mainWindow = new BrowserWindow({
        minWidth: 300,
        backgroundColor: '#fff',
        webPreferences: {
            nodeIntegration: true,
        },
        //frame: false,
    });

    // and load the index.html of the app.
    mainWindow.loadFile(path.join(__dirname, 'render/index.html'));

    // Open the DevTools.
    if (process.env.NODE_ENV === 'development') {
        mainWindow.webContents.openDevTools();
    }

    // Emitted when the window is closed.
    mainWindow.on('closed', () => {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        mainWindow = null;
    });

    // console.log(Notification.isSupported());

    // notice = new Notification({
    //   title: '有新的内容',
    //   body: '您有新的内容保存到粘贴板'
    // });

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
        mainWindow.webContents.send('refresh-notes', data);
        mainWindow.webContents.send('new-content', data);
    });

    // globalShortcut.register('CommandOrControl+Shift+C', async function () {
    //   mainWindow.webContents.send('toggle-control');
    // });

    // mainWindow.webContents.on('did-finish-load', async function(){
    //     const notes = await noteRepo.getAll();
    //     mainWindow.webContents.send('init_notes', notes);
    // })

    trayIcon = new Tray(path.join(__dirname, '../assets/IconTemplate.png'));

    trayIcon.on('click', function () {
        if (mainWindow === null) {
            return;
        }
        if (mainWindow.isVisible()) {
            mainWindow.hide();
        } else {
            mainWindow.show();
        }
    });
};

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
            {
                label: '导出',
                submenu: [
                    {
                        label: '全部导出Json',
                        accelerator: 'CmdOrCtrl+Shift+J',
                        click: function () {
                            exportData('json');
                        },
                    },
                    {
                        label: '全部导出Text',
                        accelerator: 'CmdOrCtrl+Shift+T',
                        click: function () {
                            exportData('txt');
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

const setAppMenu = () => {
    if (process.platform === 'darwin') {
        const template = [
            {
                label: 'Application',
                submenu: [
                    {
                        label: 'Quit',
                        accelerator: 'Command+Q',
                        click: function () {
                            app.quit();
                        },
                    },
                ],
            },
            {
                label: 'Edit',
                submenu: [
                    { label: 'Copy', accelerator: 'CmdOrCtrl+C', selector: 'copy:' },
                    { label: 'Paste', accelerator: 'CmdOrCtrl+V', selector: 'paste:' },
                ],
            },
        ];
        Menu.setApplicationMenu(Menu.buildFromTemplate(template));
    } else {
        Menu.setApplicationMenu(null);
    }
};

const setDockMenu = () => {
    const dockMenu = Menu.buildFromTemplate([
        {
            label: 'New Window',
            click() {
                console.log('New Window');
            },
        },
        {
            label: 'New Window with Settings',
            submenu: [{ label: 'Basic' }, { label: 'Pro' }],
        },
        { label: 'New Command...' },
    ]);
    app.dock.setMenu(dockMenu);
    // app.dock.hide();
    // app.dock.setIcon(path.join(__dirname, '../assets/IconTemplate.png'));
    // console.log(app.dock.isVisible());
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', () => {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) {
        createWindow();
    }
});

app.on('will-quit', function () {
    // Unregister all shortcuts.
    globalShortcut.unregisterAll();
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
