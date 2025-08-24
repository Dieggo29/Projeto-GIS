// src/components/Sidebar.tsx
'use client';

import React from 'react';
import { Drawer, Box, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Button, IconButton, Typography } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSidebar } from '@/context/SidebarContext'; // Importar nosso Hook
// ... (outros imports de ícones)
import HomeIcon from '@mui/icons-material/Home';
import SatelliteAltIcon from '@mui/icons-material/SatelliteAlt';
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import SpeedIcon from '@mui/icons-material/Speed'; // Ícone para pressão barométrica

const drawerWidth = 240;

const menuItems = [
    { text: 'Início', icon: <HomeIcon />, path: '/' },
    { text: 'Satelite', icon: <SatelliteAltIcon />, path: '/mapa' },
    { text: 'Clima', icon: <WbSunnyIcon />, path: '/clima' },
    { text: 'Pressão Barométrica', icon: <SpeedIcon />, path: '/pressao' },
];

export default function Sidebar() {
  // Pegamos o estado e a função do nosso contexto!
  const { isSidebarOpen, toggleSidebar } = useSidebar();
  const pathname = usePathname();

  return (
    <>
      <Drawer
        variant="persistent"
        open={isSidebarOpen}
        anchor="left"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          zIndex: 1200, // Z-index alto para ficar por cima
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            // --- ESTILO DE TRANSPARÊNCIA ---
            backgroundColor: 'rgba(46, 46, 46, 0.9)', // Fundo com 90% de opacidade
            backdropFilter: 'blur(10px)', // Efeito de vidro embaçado (moderno)
            color: 'rgba(255, 255, 255, 0.8)',
            borderRight: 'none',
          },
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 8px 8px 16px' }}>
          <Typography variant="h6" sx={{ color: 'white' }}>Site Teste</Typography>
          <IconButton onClick={toggleSidebar} sx={{ color: 'inherit' }}>
            <MenuIcon />
          </IconButton>
        </Box>
        <List>
          {menuItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <ListItem key={item.text} component={Link} href={item.path} disablePadding sx={{ textDecoration: 'none', color: 'inherit' }}>
                  <ListItemButton selected={isActive} sx={{ '&.Mui-selected': { backgroundColor: 'rgba(108, 154, 108, 0.7)' } }}>
                    <ListItemIcon sx={{ color: 'inherit' }}>{item.icon}</ListItemIcon>
                    <ListItemText primary={item.text} />
                  </ListItemButton>
              </ListItem>
            );
          })}
        </List>
        <Box sx={{ flexGrow: 1 }} />
        <Box sx={{ padding: '16px' }}>
            <Button variant="contained" fullWidth sx={{ backgroundColor: '#4a754a', '&:hover': { backgroundColor: '#3e623e'} }}>
              Entrar
            </Button>
        </Box>
      </Drawer>

      <IconButton
        onClick={toggleSidebar}
        sx={{
          position: 'fixed',
          top: 16,
          left: 16,
          zIndex: 1301,
          color: 'white',
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: isSidebarOpen ? 'none' : 'inline-flex',
        }}
      >
        <MenuIcon />
      </IconButton>
    </>
  );
}