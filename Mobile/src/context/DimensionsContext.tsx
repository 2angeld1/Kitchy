import React, { createContext, useContext, useMemo, ReactNode } from 'react';
import { useWindowDimensions } from 'react-native';

interface DimensionsContextData {
  width: number;
  height: number;
  isTablet: boolean;
  isLandscape: boolean;
}

const DimensionsContext = createContext<DimensionsContextData>({} as DimensionsContextData);

export const DimensionsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { width, height } = useWindowDimensions();

  const value = useMemo(() => ({
    width,
    height,
    isTablet: width >= 768,
    isLandscape: width > height,
  }), [width, height]);

  return (
    <DimensionsContext.Provider value={value}>
      {children}
    </DimensionsContext.Provider>
  );
};

export const useAppDimensions = () => {
  const context = useContext(DimensionsContext);
  if (!context) {
    throw new Error('useAppDimensions debe ser usado dentro de un DimensionsProvider');
  }
  return context;
};
