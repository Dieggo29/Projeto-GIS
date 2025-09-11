// src/app/pressao/page.tsx
'use client';

import { Box, Typography, Paper, Grid, Button, Slider, LinearProgress, Collapse, IconButton, useTheme, useMediaQuery } from '@mui/material';
import { useEffect, useState } from 'react';
import InfoIcon from '@mui/icons-material/Info';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
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
  
  // Estado para controlar a exibição da análise para pesca
  const [mostrarAnalisePesca, setMostrarAnalisePesca] = useState(false);

  // Função para obter a localização do usuário
  const obterLocalizacao = () => {
    setLocalizacaoStatus({
      solicitada: true,
      obtendo: true,
      erro: null
    });
    
    if (!navigator.geolocation) {
      setLocalizacaoStatus({
        solicitada: true,
        obtendo: false,
        erro: 'Geolocalização não é suportada pelo seu navegador.'
      });
      return;
    }
    
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
        setLocalizacaoStatus({
          solicitada: true,
          obtendo: false,
          erro: `Erro ao obter localização: ${error.message}`
        });
        // Em caso de erro, usar localização padrão (Curitiba)
        const latitudePadrao = -25.428;
        const longitudePadrao = -49.273;
        buscarDadosPressao(latitudePadrao, longitudePadrao);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    );
  };
  
  // Adicione esta função DENTRO do componente, antes da função buscarDadosPressao
  const determinarTendencia = (pressao: number): string => {
    if (pressao < 1000) return 'descendo';
    if (pressao > 1020) return 'subindo';
    return 'estável';
  };
  
  // Função para buscar dados de pressão barométrica com base na localização
  const buscarDadosPressao = async (latitude: number, longitude: number) => {
    setPressaoData(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const API_KEY = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;
      
      if (!API_KEY) {
        throw new Error('Chave da API não configurada');
      }
      
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric&lang=pt_br`
      );
      
      if (!response.ok) {
        throw new Error(`Erro na API: ${response.status}`);
      }
      
      const data = await response.json();
      
      setPressaoData({
        pressao: data.main.pressure,
        tendencia: determinarTendencia(data.main.pressure), // Agora funcionará
        local: `${data.name}, ${data.sys.country}`,
        loading: false,
        error: null,
        latitude,
        longitude
      });
    } catch (error) {
      console.error('Erro ao buscar dados de pressão:', error);
      setPressaoData(prev => ({ 
        ...prev, 
        loading: false, 
        error: `Erro ao carregar dados: ${error.message}`,
        local: `Localização (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`
      }));
    }
  };
  
  useEffect(() => {
    // Solicita localização automaticamente ao carregar a página
    obterLocalizacao();
  }, []);

  // Função para determinar a cor baseada na pressão
  const getPressaoColor = (pressao: number | null): string => {
    if (!pressao) return 'rgba(255, 255, 255, 0.5)';
    if (pressao < 1000) return '#ff6b6b';
    if (pressao > 1020) return '#4caf50';
    return '#64b5f6';
  };
  
  const getPressaoDescricao = (pressao: number | null): string => {
    if (!pressao) return 'Desconhecida';
    if (pressao < 1000) return 'Baixa - Possibilidade de chuva ou tempestade';
    if (pressao > 1020) return 'Alta - Geralmente indica tempo estável e seco';
    return 'Normal - Condições atmosféricas estáveis';
  };
  
  const getQualidadePesca = (pressao: number | null): { texto: string; valor: number } => {
    if (!pressao) return { texto: 'Desconhecida', valor: 50 };
    
    if (pressao < 1000) {
      return { texto: 'Ruim', valor: 20 };
    } else if (pressao >= 1000 && pressao < 1009) {
      return { texto: 'Boa', valor: 75 };
    } else if (pressao >= 1009 && pressao <= 1015) {
      return { texto: 'Excelente', valor: 100 };
    } else if (pressao > 1015 && pressao <= 1022) {
      return { texto: 'Boa', valor: 80 };
    } else {
      return { texto: 'Moderada', valor: 60 };
    }
  };
  
  // Função para obter cor baseada na qualidade
  const getQualidadeColor = (valor: number): string => {
    if (valor >= 90) return '#4caf50'; // Verde - Excelente
    if (valor >= 70) return '#8bc34a'; // Verde claro - Boa
    if (valor >= 50) return '#ff9800'; // Laranja - Moderada
    if (valor >= 30) return '#ff5722'; // Laranja escuro - Fraca
    return '#f44336'; // Vermelho - Ruim
  };

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
      py: { xs: 1, sm: 2, md: 3 },
      px: { xs: 1, sm: 2, md: 3 },
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Título */}
      <Box sx={{ textAlign: 'center', mb: { xs: 2, sm: 3 } }}>
        <Typography 
          variant={isMobile ? "h6" : isTablet ? "h5" : "h4"} 
          sx={{ 
            color: 'white', 
            fontWeight: 'bold',
            fontSize: { xs: '1.25rem', sm: '1.5rem', md: '2rem' }
          }}
        >
          Pressão Barométrica
        </Typography>
      </Box>
      
      {/* Localização e botão de atualizar */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        mb: { xs: 1, sm: 2 },
        flexDirection: { xs: 'column', sm: 'row' },
        gap: { xs: 1, sm: 0 }
      }}>
        <Typography 
          variant={isMobile ? "caption" : "body2"} 
          sx={{ 
            mr: { sm: 2 }, 
            color: 'rgba(255, 255, 255, 0.8)',
            fontSize: { xs: '0.75rem', sm: '0.875rem' },
            textAlign: 'center'
          }}
        >
          📍 {pressaoData.local}
        </Typography>
        <IconButton 
          onClick={obterLocalizacao}
          disabled={localizacaoStatus.obtendo}
          size={isMobile ? "small" : "medium"}
          sx={{ 
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            color: 'white',
            '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.2)' },
            '&:disabled': { color: 'rgba(255, 255, 255, 0.5)' }
          }}
        >
          <MyLocationIcon fontSize={isMobile ? "small" : "medium"} />
        </IconButton>
      </Box>
      
      {/* Erro de localização */}
      {localizacaoStatus.erro && (
        <Typography 
          variant={isMobile ? "caption" : "body2"} 
          sx={{ 
            mb: 2, 
            textAlign: 'center', 
            color: '#ff6b6b',
            px: { xs: 2, sm: 0 },
            fontSize: { xs: '0.75rem', sm: '0.875rem' }
          }}
        >
          {localizacaoStatus.erro}
        </Typography>
      )}
      
      {/* Erro de dados */}
      {pressaoData.error && (
        <Typography 
          variant={isMobile ? "caption" : "body2"} 
          sx={{ 
            mb: 2, 
            textAlign: 'center', 
            color: '#ff6b6b',
            px: { xs: 2, sm: 0 },
            fontSize: { xs: '0.75rem', sm: '0.875rem' }
          }}
        >
          {pressaoData.error}
        </Typography>
      )}
      
      {pressaoData.loading ? (
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          mt: { xs: 2, sm: 4 },
          px: { xs: 2, sm: 0 }
        }}>
          <LinearProgress sx={{ 
            width: { xs: '100%', sm: '300px' }, 
            mb: 2 
          }} />
          <Typography sx={{ 
            color: 'white',
            fontSize: { xs: '0.875rem', sm: '1rem' },
            textAlign: 'center'
          }}>
            Carregando dados de pressão...
          </Typography>
          {localizacaoStatus.obtendo && (
            <Typography 
              variant={isMobile ? "caption" : "body2"} 
              sx={{ 
                mt: 1, 
                color: 'rgba(255, 255, 255, 0.6)',
                fontSize: { xs: '0.75rem', sm: '0.875rem' },
                textAlign: 'center'
              }}
            >
              Obtendo sua localização...
            </Typography>
          )}
        </Box>
      ) : (
        <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <Paper sx={{
            p: { xs: 2, sm: 3, md: 4 },
            width: '100%',
            maxWidth: { xs: '100%', sm: '600px', md: '800px' },
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center', 
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: { xs: 1, sm: 2 },
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
            margin: '0 auto'
          }}>
            <Typography 
              variant={isMobile ? "body1" : "h6"} 
              gutterBottom 
              align="center" 
              sx={{ 
                width: '100%', 
                color: 'white', 
                mb: { xs: 2, sm: 3 },
                fontSize: { xs: '1rem', sm: '1.25rem' }
              }}
            >
              Pressão Barométrica Atual
            </Typography>
            
            {/* Leitura atual da pressão */}
            {pressaoData.pressao && (
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                mb: { xs: 2, sm: 3 }
              }}>
                <Typography 
                  variant={isMobile ? "h3" : "h2"} 
                  component="div" 
                  sx={{ 
                    color: 'white',
                    fontWeight: 'bold',
                    textAlign: 'center',
                    fontSize: { xs: '2.5rem', sm: '3rem', md: '4rem' }
                  }}
                >
                  {pressaoData.pressao} mb
                </Typography>
              </Box>
            )}
          </Paper>
        </Box>
      )}
      {/* Espaço adicional no final da página para evitar que o conteúdo seja cortado */}
      <Box sx={{ height: '80px' }} />
    </Box>
  );
}