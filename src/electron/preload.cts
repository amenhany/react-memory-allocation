import { MemoryAllocatePayload, MemoryInitPayload } from '@/types/electron';
import { contextBridge, ipcRenderer } from 'electron';

function send<Key extends keyof EventPayloadMapping>(
    key: Key,
    payload?: EventPayloadMapping[Key],
) {
    ipcRenderer.send(key, payload);
}

function on<Key extends keyof EventPayloadMapping>(
    key: Key,
    callback: (payload: EventPayloadMapping[Key]) => void,
) {
    const cb = (_: Electron.IpcRendererEvent, payload: EventPayloadMapping[Key]) =>
        callback(payload);
    ipcRenderer.on(key, cb);
    return () => ipcRenderer.off(key, cb);
}

contextBridge.exposeInMainWorld('memoryApi', {
    init: (payload: MemoryInitPayload) => send('memory:init', payload),
    allocate: (payload: MemoryAllocatePayload) => send('memory:allocate', payload),
    deallocate: (name: string) => send('memory:deallocate', name),
    subscribe: (cb: (state: MemoryState) => void) => on('memory:update', cb),
} satisfies Window['memoryApi']);
