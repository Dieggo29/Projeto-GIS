// src/app/layout.tsx
import './globals.css';
import ThemeRegistry from '@/components/ThemeRegistry';
import { Box } from '@mui/material';
import Sidebar from '@/components/Sidebar';
import { SidebarProvider } from '@/context/SidebarContext'; // Importar nosso Provedor

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
      </head>
      <body>
        <ThemeRegistry>
          <SidebarProvider>
            <Box sx={{ display: 'flex', minHeight: '100vh' }}>
              <Sidebar />
              <Box 
                component="main" 
                sx={{ 
                  flexGrow: 1,
                  p: { xs: 1, sm: 2, md: 3 }, // Padding responsivo
                  mt: { xs: 0, sm: 0 },
                  width: { xs: '100%', sm: 'calc(100% - 240px)' }
                }}
              >
                {children}
              </Box>
            </Box>
          </SidebarProvider>
        </ThemeRegistry>
      </body>
    </html>
  )
}

<head>
  <meta
    name="format-detection"
    content="telephone=no, date=no, email=no, address=no"
  />
  {/* outros meta tags */}
</head>