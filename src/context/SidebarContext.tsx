// src/context/SidebarContext.tsx
'use client';

import React, { createContext, useState, useContext, ReactNode } from 'react';

// Definimos o que nosso contexto irá fornecer
interface SidebarContextType {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
}

// Criamos o Contexto com um valor padrão
const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

// Criamos o Provedor, que irá conter a lógica e envolver nossa aplicação
export function SidebarProvider({ children }: { children: ReactNode }) {
  const [isSidebarOpen, setSidebarOpen] = useState(false); // Começar fechado por padrão

  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  return (
    <SidebarContext.Provider value={{ isSidebarOpen, toggleSidebar }}>
      {children}
    </SidebarContext.Provider>
  );
}

// Criamos um Hook customizado para facilitar o uso do nosso contexto
export function useSidebar() {
  const context = useContext(SidebarContext);
  if (context === undefined) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
}