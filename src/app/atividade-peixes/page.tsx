'use client';

import { Box, Typography, LinearProgress, Card, CardContent, Grid, useTheme, useMediaQuery } from '@mui/material';
import React, { useState, useEffect, useCallback } from 'react';

interface AtividadePeixesData {
  atividade: number; // 0-100
  qualidade: string;
  fatores: {
    pressao: { valor: number; impacto: string; peso: number };
    temperatura: { valor: number; impacto: string; peso: number };
    vento: { valor: number; impacto: string; peso: number };
    clima: { condicao: string; impacto: string; peso: number };
  };
  local: string;
  loading: boolean;
  error: string | null;
}

interface DadosMultiplosDias {
  [key: string]: AtividadePeixesData; // key = 'YYYY-MM-DD'
}

export default function AtividadePeixesPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  
  const [dadosMultiplosDias, setDadosMultiplosDias] = useState<DadosMultiplosDias>({});
  const [diaSelecionado, setDiaSelecionado] = useState(0); // 0 = hoje
  const [loading, setLoading] = useState(true);
  const [local, setLocal] = useState('Carregando localização...');
  const [error, setError] = useState<string | null>(null);
  const [localizacao, setLocalizacao] = useState<{lat: number, lon: number} | null>(null);
  
  // Estado para compatibilidade com código existente
  const [dadosAtividade, setDadosAtividade] = useState<AtividadePeixesData>({
    atividade: 0,
    qualidade: 'Carregando...',
    fatores: {
      pressao: { valor: 0, impacto: 'neutro', peso: 0 },
      temperatura: { valor: 0, impacto: 'neutro', peso: 0 },
      vento: { valor: 0, impacto: 'neutro', peso: 0 },
      clima: { condicao: 'limpo', impacto: 'neutro', peso: 0 }
    },
    local: 'Carregando...',
    loading: true,
    error: null
  });

  // Sincronizar dadosAtividade com o dia selecionado
  useEffect(() => {
    const hoje = new Date();
    const diasOffset = diaSelecionado;
    const dataKey = new Date(hoje.getTime() + (diasOffset * 24 * 60 * 60 * 1000))
      .toISOString().split('T')[0];
    
    if (dadosMultiplosDias[dataKey]) {
      setDadosAtividade(dadosMultiplosDias[dataKey]);
    }
  }, [diaSelecionado, dadosMultiplosDias]);

  // Função para calcular atividade de pesca (APENAS COM DADOS REAIS)
  const calcularAtividadePesca = (dados: any) => {
    const pressao = dados.main.pressure;
    const temperatura = dados.main.temp;
    const vento = dados.wind.speed;
    const clima = dados.weather[0].main;
    
    let pontuacao = 50; // Base neutra
    
    // Pressão atmosférica (ideal: 1013-1020 mb)
    if (pressao >= 1013 && pressao <= 1020) {
      pontuacao += 15;
    } else if (pressao < 1000 || pressao > 1030) {
      pontuacao -= 15;
    }
    
    // Temperatura (ideal: 15-25°C)
    if (temperatura >= 15 && temperatura <= 25) {
      pontuacao += 10;
    } else if (temperatura < 5 || temperatura > 35) {
      pontuacao -= 10;
    }
    
    // Vento (ideal: 5-15 km/h)
    if (vento >= 1.4 && vento <= 4.2) { // 5-15 km/h em m/s
      pontuacao += 10;
    } else if (vento > 8.3) { // > 30 km/h
      pontuacao -= 15;
    }
    
    // Condições climáticas
    switch (clima) {
      case 'Clear':
        pontuacao += 15;
        break;
      case 'Clouds':
        pontuacao += 5;
        break;
      case 'Rain':
        pontuacao -= 10;
        break;
      case 'Thunderstorm':
        pontuacao -= 20;
        break;
    }
    
    return Math.max(0, Math.min(100, pontuacao));
  };

  // Função para buscar dados da API (APENAS DADOS REAIS)
  const buscarDadosAtividade = async (latitude: number, longitude: number): Promise<AtividadePeixesData> => {
    try {
      const API_KEY = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric&lang=pt_br`
      );
      
      if (!response.ok) {
        throw new Error('Erro ao buscar dados meteorológicos');
      }
      
      const dados = await response.json();
      const atividade = calcularAtividadePesca(dados);
      
      let qualidade = 'BAIXA';
      if (atividade >= 75) qualidade = 'EXCELENTE';
      else if (atividade >= 50) qualidade = 'BOA';
      else if (atividade >= 25) qualidade = 'REGULAR';
      
      const dadosCompletos: AtividadePeixesData = {
        atividade,
        qualidade,
        fatores: {
          pressao: { 
            valor: dados.main.pressure, 
            impacto: dados.main.pressure >= 1013 && dados.main.pressure <= 1020 ? 'positivo' : 'negativo',
            peso: 0.3
          },
          temperatura: { 
            valor: dados.main.temp, 
            impacto: dados.main.temp >= 15 && dados.main.temp <= 25 ? 'positivo' : 'negativo',
            peso: 0.2
          },
          vento: { 
            valor: dados.wind.speed, 
            impacto: dados.wind.speed >= 1.4 && dados.wind.speed <= 4.2 ? 'positivo' : 'negativo',
            peso: 0.2
          },
          clima: { 
            condicao: dados.weather[0].main, 
            impacto: dados.weather[0].main === 'Clear' ? 'positivo' : 'negativo',
            peso: 0.3
          }
        },
        local: `${dados.name}, ${dados.sys.country}`,
        loading: false,
        error: null
      };
      
      return dadosCompletos;
      
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
      throw error; // Propagar erro em vez de retornar dados simulados
    }
  };

  // Função para buscar dados de múltiplos dias (APENAS DADOS REAIS DA API)
  const buscarDadosMultiplosDias = async (latitude: number, longitude: number) => {
    setLoading(true);
    const novosDados: DadosMultiplosDias = {};
    
    try {
      // Buscar dados atuais (hoje)
      const dadosHoje = await buscarDadosAtividade(latitude, longitude);
      const hoje = new Date().toISOString().split('T')[0];
      novosDados[hoje] = dadosHoje;
      
      // Buscar dados de previsão (3 dias futuros) - APENAS DA API
      const API_KEY = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric&lang=pt_br`
      );
      
      if (response.ok) {
        const dados = await response.json();
        
        for (let i = 1; i <= 3; i++) {
          const data = new Date();
          data.setDate(data.getDate() + i);
          const dataKey = data.toISOString().split('T')[0];
          
          const dadosDia = dados.list.filter((item: any) => 
            item.dt_txt.startsWith(dataKey)
          );
          
          if (dadosDia.length > 0) {
            const dadosEscolhidos = dadosDia.find((item: any) => 
              item.dt_txt.includes('12:00:00')
            ) || dadosDia[0];
            
            const atividade = calcularAtividadePesca(dadosEscolhidos);
            
            let qualidade = 'BAIXA';
            if (atividade >= 75) qualidade = 'EXCELENTE';
            else if (atividade >= 50) qualidade = 'BOA';
            else if (atividade >= 25) qualidade = 'REGULAR';
            
            novosDados[dataKey] = {
              atividade,
              qualidade,
              fatores: {
                pressao: { 
                  valor: dadosEscolhidos.main.pressure, 
                  impacto: dadosEscolhidos.main.pressure >= 1013 && dadosEscolhidos.main.pressure <= 1020 ? 'positivo' : 'negativo',
                  peso: 0.3
                },
                temperatura: { 
                  valor: dadosEscolhidos.main.temp, 
                  impacto: dadosEscolhidos.main.temp >= 15 && dadosEscolhidos.main.temp <= 25 ? 'positivo' : 'negativo',
                  peso: 0.2
                },
                vento: { 
                  valor: dadosEscolhidos.wind.speed, 
                  impacto: dadosEscolhidos.wind.speed >= 1.4 && dadosEscolhidos.wind.speed <= 4.2 ? 'positivo' : 'negativo',
                  peso: 0.2
                },
                clima: { 
                  condicao: dadosEscolhidos.weather[0].main, 
                  impacto: dadosEscolhidos.weather[0].main === 'Clear' ? 'positivo' : 'negativo',
                  peso: 0.3
                }
              },
              local: `${dados.city.name}, ${dados.city.country}`,
              loading: false,
              error: null
            };
          }
        }
      }
      
      setDadosMultiplosDias(novosDados);
      
      // Definir dados do dia atual
      if (novosDados[hoje]) {
        setDadosAtividade(novosDados[hoje]);
        setLocal(novosDados[hoje].local);
      }
      
    } catch (error) {
      console.error('Erro ao buscar dados de múltiplos dias:', error);
      setError('Erro ao carregar dados meteorológicos');
    } finally {
      setLoading(false);
    }
  };

  // Função para obter localização
  const buscarDadosClima = async (lat: number, lon: number): Promise<WeatherData | null> => {
    setLoading(true);
    const novosDados: DadosMultiplosDias = {};
    
    try {
      // Buscar dados atuais (hoje)
      const dadosHoje = await buscarDadosAtividade(latitude, longitude);
      const hoje = new Date().toISOString().split('T')[0];
      novosDados[hoje] = dadosHoje;
      
      // Buscar dados de previsão (3 dias futuros) - APENAS DA API
      const API_KEY = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric&lang=pt_br`
      );
      
      if (response.ok) {
        const dados = await response.json();
        
        for (let i = 1; i <= 3; i++) {
          const data = new Date();
          data.setDate(data.getDate() + i);
          const dataKey = data.toISOString().split('T')[0];
          
          const dadosDia = dados.list.filter((item: any) => 
            item.dt_txt.startsWith(dataKey)
          );
          
          if (dadosDia.length > 0) {
            const dadosEscolhidos = dadosDia.find((item: any) => 
              item.dt_txt.includes('12:00:00')
            ) || dadosDia[0];
            
            const atividade = calcularAtividadePesca(dadosEscolhidos);
            
            let qualidade = 'BAIXA';
            if (atividade >= 75) qualidade = 'EXCELENTE';
            else if (atividade >= 50) qualidade = 'BOA';
            else if (atividade >= 25) qualidade = 'REGULAR';
            
            novosDados[dataKey] = {
              atividade,
              qualidade,
              fatores: {
                pressao: { 
                  valor: dadosEscolhidos.main.pressure, 
                  impacto: dadosEscolhidos.main.pressure >= 1013 && dadosEscolhidos.main.pressure <= 1020 ? 'positivo' : 'negativo',
                  peso: 0.3
                },
                temperatura: { 
                  valor: dadosEscolhidos.main.temp, 
                  impacto: dadosEscolhidos.main.temp >= 15 && dadosEscolhidos.main.temp <= 25 ? 'positivo' : 'negativo',
                  peso: 0.2
                },
                vento: { 
                  valor: dadosEscolhidos.wind.speed, 
                  impacto: dadosEscolhidos.wind.speed >= 1.4 && dadosEscolhidos.wind.speed <= 4.2 ? 'positivo' : 'negativo',
                  peso: 0.2
                },
                clima: { 
                  condicao: dadosEscolhidos.weather[0].main, 
                  impacto: dadosEscolhidos.weather[0].main === 'Clear' ? 'positivo' : 'negativo',
                  peso: 0.3
                }
              },
              local: `${dados.city.name}, ${dados.city.country}`,
              loading: false,
              error: null
            };
          }
        }
      }
      
      setDadosMultiplosDias(novosDados);
      
      // Definir dados do dia atual
      if (novosDados[hoje]) {
        setDadosAtividade(novosDados[hoje]);
        setLocal(novosDados[hoje].local);
      }
      
    } catch (error) {
      console.error('Erro ao buscar dados de múltiplos dias:', error);
      setError('Erro ao carregar dados meteorológicos');
    } finally {
      setLoading(false);
    }
  };

  // Função para obter localização
  const obterLocalizacao = useCallback(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;
          setLocalizacao({ lat, lon });
          buscarDadosMultiplosDias(lat, lon, 7);
        },
        (error) => {
          console.error('Erro ao obter localização:', error);
          setErro('Não foi possível obter sua localização');
        }
      );
    } else {
      setErro('Geolocalização não é suportada neste navegador');
    }
  }, [buscarDadosMultiplosDias]);

  useEffect(() => {
    obterLocalizacao();
  }, [obterLocalizacao]);

  // Função para formatar condição climática
  const formatarCondicaoClimatica = (condicao: string) => {
    const condicoes: { [key: string]: string } = {
      'Clear': '☀️ Céu Limpo',
      'Clouds': '☁️ Nublado',
      'Rain': '🌧️ Chuva',
      'Thunderstorm': '⛈️ Tempestade',
      'Snow': '❄️ Neve',
      'Mist': '🌫️ Neblina',
      'Fog': '🌫️ Névoa'
    };
    return condicoes[condicao] || `🌤️ ${condicao}`;
  };

  // Função para obter cor do impacto
  const obterCorImpacto = (impacto: string): string => {
    switch (impacto) {
      case 'positivo': return '#4caf50';
      case 'negativo': return '#f44336';
      case 'neutro': return '#ff9800';
      default: return '#9e9e9e';
    }
  };

  // Calendário (APENAS DIAS COM DADOS REAIS)
  const diasCalendario = [];
  const hoje = new Date();
  
  // Adicionar apenas hoje e dias futuros com dados reais
  for (let i = 0; i <= 3; i++) {
    const data = new Date(hoje.getTime() + (i * 24 * 60 * 60 * 1000));
    const dataKey = data.toISOString().split('T')[0];
    const dadosDia = dadosMultiplosDias[dataKey];
    
    // Só adicionar se tiver dados reais
    if (dadosDia) {
      diasCalendario.push({
        data: data.getDate(),
        mes: data.toLocaleDateString('pt-BR', { month: 'short' }),
        diaSemana: data.toLocaleDateString('pt-BR', { weekday: 'short' }),
        isHoje: i === 0,
        atividade: dadosDia.atividade,
        qualidade: dadosDia.qualidade,
        loading: false,
        index: i
      });
    }
  }

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
          Atividade de peixes
        </Typography>
      </Box>

      {/* Calendário (APENAS DIAS COM DADOS REAIS) */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        mb: { xs: 2, sm: 3 },
        overflowX: 'auto',
        px: { xs: 1, sm: 0 }
      }}>
        <Box sx={{ 
          display: 'flex', 
          gap: { xs: 0.5, sm: 1 },
          minWidth: 'fit-content'
        }}>
          {diasCalendario.map((item, index) => (
            <Box
              key={index}
              onClick={() => setDiaSelecionado(item.index)}
              sx={{
                textAlign: 'center',
                p: { xs: 1, sm: 1.5 },
                minWidth: { xs: 50, sm: 60 },
                height: { xs: 70, sm: 80 },
                borderRadius: { xs: 1, sm: 2 },
                cursor: 'pointer',
                backgroundColor: diaSelecionado === item.index ? 'rgba(255, 255, 255, 0.9)' : 'rgba(255, 255, 255, 0.1)',
                border: 'none',
                boxShadow: diaSelecionado === item.index ? '0 4px 12px rgba(0, 0, 0, 0.3)' : 'none',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                transition: 'all 0.3s ease',
                '&:hover': {
                  backgroundColor: diaSelecionado === item.index ? 'rgba(255, 255, 255, 0.9)' : 'rgba(255, 255, 255, 0.2)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 6px 16px rgba(0, 0, 0, 0.2)'
                }
              }}
            >
              <Typography 
                variant={isMobile ? "body1" : "h6"} 
                sx={{ 
                  color: diaSelecionado === item.index ? '#1e3c72' : 'white', 
                  fontWeight: 'bold',
                  lineHeight: 1,
                  fontSize: { xs: '1rem', sm: '1.25rem' }
                }}
              >
                {item.data}
              </Typography>
              <Typography 
                variant="caption" 
                sx={{ 
                  color: diaSelecionado === item.index ? '#1e3c72' : 'rgba(255, 255, 255, 0.8)', 
                  fontSize: { xs: '0.625rem', sm: '0.75rem' },
                  textTransform: 'uppercase',
                  fontWeight: 'bold',
                  lineHeight: 1,
                  mt: 0.5
                }}
              >
                {item.diaSemana}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>

      {/* Localização */}
      <Typography 
        variant={isMobile ? "caption" : "body2"} 
        align="center" 
        sx={{ 
          color: 'rgba(255, 255, 255, 0.8)', 
          mb: { xs: 2, sm: 3 },
          fontSize: { xs: '0.75rem', sm: '0.875rem' }
        }}
      >
        📍 {dadosAtividade.local}
      </Typography>

      {dadosAtividade.loading || loading ? (
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
            Analisando condições para pesca...
          </Typography>
        </Box>
      ) : error ? (
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          mt: { xs: 2, sm: 4 },
          px: { xs: 2, sm: 0 }
        }}>
          <Typography sx={{ 
            color: '#ff6b6b', 
            textAlign: 'center',
            fontSize: { xs: '0.875rem', sm: '1rem' }
          }}>
            {error}
          </Typography>
        </Box>
      ) : (
        <>
          {/* Nota circular */}
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            mb: { xs: 3, sm: 4 }
          }}>
            <Box sx={{ position: 'relative', display: 'inline-flex' }}>
              <Box
                sx={{
                  width: { xs: 150, sm: 180, md: 200 },
                  height: { xs: 150, sm: 180, md: 200 },
                  borderRadius: '50%',
                  background: `conic-gradient(#4caf50 0deg ${(dadosAtividade.atividade / 100) * 360}deg, rgba(255, 255, 255, 0.2) ${(dadosAtividade.atividade / 100) * 360}deg 360deg)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative'
                }}
              >
                <Box
                  sx={{
                    width: { xs: 120, sm: 140, md: 160 },
                    height: { xs: 120, sm: 140, md: 160 },
                    borderRadius: '50%',
                    backgroundColor: 'rgba(30, 60, 114, 0.9)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Typography 
                    variant={isMobile ? "h3" : isTablet ? "h2" : "h2"} 
                    sx={{ 
                      color: 'white', 
                      fontWeight: 'bold', 
                      lineHeight: 1,
                      fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' }
                    }}
                  >
                    {dadosAtividade.atividade}
                  </Typography>
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      color: 'rgba(255, 255, 255, 0.8)',
                      fontSize: { xs: '0.75rem', sm: '0.875rem' }
                    }}
                  >
                    ★★
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>

          {/* Qualidade */}
          <Typography 
            variant={isMobile ? "body1" : "h6"} 
            align="center" 
            sx={{ 
              color: 'white', 
              mb: { xs: 3, sm: 4 }, 
              fontWeight: 'bold',
              fontSize: { xs: '1.125rem', sm: '1.25rem' }
            }}
          >
            {dadosAtividade.qualidade}
          </Typography>

          {/* Métricas Meteorológicas */}
          <Box sx={{ 
            maxWidth: { xs: '100%', sm: 600 }, 
            mx: 'auto', 
            mb: { xs: 3, sm: 4 },
            px: { xs: 1, sm: 0 }
          }}>
            <Typography 
              variant={isMobile ? "body1" : "h6"} 
              align="center" 
              sx={{ 
                color: 'white', 
                mb: { xs: 2, sm: 3 }, 
                fontWeight: 'bold',
                fontSize: { xs: '1rem', sm: '1.25rem' }
              }}
            >
              📊 Métricas do Cálculo
            </Typography>
            
            <Grid container spacing={{ xs: 1, sm: 2 }}>
              {/* Pressão Barométrica */}
              <Grid item xs={6}>
                <Card sx={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.1)', 
                  backdropFilter: 'blur(10px)',
                  border: `2px solid ${obterCorImpacto(dadosAtividade.fatores.pressao.impacto)}`,
                  borderRadius: { xs: 1, sm: 2 },
                  height: '100%'
                }}>
                  <CardContent sx={{ 
                    p: { xs: 1, sm: 2 }, 
                    '&:last-child': { pb: { xs: 1, sm: 2 } },
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column'
                  }}>
                    <Typography 
                      variant={isMobile ? "caption" : "body2"} 
                      sx={{ 
                        color: 'rgba(255, 255, 255, 0.8)', 
                        mb: 1,
                        fontSize: { xs: '0.625rem', sm: '0.875rem' }
                      }}
                    >
                      🌡️ Pressão Barométrica
                    </Typography>
                    <Typography 
                      variant={isMobile ? "body1" : "h6"} 
                      sx={{ 
                        color: 'white', 
                        fontWeight: 'bold',
                        fontSize: { xs: '0.875rem', sm: '1.25rem' }
                      }}
                    >
                      {dadosAtividade.fatores.pressao.valor.toFixed(0)} mb
                    </Typography>
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        color: obterCorImpacto(dadosAtividade.fatores.pressao.impacto),
                        fontWeight: 'bold',
                        textTransform: 'uppercase',
                        fontSize: { xs: '0.625rem', sm: '0.75rem' }
                      }}
                    >
                      {dadosAtividade.fatores.pressao.impacto}
                    </Typography>
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        color: 'rgba(255, 255, 255, 0.6)', 
                        display: 'block',
                        fontSize: { xs: '0.5rem', sm: '0.75rem' },
                        mt: 'auto'
                      }}
                    >
                      Ideal: 1013-1020 mb
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              {/* Temperatura */}
              <Grid item xs={6}>
                <Card sx={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.1)', 
                  backdropFilter: 'blur(10px)',
                  border: `2px solid ${obterCorImpacto(dadosAtividade.fatores.temperatura.impacto)}`,
                  borderRadius: { xs: 1, sm: 2 },
                  height: '100%'
                }}>
                  <CardContent sx={{ 
                    p: { xs: 1, sm: 2 }, 
                    '&:last-child': { pb: { xs: 1, sm: 2 } },
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column'
                  }}>
                    <Typography 
                      variant={isMobile ? "caption" : "body2"} 
                      sx={{ 
                        color: 'rgba(255, 255, 255, 0.8)', 
                        mb: 1,
                        fontSize: { xs: '0.625rem', sm: '0.875rem' }
                      }}
                    >
                      🌡️ Temperatura
                    </Typography>
                    <Typography 
                      variant={isMobile ? "body1" : "h6"} 
                      sx={{ 
                        color: 'white', 
                        fontWeight: 'bold',
                        fontSize: { xs: '0.875rem', sm: '1.25rem' }
                      }}
                    >
                      {dadosAtividade.fatores.temperatura.valor.toFixed(1)}°C
                    </Typography>
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        color: obterCorImpacto(dadosAtividade.fatores.temperatura.impacto),
                        fontWeight: 'bold',
                        textTransform: 'uppercase',
                        fontSize: { xs: '0.625rem', sm: '0.75rem' }
                      }}
                    >
                      {dadosAtividade.fatores.temperatura.impacto}
                    </Typography>
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        color: 'rgba(255, 255, 255, 0.6)', 
                        display: 'block',
                        fontSize: { xs: '0.5rem', sm: '0.75rem' },
                        mt: 'auto'
                      }}
                    >
                      Ideal: 15-25°C
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              {/* Vento */}
              <Grid item xs={6}>
                <Card sx={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.1)', 
                  backdropFilter: 'blur(10px)',
                  border: `2px solid ${obterCorImpacto(dadosAtividade.fatores.vento.impacto)}`,
                  borderRadius: { xs: 1, sm: 2 },
                  height: '100%'
                }}>
                  <CardContent sx={{ 
                    p: { xs: 1, sm: 2 }, 
                    '&:last-child': { pb: { xs: 1, sm: 2 } },
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column'
                  }}>
                    <Typography 
                      variant={isMobile ? "caption" : "body2"} 
                      sx={{ 
                        color: 'rgba(255, 255, 255, 0.8)', 
                        mb: 1,
                        fontSize: { xs: '0.625rem', sm: '0.875rem' }
                      }}
                    >
                      💨 Velocidade do Vento
                    </Typography>
                    <Typography 
                      variant={isMobile ? "body1" : "h6"} 
                      sx={{ 
                        color: 'white', 
                        fontWeight: 'bold',
                        fontSize: { xs: '0.875rem', sm: '1.25rem' }
                      }}
                    >
                      {(dadosAtividade.fatores.vento.valor * 3.6).toFixed(1)} km/h
                    </Typography>
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        color: obterCorImpacto(dadosAtividade.fatores.vento.impacto),
                        fontWeight: 'bold',
                        textTransform: 'uppercase',
                        fontSize: { xs: '0.625rem', sm: '0.75rem' }
                      }}
                    >
                      {dadosAtividade.fatores.vento.impacto}
                    </Typography>
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        color: 'rgba(255, 255, 255, 0.6)', 
                        display: 'block',
                        fontSize: { xs: '0.5rem', sm: '0.75rem' },
                        mt: 'auto'
                      }}
                    >
                      Ideal: 5-15 km/h
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              {/* Condições Climáticas */}
              <Grid item xs={6}>
                <Card sx={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.1)', 
                  backdropFilter: 'blur(10px)',
                  border: `2px solid ${obterCorImpacto(dadosAtividade.fatores.clima.impacto)}`,
                  borderRadius: { xs: 1, sm: 2 },
                  height: '100%'
                }}>
                  <CardContent sx={{ 
                    p: { xs: 1, sm: 2 }, 
                    '&:last-child': { pb: { xs: 1, sm: 2 } },
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column'
                  }}>
                    <Typography 
                      variant={isMobile ? "caption" : "body2"} 
                      sx={{ 
                        color: 'rgba(255, 255, 255, 0.8)', 
                        mb: 1,
                        fontSize: { xs: '0.625rem', sm: '0.875rem' }
                      }}
                    >
                      🌤️ Condições Climáticas
                    </Typography>
                    <Typography 
                      variant={isMobile ? "caption" : "h6"} 
                      sx={{ 
                        color: 'white', 
                        fontWeight: 'bold', 
                        fontSize: { xs: '0.75rem', sm: '1rem' }
                      }}
                    >
                      {formatarCondicaoClimatica(dadosAtividade.fatores.clima.condicao)}
                    </Typography>
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        color: obterCorImpacto(dadosAtividade.fatores.clima.impacto),
                        fontWeight: 'bold',
                        textTransform: 'uppercase',
                        fontSize: { xs: '0.625rem', sm: '0.75rem' }
                      }}
                    >
                      {dadosAtividade.fatores.clima.impacto}
                    </Typography>
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        color: 'rgba(255, 255, 255, 0.6)', 
                        display: 'block',
                        fontSize: { xs: '0.5rem', sm: '0.75rem' },
                        mt: 'auto'
                      }}
                    >
                      Ideal: Céu Limpo
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* Explicação do Cálculo */}
            <Box sx={{ 
              mt: { xs: 2, sm: 3 }, 
              p: { xs: 1.5, sm: 2 }, 
              backgroundColor: 'rgba(255, 255, 255, 0.05)', 
              borderRadius: { xs: 1, sm: 2 } 
            }}>
              <Typography 
                variant={isMobile ? "caption" : "body2"} 
                sx={{ 
                  color: 'rgba(255, 255, 255, 0.8)', 
                  textAlign: 'center', 
                  mb: 1,
                  fontSize: { xs: '0.75rem', sm: '0.875rem' }
                }}
              >
                💡 Como é calculado?
              </Typography>
              <Typography 
                variant="caption" 
                sx={{ 
                  color: 'rgba(255, 255, 255, 0.6)', 
                  textAlign: 'center', 
                  display: 'block',
                  fontSize: { xs: '0.625rem', sm: '0.75rem' }
                }}
              >
                A nota de atividade é calculada com base nas condições meteorológicas ideais para pesca:
                Pressão (30%), Clima (30%), Temperatura (20%) e Vento (20%)
              </Typography>
            </Box>
          </Box>
        </>
      )}
    </Box>
  );
}