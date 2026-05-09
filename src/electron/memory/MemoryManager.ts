export class MemoryManager {
    private totalSize: number = 0;
    private holes: Hole[] = [];
    private allocated: AllocatedSegment[] = [];
    private log: string[] = [];
    private initialized = false;

    init(totalSize: number, initialHoles: Hole[]) {
        this.totalSize = totalSize;
        this.holes = [...initialHoles].sort((a, b) => a.start - b.start);
        this.allocated = [];
        this.log = [
            `Memory initialized - total: ${totalSize}K, holes: ${initialHoles.length}`,
        ];
        this.initialized = true;
    }

    allocate(process: ProcessInput, algorithm: AllocationAlgorithm): boolean {
        const tempHoles = this.holes.map((h) => ({ ...h })); // deep copy
        const assignments: AllocatedSegment[] = [];

        for (const seg of process.segments) {
            const holeIdx =
                algorithm === 'first-fit'
                    ? this.firstFit(tempHoles, seg.size)
                    : this.bestFit(tempHoles, seg.size);

            if (holeIdx === -1) {
                this.log.push(
                    `${process.name} rejected - segment "${seg.name}" (${seg.size}K) ` +
                        `could not fit in any available hole`,
                );
                return false;
            }

            const hole = tempHoles[holeIdx];
            assignments.push({
                processName: process.name,
                segmentName: seg.name,
                base: hole.start,
                size: seg.size,
            });

            hole.start += seg.size;
            hole.size -= seg.size;
            if (hole.size === 0) tempHoles.splice(holeIdx, 1);
        }

        this.holes = tempHoles;
        this.allocated.push(...assignments);
        this.log.push(
            `Allocated ${process.name} [${algorithm}]: ` +
                process.segments.map((s) => `${s.name}=${s.size}K`).join(', '),
        );
        return true;
    }

    private firstFit(holes: Hole[], size: number): number {
        return holes.findIndex((h) => h.size >= size);
    }

    private bestFit(holes: Hole[], size: number): number {
        let best = -1;
        let bestSize = Infinity;
        holes.forEach((h, i) => {
            if (h.size >= size && h.size < bestSize) {
                bestSize = h.size;
                best = i;
            }
        });
        return best;
    }

    deallocate(processName: string): boolean {
        const freed = this.allocated.filter((a) => a.processName === processName);
        if (freed.length === 0) return false;

        this.allocated = this.allocated.filter((a) => a.processName !== processName);

        for (const seg of freed) {
            this.holes.push({ start: seg.base, size: seg.size });
        }

        this.mergeHoles();
        this.log.push(
            `Deallocated ${processName} - freed ${freed.length} segment(s), ` +
                `merged into ${this.holes.length} hole(s)`,
        );
        return true;
    }

    // Sort holes by address then merge any that are contiguous
    private mergeHoles() {
        this.holes.sort((a, b) => a.start - b.start);
        let i = 0;
        while (i < this.holes.length - 1) {
            const curr = this.holes[i];
            const next = this.holes[i + 1];
            if (curr.start + curr.size === next.start) {
                curr.size += next.size;
                this.holes.splice(i + 1, 1);
            } else {
                i++;
            }
        }
    }

    getState(): MemoryState {
        return {
            totalSize: this.totalSize,
            allocated: [...this.allocated],
            holes: [...this.holes],
            segmentTables: this.buildSegmentTables(),
            log: [...this.log],
            initialized: this.initialized,
        };
    }

    private buildSegmentTables(): Record<string, AllocatedSegment[]> {
        const tables: Record<string, AllocatedSegment[]> = {};
        for (const seg of this.allocated) {
            if (tables[seg.processName] === null || tables[seg.processName] === undefined)
                tables[seg.processName] = [];

            tables[seg.processName].push(seg);
        }
        return tables;
    }
}
