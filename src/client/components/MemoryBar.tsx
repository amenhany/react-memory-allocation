import { useMemo } from 'react';
import { useMemory } from './MemoryContext';
import styles from '@/styles/MemoryBar.module.css';

const PALETTE = [
   '#3B7DD8',
   '#2EA876',
   '#D97706',
   '#9333EA',
   '#E84040',
   '#0891B2',
   '#DB2777',
   '#65A30D',
];

type Block =
   | { kind: 'allocated'; seg: AllocatedSegment; color: string }
   | { kind: 'hole'; start: number; size: number }
   | { kind: 'reserved'; start: number; size: number };

type RawBlock =
   | { kind: 'allocated'; seg: AllocatedSegment }
   | { kind: 'hole'; start: number; size: number };

export default function MemoryBar() {
   const { state } = useMemory();

   const { blocks, processColors } = useMemo(() => {
      if (!state) return { blocks: [], processColors: {} };

      const { totalSize, allocated, holes } = state;

      // Assign colors
      const names = [...new Set(allocated.map((a) => a.processName))];
      const colors = Object.fromEntries(
         names.map((n, i) => [n, PALETTE[i % PALETTE.length]]),
      );

      // Build a sorted list of all memory blocks
      const combined: RawBlock[] = [
         ...allocated.map((seg) => ({ kind: 'allocated' as const, seg })),
         ...holes.map((h) => ({ kind: 'hole' as const, start: h.start, size: h.size })),
      ];
      // sort according to start/base
      combined.sort((a, b) => {
         const aStart = a.kind === 'allocated' ? a.seg.base : a.start;
         const bStart = b.kind === 'allocated' ? b.seg.base : b.start;
         return aStart - bStart;
      });

      // Insert reserved (non-free) segments
      const result: Block[] = [];
      let cursor = 0;

      for (const item of combined) {
         const start = item.kind === 'allocated' ? item.seg.base : item.start;
         const size = item.kind === 'allocated' ? item.seg.size : item.size;

         if (start > cursor) {
            result.push({ kind: 'reserved', start: cursor, size: start - cursor });
         }
         if (item.kind === 'allocated') {
            result.push({
               kind: 'allocated',
               seg: item.seg,
               color: colors[item.seg.processName],
            });
         } else {
            result.push({ kind: 'hole', start: item.start, size: item.size });
         }
         cursor = start + size;
      }
      if (cursor < totalSize) {
         result.push({ kind: 'reserved', start: cursor, size: totalSize - cursor });
      }

      return { blocks: result, processColors: colors };
   }, [state]);

   if (!state?.initialized) return null;

   const total = state.totalSize;

   return (
      <div className={styles.wrapper}>
         <div className={styles.scale}>
            {[0, 0.25, 0.5, 0.75, 1].map((t) => (
               <div key={t} className={styles.scaleMark} style={{ top: `${t * 100}%` }}>
                  {Math.round(t * total)}K
               </div>
            ))}
         </div>

         <div className={styles.bar}>
            {blocks.map((b, i) => {
               const heightPct =
                  ((b.kind === 'allocated' ? b.seg.size : b.size) / total) * 100;

               if (b.kind === 'allocated') {
                  return (
                     <div
                        key={i}
                        className={styles.segAllocated}
                        style={{
                           height: `${heightPct}%`,
                           background: b.color,
                           // borderColor: b.color,
                        }}
                        title={`${b.seg.processName} / ${b.seg.segmentName} - base: ${b.seg.base}K, size: ${b.seg.size}K`}
                     >
                        {heightPct > 5 ? (
                           <span className={styles.label}>
                              <strong>{b.seg.processName}</strong>
                              <span>.{b.seg.segmentName}</span>
                              <span className={styles.segSize}>{b.seg.size}K</span>
                           </span>
                        ) : (
                           heightPct > 1 && (
                              <span className={styles.label}>
                                 <span>
                                    <strong>{b.seg.processName}</strong> .
                                    {b.seg.segmentName} - {styles.segSize} {b.seg.size}K
                                 </span>
                              </span>
                           )
                        )}
                     </div>
                  );
               }

               if (b.kind === 'hole') {
                  return (
                     <div
                        key={i}
                        className={styles.segHole}
                        style={{ height: `${heightPct}%` }}
                        title={`Hole - start: ${b.start}K, size: ${b.size}K`}
                     >
                        {heightPct > 3 && (
                           <span className={styles.label}>
                              <span className={styles.holeTag}>FREE</span>
                              <span className={styles.segSize}>{b.size}K</span>
                           </span>
                        )}
                     </div>
                  );
               }

               // reserved / OS
               return (
                  <div
                     key={i}
                     className={styles.segReserved}
                     style={{ height: `${heightPct}%` }}
                     title={`Reserved - start: ${b.start}K, size: ${b.size}K`}
                  >
                     {heightPct > 3 && (
                        <span className={styles.label}>
                           <span className={styles.reservedTag}>OS</span>
                           <span className={styles.segSize}>{b.size}K</span>
                        </span>
                     )}
                  </div>
               );
            })}
         </div>

         <div className={styles.legend}>
            {Object.entries(processColors).map(([name, color]) => (
               <div key={name} className={styles.legendItem}>
                  <span className={styles.legendDot} style={{ background: color }} />
                  {name}
               </div>
            ))}
            <div className={styles.legendItem}>
               <span className={`${styles.legendDot} ${styles.legendDotHole}`} />
               Free
            </div>
            <div className={styles.legendItem}>
               <span className={`${styles.legendDot} ${styles.legendDotReserved}`} />
               Reserved
            </div>
         </div>
      </div>
   );
}
