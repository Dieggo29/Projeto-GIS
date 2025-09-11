'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Container,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip
} from '@mui/material';

interface RifaNumber {
  number: number;
  isAvailable: boolean;
  buyerName?: string;
}

export default function RifasPage() {
  const [rifaNumbers, setRifaNumbers] = useState<RifaNumber[]>([]);
  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [buyerName, setBuyerName] = useState('');
  const [buyerPhone, setBuyerPhone] = useState('');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    const initializeNumbers = () => {
      try {
        setLoading(true);
        // Inicializar números de 1 a 100
        const numbers: RifaNumber[] = [];
        for (let i = 1; i <= 100; i++) {
          numbers.push({
            number: i,
            isAvailable: true
          });
        }
        setRifaNumbers(numbers);
        setError(null);
      } catch (err) {
        setError('Erro ao carregar números da rifa');
        console.error('Erro:', err);
      } finally {
        setLoading(false);
      }
    };

    initializeNumbers();
  }, []);

  const handleNumberClick = (number: number) => {
    const rifaNumber = rifaNumbers.find(r => r.number === number);
    if (!rifaNumber?.isAvailable) return;
    
    setSelectedNumbers(prev => {
      if (prev.includes(number)) {
        return prev.filter(n => n !== number);
      } else {
        return [...prev, number];
      }
    });
  };

  const handlePurchase = () => {
    if (selectedNumbers.length === 0 || !buyerName || !buyerPhone) {
      setError('Preencha todos os campos e selecione pelo menos um número');
      return;
    }

    // Simular compra
    const updatedNumbers = rifaNumbers.map(num => {
      if (selectedNumbers.includes(num.number)) {
        return {
          ...num,
          isAvailable: false,
          buyerName: buyerName
        };
      }
      return num;
    });

    setRifaNumbers(updatedNumbers);
    setSuccessMessage(`Números ${selectedNumbers.join(', ')} reservados com sucesso para ${buyerName}!`);
    setSelectedNumbers([]);
    setBuyerName('');
    setBuyerPhone('');
    setOpenDialog(false);
    setError(null);
  };

  const availableCount = rifaNumbers.filter(n => n.isAvailable).length;
  const soldCount = rifaNumbers.filter(n => !n.isAvailable).length;

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Carregando números da rifa...
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom align="center">
        Rifas Boqueirão da Pesca
      </Typography>
      
      {successMessage && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccessMessage(null)}>
          {successMessage}
        </Alert>
      )}
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      
      <Card sx={{ mb: 4 }}>
        <CardContent>
          {/* Estatísticas */}
          <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
            <Chip 
              label={`Total: 100`} 
              color="default" 
              variant="outlined"
            />
            <Chip 
              label={`Vendidos: ${soldCount}`} 
              color="error" 
              variant="outlined"
            />
            <Chip 
              label={`Disponíveis: ${availableCount}`} 
              color="success" 
              variant="outlined"
            />
          </Box>
          
          <Typography variant="h6" sx={{ mb: 2, textAlign: 'center' }}>
            Escolha seus números (1 a 100):
          </Typography>
          
          {/* Grid de números */}
          <Grid container spacing={1} sx={{ mb: 3, justifyContent: 'center' }}>
            {rifaNumbers.map((rifaNumber) => {
              const isSelected = selectedNumbers.includes(rifaNumber.number);
              
              return (
                <Grid item key={rifaNumber.number}>
                  <Button
                    variant={isSelected ? 'contained' : 'outlined'}
                    size="small"
                    disabled={!rifaNumber.isAvailable}
                    onClick={() => handleNumberClick(rifaNumber.number)}
                    sx={{
                      minWidth: '50px',
                      height: '50px',
                      fontSize: '14px',
                      backgroundColor: isSelected 
                        ? '#2196f3' 
                        : (rifaNumber.isAvailable ? 'transparent' : '#f44336'),
                      color: isSelected 
                        ? 'white' 
                        : (rifaNumber.isAvailable ? 'inherit' : 'white'),
                      '&:hover': {
                        backgroundColor: rifaNumber.isAvailable 
                          ? (isSelected ? '#1976d2' : '#e3f2fd') 
                          : '#f44336'
                      },
                      '&:disabled': {
                        backgroundColor: '#f44336',
                        color: 'white'
                      }
                    }}
                  >
                    {rifaNumber.number}
                  </Button>
                </Grid>
              );
            })}
          </Grid>
          
          {/* Números selecionados */}
          {selectedNumbers.length > 0 && (
            <Box sx={{ mb: 2, textAlign: 'center' }}>
              <Typography variant="body1">
                Números selecionados: {selectedNumbers.sort((a, b) => a - b).join(', ')}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total: {selectedNumbers.length} número(s)
              </Typography>
            </Box>
          )}
          
          {/* Botão de reserva */}
          <Box sx={{ textAlign: 'center' }}>
            <Button
              variant="contained"
              size="large"
              disabled={selectedNumbers.length === 0}
              onClick={() => setOpenDialog(true)}
              sx={{ minWidth: '200px' }}
            >
              Reservar Números Selecionados
            </Button>
          </Box>
        </CardContent>
      </Card>
      
      {/* Dialog de compra */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Reservar Números</DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Números selecionados: {selectedNumbers.sort((a, b) => a - b).join(', ')}
          </Typography>
          
          <TextField
            fullWidth
            label="Nome completo"
            value={buyerName}
            onChange={(e) => setBuyerName(e.target.value)}
            sx={{ mb: 2 }}
            required
          />
          
          <TextField
            fullWidth
            label="Telefone/WhatsApp"
            value={buyerPhone}
            onChange={(e) => setBuyerPhone(e.target.value)}
            placeholder="(00) 00000-0000"
            required
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancelar</Button>
          <Button onClick={handlePurchase} variant="contained">
            Confirmar Reserva
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}