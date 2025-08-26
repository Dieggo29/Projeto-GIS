// src/app/pressao/page.tsx
'use client';

import { Box, Typography, Paper, Grid, Button, Slider, LinearProgress, Collapse, IconButton } from '@mui/material';
import { useEffect, useState } from 'react';
import InfoIcon from '@mui/icons-material/Info';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import MyLocationIcon from '@mui/icons-material/MyLocation';

export default function PressaoBarometricaPage() {
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
  // Dentro do componente, melhore a tipagem:
  const getPressaoColor = (pressao: number | null): string => {
    if (!pressao) return '#888';
    if (pressao < 1000) return '#d32f2f';
    if (pressao > 1020) return '#2e7d32';
    return '#1976d2';
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
      backgroundColor: '#f5f5f5', 
      py: 4,
      px: 2
    }}>
      <Typography 
        variant="h3" 
        component="h1" 
        gutterBottom 
        align="center" 
        sx={{ 
          fontWeight: 'bold', 
          color: '#1976d2',
          mb: 4
        }}
      >
        Pressão Barométrica
      </Typography>
      
      {/* Localização e botão de atualizar */}
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" sx={{ mr: 2 }}>
          📍 {pressaoData.local}
        </Typography>
        <IconButton 
          onClick={obterLocalizacao}
          disabled={localizacaoStatus.obtendo}
          size="small"
          sx={{ 
            backgroundColor: 'rgba(25,118,210,0.1)',
            '&:hover': { backgroundColor: 'rgba(25,118,210,0.2)' }
          }}
        >
          <MyLocationIcon />
        </IconButton>
      </Box>
      
      {/* Erro de localização */}
      {localizacaoStatus.erro && (
        <Typography variant="body2" color="error" sx={{ mb: 2, textAlign: 'center' }}>
          {localizacaoStatus.erro}
        </Typography>
      )}
      
      {/* Erro de dados */}
      {pressaoData.error && (
        <Typography variant="body2" color="error" sx={{ mb: 2, textAlign: 'center' }}>
          {pressaoData.error}
        </Typography>
      )}
      
      {pressaoData.loading ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 4 }}>
          <LinearProgress sx={{ width: '300px', mb: 2 }} />
          <Typography>Carregando dados de pressão...</Typography>
          {localizacaoStatus.obtendo && (
            <Typography variant="body2" sx={{ mt: 1, color: '#666' }}>
              Obtendo sua localização...
            </Typography>
          )}
        </Box>
      ) : (
        <Grid container spacing={3} justifyContent="center">
          <Grid item xs={12} md={8}>
            <Paper sx={{
              p: 4,
              width: '100%',
              maxWidth: '800px',
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              justifyContent: 'center', 
              backgroundColor: '#e3f2fd',
              backgroundImage: 'linear-gradient(to bottom, #bbdefb, #e3f2fd)',
              borderRadius: 2,
              boxShadow: '0 4px 20px rgba(0, 105, 192, 0.15)',
              margin: '0 auto'
            }}>
              <Typography variant="h6" gutterBottom align="center" sx={{ width: '100%' }}>Leitura Atual</Typography>
              
              {/* Escala de qualidade para pesca */}
              {pressaoData.pressao && (
                <Box sx={{ width: '100%', mt: 3 }}>
                  <Typography variant="h6" align="center" gutterBottom>
                    Qualidade para Pesca
                  </Typography>
                  
                  {/* Leitura atual centralizada com a escala */}
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 2 }}>
                    <Typography 
                      variant="h2" 
                      component="div" 
                      sx={{ 
                        color: getPressaoColor(pressaoData.pressao),
                        fontWeight: 'bold',
                        textAlign: 'center'
                      }}
                    >
                      {pressaoData.pressao} mb
                    </Typography>
                  </Box>
                  
                  {/* Valor e descrição da qualidade */}
                  <Typography 
                    variant="h5" 
                    align="center" 
                    sx={{ 
                      color: getQualidadeColor(getQualidadePesca(pressaoData.pressao).valor),
                      fontWeight: 'bold',
                      mb: 1
                    }}
                  >
                    {getQualidadePesca(pressaoData.pressao).texto}
                  </Typography>
                  
                  {/* Escala visual */}
                  <Box sx={{ px: 2, py: 1 }}>
                    <Slider
                      value={getQualidadePesca(pressaoData.pressao).valor}
                      min={0}
                      max={100}
                      step={1}
                      disabled
                      sx={{
                        '& .MuiSlider-thumb': {
                          height: 24,
                          width: 24,
                          backgroundColor: '#fff',
                          border: '2px solid currentColor',
                        },
                        '& .MuiSlider-track': {
                          height: 10,
                          borderRadius: 5,
                          backgroundColor: getQualidadeColor(getQualidadePesca(pressaoData.pressao).valor),
                        },
                        '& .MuiSlider-rail': {
                          height: 10,
                          borderRadius: 5,
                          opacity: 0.5,
                          backgroundColor: '#bfbfbf',
                        },
                        '& .MuiSlider-mark': {
                          backgroundColor: '#bfbfbf',
                          height: 8,
                          width: 2,
                          marginTop: -3,
                        },
                      }}
                      marks={[
                        { value: 0, label: 'Ruim' },
                        { value: 25, label: 'Fraca' },
                        { value: 50, label: 'Moderada' },
                        { value: 75, label: 'Boa' },
                        { value: 100, label: 'Excelente' },
                      ]}
                    />
                  </Box>
                  
                  {/* Anotações movidas para baixo da escala com botão para análise de pesca */}
                  <Box sx={{ mt: 3, p: 2, backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: 2, color: '#000' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body1" sx={{ fontWeight: 'medium', color: '#000' }}>
                        Tendência: <strong>{pressaoData.tendencia}</strong>
                      </Typography>
                      <Button
                        variant="contained"
                        color="primary"
                        size="small"
                        onClick={() => setMostrarAnalisePesca(!mostrarAnalisePesca)}
                        endIcon={mostrarAnalisePesca ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                        sx={{ 
                          backgroundColor: '#1976d2',
                          '&:hover': { backgroundColor: '#1565c0' },
                          boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                        }}
                      >
                        Análise para Pesca
                      </Button>
                    </Box>
                    <Typography variant="body2" sx={{ color: '#000', mt: 1 }}>
                      {getPressaoDescricao(pressaoData.pressao)}
                    </Typography>
                    
                    {/* Conteúdo expansível com análise para pesca */}
                    <Collapse in={mostrarAnalisePesca} timeout="auto" unmountOnExit>
                      <Box sx={{ mt: 2, p: 2, backgroundColor: 'rgba(225, 245, 254, 0.9)', borderRadius: 2 }}>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          A pressão barométrica é um indicador importante para prever condições de pesca. 
                          Mudanças na pressão podem afetar o comportamento dos peixes:
                        </Typography>
                        <Box sx={{ pl: 2 }}>
                          <ul>
                            <li>
                              <Typography variant="body2">
                                <strong>Pressão entre 1009-1015 mb:</strong> Condições ideais para pesca, estabilidade atmosférica
                              </Typography>
                            </li>
                            <li>
                              <Typography variant="body2">
                                <strong>Pressão entre 1000-1009 mb:</strong> Peixes tendem a se alimentar mais antes de mudanças climáticas
                              </Typography>
                            </li>
                            <li>
                              <Typography variant="body2">
                                <strong>Pressão abaixo de 1000 mb:</strong> Indica tempestades e condições desfavoráveis
                              </Typography>
                            </li>
                            <li>
                              <Typography variant="body2">
                                <strong>Pressão acima de 1020 mb:</strong> Muito estável, peixes podem ficar menos ativos
                              </Typography>
                            </li>
                            <li>
                              <Typography variant="body2">
                                <strong>Tendência:</strong> Mudanças na pressão são mais importantes que o valor absoluto
                              </Typography>
                            </li>
                          </ul>
                        </Box>
                      </Box>
                    </Collapse>
                  </Box>
                </Box>
              )}
            </Paper>
          </Grid>
        </Grid>
      )}
      {/* Espaço adicional no final da página para evitar que o conteúdo seja cortado */}
      <Box sx={{ height: '80px' }} />
    </Box>
  );
}