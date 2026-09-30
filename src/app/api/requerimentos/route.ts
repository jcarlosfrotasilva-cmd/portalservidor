import { db } from '@/db';
import { requerimentos, requerimentoTramitacoes } from '@/db/schema';
import { eq, desc, and, like } from 'drizzle-orm';
import { NextResponse } from 'next/server';

/**
 * Gera número de protocolo único para requerimentos
 * Formato: REQ-AAAA-XXXXX (ex: REQ-2026-00123)
 */
async function gerarProtocolo(): Promise<string> {
  const ano = new Date().getFullYear();
  const prefixo = `REQ-${ano}`;

  // Buscar último requerimento do ano para pegar o próximo número
  const ultimos = await db
    .select({ protocolo: requerimentos.protocolo })
    .from(requerimentos)
    .where(like(requerimentos.protocolo, `${prefixo}-%`))
    .orderBy(desc(requerimentos.dataProtocolo))
    .limit(1);

  let proximoNumero = 1;
  if (ultimos.length > 0) {
    const ultimoProtocolo = ultimos[0].protocolo;
    const match = ultimoProtocolo.match(/REQ-\d{4}-(\d+)/);
    if (match) {
      proximoNumero = parseInt(match[1]) + 1;
    }
  }

  return `${prefixo}-${String(proximoNumero).padStart(5, '0')}`;
}

// POST - Servidor abre requerimento
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { servidorId, tipo, objeto, fundamentacao, observacoes } = body;

    if (!servidorId || !tipo || !objeto) {
      return NextResponse.json(
        { error: 'Campos obrigatórios: servidorId, tipo, objeto' },
        { status: 400 }
      );
    }

    // Gerar protocolo único
    const protocolo = await gerarProtocolo();

    // Calcular prazo de resposta (30 dias corridos - padrão administrativo)
    const prazoResposta = new Date();
    prazoResposta.setDate(prazoResposta.getDate() + 30);

    // Criar requerimento
    const novoRequerimento = await db.insert(requerimentos).values({
      protocolo,
      servidorId: parseInt(servidorId),
      tipo,
      objeto,
      fundamentacao: fundamentacao || null,
      observacoes: observacoes || null,
      prazoResposta: prazoResposta.toISOString().split('T')[0],
      status: 'RECEBIDO',
    }).returning();

    // Registrar tramitação inicial
    await db.insert(requerimentoTramitacoes).values({
      requerimentoId: novoRequerimento[0].id,
      statusAnterior: null,
      statusNovo: 'RECEBIDO',
      observacao: `Requerimento protocolado sob o nº ${protocolo}`,
      responsavel: 'Sistema',
      tipoResponsavel: 'SISTEMA',
    });

    return NextResponse.json(novoRequerimento[0], { status: 201 });
  } catch (error: any) {
    console.error('Erro ao criar requerimento:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// GET - Listar requerimentos
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const servidorId = searchParams.get('servidorId');
    const status = searchParams.get('status');

    const conditions = [];
    if (servidorId) {
      conditions.push(eq(requerimentos.servidorId, parseInt(servidorId)));
    }
    if (status) {
      conditions.push(eq(requerimentos.status, status));
    }

    const requerimentosLista = conditions.length > 0
      ? await db.select().from(requerimentos)
          .where(and(...conditions))
          .orderBy(desc(requerimentos.dataProtocolo))
      : await db.select().from(requerimentos)
          .orderBy(desc(requerimentos.dataProtocolo));

    return NextResponse.json(requerimentosLista);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
