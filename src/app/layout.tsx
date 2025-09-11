// src/app/layout.tsx
import './globals.css';
import ThemeRegistry from '@/components/ThemeRegistry';
import { Box } from '@mui/material';
import Sidebar from '@/components/Sidebar';
import { SidebarProvider } from '@/context/SidebarContext'; // Importar nosso Provedor

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-br" suppressHydrationWarning>
      <body>
        {/* Envolvemos tudo com o SidebarProvider */}
        <SidebarProvider>
          <ThemeRegistry>
            <Box sx={{ position: 'relative' }}>
              <Sidebar />
              {/* O conteúdo principal agora é simples e não se preocupa com margens */}
              <Box component="main" sx={{ width: '100vw', height: '100vh' }}>
                {children}
              </Box>
            </Box>
          </ThemeRegistry>
        </SidebarProvider>
      </body>
    </html>
  );
}

<head>
  <meta
    name="format-detection"
    content="telephone=no, date=no, email=no, address=no"
  />
  {/* outros meta tags */}
</head>