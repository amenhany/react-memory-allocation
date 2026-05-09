import { useState, type ChangeEvent } from 'react';
import { useMemory } from './MemoryContext';
import styles from '@/styles/Form.module.css';
import TrashIcon from './icons/TrashIcon';
import PlusIcon from './icons/PlusIcon';

type SegRow = { name: string; size: string };

export default function AllocationForm() {
   const { allocate, algorithm, setAlgorithm, state } = useMemory();
   const [procName, setProcName] = useState('');
   const [segments, setSegments] = useState<SegRow[]>([{ name: 'Code', size: '' }]);
   const [error, setError] = useState('');

   if (!state?.initialized) return null;

   function updateSeg(i: number, field: keyof SegRow, val: string) {
      setSegments((prev) =>
         prev.map((s, idx) => (idx === i ? { ...s, [field]: val } : s)),
      );
   }

   function handleAllocate() {
      setError('');
      if (!procName.trim()) {
         setError('Process name is required');
         return;
      }

      const parsed = segments
         .filter((s) => s.name.trim() && s.size !== '')
         .map((s) => ({ name: s.name.trim(), size: Number(s.size) }));

      if (parsed.length === 0) {
         setError('Add at least one segment');
         return;
      }

      allocate({ name: procName.trim(), segments: parsed });

      setProcName('');
      setSegments([{ name: 'Code', size: '' }]);
   }

   return (
      <div className={styles.card}>
         <div className={styles.cardHeader}>
            <span className={styles.cardTitle}>Allocate Process</span>
         </div>

         <div className={styles.cardBody}>
            <label className={styles.label}>Algorithm</label>
            <div className={styles.algRow}>
               {(['first-fit', 'best-fit'] as AllocationAlgorithm[]).map((alg) => (
                  <button
                     key={alg}
                     className={`${styles.algBtn} ${algorithm === alg ? styles.algBtnActive : ''}`}
                     onClick={() => setAlgorithm(alg)}
                  >
                     {alg === 'first-fit' ? 'First Fit' : 'Best Fit'}
                  </button>
               ))}
            </div>

            <label className={styles.label}>Process Name</label>
            <input
               className={styles.input}
               type="text"
               placeholder="e.g. P1"
               value={procName}
               onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setProcName(e.target.value)
               }
            />

            <div className={styles.sectionLabel}>Segments</div>
            <table className={styles.table}>
               <thead>
                  <tr>
                     <th>Name</th>
                     <th>Size (K)</th>
                     <th />
                  </tr>
               </thead>
               <tbody>
                  {segments.map((s, i) => (
                     <tr key={i}>
                        <td>
                           <input
                              className={styles.input}
                              type="text"
                              placeholder="Code / Data / Stack…"
                              value={s.name}
                              onChange={(e) => updateSeg(i, 'name', e.target.value)}
                           />
                        </td>
                        <td>
                           <input
                              className={styles.input}
                              type="number"
                              min={1}
                              placeholder="0"
                              value={s.size}
                              onChange={(e) => updateSeg(i, 'size', e.target.value)}
                           />
                        </td>
                        <td className={styles.actionCell}>
                           <button
                              className={styles.btnDelete}
                              onClick={() =>
                                 setSegments((p) => p.filter((_, idx) => idx !== i))
                              }
                              disabled={segments.length === 1}
                           >
                              <TrashIcon />
                           </button>
                        </td>
                     </tr>
                  ))}
               </tbody>
            </table>

            <button
               className={styles.btnAdd}
               onClick={() => setSegments((p) => [...p, { name: '', size: '' }])}
            >
               <PlusIcon /> Add Segment
            </button>

            {error && <div className={styles.error}>{error}</div>}

            <button className={styles.btnSubmit} onClick={handleAllocate}>
               Allocate
            </button>
         </div>
      </div>
   );
}
