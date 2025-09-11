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
  return NextResponse.json({ numbers: rifaNumbers });
}

export async function POST(request: NextRequest) {
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
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}