// src/components/Sidebar.tsx
'use client';

import React from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
  useTheme,
  useMediaQuery,
  Box
} from '@mui/material';
import {
  Menu as MenuIcon,
  Close as CloseIcon,
  Home as HomeIcon,
  TrendingUp as TrendingUpIcon,
  Speed as SpeedIcon
} from '@mui/icons-material';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSidebar } from '@/context/SidebarContext';
import HomeIcon from '@mui/icons-material/Home';
import SatelliteAltIcon from '@mui/icons-material/SatelliteAlt';
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import SpeedIcon from '@mui/icons-material/Speed';
import PhishingIcon from '@mui/icons-material/Phishing';
import QuizIcon from '@mui/icons-material/Quiz';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import MapIcon from '@mui/icons-material/Map';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import MenuBookIcon from '@mui/icons-material/MenuBook';

const drawerWidth = 280; // Aumentado para melhor usabilidade mobile

// Reordenar o array menuItems
const menuItems = [
    { text: 'Início', icon: <HomeIcon />, path: '/' },
    { text: 'Rifas', icon: <LocalOfferIcon />, path: '/rifas' },
    { text: 'Satelite', icon: <SatelliteAltIcon />, path: '/mapa' },
    { text: 'Atividade dos Peixes', icon: <SpeedIcon />, path: '/atividade-peixes' },
    { text: 'Clima', icon: <WbSunnyIcon />, path: '/clima' },
    { text: 'Pressão Barométrica', icon: <SpeedIcon />, path: '/pressao' },
    { text: 'Dúvidas de Pesca', icon: <HelpOutlineIcon />, path: '/duvidas-pesca' }
];

export default function Sidebar() {
  const { isSidebarOpen, toggleSidebar, isHydrated } = useSidebar();
  const pathname = usePathname();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md')); // Detecta se é mobile

  if (!isHydrated) {
    return null;
  }

  return (
    <>
      <Drawer
        variant={isMobile ? "temporary" : "persistent"} // Drawer temporário no mobile
        open={isSidebarOpen}
        onClose={toggleSidebar} // Fecha ao clicar fora no mobile
        anchor="left"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          zIndex: 1200,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            backgroundColor: 'rgba(46, 46, 46, 0.95)', // Mais opaco no mobile
            backdropFilter: 'blur(10px)',
            color: 'rgba(255, 255, 255, 0.9)',
            borderRight: 'none',
            // Melhor padding para mobile
            ...(isMobile && {
              paddingTop: 'env(safe-area-inset-top)', // Respeita área segura do iPhone
              paddingBottom: 'env(safe-area-inset-bottom)',
            }),
          },
        }}
      >
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between', 
          padding: isMobile ? '16px 12px' : '8px 8px 8px 16px', // Mais padding no mobile
          minHeight: 56 // Altura mínima para área de toque
        }}>
          <Typography 
            variant={isMobile ? "h6" : "h6"} 
            sx={{ 
              color: '#7CB342', 
              fontWeight: 'bold',
              fontSize: isMobile ? '1.1rem' : '1.25rem' // Fonte menor no mobile
            }}
          >
            Boqueirão da Pesca
          </Typography>
          <IconButton 
            onClick={toggleSidebar} 
            sx={{ 
              color: 'inherit',
              minWidth: 48, // Área de toque mínima
              minHeight: 48
            }}
          >
            <MenuIcon />
          </IconButton>
        </Box>
        
        <List sx={{ paddingTop: 0 }}>
          {menuItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <ListItem 
                key={item.text} 
                component={Link} 
                href={item.path} 
                disablePadding 
                sx={{ 
                  textDecoration: 'none', 
                  color: 'inherit',
                  marginBottom: isMobile ? '4px' : '2px' // Mais espaço no mobile
                }}
                onClick={isMobile ? toggleSidebar : undefined} // Fecha sidebar ao clicar no mobile
              >
                <ListItemButton 
                  selected={isActive} 
                  sx={{ 
                    minHeight: isMobile ? 56 : 48, // Altura maior para toque
                    paddingX: isMobile ? 3 : 2,
                    paddingY: isMobile ? 1.5 : 1,
                    '&.Mui-selected': { 
                      backgroundColor: 'rgba(124, 179, 66, 0.25)',
                      borderRight: '4px solid #7CB342' // Borda mais grossa
                    },
                    '&:hover': {
                      backgroundColor: 'rgba(124, 179, 66, 0.15)'
                    },
                    borderRadius: isMobile ? '8px' : '4px', // Bordas mais arredondadas no mobile
                    marginX: isMobile ? 1 : 0
                  }}
                >
                  <ListItemIcon 
                    sx={{ 
                      color: isActive ? '#7CB342' : 'inherit',
                      minWidth: isMobile ? 48 : 40 // Ícones maiores no mobile
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText 
                    primary={item.text} 
                    sx={{ 
                      color: isActive ? '#7CB342' : 'inherit',
                      '& .MuiTypography-root': {
                        fontSize: isMobile ? '1rem' : '0.875rem', // Texto maior no mobile
                        fontWeight: isActive ? 600 : 400
                      }
                    }} 
                  />
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
        
        <Box sx={{ flexGrow: 1 }} />
        
        <Box sx={{ 
          padding: isMobile ? '20px 16px' : '16px',
          paddingBottom: isMobile ? 'calc(20px + env(safe-area-inset-bottom))' : '16px'
        }}>
          <Button 
            variant="contained" 
            fullWidth 
            sx={{ 
              backgroundColor: '#7CB342', 
              '&:hover': { backgroundColor: '#689F38' },
              fontWeight: 'bold',
              minHeight: isMobile ? 48 : 36, // Botão maior no mobile
              fontSize: isMobile ? '1rem' : '0.875rem',
              borderRadius: isMobile ? '12px' : '8px'
            }}
          >
            Entrar
          </Button>
        </Box>
      </Drawer>

      {/* Botão hambúrguer - sempre visível no mobile quando sidebar fechada */}
      <IconButton
        onClick={toggleSidebar}
        sx={{
          position: 'fixed',
          top: isMobile ? 20 : 16,
          left: isMobile ? 20 : 16,
          zIndex: 1301,
          color: 'white',
          backgroundColor: 'rgba(0,0,0,0.7)',
          backdropFilter: 'blur(8px)',
          display: isSidebarOpen ? 'none' : 'inline-flex',
          minWidth: isMobile ? 56 : 48, // Botão maior no mobile
          minHeight: isMobile ? 56 : 48,
          borderRadius: isMobile ? '16px' : '12px',
          boxShadow: isMobile ? '0 4px 12px rgba(0,0,0,0.3)' : '0 2px 8px rgba(0,0,0,0.2)',
          '&:hover': {
            backgroundColor: 'rgba(0,0,0,0.8)',
            transform: 'scale(1.05)'
          },
          transition: 'all 0.2s ease-in-out'
        }}
      >
        <MenuIcon sx={{ fontSize: isMobile ? 28 : 24 }} />
      </IconButton>
    </>
  );
}