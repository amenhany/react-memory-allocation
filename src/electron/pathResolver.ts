import { app } from 'electron';
import path from 'path';
import { isDev } from './main.js';

export function getPreloadPath() {
    return path.join(app.getAppPath(), isDev ? '.' : '..', '/dist-electron/preload.cjs');
}

export function getUiPath() {
    return path.join(app.getAppPath(), '/dist-react/index.html');
}
