import React, { createContext, useContext, useState } from 'react';

interface DragContextType {
  activeElementType: string | null;
  setActiveElementType: (type: string | null) => void;
}

const DragContext = createContext<DragContextType>({
  activeElementType: null,
  setActiveElementType: () => {},
});

export const useDragContext = () => useContext(DragContext);

export const DragContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeElementType, setActiveElementType] = useState<string | null>(null);

  return (
    <DragContext.Provider value={{ activeElementType, setActiveElementType }}>
      {children}
    </DragContext.Provider>
  );
};
