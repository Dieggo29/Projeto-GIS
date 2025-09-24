// src/components/Sidebar.tsx
'use client';

import React from 'react';
import { Drawer, Box, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Button, IconButton, Typography, useTheme, useMediaQuery } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSidebar } from '@/context/SidebarContext';
import HomeIcon from '@mui/icons-material/Home';
import SatelliteAltIcon from '@mui/icons-material/SatelliteAlt';
import WbSunnyIcon from '@mui/icons-material/WbSunny';

const drawerWidth = 280;

const menuItems = [
    { text: 'Início', icon: <HomeIcon />, path: '/' },
    { text: 'Satelite', icon: <SatelliteAltIcon />, path: '/mapa' },
    { text: 'Clima', icon: <WbSunnyIcon />, path: '/clima' }
];

export default function Sidebar() {
  const { isSidebarOpen, toggleSidebar } = useSidebar();
  const pathname = usePathname();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <>
      {/* Botão do menu - sempre visível */}
      <IconButton
        onClick={toggleSidebar}
        sx={{
          position: 'fixed',
          top: 16,
          left: 16,
          zIndex: 1300,
          backgroundColor: 'rgba(46, 46, 46, 0.7)',
          backdropFilter: 'blur(15px)',
          color: 'white',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          '&:hover': {
            backgroundColor: 'rgba(46, 46, 46, 0.8)',
          },
        }}
      >
        <MenuIcon />
      </IconButton>

      <Drawer
        variant="temporary"
        open={isSidebarOpen}
        onClose={toggleSidebar}
        anchor="left"
        sx={{
          zIndex: 1200,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            backgroundColor: 'rgba(46, 46, 46, 0.7)',
            backdropFilter: 'blur(15px)',
            color: 'rgba(255, 255, 255, 0.9)',
            borderRight: '1px solid rgba(255, 255, 255, 0.1)',
            ...(isMobile && {
              paddingTop: 'env(safe-area-inset-top)',
              paddingBottom: 'env(safe-area-inset-bottom)',
            }),
          },
        }}
      >
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between', 
          padding: isMobile ? '16px 12px' : '8px 8px 8px 16px',
          minHeight: 56
        }}>
          <Typography 
            variant={isMobile ? "h6" : "h6"} 
            sx={{ 
              color: '#7CB342', 
              fontWeight: 'bold',
              textAlign: 'center',
              mb: 2
            }}
          >
            Projeto GIS
          </Typography>
          <IconButton 
            onClick={toggleSidebar} 
            sx={{ 
              color: 'inherit',
              minWidth: 48,
              minHeight: 48
            }}
          >
            <MenuIcon />
          </IconButton>
        </Box>

        <List sx={{ flexGrow: 1, px: 1 }}>
          {menuItems.map((item) => (
            <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
              <Link href={item.path} style={{ textDecoration: 'none', width: '100%' }}>
                <ListItemButton
                  onClick={toggleSidebar}
                  sx={{
                    borderRadius: 2,
                    mx: 1,
                    backgroundColor: pathname === item.path ? 'rgba(124, 179, 66, 0.2)' : 'transparent',
                    color: pathname === item.path ? '#7CB342' : 'rgba(255, 255, 255, 0.8)',
                    '&:hover': {
                      backgroundColor: pathname === item.path ? 'rgba(124, 179, 66, 0.3)' : 'rgba(255, 255, 255, 0.1)',
                    },
                    transition: 'all 0.2s ease-in-out',
                  }}
                >
                  <ListItemIcon 
                    sx={{ 
                      color: pathname === item.path ? '#7CB342' : 'rgba(255, 255, 255, 0.7)',
                      minWidth: 40
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText 
                    primary={item.text}
                    sx={{
                      '& .MuiListItemText-primary': {
                        fontWeight: pathname === item.path ? 600 : 400,
                      }
                    }}
                  />
                </ListItemButton>
              </Link>
            </ListItem>
          ))}
        </List>

        <Box sx={{ p: 2, mt: 'auto' }}>
          <Button
            variant="outlined"
            fullWidth
            onClick={toggleSidebar}
            sx={{
              color: 'rgba(255, 255, 255, 0.8)',
              borderColor: 'rgba(255, 255, 255, 0.3)',
              '&:hover': {
                borderColor: '#7CB342',
                backgroundColor: 'rgba(124, 179, 66, 0.1)',
              },
            }}
          >
            Fechar Menu
          </Button>
        </Box>
      </Drawer>
    </>
  );
}