import { useState } from 'react';
import { useMemory } from './MemoryContext';
import styles from '@/styles/Form.module.css';

export default function DeallocationForm() {
   const { deallocate, state } = useMemory();
   const [selected, setSelected] = useState('');

   const liveProcesses = Object.keys(state?.segmentTables ?? {});
   if (!state?.initialized || liveProcesses.length === 0) return null;

   function handleDeallocate() {
      if (!selected) return;
      deallocate(selected);
      setSelected('');
   }

   return (
      <div className={styles.card}>
         <div className={styles.cardHeader}>
            <span className={styles.cardTitle}>Deallocate Process</span>
         </div>

         <div className={styles.cardBody}>
            <label className={styles.label}>Process</label>
            <div className={styles.selectWrapper}>
               <select
                  className={styles.select}
                  value={selected}
                  onChange={(e) => setSelected(e.target.value)}
               >
                  <option value="">- select process -</option>
                  {liveProcesses.map((name) => (
                     <option key={name} value={name}>
                        {name}
                     </option>
                  ))}
               </select>
            </div>

            <button
               className={styles.btnDanger}
               onClick={handleDeallocate}
               disabled={!selected}
            >
               Free Memory
            </button>
         </div>
      </div>
   );
}
