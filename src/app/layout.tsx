// src/app/layout.tsx
'use client';

import './globals.css';
import ThemeRegistry from '@/components/ThemeRegistry';
import { Box } from '@mui/material';
import Sidebar from '@/components/Sidebar';
import { SidebarProvider, useSidebar } from '@/context/SidebarContext';

function LayoutContent({ children }: { children: React.ReactNode }) {
  const { isSidebarOpen } = useSidebar();
  
  return (
    <Box sx={{ 
      display: 'flex', 
      height: '100vh',
      width: '100vw',
      overflow: 'hidden'
    }}>
      <Sidebar />
      <Box 
        component="main" 
        sx={{ 
          flexGrow: 1,
          height: '100vh',
          overflow: 'hidden',
          position: 'relative',
          marginLeft: isSidebarOpen ? '280px' : '0px',
          transition: 'margin-left 0.3s ease-in-out',
          width: isSidebarOpen ? 'calc(100vw - 280px)' : '100vw'
        }}
      >
        {children}
      </Box>
    </Box>
  );
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <meta name="theme-color" content="#1976d2" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="format-detection" content="telephone=no, date=no, email=no, address=no" />
      </head>
      <body style={{ margin: 0, padding: 0, overflow: 'hidden' }}>
        <ThemeRegistry>
          <SidebarProvider>
            <LayoutContent>
              {children}
            </LayoutContent>
          </SidebarProvider>
        </ThemeRegistry>
      </body>
    </html>
  )
}