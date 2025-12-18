import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface OnboardingContextType {
  targetElements: Map<number, HTMLElement>;
  registerTarget: (step: number, element: HTMLElement | null) => void;
  getTargetRect: (step: number) => DOMRect | null;
}

const OnboardingContext = createContext<OnboardingContextType | null>(null);

export const OnboardingProvider = ({ children }: { children: ReactNode }) => {
  const [targetElements, setTargetElements] = useState<Map<number, HTMLElement>>(new Map());

  const registerTarget = useCallback((step: number, element: HTMLElement | null) => {
    if (element) {
      setTargetElements(prev => {
        const newMap = new Map(prev);
        newMap.set(step, element);
        return newMap;
      });
    }
  }, []);

  const getTargetRect = useCallback((step: number): DOMRect | null => {
    const element = targetElements.get(step);
    return element?.getBoundingClientRect() || null;
  }, [targetElements]);

  return (
    <OnboardingContext.Provider value={{ targetElements, registerTarget, getTargetRect }}>
      {children}
    </OnboardingContext.Provider>
  );
};

export const useOnboardingContext = () => {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error('useOnboardingContext must be used within an OnboardingProvider');
  }
  return context;
};
