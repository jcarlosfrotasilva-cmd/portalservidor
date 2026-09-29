import { NextResponse } from 'next/server';
import { db } from '@/db';
import { orientacaoEausencia } from '@/db/schema';
import { eq, and, desc } from 'drizzle-orm';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const servidorId = searchParams.get('servidorId');
    const tipo = searchParams.get('tipo');

    const conditions: any[] = [];
    if (servidorId) conditions.push(eq(orientacaoEausencia.servidorId, parseInt(servidorId)));
    if (tipo) conditions.push(eq(orientacaoEausencia.tipo, tipo));

    const query = db.select().from(orientacaoEausencia).orderBy(desc(orientacaoEausencia.data));
    const data = conditions.length > 0 ? await query.where(and(...conditions)) : await query;
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = await db.insert(orientacaoEausencia).values({
      servidorId: parseInt(body.servidorId),
      tipo: body.tipo,
      subtipo: body.subtipo || null,
      data: body.data,
      dataInicio: body.dataInicio || null,
      dataFim: body.dataFim || null,
      quantidadeDias: body.quantidadeDias ? parseInt(body.quantidadeDias) : null,
      quantidadeHoras: body.quantidadeHoras ? parseInt(body.quantidadeHoras) : null,
      assunto: body.assunto || null,
      local: body.local || null,
      horaInicio: body.horaInicio || null,
      horaTermino: body.horaTermino || null,
      dataDoeOuEmail: body.dataDoeOuEmail || null,
      observacao: body.observacao || null,
    }).returning();

    return NextResponse.json(data[0], { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
