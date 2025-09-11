// src/app/pressao/page.tsx
'use client';

import { Box, Typography, Paper, LinearProgress, IconButton, useTheme, useMediaQuery } from '@mui/material';
import { useEffect, useState, useCallback } from 'react';
import MyLocationIcon from '@mui/icons-material/MyLocation';

export default function PressaoBarometricaPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  
  const [pressaoData, setPressaoData] = useState({
    pressao: null,
    tendencia: null,
    local: 'Obtendo localização...',
    loading: true,
    error: null,
    latitude: null,
    longitude: null
  });
  
  const [localizacaoStatus, setLocalizacaoStatus] = useState({
    solicitada: false,
    obtendo: false,
    erro: null
  });

  // Função para obter a localização do usuário
  const obterLocalizacao = useCallback(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setPressaoData(prev => ({
            ...prev,
            latitude,
            longitude
          }));
          setLocalizacaoStatus({
            solicitada: true,
            obtendo: false,
            erro: null
          });
          buscarDadosPressao(latitude, longitude);
        },
        (error) => {
          console.error('Erro ao obter localização:', error);
          setLocalizacaoStatus({
            solicitada: true,
            obtendo: false,
            erro: 'Não foi possível obter sua localização'
          });
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
      );
    }
  }, []);
  
  // Adicione esta função DENTRO do componente, antes da função buscarDadosPressao
  const determinarTendencia = (pressao: number): string => {
    if (pressao < 1000) return 'descendo';
    if (pressao > 1020) return 'subindo';
    return 'estável';
  };
  
  // Função para buscar dados de pressão barométrica com base na localização
  const buscarDadosPressao = useCallback(async (lat: number, lon: number): Promise<void> => {
    setPressaoData(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const API_KEY = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;
      
      if (!API_KEY) {
        throw new Error('Chave da API não configurada');
      }
      
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=pt_br`
      );
      
      if (!response.ok) {
        throw new Error(`Erro na API: ${response.status}`);
      }
      
      const data = await response.json();
      
      setPressaoData({
        pressao: data.main.pressure,
        tendencia: determinarTendencia(data.main.pressure),
        local: `${data.name}, ${data.sys.country}`,
        loading: false,
        error: null,
        latitude: lat,
        longitude: lon
      });
    } catch (error) {
      console.error('Erro ao buscar dados de pressão:', error);
      setPressaoData(prev => ({ 
        ...prev, 
        loading: false, 
        error: `Erro ao carregar dados: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
        local: `Localização (${lat.toFixed(4)}, ${lon.toFixed(4)})`
      }));
    }
  }, []);
  
  useEffect(() => {
    // Solicita localização automaticamente ao carregar a página
    obterLocalizacao();
  }, [obterLocalizacao]);

  // Função para determinar a cor baseada na pressão
  const getPressaoColor = (pressao: number | null): string => {
    if (!pressao) return '#666';
    if (pressao < 1000) return '#f44336'; // Vermelho - baixa
    if (pressao > 1020) return '#4caf50'; // Verde - alta
    return '#ff9800'; // Laranja - normal
  };

  // Função para obter descrição da pressão
  const getPressaoDescricao = (pressao: number | null): string => {
    if (!pressao) return 'Carregando...';
    if (pressao < 1000) return 'Baixa';
    if (pressao > 1020) return 'Alta';
    return 'Normal';
  };

  // Função para determinar qualidade para pesca
  const getQualidadePesca = (pressao: number | null): string => {
    if (!pressao) return 'Analisando...';
    if (pressao >= 1010 && pressao <= 1020) return 'Excelente';
    if (pressao >= 1005 && pressao < 1010) return 'Boa';
    if (pressao >= 1000 && pressao < 1005) return 'Regular';
    return 'Ruim';
  };

  // Função para cor da qualidade de pesca
  const getQualidadeColor = (pressao: number | null): string => {
    if (!pressao) return '#666';
    if (pressao >= 1010 && pressao <= 1020) return '#4caf50'; // Verde
    if (pressao >= 1005 && pressao < 1010) return '#8bc34a'; // Verde claro
    if (pressao >= 1000 && pressao < 1005) return '#ff9800'; // Laranja
    return '#f44336'; // Vermelho
  };

  return (
    <Box sx={{ 
      padding: isMobile ? 2 : 3,
      maxWidth: '1200px',
      margin: '0 auto',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)'
    }}>
      {/* Resto do JSX do componente */}
      <Typography variant="h4" component="h1" gutterBottom sx={{ 
        color: 'white',
        textAlign: 'center',
        fontWeight: 'bold',
        marginBottom: 3
      }}>
        Pressão Barométrica
      </Typography>
      
      {/* Resto do conteúdo do componente */}
    </Box>
  );
}