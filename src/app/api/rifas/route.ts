import { NextRequest, NextResponse } from 'next/server';

interface RifaNumber {
  number: number;
  isAvailable: boolean;
  buyerName: string | null;
  buyerPhone: string | null;
  purchaseDate: Date | null;
}

// Simulação de banco de dados em memória
let rifaNumbers: RifaNumber[] = [];

// Inicializar números de 1 a 100
if (rifaNumbers.length === 0) {
  for (let i = 1; i <= 100; i++) {
    rifaNumbers.push({
      number: i,
      isAvailable: true,
      buyerName: null,
      buyerPhone: null,
      purchaseDate: null
    });
  }
}

export async function GET() {
  try {
    const url = new URL(request.url);
    const action = url.searchParams.get('action');
    
    if (action === 'get-numbers') {
      return Response.json(rifaNumbers);
    }
    
    // Retorna apenas estatísticas básicas
    const numerosVendidos = rifaNumbers.filter(r => !r.isAvailable).length;
    const numerosDisponiveis = rifaNumbers.filter(r => r.isAvailable).length;
    
    return Response.json({
      totalNumeros: 100,
      numerosVendidos,
      numerosDisponiveis
    });
  } catch (error) {
    console.error('Erro ao buscar dados:', error);
    return Response.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const url = new URL(request.url);
    const action = url.searchParams.get('action');
    
    if (action === 'get-numbers') {
      return Response.json(rifaNumbers);
    }
    
    // Compra de números
    const { numbers, buyerName, buyerPhone } = await request.json();
    
    // Verificar se os números ainda estão disponíveis
    const unavailableNumbers = numbers.filter((num: number) => 
      !rifaNumbers.find(r => r.number === num)?.isAvailable
    );
    
    if (unavailableNumbers.length > 0) {
      return NextResponse.json(
        { error: `Números ${unavailableNumbers.join(', ')} não estão mais disponíveis` },
        { status: 400 }
      );
    }
    
    // Marcar números como vendidos
    rifaNumbers = rifaNumbers.map(rifa => {
      if (numbers.includes(rifa.number)) {
        return {
          ...rifa,
          isAvailable: false,
          buyerName,
          buyerPhone,
          purchaseDate: new Date()
        };
      }
      return rifa;
    });
    
    return NextResponse.json({ success: true, message: 'Números reservados com sucesso!' });
  } catch (error: unknown) {
    console.error('Erro ao processar rifas:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}