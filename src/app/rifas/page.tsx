'use client';

import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  Button
} from '@mui/material';
import {
  ShoppingCart,
  LocalOffer,
  CheckCircle,
  Cancel,
  WhatsApp
} from '@mui/icons-material';
import { useSidebar } from '@/context/SidebarContext';
import dynamic from 'next/dynamic';

// Importar o componente NoSSR
const NoSSRPaper = dynamic(() => import('@/components/NoSSRPaper'), { ssr: false });

interface RifaNumber {
  number: number;
  isAvailable: boolean;
  buyerName?: string;
  buyerPhone?: string;
  purchaseDate?: Date;
}

interface CartItem {
  number: number;
}

export default function RifasPage() {
  const { isSidebarOpen } = useSidebar();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  
  // Add hydration state
  const [isHydrated, setIsHydrated] = useState(false);

  // Estados
  const [rifaNumbers, setRifaNumbers] = useState<RifaNumber[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [buyerName, setBuyerName] = useState('');
  const [buyerPhone, setBuyerPhone] = useState('');
  const [alert, setAlert] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);
  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([]);

  // Inicializar números da rifa
  useEffect(() => {
    const savedData = localStorage.getItem('rifaNumbers');
    let needsReset = false;
    
    if (savedData) {
      const parsedData = JSON.parse(savedData);
      // Verificar se ainda tem o número 0 ou se não tem exatamente 100 números
      const hasZero = parsedData.some((item: RifaNumber) => item.number === 0);
      const hasCorrectCount = parsedData.length === 100;
      const hasCorrectRange = parsedData.every((item: RifaNumber) => item.number >= 1 && item.number <= 100);
      
      if (hasZero || !hasCorrectCount || !hasCorrectRange) {
        needsReset = true;
      } else {
        setRifaNumbers(parsedData);
      }
    } else {
      needsReset = true;
    }
    
    if (needsReset) {
      const initialNumbers: RifaNumber[] = [];
      for (let i = 1; i <= 100; i++) {
        initialNumbers.push({
          number: i,
          isAvailable: true
        });
      }
      setRifaNumbers(initialNumbers);
      localStorage.setItem('rifaNumbers', JSON.stringify(initialNumbers));
    }
  }, []);

  // Salvar no localStorage sempre que houver mudanças
  useEffect(() => {
    if (rifaNumbers.length > 0) {
      localStorage.setItem('rifaNumbers', JSON.stringify(rifaNumbers));
    }
  }, [rifaNumbers]);

  // Funções
  const handleNumberClick = (number: number) => {
    const rifaNumber = rifaNumbers.find(r => r.number === number);
    if (!rifaNumber?.isAvailable) return;

    if (selectedNumbers.includes(number)) {
      setSelectedNumbers(prev => prev.filter(n => n !== number));
      setCart(prev => prev.filter(item => item.number !== number));
    } else {
      setSelectedNumbers(prev => [...prev, number]);
      setCart(prev => [...prev, { number }]);
    }
  };

  const handlePurchase = () => {
    if (cart.length === 0) {
      setAlert({ type: 'error', message: 'Selecione pelo menos um número!' });
      return;
    }
    setOpenDialog(true);
  };

  const confirmPurchase = () => {
    if (!buyerName.trim() || !buyerPhone.trim()) {
      setAlert({ type: 'error', message: 'Preencha todos os campos!' });
      return;
    }

    // Atualizar números como vendidos
    const updatedNumbers = rifaNumbers.map(rifa => {
      if (cart.some(item => item.number === rifa.number)) {
        return {
          ...rifa,
          isAvailable: false,
          buyerName: buyerName.trim(),
          buyerPhone: buyerPhone.trim(),
          purchaseDate: new Date()
        };
      }
      return rifa;
    });

    setRifaNumbers(updatedNumbers);
    
    // Enviar mensagem pelo WhatsApp
    const numbersText = cart.map(item => item.number).sort((a, b) => a - b).join(', ');
    const message = `Olá! Gostaria de comprar os números da rifa: ${numbersText}\n\nNome: ${buyerName}\nTelefone: ${buyerPhone}`;
    const whatsappUrl = `https://wa.me/5541999999999?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');

    // Limpar estados
    setCart([]);
    setSelectedNumbers([]);
    setBuyerName('');
    setBuyerPhone('');
    setOpenDialog(false);
    setAlert({ type: 'success', message: `Números ${numbersText} reservados com sucesso! Você será redirecionado para o WhatsApp.` });
  };

  const clearCart = () => {
    setCart([]);
    setSelectedNumbers([]);
  };

  const getNumberColor = (rifa: RifaNumber) => {
    if (!rifa.isAvailable) return '#ef4444'; // Vermelho para vendido
    if (selectedNumbers.includes(rifa.number)) return '#3b82f6'; // Azul para selecionado
    return '#10b981'; // Verde para disponível
  };

  const availableCount = rifaNumbers.filter(r => r.isAvailable).length;
  const soldCount = rifaNumbers.filter(r => !r.isAvailable).length;

  return (
    <Box sx={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
      py: { xs: 2, sm: 3, md: 4 },
      px: { xs: 1, sm: 2, md: 3 }
    }}>
      {/* Header */}
      <Container maxWidth="lg">
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography
            variant={isMobile ? "h4" : "h3"}
            sx={{
              color: 'white',
              fontWeight: 'bold',
              mb: 2,
              textShadow: '2px 2px 8px rgba(0,0,0,0.8)'
            }}
          >
            RIFAS DA LOJA BOQUEIRÃO DA PESCA🍀🍀🍀
          </Typography>
          <Typography
            variant="subtitle1"
            sx={{
              color: 'rgba(255, 255, 255, 0.7)',
              mb: 3
            }}
          >
            Escolha seus números da sorte de 1 a 100!
          </Typography>

          {/* Estatísticas */}
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 3, flexWrap: 'wrap' }}>
            <Chip
              icon={<CheckCircle />}
              label={`Disponíveis: ${availableCount}`}
              sx={{
                backgroundColor: 'rgba(16, 185, 129, 0.2)',
                color: '#10b981',
                border: '1px solid rgba(16, 185, 129, 0.4)'
              }}
            />
            <Chip
              icon={<Cancel />}
              label={`Vendidos: ${soldCount}`}
              sx={{
                backgroundColor: 'rgba(239, 68, 68, 0.2)',
                color: '#ef4444',
                border: '1px solid rgba(239, 68, 68, 0.4)'
              }}
            />
            <Chip
              icon={<LocalOffer />}
              label={`Selecionados: ${selectedNumbers.length}`}
              sx={{
                backgroundColor: 'rgba(59, 130, 246, 0.2)',
                color: '#3b82f6',
                border: '1px solid rgba(59, 130, 246, 0.4)'
              }}
            />
          </Box>
        </Box>

        {/* Alert */}
        {alert && (
          <Alert
            severity={alert.type}
            onClose={() => setAlert(null)}
            sx={{ mb: 3 }}
          >
            {alert.message}
          </Alert>
        )}

        {/* Grid de Números - Usando NoSSR */}
        <NoSSRPaper
          elevation={8}
          sx={{
            p: { xs: 2, sm: 3, md: 4 },
            backgroundColor: 'rgba(15, 23, 42, 0.95)',
            backdropFilter: 'blur(20px)',
            borderRadius: 4,
            border: '1px solid rgba(255, 255, 255, 0.1)',
            mb: 4
          }}
        >
          <Grid container spacing={1}>
            {rifaNumbers.map((rifa) => (
              <Grid item xs={1.2} sm={1.2} md={1.2} lg={1.2} key={rifa.number}>
                <CustomTooltip
                  title={
                    !rifa.isAvailable && rifa.buyerName ? (
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                          🎯 Número Vendido
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 0.5 }}>
                          👤 Comprador: <strong>{rifa.buyerName}</strong>
                        </Typography>
                        {rifa.purchaseDate && (
                          <Typography variant="caption" sx={{ opacity: 0.8 }}>
                            📅 {new Date(rifa.purchaseDate).toLocaleDateString('pt-BR', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </Typography>
                        )}
                      </Box>
                    ) : rifa.isAvailable ? (
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                          ✅ Disponível
                        </Typography>
                        <Typography variant="caption" sx={{ opacity: 0.8 }}>
                          Clique para selecionar este número
                        </Typography>
                      </Box>
                    ) : (
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                          ❌ Número Vendido
                        </Typography>
                      </Box>
                    )
                  }
                  arrow
                  placement="top"
                  enterDelay={300}
                  leaveDelay={200}
                >
                  <span>
                    <Button
                      variant="contained"
                      onClick={() => handleNumberClick(rifa.number)}
                      disabled={!rifa.isAvailable}
                      sx={{
                        width: '100%',
                        height: { xs: '40px', sm: '50px', md: '60px' },
                        minWidth: 'unset',
                        backgroundColor: getNumberColor(rifa),
                        color: 'white',
                        fontWeight: 'bold',
                        fontSize: { xs: '0.75rem', sm: '0.875rem', md: '1rem' },
                        '&:hover': {
                          backgroundColor: rifa.isAvailable ? getNumberColor(rifa) : undefined,
                          transform: rifa.isAvailable ? 'scale(1.05)' : 'none',
                          opacity: rifa.isAvailable ? 0.9 : 0.5
                        },
                        '&:disabled': {
                          backgroundColor: '#ef4444',
                          color: 'white',
                          opacity: 0.7
                        },
                        transition: 'all 0.2s ease',
                        border: selectedNumbers.includes(rifa.number) ? '2px solid #fbbf24' : 'none'
                      }}
                    >
                      {rifa.number.toString().padStart(3, '0')}
                    </Button>
                  </span>
                </CustomTooltip>
              </Grid>
            ))}
          </Grid>
        </NoSSRPaper>

        {/* Legenda */}
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 4, flexWrap: 'wrap' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: 20, height: 20, backgroundColor: '#10b981', borderRadius: 1 }} />
            <Typography sx={{ color: 'white', fontSize: '0.875rem' }}>Disponível</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: 20, height: 20, backgroundColor: '#3b82f6', borderRadius: 1 }} />
            <Typography sx={{ color: 'white', fontSize: '0.875rem' }}>Selecionado</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: 20, height: 20, backgroundColor: '#ef4444', borderRadius: 1 }} />
            <Typography sx={{ color: 'white', fontSize: '0.875rem' }}>Vendido</Typography>
          </Box>
        </Box>

        {/* Botões de Ação */}
        {cart.length > 0 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 4 }}>
            <Button
              variant="outlined"
              onClick={clearCart}
              sx={{
                color: 'white',
                borderColor: 'rgba(255, 255, 255, 0.3)',
                '&:hover': {
                  borderColor: 'white',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)'
                }
              }}
            >
              Limpar Seleção
            </Button>
            <Button
              variant="contained"
              onClick={handlePurchase}
              startIcon={<ShoppingCart />}
              sx={{
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #059669 0%, #047857 100%)'
                }
              }}
            >
              Comprar ({cart.length} números)
            </Button>
          </Box>
        )}
      </Container>

      {/* FAB do Carrinho */}
      {cart.length > 0 && (
        <Fab
          color="primary"
          sx={{
            position: 'fixed',
            bottom: 16,
            right: 16,
            background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)'
          }}
          onClick={handlePurchase}
        >
          <Badge badgeContent={cart.length} color="error">
            <ShoppingCart />
          </Badge>
        </Fab>
      )}

      {/* Dialog de Compra */}
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            backgroundColor: 'rgba(15, 23, 42, 0.95)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }
        }}
      >
        <DialogTitle sx={{ color: 'white', textAlign: 'center' }}>
          <LocalOffer sx={{ mr: 1, verticalAlign: 'middle' }} />
          Finalizar Compra
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 3 }}>
            <Typography sx={{ color: 'white', mb: 2 }}>
              Números selecionados:
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
              {cart.map(item => (
                <Chip
                  key={item.number}
                  label={item.number.toString().padStart(2, '0')}
                  sx={{
                    backgroundColor: '#3b82f6',
                    color: 'white'
                  }}
                />
              ))}
            </Box>
          </Box>
          
          <TextField
            fullWidth
            label="Seu Nome"
            value={buyerName}
            onChange={(e) => setBuyerName(e.target.value)}
            margin="normal"
            sx={{
              '& .MuiOutlinedInput-root': {
                backgroundColor: 'rgba(30, 41, 59, 0.9)',
                color: 'white'
              },
              '& .MuiInputLabel-root': {
                color: 'rgba(255, 255, 255, 0.7)'
              }
            }}
          />
          <TextField
            fullWidth
            label="WhatsApp"
            value={buyerPhone}
            onChange={(e) => setBuyerPhone(e.target.value)}
            margin="normal"
            placeholder="(41) 99999-9999"
            sx={{
              '& .MuiOutlinedInput-root': {
                backgroundColor: 'rgba(30, 41, 59, 0.9)',
                color: 'white'
              },
              '& .MuiInputLabel-root': {
                color: 'rgba(255, 255, 255, 0.7)'
              }
            }}
          />
          
          <Alert severity="info" sx={{ mt: 2 }}>
            Após confirmar, você será redirecionado para o WhatsApp para finalizar o pagamento.
          </Alert>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button
            onClick={() => setOpenDialog(false)}
            sx={{ color: 'rgba(255, 255, 255, 0.7)' }}
          >
            Cancelar
          </Button>
          <Button
            onClick={confirmPurchase}
            variant="contained"
            startIcon={<WhatsApp />}
            sx={{
              background: 'linear-gradient(135deg, #25d366 0%, #128c7e 100%)'
            }}
          >
            Confirmar e Ir para WhatsApp
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

// Criar um Tooltip customizado
const CustomTooltip = styled(({ className, ...props }) => (
  <Tooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
  [`& .MuiTooltip-tooltip`]: {
    backgroundColor: 'rgba(15, 23, 42, 0.95)',
    color: 'white',
    fontSize: '0.875rem',
    fontWeight: 500,
    padding: '12px 16px',
    borderRadius: '12px',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    backdropFilter: 'blur(20px)',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
    maxWidth: '280px',
    textAlign: 'center',
    lineHeight: 1.4,
  },
  [`& .MuiTooltip-arrow`]: {
    color: 'rgba(15, 23, 42, 0.95)',
    '&::before': {
      border: '1px solid rgba(255, 255, 255, 0.2)',
    },
  },
}));