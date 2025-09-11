// src/context/SidebarContext.tsx
'use client';

import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';

interface SidebarContextType {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  isHydrated: boolean;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    try {
      setIsHydrated(true);
    } catch (error) {
      console.error('Erro na hidratação do SidebarContext:', error);
    }
  }, []);

  const toggleSidebar = () => {
    try {
      setSidebarOpen(!isSidebarOpen);
    } catch (error) {
      console.error('Erro ao alternar sidebar:', error);
    }
  };

  return (
    <SidebarContext.Provider value={{ isSidebarOpen, toggleSidebar, isHydrated }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (context === undefined) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
}