const electron = require('electron');
const url = require('url');
const path = require("path");

//const {app, BrownserWindow} = electron;

//SET ENV
/* Definitivamente não é o melhor jeito de fazer isso, mas é uma solução rápida para um pequeno tutorial */
process.env.NODE_ENV = 'production';

const app = electron.app;
const BrownserWindow = electron.BrowserWindow;
const Menu = electron.Menu;
const ipcMain = electron.ipcMain;

let mainWindow;
let addWindow;

//Listem to app to be ready
app.on('ready', () => {
    //create new windows
    mainWindow = new BrownserWindow({
        webPreferences: {
            nodeIntegration: true
        }});
    //Load html into window
    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'mainWindow.html'),
        protocol: 'file:',
        slashes: true
    }));

    //Build menu from template
    const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);

    //Quit app when closed
    mainWindow.on('closed', () => {
        app.quit();
    });

    //Insert menu
    Menu.setApplicationMenu(mainMenu);
});

function createAddWindow() {
    //create new windows
    addWindow = new BrownserWindow({
        width: 300,
        height: 200,
        title: 'Add Shopping List Item',
        webPreferences: {
            nodeIntegration: true
        }
    });
    //Load html into window
    addWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'addWindow.html'),
        protocol: 'file:',
        slashes: true
    }));
    //Garbage collector handle
    addWindow.on('closed', ()=>{
        addWindow = null;
    });
}

// Catch item:add
ipcMain.on('item:add', (e, item) => {
    mainWindow.webContents.send('item:add', item);
    addWindow.close();
});

//Create menu template
const mainMenuTemplate = [
    {
        label: 'File',
        submenu: [
            {
                label: 'Add Item',
                click() {
                    createAddWindow();
                }
            },
            {
                label: 'Cler Items',
                click() {
                    mainWindow.webContents.send('item:clear');
                }
            },
            {
                label: 'Quit',
                accelerator: process.platform == 'darwin' ? 'Command+Q' : 'Ctrl+Q',
                click() {
                    app.quit();
                }
            }
        ]
    }
];

//If on MAC, add a empty object to menu template
if (process.platform == 'darwin') {
    mainMenuTemplate.unshift({});
}

//Add developer tools item if not in production
if (process.env.NODE_ENV !== 'production'){
    mainMenuTemplate.push({
        label: 'Developer Tools',
        submenu: [
            {
                label: 'Toggle DevTools',
                accelerator: process.platform == 'darwin' ? 'Command+I' : 'Ctrl+I',
                click(item, focusedWindow){
                    focusedWindow.toggleDevTools();
                },
            },
            {
                role: 'reload'
            }
        ]
    })
}