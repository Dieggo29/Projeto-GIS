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
        // Fallback para Curitiba
        setLocalizacao({ latitude: -25.428, longitude: -49.273 });
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
          // Fallback para Curitiba
          setLocalizacao({ latitude: -25.428, longitude: -49.273 });
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
        gap: 2
      }}>
        <CircularProgress />
        <Typography>Obtendo sua localização...</Typography>
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
        gap: 2
      }}>
        <Typography color="error">Erro ao obter localização</Typography>
        <Typography variant="body2">Usando localização padrão (Curitiba)</Typography>
      </Box>
    );
  }

  return (
    // Container principal com layout de coluna, ocupando 100% da altura
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%' }}>
      
      {/* Mensagem de localização */}
      {erro && (
        <Box sx={{ p: 1, backgroundColor: 'warning.light', color: 'warning.contrastText' }}>
          <Typography variant="body2" align="center">
            {erro} - Usando localização padrão (Curitiba)
          </Typography>
        </Box>
      )}
      
      {/* --- SEÇÃO 1: O MAPA GRANDE DO WINDY (Baseado na localização atual) --- */}
      <Box sx={{ flex: 1, minHeight: 0 }}>
        <iframe
          width="100%"
          height="100%"
          src={`https://embed.windy.com/embed.html?type=map&location=coordinates&metricWind=km%2Fh&metricTemp=%C2%B0C&radarRange=-1&lat=${localizacao.latitude}&lon=${localizacao.longitude}`}
          frameBorder="0"
        ></iframe>
      </Box>

      {/* --- SEÇÃO 2: A BARRA DE PREVISÃO DO TEMPO (Baseada na localização atual) --- */}
      <Box sx={{ height: 'auto', flexShrink: 0, position: 'relative', overflow: 'hidden' }}>
        {/* Este é o iframe com previsão baseada na localização do usuário */}
        <iframe
          loading="lazy"
          style={{ 
            border: "none", 
            width: "100%", 
            height: "230px",
            marginBottom: "-30px" /* Remove a tarja cinza escondendo a parte inferior */
          }}
          src={`https://embed.windy.com/embed.html?type=forecast&location=coordinates&lat=${localizacao.latitude}&lon=${localizacao.longitude}&detailLat=${localizacao.latitude}&detailLon=${localizacao.longitude}&metricWind=km%2Fh&metricTemp=%C2%B0C&radarRange=-1`}
        ></iframe>
      </Box>

    </Box>
  );
}