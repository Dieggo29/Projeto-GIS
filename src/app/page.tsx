// src/app/page.tsx
'use client';

import { Box, Typography } from '@mui/material';
import Image from 'next/image';
import { useState, useEffect } from 'react';

export default function HomePage() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <Box
      sx={{
        position: 'relative',
        height: '100vh',
        width: '100vw',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #2E2E2E 0%, #1a1a1a 100%)',
      }}
    >
      {/* Logo Principal */}
      <Box
        sx={{
          zIndex: 1,
          textAlign: 'center',
          backgroundColor: 'rgba(46, 46, 46, 0.9)',
          padding: '3rem',
          borderRadius: '2rem',
          border: '2px solid #7CB342',
          boxShadow: '0 8px 32px rgba(124, 179, 66, 0.3)',
          backdropFilter: 'blur(10px)',
          maxWidth: '90vw',
        }}
      >
        {/* Container do Logo */}
        <Box
          sx={{
            mb: 3,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Box
            sx={{
              width: { xs: 280, sm: 350, md: 400 },
              height: { xs: 140, sm: 175, md: 200 },
              position: 'relative',
              filter: 'drop-shadow(0 4px 8px rgba(124, 179, 66, 0.4))',
            }}
            suppressHydrationWarning
          >
            {isClient && (
              <Image
                src="/images/boqueiro-da-pesca-logo.png"
                alt="Boqueirão da Pesca"
                fill
                sizes="(max-width: 768px) 280px, (max-width: 1200px) 350px, 400px"
                style={{
                  objectFit: 'contain',
                }}
                priority
                suppressHydrationWarning
              />
            )}
            {!isClient && (
              <Box
                sx={{
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'rgba(124, 179, 66, 0.1)',
                  borderRadius: '1rem',
                }}
              >
                <Typography sx={{ color: '#7CB342', fontSize: '1.2rem' }}>
                  Boqueirão da Pesca
                </Typography>
              </Box>
            )}
          </Box>
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
          Bem-vindo ao Boqueirão da Pesca
        </Typography>
        
        <Typography 
          variant="h6" 
          sx={{ 
            color: '#ffffff', 
            mb: 2,
            fontSize: { xs: '1rem', sm: '1.2rem', md: '1.4rem' }
          }}
        >
          Seu guia completo para a pesca
        </Typography>
        
        <Typography 
          sx={{ 
            color: 'rgba(255, 255, 255, 0.8)',
            fontSize: { xs: '0.9rem', sm: '1rem', md: '1.1rem' },
            maxWidth: '600px',
            margin: '0 auto'
          }}
        >
          Explore informações sobre atividade dos peixes, condições climáticas, 
          pressão barométrica e muito mais para tornar sua pescaria ainda melhor!
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