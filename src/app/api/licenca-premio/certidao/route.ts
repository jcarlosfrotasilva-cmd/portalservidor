import { NextResponse } from 'next/server';
import { db } from '@/db';
import { licencaPremioCertidao, servidores } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const servidorId = searchParams.get('servidorId');

    if (servidorId) {
      const data = await db
        .select()
        .from(licencaPremioCertidao)
        .where(eq(licencaPremioCertidao.servidorId, parseInt(servidorId)))
        .orderBy(licencaPremioCertidao.anoCertidao);
      return NextResponse.json(data);
    }

    const data = await db
      .select()
      .from(licencaPremioCertidao)
      .orderBy(licencaPremioCertidao.servidorId, licencaPremioCertidao.anoCertidao);
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Verificar elegibilidade
    const servidorData = await db
      .select()
      .from(servidores)
      .where(eq(servidores.id, parseInt(body.servidorId)));

    if (servidorData.length === 0) {
      return NextResponse.json({ error: 'Servidor não encontrado' }, { status: 404 });
    }

    const categoria = (servidorData[0].categoria || '').toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    if (!categoria.includes('A-EFETIVO') && !categoria.includes('ACT-F') && !categoria.includes('AEFETIVO')) {
      return NextResponse.json({ error: 'Servidor não elegível. Apenas A-EFETIVO ou ACT-F.' }, { status: 403 });
    }

    const data = await db
      .insert(licencaPremioCertidao)
      .values({
        servidorId: parseInt(body.servidorId),
        numeroCertidao: body.numeroCertidao,
        anoCertidao: parseInt(body.anoCertidao),
        periodoInicial: body.periodoInicial,
        periodoFinal: body.periodoFinal,
        dataDoe: body.dataDoe || null,
        saldoTotal: 90,
        saldoUsado: 0,
        status: 'ATIVA',
      })
      .returning();

    return NextResponse.json(data[0], { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
