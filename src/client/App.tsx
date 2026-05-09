import { MemoryProvider } from './components/MemoryContext';
import SetupForm from './components/SetupForm';
import AllocationForm from './components/AllocationForm';
import DeallocationForm from './components/DeallocationForm';
import MemoryBar from './components/MemoryBar';
import SegmentTables from './components/SegmentTables';

export default function App() {
   return (
      <MemoryProvider>
         <div className="app-shell">
            <div className="app-main">
               <aside className="sidebar">
                  <SetupForm />
                  <AllocationForm />
                  <DeallocationForm />
               </aside>

               <div className="memory-col">
                  <div className="panel">
                     <div className="panel__header">
                        <span className="panel__title">Memory Layout</span>
                     </div>
                     <div className="panel__body">
                        <MemoryBar />
                     </div>
                  </div>
               </div>

               <div className="tables-col">
                  <SegmentTables />
               </div>
            </div>
         </div>
      </MemoryProvider>
   );
}
