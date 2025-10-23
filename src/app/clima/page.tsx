// src/app/clima/page.tsx
'use client';

import { Box, Typography, CircularProgress } from '@mui/material';
import { useEffect, useState } from 'react';

interface Localizacao {
  latitude: number;
  longitude: number;
}

export default function ClimaPage() {
  const [localizacao, setLocalizacao] = useState<Localizacao | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    const obterLocalizacao = () => {
      if (!navigator.geolocation) {
        setErro('Geolocalização não é suportada pelo seu navegador');
        // Fallback para Brasil centralizado
        setLocalizacao({ latitude: -15.7801, longitude: -47.9292 });
        setCarregando(false);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocalizacao({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
          setCarregando(false);
        },
        (error) => {
          console.error('Erro ao obter localização:', error);
          setErro('Não foi possível obter sua localização');
          // Fallback para Brasil centralizado
          setLocalizacao({ latitude: -15.7801, longitude: -47.9292 });
          setCarregando(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutos
        }
      );
    };

    obterLocalizacao();
  }, []);

  if (carregando) {
    return (
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center', 
        height: '100%',
        gap: 2,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        color: 'white'
      }}>
        <CircularProgress sx={{ color: '#7CB342' }} />
        <Typography sx={{ color: '#7CB342', fontWeight: 'bold' }}>
          Obtendo sua localização...
        </Typography>
        <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)', textAlign: 'center' }}>
          Permita o acesso à localização para ver o clima da sua região
        </Typography>
      </Box>
    );
  }

  if (!localizacao) {
    return (
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center', 
        height: '100%',
        gap: 2,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        color: 'white',
        p: 3
      }}>
        <Typography color="error" variant="h6">
          Erro ao obter localização
        </Typography>
        <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)', textAlign: 'center' }}>
          Mostrando mapa geral do Brasil
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: '100%', 
      width: '100%',
      position: 'relative'
    }}>
      
      {/* Indicador de localização */}
      {erro && (
        <Box sx={{ 
          position: 'absolute',
          top: 20,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 1000,
          backgroundColor: 'rgba(255, 152, 0, 0.9)',
          color: 'white',
          px: 3,
          py: 1,
          borderRadius: 2,
          boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
        }}>
          <Typography variant="body2" align="center">
            {erro} - Mostrando mapa geral
          </Typography>
        </Box>
      )}
      
      {/* Mapa do Windy baseado na localização do usuário */}
      <Box sx={{ 
        flex: 1, 
        minHeight: 0,
        width: '100%',
        height: '100%'
      }}>
        <iframe
          width="100%"
          height="100%"
          src={`https://embed.windy.com/embed.html?type=map&location=coordinates&metricWind=km%2Fh&metricTemp=%C2%B0C&radarRange=-1&lat=${localizacao.latitude}&lon=${localizacao.longitude}&zoom=10&overlay=wind`}
          frameBorder="0"
        ></iframe>
      </Box>

    </Box>
  );
}