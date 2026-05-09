import { useState, type ChangeEvent } from 'react';
import { useMemory } from './MemoryContext';
import styles from '@/styles/Form.module.css';
import TrashIcon from './icons/TrashIcon';
import PlusIcon from './icons/PlusIcon';

type HoleRow = { start: string; size: string };

export default function SetupForm() {
   const { init, state } = useMemory();
   const [totalSize, setTotalSize] = useState('1000');
   const [holes, setHoles] = useState<HoleRow[]>([{ start: '', size: '' }]);

   if (state?.initialized) return null;

   function updateHole(i: number, field: keyof HoleRow, val: string) {
      setHoles((prev) => prev.map((h, idx) => (idx === i ? { ...h, [field]: val } : h)));
   }

   function removeHole(i: number) {
      setHoles((prev) => prev.filter((_, idx) => idx !== i));
   }

   function handleSubmit() {
      const parsedHoles: Hole[] = holes
         .filter((h) => h.start !== '' && h.size !== '')
         .map((h) => ({ start: Number(h.start), size: Number(h.size) }));
      init(Number(totalSize), parsedHoles);
   }

   return (
      <div className={styles.card}>
         <div className={styles.cardHeader}>
            <span className={styles.cardTitle}>Memory Setup</span>
         </div>

         <div className={styles.cardBody}>
            <label className={styles.label}>Total Memory Size (K)</label>
            <input
               className={styles.input}
               type="number"
               min={1}
               value={totalSize}
               onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setTotalSize(e.target.value)
               }
            />

            <div className={styles.sectionLabel}>Initial Holes</div>

            <table className={styles.table}>
               <thead>
                  <tr>
                     <th>#</th>
                     <th>Start (K)</th>
                     <th>Size (K)</th>
                     <th />
                  </tr>
               </thead>
               <tbody>
                  {holes.map((h, i) => (
                     <tr key={i}>
                        <td className={styles.indexCell}>H{i + 1}</td>
                        <td>
                           <input
                              className={styles.input}
                              type="number"
                              min={0}
                              placeholder="0"
                              value={h.start}
                              onChange={(e) => updateHole(i, 'start', e.target.value)}
                           />
                        </td>
                        <td>
                           <input
                              className={styles.input}
                              type="number"
                              min={1}
                              placeholder="0"
                              value={h.size}
                              onChange={(e) => updateHole(i, 'size', e.target.value)}
                           />
                        </td>
                        <td className={styles.actionCell}>
                           <button
                              className={styles.btnDelete}
                              onClick={() => removeHole(i)}
                              title="Remove hole"
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
               onClick={() => setHoles((p) => [...p, { start: '', size: '' }])}
            >
               <PlusIcon /> Add Hole
            </button>

            <button className={styles.btnSubmit} onClick={handleSubmit}>
               Initialize Memory
            </button>
         </div>
      </div>
   );
}
