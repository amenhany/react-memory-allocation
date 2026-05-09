type AllocationAlgorithm = 'first-fit' | 'best-fit';

type SegmentInput = {
    name: string;
    size: number;
};

type ProcessInput = {
    name: string;
    segments: SegmentInput[];
};

type Hole = {
    start: number;
    size: number;
};

type AllocatedSegment = {
    processName: string;
    segmentName: string;
    base: number;
    size: number;
};

type MemoryState = {
    totalSize: number;
    allocated: AllocatedSegment[];
    holes: Hole[];
    segmentTables: Record<string, AllocatedSegment[]>;
    log: string[];
    initialized: boolean;
};
