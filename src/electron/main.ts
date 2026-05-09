import { app, BrowserWindow, Menu, ipcMain } from 'electron';
import path from 'path';
import { MemoryManager } from './memory/MemoryManager.js';
import { getPreloadPath } from './pathResolver.js';

export const isDev = process.env.NODE_ENV === 'development';

function ipcMainOn<Key extends keyof EventPayloadMapping>(
    key: Key,
    handler: (payload: EventPayloadMapping[Key]) => void,
) {
    ipcMain.on(key, (_, payload) => handler(payload));
}

app.on('ready', () => {
    const mainWindow = new BrowserWindow({
        width: 1280,
        height: 800,
        minWidth: 900,
        minHeight: 600,
        webPreferences: {
            preload: getPreloadPath(),
            contextIsolation: true,
            sandbox: false,
        },
    });

    const memory = new MemoryManager();

    function emit() {
        mainWindow.webContents.send('memory:update', memory.getState());
    }

    ipcMainOn('memory:init', ({ totalSize, holes }) => {
        memory.init(totalSize, holes);
        emit();
    });

    ipcMainOn('memory:allocate', ({ process, algorithm }) => {
        memory.allocate(process, algorithm);
        emit();
    });

    ipcMainOn('memory:deallocate', (processName) => {
        memory.deallocate(processName);
        emit();
    });

    Menu.setApplicationMenu(null);

    if (isDev) {
        mainWindow.loadURL('http://localhost:5123');
        mainWindow.webContents.openDevTools();
    } else {
        mainWindow.loadFile(path.join(app.getAppPath(), '/dist-react/index.html'));
    }
});
