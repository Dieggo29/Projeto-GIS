// src/app/page.tsx
'use client';

import { Box, Typography } from '@mui/material';
import { useState, useEffect } from 'react';

export default function HomePage() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 50%, #7CB342 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        padding: { xs: 2, sm: 4 }
      }}
    >
      {/* Conteúdo Principal */}
      <Box
        sx={{
          textAlign: 'center',
          zIndex: 2,
          maxWidth: '800px',
          width: '100%'
        }}
      >
        {/* Logo */}
        <Box
          sx={{
            position: 'relative',
            width: { xs: 280, sm: 350, md: 400 },
            height: { xs: 200, sm: 250, md: 300 },
            margin: '0 auto 2rem auto',
            borderRadius: '1rem',
            overflow: 'hidden',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <Typography 
            sx={{ 
              color: '#7CB342', 
              fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' },
              fontWeight: 'bold',
              textAlign: 'center'
            }}
          >
            Projeto GIS
          </Typography>
        </Box>

        {/* Texto de Boas-vindas */}
        <Typography 
          variant="h4" 
          component="h1" 
          sx={{ 
            color: '#7CB342', 
            fontWeight: 'bold', 
            mb: 2,
            fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' },
            textShadow: '0 2px 4px rgba(0,0,0,0.5)'
          }}
        >
          Bem-vindo ao meu Projeto GIS
        </Typography>
        
        <Typography 
          variant="h6" 
          sx={{ 
            color: '#ffffff', 
            mb: 2,
            fontSize: { xs: '1rem', sm: '1.2rem', md: '1.4rem' }
          }}
        >
          Sistema de Informações Geográficas
        </Typography>
        
        <Typography 
          sx={{ 
            color: 'rgba(255, 255, 255, 0.9)',
            fontSize: { xs: '0.9rem', sm: '1rem', md: '1.1rem' },
            maxWidth: '600px',
            margin: '0 auto 1.5rem auto'
          }}
        >
          Explore informações geográficas, condições climáticas e dados meteorológicos em tempo real!
        </Typography>

        {/* Créditos do Desenvolvedor */}
        <Typography 
          sx={{ 
            color: 'rgba(255, 255, 255, 0.7)',
            fontSize: { xs: '0.8rem', sm: '0.9rem', md: '1rem' },
            fontStyle: 'italic',
            maxWidth: '500px',
            margin: '0 auto',
            mt: 2,
            padding: '1rem',
            borderRadius: '0.5rem',
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(5px)',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}
        >
          Desenvolvido por <strong style={{ color: '#7CB342' }}>Diego Franco</strong> como método de estudo em tecnologias GIS e desenvolvimento web.
        </Typography>
      </Box>

      {/* Elementos decorativos */}
      <Box
        sx={{
          position: 'absolute',
          top: '10%',
          left: '10%',
          width: 100,
          height: 100,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(124, 179, 66, 0.2) 0%, transparent 70%)',
          '@keyframes float': {
            '0%, 100%': {
              transform: 'translateY(0px)',
            },
            '50%': {
              transform: 'translateY(-20px)',
            },
          },
          animation: 'float 6s ease-in-out infinite',
        }}
      />
      
      <Box
        sx={{
          position: 'absolute',
          bottom: '15%',
          right: '15%',
          width: 80,
          height: 80,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(124, 179, 66, 0.15) 0%, transparent 70%)',
          '@keyframes floatReverse': {
            '0%, 100%': {
              transform: 'translateY(0px)',
            },
            '50%': {
              transform: 'translateY(-20px)',
            },
          },
          animation: 'floatReverse 8s ease-in-out infinite reverse',
        }}
      />
    </Box>
  );
}