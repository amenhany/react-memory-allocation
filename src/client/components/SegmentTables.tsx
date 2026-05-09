import { useMemory } from './MemoryContext';
import styles from '@/styles/SegmentTables.module.css';

export default function SegmentTables() {
   const { state } = useMemory();
   if (!state?.initialized) return null;

   const { segmentTables, holes, log } = state;
   const processes = Object.entries(segmentTables);

   return (
      <div className={styles.wrapper}>
         {processes.length === 0 && (
            <div className={styles.empty}>No processes allocated yet.</div>
         )}

         {processes.map(([procName, segs]) => (
            <div key={procName} className={styles.tableCard}>
               <div className={styles.tableHeader}>
                  <span className={styles.processName}>{procName}</span>
                  <span className={styles.segCount}>
                     {segs.length} segment{segs.length !== 1 ? 's' : ''}
                  </span>
               </div>
               <table className={styles.table}>
                  <thead>
                     <tr>
                        <th>Segment</th>
                        <th>Base</th>
                        <th>Limit</th>
                        <th>End</th>
                     </tr>
                  </thead>
                  <tbody>
                     {segs.map((s) => (
                        <tr key={s.segmentName}>
                           <td className={styles.segName}>{s.segmentName}</td>
                           <td className={styles.num}>{s.base}K</td>
                           <td className={styles.num}>{s.size}K</td>
                           <td className={styles.num}>{s.base + s.size}K</td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>
         ))}

         {/* Free holes table */}
         {holes.length > 0 && (
            <div className={styles.tableCard}>
               <div className={styles.tableHeader}>
                  <span
                     className={styles.processName}
                     style={{ color: 'var(--success)' }}
                  >
                     Free Holes
                  </span>
                  <span className={styles.segCount}>
                     {holes.length} hole{holes.length !== 1 ? 's' : ''}
                  </span>
               </div>
               <table className={styles.table}>
                  <thead>
                     <tr>
                        <th>#</th>
                        <th>Start</th>
                        <th>Size</th>
                        <th>End</th>
                     </tr>
                  </thead>
                  <tbody>
                     {holes.map((h, i) => (
                        <tr key={i}>
                           <td className={styles.segName}>H{i + 1}</td>
                           <td className={styles.num}>{h.start}K</td>
                           <td className={styles.num}>{h.size}K</td>
                           <td className={styles.num}>{h.start + h.size}K</td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>
         )}

         {/* Event log */}
         <div className={styles.tableCard}>
            <div className={styles.tableHeader}>
               <span
                  className={styles.processName}
                  style={{ color: 'var(--text-muted)' }}
               >
                  Event Log
               </span>
            </div>
            <div className={styles.log}>
               {[...log].reverse().map((entry, i) => (
                  <div
                     key={i}
                     className={`${styles.logEntry} ${
                        entry.startsWith('✓')
                           ? styles.logSuccess
                           : entry.startsWith('✗')
                             ? styles.logError
                             : entry.startsWith('↩')
                               ? styles.logWarn
                               : ''
                     }`}
                  >
                     {entry}
                  </div>
               ))}
            </div>
         </div>
      </div>
   );
}
