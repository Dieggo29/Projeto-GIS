import { NextRequest, NextResponse } from 'next/server';

// Simulação de banco de dados em memória (em produção, use um banco real)
let rifaNumbers: any[] = [];

// Inicializar números se estiver vazio
if (rifaNumbers.length === 0) {
  for (let i = 0; i <= 100; i++) {
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
    const rifas: Rifa[] = [
      {
        id: 1,
        titulo: 'Rifa do Peixe Dourado',
        descricao: 'Concorra a um kit completo de pesca profissional',
        preco: 10.00,
        totalNumeros: 100,
        numerosVendidos: 45,
        dataLimite: '2024-02-15',
        premio: 'Kit de Pesca Profissional + R$ 500',
        imagem: '/images/rifa-peixe.jpg',
        status: 'ativa'
      },
      {
        id: 2,
        titulo: 'Rifa da Vara Premium',
        descricao: 'Vara de pescar carbono premium + carretilha',
        preco: 15.00,
        totalNumeros: 80,
        numerosVendidos: 23,
        dataLimite: '2024-02-20',
        premio: 'Vara Premium + Carretilha Shimano',
        imagem: '/images/rifa-vara.jpg',
        status: 'ativa'
      }
    ];
    
    return Response.json(rifas);
  } catch {
    return Response.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
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