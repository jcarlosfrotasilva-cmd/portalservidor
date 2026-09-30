import { db } from '@/db';
import { historicoFuncional, servidores } from '@/db/schema';
import { eq, and, desc, asc, or, like, gte, lte, SQL } from 'drizzle-orm';
import { NextResponse } from 'next/server';

// POST - Criar registro de histórico
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      servidorId,
      categoria,
      tipo,
      descricao,
      data,
      dataFim,
      numeroDocumento,
      dataDocumento,
      observacoes,
      registradoPor,
    } = body;

    if (!servidorId || !categoria || !tipo || !descricao || !data) {
      return NextResponse.json(
        { error: 'Campos obrigatórios: servidorId, categoria, tipo, descricao, data' },
        { status: 400 }
      );
    }

    const novoRegistro = await db
      .insert(historicoFuncional)
      .values({
        servidorId: parseInt(servidorId),
        categoria,
        tipo,
        descricao,
        data,
        dataFim: dataFim || null,
        numeroDocumento: numeroDocumento || null,
        dataDocumento: dataDocumento || null,
        observacoes: observacoes || null,
        registradoPor: registradoPor || null,
      })
      .returning();

    return NextResponse.json(novoRegistro[0], { status: 201 });
  } catch (error: any) {
    console.error('Erro ao criar registro de histórico:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// GET - Listar histórico com filtros
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const servidorId = searchParams.get('servidorId');
    const categoria = searchParams.get('categoria');
    const busca = searchParams.get('busca');
    const dataInicio = searchParams.get('dataInicio');
    const dataFim = searchParams.get('dataFim');
    const ordenacao = searchParams.get('ordenacao') || 'desc'; // asc ou desc

    const conditions = [];

    if (servidorId) {
      conditions.push(eq(historicoFuncional.servidorId, parseInt(servidorId)));
    }

    if (categoria && categoria !== 'TODAS') {
      conditions.push(eq(historicoFuncional.categoria, categoria));
    }

    if (busca) {
      conditions.push(
        or(
          like(historicoFuncional.tipo, `%${busca}%`),
          like(historicoFuncional.descricao, `%${busca}%`),
          like(historicoFuncional.numeroDocumento, `%${busca}%`)
        )
      );
    }

    if (dataInicio) {
      conditions.push(gte(historicoFuncional.data, dataInicio));
    }

    if (dataFim) {
      conditions.push(lte(historicoFuncional.data, dataFim));
    }

    // Buscar todos os registros com filtros aplicados
    let registros;

    if (conditions.length > 0) {
      registros = await db
        .select()
        .from(historicoFuncional)
        .where(and(...conditions))
        .orderBy(ordenacao === 'asc' ? asc(historicoFuncional.data) : desc(historicoFuncional.data));
    } else {
      registros = await db
        .select()
        .from(historicoFuncional)
        .orderBy(ordenacao === 'asc' ? asc(historicoFuncional.data) : desc(historicoFuncional.data));
    }

    // Enriquecer com dados do servidor
    const servidorIds = [...new Set(registros.map(r => r.servidorId))];
    const servidoresLista = servidorIds.length > 0
      ? await db.select().from(servidores).where(or(...servidorIds.map(id => eq(servidores.id, id))))
      : [];

    const servidoresMap = new Map(servidoresLista.map(s => [s.id, s]));

    const registrosEnriquecidos = registros.map(r => ({
      ...r,
      servidor: servidoresMap.get(r.servidorId),
    }));

    // Estatísticas
    const estatisticas = {
      total: registros.length,
      porCategoria: {} as Record<string, number>,
    };

    registros.forEach(r => {
      estatisticas.porCategoria[r.categoria] = (estatisticas.porCategoria[r.categoria] || 0) + 1;
    });

    return NextResponse.json({
      registros: registrosEnriquecidos,
      estatisticas,
    });
  } catch (error: any) {
    console.error('Erro ao buscar histórico:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
