// src/app/layout.tsx
import './globals.css';
import ThemeRegistry from '@/components/ThemeRegistry';
import { Box } from '@mui/material';
import Sidebar from '@/components/Sidebar';
import { SidebarProvider } from '@/context/SidebarContext';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Boqueirão da Pesca',
  description: 'Aplicativo de pesca com informações meteorológicas e mapas',
  formatDetection: {
    telephone: false,
    date: false,
    email: false,
    address: false,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-br" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <SidebarProvider>
          <ThemeRegistry>
            <Box sx={{ position: 'relative' }}>
              <Sidebar />
              <Box 
                component="main" 
                sx={{ 
                  width: '100vw', 
                  height: '100vh',
                  overflow: 'hidden'
                }}
              >
                {children}
              </Box>
            </Box>
          </ThemeRegistry>
        </SidebarProvider>
      </body>
    </html>
  );
}