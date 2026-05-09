export type MemoryInitPayload = {
    totalSize: number;
    holes: Hole[];
};

export type MemoryAllocatePayload = {
    process: ProcessInput;
    algorithm: AllocationAlgorithm;
};

export type MemoryDeallocatePayload = string; // process name

declare global {
    interface EventPayloadMapping {
        'memory:init': MemoryInitPayload;
        'memory:allocate': MemoryAllocatePayload;
        'memory:deallocate': MemoryDeallocatePayload;
        'memory:update': MemoryState;
    }

    interface Window {
        memoryApi: {
            init: (payload: MemoryInitPayload) => void;
            allocate: (payload: MemoryAllocatePayload) => void;
            deallocate: (processName: string) => void;
            subscribe: (cb: (state: MemoryState) => void) => () => void;
        };
    }
}
