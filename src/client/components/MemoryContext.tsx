import React, { createContext, useContext, useEffect, useState } from 'react';

type MemoryContextType = {
   state: MemoryState | null;
   algorithm: AllocationAlgorithm;
   setAlgorithm: React.Dispatch<React.SetStateAction<AllocationAlgorithm>>;
   init: (totalSize: number, holes: Hole[]) => void;
   allocate: (process: ProcessInput) => void;
   deallocate: (processName: string) => void;
};

const MemoryContext = createContext<MemoryContextType>({
   state: null,
   algorithm: 'first-fit',
   setAlgorithm: () => {},
   init: () => {},
   allocate: () => {},
   deallocate: () => {},
});

export const useMemory = () => useContext(MemoryContext);

export const MemoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
   const [state, setState] = useState<MemoryState | null>(null);
   const [algorithm, setAlgorithm] = useState<AllocationAlgorithm>('first-fit');

   useEffect(() => {
      return window.memoryApi.subscribe(setState);
   }, []);

   return (
      <MemoryContext.Provider
         value={{
            state,
            algorithm,
            setAlgorithm,
            init: (totalSize, holes) => window.memoryApi.init({ totalSize, holes }),
            allocate: (process) => window.memoryApi.allocate({ process, algorithm }),
            deallocate: (processName) => window.memoryApi.deallocate(processName),
         }}
      >
         {children}
      </MemoryContext.Provider>
   );
};
