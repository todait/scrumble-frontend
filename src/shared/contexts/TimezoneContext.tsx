'use client';

import { createContext, useContext, ReactNode } from 'react';
import { useTimezone } from '../hooks/useTimezone';

interface TimezoneContextValue {
  timezone: string;
  isLoading: boolean;
  error: string | null;
  setTimezone: (timezone: string) => void;
}

const TimezoneContext = createContext<TimezoneContextValue | null>(null);

export function TimezoneProvider({ children }: { children: ReactNode }) {
  const timezoneState = useTimezone();

  return (
    <TimezoneContext.Provider value={timezoneState}>
      {children}
    </TimezoneContext.Provider>
  );
}

export function useTimezoneContext() {
  const context = useContext(TimezoneContext);
  if (!context) {
    throw new Error('useTimezoneContext must be used within TimezoneProvider');
  }
  return context;
}